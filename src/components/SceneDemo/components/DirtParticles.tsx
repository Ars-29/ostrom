import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import vertexShader from '../../../shaders/particle.vert'
import fragmentShader from '../../../shaders/particle.frag'

type DirtProps = {
  position: [number, number, number],
  active: boolean,
}

export const DirtParticles: React.FC<DirtProps> = forwardRef(
  ({ position, active }, ref) => {
    const count = useMemo(() => 50, [])
    const pointsRef = useRef<THREE.Points>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const startParticlePosition = useMemo(() => [0, 0, 0], [])

    const texture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}images/smoke.png`)

    useImperativeHandle(ref, () => materialRef.current)

    // Generate geometry + attributes
    const { geometry } = useMemo(() => {
      const geometry = new THREE.BufferGeometry()

      const positions = new Float32Array(count * 3)
      const velocities = new Float32Array(count * 3)
      const alphas = new Float32Array(count)
      const sizes = new Float32Array(count)

      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = startParticlePosition[0]
        positions[i * 3 + 1] = startParticlePosition[1]
        positions[i * 3 + 2] = startParticlePosition[2]

        velocities[i * 3 + 0] = Math.random() * 0.02 + 0.01 // Move to the right
        velocities[i * 3 + 1] = Math.random() * 0.01 + 0.01 // Move slightly up
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02 // Slight random z-axis movement

        alphas[i] = 0.5
        sizes[i] = Math.random() * 5 + 1
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
      geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

      return { geometry }
    }, [count, startParticlePosition])

    // Animate alpha, size, and position per particle
    useFrame(() => {
      if (!pointsRef.current || !materialRef.current) return

      // Update the uniform for global opacity
      materialRef.current.uniforms.uOpacity.value = 0.8 // Replace 0.4 with a dynamic value if needed

      const positions = geometry.getAttribute('position') as THREE.BufferAttribute
      const velocities = geometry.getAttribute('velocity') as THREE.BufferAttribute
      const aAlpha = geometry.getAttribute('aAlpha') as THREE.BufferAttribute
      const aSize = geometry.getAttribute('aSize') as THREE.BufferAttribute

      for (let i = 0; i < count; i++) {
        positions.array[i * 3 + 0] += velocities.array[i * 3 + 0] // Update x position
        positions.array[i * 3 + 1] += velocities.array[i * 3 + 1] // Update y position
        positions.array[i * 3 + 2] += velocities.array[i * 3 + 2] // Update z position

        aAlpha.array[i] -= 0.01;

        if (aAlpha.array[i] <= 0 && active) {
          // Reset particle to the initial position passed as a prop
          positions.array[i * 3 + 0] = position[0]
          positions.array[i * 3 + 1] = position[1]
          positions.array[i * 3 + 2] = position[2]

          velocities.array[i * 3 + 0] = Math.random() * 0.03 + 0.02
          velocities.array[i * 3 + 1] = Math.random() * 0.01 + 0.01
          velocities.array[i * 3 + 2] = Math.random() * -0.001 + 0.01

          aAlpha.array[i] = Math.random() * 0.2 + 0.5 // Randomize alpha reset for staggered effect
          aSize.array[i] = Math.random() * 5 + 1
        }
        aSize.array[i] += 0.05
      }

      positions.needsUpdate = true
      aAlpha.needsUpdate = true
      aSize.needsUpdate = true
    })

    return (
      <group position={position}>
        <points ref={pointsRef} geometry={geometry}>
          <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthWrite={false}
            depthTest={false} // Disable depth testing to prevent particles from disappearing when the camera is close
            uniforms={{
              uTexture: { value: texture },
              uOpacity: { value: 0.4 }, // Set initial opacity
            }}
          />
        </points>
      </group>
    )
  }
)
