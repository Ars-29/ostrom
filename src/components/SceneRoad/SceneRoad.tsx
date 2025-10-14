import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Floor } from './components/Floor';
import DynamicSprite from '../DynamicSprite';
import { useScene } from '../../contexts/SceneContext';
import { SmokeParticles } from './SmokeParticles';
import { CarSmokeParticles } from './CarSmokeParticles';
import { useIsMobile } from '../../hooks/useIsMobile';

interface SceneRoadProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible?: boolean;
}

const SceneRoad: React.FC<SceneRoadProps> = memo(({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], visible = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { currentScene } = useScene();
  const isActive = currentScene === 'section-2';
  const isMobile = useIsMobile(768);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      groupRef.current.scale.set(scale[0], scale[1], scale[2]);
    }
  }, [position, rotation, scale]);

  useFrame(() => {
    // Optional: Add animations or updates for the group here
  });

  return (
    <group ref={groupRef} visible={visible}>

      <Floor />

      {isActive && (
        <>
          <DynamicSprite texture='road/city.webp' order={1} position={[-7,1.5,-37.5]} rotation={[0,0,0]} size={[30,1.5,1]} active={isActive} />
          <DynamicSprite texture='road/dunes.webp' order={1} position={[-29, 1.2,-33]} rotation={[10,15,0]} size={[20,1,1]} active={isActive} />
          <DynamicSprite texture='road/trees_3.webp' order={1} position={[-20, 1.2,-35]} rotation={[0,5,0]} size={[1.3,1.5,1]} active={isActive} />
          <DynamicSprite texture='road/trees_3.webp' order={1} position={[-15, 1.5,-36]} rotation={[0,5,0]} size={[1.3,1.5,1]} active={isActive} />
          <DynamicSprite texture='road/trees_3.webp' order={1} position={[-14, 1.6,-37]} rotation={[0,5,0]} size={[1.3,1.8,1]} active={isActive} />
          <DynamicSprite texture='road/trees_3.webp' order={1} position={[-10, 1.6,-34.5]} rotation={[0,5,0]} size={[1.3,1.8,1]} active={isActive} />
          <DynamicSprite texture='road/trees_2.webp' order={1} position={[-0, 0.9,-27]} rotation={[0,-50,0]} size={[3,2,1]} active={isActive} />
          <DynamicSprite texture='road/trees_1.webp' order={1} position={[-0.5, 0.5,-23]} rotation={[0,-50,0]} size={[3.5,6,1]} active={isActive} />
          <DynamicSprite texture='road/fence_1.webp' order={2} position={[-11,1,-29]} rotation={[0,0,0]} size={[3.5,0.9,1]} active={isActive} />
          <DynamicSprite texture='road/fence_1.webp' order={2} position={[-14.45,1,-29]} rotation={[0,0,0]} size={[3.5,0.9,1]} active={isActive} />
          <DynamicSprite texture='road/car_1.webp' order={2} position={[-7,0.7,-27]} rotation={[0,-10,5]} size={[2.5,1,1]} active={isActive} />
          {!isMobile && (
            <SmokeParticles position={[-6.5,0.7,-28]} order={2} windDirection={[-0.01,0,0]} />
          )}
          <DynamicSprite 
            texture='road/men_1.webp' order={2} position={[-7.5,0.7,-26]} rotation={[0,-10,0]} size={[2,1.2,1]} active={isActive} color 
            label={{
              id: 'road-1902',
              scene: 'road',
              position: [1.2, 0.5, 0.2],
              rotation: [0, 0, 0],
              imageUrl: 'road/poi/1902.webp',
              text: 'From city streets to the racing line – Ström trousers transform performance.'
            }}
          />
          {!isMobile && (
            <CarSmokeParticles position={[-6,0.7,-23.7]} order={2} windDirection={[-0.2,0.9,-0.01]} />
          )}
          <DynamicSprite texture='road/car_2.webp' order={2} position={[-5.6,0.55,-23.5]} rotation={[0,-10,1]} size={[1.8,1.3,1]} active={isActive} />
          
          {!isMobile && (
            <CarSmokeParticles position={[-11,0.5,-15.2]} order={2} windDirection={[0.9,1.2,-0.5]} />
          )}
          <DynamicSprite 
            texture='road/car_3.webp' order={2} position={[-11,0.5,-15]} rotation={[0,-10,0]} size={[1.8,1.4,1]} active={isActive} color
            label={{
              id: 'road-1905',
              scene: 'road',
              position: [0.9, 1.0, 0.4],
              rotation: [0, 0, 0],
              imageUrl: 'road/poi/1905.webp',
              text: 'The Cape Gordon Bennett – inspired by the legendary race. Crafted by Ström'
            }}
          />

          <DynamicSprite texture='road/rock_1.webp' order={2} position={[-15,0.48,-20]} rotation={[0,10,0]} size={[9,2,1]} active={isActive} />
          <DynamicSprite texture='road/rock_crowded.webp' order={2} position={[-17,0.48,-17]} rotation={[0,25,0]} size={[9,2.8,1]} active={isActive} />
          <DynamicSprite texture='road/tree_1.webp' order={2} position={[-14,0,-17.5]} rotation={[0,0,0]} size={[2.5,4,1]} active={isActive} />
          <DynamicSprite texture='road/tree_2.webp' order={2} position={[-17,0,-16]} rotation={[0,0,0]} size={[2.5,4,1]} active={isActive} />
          <DynamicSprite texture='road/mens_2.webp' order={2} position={[-14.5,0.77,-16.5]} rotation={[0,0,0]} size={[0.8,1.2,1]} active={isActive} />
          <DynamicSprite texture='road/dog_1.webp' order={2} position={[-8,0.7,-14]} rotation={[0,0,0]} size={[0.5,0.5,1]} active={isActive} />
          <DynamicSprite texture='road/fence_1.webp' order={2} position={[-1,0.8,-9]} rotation={[0,-20,0]} size={[3.5,0.9,1]} active={isActive} />

          <DynamicSprite texture='road/bush-2.webp' order={2} position={[-5,1.1,-13.5]} rotation={[0,0,0]} size={[2.1,0.7,1]} active={isActive} />
          <DynamicSprite texture='road/bush-2.webp' order={2} position={[2,1.1,-9]} rotation={[0,0,0]} size={[1.7,0.5,1]} active={isActive} />

          <DynamicSprite 
            texture='road/car_5.webp' order={2} position={[-1,0.65,-7]} rotation={[0,-20,0]} size={[2.5,0.9,1]} active={isActive} color
            label={{
              id: 'road-spiro',
              scene: 'road',
              position: [1.8, 0.5, 0.2],
              rotation: [0, 0, 0],
              imageUrl: 'road/poi/spiro.webp',
              text: 'Ström Spiro filters ensure clean air at full throttle.'
            }}
          />
          {!isMobile && (
            <CarSmokeParticles position={[-1,0.65,-7]} order={2} windDirection={[-0.9,1.2,-0.5]} />
          )}

          <DynamicSprite texture='road/bush_1.webp' order={2} position={[-1.5,0.5,0.5]} rotation={[0,10,0]} size={[2,0.8,1]} active={isActive} />
          <DynamicSprite texture='road/bush_1.webp' order={2} position={[-3,0.95,0.4]} rotation={[0,10,-15]} size={[3,0.8,1]} active={isActive} />
          <DynamicSprite texture='road/bush_1.webp' order={2} position={[-8,1.5,0.8]} rotation={[0,0,0]} size={[2,0.6,1]} active={isActive} />
          <DynamicSprite texture='road/fence_1.webp' order={2} position={[-8,1,3]} rotation={[0,10,0]} size={[3.5,0.9,1]} active={isActive} />
          <DynamicSprite texture='road/fence_1.webp' order={2} position={[-12,1,4.5]} rotation={[0,30,0]} size={[3.5,0.9,1]} active={isActive} />

          <DynamicSprite texture='road/car_6.webp' order={2} position={[-5,0.69,3.5]} rotation={[10,-10,-10]} size={[2,1,1]} active={isActive} />
          {!isMobile && (
            <CarSmokeParticles position={[-5,1,3.5]} order={2} windDirection={[0.7,0,-0.5]} />
          )}

          <DynamicSprite texture='road/men_3.webp' order={2} position={[-9.5,0.6,12.8]} rotation={[0,-30,0]} size={[2.8,1.2,1]} active={isActive} />
          <DynamicSprite texture='road/men_4.webp' order={2} position={[-8.1,0.6,14]} rotation={[0,-30,0]} size={[1,1.2,1]} active={isActive} />

          <DynamicSprite 
            texture='road/car_7.webp' order={2} position={[-12,0.55,11]} rotation={[-10,10,0]} size={[1.5,1.3,1]} active={isActive} color 
            label={{
              id: 'road-car-2',
              scene: 'road',
              position: [0.9, 1, 0.5],
              rotation: [0, 0, 0],
              imageUrl: 'road/poi/1901_parapluie.webp',
              text: 'Ström defies the weather with the driver’s umbrella. Made for velocity. Makes history.'
            }}
          />
          {!isMobile && (
            <CarSmokeParticles position={[-12,1,10]} order={2} windDirection={[-0.1,0.5,-1]} />
          )}

          <DynamicSprite texture='road/bush_1.webp' order={2} position={[-5,0.8,12]} rotation={[0,0,0]} size={[5,0.8,1]} active={isActive} />
          <DynamicSprite texture='road/trees_2.webp' order={2} position={[-5,0.4,11]} rotation={[0,0,0]} size={[5,2.5,1]} active={isActive} />
          <DynamicSprite texture='road/trees-thirdplan.webp' order={2} position={[-10,1.5,2]} rotation={[0,0,0]} size={[3.5,2.5,1]} active={isActive} />
          <DynamicSprite texture='road/trees-secondplan.webp' order={2} position={[-15,1.3,4]} rotation={[0,50,0]} size={[7,3,1]} active={isActive} />
          <DynamicSprite texture='road/man-secondplan.webp' order={2} position={[-14.5,1.3,5.8]} rotation={[0,10,0]} size={[0.6,0.8,1]} active={isActive} />
          <DynamicSprite texture='road/man-firstplan.webp' order={2} position={[-15.5,0.9,13.8]} rotation={[0,0,0]} size={[0.5,1.2,1]} active={isActive} />
          
          <DynamicSprite texture='road/bush-2.webp' order={2} position={[-15.5,1,14]} rotation={[0,0,0]} size={[1,0.5,1]} active={isActive} />
         

          <DynamicSprite texture='road/trees-landscape.webp' order={2} position={[6,1,-4]} rotation={[0,-20,0]} size={[6,2,1]} active={isActive} />
          <DynamicSprite texture='road/trees_4.webp' order={1} position={[0,0.2,13]} rotation={[0,-10,0]} size={[6,4,1]} active={isActive} />
          <DynamicSprite texture='road/fence_1.webp' order={1} position={[-6,0.5,15]} rotation={[0,-10,0]} size={[4,0.95,1]} active={isActive} />
          <DynamicSprite texture='road/bush_3.webp' order={1} position={[1.5,0.5,15]} rotation={[0,-10,0]} size={[4,0.95,1]} active={isActive} />
          <DynamicSprite texture='road/bush-2.webp' order={2} position={[5,0.6,12]} rotation={[0,0,0]} size={[1,0.5,1]} active={isActive} />
          <DynamicSprite texture='road/bush-2.webp' order={2} position={[6,0.5,14]} rotation={[0,0,0]} size={[1,0.5,1]} active={isActive} />
          <DynamicSprite texture='road/man-1.webp' order={2} position={[5,0.5,14.8]} rotation={[0,0,0]} size={[1.8,1.2,1]} active={isActive} />

          <DynamicSprite texture='road/car_16.webp' order={2} position={[0,0.5,18]} rotation={[0,0,0]} size={[2,0.7,1]} active={isActive} />
           {!isMobile && (
            <CarSmokeParticles position={[0,0.7,18]} order={2} windDirection={[-1,0.1,-0.5]} />
          )}

          <DynamicSprite texture='road/hotairbaloon.webp' order={2} position={[7,6,2]} rotation={[0,-20,0]} size={[1,2,1]} active={isActive} />
          <DynamicSprite texture='road/hotairbaloon.webp' order={2} position={[-5,8,-15]} rotation={[0,0,0]} size={[1,2,1]} active={isActive} />

          <DynamicSprite texture='road/man-1.webp' order={2} position={[22,0.45,16]} rotation={[0,-20,0]} size={[1.3,0.8,1]} active={isActive} />
          <DynamicSprite texture='road/trees-3.webp' order={2} position={[27,0.2,18]} rotation={[0,-40,0]} size={[4.5,3,1]} active={isActive} />
          <DynamicSprite texture='road/people.webp' order={1} position={[10,0.4,22]} rotation={[0,0,0]} size={[5,1.2,1]} active={isActive} />
          <DynamicSprite texture='road/trees_1.webp' order={1} position={[8.1,0.1,13.8]} rotation={[0,-10,0]} size={[3.5,6,1]} active={isActive} />
          <DynamicSprite texture='road/bush-2.webp' order={2} position={[9.2,0.5,14.2]} rotation={[0,0,0]} size={[1.5,0.8,1]} active={isActive} />
          <group position={[10.7,0.3,11]}>
            <DynamicSprite texture='road/building-left.webp' order={10} position={[0,0,0]} rotation={[0,55,0]} size={[7,6,1]} active={isActive} />
            <DynamicSprite 
              texture='road/building-middle.webp' order={10} position={[7.85,0,-3]} rotation={[0,0,0]} size={[12,6,1]} active={isActive} color
              label={{
                id: 'road-1901-2',
                scene: 'road',
                position: [-6.5, 1.5, 8],
                rotation: [0, 0, 0],
                imageUrl: 'road/poi/1901.webp',
                text: '1901 – the Ström stand at the Paris Automobile Salon'
              }}
            />
            <DynamicSprite texture='road/fountain.webp' order={10} position={[7.85,0,3]} rotation={[0,0,0]} size={[12,6,1]} active={isActive} />
            <DynamicSprite texture='road/building-right.webp' order={10} position={[15.5,0,0]} rotation={[0,-55,0]} size={[7,6,1]} active={isActive} />
          </group>
          <DynamicSprite texture='road/crowd_left_1.webp' order={10} position={[16.2,0.5,28]} rotation={[0,80,0]} size={[7,1.5,1]} active={isActive} />
          <DynamicSprite texture='road/crowd_left_2.webp' order={10} position={[14.75,0.4,29]} rotation={[0,80,0]} size={[7,1.8,1]} active={isActive} />
          <DynamicSprite texture='road/crowd_left_3.webp' order={10} position={[13,0,29]} rotation={[0,80,0]} size={[15,4,1]} active={isActive} />
          <DynamicSprite texture='road/crowd_right_1.webp' order={10} position={[22.4,0.4,28]} rotation={[0,-80,0]} size={[6,1.5,1]} active={isActive} />
          <DynamicSprite texture='road/crowd_right_2.webp' order={10} position={[23.6,0.4,29]} rotation={[0,-80,0]} size={[9,2.5,1]} active={isActive} />
          <DynamicSprite texture='road/crowd_right_3.webp' order={10} position={[25.5,0.4,27]} rotation={[0,-80,0]} size={[15,4,1]} active={isActive} />

          {!isMobile && (
            <CarSmokeParticles position={[17.7,0.5,24]} order={2} windDirection={[0.4,0.5,-0.5]} />
          )}

          <DynamicSprite texture='road/car_8.webp' order={15} position={[17.7,0.5,24]} rotation={[0,40,0]} size={[1.4,0.9,1]} active={isActive} />
          <DynamicSprite texture='road/car_11.webp' order={15} position={[21,0.4,22]} rotation={[0,-10,0]} size={[0.65,0.85,1]} active={isActive} />
          <DynamicSprite texture='road/car_10.webp' order={15} position={[19.7,0.45,26]} rotation={[0,20,0]} size={[0.9,0.85,1]} active={isActive} />
          <DynamicSprite texture='road/car_9.webp' order={15} position={[19,0.45,29]} rotation={[0,0,0]} size={[0.8,0.85,1]} active={isActive} />
          
          {!isMobile && (
            <CarSmokeParticles position={[19,0.45,29]} order={2} windDirection={[0.4,2,-0.5]} />
          )}

          <DynamicSprite texture='road/men_5.webp' order={15} position={[21,0.45,28]} rotation={[0,-40,0]} size={[1,0.85,1]} active={isActive} />
          <DynamicSprite texture='road/car_12.webp' order={15} position={[22,0.45,31]} rotation={[0,0,0]} size={[0.95,0.95,1]} active={isActive} />
          <DynamicSprite texture='road/car_13.webp' order={15} position={[17,0.45,31]} rotation={[0,20,0]} size={[1.3,0.85,1]} active={isActive} />
          
          {!isMobile && (
            <CarSmokeParticles position={[17,0.45,31]} order={2} windDirection={[0.4,2,-0.5]} />
          )}

          <DynamicSprite 
            texture='road/car_14.webp' order={15} position={[20,0.45,34]} rotation={[0,0,0]} size={[1,1,1]} active={isActive} color 
            label={{
              id: 'road-1906',
              scene: 'road',
              position: [0.65, 0.7, 0.2],
              rotation: [0, 0, 0],
              imageUrl: 'road/poi/1906.webp',
              text: 'Advanced headgear from Ström – integrated vision for performance lovers.'
            }}
          />
          {!isMobile && (
            <CarSmokeParticles position={[20,0.45,34]} order={2} windDirection={[0.4,2,-0.5]} />
          )}
        </>
      )}

    </group>
  );
});

export default SceneRoad;