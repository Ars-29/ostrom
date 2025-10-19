// src/utils/ServiceWorkerManager.ts
interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;
  private hasCriticalUpdate: boolean = false;

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
    console.log('🔧 [ServiceWorkerManager] Initialized, supported:', this.isSupported);
  }

  async register(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('⚠️ [ServiceWorkerManager] Service Worker not supported');
      return false;
    }

    try {
      console.log('🚀 [ServiceWorkerManager] Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ [ServiceWorkerManager] Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 [ServiceWorkerManager] Service Worker update found');
        this.handleUpdate();
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 [ServiceWorkerManager] Service Worker controller changed');
        // Don't reload automatically - let user continue browsing
        // Only reload if there's a critical update
        if (this.hasCriticalUpdate) {
          console.log('🚨 [ServiceWorkerManager] Critical update detected, reloading...');
          window.location.reload();
        } else {
          console.log('✅ [ServiceWorkerManager] Service Worker updated in background');
        }
      });

      return true;
    } catch (error) {
      console.error('❌ [ServiceWorkerManager] Registration failed:', error);
      return false;
    }
  }

  private async handleUpdate(): Promise<void> {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('🔄 [ServiceWorkerManager] New Service Worker installed, update available');
        this.showUpdateNotification();
      }
    });
  }

  private showUpdateNotification(): void {
    // You can implement a custom update notification here
    console.log('📱 [ServiceWorkerManager] Update notification should be shown');
    
    // For now, we'll just log it. In a real app, you might show a toast notification
    if (confirm('A new version is available. Would you like to update?')) {
      this.skipWaiting();
    }
  }

  async skipWaiting(): Promise<void> {
    if (!this.registration) return;

    try {
      console.log('🔄 [ServiceWorkerManager] Skipping waiting...');
      
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('❌ [ServiceWorkerManager] Failed to skip waiting:', error);
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      console.log('🗑️ [ServiceWorkerManager] Unregistering Service Worker...');
      const result = await this.registration.unregister();
      console.log('✅ [ServiceWorkerManager] Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('❌ [ServiceWorkerManager] Unregistration failed:', error);
      return false;
    }
  }

  async getCacheInfo(): Promise<any> {
    if (!this.isSupported) return null;

    try {
      const cacheNames = await caches.keys();
      const cacheInfo: Record<string, { size: number; urls: string[] }> = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = {
          size: keys.length,
          urls: keys.map(request => request.url)
        };
      }

      return cacheInfo;
    } catch (error) {
      console.error('❌ [ServiceWorkerManager] Failed to get cache info:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    if (!this.isSupported) return;

    try {
      console.log('🗑️ [ServiceWorkerManager] Clearing all caches...');
      const cacheNames = await caches.keys();
      
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('✅ [ServiceWorkerManager] All caches cleared');
    } catch (error) {
      console.error('❌ [ServiceWorkerManager] Failed to clear caches:', error);
    }
  }

  async precacheAssets(assets: string[]): Promise<void> {
    if (!this.isSupported || !this.registration) return;

    try {
      console.log('📦 [ServiceWorkerManager] Precaching assets:', assets);
      
      const cache = await caches.open('ostrom-precache-v1');
      await cache.addAll(assets);
      
      console.log('✅ [ServiceWorkerManager] Assets precached successfully');
    } catch (error) {
      console.error('❌ [ServiceWorkerManager] Failed to precache assets:', error);
    }
  }

  isServiceWorkerSupported(): boolean {
    return this.isSupported;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // Send message to service worker
  async sendMessage(message: ServiceWorkerMessage): Promise<any> {
    if (!this.registration || !this.registration.active) {
      console.warn('⚠️ [ServiceWorkerManager] No active service worker');
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      this.registration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }

  // Get service worker version
  async getVersion(): Promise<string | null> {
    try {
      const response = await this.sendMessage({ type: 'GET_VERSION' });
      return response?.version || null;
    } catch (error) {
      console.error('❌ [ServiceWorkerManager] Failed to get version:', error);
      return null;
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = ServiceWorkerManager.getInstance();
export default ServiceWorkerManager;

