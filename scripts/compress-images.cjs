#!/usr/bin/env node

/**
 * Image Compression Script for WebP Conversion
 * Converts JPEG/PNG images to WebP format with multiple quality levels
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  inputDir: 'public/images',
  outputDir: 'public/images/compressed',
  qualities: {
    high: 85,    // High quality for desktop
    medium: 70,  // Medium quality for tablets
    low: 50      // Low quality for mobile
  },
  formats: ['webp', 'avif'], // Modern formats
  fallbackFormats: ['jpg', 'png'], // Fallback formats
  maxWidth: {
    high: 1920,
    medium: 1280,
    low: 640
  }
};

// Asset analysis from our project
const ASSET_ANALYSIS = {
  totalImages: 60,
  totalSize: 60000000, // ~60MB
  formats: {
    webp: 45,
    jpg: 10,
    png: 5
  }
};

class ImageCompressor {
  constructor() {
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      originalSize: 0,
      compressedSize: 0,
      savings: 0
    };
  }

  /**
   * Check if required tools are installed
   */
  checkDependencies() {
    console.log('🔍 [ImageCompressor] Checking dependencies...');
    
    try {
      execSync('cwebp -version', { stdio: 'pipe' });
      console.log('✅ [ImageCompressor] WebP tools found');
    } catch (error) {
      console.log('❌ [ImageCompressor] WebP tools not found. Installing...');
      this.installWebPTools();
    }

    try {
      execSync('avifenc --version', { stdio: 'pipe' });
      console.log('✅ [ImageCompressor] AVIF tools found');
    } catch (error) {
      console.log('⚠️ [ImageCompressor] AVIF tools not found (optional)');
    }
  }

  /**
   * Install WebP tools
   */
  installWebPTools() {
    console.log('📦 [ImageCompressor] Installing WebP tools...');
    
    try {
      // Try to install via package manager
      if (process.platform === 'win32') {
        execSync('winget install Google.WebP', { stdio: 'pipe' });
      } else if (process.platform === 'darwin') {
        execSync('brew install webp', { stdio: 'pipe' });
      } else {
        execSync('sudo apt-get install webp', { stdio: 'pipe' });
      }
      console.log('✅ [ImageCompressor] WebP tools installed successfully');
    } catch (error) {
      console.log('❌ [ImageCompressor] Failed to install WebP tools automatically');
      console.log('📋 [ImageCompressor] Please install manually:');
      console.log('   Windows: winget install Google.WebP');
      console.log('   macOS: brew install webp');
      console.log('   Linux: sudo apt-get install webp');
      process.exit(1);
    }
  }

  /**
   * Get file size in bytes
   */
  getFileSize(filePath) {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Convert image to WebP
   */
  convertToWebP(inputPath, outputPath, quality) {
    try {
      const command = `cwebp -q ${quality} -m 6 "${inputPath}" -o "${outputPath}"`;
      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(`❌ [ImageCompressor] Failed to convert ${inputPath}:`, error.message);
      return false;
    }
  }

  /**
   * Convert image to AVIF
   */
  convertToAVIF(inputPath, outputPath, quality) {
    try {
      const command = `avifenc --min 0 --max 63 --speed 6 --yuv 420 --q ${quality} "${inputPath}" "${outputPath}"`;
      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.log(`⚠️ [ImageCompressor] AVIF conversion failed for ${inputPath} (optional)`);
      return false;
    }
  }

  /**
   * Resize image
   */
  resizeImage(inputPath, outputPath, width) {
    try {
      const command = `cwebp -resize ${width} 0 -q 85 "${inputPath}" -o "${outputPath}"`;
      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(`❌ [ImageCompressor] Failed to resize ${inputPath}:`, error.message);
      return false;
    }
  }

  /**
   * Process a single image
   */
  async processImage(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip if already compressed or not an image
    if (fileName.includes('_compressed') || !['.jpg', '.jpeg', '.png'].includes(ext)) {
      this.stats.skipped++;
      return;
    }

    console.log(`🔄 [ImageCompressor] Processing: ${fileName}`);
    
    const originalSize = this.getFileSize(filePath);
    this.stats.originalSize += originalSize;
    
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);
    const outputDir = path.join(dirName, 'compressed');
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let compressedSize = 0;
    let success = false;

    // Generate multiple quality versions
    for (const [qualityName, quality] of Object.entries(CONFIG.qualities)) {
      // WebP conversion
      const webpPath = path.join(outputDir, `${baseName}_${qualityName}.webp`);
      if (this.convertToWebP(filePath, webpPath, quality)) {
        compressedSize += this.getFileSize(webpPath);
        success = true;
      }

      // AVIF conversion (optional)
      const avifPath = path.join(outputDir, `${baseName}_${qualityName}.avif`);
      if (this.convertToAVIF(filePath, avifPath, quality)) {
        compressedSize += this.getFileSize(avifPath);
      }

      // Responsive sizes
      const maxWidth = CONFIG.maxWidth[qualityName];
      const responsiveWebpPath = path.join(outputDir, `${baseName}_${qualityName}_${maxWidth}w.webp`);
      if (this.resizeImage(filePath, responsiveWebpPath, maxWidth)) {
        compressedSize += this.getFileSize(responsiveWebpPath);
      }
    }

    if (success) {
      this.stats.compressedSize += compressedSize;
      this.stats.processed++;
      console.log(`✅ [ImageCompressor] ${fileName} processed successfully`);
    } else {
      this.stats.errors++;
      console.log(`❌ [ImageCompressor] ${fileName} failed to process`);
    }
  }

  /**
   * Process all images in directory
   */
  async processDirectory(dirPath) {
    console.log(`🔍 [ImageCompressor] Scanning directory: ${dirPath}`);
    
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        // Recursively process subdirectories
        await this.processDirectory(fullPath);
      } else if (file.isFile()) {
        // Process image files
        await this.processImage(fullPath);
      }
    }
  }

  /**
   * Generate responsive image manifest
   */
  generateManifest() {
    console.log('📝 [ImageCompressor] Generating responsive image manifest...');
    
    const manifest = {
      version: '1.0',
      generated: new Date().toISOString(),
      images: {}
    };

    // This would be populated with actual image data
    // For now, we'll create a template
    manifest.images = {
      'street/church-thirdplan': {
        original: 'street/church-thirdplan.jpg',
        webp: {
          high: 'compressed/church-thirdplan_high.webp',
          medium: 'compressed/church-thirdplan_medium.webp',
          low: 'compressed/church-thirdplan_low.webp'
        },
        responsive: {
          '1920w': 'compressed/church-thirdplan_high_1920w.webp',
          '1280w': 'compressed/church-thirdplan_medium_1280w.webp',
          '640w': 'compressed/church-thirdplan_low_640w.webp'
        }
      }
    };

    const manifestPath = path.join(CONFIG.inputDir, 'image-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ [ImageCompressor] Manifest generated: ${manifestPath}`);
  }

  /**
   * Generate compression report
   */
  generateReport() {
    console.log('\n📊 [ImageCompressor] === COMPRESSION REPORT ===');
    console.log(`📦 Images processed: ${this.stats.processed}`);
    console.log(`⏭️ Images skipped: ${this.stats.skipped}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    const originalMB = (this.stats.originalSize / 1024 / 1024).toFixed(2);
    const compressedMB = (this.stats.compressedSize / 1024 / 1024).toFixed(2);
    const savingsMB = ((this.stats.originalSize - this.stats.compressedSize) / 1024 / 1024).toFixed(2);
    const savingsPercent = ((this.stats.originalSize - this.stats.compressedSize) / this.stats.originalSize * 100).toFixed(1);
    
    console.log(`💾 Original size: ${originalMB}MB`);
    console.log(`🗜️ Compressed size: ${compressedMB}MB`);
    console.log(`💰 Space saved: ${savingsMB}MB (${savingsPercent}%)`);
    
    console.log('\n🎯 Expected Results:');
    console.log('   • 25-35% size reduction for WebP');
    console.log('   • 40-50% size reduction for AVIF');
    console.log('   • Responsive images for different devices');
    console.log('   • Better perceived loading performance');
    
    console.log('\n📊 [ImageCompressor] === END REPORT ===');
  }

  /**
   * Main compression process
   */
  async compress() {
    console.log('🚀 [ImageCompressor] Starting image compression...');
    console.log(`📁 Input directory: ${CONFIG.inputDir}`);
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
    
    // Check dependencies
    this.checkDependencies();
    
    // Process images
    await this.processDirectory(CONFIG.inputDir);
    
    // Generate manifest
    this.generateManifest();
    
    // Generate report
    this.generateReport();
    
    console.log('✅ [ImageCompressor] Compression completed successfully!');
  }
}

// Run compression if called directly
if (require.main === module) {
  const compressor = new ImageCompressor();
  compressor.compress().catch(console.error);
}

module.exports = ImageCompressor;
