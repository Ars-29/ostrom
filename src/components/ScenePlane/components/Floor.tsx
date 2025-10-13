import { useLoader } from '@react-three/fiber';
import { RepeatWrapping, TextureLoader } from 'three';
import { Plane } from '@react-three/drei';

export const Floor = () => {
  const texture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/plane/floor-firstplan-r.jpg`);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(6, 6);

  const displacementMap = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/floor_heightmap.png`); // Use height map

  return (
    <Plane 
      args={[75, 75, 256, 256]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow 
      position={[0, -0.5, 0]}
    >
      {/* Increased segments to 256x256 for higher resolution */}
      <meshStandardMaterial
        map={texture}
        displacementMap={displacementMap}
        displacementScale={1}
      />
    </Plane>
  );
};
