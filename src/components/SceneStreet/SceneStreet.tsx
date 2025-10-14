import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Floor } from './components/Floor';
import DynamicSprite from '../DynamicSprite';
import { Sidewalk } from './components/Sidewalk';
import { degToRad } from 'three/src/math/MathUtils.js';
import StreetLamp from './StreetLamp';
import { useScene } from '../../contexts/SceneContext';

interface SceneStreetProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible?: boolean;
}

const SceneStreet: React.FC<SceneStreetProps> = memo(({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], visible = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { currentScene } = useScene();
  const isActive = currentScene === 'section-1';

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

      <pointLight
        position={[0, 5, 0]}
        color={"#FFF"}
        intensity={5}
        distance={7}
        decay={0.8}
        castShadow={false}
      />

      <DynamicSprite texture='street/church-thirdplan.webp' order={0} position={[0,0,-3]} rotation={[0,0,0]} size={[8,14,1]} active={isActive} />
      <DynamicSprite texture='street/church_front_1.webp' order={0} position={[0,0,0.5]} rotation={[0,0,0]} size={[9,4.5,1]} active={isActive} />
      <group position={[0,0,1]}>
        <DynamicSprite texture='street/building-secondplan-2-1.webp' order={0} position={[-3.5,0,7]} rotation={[0,80,0]} size={[12,8,1]} active={isActive} />
        <DynamicSprite texture='street/building-secondplan-2-2.webp' order={0} position={[-5.74,0,13]} rotation={[0,0,0]} size={[2.5,9,1]} active={isActive} />
        <DynamicSprite texture='street/building-secondplan-2-3.webp' order={1} position={[-11.95,0,8]} rotation={[0,-45,0]} size={[14,8,1]} active={isActive} />
      </group>
      <DynamicSprite texture='street/building-secondplan-1_flat.webp' order={1} position={[4.5,0,14.2]} rotation={[0,-80,0]} size={[24,8,1]} active={isActive} />     
      <DynamicSprite 
        texture='street/building-secondplan-strom.webp' order={1} position={[5.6,0,21.1]} rotation={[0,-80,0]} size={[8.5,2.9,1]} active={isActive} color 
        label={{
          id: 'street-1911',
          scene: 'street',
          position: [1.2, 0.6, 0.3],
          rotation: [0, 0, 0],
          imageUrl: 'street/poi/1911.webp',
          text: 'The landmark Ström flagship store in Paris, in the chic neighbourhood of the Opera Garnier'
        }}
      />

      <Sidewalk position={[4.7, 0, 13.8]} rotation={[0, degToRad(10), 0]} size={[2, 0.07, 25]} />
      <Sidewalk position={[-3.9, 0, 8.2]} motifSize={1} rotation={[0, degToRad(-10), 0]} size={[2, 0.07, 13]} />
      <Sidewalk position={[-5.45, 0.001, 13.9]} rotation={[0, degToRad(5), 0]} size={[2.6, 0.07, 2]} />
      <Sidewalk position={[-11.25, 0, 9]} rotation={[0, degToRad(45), 0]} size={[2, 0.07, 15]} />

      <StreetLamp position={[-1.9,0.04,2.1]} />
      <StreetLamp position={[-2.6,0.04,6.5]} />
      <StreetLamp position={[-3.4,0.04,10.8]} />
      <StreetLamp position={[-4.15,0.04,14.7]} />
      <StreetLamp position={[-6.5,0.04,15]} />
      <StreetLamp position={[-10,0.04,11.6]} />
      <StreetLamp position={[-14.4,0.04,7.2]} />

      <StreetLamp position={[1.85,0.04,2.1]} />
      <StreetLamp position={[2.5,0.04,6.5]} />
      <StreetLamp position={[3.4,0.04,10.8]} />
      <StreetLamp position={[4.1,0.04,14.7]} />
      <StreetLamp position={[4.85,0.04,19]} />
      <StreetLamp position={[5.4,0.04,24]} />

      <DynamicSprite texture='street/car-secondplan-1.webp' order={2} position={[-2,0,7]} rotation={[0,0,0]} size={[0.8,1,1]} active={isActive} />
      <DynamicSprite texture='street/car-secondplan-1.webp' order={2} position={[-2.5,0,14]} rotation={[0,0,0]} size={[0.8,1,1]} active={isActive} />
      <DynamicSprite texture='street/car-secondplan-1.webp' order={2} position={[0.5,0,4]} rotation={[0,0,0]} size={[0.8,1,1]} mirrorX active={isActive} />
      <DynamicSprite texture='street/horse_1.webp' order={10} position={[1.7,0.01,8]} rotation={[10,-5,0]} size={[1.2,1,1]} active={isActive} />
      <DynamicSprite 
        texture='street/car-secondplan-2.webp' order={10} position={[2.5,0,16]} rotation={[0,0,0]} size={[1.4,0.9,1]} active={isActive}
      />
      <DynamicSprite texture='street/car-secondplan-2.webp' order={15} position={[-8.0,0,15]} rotation={[0,0,0]} size={[1.2,0.8,1]} active={isActive} />
      <DynamicSprite 
        texture='street/car-secondplan-3.webp' order={15} position={[-0.8,0,10]} rotation={[0,0,0]} size={[1.05,1,1]} active={isActive}
      />

      <DynamicSprite 
        texture='street/motocycle.webp' order={15} position={[2.2,0.01,12.8]} rotation={[-5,-70,0]} size={[0.95,0.8,1]} active={isActive} color
        label={{
          id: 'street-moto-1',
          scene: 'street',
          position: [0.7, 0.6, 0.1],
          rotation: [0, 0, 0],
          imageUrl: 'street/poi/1904_moto.webp',
          text: '1904 - Ström unveils the safest cape for motorised cycles'
        }}
      />

      <DynamicSprite 
        texture='street/voiture-chien.webp' fadeInOnCamera order={20} position={[1.5,0.015,21.5]} rotation={[0,-10,0]} size={[1.2,0.95,1]} active={isActive} color 
        label={{
          id: 'street-car-2',
          scene: 'street',
          position: [0.6, 0.6, 0.1],
          rotation: [0, 0, 0],
          imageUrl: 'street/poi/retro.webp',
          text: '1906 - Ström invents drivers’ glasses with integrated rear-view mirrors'
        }}
      />


      {/* Characters on Sidewalks */}
      <DynamicSprite texture='street/man-thirdplan-1.webp' order={3} position={[-8.6, 0.05, 13]} rotation={[0, 10, 0]} size={[0.3,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-thirdplan-2.webp' order={3} position={[-2.3, 0.05, 5]} rotation={[0, (10), 0]} size={[0.35,0.7,1]} active={isActive} />
      <DynamicSprite texture='street/men-thirdplan.webp' order={3} position={[-2, 0.05, 2]} rotation={[0, (10), 0]} size={[0.8,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-1.webp' order={3} position={[4.8, 0.05, 20]} rotation={[0, -60, 0]} size={[0.4,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-2.webp' order={3} position={[-2, 0.05, 16]} rotation={[0, (10), 0]} size={[0.4,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-7.webp' order={3} position={[5.2, 0.04, 21]} rotation={[0, -45, 0]} size={[0.35,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-4.webp' order={3} position={[4.55, 0.03, 17.5]} rotation={[0, -45, 0]} size={[0.32,0.7,1]} active={isActive} />

      <DynamicSprite 
        texture='street/man-secondplan-6.webp' order={3} position={[2, 0.02, 2.5]} rotation={[0, -10, 0]} size={[0.3,0.8,1]} active={isActive} color
        label={{
          id: 'street-1901',
          scene: 'street',
          position: [0.85, 0.65, 0.1],
          rotation: [0, 0, 0],
          imageUrl: 'street/poi/1901.webp',
          text: 'Ström – inventors of automotive fashion'
        }}
      />

      <DynamicSprite texture='street/man-secondplan-6.webp' order={3} position={[4.4, 0.02, 16.2]} rotation={[0, (-10), 0]} size={[0.35,0.75,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-5.webp' order={3} position={[4.6, 0.02, 16.25]} rotation={[0, -45, 0]} size={[0.3,0.75,1]} active={isActive} />
      <DynamicSprite texture='street/man-car.webp' order={5} position={[3.25, 0.0, 16.2]} rotation={[0, -30, 0]} size={[0.7,0.7,1]} active={isActive} />

      <DynamicSprite 
        texture='street/man-secondplan-3.webp' order={3} position={[-1.7, 0.04, 11]} rotation={[0, 30, 0]} size={[0.35,0.75,1]} active={isActive} color
        label={{
          id: 'street-1904',
          scene: 'street',
          position: [1.25, 0.65, 0.1],
          rotation: [0, 0, 0],
          imageUrl: 'street/poi/1904_chapeau.webp',
          text: 'Outerwear created by Ström, embraced by all.'
        }}
      />

      <DynamicSprite texture='street/man-secondplan-8.webp' order={3} position={[3.8, 0.05, 14]} rotation={[0, (5), 0]} size={[0.3,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-9.webp' order={3} position={[2.8, 0.05, 8]} rotation={[0, -45, 0]} size={[0.4,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-10.webp' order={3} position={[-2.8, 0.01, 6.8]} rotation={[0, (45), 0]} size={[0.4,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-11.webp' order={3} position={[3.6, 0.02, 12.8]} rotation={[0, 0, 0]} size={[0.4,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-12.webp' order={3} position={[-4.7, 0.02, 14.3]} rotation={[0, 15, 0]} size={[0.3,0.8,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-13.webp' order={3} position={[-6, 0.02, 14.8]} rotation={[0, 25, 0]} size={[0.4,0.7,1]} active={isActive} />
      <DynamicSprite texture='street/dog-1.webp' order={3} position={[4.6, 0.02, 20.2]} rotation={[0, 0, 0]} size={[0.3,0.3,1]} active={isActive} />
      <DynamicSprite texture='street/man-secondplan-2.webp' order={3} position={[5.2, 0.02, 20.5]} rotation={[0, (10), 0]} size={[0.4,0.8,1]} active={isActive} />
      
    </group>
  );
});

export default SceneStreet;