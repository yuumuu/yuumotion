import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Landing3DCanvasProps {
  isDark?: boolean;
}

export const Landing3DCanvas: React.FC<Landing3DCanvasProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    rootGroup.position.set(1.2, -0.1, 0);
    scene.add(rootGroup);

    // Gelombang garis wireframe utama (biru elektrik)
    const waveGeo1 = new THREE.PlaneGeometry(18, 9, 52, 24);
    const pos1 = waveGeo1.attributes.position;
    for (let i = 0; i < pos1.count; i++) {
      const x = pos1.getX(i);
      const y = pos1.getY(i);
      pos1.setZ(i, Math.sin(x * 0.45) * 0.95 + Math.cos(y * 0.6) * 0.55);
    }

    const waveMat1 = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.42
    });
    const waveMesh1 = new THREE.Mesh(waveGeo1, waveMat1);
    waveMesh1.rotation.x = -0.78;
    waveMesh1.rotation.z = -0.15;
    rootGroup.add(waveMesh1);

    // Gelombang garis sekunder (aksen putih tipis untuk kedalaman)
    const waveGeo2 = new THREE.PlaneGeometry(18, 9, 36, 16);
    const pos2 = waveGeo2.attributes.position;
    for (let i = 0; i < pos2.count; i++) {
      const x = pos2.getX(i);
      const y = pos2.getY(i);
      pos2.setZ(i, Math.cos(x * 0.35) * 0.75 + Math.sin(y * 0.5) * 0.45);
    }

    const waveMat2 = new THREE.MeshBasicMaterial({
      color: 0xbfdbfe,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const waveMesh2 = new THREE.Mesh(waveGeo2, waveMat2);
    waveMesh2.rotation.x = -0.68;
    waveMesh2.rotation.z = 0.12;
    waveMesh2.position.set(0.4, 0.35, -1.0);
    rootGroup.add(waveMesh2);

    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.28;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.18;
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
        elapsed += 0.012;
        waveMesh1.rotation.z = -0.15 + Math.sin(elapsed * 0.35) * 0.06;
        waveMesh2.rotation.z = 0.12 - Math.cos(elapsed * 0.3) * 0.05;
        rootGroup.rotation.y += (targetX - rootGroup.rotation.y) * 0.04;
        rootGroup.rotation.x += (targetY - rootGroup.rotation.x) * 0.04;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      waveGeo1.dispose();
      waveMat1.dispose();
      waveGeo2.dispose();
      waveMat2.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="w-full h-full" />;
};

export default Landing3DCanvas;
