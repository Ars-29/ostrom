import React, { useCallback, useMemo, useState, memo } from 'react';
import { TextureLoader, ShaderMaterial, DoubleSide } from 'three';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import LabelInfo from './LabelInfo';
import { useOverlayImage } from '../contexts/OverlayImageContext';
import { useLabelInfo } from '../contexts/LabelInfoContext';
import { useSound } from '../contexts/SoundContext';

interface DynamicSpriteProps {
    texture: string; // URL of the texture image
    size: [number, number, number]; // Size of the sprite
    position: [number, number, number]; // Position of the sprite
    rotation: [number, number, number]; // Rotation of the sprite in degrees
    order?: number; // Optional render order
    alpha?: number; // Optional alpha/opacity value
    fadeInOnCamera?: boolean; // Enable fade-in when entering camera view
    color?: boolean;
    billboard?: boolean; // New: always face camera
    mirrorX?: boolean; // New: mirror texture horizontally
    active?: boolean; // NEW: only run useFrame if true
    label?: {
      id: string;
      scene: string;
      position: [number, number, number];
      rotation: [number, number, number];
      imageUrl: string;
      text: string;
      disableSparkles?: boolean; // Optional prop to disable sparkles
    }
}

const DynamicSprite: React.FC<DynamicSpriteProps> = memo(({ 
  texture, size, position, rotation, order, alpha = 1, fadeInOnCamera = false,
  color = false, billboard = false, mirrorX = false, active = true, label 
}) => {
  const loadedTexture = useLoader(TextureLoader, import.meta.env.BASE_URL + 'images/' + texture);
  
  const loadedTextureColor = color
    ? useLoader(TextureLoader, import.meta.env.BASE_URL + 'images/' + texture.replace('.webp', '_color.webp'))
    : null;
  const maskTexture = color
    ? useLoader(TextureLoader, import.meta.env.BASE_URL + 'images/mask3.png')
    : null;

  const { camera } = useThree();
  const { openImage } = useOverlayImage();
  const { markClicked } = useLabelInfo();
  const { playEffect } = useSound();
  
  const groupRef = React.useRef<THREE.Group>(null);
  
  const isTouchDevice = 'ontouchstart' in window;
  
  const [isOver, setIsOver] = useState(false);
  const [progress, setProgress] = useState(isTouchDevice ? 1 : 0); // Start with full progress on mobile
  const [visibleAlpha] = useState(fadeInOnCamera ? 1 : 1);
  const [isVisible] = useState(true);

  const rotationInRadians = useMemo(() => {
    return rotation.map((angle) => angle * (Math.PI / 180)) as [number, number, number];
  }, [rotation]);

  const vertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform sampler2D uMask;
    uniform float uProgress;
    uniform float uAlpha;

    varying vec2 vUv;

    void main() {
      vec4 maskColor = texture2D(uMask, vUv);
      vec4 textureColor = texture2D(uTexture, vUv);
      
      // Use luminance formula for better mask interpretation
      float maskIntensity = dot(maskColor.rgb, vec3(0.299, 0.587, 0.114));
      
      // Enhanced threshold calculation with easing
      float easedProgress = uProgress * uProgress * (3.0 - 2.0 * uProgress); // Smoothstep easing
      float threshold = 1.0 - easedProgress;
      
      // Multi-layer reveal effect for more organic appearance
      float primaryMask = smoothstep(threshold - 0.2, threshold + 0.1, maskIntensity);
      float secondaryMask = smoothstep(threshold - 0.3, threshold + 0.2, maskIntensity * 0.8);
      float maskValue = mix(secondaryMask, primaryMask, 0.7);
      
      // Color enhancement for more vibrant appearance
      vec3 enhancedColor = textureColor.rgb;
      
      // Improved contrast and color balance
      enhancedColor = pow(enhancedColor, vec3(1.1)); // Increase contrast slightly
      enhancedColor *= 0.7; // Reduce brightness
      
      // Increase saturation for better color pop
      float luminance = dot(enhancedColor, vec3(0.299, 0.587, 0.114));
      enhancedColor = mix(vec3(luminance), enhancedColor, 1.2); // Boost saturation
      
      enhancedColor = clamp(enhancedColor, 0.0, 1.0);
      
      // Subtle edge glow effect (reduced intensity)
      float edge = 1.0 - smoothstep(0.0, 0.4, abs(maskValue - 0.5) * 2.0);
      enhancedColor += edge * 0.08 * vec3(1.0, 0.95, 0.9); // Softer warm edge glow
      
      // Ensure complete opacity when animation is finished
      if (uProgress >= 0.99) {
        maskValue = 1.0;
      }
      
      gl_FragColor = vec4(enhancedColor, textureColor.a * maskValue * uAlpha);
    }
  `;

  const material = useMemo(() => {
    if (!color) return null;
    return new ShaderMaterial({
      uniforms: {
        uTexture: { value: loadedTextureColor },
        uMask: { value: maskTexture },
        uProgress: { value: progress },
        uAlpha: { value: alpha },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false, // Changed from true to false for better alpha blending
      side: DoubleSide,
    });
  }, [color, loadedTextureColor, maskTexture, progress, alpha]);

  useFrame(() => {
    if (!active) return;
    
    // On mobile, keep progress at 1 (always show color image)
    if (isTouchDevice) {
      if (progress !== 1) {
        setProgress(1);
      }
      if (material) {
        material.uniforms.uProgress.value = 1;
        material.uniforms.uAlpha.value = alpha;
      }
    } else {
      // Desktop behavior: animate based on hover
      const animationSpeed = 0.015; // Slightly slower for more dramatic effect
      
      if (isOver && progress < 1) {
        setProgress((prev) => {
          const diff = 1 - prev;
          return prev + diff * animationSpeed * 2; // Faster ease-in
        });
      } else if (!isOver && progress > 0) {
        setProgress((prev) => {
          return prev - animationSpeed;
        });
      }
      
      if (material) {
        material.uniforms.uProgress.value = progress;
        material.uniforms.uAlpha.value = alpha;
      }
    }

    /*
    // Fade in when entering camera frustum
    if (fadeInOnCamera && groupRef.current) {
      const frustum = new THREE.Frustum();
      const camViewProj = new THREE.Matrix4();
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      camViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(camViewProj);
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      const visible = frustum.containsPoint(worldPos);
      setIsVisible(visible);
      setVisibleAlpha((prev) => {
        if (visible && prev < 1) return Math.min(prev + 0.05, 1);
        if (!visible && prev > 0) return Math.max(prev - 0.05, 0);
        return prev;
      });
    } else if (!fadeInOnCamera && visibleAlpha !== 1) {
      setVisibleAlpha(1);
      setIsVisible(true);
    }
    */

    if (billboard && groupRef.current && camera) {
      // Make the group face the camera
      groupRef.current.lookAt(camera.position);
    }
  });

  const onMouseEnter = useCallback(() => {
    if (!isTouchDevice) {
      setIsOver(true);
    }
  }, [isTouchDevice]);

  const onMouseLeave = useCallback(() => {
    if (!isTouchDevice) {
      setIsOver(false);
    }
  }, [isTouchDevice]);

  const handleSpriteClick = useCallback(() => {
    if (label) {
      playEffect('click');
      if (label.imageUrl) {
        openImage(label.imageUrl, label.text);
      }
      markClicked(label.scene, label.id);
    }
  }, [label, playEffect, openImage, markClicked]);


  return (
    <group ref={groupRef} position={position} rotation={rotationInRadians} visible={isVisible}>
      {color && material && (
        <mesh
          position={[0, size[1] / 2, 0]}
          renderOrder={order ?? 1}
          onPointerLeave={onMouseLeave}
          onPointerEnter={onMouseEnter}
          onClick={handleSpriteClick}
        >
          <planeGeometry args={[size[0], size[1]]} />
          <primitive object={material} />
        </mesh>
      )}
      <mesh
        position={[0, size[1] / 2, -0.01]}
        renderOrder={order ?? 1}
        castShadow
        scale={mirrorX ? [-1, 1, 1] : [1, 1, 1]}
        onPointerEnter={onMouseEnter}
        onPointerLeave={onMouseLeave}
        onClick={handleSpriteClick}
      >
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial 
          map={loadedTexture} 
          transparent 
          opacity={alpha * visibleAlpha}
          alphaTest={0.7}
        />
      </mesh>

      {label && (
        <LabelInfo
          id={label.id}
          scene={label.scene}
          position={label.position}
          rotation={label.rotation}
          text={label.text}
          linePosition="left"
          imageUrl={label.imageUrl}
          order={order}
          disableSparkles={label.disableSparkles}
        />
      )}
    </group>
  );
});

export default DynamicSprite;
