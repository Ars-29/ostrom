import React from 'react';
// Use correct props for group
import DynamicSprite from '../DynamicSprite';

interface StreetLampProps extends React.ComponentProps<'group'> {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number];
  lightColor?: string | number;
  lightIntensity?: number;
}

const StreetLamp: React.FC<StreetLampProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [0.25,2,1],
  lightColor = 0xfff8e7,
  lightIntensity = 6,
  ...props
}) => {
  return (
    <group position={position} rotation={rotation} {...props}>
      <DynamicSprite
        texture="street/streetlamp-secondplan.webp"
        order={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        size={size}
      />
      {/* Light at the top of the lamp */}
      <pointLight
        position={[0.1, size[1] - 0.3, 0.1]}
        color={lightColor}
        intensity={lightIntensity}
        distance={6}
        decay={1}
        castShadow={false}
      />
      {/* Optional: small sphere to visualize the bulb */}
      <mesh position={[0, size[1] / 2, 0.1]}>
        <meshBasicMaterial color={lightColor} />
      </mesh>
    </group>
  );
};

export default StreetLamp;
