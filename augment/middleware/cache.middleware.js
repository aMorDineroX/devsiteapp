const NodeCache = require('node-cache');
const config = require('../config');

// Créer une instance de cache avec une durée de vie par défaut de 5 minutes
const cache = new NodeCache({
  stdTTL: config.cache.defaultTTL || 300, // 5 minutes en secondes
  checkperiod: 120 // Vérifier les clés expirées toutes les 2 minutes
});

/**
 * Middleware de cache pour les réponses API
 * @param {Number} ttl - Durée de vie du cache en secondes (optionnel)
 * @returns {Function} - Middleware Express
 */
exports.cacheMiddleware = (ttl) => {
  return (req, res, next) => {
    // Ne pas mettre en cache si la méthode n'est pas GET
    if (req.method !== 'GET') {
      return next();
    }
    
    // Créer une clé de cache basée sur l'URL et les paramètres de requête
    const key = `__express__${req.originalUrl || req.url}`;
    
    // Vérifier si la réponse est déjà en cache
    const cachedBody = cache.get(key);
    
    if (cachedBody) {
      // Envoyer la réponse mise en cache
      res.setHeader('X-Cache', 'HIT');
      return res.send(cachedBody);
    }
    
    // Stocker la méthode send originale
    const originalSend = res.send;
    
    // Remplacer la méthode send pour intercepter la réponse
    res.send = function(body) {
      // Ne mettre en cache que les réponses réussies
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, ttl || undefined);
      }
      
      // Marquer comme un cache miss
      res.setHeader('X-Cache', 'MISS');
      
      // Appeler la méthode send originale
      return originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Middleware de cache pour les vues rendues
 * @param {Number} ttl - Durée de vie du cache en secondes (optionnel)
 * @returns {Function} - Middleware Express
 */
exports.cacheViewMiddleware = (ttl) => {
  return (req, res, next) => {
    // Ne pas mettre en cache si la méthode n'est pas GET ou si l'utilisateur est connecté
    if (req.method !== 'GET' || req.user) {
      return next();
    }
    
    // Créer une clé de cache basée sur l'URL et les paramètres de requête
    const key = `__view__${req.originalUrl || req.url}`;
    
    // Vérifier si la réponse est déjà en cache
    const cachedBody = cache.get(key);
    
    if (cachedBody) {
      // Envoyer la réponse mise en cache
      res.setHeader('X-Cache', 'HIT');
      return res.send(cachedBody);
    }
    
    // Stocker la méthode render originale
    const originalRender = res.render;
    
    // Remplacer la méthode render pour intercepter la réponse
    res.render = function(view, options, callback) {
      // Si callback est fourni, on ne peut pas intercepter la réponse
      if (callback) {
        return originalRender.call(this, view, options, callback);
      }
      
      // Appeler la méthode render originale avec un callback pour intercepter le HTML
      originalRender.call(this, view, options, (err, html) => {
        if (err) {
          return next(err);
        }
        
        // Mettre en cache le HTML
        cache.set(key, html, ttl || undefined);
        
        // Marquer comme un cache miss
        res.setHeader('X-Cache', 'MISS');
        
        // Envoyer la réponse
        res.send(html);
      });
    };
    
    next();
  };
};

/**
 * Vider le cache pour une clé spécifique
 * @param {String} key - Clé de cache à vider
 */
exports.clearCache = (key) => {
  if (key) {
    // Vider une clé spécifique
    cache.del(key);
  } else {
    // Vider tout le cache
    cache.flushAll();
  }
};

/**
 * Vider le cache pour une route spécifique
 * @param {String} route - Route à vider du cache
 */
exports.clearRouteCache = (route) => {
  // Obtenir toutes les clés du cache
  const keys = cache.keys();
  
  // Filtrer les clés qui correspondent à la route
  const routeKeys = keys.filter(key => key.includes(route));
  
  // Supprimer les clés correspondantes
  routeKeys.forEach(key => cache.del(key));
};

/**
 * Middleware pour vider le cache après une modification
 * @param {String} route - Route à vider du cache (optionnel)
 * @returns {Function} - Middleware Express
 */
exports.clearCacheMiddleware = (route) => {
  return (req, res, next) => {
    // Stocker la méthode send originale
    const originalSend = res.send;
    
    // Remplacer la méthode send pour intercepter la réponse
    res.send = function(body) {
      // Vider le cache si la requête a réussi (statut 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (route) {
          exports.clearRouteCache(route);
        } else {
          exports.clearCache();
        }
      }
      
      // Appeler la méthode send originale
      return originalSend.call(this, body);
    };
    
    next();
  };
};
