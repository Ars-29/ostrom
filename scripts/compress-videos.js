#!/usr/bin/env node

/**
 * Video Compression Script for H.264/H.265 Optimization
 * Compresses videos with multiple quality levels and formats
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const VIDEO_CONFIG = {
  inputDir: 'public/videos',
  outputDir: 'public/videos/compressed',
  qualities: {
    high: {
      crf: 18,      // High quality (near lossless)
      preset: 'slow',
      resolution: '1920x1080',
      bitrate: '5000k'
    },
    medium: {
      crf: 23,      // Medium quality (good balance)
      preset: 'medium',
      resolution: '1280x720',
      bitrate: '2500k'
    },
    low: {
      crf: 28,      // Low quality (smaller file)
      preset: 'fast',
      resolution: '854x480',
      bitrate: '1000k'
    }
  },
  formats: ['mp4', 'webm'], // Output formats
  codecs: {
    mp4: 'libx264',
    webm: 'libvpx-vp9'
  }
};

// Current video analysis
const VIDEO_ANALYSIS = {
  totalVideos: 2,
  totalSize: 34000000, // ~34MB
  videos: [
    { name: 'intro.mp4', size: 19181490, duration: '30s' },
    { name: 'intro_mobile.mp4', size: 15156530, duration: '30s' }
  ]
};

class VideoCompressor {
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
   * Check if FFmpeg is installed
   */
  checkFFmpeg() {
    console.log('🔍 [VideoCompressor] Checking FFmpeg...');
    
    try {
      execSync('ffmpeg -version', { stdio: 'pipe' });
      console.log('✅ [VideoCompressor] FFmpeg found');
      return true;
    } catch (error) {
      console.log('❌ [VideoCompressor] FFmpeg not found. Installing...');
      this.installFFmpeg();
      return false;
    }
  }

  /**
   * Install FFmpeg
   */
  installFFmpeg() {
    console.log('📦 [VideoCompressor] Installing FFmpeg...');
    
    try {
      if (process.platform === 'win32') {
        execSync('winget install Gyan.FFmpeg', { stdio: 'pipe' });
      } else if (process.platform === 'darwin') {
        execSync('brew install ffmpeg', { stdio: 'pipe' });
      } else {
        execSync('sudo apt-get install ffmpeg', { stdio: 'pipe' });
      }
      console.log('✅ [VideoCompressor] FFmpeg installed successfully');
    } catch (error) {
      console.log('❌ [VideoCompressor] Failed to install FFmpeg automatically');
      console.log('📋 [VideoCompressor] Please install manually:');
      console.log('   Windows: winget install Gyan.FFmpeg');
      console.log('   macOS: brew install ffmpeg');
      console.log('   Linux: sudo apt-get install ffmpeg');
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
   * Get video duration
   */
  getVideoDuration(filePath) {
    try {
      const command = `ffprobe -v quiet -show_entries format=duration -of csv="p=0" "${filePath}"`;
      const duration = execSync(command, { stdio: 'pipe' }).toString().trim();
      return parseFloat(duration);
    } catch (error) {
      console.warn(`⚠️ [VideoCompressor] Could not get duration for ${filePath}`);
      return 0;
    }
  }

  /**
   * Compress video with H.264
   */
  compressH264(inputPath, outputPath, quality) {
    try {
      const { crf, preset, resolution, bitrate } = VIDEO_CONFIG.qualities[quality];
      
      const command = [
        'ffmpeg',
        '-i', `"${inputPath}"`,
        '-c:v', 'libx264',
        '-crf', crf.toString(),
        '-preset', preset,
        '-vf', `scale=${resolution}`,
        '-b:v', bitrate,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart', // Optimize for web streaming
        '-y', // Overwrite output file
        `"${outputPath}"`
      ].join(' ');

      console.log(`🔄 [VideoCompressor] Compressing ${path.basename(inputPath)} (H.264 ${quality})...`);
      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(`❌ [VideoCompressor] H.264 compression failed for ${inputPath}:`, error.message);
      return false;
    }
  }

  /**
   * Compress video with VP9 (WebM)
   */
  compressVP9(inputPath, outputPath, quality) {
    try {
      const { crf, preset, resolution, bitrate } = VIDEO_CONFIG.qualities[quality];
      
      const command = [
        'ffmpeg',
        '-i', `"${inputPath}"`,
        '-c:v', 'libvpx-vp9',
        '-crf', crf.toString(),
        '-b:v', bitrate,
        '-vf', `scale=${resolution}`,
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-deadline', 'good',
        '-cpu-used', '2',
        '-y',
        `"${outputPath}"`
      ].join(' ');

      console.log(`🔄 [VideoCompressor] Compressing ${path.basename(inputPath)} (VP9 ${quality})...`);
      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(`❌ [VideoCompressor] VP9 compression failed for ${inputPath}:`, error.message);
      return false;
    }
  }

  /**
   * Generate video thumbnails
   */
  generateThumbnails(inputPath, outputDir) {
    try {
      const baseName = path.basename(inputPath, path.extname(inputPath));
      
      // Generate thumbnail at 10% of video duration
      const command = [
        'ffmpeg',
        '-i', `"${inputPath}"`,
        '-ss', '00:00:03', // Skip first 3 seconds
        '-vframes', '1',
        '-vf', 'scale=320:180',
        '-y',
        `"${path.join(outputDir, `${baseName}_thumb.jpg`)}"`
      ].join(' ');

      execSync(command, { stdio: 'pipe' });
      console.log(`✅ [VideoCompressor] Thumbnail generated for ${baseName}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ [VideoCompressor] Failed to generate thumbnail for ${inputPath}`);
      return false;
    }
  }

  /**
   * Process a single video
   */
  async processVideo(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip if already compressed or not a video
    if (fileName.includes('_compressed') || !['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
      this.stats.skipped++;
      return;
    }

    console.log(`🎬 [VideoCompressor] Processing: ${fileName}`);
    
    const originalSize = this.getFileSize(filePath);
    const duration = this.getVideoDuration(filePath);
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
    for (const [qualityName, qualityConfig] of Object.entries(VIDEO_CONFIG.qualities)) {
      // H.264 MP4 compression
      const mp4Path = path.join(outputDir, `${baseName}_${qualityName}.mp4`);
      if (this.compressH264(filePath, mp4Path, qualityName)) {
        compressedSize += this.getFileSize(mp4Path);
        success = true;
      }

      // VP9 WebM compression
      const webmPath = path.join(outputDir, `${baseName}_${qualityName}.webm`);
      if (this.compressVP9(filePath, webmPath, qualityName)) {
        compressedSize += this.getFileSize(webmPath);
      }
    }

    // Generate thumbnails
    this.generateThumbnails(filePath, outputDir);

    if (success) {
      this.stats.compressedSize += compressedSize;
      this.stats.processed++;
      console.log(`✅ [VideoCompressor] ${fileName} processed successfully`);
      console.log(`   Duration: ${duration.toFixed(1)}s`);
      console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
    } else {
      this.stats.errors++;
      console.log(`❌ [VideoCompressor] ${fileName} failed to process`);
    }
  }

  /**
   * Process all videos in directory
   */
  async processDirectory(dirPath) {
    console.log(`🔍 [VideoCompressor] Scanning directory: ${dirPath}`);
    
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        // Recursively process subdirectories
        await this.processDirectory(fullPath);
      } else if (file.isFile()) {
        // Process video files
        await this.processVideo(fullPath);
      }
    }
  }

  /**
   * Generate video manifest
   */
  generateManifest() {
    console.log('📝 [VideoCompressor] Generating video manifest...');
    
    const manifest = {
      version: '1.0',
      generated: new Date().toISOString(),
      videos: {}
    };

    // Template for video manifest
    manifest.videos = {
      'intro': {
        original: 'intro.mp4',
        compressed: {
          high: {
            mp4: 'compressed/intro_high.mp4',
            webm: 'compressed/intro_high.webm'
          },
          medium: {
            mp4: 'compressed/intro_medium.mp4',
            webm: 'compressed/intro_medium.webm'
          },
          low: {
            mp4: 'compressed/intro_low.mp4',
            webm: 'compressed/intro_low.webm'
          }
        },
        thumbnail: 'compressed/intro_thumb.jpg',
        duration: 30
      },
      'intro_mobile': {
        original: 'intro_mobile.mp4',
        compressed: {
          high: {
            mp4: 'compressed/intro_mobile_high.mp4',
            webm: 'compressed/intro_mobile_high.webm'
          },
          medium: {
            mp4: 'compressed/intro_mobile_medium.mp4',
            webm: 'compressed/intro_mobile_medium.webm'
          },
          low: {
            mp4: 'compressed/intro_mobile_low.mp4',
            webm: 'compressed/intro_mobile_low.webm'
          }
        },
        thumbnail: 'compressed/intro_mobile_thumb.jpg',
        duration: 30
      }
    };

    const manifestPath = path.join(VIDEO_CONFIG.inputDir, 'video-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ [VideoCompressor] Manifest generated: ${manifestPath}`);
  }

  /**
   * Generate compression report
   */
  generateReport() {
    console.log('\n📊 [VideoCompressor] === COMPRESSION REPORT ===');
    console.log(`🎬 Videos processed: ${this.stats.processed}`);
    console.log(`⏭️ Videos skipped: ${this.stats.skipped}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    const originalMB = (this.stats.originalSize / 1024 / 1024).toFixed(2);
    const compressedMB = (this.stats.compressedSize / 1024 / 1024).toFixed(2);
    const savingsMB = ((this.stats.originalSize - this.stats.compressedSize) / 1024 / 1024).toFixed(2);
    const savingsPercent = ((this.stats.originalSize - this.stats.compressedSize) / this.stats.originalSize * 100).toFixed(1);
    
    console.log(`💾 Original size: ${originalMB}MB`);
    console.log(`🗜️ Compressed size: ${compressedMB}MB`);
    console.log(`💰 Space saved: ${savingsMB}MB (${savingsPercent}%)`);
    
    console.log('\n🎯 Expected Results:');
    console.log('   • 40-60% size reduction for H.264');
    console.log('   • 50-70% size reduction for VP9');
    console.log('   • Multiple quality levels for different devices');
    console.log('   • Optimized for web streaming');
    console.log('   • Thumbnail generation for faster loading');
    
    console.log('\n📊 [VideoCompressor] === END REPORT ===');
  }

  /**
   * Main compression process
   */
  async compress() {
    console.log('🚀 [VideoCompressor] Starting video compression...');
    console.log(`📁 Input directory: ${VIDEO_CONFIG.inputDir}`);
    console.log(`📁 Output directory: ${VIDEO_CONFIG.outputDir}`);
    
    // Check FFmpeg
    if (!this.checkFFmpeg()) {
      return;
    }
    
    // Process videos
    await this.processDirectory(VIDEO_CONFIG.inputDir);
    
    // Generate manifest
    this.generateManifest();
    
    // Generate report
    this.generateReport();
    
    console.log('✅ [VideoCompressor] Compression completed successfully!');
  }
}

// Run compression if called directly
if (require.main === module) {
  const compressor = new VideoCompressor();
  compressor.compress().catch(console.error);
}

module.exports = VideoCompressor;


