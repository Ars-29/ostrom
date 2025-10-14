// Asset Analysis Utility for Performance Monitoring
export interface AssetAnalysis {
  totalAssets: number;
  totalSize: number;
  byType: {
    images: { count: number; size: number; formats: Record<string, number> };
    videos: { count: number; size: number; formats: Record<string, number> };
    audio: { count: number; size: number; formats: Record<string, number> };
    fonts: { count: number; size: number; formats: Record<string, number> };
  };
  compressionRecommendations: string[];
  performanceScore: number;
}

export class AssetAnalyzer {
  private static instance: AssetAnalyzer;
  
  static getInstance(): AssetAnalyzer {
    if (!AssetAnalyzer.instance) {
      AssetAnalyzer.instance = new AssetAnalyzer();
    }
    return AssetAnalyzer.instance;
  }

  /**
   * Analyze current asset loading performance
   */
  async analyzeAssetPerformance(): Promise<AssetAnalysis> {
    console.log('🔍 [AssetAnalyzer] Starting comprehensive asset analysis...');
    
    const startTime = performance.now();
    
    // Analyze loaded assets from the preloader
    const loadedAssets = this.getLoadedAssetsInfo();
    
    // Calculate compression recommendations
    const recommendations = this.getCompressionRecommendations(loadedAssets);
    
    // Calculate performance score
    const performanceScore = this.calculatePerformanceScore(loadedAssets);
    
    const endTime = performance.now();
    const analysisTime = endTime - startTime;
    
    console.log(`⏱️ [AssetAnalyzer] Analysis completed in ${analysisTime.toFixed(2)}ms`);
    
    return {
      totalAssets: loadedAssets.totalCount,
      totalSize: loadedAssets.totalSize,
      byType: loadedAssets.byType,
      compressionRecommendations: recommendations,
      performanceScore
    };
  }

  private getLoadedAssetsInfo() {
    // This would typically analyze the actual loaded assets
    // For now, return estimated data based on our asset definitions
    return {
      totalCount: 67, // Total assets in SCENE_ASSETS_ENHANCED
      totalSize: 95000000, // ~95MB estimated
      byType: {
        images: { count: 60, size: 60000000, formats: { 'webp': 45, 'jpg': 10, 'png': 5 } },
        videos: { count: 2, size: 34000000, formats: { 'mp4': 2 } },
        audio: { count: 3, size: 1000000, formats: { 'mp3': 3 } },
        fonts: { count: 2, size: 0, formats: { 'woff2': 2 } }
      }
    };
  }

  private getCompressionRecommendations(assets: any): string[] {
    const recommendations: string[] = [];
    
    // Image compression recommendations
    if (assets.byType.images.size > 50000000) { // > 50MB
      recommendations.push('🚨 HIGH PRIORITY: Convert JPEG/PNG images to WebP format (25-35% size reduction)');
    }
    
    if (assets.byType.images.formats.jpg > 0) {
      recommendations.push('📸 Convert JPEG images to WebP for better compression');
    }
    
    if (assets.byType.images.formats.png > 0) {
      recommendations.push('🖼️ Convert PNG images to WebP or use PNG optimization');
    }
    
    // Video compression recommendations
    if (assets.byType.videos.size > 30000000) { // > 30MB
      recommendations.push('🎬 HIGH PRIORITY: Compress videos with H.264/H.265 codecs (40-60% size reduction)');
    }
    
    if (assets.byType.videos.count > 0) {
      recommendations.push('📹 Create multiple quality versions (high/medium/low) for different devices');
    }
    
    // General recommendations
    recommendations.push('🎯 Implement texture atlases to reduce draw calls');
    recommendations.push('🔤 Use font subsetting and variable fonts');
    recommendations.push('📱 Implement responsive images with srcset');
    recommendations.push('⚡ Use lazy loading for non-critical assets');
    
    return recommendations;
  }

  private calculatePerformanceScore(assets: any): number {
    let score = 100;
    
    // Deduct points for large asset sizes
    if (assets.totalSize > 100000000) score -= 30; // > 100MB
    else if (assets.totalSize > 50000000) score -= 20; // > 50MB
    else if (assets.totalSize > 20000000) score -= 10; // > 20MB
    
    // Deduct points for inefficient formats
    if (assets.byType.images.formats.jpg > 0) score -= 5;
    if (assets.byType.images.formats.png > 0) score -= 3;
    
    // Deduct points for large videos
    if (assets.byType.videos.size > 30000000) score -= 15;
    
    return Math.max(0, score);
  }

  /**
   * Log comprehensive performance report
   */
  logPerformanceReport(analysis: AssetAnalysis): void {
    console.log('📊 [AssetAnalyzer] === PERFORMANCE ANALYSIS REPORT ===');
    console.log(`📦 Total Assets: ${analysis.totalAssets}`);
    console.log(`💾 Total Size: ${(analysis.totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`🎯 Performance Score: ${analysis.performanceScore}/100`);
    
    console.log('\n📸 Image Assets:');
    console.log(`   Count: ${analysis.byType.images.count}`);
    console.log(`   Size: ${(analysis.byType.images.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Formats:`, analysis.byType.images.formats);
    
    console.log('\n🎬 Video Assets:');
    console.log(`   Count: ${analysis.byType.videos.count}`);
    console.log(`   Size: ${(analysis.byType.videos.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Formats:`, analysis.byType.videos.formats);
    
    console.log('\n🔊 Audio Assets:');
    console.log(`   Count: ${analysis.byType.audio.count}`);
    console.log(`   Size: ${(analysis.byType.audio.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Formats:`, analysis.byType.audio.formats);
    
    console.log('\n💡 Compression Recommendations:');
    analysis.compressionRecommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    console.log('\n📊 [AssetAnalyzer] === END REPORT ===');
  }

  /**
   * Monitor asset loading in real-time
   */
  startRealTimeMonitoring(): void {
    console.log('🔍 [AssetAnalyzer] Starting real-time asset monitoring...');
    
    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const response = await originalFetch(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const url = args[0] as string;
      if (url.includes('/images/') || url.includes('/videos/') || url.includes('/audio/')) {
        console.log(`🌐 [AssetAnalyzer] Asset request: ${url}`);
        console.log(`⏱️ [AssetAnalyzer] Load time: ${duration.toFixed(2)}ms`);
        console.log(`📏 [AssetAnalyzer] Response size: ${response.headers.get('content-length') || 'unknown'} bytes`);
      }
      
      return response;
    };
  }
}

// Export singleton instance
export const assetAnalyzer = AssetAnalyzer.getInstance();


