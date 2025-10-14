#!/usr/bin/env node

/**
 * Texture Atlas Generator for Three.js Optimization
 * Combines multiple textures into single atlases to reduce draw calls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ATLAS_CONFIG = {
  inputDir: 'public/images',
  outputDir: 'public/images/atlases',
  atlasSize: 2048, // Maximum atlas size
  padding: 2, // Padding between textures
  formats: ['webp', 'png'], // Output formats
  maxTexturesPerAtlas: 16 // Maximum textures per atlas
};

// Scene-specific texture groupings
const TEXTURE_GROUPS = {
  'street': [
    'street/floor-firstplan-r.jpg',
    'street/church-thirdplan.webp',
    'street/church_front_1.webp',
    'street/building-secondplan-2-1.webp',
    'street/building-secondplan-2-2.webp',
    'street/building-secondplan-2-3.webp',
    'street/building-secondplan-1_flat.webp',
    'street/building-secondplan-strom.webp',
    'street/sidewalk.jpg',
    'street/streetlamp-secondplan.webp',
    'street/car-secondplan-1.webp',
    'street/horse_1.webp',
    'street/car-secondplan-2.webp',
    'street/car-secondplan-3.webp',
    'street/motocycle.webp',
    'street/voiture-chien.webp'
  ],
  'road': [
    'road/floor-road.jpg',
    'road/smoke-particle-1.webp',
    'road/smoke-particle-2.webp',
    'road/smoke-particle-3.webp',
    'road/car-smoke-1.webp',
    'road/car-smoke-2.webp',
    'road/car-smoke-3.webp',
    'road/road-texture-1.webp',
    'road/road-texture-2.webp',
    'road/road-texture-3.webp'
  ],
  'plane': [
    'plane/floor-plane.jpg',
    'plane/sand-particle-1.webp',
    'plane/sand-particle-2.webp',
    'plane/sand-particle-3.webp',
    'plane/plane-sprite-1.webp',
    'plane/plane-sprite-2.webp',
    'plane/plane-sprite-3.webp',
    'plane/desert-texture-1.webp',
    'plane/desert-texture-2.webp',
    'plane/desert-texture-3.webp'
  ],
  'ui': [
    'logo.svg',
    'background.webp',
    'divider.png',
    'trophy_1.png',
    'trophy_2.png',
    'trophy_3.png',
    'icon_sound_on.png',
    'icon_sound_off.png'
  ]
};

class TextureAtlasGenerator {
  constructor() {
    this.stats = {
      atlasesCreated: 0,
      texturesProcessed: 0,
      drawCallsReduced: 0,
      originalSize: 0,
      atlasSize: 0,
      savings: 0
    };
  }

  /**
   * Check if required tools are installed
   */
  checkDependencies() {
    console.log('🔍 [TextureAtlas] Checking dependencies...');
    
    try {
      execSync('magick -version', { stdio: 'pipe' });
      console.log('✅ [TextureAtlas] ImageMagick found');
    } catch (error) {
      console.log('❌ [TextureAtlas] ImageMagick not found. Installing...');
      this.installImageMagick();
    }
  }

  /**
   * Install ImageMagick
   */
  installImageMagick() {
    console.log('📦 [TextureAtlas] Installing ImageMagick...');
    
    try {
      if (process.platform === 'win32') {
        execSync('winget install ImageMagick.ImageMagick', { stdio: 'pipe' });
      } else if (process.platform === 'darwin') {
        execSync('brew install imagemagick', { stdio: 'pipe' });
      } else {
        execSync('sudo apt-get install imagemagick', { stdio: 'pipe' });
      }
      console.log('✅ [TextureAtlas] ImageMagick installed successfully');
    } catch (error) {
      console.log('❌ [TextureAtlas] Failed to install ImageMagick automatically');
      console.log('📋 [TextureAtlas] Please install manually:');
      console.log('   Windows: winget install ImageMagick.ImageMagick');
      console.log('   macOS: brew install imagemagick');
      console.log('   Linux: sudo apt-get install imagemagick');
      process.exit(1);
    }
  }

  /**
   * Get image dimensions
   */
  getImageDimensions(imagePath) {
    try {
      const command = `magick identify -format "%wx%h" "${imagePath}"`;
      const dimensions = execSync(command, { stdio: 'pipe' }).toString().trim();
      const [width, height] = dimensions.split('x').map(Number);
      return { width, height };
    } catch (error) {
      console.warn(`⚠️ [TextureAtlas] Could not get dimensions for ${imagePath}`);
      return { width: 256, height: 256 }; // Default size
    }
  }

  /**
   * Calculate optimal atlas layout
   */
  calculateAtlasLayout(textures) {
    const layouts = [];
    let currentAtlas = [];
    let currentWidth = 0;
    let currentHeight = 0;
    let maxHeight = 0;

    for (const texture of textures) {
      const dimensions = this.getImageDimensions(texture.path);
      const paddedWidth = dimensions.width + ATLAS_CONFIG.padding * 2;
      const paddedHeight = dimensions.height + ATLAS_CONFIG.padding * 2;

      // Check if texture fits in current atlas
      if (currentWidth + paddedWidth <= ATLAS_CONFIG.atlasSize && 
          currentAtlas.length < ATLAS_CONFIG.maxTexturesPerAtlas) {
        currentAtlas.push({
          ...texture,
          x: currentWidth,
          y: currentHeight,
          width: dimensions.width,
          height: dimensions.height
        });
        currentWidth += paddedWidth;
        maxHeight = Math.max(maxHeight, paddedHeight);
      } else {
        // Start new atlas
        if (currentAtlas.length > 0) {
          layouts.push({
            textures: currentAtlas,
            width: currentWidth,
            height: maxHeight
          });
        }
        currentAtlas = [{
          ...texture,
          x: 0,
          y: 0,
          width: dimensions.width,
          height: dimensions.height
        }];
        currentWidth = paddedWidth;
        currentHeight += maxHeight;
        maxHeight = paddedHeight;
      }
    }

    // Add final atlas
    if (currentAtlas.length > 0) {
      layouts.push({
        textures: currentAtlas,
        width: currentWidth,
        height: maxHeight
      });
    }

    return layouts;
  }

  /**
   * Generate texture atlas
   */
  generateAtlas(atlasName, layout) {
    console.log(`🔄 [TextureAtlas] Generating atlas: ${atlasName}`);
    
    const outputDir = path.join(ATLAS_CONFIG.outputDir, atlasName);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const atlasPath = path.join(outputDir, `${atlasName}_atlas.png`);
    const atlasDataPath = path.join(outputDir, `${atlasName}_atlas.json`);

    try {
      // Create base atlas image
      const command = [
        'magick',
        '-size', `${layout.width}x${layout.height}`,
        'xc:transparent',
        atlasPath
      ].join(' ');

      execSync(command, { stdio: 'pipe' });

      // Composite textures onto atlas
      const atlasData = {
        name: atlasName,
        width: layout.width,
        height: layout.height,
        textures: []
      };

      for (const texture of layout.textures) {
        const compositeCommand = [
          'magick',
          atlasPath,
          `"${texture.path}"`,
          '-geometry', `+${texture.x + ATLAS_CONFIG.padding}+${texture.y + ATLAS_CONFIG.padding}`,
          '-composite',
          atlasPath
        ].join(' ');

        execSync(compositeCommand, { stdio: 'pipe' });

        // Add texture data
        atlasData.textures.push({
          name: texture.name,
          x: texture.x + ATLAS_CONFIG.padding,
          y: texture.y + ATLAS_CONFIG.padding,
          width: texture.width,
          height: texture.height,
          u1: (texture.x + ATLAS_CONFIG.padding) / layout.width,
          v1: (texture.y + ATLAS_CONFIG.padding) / layout.height,
          u2: (texture.x + ATLAS_CONFIG.padding + texture.width) / layout.width,
          v2: (texture.y + ATLAS_CONFIG.padding + texture.height) / layout.height
        });
      }

      // Save atlas data
      fs.writeFileSync(atlasDataPath, JSON.stringify(atlasData, null, 2));

      // Convert to WebP
      const webpPath = atlasPath.replace('.png', '.webp');
      const webpCommand = `cwebp -q 85 "${atlasPath}" -o "${webpPath}"`;
      execSync(webpCommand, { stdio: 'pipe' });

      console.log(`✅ [TextureAtlas] Atlas generated: ${atlasName}`);
      return { atlasPath, atlasDataPath, webpPath, atlasData };
    } catch (error) {
      console.error(`❌ [TextureAtlas] Failed to generate atlas ${atlasName}:`, error.message);
      return null;
    }
  }

  /**
   * Process texture group
   */
  async processTextureGroup(groupName, texturePaths) {
    console.log(`🎨 [TextureAtlas] Processing group: ${groupName}`);
    
    // Prepare texture data
    const textures = texturePaths.map(texturePath => ({
      name: path.basename(texturePath),
      path: path.join(ATLAS_CONFIG.inputDir, texturePath)
    })).filter(texture => fs.existsSync(texture.path));

    if (textures.length === 0) {
      console.log(`⚠️ [TextureAtlas] No textures found for group: ${groupName}`);
      return;
    }

    // Calculate atlas layout
    const layouts = this.calculateAtlasLayout(textures);
    
    // Generate atlases
    for (let i = 0; i < layouts.length; i++) {
      const atlasName = layouts.length > 1 ? `${groupName}_${i + 1}` : groupName;
      const result = this.generateAtlas(atlasName, layouts[i]);
      
      if (result) {
        this.stats.atlasesCreated++;
        this.stats.texturesProcessed += layouts[i].textures.length;
        this.stats.drawCallsReduced += layouts[i].textures.length - 1; // -1 because we're combining into 1 draw call
      }
    }
  }

  /**
   * Generate Three.js texture loader
   */
  generateTextureLoader() {
    console.log('📝 [TextureAtlas] Generating Three.js texture loader...');
    
    const loaderCode = `
import { TextureLoader } from 'three';

export interface AtlasTexture {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  u1: number;
  v1: number;
  u2: number;
  v2: number;
}

export interface AtlasData {
  name: string;
  width: number;
  height: number;
  textures: AtlasTexture[];
}

class AtlasTextureLoader {
  private loadedAtlases = new Map<string, { texture: THREE.Texture; data: AtlasData }>();
  private loader = new TextureLoader();

  async loadAtlas(atlasName: string): Promise<{ texture: THREE.Texture; data: AtlasData }> {
    if (this.loadedAtlases.has(atlasName)) {
      return this.loadedAtlases.get(atlasName)!;
    }

    try {
      // Load atlas data
      const dataResponse = await fetch(\`/images/atlases/\${atlasName}/\${atlasName}_atlas.json\`);
      const data: AtlasData = await dataResponse.json();

      // Load atlas texture
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        this.loader.load(
          \`/images/atlases/\${atlasName}/\${atlasName}_atlas.webp\`,
          resolve,
          undefined,
          reject
        );
      });

      const result = { texture, data };
      this.loadedAtlases.set(atlasName, result);
      return result;
    } catch (error) {
      console.error(\`Failed to load atlas \${atlasName}:\`, error);
      throw error;
    }
  }

  getTextureUV(atlasName: string, textureName: string): { u1: number; v1: number; u2: number; v2: number } | null {
    const atlas = this.loadedAtlases.get(atlasName);
    if (!atlas) return null;

    const textureData = atlas.data.textures.find(t => t.name === textureName);
    if (!textureData) return null;

    return {
      u1: textureData.u1,
      v1: textureData.v1,
      u2: textureData.u2,
      v2: textureData.v2
    };
  }

  createAtlasMaterial(atlasName: string, textureName: string): THREE.MeshBasicMaterial | null {
    const atlas = this.loadedAtlases.get(atlasName);
    if (!atlas) return null;

    const uv = this.getTextureUV(atlasName, textureName);
    if (!uv) return null;

    const material = new THREE.MeshBasicMaterial({
      map: atlas.texture,
      transparent: true
    });

    // Set UV offset and repeat
    material.map!.offset.set(uv.u1, uv.v1);
    material.map!.repeat.set(uv.u2 - uv.u1, uv.v2 - uv.v1);

    return material;
  }
}

export const atlasTextureLoader = new AtlasTextureLoader();
`;

    const loaderPath = path.join(ATLAS_CONFIG.outputDir, 'AtlasTextureLoader.ts');
    fs.writeFileSync(loaderPath, loaderCode);
    console.log(`✅ [TextureAtlas] Texture loader generated: ${loaderPath}`);
  }

  /**
   * Generate compression report
   */
  generateReport() {
    console.log('\n📊 [TextureAtlas] === ATLAS GENERATION REPORT ===');
    console.log(`🎨 Atlases created: ${this.stats.atlasesCreated}`);
    console.log(`🖼️ Textures processed: ${this.stats.texturesProcessed}`);
    console.log(`⚡ Draw calls reduced: ${this.stats.drawCallsReduced}`);
    
    console.log('\n🎯 Benefits:');
    console.log('   • Reduced draw calls (better performance)');
    console.log('   • Fewer texture swaps');
    console.log('   • Better GPU utilization');
    console.log('   • Reduced memory fragmentation');
    console.log('   • Faster rendering');
    
    console.log('\n📊 [TextureAtlas] === END REPORT ===');
  }

  /**
   * Main atlas generation process
   */
  async generate() {
    console.log('🚀 [TextureAtlas] Starting texture atlas generation...');
    console.log(`📁 Input directory: ${ATLAS_CONFIG.inputDir}`);
    console.log(`📁 Output directory: ${ATLAS_CONFIG.outputDir}`);
    
    // Check dependencies
    this.checkDependencies();
    
    // Process each texture group
    for (const [groupName, texturePaths] of Object.entries(TEXTURE_GROUPS)) {
      await this.processTextureGroup(groupName, texturePaths);
    }
    
    // Generate texture loader
    this.generateTextureLoader();
    
    // Generate report
    this.generateReport();
    
    console.log('✅ [TextureAtlas] Atlas generation completed successfully!');
  }
}

// Run atlas generation if called directly
if (require.main === module) {
  const generator = new TextureAtlasGenerator();
  generator.generate().catch(console.error);
}

module.exports = TextureAtlasGenerator;
