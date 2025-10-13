import React, { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Html, Sparkles, Sphere } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useOverlayImage } from '../contexts/OverlayImageContext';
import { useSpring, a } from '@react-spring/three';
import { useLabelInfo } from '../contexts/LabelInfoContext';
import { useSound } from '../contexts/SoundContext';
import { useIsMobile } from '../hooks/useIsMobile';

interface LabelInfoProps {
  id: string;
  scene: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  text: string;
  linePosition: 'left' | 'right';
  imageUrl?: string;
  order?: number;
  disableSparkles?: boolean; // Optional prop to disable sparkles
}

const displayHtmlLabel = false;

const LabelInfo: React.FC<LabelInfoProps> = ({ id, scene, position = [0, 0, 0], rotation = [0, 0, 0], text, linePosition, imageUrl, order, disableSparkles }) => {
  const { openImage } = useOverlayImage();
  const { state, markClicked } = useLabelInfo();
  const { playEffect } = useSound();
  const lineEnd: [number, number, number] = linePosition === 'left' ? [-1, 0, 0] : [1, 0, 0];
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const isMobile = useIsMobile(768); 
  const isTouchDevice = 'ontouchstart' in window;   

  const spring = useSpring({
    sphere: isHovered ? 1.25 : isTouchDevice ? 2 : 1,
    halo: isHovered ? 0.2 : 0.25,
    config: { tension: 200, friction: 18 },
  });

  const clicked = !!state[scene]?.[id];

  useFrame(() => {
    if (groupRef.current) {
      const distance = camera.position.distanceTo(new THREE.Vector3(...position));
      const fadeDistance = 7; // Adjust this value as needed
      const newOpacity = Math.max(0, 1 - distance / fadeDistance);
      setOpacity(newOpacity);
    }
  });

  const handleLabelClick = useCallback(() => {
    playEffect('click');
    if (imageUrl) {
      openImage(imageUrl, text);
    }
    markClicked(scene, id);
  }, [imageUrl, openImage, markClicked, playEffect, scene, id, text]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      
      {displayHtmlLabel && (
        <Html
          position={lineEnd}
          className={`label-info ${linePosition}`}
          style={{
            whiteSpace: 'nowrap',
            fontSize: '14px',
            color: 'black',
            opacity: opacity,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          <div className={`line`} />
          <div className='text active-follower' onClick={handleLabelClick}>
              {text}
          </div>
        </Html>
      )}
      <group position={lineEnd}>
        {/* Light above the sphere for shadow casting */}
        <pointLight
          position={[0, 0.6, 0]}
          intensity={2.5}
          distance={3}
          decay={3}
        />
        <a.mesh renderOrder={order} scale={spring.sphere.to((s: number) => [s, s, s])} castShadow>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={clicked ? '#000' : 'white'} transparent opacity={clicked ? 1 : 1} />
        </a.mesh>
        <a.mesh 
          renderOrder={order} scale={spring.halo.to((h: number) => [h, h, h])}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setIsHovered(true);
          }}
          onPointerOut={() => {
            document.body.style.cursor = '';
            setIsHovered(false);
          }}
          onClick={handleLabelClick}
        >
          <sphereGeometry args={[clicked ? 0.3 : 0.5, 12, 12]} />
          <meshBasicMaterial color="#FFF" transparent opacity={clicked ? 0.05 : 0.3} />
        </a.mesh>
        {!disableSparkles && (
          <Sparkles 
            renderOrder={order} 
            color={clicked ? '#DDD' : '#DDD'} 
            scale={clicked ? 2.25 : 0.5} 
            size={clicked ? 1.75 : 2} 
            speed={clicked ? 0.2 : 0.3} 
            count={20} 
            noise={10} 
          />
        )}
      </group>
      
    </group>
  );
};

export default LabelInfo;
