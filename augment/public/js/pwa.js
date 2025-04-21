// Script d'initialisation de la PWA

// Vérifier si le navigateur prend en charge les Service Workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
        
        // Vérifier les mises à jour du Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Nouveau Service Worker en cours d\'installation');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
      });
    
    // Écouter les messages du Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('Mise à jour du cache:', event.data.url);
      }
    });
  });
  
  // Vérifier les mises à jour du Service Worker existant
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// Afficher une notification de mise à jour
function showUpdateNotification() {
  const updateNotification = document.createElement('div');
  updateNotification.className = 'update-notification';
  updateNotification.innerHTML = `
    <div class="update-notification-content">
      <p>Une nouvelle version est disponible !</p>
      <button id="update-button">Mettre à jour</button>
      <button id="dismiss-button">Plus tard</button>
    </div>
  `;
  
  document.body.appendChild(updateNotification);
  
  document.getElementById('update-button').addEventListener('click', () => {
    window.location.reload();
  });
  
  document.getElementById('dismiss-button').addEventListener('click', () => {
    updateNotification.remove();
  });
}

// Demander l'installation de l'application
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  // Empêcher Chrome d'afficher automatiquement la bannière d'installation
  event.preventDefault();
  
  // Stocker l'événement pour l'utiliser plus tard
  deferredPrompt = event;
  
  // Afficher le bouton d'installation si disponible
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', () => {
      // Afficher la bannière d'installation
      deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Utilisateur a accepté l\'installation');
          // Masquer le bouton d'installation
          installButton.style.display = 'none';
        } else {
          console.log('Utilisateur a refusé l\'installation');
        }
        
        // Réinitialiser deferredPrompt
        deferredPrompt = null;
      });
    });
  }
});

// Détecter quand l'application est installée
window.addEventListener('appinstalled', (event) => {
  console.log('Application installée');
  
  // Masquer le bouton d'installation
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'none';
  }
  
  // Réinitialiser deferredPrompt
  deferredPrompt = null;
  
  // Envoyer un événement d'analyse
  if (typeof gtag === 'function') {
    gtag('event', 'app_installed');
  }
});

// Initialiser la base de données IndexedDB pour le stockage hors ligne
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('devcraft-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Créer les object stores nécessaires
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };
  });
}

// Initialiser IndexedDB au chargement de la page
window.addEventListener('load', () => {
  initIndexedDB()
    .then((db) => {
      console.log('IndexedDB initialisée avec succès');
      window.db = db;
    })
    .catch((error) => {
      console.error('Erreur lors de l\'initialisation d\'IndexedDB:', error);
    });
});

// Fonction pour sauvegarder des données en mode hors ligne
async function saveOfflineData(key, data) {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction('offlineData', 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    await store.put({ key, data, timestamp: Date.now() });
    console.log(`Données sauvegardées hors ligne: ${key}`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données hors ligne:', error);
    return false;
  }
}

// Fonction pour récupérer des données hors ligne
async function getOfflineData(key) {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction('offlineData', 'readonly');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données hors ligne:', error);
    return null;
  }
}

// Fonction pour enregistrer un message à envoyer plus tard
async function saveMessageForSync(message) {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction('pendingMessages', 'readwrite');
    const store = transaction.objectStore('pendingMessages');
    
    await store.add({
      ...message,
      timestamp: Date.now()
    });
    
    // Demander une synchronisation en arrière-plan
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-messages');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du message pour synchronisation:', error);
    return false;
  }
}

// Fonction pour enregistrer une commande à envoyer plus tard
async function saveOrderForSync(order) {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction('pendingOrders', 'readwrite');
    const store = transaction.objectStore('pendingOrders');
    
    await store.add({
      ...order,
      timestamp: Date.now()
    });
    
    // Demander une synchronisation en arrière-plan
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-orders');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la commande pour synchronisation:', error);
    return false;
  }
}

// Exposer les fonctions au niveau global
window.pwa = {
  saveOfflineData,
  getOfflineData,
  saveMessageForSync,
  saveOrderForSync
};
