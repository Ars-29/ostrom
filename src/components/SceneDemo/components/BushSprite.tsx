import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { animate } from 'framer-motion';
import { useScrollProgress } from '../../../contexts/ScrollProgressContext';
import { degToRad } from 'three/src/math/MathUtils.js';
import { ShaderMaterial } from 'three';

type BushSpriteProps = {
  textureUrl: string,
  position: [number, number, number],
  size?: [number, number],
  rotation?: [number, number, number],
  triggerY?: number,
}

interface GrainDistortionMaterialUniforms {
  [key: string]: THREE.IUniform<any>;
  uTime: { value: number };
  uTexture: { value: THREE.Texture };
  uMouse: { value: THREE.Vector2 };
  uMouseOver: { value: number };
  uDisplacementMap: { value: THREE.Texture | null };
  uNormalMap: { value: THREE.Texture | null };
  uFogColor: { value: THREE.Color };
  uFogNear: { value: number };
  uFogFar: { value: number };
}

const createGrainDistortionMaterial = (texture: THREE.Texture): ShaderMaterial => {
  const uniforms: GrainDistortionMaterialUniforms = {
    uTime: { value: 0 },
    uTexture: { value: texture },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uMouseOver: { value: 0.0 },
    uDisplacementMap: { value: null },
    uNormalMap: { value: null },
    uFogColor: { value: new THREE.Color('#EEE') },
    uFogNear: { value: 1 },
    uFogFar: { value: 60 },
  };

  return new ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vFogDepth;
      uniform sampler2D uDisplacementMap;

      void main() {
        vUv = uv;
        vNormal = normal;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vFogDepth = -mvPosition.z;

        vec3 displacedPosition = position + normal * texture2D(uDisplacementMap, uv).r * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform float uMouseOver;
      uniform vec3 uFogColor;
      uniform float uFogNear;
      uniform float uFogFar;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vFogDepth;

      void main() {
        vec2 rippleCenter = uMouse;
        float distance = length(vUv - rippleCenter);
        float ripple = uMouseOver * sin((distance - uTime * 1.0) * 5.0) * 0.001; // Reduced ripple effect and centered on mouse
        vec2 distortedUv = vUv + normalize(vUv - rippleCenter) * ripple;

        vec4 color = texture2D(uTexture, distortedUv);

        float fogFactor = clamp((vFogDepth - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
        color.rgb = mix(color.rgb, uFogColor, fogFactor);

        gl_FragColor = color;
      }
    `,
    transparent: true,
  });
};

export const BushSprite: React.FC<BushSpriteProps> = ({ textureUrl, position, size = [1, 1], rotation = [0, 0, 0], triggerY }) => {
  const texture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + textureUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef(createGrainDistortionMaterial(texture)); // Unique material instance

  const scroll = useScrollProgress();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      geometry.center();
      geometry.translate(0, size[1] / 2, 0);
    }
  }, [size]);

  useEffect(() => {
    if (triggerY && scroll >= triggerY && !hasTriggered) {
      setHasTriggered(true);
      if (meshRef.current) {
          animate(meshRef.current.rotation, 
              { x: degToRad(0) },
              { duration: 4, ease: "backOut", delay: 1 }
          );
          animate(meshRef.current.material, 
              { opacity: 1 },
              { duration: 2, ease: "linear" }
          );
      }
    }
  }, [scroll, triggerY, hasTriggered, animate]);

  useFrame(({ clock, mouse: threeMouse, camera }) => {
    const material = materialRef.current;
    material.uniforms.uTime.value = clock.getElapsedTime();

    const x = (threeMouse.x + 1) / 2;
    const y = (1 - threeMouse.y) / 2;
    material.uniforms.uMouse.value.set(x, y);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(threeMouse, camera);
    const intersects = meshRef.current ? raycaster.intersectObject(meshRef.current) : [];

    material.uniforms.uMouseOver.value = intersects.length > 0 ? 1.0 : 0.0;
  });

  return (
    <group rotation={rotation} position={position}>
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        receiveShadow
        castShadow
        rotation={[triggerY ? degToRad(-89) : 0, 0, 0]}
      >
        <planeGeometry args={size} />
        <primitive attach="material" object={materialRef.current} />
      </mesh>
    </group>
  );
};
