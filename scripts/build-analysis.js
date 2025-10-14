// scripts/build-analysis.js
import fs from 'fs';
import path from 'path';

const analyzeBuild = () => {
  const distPath = './dist';
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ No dist folder found. Run "npm run build" first.');
    return;
  }

  console.log('📊 [Build Analysis] Analyzing build output...\n');

  // Analyze JavaScript bundles
  const jsFiles = [];
  const cssFiles = [];
  const assetFiles = [];

  const analyzeDirectory = (dir, prefix = '') => {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(fullPath, `${prefix}${item}/`);
      } else {
        const size = stat.size;
        const sizeKB = (size / 1024).toFixed(2);
        
        if (item.endsWith('.js')) {
          jsFiles.push({ name: `${prefix}${item}`, size: sizeKB, path: fullPath });
        } else if (item.endsWith('.css')) {
          cssFiles.push({ name: `${prefix}${item}`, size: sizeKB, path: fullPath });
        } else {
          assetFiles.push({ name: `${prefix}${item}`, size: sizeKB, path: fullPath });
        }
      }
    });
  };

  analyzeDirectory(distPath);

  // Sort by size (largest first)
  jsFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  cssFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));

  // Calculate totals
  const totalJS = jsFiles.reduce((sum, file) => sum + parseFloat(file.size), 0);
  const totalCSS = cssFiles.reduce((sum, file) => sum + parseFloat(file.size), 0);
  const totalAssets = assetFiles.reduce((sum, file) => sum + parseFloat(file.size), 0);
  const totalSize = totalJS + totalCSS + totalAssets;

  console.log('📦 JavaScript Bundles:');
  jsFiles.forEach(file => {
    console.log(`  ${file.name}: ${file.size} KB`);
  });
  console.log(`  Total JS: ${totalJS.toFixed(2)} KB\n`);

  console.log('🎨 CSS Files:');
  cssFiles.forEach(file => {
    console.log(`  ${file.name}: ${file.size} KB`);
  });
  console.log(`  Total CSS: ${totalCSS.toFixed(2)} KB\n`);

  console.log('📊 Summary:');
  console.log(`  Total Bundle Size: ${totalSize.toFixed(2)} KB`);
  console.log(`  JavaScript: ${totalJS.toFixed(2)} KB (${((totalJS/totalSize)*100).toFixed(1)}%)`);
  console.log(`  CSS: ${totalCSS.toFixed(2)} KB (${((totalCSS/totalSize)*100).toFixed(1)}%)`);
  console.log(`  Assets: ${totalAssets.toFixed(2)} KB (${((totalAssets/totalSize)*100).toFixed(1)}%)\n`);

  // Performance analysis
  console.log('⚡ Performance Analysis:');
  
  if (totalSize < 500) {
    console.log('  ✅ EXCELLENT: Total bundle < 500KB');
  } else if (totalSize < 1000) {
    console.log('  🟡 GOOD: Total bundle < 1MB');
  } else if (totalSize < 2000) {
    console.log('  🟠 FAIR: Total bundle < 2MB');
  } else {
    console.log('  🔴 NEEDS IMPROVEMENT: Total bundle > 2MB');
  }

  // Check for large chunks
  const largeChunks = jsFiles.filter(file => parseFloat(file.size) > 200);
  if (largeChunks.length > 0) {
    console.log('  ⚠️  Large chunks detected:');
    largeChunks.forEach(chunk => {
      console.log(`    - ${chunk.name}: ${chunk.size} KB`);
    });
  } else {
    console.log('  ✅ All chunks are reasonably sized');
  }

  // Code splitting analysis
  console.log(`  📈 Code splitting: ${jsFiles.length} JavaScript chunks`);
  if (jsFiles.length >= 5) {
    console.log('  ✅ Good code splitting achieved');
  } else {
    console.log('  ⚠️  Consider more aggressive code splitting');
  }

  console.log('\n🎉 Build analysis complete!');
};

analyzeBuild();


