// src/hooks/useMouseWiggle.ts
import { useEffect, useRef } from 'react'

export const useMouseWiggle = (strength = 0.1, smoothness = 0.05) => {
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = -((e.clientX / window.innerWidth) * 2 - 1) // Inverted left/right
      const y = -((e.clientY / window.innerHeight) * 2 - 1) // Inverted up/down
      target.current.x = x * strength
      target.current.y = y * strength
    }

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * smoothness
      current.current.y += (target.current.y - current.current.y) * smoothness
      requestAnimationFrame(animate)
    }

    animate()
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [strength, smoothness])

  return current
}
