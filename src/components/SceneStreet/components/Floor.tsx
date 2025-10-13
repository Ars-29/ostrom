import { useLoader } from '@react-three/fiber';
import { RepeatWrapping, TextureLoader } from 'three';
import { Plane } from '@react-three/drei';

export const Floor = () => {
  const texture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/street/floor-firstplan-r.jpg`);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(8, 8);

  const displacement = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/street/floor-firstplan-r_displacement.jpg`);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(24, 24);

  return (
    <Plane 
      args={[75, 75, 256, 256]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow 
      position={[0, 0, 0]}
    >
      {/* Increased segments to 256x256 for higher resolution */}
      {/* Use MeshStandardMaterial so the floor is affected by lights and will be dark if no lights are present */}
      <meshStandardMaterial
        map={texture}
        displacementMap={displacement}
        displacementScale={0.04}
      />
    </Plane>
  );
};
