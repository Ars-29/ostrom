import { useLoader } from '@react-three/fiber';
import { RepeatWrapping, TextureLoader } from 'three';
import { Plane } from '@react-three/drei';

export const Floor = () => {
  const texture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/Ground_Dirt_009_BaseColor.jpg`);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 4);

  const displacementMap = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/floor_heightmap.png`); // Use height map
  const normalMap = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/Ground_Dirt_009_Normal.jpg`);
  normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
  normalMap.repeat.set(4, 4);

  return (
    <Plane 
      args={[75, 75, 256, 256]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow 
      position={[0, -2, 0]}
    >
      {/* Increased segments to 256x256 for higher resolution */}
      <meshStandardMaterial
        displacementMap={displacementMap}
        displacementScale={3} // Increased scale for more pronounced bumps
        normalMap={normalMap}
        map={texture}
      />
    </Plane>
  );
};
