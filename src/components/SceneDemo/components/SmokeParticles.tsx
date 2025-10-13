import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export const SmokeParticles = ({ position }: { position: [number, number, number] }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  const texture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}images/smoke.png`)

  // Generate initial positions for particles
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2; // x
      positions[i * 3 + 1] = Math.random() * 2; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // z
    }
    return positions;
  }, [particleCount]);

  // Animate particles
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += 0.01; // Move slightly up
        positions[i * 3 + 1] += 0.01; // Move slightly up
        positions[i * 3 + 2] -= 0.02; // Move backward (in depth)
        if (positions[i * 3] > 2) positions[i * 3] = 0; // Reset depth if too far back
        if (positions[i * 3 + 2] < -2) positions[i * 3 + 2] = 0; // Reset depth if too far back
        if (positions[i * 3 + 1] > 2) positions[i * 3 + 1] = 0; // Reset height if too high
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="white"
        size={0.5}
        map={texture}
        transparent
        opacity={0.6}
        alphaTest={0.3}
        depthWrite={false}
      />
    </points>
  );
};