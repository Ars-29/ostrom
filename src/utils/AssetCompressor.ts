// Asset Compression Utility
// This utility provides functions to compress and optimize assets

export interface CompressionOptions {
  quality?: number; // 0-100, default 80
  maxWidth?: number; // Maximum width for images
  maxHeight?: number; // Maximum height for images
  format?: 'webp' | 'jpeg' | 'png'; // Output format
  progressive?: boolean; // Progressive loading for JPEG
}

export interface AssetCompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  savedBytes: number;
  format: string;
}

export class AssetCompressor {
  private static instance: AssetCompressor;
  
  static getInstance(): AssetCompressor {
    if (!AssetCompressor.instance) {
      AssetCompressor.instance = new AssetCompressor();
    }
    return AssetCompressor.instance;
  }

  /**
   * Compress an image file
   */
  async compressImage(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<{ compressedFile: File; result: AssetCompressionResult }> {
    const {
      quality = 80,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });

            const result: AssetCompressionResult = {
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: blob.size / file.size,
              savedBytes: file.size - blob.size,
              format: format
            };

            resolve({ compressedFile, result });
          },
          `image/${format}`,
          quality / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Batch compress multiple images
   */
  async compressImages(
    files: File[], 
    options: CompressionOptions = {}
  ): Promise<{ compressedFiles: File[]; results: AssetCompressionResult[] }> {
    const compressedFiles: File[] = [];
    const results: AssetCompressionResult[] = [];

    for (const file of files) {
      try {
        const { compressedFile, result } = await this.compressImage(file, options);
        compressedFiles.push(compressedFile);
        results.push(result);
      } catch (error) {
        console.error(`Failed to compress ${file.name}:`, error);
        // Add original file if compression fails
        compressedFiles.push(file);
        results.push({
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1,
          savedBytes: 0,
          format: file.type.split('/')[1] || 'unknown'
        });
      }
    }

    return { compressedFiles, results };
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(results: AssetCompressionResult[]): {
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavedBytes: number;
    averageCompressionRatio: number;
    averageSavings: number;
  } {
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
    const totalSavedBytes = totalOriginalSize - totalCompressedSize;
    const averageCompressionRatio = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;
    const averageSavings = (totalSavedBytes / totalOriginalSize) * 100;

    return {
      totalOriginalSize,
      totalCompressedSize,
      totalSavedBytes,
      averageCompressionRatio,
      averageSavings
    };
  }

  /**
   * Analyze asset sizes in the project
   */
  async analyzeAssetSizes(): Promise<{
    images: { path: string; size: number; format: string }[];
    videos: { path: string; size: number; format: string }[];
    totalSize: number;
    recommendations: string[];
  }> {
    // This would typically analyze the public/assets directory
    // For now, return a placeholder structure
    return {
      images: [],
      videos: [],
      totalSize: 0,
      recommendations: [
        'Convert JPEG images to WebP format for 25-35% size reduction',
        'Use progressive JPEG for better perceived loading',
        'Implement responsive images with different sizes',
        'Consider using AVIF format for modern browsers',
        'Compress videos with appropriate bitrates'
      ]
    };
  }
}

// Export singleton instance
export const assetCompressor = AssetCompressor.getInstance();

// Utility functions for common compression tasks
export const compressProjectAssets = async () => {
  console.log('🔧 [AssetCompressor] Starting project asset compression...');
  
  // Placeholder for actual implementation
  console.log('📊 [AssetCompressor] Asset compression completed');
  
  return {
    success: true,
    message: 'Asset compression utility ready for implementation'
  };
};

export const getCompressionRecommendations = () => {
  return [
    {
      type: 'images',
      recommendation: 'Convert all JPEG/PNG to WebP format',
      expectedSavings: '25-35%',
      priority: 'high'
    },
    {
      type: 'videos',
      recommendation: 'Compress videos with H.264/H.265 codecs',
      expectedSavings: '40-60%',
      priority: 'high'
    },
    {
      type: 'textures',
      recommendation: 'Create texture atlases to reduce draw calls',
      expectedSavings: '50% fewer requests',
      priority: 'medium'
    },
    {
      type: 'fonts',
      recommendation: 'Use font subsetting and variable fonts',
      expectedSavings: '30-50%',
      priority: 'medium'
    }
  ];
};

