import { Box } from '@react-three/drei';
import React from 'react';
import { useLoader } from '@react-three/fiber';
import { RepeatWrapping, TextureLoader, BufferGeometry } from 'three';

interface SidewalkProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number]; // width, depth, height
  motifSize?: number; // size of the texture motif
}

export const Sidewalk: React.FC<SidewalkProps> = ({
  position = [0, 0.15, -10],
  rotation = [0, 0, 0],
  size = [20, 3, 0.3]
}) => {
  // Load a texture for the top face
  const topTexture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/street/sidewalk.jpg`);
  topTexture.wrapS = topTexture.wrapT = RepeatWrapping;

  // Update the UVs of the top face so the texture always covers the surface once, regardless of box size
  const updateTopFaceUV = (geometry: BufferGeometry) => {
    const uv = geometry.attributes.uv;
    if (!uv) return;
    // For the top face (vertices 8-11), set UVs so the texture covers the surface according to the box size
    // X: size[0] (width), Y: size[1] (depth)
    uv.setXY(8, 0, 0);
    uv.setXY(9, size[0], 0);
    uv.setXY(10, size[0], size[2]);
    uv.setXY(11, 0, size[2]);
    uv.needsUpdate = true;
  };

  // Attach the function to the Box's ref
  const boxRef = React.useRef<any>(null);
  React.useEffect(() => {
    if (boxRef.current && boxRef.current.geometry) {
      updateTopFaceUV(boxRef.current.geometry);
    }
  }, [size]);

  return (
    <Box
      ref={boxRef}
      args={size}
      position={position}
      rotation={rotation}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial attach="material-0" color={'#bebebe'} />
      <meshStandardMaterial attach="material-1" color={'#bebebe'} />
      <meshStandardMaterial attach="material-2" map={topTexture} />
      <meshStandardMaterial attach="material-3" color={'#bebebe'} />
      <meshStandardMaterial attach="material-4" color={'#bebebe'} />
      <meshStandardMaterial attach="material-5" color={'#bebebe'} />
    </Box>
  );
};
