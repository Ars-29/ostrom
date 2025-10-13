import { useFrame, useLoader } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export const GroundFog = () => {
  const fogMaterialRef = useRef<THREE.MeshStandardMaterial>(null); // Reference for the fog material
  const texture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}images/smoke.png`); // Load fog texture

  // Ensure the texture wraps for seamless looping
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  useFrame(({ clock }) => {
    if (fogMaterialRef.current) {
      fogMaterialRef.current.opacity = 0.4 + Math.sin(clock.getElapsedTime() * 0.5) * 0.2; // Animate opacity
      if (fogMaterialRef.current.map) {
        fogMaterialRef.current.map.offset.x = (fogMaterialRef.current.map.offset.x + 0.0002) % 1; // Slower loop offset
        fogMaterialRef.current.map.offset.y = (fogMaterialRef.current.map.offset.y + 0.0002) % 1;
      }
    }
  });

  return (
    <Plane
      args={[75, 75, 256, 256]}
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to lie flat
      position={[0, 0.15, 0]} // Slightly below the ground
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        ref={fogMaterialRef} // Attach the material reference
        map={texture} // Apply the texture
        transparent
        opacity={1} // Initial opacity
        color="#000" // Fog color
      />
    </Plane>
  );
};
