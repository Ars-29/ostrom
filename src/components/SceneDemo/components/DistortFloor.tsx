import { useLoader, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { RepeatWrapping, TextureLoader, ShaderMaterial } from 'three';
import { Plane } from '@react-three/drei';

export const DistortFloor = () => {

  const texture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/Ground_Dirt_009_BaseColor.jpg`);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 4);

  const displacementMap = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/floor_heightmap.png`);
  const normalMap = useLoader(TextureLoader, `${import.meta.env.BASE_URL}images/Ground_Dirt_009_Normal.jpg`);
  normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
  normalMap.repeat.set(4, 4);

  const fluidMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uDisplacementMap: { value: displacementMap },
        uNormalMap: { value: normalMap },
        uMouse: { value: [0.5, 0.5] },
        uMouseRadius: { value: 0.2 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform sampler2D uDisplacementMap;

        void main() {
          vUv = uv;
          vNormal = normal;

          // Apply displacement map for volume
          vec3 displacedPosition = position + normal * texture2D(uDisplacementMap, uv).r * 3.0;
          vPosition = displacedPosition;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uTexture;
        uniform sampler2D uNormalMap;
        uniform vec2 uMouse;
        uniform float uMouseRadius;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec2 uv = vUv;

          // Calculate distance from mouse position
          float distance = length(uv - uMouse);

          // Apply fluid-like distortion only within a radius around the mouse
          if (distance < uMouseRadius) {
            uv.y += sin(uv.x * 10.0 + uTime) * 0.01 * (1.0 - distance / uMouseRadius);
          }

          // Sample texture and normal map
          vec4 color = texture2D(uTexture, uv);
          vec3 normal = texture2D(uNormalMap, uv).rgb * 2.0 - 1.0;

          // Adjust lighting to preserve texture brightness
          vec3 lightDirection = normalize(vec3(0.5, 1.0, 0.5));
          float lightIntensity = max(dot(normal, lightDirection), 0.3);
          color.rgb *= lightIntensity;

          gl_FragColor = color;
        }
      `,
    });
  }, [texture, displacementMap, normalMap]);

  useFrame(({ clock, mouse: threeMouse }) => {
    fluidMaterial.uniforms.uTime.value = clock.getElapsedTime();

    // Convert mouse position from NDC (-1 to 1) to UV space (0 to 1)
    const x = (threeMouse.x + 1) / 2;
    const y = (1 - threeMouse.y) / 2; // Invert Y-axis for UV space
    fluidMaterial.uniforms.uMouse.value = [x, y];
  });

  return (
    <Plane 
      args={[75, 75, 256, 256]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow 
      position={[0, -2, 0]}
    >
      <primitive attach="material" object={fluidMaterial} />
    </Plane>
  );
};
