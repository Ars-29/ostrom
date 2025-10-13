import { useGLTF } from '@react-three/drei'

export const BushModel = () => {
  const { scene } = useGLTF('/models/base_basic_pbr.glb') // Load the 3D bush model
  return <primitive object={scene} position={[5, 0, -15]} />
}
