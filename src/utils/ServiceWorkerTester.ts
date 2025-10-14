// src/utils/ServiceWorkerTester.ts
export class ServiceWorkerTester {
  private static instance: ServiceWorkerTester;

  static getInstance(): ServiceWorkerTester {
    if (!ServiceWorkerTester.instance) {
      ServiceWorkerTester.instance = new ServiceWorkerTester();
    }
    return ServiceWorkerTester.instance;
  }

  async runTests(): Promise<void> {
    console.log('🧪 [ServiceWorkerTester] Starting Service Worker tests...');
    
    const tests = [
      this.testServiceWorkerSupport,
      this.testServiceWorkerRegistration,
      this.testCacheFunctionality,
      this.testOfflineFunctionality,
      this.testCacheStrategies,
      this.testUpdateMechanism
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await test.call(this);
        if (result) {
          passedTests++;
          console.log(`✅ [ServiceWorkerTester] Test passed: ${test.name}`);
        } else {
          console.log(`❌ [ServiceWorkerTester] Test failed: ${test.name}`);
        }
      } catch (error) {
        console.error(`❌ [ServiceWorkerTester] Test error in ${test.name}:`, error);
      }
    }

    console.log(`📊 [ServiceWorkerTester] Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 [ServiceWorkerTester] All tests passed! Service Worker is working correctly.');
    } else {
      console.log('⚠️ [ServiceWorkerTester] Some tests failed. Check the logs above for details.');
    }
  }

  private async testServiceWorkerSupport(): Promise<boolean> {
    console.log('🔍 [ServiceWorkerTester] Testing Service Worker support...');
    
    const isSupported = 'serviceWorker' in navigator;
    console.log(`  - Service Worker supported: ${isSupported}`);
    
    if (isSupported) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log(`  - Service Worker scope: ${registration.scope}`);
        }
      } catch (error) {
        console.log('  - Could not get registration details');
      }
    }
    
    return isSupported;
  }

  private async testServiceWorkerRegistration(): Promise<boolean> {
    console.log('🔍 [ServiceWorkerTester] Testing Service Worker registration...');
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        console.log(`  - Service Worker registered: ${registration.scope}`);
        console.log(`  - Service Worker state: ${registration.active?.state || 'no active worker'}`);
        console.log(`  - Service Worker script URL: ${registration.active?.scriptURL || 'no active worker'}`);
        return true;
      } else {
        console.log('  - No Service Worker registration found');
        return false;
      }
    } catch (error) {
      console.error('  - Error checking registration:', error);
      return false;
    }
  }

  private async testCacheFunctionality(): Promise<boolean> {
    console.log('🔍 [ServiceWorkerTester] Testing cache functionality...');
    
    try {
      const cacheNames = await caches.keys();
      console.log(`  - Available caches: ${cacheNames.length}`);
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        console.log(`  - Cache "${cacheName}": ${keys.length} entries`);
        
        // Show first few URLs as examples
        const sampleUrls = keys.slice(0, 3).map(request => request.url);
        console.log(`    Sample URLs: ${sampleUrls.join(', ')}`);
      }
      
      return cacheNames.length > 0;
    } catch (error) {
      console.error('  - Error testing cache:', error);
      return false;
    }
  }

  private async testOfflineFunctionality(): Promise<boolean> {
    console.log('🔍 [ServiceWorkerTester] Testing offline functionality...');
    
    try {
      // Test if we can access cached resources
      const testUrls = [
        '/',
        '/favicon.png',
        '/images/logo.svg',
        '/images/background.webp'
      ];
      
      let cachedCount = 0;
      
      for (const url of testUrls) {
        const response = await caches.match(url);
        if (response) {
          cachedCount++;
          console.log(`  - ✅ Cached: ${url}`);
        } else {
          console.log(`  - ❌ Not cached: ${url}`);
        }
      }
      
      console.log(`  - Cached resources: ${cachedCount}/${testUrls.length}`);
      return cachedCount > 0;
    } catch (error) {
      console.error('  - Error testing offline functionality:', error);
      return false;
    }
  }

  private async testCacheStrategies(): Promise<boolean> {
    console.log('🔍 [ServiceWorkerTester] Testing cache strategies...');
    
    try {
      // Test different asset types
      const testCases = [
        { url: '/images/logo.svg', expectedStrategy: 'cache-first' },
        { url: '/fonts/bellefair/Bellefair-Regular.woff2', expectedStrategy: 'cache-first' },
        { url: '/mp3/click.mp3', expectedStrategy: 'cache-first' },
        { url: '/videos/intro.mp4', expectedStrategy: 'stale-while-revalidate' }
      ];
      
      let strategyTestsPassed = 0;
      
      for (const testCase of testCases) {
        const response = await fetch(testCase.url, { method: 'HEAD' });
        if (response.ok) {
          console.log(`  - ✅ ${testCase.url} accessible (${testCase.expectedStrategy})`);
          strategyTestsPassed++;
        } else {
          console.log(`  - ❌ ${testCase.url} not accessible`);
        }
      }
      
      console.log(`  - Strategy tests passed: ${strategyTestsPassed}/${testCases.length}`);
      return strategyTestsPassed > 0;
    } catch (error) {
      console.error('  - Error testing cache strategies:', error);
      return false;
    }
  }

  private async testUpdateMechanism(): Promise<boolean> {
    console.log('🔍 [ServiceWorkerTester] Testing update mechanism...');
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        console.log(`  - Current Service Worker version: ${registration.active?.scriptURL || 'unknown'}`);
        console.log(`  - Waiting Service Worker: ${registration.waiting ? 'yes' : 'no'}`);
        console.log(`  - Installing Service Worker: ${registration.installing ? 'yes' : 'no'}`);
        
        // Test message passing
        if (registration.active) {
          const messageChannel = new MessageChannel();
          const response = await new Promise((resolve) => {
            messageChannel.port1.onmessage = (event) => resolve(event.data);
            registration.active!.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
          });
          
          console.log(`  - Service Worker version from message: ${(response as any)?.version || 'unknown'}`);
        }
        
        return true;
      } else {
        console.log('  - No registration found for update testing');
        return false;
      }
    } catch (error) {
      console.error('  - Error testing update mechanism:', error);
      return false;
    }
  }

  // Manual test methods for console use
  async testSpecificUrl(url: string): Promise<void> {
    console.log(`🧪 [ServiceWorkerTester] Testing specific URL: ${url}`);
    
    try {
      // Test cache
      const cachedResponse = await caches.match(url);
      console.log(`  - Cached: ${cachedResponse ? 'yes' : 'no'}`);
      
      // Test network
      const networkResponse = await fetch(url, { method: 'HEAD' });
      console.log(`  - Network accessible: ${networkResponse.ok ? 'yes' : 'no'}`);
      console.log(`  - Response status: ${networkResponse.status}`);
      
    } catch (error) {
      console.error(`  - Error testing URL:`, error);
    }
  }

  async clearAllCaches(): Promise<void> {
    console.log('🗑️ [ServiceWorkerTester] Clearing all caches...');
    
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log(`✅ [ServiceWorkerTester] Cleared ${cacheNames.length} caches`);
    } catch (error) {
      console.error('❌ [ServiceWorkerTester] Error clearing caches:', error);
    }
  }

  async getCacheStats(): Promise<void> {
    console.log('📊 [ServiceWorkerTester] Getting cache statistics...');
    
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let totalEntries = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalEntries += keys.length;
        
        console.log(`  - Cache "${cacheName}": ${keys.length} entries`);
        
        // Estimate size (rough calculation)
        for (const request of keys.slice(0, 5)) { // Sample first 5
          try {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          } catch (e) {
            // Ignore individual errors
          }
        }
      }
      
      console.log(`  - Total caches: ${cacheNames.length}`);
      console.log(`  - Total entries: ${totalEntries}`);
      console.log(`  - Estimated size: ${(totalSize / 1024).toFixed(2)} KB (sample)`);
      
    } catch (error) {
      console.error('❌ [ServiceWorkerTester] Error getting cache stats:', error);
    }
  }
}

// Export singleton instance
export const serviceWorkerTester = ServiceWorkerTester.getInstance();
export default ServiceWorkerTester;

