// vite-plugins/threejs-optimizer.ts
import type { Plugin } from 'vite';

export function threejsOptimizer(): Plugin {
  return {
    name: 'threejs-optimizer',
    configResolved() {
      // Plugin loaded
    },
    
    buildStart() {
      // Starting build optimization
    },
    
    generateBundle(_, bundle) {
      // Optimizing bundle
      
      // Analyze bundle for Three.js optimizations
      let threejsSize = 0;
      let totalSize = 0;
      
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk') {
          totalSize += chunk.code.length;
          if (chunk.code.includes('three') || chunk.code.includes('THREE')) {
            threejsSize += chunk.code.length;
          }
        }
      });
      
      const threejsPercentage = (threejsSize / totalSize) * 100;
      
      // Performance recommendations
      if (threejsPercentage > 50) {
        // Three.js takes up more than 50% of bundle - consider lazy loading
      } else {
        // Three.js bundle size is reasonable
      }
    },
    
    buildEnd() {
      // Build optimization complete
    }
  };
}

export default threejsOptimizer;
