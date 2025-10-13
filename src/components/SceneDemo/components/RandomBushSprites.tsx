import { BushSprite } from './BushSprite'

export const RandomBushSprites = () => {
  const generateRandomBushes = () => {
    const bushes = []
    for (let i = 0; i < 20; i++) {
      const position: [number, number, number] = [
        Math.random() * 40 - 20, // Random x between -20 and 20
        -0.8, // Fixed y position
        Math.random() * 40 - 20, // Random z between -20 and 20
      ]
      const rotation: [number, number, number] = [0, Math.random() * Math.PI * 2, 0] // Random y rotation
      const size: [number, number] = [Math.random() * 5, Math.random() * 5] // Random size
      bushes.push(
        <BushSprite
          key={i}
          textureUrl="images/bush.png"
          position={position}
          rotation={rotation}
          size={size}
          triggerY={Math.random() * 0.05}
        />
      )
    }
    return bushes
  }

  return <>{generateRandomBushes()}</>
}
