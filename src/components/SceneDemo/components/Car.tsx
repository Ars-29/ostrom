import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { animate, useAnimation } from 'framer-motion';
import { useScrollProgress } from '../../../contexts/ScrollProgressContext';
import { degToRad, radToDeg } from 'three/src/math/MathUtils.js';
import { DirtParticles } from './DirtParticles';
import { Sparkles } from '@react-three/drei';

type CarProps = {
  textureUrl: string,
  position: [number, number, number],
  size?: [number, number],
  rotation?: [number, number, number],
  triggerY?: number,
}

export const Car: React.FC<CarProps> = ({ textureUrl, position, size = [1, 1], rotation = [0, 0, 0], triggerY }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const groupRef2 = useRef<THREE.Group>(null);
  const dirtParticlesRef = useRef<THREE.ShaderMaterial>(null);

  const scroll = useScrollProgress();
  const [hasTriggered, setHasTriggered] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      geometry.center();
      geometry.translate(0, size[1] / 2, 0);
    }
  }, [size]);

  useEffect(() => {
    if (triggerY && scroll >= triggerY && !hasTriggered) {
      setHasTriggered(true);
      if (groupRef2.current && meshRef.current) {
          animate(groupRef2.current.position, 
              { x: 0, y: 0, z: 0 },
              { duration: 2, ease: "easeOut" }
          );
          animate(groupRef2.current.rotation, 
              { x: degToRad(0) },
              { duration: 2, ease: "backOut" }
          );
          animate(meshRef.current.material, 
              { opacity: 1 },
              { duration: 0.4, ease: "linear" }
          );
          if (dirtParticlesRef.current) {
            animate(
              dirtParticlesRef.current.uniforms.uOpacity,
              { value: 0 },
              { duration: 0.4, ease: "linear" }
            );
          }
      }
    }
  }, [scroll, triggerY, hasTriggered, animate]);

  useFrame(() => {
    if (groupRef2.current) {
      groupRef2.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef} rotation={rotation} position={position} >
      <group ref={groupRef2} position={[4.5, -0.3, -2]} rotation={[triggerY ? degToRad(-89) : 0, 0, 0]} >
        <mesh ref={meshRef}>
            <planeGeometry args={size} />
            <meshStandardMaterial alphaTest={0.5} map={texture} transparent opacity={triggerY ? 0 : 1} side={THREE.DoubleSide} />
        </mesh>
        <DirtParticles position={[0.5, 0.3, -0.5]} active={hasTriggered} />
        <Sparkles count={10} scale={1 * 2} size={4} speed={0.15} position={[-0.1, 0.1, -0.1]} />
      </group>
    </group>
  );
};
