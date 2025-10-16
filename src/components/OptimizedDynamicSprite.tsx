/**
 * Optimized DynamicSprite with Instanced Rendering
 * Uses instanced rendering for massive performance improvements
 */

import React, { useCallback, useMemo, useState, memo, useEffect, useRef } from 'react';
import { TextureLoader, ShaderMaterial, DoubleSide } from 'three';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import LabelInfo from './LabelInfo';
import { useOverlayImage } from '../contexts/OverlayImageContext';
import { useLabelInfo } from '../contexts/LabelInfoContext';
import { useSound } from '../contexts/SoundContext';
import { getMobileAssetRouter } from '../utils/MobileAssetRouter';
import { getInstancedRenderingSystem } from '../utils/InstancedRenderingSystem';
import { getFrustumCullingSystem } from '../utils/FrustumCullingSystem';
import { getVirtualScrollingSystem } from '../utils/VirtualScrollingSystem';

interface OptimizedDynamicSpriteProps {
  texture: string;
  size: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  order?: number;
  alpha?: number;
  fadeInOnCamera?: boolean;
  color?: boolean;
  billboard?: boolean;
  mirrorX?: boolean;
  active?: boolean;
  priority?: 'critical' | 'important' | 'decorative';
  useInstancedRendering?: boolean;
  useFrustumCulling?: boolean;
  useVirtualScrolling?: boolean;
  label?: {
    id: string;
    scene: string;
    position: [number, number, number];
    rotation: [number, number, number];
    imageUrl: string;
    text: string;
    disableSparkles?: boolean;
  }
}

