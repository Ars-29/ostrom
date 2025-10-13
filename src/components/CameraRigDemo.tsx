// src/components/CameraRig.tsx
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useScrollProgress } from '../contexts/ScrollProgressContext';

const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(10, 3, -10),
  new THREE.Vector3(2, 1.5, -4),
  new THREE.Vector3(10, 0, 5),
  new THREE.Vector3(2, 2, 15),
  new THREE.Vector3(12, 2, 20),
  new THREE.Vector3(2, 2, 37),
  new THREE.Vector3(8, 2, 40),
]);

const rotationPath = [
  new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 50, -Math.PI / 10, 0)), // Look slightly right
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0)), // Look right
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 3, 0)),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 20, 0)),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0)), // Look right
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
];

export const CameraRigDemo = () => {
  const { camera } = useThree();
  const scroll = useScrollProgress();
  const smoothScroll = useRef(scroll);
  const interpolatedQuat = useRef(new THREE.Quaternion()); // Store the interpolated quaternion
  const targetMouseOffset = useRef(new THREE.Vector2(0, 0));
  const currentMouseOffset = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    smoothScroll.current = scroll;
  }, [scroll]); // Synchronize smoothScroll with scroll

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      const newTarget = new THREE.Vector2(x * 1.5, y * 1.5); // Increased scaling from 1.0 to 1.5
      targetMouseOffset.current.copy(newTarget);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    // Smoothly update the camera's position progress
    smoothScroll.current += (scroll - smoothScroll.current) * 0.02;

    const t = smoothScroll.current;
    const position = cameraPath.getPointAt(t);

    // Interpolate rotation using Quaternion.slerp
    const segment = Math.floor(t * (rotationPath.length - 1));
    const segmentT = (t * (rotationPath.length - 1)) % 1;
    const startQuat = rotationPath[segment];
    const endQuat = rotationPath[Math.min(segment + 1, rotationPath.length - 1)];
    interpolatedQuat.current.slerpQuaternions(startQuat, endQuat, segmentT);

    currentMouseOffset.current.lerp(targetMouseOffset.current, 0.005); // Reduced from 0.02 to 0.005

    camera.position.copy(position).add(new THREE.Vector3(
      currentMouseOffset.current.x,
      currentMouseOffset.current.y,
      0
    ));
    camera.quaternion.copy(interpolatedQuat.current); // Apply interpolated rotation
  });

  return null;
};
