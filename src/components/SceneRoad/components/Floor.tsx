import { ClampToEdgeWrapping, TextureLoader, LinearFilter, Texture } from 'three';
import { Plane } from '@react-three/drei';
import { useState, useEffect } from 'react';

export const Floor = () => {
  // Enhanced mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Progressive loading state
  const [loadedTiles, setLoadedTiles] = useState(0);
  const [textures, setTextures] = useState<Texture[]>([]);
  const [displacementMaps, setDisplacementMaps] = useState<Texture[]>([]);
  
  // Progressive loading effect
  useEffect(() => {
    const loadTile = async (index: number) => {
      try {
        // Load texture and displacement map for this tile
        const textureLoader = new TextureLoader();
        const texture = await new Promise<Texture>((resolve, reject) => {
          textureLoader.load(
            `${import.meta.env.BASE_URL}images/road/road_${index + 1}.jpg`,
            resolve,
            undefined,
            reject
          );
        });
        
        const displacementMap = await new Promise<Texture>((resolve, reject) => {
          textureLoader.load(
            `${import.meta.env.BASE_URL}images/road/road_${index + 1}_height.webp`,
            resolve,
            undefined,
            reject
          );
        });
        
        // Set texture properties
        texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
        texture.minFilter = texture.magFilter = LinearFilter;
        texture.repeat.set(1, 1);
        
        displacementMap.wrapS = displacementMap.wrapT = ClampToEdgeWrapping;
        displacementMap.minFilter = displacementMap.magFilter = LinearFilter;
        displacementMap.repeat.set(1, 1);
        
        // Update state
        setTextures(prev => {
          const newTextures = [...prev];
          newTextures[index] = texture;
          return newTextures;
        });
        
        setDisplacementMaps(prev => {
          const newMaps = [...prev];
          newMaps[index] = displacementMap;
          return newMaps;
        });
        
        setLoadedTiles(prev => prev + 1);
        
        console.log(`🛣️ [Floor] Tile ${index + 1} loaded (${isMobile ? 'mobile' : 'desktop'} optimized)`);
        
        // Load next tile after a short delay (progressive loading)
        if (index < 3) {
          setTimeout(() => loadTile(index + 1), isMobile ? 200 : 100);
        }
        
      } catch (error) {
        console.warn(`⚠️ [Floor] Failed to load tile ${index + 1}:`, error);
        // Continue loading other tiles even if one fails
        if (index < 3) {
          setTimeout(() => loadTile(index + 1), 500);
        }
      }
    };
    
    // Start loading first tile immediately
    loadTile(0);
  }, [isMobile]);
  
  // Initialize arrays
  useEffect(() => {
    setTextures(new Array(4).fill(null));
    setDisplacementMaps(new Array(4).fill(null));
  }, []);

  // Each tile is 37.5 units (half of 75) to form a 2x2 grid
  const tileSize = 37.5;
  // Add small overlap to prevent seams
  const overlap = 0.025;
  const adjustedOffset = (tileSize / 2) - overlap;
  
  const positions: [number, number, number][] = [
    [-adjustedOffset, -1.005, -adjustedOffset], // road_1 (top-left)
    [ adjustedOffset, -1.004, -adjustedOffset], // road_2 (top-right)
    [-adjustedOffset, -0.99,  adjustedOffset], // road_3 (bottom-left)
    [ adjustedOffset, -1.002,  adjustedOffset], // road_4 (bottom-right)
  ];

  return (
    <group>
      {textures.map((texture, i) => {
        // Only render tile if both texture and displacement map are loaded
        if (!texture || !displacementMaps[i]) {
          return null;
        }
        
        return (
          <Plane
            key={i}
            args={[tileSize + overlap, tileSize + overlap, isMobile ? 64 : 256, isMobile ? 64 : 256]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={positions[i]}
            receiveShadow
          >
            <meshStandardMaterial
              map={texture}
              displacementMap={displacementMaps[i]}
              displacementScale={isMobile ? 1.5 : 3} // Reduced displacement on mobile
            />
          </Plane>
        );
      })}
      
      {/* Loading indicator for debugging */}
      {loadedTiles < 4 && (
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial 
            color="white" 
            transparent 
            opacity={0.1}
            visible={false} // Hidden by default, can be enabled for debugging
          />
        </mesh>
      )}
    </group>
  );
};
