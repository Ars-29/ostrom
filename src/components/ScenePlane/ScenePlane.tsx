import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Floor } from './components/Floor';
import DynamicSprite from '../DynamicSprite';
import SandParticles from './components/SandParticles';
import { degToRad } from 'three/src/math/MathUtils.js';
import PlaneSprite from './components/PlaneSprite';
import { useScene } from '../../contexts/SceneContext';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ScenePlaneProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible?: boolean;
}

const ScenePlane: React.FC<ScenePlaneProps> = memo(({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], visible = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { currentScene } = useScene();
  const isActive = currentScene === 'section-3' || currentScene === 'footer';
  const isMobile = useIsMobile(768);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      groupRef.current.scale.set(scale[0], scale[1], scale[2]);
    }
    
    // Debug logging for plane scene visibility
    if (visible && isActive) {
      console.log(`🚁 [ScenePlane] Plane scene is now visible and active (${currentScene})`);
      console.log('🚁 [ScenePlane] Checking asset loading status...');
      
      // Check if critical assets are loaded
      import('../../utils/EnhancedSceneAssetPreloader').then(({ enhancedScenePreloader }) => {
        const loadingState = enhancedScenePreloader.getLoadingState('section-3');
        console.log(`🚁 [ScenePlane] Asset loading state: ${loadingState}`);
        
        if (loadingState === 'error') {
          console.warn('⚠️ [ScenePlane] Some plane scene assets failed to load - background may appear gray');
        }
      });
    }
  }, [position, rotation, scale, visible, isActive]);

  useFrame(() => {
    // Optional: Add animations or updates for the group here
  });

  return (
    <group ref={groupRef} visible={visible}>

      <pointLight position={[0, 10, 20]} intensity={200} castShadow  />

      <Floor />

      <DynamicSprite texture='plane/third-plan.webp' order={0} position={[12,-0.5,-15]} rotation={[0,0,0]} size={[40,6,1]} active={isActive} />
      <DynamicSprite texture='plane/second-plan.webp' order={1} position={[0,-0.5,-10]} rotation={[0,0,0]} size={[25,5,1]} active={isActive} />

      {/* Plane sprite moves with scroll */}
      <PlaneSprite />

      <DynamicSprite 
        texture='road/hotairbaloon.webp' order={2} position={[0,5,-10]} rotation={[0,-20,0]} size={[1,2,1]} active={isActive} color
        label={{
          id: 'plane-pub',
          scene: 'plane',
          position: [0.5, 1, 1],
          rotation: [0, 0, 0],
          imageUrl: 'plane/poi/pub.webp',
          text: 'Into the sky - the dawn of flight, with Ström'
        }}
      />

      <group position={[3,0,-1]} rotation={[0,degToRad(-11),0]}>
        <DynamicSprite texture='plane/people_1.webp' fadeInOnCamera order={20} position={[-3.2,-0.15,5.8]} rotation={[0,0,0]} size={[0.8,0.7,1]} active={isActive} />

        <DynamicSprite texture='plane/plane_end.webp' fadeInOnCamera order={30} position={[-1, -0.2, 6.5]} rotation={[0,0,0]} size={[7.5, 3.8, 1]} active={isActive} />

        <DynamicSprite 
          texture='plane/people_3.webp' fadeInOnCamera order={40} position={[-2.95,-0.2,8.5]} rotation={[0,0,0]} size={[0.75,1.4,1]} active={isActive} color
          label={{
            id: 'plane-1911',
            scene: 'plane',
            position: [1.3, 0.75, 0.6],
            rotation: [0, 0, 0],
            imageUrl: 'plane/poi/1911.webp',
            text: 'Pioneers of the sky, charting the unknown with Ström.'
          }}
        />
        <DynamicSprite texture='plane/people_4.webp' fadeInOnCamera order={40} position={[-4,-0.21,8]} rotation={[0,0,0]} size={[1.2,1.5,1]} active={isActive} />
        <DynamicSprite texture='plane/people_2.webp' fadeInOnCamera order={50} position={[-1.2,-0.18,9.5]} rotation={[0,0,0]} size={[0.8,1.5,1]} active={isActive} />
        <DynamicSprite texture='plane/people_5.webp' fadeInOnCamera order={50} position={[2,-0.20,9]} rotation={[0,0,0]} size={[1.5,1.5,1]} active={isActive} />
        <DynamicSprite texture='plane/people_6.webp' fadeInOnCamera order={40} position={[1,-0.16,8]} rotation={[0,0,0]} size={[0.8,1.5,1]} active={isActive} />

        <DynamicSprite 
          texture='plane/pilot.webp' fadeInOnCamera order={70} position={[-0.5,-0.28,12]} rotation={[0,0,0]} size={[0.65,1.75,1]} active={isActive} color
          label={{
            id: 'plane-1912',
            scene: 'plane',
            position: [1.3, 0.75, 0.6],
            rotation: [0, 0, 0],
            imageUrl: 'plane/poi/1912.webp',
            text: 'Chasing clouds, chasing dreams, breaking barriers.'
          }}
        />
      </group>

      {isActive && !isMobile && (
        <>
          <SandParticles order={10} />
          <SandParticles order={10} />
        </>
      )}

    </group>
  );
});

export default ScenePlane;