import React, { useRef, useEffect, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { animate } from 'framer-motion';
import { useScrollProgress } from '../../../contexts/ScrollProgressContext';
import { degToRad } from 'three/src/math/MathUtils.js';

type SimpleSpriteProps = {
  textureUrl: string,
  position: [number, number, number],
  size?: [number, number],
  rotation?: [number, number, number],
  triggerY?: number,
}

export const SimpleSprite: React.FC<SimpleSpriteProps> = ({ textureUrl, position, size = [1, 1], rotation = [0, 0, 0], triggerY }) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  const scroll = useScrollProgress();
  const [hasTriggered, setHasTriggered] = useState(false);

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
      if (meshRef.current) {
          animate(meshRef.current.rotation, 
              { x: degToRad(0) },
              { duration: 2, ease: "backOut" }
          );
          animate(meshRef.current.material, 
              { opacity: 1 },
              { duration: 0.4, ease: "linear" }
          );
      }
    }
  }, [scroll, triggerY, hasTriggered, animate]);

  return (
    <group rotation={rotation} position={position} >
        <mesh ref={meshRef} position={[0, 0, 0]} receiveShadow castShadow rotation={[triggerY ? degToRad(-89) : 0, 0, 0]}>
            <planeGeometry args={size} />
            <meshStandardMaterial alphaTest={0.5} map={texture} transparent opacity={triggerY ? 0 : 1} side={THREE.DoubleSide} />
        </mesh>
    </group>
  );
};
