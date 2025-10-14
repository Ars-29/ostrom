// src/components/CameraRig.tsx
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useScrollProgress } from '../contexts/ScrollProgressContext';
import { degToRad } from 'three/src/math/MathUtils.js';

const sectionPaths = [
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 11, 4),
    new THREE.Vector3(0, 1, 5),
    new THREE.Vector3(0, 1, 6),
    new THREE.Vector3(0, 1, 22),
    new THREE.Vector3(0, 1.1, 27),
    new THREE.Vector3(0, 1.1, 28),
  ]),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(55, 2, -21),
    new THREE.Vector3(55, 2, -21),
    new THREE.Vector3(60, 2, -22),
    new THREE.Vector3(70, 1.75, -18),
    new THREE.Vector3(62, 2.5, -6),
    new THREE.Vector3(70, 2, -4),
    new THREE.Vector3(77, 1.5, 2),
    new THREE.Vector3(62, 2, 13),
    new THREE.Vector3(62, 2, 19),
    new THREE.Vector3(90, 2, 22),
    new THREE.Vector3(93, 2, 22),
    new THREE.Vector3(94, 2, 38),
    new THREE.Vector3(94, 3, 39),
  ]),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(140, 3, -10),
    new THREE.Vector3(142, 1.5, 0),
    new THREE.Vector3(142, 8, 0),
    new THREE.Vector3(142, 8, 5),
    new THREE.Vector3(149, 1.5, 10),
    new THREE.Vector3(149, 2, 18),
    new THREE.Vector3(150, 1.5, 19),
    new THREE.Vector3(150, 1, 20),
    new THREE.Vector3(150, 2, 21),
  ]),
];

const sectionRotations = [
  [
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(100), 0, 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(45), 0, 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(10), 0, 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), 0, 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, degToRad(0), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, degToRad(0), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(6), degToRad(-22), degToRad(3))),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(6), degToRad(-22), degToRad(3))),
  ],
  [
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(-2), degToRad(-45), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(-10), degToRad(5), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), degToRad(-5), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), degToRad(-20), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), degToRad(0), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), degToRad(20), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), degToRad(-10), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), degToRad(0), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, degToRad(-5), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, degToRad(10), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(-10), degToRad(10), 0)),
  ],
  [
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(20), 0, 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(5), degToRad(-15), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(10), degToRad(-8), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(0), degToRad(-15), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, degToRad(-15), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(-8), degToRad(-10), 0)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(degToRad(-70), degToRad(0), 0)),
  ],
];

