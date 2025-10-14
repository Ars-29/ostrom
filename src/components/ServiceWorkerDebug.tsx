// src/components/ServiceWorkerDebug.tsx
import React, { useState, useEffect } from 'react';
import { serviceWorkerManager } from '../utils/ServiceWorkerManager';
import { serviceWorkerTester } from '../utils/ServiceWorkerTester';

interface ServiceWorkerDebugProps {
  isVisible?: boolean;
}

export const ServiceWorkerDebug: React.FC<ServiceWorkerDebugProps> = ({ isVisible = false }) => {
  const [swStatus, setSwStatus] = useState<string>('Unknown');
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string>('');

  useEffect(() => {
    setIsSupported(serviceWorkerManager.isServiceWorkerSupported());
    updateStatus();
  }, []);

  const updateStatus = async () => {
    const registration = serviceWorkerManager.getRegistration();
    if (registration) {
      setSwStatus(registration.active ? 'Active' : 'Inactive');
    } else {
      setSwStatus('Not Registered');
    }

    const cacheData = await serviceWorkerManager.getCacheInfo();
    setCacheInfo(cacheData);
  };

  const runTests = async () => {
    setTestResults('Running tests...');
    
    // Capture console output
    const originalLog = console.log;
    let testOutput = '';
    
    console.log = (...args) => {
      testOutput += args.join(' ') + '\n';
      originalLog(...args);
    };

    try {
      await serviceWorkerTester.runTests();
      setTestResults(testOutput);
    } catch (error) {
      setTestResults(`Test error: ${error}`);
    } finally {
      console.log = originalLog;
    }
  };

  const clearCache = async () => {
    await serviceWorkerManager.clearCache();
    await updateStatus();
  };

  const skipWaiting = async () => {
    await serviceWorkerManager.skipWaiting();
    await updateStatus();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4CAF50' }}>🔧 Service Worker Debug</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {swStatus}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Supported:</strong> {isSupported ? '✅' : '❌'}
      </div>

      {cacheInfo && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Cache Info:</strong>
          {Object.entries(cacheInfo).map(([name, info]: [string, any]) => (
            <div key={name} style={{ marginLeft: '10px', fontSize: '11px' }}>
              {name}: {info.size} entries
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={updateStatus}
          style={{
            padding: '5px 10px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh Status
        </button>
        
        <button
          onClick={runTests}
          style={{
            padding: '5px 10px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧪 Run Tests
        </button>
        
        <button
          onClick={clearCache}
          style={{
            padding: '5px 10px',
            background: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Cache
        </button>
        
        <button
          onClick={skipWaiting}
          style={{
            padding: '5px 10px',
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ⏭️ Skip Waiting
        </button>
      </div>

      {testResults && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          fontSize: '10px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <strong>Test Results:</strong>
          <pre style={{ margin: '5px 0 0 0', whiteSpace: 'pre-wrap' }}>
            {testResults}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ServiceWorkerDebug;


