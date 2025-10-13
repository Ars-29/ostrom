import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

const BACKGROUND_TEXTURE_PATH = import.meta.env.BASE_URL + 'images/plane/background-r.jpg';

const PlaneBackground: React.FC = () => {
  const texture = useLoader(THREE.TextureLoader, BACKGROUND_TEXTURE_PATH);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 3);

  return (
    <mesh scale={[75, 60, 1]} position={[0, 30, -25]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export default PlaneBackground; 
