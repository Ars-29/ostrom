/**
 * Device-Aware Sky Component
 * Automatically chooses between complex Sky and simple SkySphere based on device capabilities
 */

import React, { useEffect, useState } from 'react';
import { Sky } from '@react-three/drei';
import SkySphere from './SkySphere';

interface DeviceAwareSkyProps {
  turbidity?: number;
  rayleigh?: number;
  mieCoefficient?: number;
  mieDirectionalG?: number;
  sunPosition?: [number, number, number];
  scene?: string | null;
}

const DeviceAwareSky: React.FC<DeviceAwareSkyProps> = ({
  turbidity = 10,
  rayleigh = 10,
  mieCoefficient = 0.015,
  mieDirectionalG = 0.55,
  sunPosition = [10, 1, -8],
  scene = null,
}) => {
  const [useComplexSky, setUseComplexSky] = useState(true);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectDeviceCapabilities = () => {
      try {
        // Check if we're on a mobile device
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) {
          // Desktop - use complex sky
          setUseComplexSky(true);
          setIsDetecting(false);
          console.log('🖥️ [DeviceAwareSky] Desktop detected - using complex Sky');
          return;
        }

        // Mobile device - test WebGL capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
          // No WebGL support - use simple sky
          setUseComplexSky(false);
          setIsDetecting(false);
          console.log('📱 [DeviceAwareSky] No WebGL support - using simple SkySphere');
          return;
        }

        // Test for advanced shader support
        const extensions = [
          'WEBGL_compressed_texture_astc',
          'WEBGL_compressed_texture_s3tc',
          'WEBGL_compressed_texture_etc1',
          'WEBGL_compressed_texture_etc',
          'OES_texture_float',
          'OES_texture_half_float'
        ];

        const supportedExtensions = extensions.filter(ext => gl.getExtension(ext));
        
        // Check GPU memory and performance
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        const maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        
        // Determine if device can handle complex sky
        const hasAdvancedFeatures = supportedExtensions.length >= 2;
        const hasGoodMemory = maxTextureSize >= 2048;
        const hasGoodPerformance = maxVertexAttribs >= 16 && maxFragmentUniforms >= 16;
        
        const canHandleComplexSky = hasAdvancedFeatures && hasGoodMemory && hasGoodPerformance;
        
        if (canHandleComplexSky) {
          setUseComplexSky(true);
          console.log('📱 [DeviceAwareSky] High-end mobile detected - using complex Sky');
        } else {
          setUseComplexSky(false);
          console.log('📱 [DeviceAwareSky] Low-end mobile detected - using simple SkySphere');
        }
        
        setIsDetecting(false);
        
      } catch (error) {
        console.warn('⚠️ [DeviceAwareSky] Error detecting capabilities, falling back to simple sky:', error);
        setUseComplexSky(false);
        setIsDetecting(false);
      }
    };

    // Small delay to ensure WebGL context is ready
    const timeoutId = setTimeout(detectDeviceCapabilities, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Show loading state while detecting
  if (isDetecting) {
    return <SkySphere />; // Fallback to simple sky during detection
  }

  // Use complex Sky for capable devices
  if (useComplexSky) {
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

    return <Sky {...skyProps} />;
  }

  // Use simple SkySphere for low-end devices
  return <SkySphere />;
};

export default DeviceAwareSky;
