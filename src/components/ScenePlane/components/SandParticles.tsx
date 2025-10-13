import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';

const PARTICLE_COUNT = 500;
const AREA_WIDTH = 60;
const AREA_DEPTH = 30;
const AREA_HEIGHT = 15;
const GROUND_Y = 0.5; // just above the ground
const WIND_SPEED = 0.05;
// Use Vite's base URL so asset resolves correctly when the app is served from /dev/
const PARTICLE_TEXTURE_PATH = `${import.meta.env.BASE_URL}images/sand.png`; // fallback to smoke.png as a blurred line

interface SandParticlesProps {
  order?: number; // z position for layering
}

const SandParticles: React.FC<SandParticlesProps> = ({ order = 0 }) => {
  const meshRef = useRef<THREE.Points>(null);
  const texture = useLoader(THREE.TextureLoader, PARTICLE_TEXTURE_PATH);
  const velocities = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => 0.025 + Math.random() * 0.025)
  );
  const waveOffsets = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => Math.random() * Math.PI * 2)
  );
  const waveSpeeds = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => 0.5 + Math.random() * 1.2)
  );
  const waveAmplitudes = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => 0.12 + Math.random() * 0.18)
  );

  // Store per-particle curve parameters
  const curveFreqs = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => 0.15 + Math.random() * 0.25)
  );
  const curvePhases = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => Math.random() * Math.PI * 2)
  );
  const curveAmplitudes = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => 1.2 + Math.random() * 1.8)
  );

  // Initialize positions
  const positions = React.useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = Math.random() * AREA_WIDTH - AREA_WIDTH / 2;
      arr[i * 3 + 1] = GROUND_Y + Math.random() * AREA_HEIGHT;
      arr[i * 3 + 2] = Math.random() * AREA_DEPTH - AREA_DEPTH / 2;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Smooth horizontal curve using sine and cosine for X and Z
      pos[i * 3] += velocities.current[i] + WIND_SPEED * (0.1 + Math.random() * 0.1);
      pos[i * 3] += Math.sin(t * curveFreqs.current[i] + curvePhases.current[i]) * curveAmplitudes.current[i] * 0.01;
      // Smooth vertical curve (gentle up/down)
      pos[i * 3 + 1] =
        GROUND_Y +
        Math.sin(t * waveSpeeds.current[i] + waveOffsets.current[i]) * waveAmplitudes.current[i] +
        Math.cos(t * 0.5 + curvePhases.current[i]) * 0.08;
      // Smooth Z curve (sideways wind)
      pos[i * 3 + 2] += Math.cos(t * curveFreqs.current[i] + curvePhases.current[i]) * curveAmplitudes.current[i] * 0.008;
      // Reset if out of bounds
      if (pos[i * 3] > AREA_WIDTH / 2) {
        pos[i * 3] = -AREA_WIDTH / 2;
        pos[i * 3 + 1] = GROUND_Y + Math.random() * AREA_HEIGHT;
        pos[i * 3 + 2] = Math.random() * AREA_DEPTH - AREA_DEPTH / 2;
        waveOffsets.current[i] = Math.random() * Math.PI * 2;
        waveSpeeds.current[i] = 0.5 + Math.random() * 1.2;
        waveAmplitudes.current[i] = 0.12 + Math.random() * 0.18;
        curveFreqs.current[i] = 0.15 + Math.random() * 0.25;
        curvePhases.current[i] = Math.random() * Math.PI * 2;
        curveAmplitudes.current[i] = 1.2 + Math.random() * 1.8;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={[0, 0, 20]} renderOrder={order}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#e2c290"
        size={0.15}
        sizeAttenuation
        opacity={0.85}
        transparent
        depthWrite={false}
        map={texture}
        alphaTest={0.01}
      />
    </points>
  );
};

export default SandParticles;
