import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Landing3DCanvasProps {
  isDark?: boolean;
}

export const Landing3DCanvas: React.FC<Landing3DCanvasProps> = ({ isDark = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 0.9);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x1d4ed8, 1.2);
    rimLight.position.set(-4, -2, 3);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    // Core crystalline blue-glass icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.15, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.35,
      transparent: true,
      opacity: 0.92
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Crisp white/dark wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(1.38, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x93c5fd : 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // Orbiting Kanban-tile blocks
    const tileMatBlue = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
    const tileMatNeutral = new THREE.MeshStandardMaterial({
      color: isDark ? 0xf8fafc : 0x0f172a,
      roughness: 0.35
    });
    const tileGeo = new THREE.BoxGeometry(0.48, 0.3, 0.08);
    const tiles: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(tileGeo, i % 2 === 0 ? tileMatBlue : tileMatNeutral);
      const angle = (i / 4) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 2.05, Math.sin(angle) * 0.85, Math.sin(angle) * 0.75);
      mesh.rotation.set(0.2, angle, 0.15);
      group.add(mesh);
      tiles.push(mesh);
    }

    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.7;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.5;
    };
    container.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!prefersReduced) {
        coreMesh.rotation.y += 0.006;
        coreMesh.rotation.x += 0.003;
        wireMesh.rotation.y -= 0.004;
        group.rotation.y += (targetX - group.rotation.y) * 0.05;
        group.rotation.x += (targetY - group.rotation.x) * 0.05;
        tiles.forEach((t, idx) => {
          t.rotation.z += 0.005 * (idx % 2 === 0 ? 1 : -1);
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      tileGeo.dispose();
      tileMatBlue.dispose();
      tileMatNeutral.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div
      ref={mountRef}
      aria-label="Visualisasi 3D Yuumotion"
      className="h-[280px] sm:h-[320px] w-full cursor-grab active:cursor-grabbing"
    />
  );
};

export default Landing3DCanvas;
