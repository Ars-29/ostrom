import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '../../hooks/useAdaptiveQuality';

export const SmokeParticles = ({ position, order, windDirection }: { position: [number, number, number]; order: number; windDirection: [number, number, number] }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const { qualitySettings } = useAdaptiveQuality();
  const particleCount = qualitySettings.particleCount; // Use adaptive particle count
  const texture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}images/smoke.png`);

  // Simple particle data
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const ages = new Float32Array(particleCount);
    const baseSizes = new Float32Array(particleCount);
    const rotations = new Float32Array(particleCount);
    const rotationSpeeds = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Start at origin with slight randomness
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      
      // Random starting age for natural look
      ages[i] = Math.random() * 4;
      
      // Random base size for each particle
      baseSizes[i] = 7 + Math.random() * 4; // Size between 3-7
      
      // Random rotation and rotation speed
      rotations[i] = Math.random() * Math.PI * 2; // Random starting rotation
      rotationSpeeds[i] = (Math.random() - 0.5) * 0.5; // Random rotation speed
    }
    
    return { positions, ages, baseSizes, rotations, rotationSpeeds };
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const opacities = particlesRef.current.geometry.attributes.opacity.array as Float32Array;
    const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
    const rotations = particlesRef.current.geometry.attributes.rotation.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Age the particle
      particleData.ages[i] += delta;
      const age = particleData.ages[i];
      const maxAge = 4; // 4 seconds lifetime
      
      if (age > maxAge) {
        // Reset particle
        positions[i * 3] = (Math.random() - 0.5) * 0.3;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        particleData.ages[i] = 0;
        // Reset rotation
        particleData.rotations[i] = Math.random() * Math.PI * 2;
      } else {
        // Move particle up slowly with wind
        positions[i * 3] += windDirection[0] * 0.02;
        positions[i * 3 + 1] += 0.02; // Drift up slowly
        positions[i * 3 + 2] += windDirection[2] * 0.02;
        
        // Update rotation
        particleData.rotations[i] += particleData.rotationSpeeds[i] * delta;
      }
      
      // Calculate fade in/out
      const progress = age / maxAge;
      if (progress < 0.2) {
        // Fade in
        opacities[i] = progress * 5 * 0.15; // Max opacity 0.15
      } else if (progress > 0.7) {
        // Fade out
        opacities[i] = (1 - progress) / 0.3 * 0.15;
      } else {
        // Stay visible
        opacities[i] = 0.3;
      }
      
      // Size grows slowly with random base size
      sizes[i] = particleData.baseSizes[i] + progress * 2;
      
      // Update rotation attribute
      rotations[i] = particleData.rotations[i];
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.opacity.needsUpdate = true;
    particlesRef.current.geometry.attributes.size.needsUpdate = true;
    particlesRef.current.geometry.attributes.rotation.needsUpdate = true;
  });

  // Simple material
  const material = useMemo(() =>
    new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: texture },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float rotation;
        varying float vOpacity;
        varying float vRotation;
        
        void main() {
          vOpacity = opacity;
          vRotation = rotation;
          gl_PointSize = size * 15.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying float vOpacity;
        varying float vRotation;
        
        void main() {
          // Rotate the texture coordinates
          vec2 rotatedCoord = gl_PointCoord - 0.5;
          float cosR = cos(vRotation);
          float sinR = sin(vRotation);
          rotatedCoord = vec2(
            rotatedCoord.x * cosR - rotatedCoord.y * sinR,
            rotatedCoord.x * sinR + rotatedCoord.y * cosR
          ) + 0.5;
          
          vec4 texColor = texture2D(pointTexture, rotatedCoord);
          gl_FragColor = vec4(0.8, 0.8, 0.8, vOpacity * texColor.a);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    }), [texture]);

  // Initialize arrays
  const initialOpacities = useMemo(() => new Float32Array(particleCount).fill(0), [particleCount]);
  const initialSizes = useMemo(() => new Float32Array(particleCount).fill(0.5), [particleCount]);
  const initialRotations = useMemo(() => particleData.rotations.slice(), [particleData.rotations]);

  return (
    <points ref={particlesRef} position={position} renderOrder={order}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
        <bufferAttribute attach="attributes-opacity" args={[initialOpacities, 1]} />
        <bufferAttribute attach="attributes-size" args={[initialSizes, 1]} />
        <bufferAttribute attach="attributes-rotation" args={[initialRotations, 1]} />
      </bufferGeometry>
      <primitive object={material} />
    </points>
  );
};