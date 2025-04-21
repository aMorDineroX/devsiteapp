// Service Worker pour DevCraft PWA
const CACHE_NAME = 'devcraft-cache-v1';
const OFFLINE_URL = '/offline.html';

// Ressources à mettre en cache lors de l'installation
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/css/styles.css',
  '/js/main.js',
  '/images/logo.png',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des ressources');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de mise en cache pour les requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;
  
  // Ignorer les requêtes vers l'API
  if (event.request.url.includes('/api/')) return;
  
  // Stratégie: Network First, puis Cache, sinon Offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse fraîche
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
        return response;
      })
      .catch(() => {
        // Si la requête échoue, essayer de récupérer depuis le cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si la requête est pour une page HTML, retourner la page hors ligne
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Gérer les actions spécifiques
    console.log('Action cliquée:', event.action);
  } else {
    // Ouvrir l'URL associée à la notification
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

// Fonction pour synchroniser les messages
async function syncMessages() {
  try {
    const db = await openDB();
    const pendingMessages = await db.getAll('pendingMessages');
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          await db.delete('pendingMessages', message.id);
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation du message:', error);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des messages:', error);
  }
}

// Fonction pour synchroniser les commandes
async function syncOrders() {
  try {
    const db = await openDB();
    const pendingOrders = await db.getAll('pendingOrders');
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await db.delete('pendingOrders', order.id);
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation de la commande:', error);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des commandes:', error);
  }
}

// Fonction pour ouvrir la base de données IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('devcraft-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id' });
      }
    };
  });
}
