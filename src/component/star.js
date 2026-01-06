import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

function MouseStars() {
  const pointsRef = useRef();
  const { mouse, viewport } = useThree();

  const count = 2500;
  const positions = useRef(null);
  const originals = useRef(null);

  // Initialize stars ONCE (ESLint safe)
  useEffect(() => {
    const pos = new Float32Array(count * 3);
    const org = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      const x = (Math.random() - 0.5) * 70;
      const y = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 40;

      pos[i] = x;
      pos[i + 1] = y;
      pos[i + 2] = z;

      org[i] = x;
      org[i + 1] = y;
      org[i + 2] = z;
    }

    positions.current = pos;
    originals.current = org;
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !positions.current) return;

    // Convert mouse to world space
    const mx = mouse.x * viewport.width * 0.6;
    const my = mouse.y * viewport.height * 0.6;

    for (let i = 0; i < count * 3; i += 3) {
      const ox = originals.current[i];
      const oy = originals.current[i + 1];

      const dx = mx - positions.current[i];
      const dy = my - positions.current[i + 1];
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

      // ⭐ STRONG ATTRACTION
      const attraction = Math.min(0.35 / dist, 0.08);

      positions.current[i] += dx * attraction;
      positions.current[i + 1] += dy * attraction;

      // Smooth return to origin
      positions.current[i] += (ox - positions.current[i]) * 0.02;
      positions.current[i + 1] += (oy - positions.current[i + 1]) * 0.02;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!positions.current) return null;

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
        transparent
        opacity={0.9}
      />
    </points>
  );
}
