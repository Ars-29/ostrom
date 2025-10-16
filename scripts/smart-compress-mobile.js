// scripts/smart-compress-mobile.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class SmartImageCompressor {
  constructor() {
    this.stats = {
      total: 0,
      skipped: 0,
      compressed: 0,
      errors: 0,
      originalSize: 0,
      compressedSize: 0
    };
    
    // Compression rules based on file size and dimensions
    this.compressionRules = {
      // Skip if file is already small
      skipSmall: {
        maxSizeKB: 20,
        reason: 'File already optimized'
      },
      
      // Light compression for medium files
      lightCompression: {
        minSizeKB: 20,
        maxSizeKB: 50,
        maxWidth: 800,
        quality: 70,
        reason: 'Light compression for medium files'
      },
      
      // Medium compression for larger files
      mediumCompression: {
        minSizeKB: 50,
        maxSizeKB: 200,
        maxWidth: 800,
        quality: 60,
        reason: 'Medium compression for larger files'
      },
      
      // Aggressive compression for large files
      aggressiveCompression: {
        minSizeKB: 200,
        maxWidth: 800,
        quality: 50,
        reason: 'Aggressive compression for large files'
      }
    };
  }
  
  /**
   * Analyze image and determine compression strategy
   */
  async analyzeImage(imagePath) {
    try {
      const stats = fs.statSync(imagePath);
      const fileSizeKB = stats.size / 1024;
      
      const metadata = await sharp(imagePath).metadata();
      const { width, height, format } = metadata;
      
      return {
        path: imagePath,
        fileSizeKB: Math.round(fileSizeKB * 10) / 10,
        width,
        height,
        format: format.toUpperCase(),
        aspectRatio: Math.round((width / height) * 100) / 100
      };
    } catch (error) {
      console.error(`❌ Failed to analyze ${imagePath}:`, error.message);
      return null;
    }
  }
  
  /**
   * Determine compression strategy based on image analysis
   */
  determineCompressionStrategy(analysis) {
    const { fileSizeKB, width } = analysis;
    
    // Rule 1: Skip small files
    if (fileSizeKB <= this.compressionRules.skipSmall.maxSizeKB) {
      return {
        action: 'skip',
        reason: this.compressionRules.skipSmall.reason,
        quality: null,
        maxWidth: null
      };
    }
    
    // Rule 2: Light compression for medium files
    if (fileSizeKB > this.compressionRules.lightCompression.minSizeKB && 
        fileSizeKB <= this.compressionRules.lightCompression.maxSizeKB) {
      
      if (width > this.compressionRules.lightCompression.maxWidth) {
        return {
          action: 'compress',
          reason: this.compressionRules.lightCompression.reason,
          quality: this.compressionRules.lightCompression.quality,
          maxWidth: this.compressionRules.lightCompression.maxWidth
        };
      } else {
        return {
          action: 'skip',
          reason: 'Medium file with acceptable dimensions',
          quality: null,
          maxWidth: null
        };
      }
    }
    
    // Rule 3: Medium compression for larger files
    if (fileSizeKB > this.compressionRules.mediumCompression.minSizeKB && 
        fileSizeKB <= this.compressionRules.mediumCompression.maxSizeKB) {
      
      return {
        action: 'compress',
        reason: this.compressionRules.mediumCompression.reason,
        quality: this.compressionRules.mediumCompression.quality,
        maxWidth: width > this.compressionRules.mediumCompression.maxWidth ? 
                  this.compressionRules.mediumCompression.maxWidth : null
      };
    }
    
    // Rule 4: Aggressive compression for large files
    if (fileSizeKB > this.compressionRules.aggressiveCompression.minSizeKB) {
      return {
        action: 'compress',
        reason: this.compressionRules.aggressiveCompression.reason,
        quality: this.compressionRules.aggressiveCompression.quality,
        maxWidth: this.compressionRules.aggressiveCompression.maxWidth
      };
    }
    
    // Default: skip
    return {
      action: 'skip',
      reason: 'No compression needed',
      quality: null,
      maxWidth: null
    };
  }
  
  /**
   * Compress image based on strategy
   */
  async compressImage(analysis, strategy, outputPath) {
    if (strategy.action === 'skip') {
      return { success: true, skipped: true, originalSize: analysis.fileSizeKB };
    }
    
    try {
      const { quality, maxWidth } = strategy;
      const { width, height, format } = analysis;
      
      // Calculate new dimensions
      let newWidth = width;
      let newHeight = height;
      
      if (maxWidth && width > maxWidth) {
        newWidth = maxWidth;
        newHeight = Math.round((height * maxWidth) / width);
      }
      
      // Prepare compression options
      const compressionOptions = {
        quality: quality,
        effort: 6 // Higher effort for better compression
      };
      
      // Format-specific options
      if (format === 'WEBP') {
        compressionOptions.webp = { quality: quality };
      } else if (format === 'JPEG' || format === 'JPG') {
        compressionOptions.jpeg = { quality: quality };
      } else if (format === 'PNG') {
        compressionOptions.png = { 
          quality: quality,
          compressionLevel: 9 
        };
      }
      
      // Perform compression
      await sharp(analysis.path)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat('webp', compressionOptions.webp || { quality: quality })
        .toFile(outputPath);
      
      // Calculate compression results
      const compressedStats = fs.statSync(outputPath);
      const compressedSizeKB = Math.round((compressedStats.size / 1024) * 10) / 10;
      const reduction = Math.round(((analysis.fileSizeKB - compressedSizeKB) / analysis.fileSizeKB) * 100);
      
      return {
        success: true,
        skipped: false,
        originalSize: analysis.fileSizeKB,
        compressedSize: compressedSizeKB,
        reduction: reduction,
        newDimensions: `${newWidth}x${newHeight}`,
        originalDimensions: `${width}x${height}`
      };
      
    } catch (error) {
      console.error(`❌ Compression failed for ${analysis.path}:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Process a single image file
   */
  async processImage(imagePath, outputDir) {
    this.stats.total++;
    
    // Analyze image
    const analysis = await this.analyzeImage(imagePath);
    if (!analysis) {
      this.stats.errors++;
      return;
    }
    
    // Determine compression strategy
    const strategy = this.determineCompressionStrategy(analysis);
    
    // Create output path
    const relativePath = path.relative('./public/images', imagePath);
    const outputPath = path.join(outputDir, relativePath);
    const outputDirPath = path.dirname(outputPath);
    
    // Ensure output directory exists
    fs.mkdirSync(outputDirPath, { recursive: true });
    
    // Process image
    const result = await this.compressImage(analysis, strategy, outputPath);
    
    if (result.success) {
      if (result.skipped) {
        this.stats.skipped++;
        console.log(`⏭️  SKIP: ${relativePath} (${analysis.fileSizeKB}KB, ${analysis.width}x${analysis.height}) - ${strategy.reason}`);
      } else {
        this.stats.compressed++;
        this.stats.originalSize += result.originalSize;
        this.stats.compressedSize += result.compressedSize;
        
        console.log(`✅ COMPRESS: ${relativePath}`);
        console.log(`   📊 ${analysis.fileSizeKB}KB → ${result.compressedSize}KB (${result.reduction}% reduction)`);
        console.log(`   📐 ${result.originalDimensions} → ${result.newDimensions}`);
        console.log(`   🎯 ${strategy.reason}`);
      }
    } else {
      this.stats.errors++;
      console.log(`❌ ERROR: ${relativePath} - ${result.error}`);
    }
  }
  
  /**
   * Process all images in a directory
   */
  async processDirectory(sourceDir, outputDir) {
    console.log(`\n🔄 Processing directory: ${sourceDir}`);
    console.log(`📁 Output directory: ${outputDir}`);
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const files = this.getAllImageFiles(sourceDir, imageExtensions);
    
    console.log(`📊 Found ${files.length} image files to process\n`);
    
    for (const file of files) {
      await this.processImage(file, outputDir);
    }
  }
  
  /**
   * Get all image files recursively
   */
  getAllImageFiles(dir, extensions) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getAllImageFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.toLowerCase().endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  /**
   * Print compression statistics
   */
  printStats() {
    const totalReduction = this.stats.originalSize > 0 ? 
      Math.round(((this.stats.originalSize - this.stats.compressedSize) / this.stats.originalSize) * 100) : 0;
    
    console.log('\n📊 COMPRESSION STATISTICS');
    console.log('='.repeat(50));
    console.log(`📁 Total files processed: ${this.stats.total}`);
    console.log(`⏭️  Files skipped: ${this.stats.skipped}`);
    console.log(`✅ Files compressed: ${this.stats.compressed}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`📦 Original total size: ${this.stats.originalSize.toFixed(1)}KB`);
    console.log(`📦 Compressed total size: ${this.stats.compressedSize.toFixed(1)}KB`);
    console.log(`💾 Total space saved: ${(this.stats.originalSize - this.stats.compressedSize).toFixed(1)}KB`);
    console.log(`📈 Overall reduction: ${totalReduction}%`);
    
    if (this.stats.compressed > 0) {
      const avgReduction = Math.round(
        ((this.stats.originalSize - this.stats.compressedSize) / this.stats.compressed) / 
        (this.stats.originalSize / this.stats.compressed) * 100
      );
      console.log(`📊 Average reduction per file: ${avgReduction}%`);
    }
  }
  
  /**
   * Main compression process
   */
  async compressAllImages() {
    console.log('🚀 Starting Smart Image Compression');
    console.log('='.repeat(50));
    
    const sourceDir = './public/images';
    const outputDir = './public/mobile-assets';
    
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Process all images
    await this.processDirectory(sourceDir, outputDir);
    
    // Print final statistics
    this.printStats();
    
    console.log('\n🎉 Smart compression complete!');
    console.log(`📁 Mobile assets saved to: ${outputDir}`);
  }
}

// Run the compression
const compressor = new SmartImageCompressor();
compressor.compressAllImages().catch(console.error);

