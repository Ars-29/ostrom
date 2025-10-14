import React, { useEffect } from 'react';
import { Sky } from '@react-three/drei';

interface SkyProps {
  turbidity?: number;
  rayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
  sunPosition?: [number, number, number];
  scene?: string | null; // Add scene prop
}

const MainSky: React.FC<SkyProps> = ({
  turbidity = 10,
  rayleigh = 10,
  mieCoefficient = 0.015,
  mieDirectionalG = 0.55,
  sunPosition = [10, 1, -8],
  scene = null,
}) => {

    useEffect(() => {
      console.log("Setting dynamic sun position based on scene:", scene);
    }, [scene]);

    // Set sky parameters based on scene
    let skyProps = {
      turbidity,
      rayleigh,
      mieCoefficient,
      mieDirectionalG,
      sunPosition: sunPosition,
      inclination: 0.49,
      azimuth: 0.25,
    };
    if (scene === 'section-2') {
      skyProps = {
        ...skyProps,
        turbidity: 0.4,
        rayleigh: 0.25,
        mieCoefficient: 0.002,
        mieDirectionalG: 0.7,
        sunPosition: [10, 3, -12],
        inclination: 0.49,
        azimuth: 0.25,
      };
    } else if (scene === 'section-1') {
      skyProps = {
        ...skyProps,
        turbidity: 6,
        rayleigh: 3.5,
        mieCoefficient: 0.01,
        mieDirectionalG: 1,
        sunPosition: [10, 1, -8],
        inclination: 0.45 * 0.05,
        azimuth: 0.2 * 0.03,
      };
    } else if (scene === 'section-3') {
      skyProps = {
        ...skyProps,
        turbidity: 6,
        rayleigh: 0.9,
        mieCoefficient: 0.001,
        mieDirectionalG: 0.9995,
        sunPosition: [8, 4, -9],
        inclination: 0.5 * 0.05,
        azimuth: 0.4 * 0.03,
      };
    }

    return <>
        <Sky 
            {...skyProps}
        />
    </>;
};

export default MainSky;
