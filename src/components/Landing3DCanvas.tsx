import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type Landing3DVariant = 'kanban-matrix' | 'mobius-wave' | 'exploded-layers';

interface Landing3DCanvasProps {
  isDark?: boolean;
  variant?: Landing3DVariant;
}

export const Landing3DCanvas: React.FC<Landing3DCanvasProps> = ({
  isDark = true,
  variant = 'kanban-matrix'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 8.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.85 : 1.0);
    scene.add(ambient);

    const blueLight = new THREE.DirectionalLight(0x60a5fa, 2.6);
    blueLight.position.set(6, 7, 6);
    scene.add(blueLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(-4, -2, 5);
    scene.add(rimLight);

    // Fokus komposisi di sisi kanan section agar tidak bertabrakan dengan teks kiri
    const rightAnchor = new THREE.Group();
    rightAnchor.position.set(2.6, 0, 0);
    scene.add(rightAnchor);

    const disposables: Array<{ dispose: () => void }> = [];
    const animTargets: Array<(t: number) => void> = [];

    const matBlue = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.22,
      metalness: 0.18
    });
    const matSkyBlue = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.2,
      metalness: 0.15
    });
    const matWhite = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.18,
      metalness: 0.05
    });
    const matDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.25
    });
    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65
    });
    disposables.push(matBlue, matSkyBlue, matWhite, matDark, edgeLineMat);

    if (variant === 'kanban-matrix') {
      const boxGeo = new THREE.BoxGeometry(1.55, 0.95, 0.12);
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      disposables.push(boxGeo, edgesGeo);

      const specs = [
        { x: -0.4, y: 1.55, z: 0.3, mat: matBlue },
        { x: 1.55, y: 1.25, z: -0.2, mat: matWhite },
        { x: 0.2, y: 0.25, z: 0.65, mat: matWhite },
        { x: 2.1, y: -0.1, z: 0.1, mat: matBlue },
        { x: -0.6, y: -1.1, z: 0.25, mat: matDark },
        { x: 1.4, y: -1.35, z: -0.3, mat: matSkyBlue }
      ];

      rightAnchor.rotation.set(0.22, -0.42, -0.06);
      specs.forEach((s, i) => {
        const card = new THREE.Mesh(boxGeo, s.mat);
        card.position.set(s.x, s.y, s.z);
        card.add(new THREE.LineSegments(edgesGeo, edgeLineMat));
        rightAnchor.add(card);
        const baseY = s.y;
        animTargets.push((t) => {
          card.position.y = baseY + Math.sin(t * 1.1 + i * 0.9) * 0.13;
        });
      });

      const ringGeo = new THREE.TorusGeometry(2.5, 0.035, 12, 72);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.55 });
      disposables.push(ringGeo, ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.set(1.1, 0.3, 0);
      rightAnchor.add(ring);
      animTargets.push((t) => {
        ring.rotation.z = t * 0.18;
      });
    } else if (variant === 'mobius-wave') {
      const knotGeo = new THREE.TorusKnotGeometry(1.75, 0.42, 120, 20, 2, 3);
      const knotWireMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      disposables.push(knotGeo, knotWireMat);

      const solidKnot = new THREE.Mesh(knotGeo, matBlue);
      const wireKnot = new THREE.Mesh(knotGeo, knotWireMat);
      wireKnot.scale.setScalar(1.04);
      rightAnchor.add(solidKnot, wireKnot);
      rightAnchor.position.set(2.9, 0, 0);

      animTargets.push((t) => {
        solidKnot.rotation.y = t * 0.25;
        solidKnot.rotation.x = Math.sin(t * 0.3) * 0.25;
        wireKnot.rotation.copy(solidKnot.rotation);
      });
    } else {
      // exploded-layers: 3 lapisan layar arsitektur (UI, Sync, Database)
      const layerGeo = new THREE.BoxGeometry(3.4, 2.1, 0.08);
      const layerEdges = new THREE.EdgesGeometry(layerGeo);
      disposables.push(layerGeo, layerEdges);

      const layerMats = [matWhite, matBlue, matDark];
      rightAnchor.rotation.set(0.45, -0.55, 0.15);
      rightAnchor.position.set(2.7, -0.1, 0);

      layerMats.forEach((m, i) => {
        const layer = new THREE.Mesh(layerGeo, m);
        const baseZ = (1 - i) * 1.15;
        layer.position.set(0, 0, baseZ);
        layer.add(new THREE.LineSegments(layerEdges, edgeLineMat));
        rightAnchor.add(layer);
        animTargets.push((t) => {
          layer.position.z = baseZ + Math.sin(t * 1.1 + i * 1.2) * 0.12;
        });
      });
    }

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
        elapsed += 0.015;
        animTargets.forEach((fn) => fn(elapsed));
        scene.rotation.y += (targetX - scene.rotation.y) * 0.04;
        scene.rotation.x += (targetY - scene.rotation.x) * 0.04;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark, variant]);

  return <div ref={mountRef} aria-hidden="true" className="w-full h-full" />;
};

export default Landing3DCanvas;
