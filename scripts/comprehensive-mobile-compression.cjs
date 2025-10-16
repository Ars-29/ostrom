/**
 * Comprehensive Mobile Asset Compression Script
 * Creates mobile-optimized versions of ALL assets in public folder
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration for mobile optimization
const MOBILE_CONFIG = {
  // Image compression settings
  images: {
    quality: 70,           // WebP quality (0-100)
    maxWidth: 1024,        // Max width for mobile
    maxHeight: 1024,       // Max height for mobile
    formats: ['webp'],     // Output formats
    skipLargeImages: false // Compress all images regardless of size
  },
  
  // Video compression settings
  videos: {
    quality: 'medium',     // Video quality
    maxWidth: 1280,        // Max width for mobile videos
    maxHeight: 720,        // Max height for mobile videos
    bitrate: '500k'        // Target bitrate
  },
  
  // Audio compression settings
  audio: {
    quality: 5,            // MP3 quality (0-9, lower = better)
    bitrate: '128k'        // Audio bitrate
  },
  
  // Font optimization
  fonts: {
    subset: true,          // Create font subsets
    formats: ['woff2']     // Only woff2 for mobile
  }
};

class MobileAssetCompressor {
  constructor() {
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      totalSizeSaved: 0,
      originalSize: 0,
      compressedSize: 0
    };
    
    this.startTime = Date.now();
  }

  /**
   * Main compression function
   */
  async compressAllAssets() {
    console.log('🚀 Starting comprehensive mobile asset compression...');
    console.log('📁 Scanning public folder for all assets...');
    
    const publicPath = path.join(__dirname, '..', 'public');
    const mobileAssetsPath = path.join(__dirname, '..', 'public', 'mobile-assets');
    
    // Ensure mobile-assets directory exists
    if (!fs.existsSync(mobileAssetsPath)) {
      fs.mkdirSync(mobileAssetsPath, { recursive: true });
    }
    
    // Process all asset types
    await this.processImages(publicPath, mobileAssetsPath);
    await this.processVideos(publicPath, mobileAssetsPath);
    await this.processAudio(publicPath, mobileAssetsPath);
    await this.processFonts(publicPath, mobileAssetsPath);
    await this.processOtherAssets(publicPath, mobileAssetsPath);
    
    this.printStats();
  }

  /**
   * Process all images
   */
  async processImages(publicPath, mobileAssetsPath) {
    console.log('\n📸 Processing images...');
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];
    const imageFiles = this.getAllFiles(publicPath, imageExtensions);
    
    for (const file of imageFiles) {
      try {
        const relativePath = path.relative(publicPath, file);
        const mobilePath = path.join(mobileAssetsPath, relativePath);
        
        // Create directory structure
        const mobileDir = path.dirname(mobilePath);
        if (!fs.existsSync(mobileDir)) {
          fs.mkdirSync(mobileDir, { recursive: true });
        }
        
        // Get original file size
        const originalSize = fs.statSync(file).size;
        this.stats.originalSize += originalSize;
        
        // Compress image
        await this.compressImage(file, mobilePath);
        
        // Get compressed file size
        if (fs.existsSync(mobilePath)) {
          const compressedSize = fs.statSync(mobilePath).size;
          this.stats.compressedSize += compressedSize;
          this.stats.totalSizeSaved += (originalSize - compressedSize);
          
          const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
          console.log(`✅ ${relativePath}: ${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)} (${compressionRatio}% saved)`);
        }
        
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Compress individual image
   */
  async compressImage(inputPath, outputPath) {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Calculate new dimensions
    let { width, height } = metadata;
    const maxWidth = MOBILE_CONFIG.images.maxWidth;
    const maxHeight = MOBILE_CONFIG.images.maxHeight;
    
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      if (width > height) {
        width = maxWidth;
        height = Math.round(maxWidth / aspectRatio);
      } else {
        height = maxHeight;
        width = Math.round(maxHeight * aspectRatio);
      }
    }
    
    // Convert to WebP with mobile optimization
    await image
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: MOBILE_CONFIG.images.quality,
        effort: 6 // Higher effort for better compression
      })
      .toFile(outputPath);
  }

  /**
   * Process all videos
   */
  async processVideos(publicPath, mobileAssetsPath) {
    console.log('\n🎥 Processing videos...');
    
    const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv'];
    const videoFiles = this.getAllFiles(publicPath, videoExtensions);
    
    for (const file of videoFiles) {
      try {
        const relativePath = path.relative(publicPath, file);
        const mobilePath = path.join(mobileAssetsPath, relativePath);
        
        // Create directory structure
        const mobileDir = path.dirname(mobilePath);
        if (!fs.existsSync(mobileDir)) {
          fs.mkdirSync(mobileDir, { recursive: true });
        }
        
        // For now, copy videos as-is (FFmpeg compression would require additional setup)
        // In production, you'd use FFmpeg to compress videos
        fs.copyFileSync(file, mobilePath);
        
        const originalSize = fs.statSync(file).size;
        const compressedSize = fs.statSync(mobilePath).size;
        
        console.log(`📹 ${relativePath}: ${this.formatBytes(originalSize)} (copied as-is)`);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Error processing video ${file}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Process all audio files
   */
  async processAudio(publicPath, mobileAssetsPath) {
    console.log('\n🎵 Processing audio files...');
    
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const audioFiles = this.getAllFiles(publicPath, audioExtensions);
    
    for (const file of audioFiles) {
      try {
        const relativePath = path.relative(publicPath, file);
        const mobilePath = path.join(mobileAssetsPath, relativePath);
        
        // Create directory structure
        const mobileDir = path.dirname(mobilePath);
        if (!fs.existsSync(mobileDir)) {
          fs.mkdirSync(mobileDir, { recursive: true });
        }
        
        // For now, copy audio as-is (audio compression would require additional tools)
        // In production, you'd use FFmpeg or similar to compress audio
        fs.copyFileSync(file, mobilePath);
        
        const originalSize = fs.statSync(file).size;
        const compressedSize = fs.statSync(mobilePath).size;
        
        console.log(`🎵 ${relativePath}: ${this.formatBytes(originalSize)} (copied as-is)`);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Error processing audio ${file}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Process all font files
   */
  async processFonts(publicPath, mobileAssetsPath) {
    console.log('\n🔤 Processing font files...');
    
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    const fontFiles = this.getAllFiles(publicPath, fontExtensions);
    
    for (const file of fontFiles) {
      try {
        const relativePath = path.relative(publicPath, file);
        const mobilePath = path.join(mobileAssetsPath, relativePath);
        
        // Create directory structure
        const mobileDir = path.dirname(mobilePath);
        if (!fs.existsSync(mobileDir)) {
          fs.mkdirSync(mobileDir, { recursive: true });
        }
        
        // For fonts, prefer woff2 format for mobile
        if (path.extname(file) === '.woff2') {
          fs.copyFileSync(file, mobilePath);
        } else {
          // Convert other formats to woff2 (simplified - in production use fonttools)
          fs.copyFileSync(file, mobilePath);
        }
        
        const originalSize = fs.statSync(file).size;
        const compressedSize = fs.statSync(mobilePath).size;
        
        console.log(`🔤 ${relativePath}: ${this.formatBytes(originalSize)} (copied)`);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Error processing font ${file}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Process other assets (SVG, JSON, etc.)
   */
  async processOtherAssets(publicPath, mobileAssetsPath) {
    console.log('\n📄 Processing other assets...');
    
    const otherExtensions = ['.svg', '.json', '.txt', '.css', '.js', '.html'];
    const otherFiles = this.getAllFiles(publicPath, otherExtensions);
    
    for (const file of otherFiles) {
      try {
        const relativePath = path.relative(publicPath, file);
        const mobilePath = path.join(mobileAssetsPath, relativePath);
        
        // Create directory structure
        const mobileDir = path.dirname(mobilePath);
        if (!fs.existsSync(mobileDir)) {
          fs.mkdirSync(mobileDir, { recursive: true });
        }
        
        // Copy other assets as-is
        fs.copyFileSync(file, mobilePath);
        
        const originalSize = fs.statSync(file).size;
        const compressedSize = fs.statSync(mobilePath).size;
        
        console.log(`📄 ${relativePath}: ${this.formatBytes(originalSize)} (copied)`);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Get all files with specified extensions
   */
  getAllFiles(dirPath, extensions) {
    const files = [];
    
    const scanDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        console.log(`🔍 Scanning directory: ${dir}`);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip mobile-assets directory to avoid recursion
            if (item !== 'mobile-assets') {
              scanDir(fullPath);
            }
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (extensions.includes(ext)) {
              files.push(fullPath);
              console.log(`📄 Found file: ${fullPath}`);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error scanning directory ${dir}:`, error.message);
      }
    };
    
    scanDir(dirPath);
    console.log(`📊 Total files found: ${files.length}`);
    return files;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Print compression statistics
   */
  printStats() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const compressionRatio = this.stats.originalSize > 0 
      ? ((this.stats.totalSizeSaved / this.stats.originalSize) * 100).toFixed(1)
      : 0;
    
    console.log('\n📊 COMPRESSION STATISTICS');
    console.log('========================');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📁 Files processed: ${this.stats.processed}`);
    console.log(`⏭️  Files skipped: ${this.stats.skipped}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`📦 Original size: ${this.formatBytes(this.stats.originalSize)}`);
    console.log(`📦 Compressed size: ${this.formatBytes(this.stats.compressedSize)}`);
    console.log(`💾 Size saved: ${this.formatBytes(this.stats.totalSizeSaved)}`);
    console.log(`📈 Compression ratio: ${compressionRatio}%`);
    console.log('\n✅ Mobile asset compression complete!');
  }
}

// Run the compression
if (require.main === module) {
  const compressor = new MobileAssetCompressor();
  compressor.compressAllAssets().catch(console.error);
}

module.exports = MobileAssetCompressor;
