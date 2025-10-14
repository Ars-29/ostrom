// src/utils/BuildAnalyzer.ts
interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  assetSize: number;
  chunkCount: number;
  largestChunk: number;
  threejsSize: number;
  threejsPercentage: number;
}

export class BuildAnalyzer {
  private static instance: BuildAnalyzer;
  private metrics: BundleMetrics | null = null;

  static getInstance(): BuildAnalyzer {
    if (!BuildAnalyzer.instance) {
      BuildAnalyzer.instance = new BuildAnalyzer();
    }
    return BuildAnalyzer.instance;
  }

  analyzeBundle(bundleInfo: any): BundleMetrics {
    console.log('📊 [BuildAnalyzer] Analyzing bundle metrics...');

    const metrics: BundleMetrics = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      assetSize: 0,
      chunkCount: 0,
      largestChunk: 0,
      threejsSize: 0,
      threejsPercentage: 0,
    };

    // Analyze chunks
    Object.values(bundleInfo).forEach((chunk: any) => {
      if (chunk.type === 'chunk') {
        metrics.chunkCount++;
        metrics.jsSize += chunk.code.length;
        metrics.totalSize += chunk.code.length;
        
        if (chunk.code.length > metrics.largestChunk) {
          metrics.largestChunk = chunk.code.length;
        }

        // Check for Three.js content
        if (chunk.code.includes('three') || chunk.code.includes('THREE')) {
          metrics.threejsSize += chunk.code.length;
        }
      } else if (chunk.type === 'asset') {
        metrics.assetSize += chunk.source.length;
        metrics.totalSize += chunk.source.length;
      }
    });

    metrics.threejsPercentage = (metrics.threejsSize / metrics.jsSize) * 100;

    this.metrics = metrics;
    this.logAnalysis(metrics);
    
    return metrics;
  }

  private logAnalysis(metrics: BundleMetrics): void {
    console.log('📈 [BuildAnalyzer] === BUNDLE ANALYSIS ===');
    console.log(`📦 Total Bundle Size: ${(metrics.totalSize / 1024).toFixed(2)} KB`);
    console.log(`📄 JavaScript: ${(metrics.jsSize / 1024).toFixed(2)} KB`);
    console.log(`🎨 CSS: ${(metrics.cssSize / 1024).toFixed(2)} KB`);
    console.log(`🖼️ Assets: ${(metrics.assetSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Chunk Count: ${metrics.chunkCount}`);
    console.log(`🔍 Largest Chunk: ${(metrics.largestChunk / 1024).toFixed(2)} KB`);
    console.log(`🎯 Three.js Size: ${(metrics.threejsSize / 1024).toFixed(2)} KB (${metrics.threejsPercentage.toFixed(1)}%)`);

    // Performance recommendations
    console.log('\n💡 [BuildAnalyzer] Performance Recommendations:');
    
    if (metrics.totalSize / 1024 > 2000) {
      console.log('  🔴 Bundle size > 2MB - Consider more aggressive code splitting');
    } else if (metrics.totalSize / 1024 > 1000) {
      console.log('  🟡 Bundle size > 1MB - Monitor for optimization opportunities');
    } else {
      console.log('  ✅ Bundle size is reasonable');
    }

    if (metrics.largestChunk / 1024 > 500) {
      console.log('  ⚠️ Largest chunk > 500KB - Consider splitting large chunks');
    } else {
      console.log('  ✅ Chunk sizes are reasonable');
    }

    if (metrics.threejsPercentage > 50) {
      console.log('  ⚠️ Three.js > 50% of bundle - Consider lazy loading 3D scenes');
    } else {
      console.log('  ✅ Three.js bundle size is reasonable');
    }

    if (metrics.chunkCount < 5) {
      console.log('  ⚠️ Low chunk count - Consider more aggressive code splitting');
    } else {
      console.log('  ✅ Good code splitting achieved');
    }

    console.log('📈 [BuildAnalyzer] === END ANALYSIS ===\n');
  }

  getMetrics(): BundleMetrics | null {
    return this.metrics;
  }

  // Performance scoring
  getPerformanceScore(): number {
    if (!this.metrics) return 0;

    let score = 100;

    // Deduct points for large bundle size
    if (this.metrics.totalSize / 1024 > 2000) score -= 30;
    else if (this.metrics.totalSize / 1024 > 1000) score -= 15;

    // Deduct points for large chunks
    if (this.metrics.largestChunk / 1024 > 500) score -= 20;
    else if (this.metrics.largestChunk / 1024 > 300) score -= 10;

    // Deduct points for high Three.js percentage
    if (this.metrics.threejsPercentage > 60) score -= 25;
    else if (this.metrics.threejsPercentage > 40) score -= 10;

    // Deduct points for low chunk count
    if (this.metrics.chunkCount < 3) score -= 20;
    else if (this.metrics.chunkCount < 5) score -= 10;

    return Math.max(0, score);
  }
}

export const buildAnalyzer = BuildAnalyzer.getInstance();
export default BuildAnalyzer;


