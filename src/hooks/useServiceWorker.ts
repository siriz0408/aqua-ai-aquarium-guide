
import { useState, useEffect } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isWaiting: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isInstalled: false,
    isWaiting: false,
    isUpdateAvailable: false,
    registration: null,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.isSupported) {
      console.log('Service Worker not supported');
      return;
    }

    registerServiceWorker();
  }, [state.isSupported]);

  const registerServiceWorker = async () => {
    try {
      console.log('Registering service worker...');
      
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );

      setState(prev => ({
        ...prev,
        isInstalled: true,
        registration,
      }));

      console.log('Service Worker registered successfully');

      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                setState(prev => ({
                  ...prev,
                  isUpdateAvailable: true,
                  isWaiting: true,
                }));
                console.log('New service worker is waiting');
              } else {
                // First install
                console.log('Service worker installed for the first time');
              }
            }
          });
        }
      });

      // Listen for controlling worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        window.location.reload();
      });

      // Check if there's a waiting worker
      if (registration.waiting) {
        setState(prev => ({
          ...prev,
          isWaiting: true,
          isUpdateAvailable: true,
        }));
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
        
        if (event.data && event.data.type === 'VERSION_INFO') {
          console.log('Service Worker version:', event.data.version);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const updateServiceWorker = () => {
    if (state.registration && state.registration.waiting) {
      console.log('Updating service worker...');
      
      // Tell the waiting service worker to skip waiting
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      setState(prev => ({
        ...prev,
        isWaiting: false,
        isUpdateAvailable: false,
      }));
    }
  };

  const unregisterServiceWorker = async () => {
    if (state.registration) {
      try {
        const result = await state.registration.unregister();
        console.log('Service Worker unregistered:', result);
        
        setState({
          isSupported: state.isSupported,
          isInstalled: false,
          isWaiting: false,
          isUpdateAvailable: false,
          registration: null,
        });
        
        return result;
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    }
    return false;
  };

  const checkForUpdates = async () => {
    if (state.registration) {
      try {
        await state.registration.update();
        console.log('Checked for service worker updates');
      } catch (error) {
        console.error('Failed to check for updates:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
      
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  const getServiceWorkerVersion = async (): Promise<string | null> => {
    if (state.registration && state.registration.active) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version || null);
        };
        
        state.registration.active?.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    }
    
    return null;
  };

  return {
    ...state,
    error,
    updateServiceWorker,
    unregisterServiceWorker,
    checkForUpdates,
    clearCache,
    getServiceWorkerVersion,
  };
};
