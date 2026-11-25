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
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 7.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.05);
    scene.add(ambient);

    const blueLight = new THREE.DirectionalLight(0x60a5fa, 2.8);
    blueLight.position.set(5, 7, 6);
    scene.add(blueLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.9);
    rimLight.position.set(-4, -2, 5);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    rootGroup.position.set(1.6, 0.15, 0);
    scene.add(rootGroup);

    // 1. Flowing Architectural Wave Ribbon (lebih jelas & memenuhi area kanan)
    const waveGeo = new THREE.PlaneGeometry(16, 7.5, 42, 18);
    const posAttr = waveGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.5) * 0.85 + Math.cos(y * 0.65) * 0.5;
      posAttr.setZ(i, z);
    }
    waveGeo.computeVertexNormals();

    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.38
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -0.72;
    waveMesh.rotation.z = -0.18;
    waveMesh.position.set(0.6, -0.55, -1.3);
    rootGroup.add(waveMesh);

    // 2. Floating Kanban & Document Panels di sisi kanan dengan edge highlight tajam
    const panelGeo = new THREE.BoxGeometry(1.65, 1.02, 0.08);
    const edgesGeo = new THREE.EdgesGeometry(panelGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.75 });

    const matBlue = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.22,
      metalness: 0.18
    });
    const matDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.22
    });
    const matWhite = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.18,
      metalness: 0.05
    });

    const panelSpecs = [
      { x: 1.2, y: 1.45, z: 0.2, rx: 0.2, ry: -0.35, rz: 0.08, mat: matBlue },
      { x: 3.1, y: 0.45, z: 0.65, rx: -0.14, ry: -0.45, rz: -0.06, mat: matWhite },
      { x: 0.6, y: -0.95, z: 0.35, rx: 0.12, ry: -0.25, rz: 0.12, mat: matDark },
      { x: 3.6, y: -1.35, z: -0.35, rx: 0.24, ry: -0.48, rz: -0.1, mat: matBlue },
      { x: -1.1, y: 1.35, z: -0.9, rx: 0.16, ry: 0.28, rz: -0.08, mat: matDark },
      { x: 2.1, y: -0.3, z: -0.6, rx: -0.08, ry: -0.3, rz: 0.05, mat: matWhite }
    ];

    const panels: { mesh: THREE.Mesh; baseY: number; speed: number; phase: number }[] = [];
    panelSpecs.forEach((spec, idx) => {
      const mesh = new THREE.Mesh(panelGeo, spec.mat);
      mesh.position.set(spec.x, spec.y, spec.z);
      mesh.rotation.set(spec.rx, spec.ry, spec.rz);
      mesh.add(new THREE.LineSegments(edgesGeo, edgeMat));
      rootGroup.add(mesh);
      panels.push({ mesh, baseY: spec.y, speed: 0.65 + idx * 0.12, phase: idx * 1.05 });
    });

    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.32;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1200;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

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
        waveMesh.rotation.z = -0.18 + Math.sin(elapsed * 0.25) * 0.05;
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
      edgesGeo.dispose();
      edgeMat.dispose();
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
