import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Floor } from './components/Floor';
import SkySphere from '../SkySphere';
import { BushSprite } from './components/BushSprite';
import { Car } from './components/Car';
import { degToRad } from 'three/src/math/MathUtils.js';

interface SceneDemoProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const SceneDemo: React.FC<SceneDemoProps> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...position);
      groupRef.current.rotation.set(...rotation);
      groupRef.current.scale.set(...scale);
    }
  }, [position, rotation, scale]);

  useFrame(() => {
    // Optional: Add animations or updates for the group here
  });

  return (
    <group ref={groupRef}>
      
        <Floor />
        <SkySphere />

        {/*
        <SimpleSprite
            textureUrl="images/background.webp"
            position={[0, -1, -45]}
            rotation={[0, 0, 0]}
            size={[90, 20]}
            triggerY={0}
        />
        */}


        <BushSprite
            textureUrl="images/bush.png"
            position={[20, -1.8, -30]}
            rotation={[0, degToRad(-20), 0]}
            size={[40, 8]}
            triggerY={0.015}
        />
        <BushSprite
            textureUrl="images/bush.png"
            position={[3, -1, -20]}
            rotation={[0, Math.PI / 5, 0]}
            size={[10, 5]}
            triggerY={0.04}
        />

        <Car
            textureUrl="images/car.png"
            position={[7.5, 0.1, -15]}
            size={[2, 2]}
            triggerY={0.08}
        />

        <BushSprite
            textureUrl="images/bush.png"
            position={[13, -1.25, -7]}
            rotation={[0, degToRad(-45), 0]}
            size={[10, 5]}
            triggerY={0.2}
        />
        
        <Car
            textureUrl="images/car.png"
            position={[12, -1.25, 1]}
            size={[2, 2]}
            triggerY={0.3}
        />

        <BushSprite
            textureUrl="images/bush.png"
            position={[5, -1, 3]}
            rotation={[0, degToRad(45), 0]}
            size={[5, 2]}
            triggerY={0.5}
        />

        <Car
            textureUrl="images/car.png"
            position={[12, 0, 16]}
            size={[2, 2]}
            triggerY={0.8}
        />

        <Car
            textureUrl="images/car.png"
            position={[5, -0.6, 30]}
            size={[2, 2]}
            triggerY={0.95}
        />

        <Car
            textureUrl="images/car.png"
            position={[20, 0, 30]}
            size={[2, 2]}
        />
    </group>
  );
};

export default SceneDemo;
