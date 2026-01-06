import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";


function MouseStars() {
  const pointsRef = useRef();
  const { mouse, viewport } = useThree();

  const count = 3000;
  const positions = useRef(new Float32Array(count * 3));
  const original = useRef(new Float32Array(count * 3));

  // Initialize once
  if (original.current[0] === 0) {
    for (let i = 0; i < count * 3; i += 3) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 60;

      positions.current.set([x, y, z], i);
      original.current.set([x, y, z], i);
    }
  }

  useFrame(() => {
    if (!pointsRef.current) return;

    const mx = mouse.x * viewport.width * 0.5;
    const my = mouse.y * viewport.height * 0.5;

    for (let i = 0; i < count * 3; i += 3) {
      const ox = original.current[i];
      const oy = original.current[i + 1];

      const dx = mx - ox;
      const dy = my - oy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const strength = Math.max(0, 1 - dist / 18) * 0.25;

      positions.current[i] += dx * strength;
      positions.current[i + 1] += dy * strength;

      // Ease back
      positions.current[i] += (ox - positions.current[i]) * 0.06;
      positions.current[i + 1] += (oy - positions.current[i + 1]) * 0.06;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#9fd3ff"
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.9}
      />
    </points>
  );
}
function Effects() {
  const starsRef = useRef();
  const lightRef = useRef();
  const galaxyRef = useRef();
  const { viewport, mouse } = useThree();

  const [warp, setWarp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [particles, setParticles] = useState([]);
  const originalVertices = useRef();

  const spawnParticles = (x, y) => {
    setParticles((prev) => [
      ...prev,
      ...Array.from({ length: 40 }).map(() => ({
        position: [x, y, 0],
        velocity: [
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25,
        ],
        life: 1,
      })),
    ]);
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Cursor light
    lightRef.current.position.x = mouse.x * viewport.width * 0.5;
    lightRef.current.position.y = mouse.y * viewport.height * 0.5;

    // Background stars (slow cinematic)
    starsRef.current.rotation.y += 0.0008;
    starsRef.current.rotation.z += warp ? 0.25 : 0.002;

    // Galaxy
    galaxyRef.current.rotation.y = t * 0.25;

    if (dragging) {
      galaxyRef.current.rotation.x = -mouse.y * Math.PI * 0.4;
      galaxyRef.current.rotation.z = mouse.x * Math.PI * 0.4;
    }

    const scale = hovered ? 1.3 : 1;
    galaxyRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    galaxyRef.current.material.emissiveIntensity =
      2 + Math.sin(t * (hovered ? 6 : 2));

    // Particles
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          position: [
            p.position[0] + p.velocity[0],
            p.position[1] + p.velocity[1],
            p.position[2] + p.velocity[2],
          ],
          life: p.life - 0.03,
        }))
        .filter((p) => p.life > 0)
    );
  });

  return (
    <>
      <pointLight ref={lightRef} color="#88ccff" intensity={2} distance={25} />

      {/* Interactive stars */}
      <MouseStars />

      {/* Deep background stars */}
      <Stars
        ref={starsRef}
        radius={120}
        depth={80}
        count={6000}
        factor={4}
        fade
      />

      {/* Galaxy */}
      <mesh
        ref={galaxyRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onClick={(e) => {
          setWarp(true);
          spawnParticles(e.point.x, e.point.y);
          setTimeout(() => setWarp(false), 500);
        }}
      >
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#6aff7d"
          emissiveIntensity={2}
        />
      </mesh>

      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial emissive="#d21dff" />
        </mesh>
      ))}
    </>
  );
}
export default function Background() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5] }}
      style={{ position: "fixed", inset: 0, zIndex: -1 }}
    >
      <ambientLight intensity={0.3} />
      <Effects />
    </Canvas>
  );
}
