import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const SkySphere: React.FC = () => {
  const skyTexture = useLoader(THREE.TextureLoader, 'images/background.webp'); // Load texture using useLoader

  return (
    <mesh>
      <sphereGeometry args={[2, 10, 10]} /> {/* Large radius for the sky */}
      <meshBasicMaterial map={skyTexture} side={THREE.FrontSide} /> {/* Render the inside of the sphere */}
    </mesh>
  );
};

export default SkySphere;
