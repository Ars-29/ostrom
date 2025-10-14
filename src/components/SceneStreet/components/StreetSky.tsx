import React from 'react';
import { Sky } from '@react-three/drei';

interface SkyProps {
  turbidity?: number;
  rayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
  sunPosition?: [number, number, number];
}

const StreetSky: React.FC<SkyProps> = ({
  turbidity = 15,
  rayleigh = 10,
  mieCoefficient = 0.01,
  mieDirectionalG = 0.2,
  sunPosition = [0, 0.54, -12],
}) => {

    return <>
        <Sky 
            turbidity={turbidity}
            rayleigh={rayleigh}
            mieCoefficient={mieCoefficient}
            mieDirectionalG={mieDirectionalG}
            sunPosition={sunPosition}
            inclination={0.1} // Added inclination
            azimuth={1} // Added azimuth
            distance={75} // Adjust the distance as needed
        />
    </>;
};

export default StreetSky;
