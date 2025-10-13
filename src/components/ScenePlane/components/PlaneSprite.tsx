import React from 'react';
import DynamicSprite from '../../DynamicSprite';
import { useScrollProgress } from '../../../contexts/ScrollProgressContext';
import { degToRad } from 'three/src/math/MathUtils.js';

interface PlaneSpriteProps {
  basePosition?: [number, number, number];
  size?: [number, number, number];
  rotation?: [number, number, number];
  order?: number;
  startAt?: number; // percent (0-100)
  duration?: number; // percent (0-100)
  path?: [number, number, number][]; // Array of positions for the path
}

// Cubic Bezier interpolation for 4 points
function cubicBezier(t: number, p0: number[], p1: number[], p2: number[], p3: number[]): [number, number, number] {
  const x =
    Math.pow(1 - t, 3) * p0[0] +
    3 * Math.pow(1 - t, 2) * t * p1[0] +
    3 * (1 - t) * Math.pow(t, 2) * p2[0] +
    Math.pow(t, 3) * p3[0];
  const y =
    Math.pow(1 - t, 3) * p0[1] +
    3 * Math.pow(1 - t, 2) * t * p1[1] +
    3 * (1 - t) * Math.pow(t, 2) * p2[1] +
    Math.pow(t, 3) * p3[1];
  const z =
    Math.pow(1 - t, 3) * p0[2] +
    3 * Math.pow(1 - t, 2) * t * p1[2] +
    3 * (1 - t) * Math.pow(t, 2) * p2[2] +
    Math.pow(t, 3) * p3[2];
  return [x, y, z];
}

// Linear interpolation for 2 points
function lerp3(t: number, a: number[], b: number[]): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// Catmull-Rom spline interpolation for N points
function catmullRomSpline(points: [number, number, number][], t: number): [number, number, number] {
  const n = points.length;
  if (n < 2) return points[0];
  // Clamp t
  t = Math.max(0, Math.min(1, t));
  // Map t to segment
  const segments = n - 1;
  const scaledT = t * segments;
  const segIdx = Math.floor(scaledT);
  const localT = scaledT - segIdx;
  // Get 4 control points for this segment
  const p0 = points[Math.max(0, segIdx - 1)];
  const p1 = points[segIdx];
  const p2 = points[Math.min(segIdx + 1, n - 1)];
  const p3 = points[Math.min(segIdx + 2, n - 1)];
  // Catmull-Rom formula
  const interpolate = (p0: number, p1: number, p2: number, p3: number, t: number) =>
    0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
    );
  return [
    interpolate(p0[0], p1[0], p2[0], p3[0], localT),
    interpolate(p0[1], p1[1], p2[1], p3[1], localT),
    interpolate(p0[2], p1[2], p2[2], p3[2], localT),
  ];
}

// Map scroll progress (0-1) to a t value in [0,1] within the scroll window
function getPathT(scroll: number, startAt: number, duration: number) {
  const start = startAt / 100;
  const end = (startAt + duration) / 100;
  if (scroll < start) return 0;
  if (scroll > end) return 1;
  return (scroll - start) / (end - start);
}

const PlaneSprite: React.FC<PlaneSpriteProps> = ({
  basePosition = [0, 4, 0],
  size = [6.5, 3.2, 1],
  rotation = [0, 0, 5],
  order = 0,
  startAt = 80,
  duration = 10,
  path = [
    [-25, 20, -24],
    [-10, 8, -15],
    [0, 8, 0],
    [10, 5, 10],
  ],
}) => {
  const scroll = useScrollProgress();
  const t = getPathT(scroll, startAt, duration);
  let position: [number, number, number];
  if (path.length >= 4) {
    position = catmullRomSpline(path, t);
  } else if (path.length === 2) {
    position = lerp3(t, path[0], path[1]);
  } else {
    position = basePosition;
  }

  return (
    <>
      <DynamicSprite
        texture="plane/plane.webp"
        order={order}
        position={position}
        rotation={rotation}
        size={size}
        color
        label={{
          id: 'plane-1909',
          scene: 'plane',
          position: [1, 1, 1],
          rotation: [0, 0, 0],
          imageUrl: 'plane/poi/1909.webp',
          text: 'Reaching for the heavens – elevating performance and surpassing expectations.',
          disableSparkles: true, // Disable sparkles for this label
        }}
      />
    </>
  );
};

export default PlaneSprite;
