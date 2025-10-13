import { useLoader } from '@react-three/fiber';
import { RepeatWrapping, TextureLoader } from 'three';
import { Plane } from '@react-three/drei';

export const FloorSimple = () => {
  const texture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/road/floor-firstplan-r.jpg`);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 4);

  const textureRoad = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/road/road-r.webp`);
  textureRoad.wrapS = textureRoad.wrapT = RepeatWrapping;
  textureRoad.repeat.set(1, 2);

  const displacementMap = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/floor_heightmap.png`); // Use height map

  return (
    <group>
      <Plane 
        args={[75, 75, 256, 256]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow 
        position={[0, -1, 0]}
      >
        {/* Increased segments to 256x256 for higher resolution */}
        <meshStandardMaterial
          map={texture}
          displacementMap={displacementMap}
          displacementScale={2} // Increased scale for more pronounced bumps
        />
      </Plane>
      <Plane 
        args={[75, 75, 256, 256]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow 
        position={[0, -0.95, 0]}
      >
        <meshStandardMaterial
          map={textureRoad}
          displacementMap={displacementMap}
          displacementScale={2}
          transparent={true}
        />
      </Plane>
    </group>
  );
};
