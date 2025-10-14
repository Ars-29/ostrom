import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SpotLight } from 'three';
import { useScene } from '../contexts/SceneContext';

// Define the possible scenes and their light settings
type LightSettings = {
  ambient: { intensity: number; color: number | string };
  directional: { position: [number, number, number]; intensity: number; color: number | string; castShadow: boolean };
  fog: { color: string | number; near: number; far: number };
};

const sceneLightSettings: Record<string, LightSettings> = {
  default: {
    ambient: { intensity: 1.75, color: 0xffffff },
    directional: { position: [10, 10, 5], intensity: 0.5, color: 0xffffff, castShadow: true },
    fog: { color: '#FFFFFF', near: 5, far: 50 },
  },
  night: {
    ambient: { intensity: 0.2, color: 0x222244 },
    directional: { position: [5, 5, 2], intensity: 0.2, color: 0x8888ff, castShadow: false },
    fog: { color: '#222244', near: 1, far: 30 },
  },
  sunset: {
    ambient: { intensity: 0.2, color: 0xFFFFFF },
    directional: { position: [15, 5, 2], intensity: 0.7, color: 0xffffff, castShadow: true },
    fog: { color: '#d0cccb', near: 1, far: 90 },
  },
  default2: {
    ambient: { intensity: 2, color: 0xffffff },
    directional: { position: [10, 10, 5], intensity: 0.5, color: 0xffffff, castShadow: true },
    fog: { color: '#FFF', near: 5, far: 50 },
  },
  // Add more scenes as needed
};

export const Lights: React.FC<{debug?: boolean}> = ({debug}) => {
  const redLightRef = useRef<SpotLight>(null);
  const { camera } = useThree();
  const { currentScene } = useScene();
  const isTouchDevice = 'ontouchstart' in window;

  // Map your app's scene names to light settings
  let sceneKey: string = 'default';
  if (currentScene === 'section-1') sceneKey = 'sunset';
  else if (currentScene === 'section-2') sceneKey = 'default';
  else if (currentScene === 'section-3') sceneKey = 'default2';
  else if (currentScene === 'night') sceneKey = 'night';
  else if (currentScene === 'sunset') sceneKey = 'sunset';

  const { ambient, directional, fog } = sceneLightSettings[sceneKey] || sceneLightSettings['default'];

  // useHelper(redLightRef as React.MutableRefObject<THREE.Object3D>, THREE.SpotLightHelper, '#FF0000');

  useFrame(() => {
    if (redLightRef.current && isTouchDevice) {
      // Update the spotlight position to match the camera's position
      redLightRef.current.position.copy(camera.position);

      // Make the spotlight point in the same direction as the camera with mouse wiggle
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      redLightRef.current.target.position.copy(
        camera.position.clone().add(direction)
      );
      redLightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <fog attach="fog" args={[fog.color, fog.near, debug ? 600 : fog.far]} />
      <ambientLight intensity={ambient.intensity} color={ambient.color} />
      <directionalLight
        position={directional.position}
        intensity={directional.intensity}
        color={directional.color}
        castShadow={directional.castShadow}
      />
      <spotLight
        ref={redLightRef}
        color="#FFF"
        intensity={2}
        distance={20}
        decay={0.25}
        angle={Math.PI / 4}
        penumbra={1}
        castShadow
      />
    </>
  );
};
