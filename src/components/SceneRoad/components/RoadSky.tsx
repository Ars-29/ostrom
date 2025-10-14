import React from 'react';
import { Sky } from '@react-three/drei';

interface SkyProps {
  turbidity?: number;
  rayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
  sunPosition?: [number, number, number];
}

const RoadSky: React.FC<SkyProps> = ({
  turbidity = 2, // Lower for clearer blue sky
  rayleigh = 3,  // Higher for more blue
  mieCoefficient = 0.005, // Lower for less haze
  mieDirectionalG = 0.8, // Higher for sharper sun
  sunPosition = [0, 1, 0], // Overhead sun for blue sky
}) => {

    return <>
        <Sky 
            turbidity={turbidity}
            rayleigh={rayleigh}
            mieCoefficient={mieCoefficient}
            mieDirectionalG={mieDirectionalG}
            sunPosition={sunPosition}
            inclination={0.1}
            azimuth={1}
            distance={40}
        />
    </>;
};

export default RoadSky;
