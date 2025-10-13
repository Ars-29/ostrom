import { useState, useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Initial path and rotation data (copy from CameraRig for editing)
const initialSectionPaths = [
  [
    [0, 10, 1],
    [0, 1, 4],
    [0, 1, 6],
    [0, 1, 20],
    [0, 0.75, 30],
  ],
  [
    [70, 45, -30],
    [75, 5, -15],
    [70, 3, 0],
    [76, 2, 15],
  ],
  [
    [140, 3, -10],
    [142, 1.5, 0],
    [142, 8, 0],
    [142, 8, 5],
    [150, 0.75, 10],
    [150, 2, 20],
    [150, 2, 25],
    [150, 4, 25],
  ],
];

interface CameraEditorProps {
  onDraggingChange?: (dragging: boolean) => void;
  onExportReady?: (exportFn: () => void) => void;
}

const CameraEditor = ({ onDraggingChange, onExportReady }: CameraEditorProps) => {
  const [paths, setPaths] = useState(initialSectionPaths.map(section => section.map(p => [...p])));
  const controlsRefs = useRef<any[][]>([]);
  const meshRefs = useRef<any[][]>([]);
  const { camera, gl } = useThree();

  // Handler for dragging a point
  const handleDrag = (sectionIdx: number, pointIdx: number, pos: THREE.Vector3) => {
    setPaths(paths => {
      const newPaths = paths.map(arr => arr.map(p => [...p]));
      newPaths[sectionIdx][pointIdx] = [pos.x, pos.y, pos.z];
      return newPaths;
    });
  };

  // Expose export function to parent
  useEffect(() => {
    if (onExportReady) {
      onExportReady(() => {
        const json = JSON.stringify(paths, null, 2);
        navigator.clipboard.writeText(json);
        // alert('Camera path copied to clipboard!');
      });
    }
  }, [paths, onExportReady]);

  useEffect(() => {
    // Attach dragging-changed listeners
    controlsRefs.current.forEach(section => {
      section.forEach(ctrl => {
        if (ctrl && ctrl.addEventListener) {
          const handler = (event: any) => {
            if (onDraggingChange) { onDraggingChange(event.value); }
          };
          ctrl.addEventListener('dragging-changed', handler);
          // Clean up
          return () => ctrl.removeEventListener('dragging-changed', handler);
        }
      });
    });
  }, [paths, onDraggingChange]);

  return (
    <>
      {paths.map((section, sectionIdx) => (
        <group key={sectionIdx}>
          {section.map((point, pointIdx) => {
            const pos: [number, number, number] = [
              point[0] ?? 0,
              point[1] ?? 0,
              point[2] ?? 0,
            ];
            if (!controlsRefs.current[sectionIdx]) controlsRefs.current[sectionIdx] = [];
            if (!meshRefs.current[sectionIdx]) meshRefs.current[sectionIdx] = [];
            return (
              <TransformControls
                key={pointIdx}
                ref={ref => { controlsRefs.current[sectionIdx][pointIdx] = ref; }}
                object={meshRefs.current[sectionIdx][pointIdx]}
                camera={camera}
                domElement={gl.domElement}
                showX showY showZ
                onObjectChange={obj => {
                  if (obj && 'position' in obj) {
                    const position = (obj as any).position as THREE.Vector3;
                    handleDrag(sectionIdx, pointIdx, position);
                  }
                }}
              >
                <mesh
                  ref={ref => { meshRefs.current[sectionIdx][pointIdx] = ref; }}
                  position={pos}
                >
                  <sphereGeometry args={[0.5, 16, 16]} />
                  <meshStandardMaterial color={['#ff0000', '#00ff00', '#0000ff'][sectionIdx % 3]} />
                </mesh>
              </TransformControls>
            );
          })}
        </group>
      ))}
    </>
  );
};

export default CameraEditor;
