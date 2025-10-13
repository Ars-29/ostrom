import { useLoader } from '@react-three/fiber';
import { ClampToEdgeWrapping, TextureLoader, LinearFilter } from 'three';
import { Plane } from '@react-three/drei';

export const Floor = () => {
  // Load the four split textures
  const textures = useLoader(TextureLoader, [
    `${import.meta.env.BASE_URL}images/road/road_1.jpg`,
    `${import.meta.env.BASE_URL}images/road/road_2.jpg`,
    `${import.meta.env.BASE_URL}images/road/road_3.jpg`,
    `${import.meta.env.BASE_URL}images/road/road_4.jpg`,
  ]);

  // Load four displacement maps, one for each tile
  const displacementMaps = useLoader(TextureLoader, [
    `${import.meta.env.BASE_URL}images/road/road_1_height.webp`,
    `${import.meta.env.BASE_URL}images/road/road_2_height.webp`,
    `${import.meta.env.BASE_URL}images/road/road_3_height.webp`,
    `${import.meta.env.BASE_URL}images/road/road_4_height.webp`,
  ]);

  // Set texture and displacement map properties to avoid seams
  textures.forEach((tex) => {
    tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
    tex.minFilter = tex.magFilter = LinearFilter;
    tex.repeat.set(1, 1);
  });
  displacementMaps.forEach((tex) => {
    tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
    tex.minFilter = tex.magFilter = LinearFilter;
    tex.repeat.set(1, 1);
  });

  // Each tile is 37.5 units (half of 75) to form a 2x2 grid
  const tileSize = 37.5;
  // Add small overlap to prevent seams
  const overlap = 0.025;
  const adjustedOffset = (tileSize / 2) - overlap;
  
  const positions: [number, number, number][] = [
    [-adjustedOffset, -1.005, -adjustedOffset], // road_1 (top-left)
    [ adjustedOffset, -1.004, -adjustedOffset], // road_2 (top-right)
    [-adjustedOffset, -0.99,  adjustedOffset], // road_3 (bottom-left)
    [ adjustedOffset, -1.002,  adjustedOffset], // road_4 (bottom-right)
  ];

  return (
    <group>
      {textures.map((texture, i) => (
        <Plane
          key={i}
          args={[tileSize + overlap, tileSize + overlap, 256, 256]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={positions[i]}
          receiveShadow
        >
          <meshStandardMaterial
            map={texture}
            displacementMap={displacementMaps[i]}
            displacementScale={3}
          />
        </Plane>
      ))}
    </group>
  );
};
