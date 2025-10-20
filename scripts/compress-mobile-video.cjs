#!/usr/bin/env node

/**
 * Mobile Video Compression Script
 * Specialized compression for mobile devices with aggressive optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// FFmpeg path
const FFMPEG_PATH = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0-full_build\\bin\\ffmpeg.exe`;

// Mobile-optimized compression settings
const MOBILE_COMPRESSION_CONFIG = {
  // Ultra-aggressive compression for mobile
  ultra: {
    crf: 32,           // Higher CRF = smaller file, lower quality
    preset: 'ultrafast', // Fastest encoding
    resolution: '854x480', // 480p for mobile
    bitrate: '500k',   // Very low bitrate
    audioBitrate: '64k', // Low audio bitrate
    fps: 24,           // Lower FPS for smaller size
    description: 'Ultra-compressed for slow connections'
  },
  
  // Aggressive compression
  aggressive: {
    crf: 28,
    preset: 'fast',
    resolution: '1280x720', // 720p
    bitrate: '1000k',
    audioBitrate: '96k',
    fps: 30,
    description: 'Aggressive compression for mobile'
  },
  
  // Balanced compression
  balanced: {
    crf: 25,
    preset: 'medium',
    resolution: '1280x720', // 720p
    bitrate: '1500k',
    audioBitrate: '128k',
    fps: 30,
    description: 'Balanced quality/size for mobile'
  }
};

class MobileVideoCompressor {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      originalSize: 0,
      compressedSize: 0
    };
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
   * Get video info using ffprobe
   */
  getVideoInfo(filePath) {
    try {
      const ffprobePath = FFMPEG_PATH.replace('ffmpeg.exe', 'ffprobe.exe');
      const command = `"${ffprobePath}" -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const output = execSync(command, { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error) {
      console.warn(`⚠️ Could not get video info for ${filePath}`);
      return null;
    }
  }

  /**
   * Compress video with mobile-optimized settings
   */
  compressVideo(inputPath, outputPath, quality) {
    try {
      const config = MOBILE_COMPRESSION_CONFIG[quality];
      
      const command = [
        `"${FFMPEG_PATH}"`,
        '-i', `"${inputPath}"`,
        '-c:v', 'libx264',
        '-crf', config.crf.toString(),
        '-preset', config.preset,
        '-vf', `scale=${config.resolution}`,
        '-b:v', config.bitrate,
        '-maxrate', config.bitrate,
        '-bufsize', (parseInt(config.bitrate) * 2) + 'k',
        '-c:a', 'aac',
        '-b:a', config.audioBitrate,
        '-r', config.fps.toString(),
        '-movflags', '+faststart', // Optimize for web streaming
        '-profile:v', 'baseline', // H.264 baseline profile for better mobile compatibility
        '-level', '3.0', // H.264 level 3.0 for mobile devices
        '-pix_fmt', 'yuv420p', // Ensure mobile compatibility
        '-y', // Overwrite output file
        `"${outputPath}"`
      ].join(' ');

      console.log(`🔄 Compressing ${path.basename(inputPath)} (${quality} quality)...`);
      console.log(`   📊 Target: ${config.resolution} @ ${config.fps}fps, ${config.bitrate} bitrate`);
      console.log(`   🎯 ${config.description}`);
      
      execSync(command, { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(`❌ Compression failed for ${inputPath}:`, error.message);
      return false;
    }
  }

  /**
   * Process a single video file
   */
  async processVideo(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip if not a video file
    if (!['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
      console.log(`⏭️ Skipping non-video file: ${fileName}`);
      return;
    }

    console.log(`\n🎬 Processing: ${fileName}`);
    
    const originalSize = this.getFileSize(filePath);
    const videoInfo = this.getVideoInfo(filePath);
    this.stats.originalSize += originalSize;
    
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);
    
    // Create compressed versions
    const qualities = ['ultra', 'aggressive', 'balanced'];
    let totalCompressedSize = 0;
    let successCount = 0;

    for (const quality of qualities) {
      const outputPath = path.join(dirName, `${baseName}_${quality}.mp4`);
      
      if (this.compressVideo(filePath, outputPath, quality)) {
        const compressedSize = this.getFileSize(outputPath);
        totalCompressedSize += compressedSize;
        successCount++;
        
        const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);
        console.log(`   ✅ ${quality}: ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)`);
      }
    }

    if (successCount > 0) {
      this.stats.compressedSize += totalCompressedSize;
      this.stats.processed++;
      
      console.log(`\n📊 Results for ${fileName}:`);
      console.log(`   📦 Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   🗜️ Compressed: ${(totalCompressedSize / 1024 / 1024).toFixed(2)}MB`);
      
      if (videoInfo) {
        const duration = parseFloat(videoInfo.format.duration);
        console.log(`   ⏱️ Duration: ${duration.toFixed(1)}s`);
        console.log(`   📐 Resolution: ${videoInfo.streams[0].width}x${videoInfo.streams[0].height}`);
      }
    } else {
      this.stats.errors++;
      console.log(`❌ Failed to compress ${fileName}`);
    }
  }

  /**
   * Generate compression report
   */
  generateReport() {
    console.log('\n📊 === MOBILE VIDEO COMPRESSION REPORT ===');
    console.log(`🎬 Videos processed: ${this.stats.processed}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    const originalMB = (this.stats.originalSize / 1024 / 1024).toFixed(2);
    const compressedMB = (this.stats.compressedSize / 1024 / 1024).toFixed(2);
    const savingsMB = ((this.stats.originalSize - this.stats.compressedSize) / 1024 / 1024).toFixed(2);
    const savingsPercent = ((this.stats.originalSize - this.stats.compressedSize) / this.stats.originalSize * 100).toFixed(1);
    
    console.log(`💾 Original total size: ${originalMB}MB`);
    console.log(`🗜️ Compressed total size: ${compressedMB}MB`);
    console.log(`💰 Space saved: ${savingsMB}MB (${savingsPercent}%)`);
    
    console.log('\n🎯 Mobile Optimization Features:');
    console.log('   • H.264 baseline profile for mobile compatibility');
    console.log('   • Optimized bitrates for mobile networks');
    console.log('   • Fast start for immediate playback');
    console.log('   • Multiple quality levels');
    console.log('   • Reduced resolution and FPS for smaller files');
    
    console.log('\n📊 === END REPORT ===');
  }

  /**
   * Main compression process
   */
  async compress(inputPath) {
    console.log('🚀 Starting Mobile Video Compression...');
    console.log(`📁 Processing: ${inputPath}`);
    
    // Check if file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ File not found: ${inputPath}`);
      return;
    }
    
    // Process the video
    await this.processVideo(inputPath);
    
    // Generate report
    this.generateReport();
    
    console.log('\n✅ Mobile video compression completed!');
  }
}

// Run compression if called directly
if (require.main === module) {
  const compressor = new MobileVideoCompressor();
  
  // Get input file from command line argument or use default
  const inputFile = process.argv[2] || 'mobile-assets/videos/intro_mobile.mp4';
  
  compressor.compress(inputFile).catch(console.error);
}

module.exports = MobileVideoCompressor;