const OptimizedDynamicSprite: React.FC<OptimizedDynamicSpriteProps> = memo(({ 
  texture, size, position, rotation, order, alpha = 1, fadeInOnCamera = false,
  color = false, billboard = false, mirrorX = false, active = true, 
  priority = 'decorative', useInstancedRendering = true, useFrustumCulling = true, 
  useVirtualScrolling = true, label 
}) => {
  // Enhanced mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Get optimization systems
  const assetRouter = getMobileAssetRouter();
  const instancedSystem = getInstancedRenderingSystem();
  const frustumSystem = getFrustumCullingSystem();
  const virtualSystem = getVirtualScrollingSystem();
  
  // Get optimized asset paths
  const optimizedTexturePath = assetRouter.getAssetPath(`images/${texture}`);
  const optimizedColorPath = color ? assetRouter.getAssetPath(`images/${texture.replace('.webp', '_color.webp')}`) : null;
  const optimizedMaskPath = color ? assetRouter.getAssetPath('images/mask3.png') : null;
  
  const { camera } = useThree();
  const { openImage } = useOverlayImage();
  const { markClicked } = useLabelInfo();
  const { playEffect } = useSound();
  
  const groupRef = React.useRef<THREE.Group>(null);
  const instanceIdRef = useRef<string>('');
  const isTouchDevice = 'ontouchstart' in window;
  
  const [isOver, setIsOver] = useState(false);
  const [progress, setProgress] = useState(isTouchDevice || isMobile ? 1 : 0);
  const [visibleAlpha] = useState(fadeInOnCamera ? 1 : 1);
  const [isVisible] = useState(true);
  const [isInstanced] = useState(useInstancedRendering && !color); // Don't use instancing for color sprites

  // Initialize optimization systems
  useEffect(() => {
    if (camera) {
      frustumSystem.setCamera(camera);
      virtualSystem.setCamera(camera);
    }
  }, [camera, frustumSystem, virtualSystem]);

  // Add to virtual scrolling system
  useEffect(() => {
    if (useVirtualScrolling) {
      virtualSystem.addVirtualSprite(
        `sprite_${texture}_${position.join('_')}`,
        texture,
        position,
        rotation,
        size,
        alpha,
        order || 1,
        priority
      );
    }

    return () => {
      if (useVirtualScrolling) {
        virtualSystem.removeVirtualSprite(`sprite_${texture}_${position.join('_')}`);
      }
    };
  }, [texture, position, rotation, size, alpha, order, priority, useVirtualScrolling, virtualSystem]);

  // Add to frustum culling system
  useEffect(() => {
    if (useFrustumCulling) {
      frustumSystem.addObject(`sprite_${texture}_${position.join('_')}`, position, size);
    }

    return () => {
      if (useFrustumCulling) {
        frustumSystem.removeObject(`sprite_${texture}_${position.join('_')}`);
      }
    };
  }, [texture, position, size, useFrustumCulling, frustumSystem]);

  // Add to instanced rendering system
  useEffect(() => {
    if (isInstanced && useInstancedRendering) {
      const instanceId = instancedSystem.addSpriteInstance(
        texture,
        position,
        rotation,
        size,
        alpha,
        order || 1
      );
      instanceIdRef.current = instanceId;
    }
  }, [texture, position, rotation, size, alpha, order, isInstanced, useInstancedRendering, instancedSystem]);

  // Update instanced sprite
  useEffect(() => {
    if (isInstanced && instanceIdRef.current) {
      instancedSystem.updateSpriteInstance(instanceIdRef.current, {
        position,
        rotation,
        scale: size,
        alpha,
        visible: active && isVisible
      });
    }
  }, [position, rotation, size, alpha, active, isVisible, isInstanced, instancedSystem]);

  // Load textures for non-instanced sprites
  const loadedTexture = useLoader(TextureLoader, import.meta.env.BASE_URL + optimizedTexturePath);
  
  const loadedTextureColor = color && optimizedColorPath
    ? useLoader(TextureLoader, import.meta.env.BASE_URL + optimizedColorPath)
    : null;
  const maskTexture = color && optimizedMaskPath
    ? useLoader(TextureLoader, import.meta.env.BASE_URL + optimizedMaskPath)
    : null;

  const rotationInRadians = useMemo(() => {
    return rotation.map((angle) => angle * (Math.PI / 180)) as [number, number, number];
  }, [rotation]);

  // Shader material for color effects (only for non-instanced sprites)
  const material = useMemo(() => {
    if (!color || isInstanced) return null;
    return new ShaderMaterial({
      uniforms: {
        uTexture: { value: loadedTextureColor },
        uMask: { value: maskTexture },
        uProgress: { value: progress },
        uAlpha: { value: alpha },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform sampler2D uMask;
        uniform float uProgress;
        uniform float uAlpha;
        varying vec2 vUv;
        void main() {
          vec4 maskColor = texture2D(uMask, vUv);
          vec4 textureColor = texture2D(uTexture, vUv);
          float maskIntensity = dot(maskColor.rgb, vec3(0.299, 0.587, 0.114));
          float easedProgress = uProgress * uProgress * (3.0 - 2.0 * uProgress);
          float threshold = 1.0 - easedProgress;
          float primaryMask = smoothstep(threshold - 0.2, threshold + 0.1, maskIntensity);
          float secondaryMask = smoothstep(threshold - 0.3, threshold + 0.2, maskIntensity * 0.8);
          float maskValue = mix(secondaryMask, primaryMask, 0.7);
          vec3 enhancedColor = textureColor.rgb;
          enhancedColor = pow(enhancedColor, vec3(1.1));
          enhancedColor *= 0.7;
          float luminance = dot(enhancedColor, vec3(0.299, 0.587, 0.114));
          enhancedColor = mix(vec3(luminance), enhancedColor, 1.2);
          enhancedColor = clamp(enhancedColor, 0.0, 1.0);
          float edge = 1.0 - smoothstep(0.0, 0.4, abs(maskValue - 0.5) * 2.0);
          enhancedColor += edge * 0.08 * vec3(1.0, 0.95, 0.9);
          if (uProgress >= 0.99) {
            maskValue = 1.0;
          }
          gl_FragColor = vec4(enhancedColor, textureColor.a * maskValue * uAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
  }, [color, loadedTextureColor, maskTexture, progress, alpha, isInstanced]);

  // Update frame logic
  useFrame(() => {
    if (!active) return;
    
    // Mobile optimization: Skip expensive animations and calculations
    if (isMobile || isTouchDevice) {
      // Direct material updates without React state changes
      if (material) {
        material.uniforms.uProgress.value = 1;
        material.uniforms.uAlpha.value = alpha;
      }
      
      // Skip billboard calculations on mobile for performance
      if (billboard && groupRef.current && camera && !isMobile) {
        groupRef.current.lookAt(camera.position);
      }
      return;
    }
    
    // Desktop behavior: animate based on hover
    const animationSpeed = 0.015;
    
    if (isOver && progress < 1) {
      setProgress((prev) => {
        const diff = 1 - prev;
        return prev + diff * animationSpeed * 2;
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

    // Billboard effect (only on desktop)
    if (billboard && groupRef.current && camera && !isMobile) {
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

  // If using instanced rendering, don't render individual mesh
  if (isInstanced) {
    return (
      <group ref={groupRef} position={position} rotation={rotationInRadians} visible={isVisible}>
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
  }

  // Render individual mesh for color sprites or when instancing is disabled
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

export default OptimizedDynamicSprite;