export const CameraRig = () => {
  const { camera } = useThree();
  const scroll = useScrollProgress();
  const smoothScroll = useRef(0);
  const currentSectionRef = useRef(0); // Track current section
  const interpolatedQuat = useRef(new THREE.Quaternion());
  const targetMouseOffset = useRef(new THREE.Vector2(0, 0));
  const currentMouseOffset = useRef(new THREE.Vector2(0, 0));

  const isTouchDevice = 'ontouchstart' in window;

  // Fixed section heights in viewport units
  const SECTION_HEIGHTS = {
    intro: 1,       // 100dvh = 1 viewport height
    title1: 0,      // 100dvh = 1 viewport height
    section1: 6,    // 900dvh = 9 viewport heights  
    title2: 0,      // 100dvh = 1 viewport height
    section2: 12,   // 1800dvh = 18 viewport heights
    title3: 0,      // 100dvh = 1 viewport height
    section3: 6     // 900dvh = 9 viewport heights
  };
  
  useEffect(() => {
    if (!isTouchDevice) {
      const handleMouseMove = (event: MouseEvent) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        const newTarget = new THREE.Vector2(x * 1.5, y * 1.5);
        targetMouseOffset.current.copy(newTarget);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Memoize expensive calculations
  const sectionBoundaries = useMemo(() => {
    const introEnd = SECTION_HEIGHTS.intro;
    const title1End = introEnd + SECTION_HEIGHTS.title1;
    const section1End = title1End + SECTION_HEIGHTS.section1;
    const title2End = section1End + SECTION_HEIGHTS.title2;
    const section2End = title2End + SECTION_HEIGHTS.section2;
    const title3End = section2End + SECTION_HEIGHTS.title3;
    const section3End = title3End + SECTION_HEIGHTS.section3;
    
    return {
      introEnd,
      title1End,
      section1End,
      title2End,
      section2End,
      title3End,
      section3End
    };
  }, []);

  const CAMERA_MOVE_RATIOS = useMemo(() => [0.8, 0.9, 1], []);

  useFrame(() => {
    // Calculate total scroll progress (0 to 1) - cache expensive calculations
    const totalScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScrollY = scroll * totalScrollableHeight;
    
    // Convert to viewport heights scrolled
    const viewportHeightsScrolled = currentScrollY / window.innerHeight;
    
    // Define section boundaries in viewport heights
    const { introEnd, title1End, section1End, title2End, section2End, title3End, section3End } = sectionBoundaries;
    
    // Determine current section and progress within that section
    let currentSection = 0;
    let sectionProgress = 0;

    if (viewportHeightsScrolled < introEnd) {
      currentSection = 0;
      sectionProgress = 0;
    } else if (viewportHeightsScrolled < title1End) {
      currentSection = 0;
      sectionProgress = 0;
    } else if (viewportHeightsScrolled < section1End) {
      currentSection = 0;
      const localScroll = (viewportHeightsScrolled - title1End) / SECTION_HEIGHTS.section1;
      const ratio = CAMERA_MOVE_RATIOS[0];
      if (localScroll < ratio) {
        sectionProgress = localScroll / ratio;
      } else {
        sectionProgress = 1;
      }
    } else if (viewportHeightsScrolled < title2End) {
      currentSection = 0;
      sectionProgress = 1;
    } else if (viewportHeightsScrolled < section2End) {
      currentSection = 1;
      const localScroll = (viewportHeightsScrolled - title2End) / SECTION_HEIGHTS.section2;
      const ratio = CAMERA_MOVE_RATIOS[1];
      if (localScroll < ratio) {
        sectionProgress = localScroll / ratio;
      } else {
        sectionProgress = 1;
      }
    } else if (viewportHeightsScrolled < title3End) {
      currentSection = 1;
      sectionProgress = 1;
    } else if (viewportHeightsScrolled < section3End) {
      currentSection = 2;
      const localScroll = (viewportHeightsScrolled - title3End) / SECTION_HEIGHTS.section3;
      const ratio = CAMERA_MOVE_RATIOS[2];
      if (localScroll < ratio) {
        sectionProgress = localScroll / ratio;
      } else {
        sectionProgress = 1;
      }
    } else {
      currentSection = 2;
      sectionProgress = 1;
    }
    
    // Check if section changed - if so, reset smooth scroll to jump directly
    if (currentSection !== currentSectionRef.current) {
      currentSectionRef.current = currentSection;
      smoothScroll.current = sectionProgress; // Jump directly to new section progress
    }
    
    // Smooth the progress within the current section only
    const targetProgress = Math.max(0, Math.min(1, sectionProgress));
    smoothScroll.current += (targetProgress - smoothScroll.current) * 0.2;
    const clampedProgress = Math.max(0, Math.min(1, smoothScroll.current));
    
    // Debug logging (remove in production)
    if (Math.random() < 0.01) { // Log occasionally to avoid spam
      // console.log(`Camera Debug - VH: ${viewportHeightsScrolled.toFixed(1)}, Section: ${currentSection}, Progress: ${clampedProgress.toFixed(3)}`);
    }
    
    const currentPath = sectionPaths[currentSection];
    const currentRotations = sectionRotations[currentSection];
    
    // Get position
    const position = currentPath.getPointAt(clampedProgress);
    
    // Get rotation
    const rotationIndex = Math.floor(clampedProgress * (currentRotations.length - 1));
    const nextRotationIndex = Math.min(rotationIndex + 1, currentRotations.length - 1);
    const rotationProgress = (clampedProgress * (currentRotations.length - 1)) % 1;
    
    const startQuat = currentRotations[rotationIndex];
    const endQuat = currentRotations[nextRotationIndex];
    interpolatedQuat.current.slerpQuaternions(startQuat, endQuat, rotationProgress);
    
    // Mouse movement
    currentMouseOffset.current.lerp(targetMouseOffset.current, 0.005);
    
    // Apply mouse rotation
    const maxYaw = 0.10;
    const maxPitch = 0.10;
    const mouseYaw = -currentMouseOffset.current.x * maxYaw;
    const mousePitch = currentMouseOffset.current.y * maxPitch;
    const mouseEuler = new THREE.Euler(mousePitch, mouseYaw, 0, 'YXZ');
    const mouseQuat = new THREE.Quaternion().setFromEuler(mouseEuler);
    const finalQuat = interpolatedQuat.current.clone().multiply(mouseQuat);
    
    // Update camera
    camera.position.copy(position).add(new THREE.Vector3(
      currentMouseOffset.current.x,
      currentMouseOffset.current.y / 3,
      0
    ));
    camera.quaternion.copy(finalQuat);
  });

  return null;
};
