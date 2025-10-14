import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// WASD/ZQSD key mapping
const KEY_BINDINGS = {
  forward: ['w', 'z', 'ArrowUp'],
  backward: ['s', 'ArrowDown'],
  left: ['a', 'q', 'ArrowLeft'],
  right: ['d', 'ArrowRight'],
  jump: [' '],
  crouch: ['control'],
  run: ['shift'],
};

const SPEED = 0.12;
const RUN_SPEED = 0.28;
const CROUCH_SPEED = 0.07;

interface FPSCameraProps {
  disabled?: boolean;
}

export const FPSCamera = ({ disabled }: FPSCameraProps) => {
  const { camera } = useThree();
  const direction = useRef(new THREE.Vector3());
  const keys = useRef<{ [key: string]: boolean }>({});
  const pitch = useRef(0);
  const yaw = useRef(0);
  const pointerLocked = useRef(false);

  // Mouse look
  const onMouseMove = useCallback((event: MouseEvent) => {
    if (disabled || !pointerLocked.current) return;
    yaw.current -= event.movementX * 0.002;
    pitch.current -= event.movementY * 0.002;
    pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
  }, [disabled]);

  // Pointer lock
  useEffect(() => {
    if (disabled) return;
    const handlePointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement !== null;
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, [disabled]);

  // Keyboard controls
  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled]);

  // Mouse look event
  useEffect(() => {
    if (disabled) return;
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove, disabled]);

  // Click to lock pointer
  useEffect(() => {
    if (disabled) return;
    const handleClick = () => {
      if (!pointerLocked.current) {
        document.body.requestPointerLock();
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [disabled]);

  // FPS camera logic
  useFrame(() => {
    if (disabled) return;
    // Movement direction
    direction.current.set(0, 0, 0);
    if (KEY_BINDINGS.forward.some(k => keys.current[k])) direction.current.z -= 1;
    if (KEY_BINDINGS.backward.some(k => keys.current[k])) direction.current.z += 1;
    if (KEY_BINDINGS.left.some(k => keys.current[k])) direction.current.x -= 1;
    if (KEY_BINDINGS.right.some(k => keys.current[k])) direction.current.x += 1;
    direction.current.normalize();

    // Determine speed
    let speed = SPEED;
    if (KEY_BINDINGS.run.some(k => keys.current[k])) speed = RUN_SPEED;
    if (KEY_BINDINGS.crouch.some(k => keys.current[k])) speed = CROUCH_SPEED;

    // Apply rotation to direction
    const move = new THREE.Vector3(direction.current.x, 0, direction.current.z)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)
      .multiplyScalar(speed);

    camera.position.x += move.x;
    camera.position.z += move.z;

    // --- UP/DOWN movement (fly mode) ---
    if (KEY_BINDINGS.jump.some(k => keys.current[k])) {
      camera.position.y += speed; // Go up while holding Space
    }
    if (KEY_BINDINGS.crouch.some(k => keys.current[k])) {
      camera.position.y -= speed; // Go down while holding CTRL
    }

    // Camera rotation
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
  });

  return null;
};

export default FPSCamera;
