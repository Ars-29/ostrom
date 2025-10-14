// scripts/test-service-worker.js
import { serviceWorkerTester } from '../src/utils/ServiceWorkerTester.js';

console.log('🧪 [ServiceWorker Test Script] Starting Service Worker tests...');
console.log('📝 [ServiceWorker Test Script] This script tests the Service Worker implementation');
console.log('📝 [ServiceWorker Test Script] Run this after starting the dev server and visiting the site');
console.log('');

// Run all tests
serviceWorkerTester.runTests().then(() => {
  console.log('');
  console.log('🎯 [ServiceWorker Test Script] Manual testing commands:');
  console.log('  - serviceWorkerTester.testSpecificUrl("/images/logo.svg")');
  console.log('  - serviceWorkerTester.getCacheStats()');
  console.log('  - serviceWorkerTester.clearAllCaches()');
  console.log('');
  console.log('🌐 [ServiceWorker Test Script] To test offline functionality:');
  console.log('  1. Open DevTools → Network tab');
  console.log('  2. Check "Offline" checkbox');
  console.log('  3. Refresh the page');
  console.log('  4. Check if cached resources still load');
  console.log('');
  console.log('🔄 [ServiceWorker Test Script] To test cache updates:');
  console.log('  1. Modify sw.js file');
  console.log('  2. Refresh the page');
  console.log('  3. Check console for update messages');
  console.log('  4. Check Application tab → Service Workers');
});


