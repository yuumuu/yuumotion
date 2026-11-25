import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Landing3DCanvasProps {
  isDark?: boolean;
}

export const Landing3DCanvas: React.FC<Landing3DCanvasProps> = ({ isDark = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.6 : 0.85);
    scene.add(ambient);

    const blueLight = new THREE.DirectionalLight(0x3b82f6, 2.2);
    blueLight.position.set(5, 6, 5);
    scene.add(blueLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
    rimLight.position.set(-6, -3, 4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Flowing Architectural Wave Ribbon (full-bleed horizontal span)
    const waveGeo = new THREE.PlaneGeometry(18, 6.5, 44, 16);
    const posAttr = waveGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.45) * 0.75 + Math.cos(y * 0.65) * 0.45;
      posAttr.setZ(i, z);
    }
    waveGeo.computeVertexNormals();

    const waveMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x2563eb : 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.18
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -0.68;
    waveMesh.position.set(0, -1.2, -1.8);
    rootGroup.add(waveMesh);

    // 2. Floating Kanban & Document Panels (Blue / Black / White palette)
    const panelGeo = new THREE.BoxGeometry(1.45, 0.92, 0.06);
    const matBlue = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.25,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88
    });
    const matDark = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    const matWhite = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.05,
      transparent: true,
      opacity: isDark ? 0.82 : 0.94
    });

    const panelSpecs = [
      { x: 3.4, y: 1.5, z: -0.4, rx: 0.2, ry: -0.35, rz: 0.08, mat: matBlue },
      { x: 4.9, y: 0.2, z: 0.3, rx: -0.15, ry: -0.45, rz: -0.06, mat: matWhite },
      { x: 2.3, y: -1.1, z: 0.1, rx: 0.12, ry: -0.25, rz: 0.12, mat: matDark },
      { x: 5.5, y: -1.6, z: -0.8, rx: 0.25, ry: -0.5, rz: -0.1, mat: matBlue },
      { x: -4.2, y: 1.6, z: -1.2, rx: 0.18, ry: 0.35, rz: -0.08, mat: matDark },
      { x: -5.4, y: -0.8, z: -0.6, rx: -0.1, ry: 0.4, rz: 0.06, mat: matBlue }
    ];

    const panels: { mesh: THREE.Mesh; baseY: number; speed: number; phase: number }[] = [];
    panelSpecs.forEach((spec, idx) => {
      const mesh = new THREE.Mesh(panelGeo, spec.mat);
      mesh.position.set(spec.x, spec.y, spec.z);
      mesh.rotation.set(spec.rx, spec.ry, spec.rz);
      rootGroup.add(mesh);
      panels.push({ mesh, baseY: spec.y, speed: 0.6 + idx * 0.12, phase: idx * 1.1 });
    });

    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.35;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.22;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1200;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Pause render loop automatically when section is off-screen
    let isInView = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    let rafId = 0;
    let elapsed = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isInView) return;

      if (!prefersReduced) {
        elapsed += 0.014;
        waveMesh.rotation.z = Math.sin(elapsed * 0.25) * 0.05;
        rootGroup.rotation.y += (targetX - rootGroup.rotation.y) * 0.04;
        rootGroup.rotation.x += (targetY - rootGroup.rotation.x) * 0.04;
        panels.forEach((p) => {
          p.mesh.position.y = p.baseY + Math.sin(elapsed * p.speed + p.phase) * 0.14;
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      waveGeo.dispose();
      waveMat.dispose();
      panelGeo.dispose();
      matBlue.dispose();
      matDark.dispose();
      matWhite.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return <div ref={mountRef} aria-hidden="true" className="w-full h-full" />;
};

export default Landing3DCanvas;
