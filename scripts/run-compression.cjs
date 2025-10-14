#!/usr/bin/env node

/**
 * Comprehensive Asset Compression Runner
 * Orchestrates all compression tasks (images, videos, texture atlases)
 */

const fs = require('fs');
const path = require('path');

// Import compression modules
const ImageCompressor = require('./compress-images.cjs');
const VideoCompressor = require('./compress-videos.cjs');
const TextureAtlasGenerator = require('./generate-texture-atlases.cjs');

class CompressionRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      images: null,
      videos: null,
      atlases: null
    };
  }

  /**
   * Run image compression
   */
  async runImageCompression() {
    console.log('\n🖼️ === TASK 1.5: IMAGE COMPRESSION ===');
    const compressor = new ImageCompressor();
    await compressor.compress();
    this.results.images = compressor.stats;
  }

  /**
   * Run video compression
   */
  async runVideoCompression() {
    console.log('\n🎬 === TASK 1.6: VIDEO COMPRESSION ===');
    const compressor = new VideoCompressor();
    await compressor.compress();
    this.results.videos = compressor.stats;
  }

  /**
   * Run texture atlas generation
   */
  async runTextureAtlasGeneration() {
    console.log('\n🎨 === TASK 1.7: TEXTURE ATLAS GENERATION ===');
    const generator = new TextureAtlasGenerator();
    await generator.generate();
    this.results.atlases = generator.stats;
  }

  /**
   * Generate comprehensive report
   */
  generateComprehensiveReport() {
    const endTime = Date.now();
    const totalTime = (endTime - this.startTime) / 1000;

    console.log('\n🎉 === COMPREHENSIVE COMPRESSION REPORT ===');
    console.log(`⏱️ Total execution time: ${totalTime.toFixed(2)} seconds`);
    
    // Image compression results
    if (this.results.images) {
      console.log('\n📸 IMAGE COMPRESSION RESULTS:');
      console.log(`   • Images processed: ${this.results.images.processed}`);
      console.log(`   • Original size: ${(this.results.images.originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   • Compressed size: ${(this.results.images.compressedSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   • Space saved: ${((this.results.images.originalSize - this.results.images.compressedSize) / 1024 / 1024).toFixed(2)}MB`);
    }

    // Video compression results
    if (this.results.videos) {
      console.log('\n🎬 VIDEO COMPRESSION RESULTS:');
      console.log(`   • Videos processed: ${this.results.videos.processed}`);
      console.log(`   • Original size: ${(this.results.videos.originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   • Compressed size: ${(this.results.videos.compressedSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   • Space saved: ${((this.results.videos.originalSize - this.results.videos.compressedSize) / 1024 / 1024).toFixed(2)}MB`);
    }

    // Texture atlas results
    if (this.results.atlases) {
      console.log('\n🎨 TEXTURE ATLAS RESULTS:');
      console.log(`   • Atlases created: ${this.results.atlases.atlasesCreated}`);
      console.log(`   • Textures processed: ${this.results.atlases.texturesProcessed}`);
      console.log(`   • Draw calls reduced: ${this.results.atlases.drawCallsReduced}`);
    }

    // Overall impact
    const totalOriginalSize = (this.results.images?.originalSize || 0) + (this.results.videos?.originalSize || 0);
    const totalCompressedSize = (this.results.images?.compressedSize || 0) + (this.results.videos?.compressedSize || 0);
    const totalSavings = totalOriginalSize - totalCompressedSize;
    const savingsPercent = (totalSavings / totalOriginalSize * 100).toFixed(1);

    console.log('\n💰 OVERALL IMPACT:');
    console.log(`   • Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   • Total compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   • Total space saved: ${(totalSavings / 1024 / 1024).toFixed(2)}MB (${savingsPercent}%)`);
    
    console.log('\n🚀 PERFORMANCE IMPROVEMENTS:');
    console.log('   • Faster initial loading');
    console.log('   • Reduced bandwidth usage');
    console.log('   • Better mobile performance');
    console.log('   • Improved user experience');
    console.log('   • Reduced server costs');

    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Update components to use ResponsiveImage and ResponsiveVideo');
    console.log('   2. Implement texture atlases in Three.js scenes');
    console.log('   3. Test performance improvements');
    console.log('   4. Deploy optimized assets');

    console.log('\n🎉 === COMPRESSION COMPLETED SUCCESSFULLY! ===');
  }

  /**
   * Main compression process
   */
  async run() {
    console.log('🚀 Starting comprehensive asset compression...');
    console.log('📊 Expected results: 50-70% size reduction across all assets');
    
    try {
      // Run all compression tasks
      await this.runImageCompression();
      await this.runVideoCompression();
      await this.runTextureAtlasGeneration();
      
      // Generate comprehensive report
      this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Compression failed:', error);
      process.exit(1);
    }
  }
}

// Run compression if called directly
if (require.main === module) {
  const runner = new CompressionRunner();
  runner.run().catch(console.error);
}

module.exports = CompressionRunner;
