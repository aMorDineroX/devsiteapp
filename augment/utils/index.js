/**
 * Utilitaires pour l'application
 */

/**
 * Formate une date en format français
 * @param {Date} date - Date à formater
 * @returns {String} - Date formatée
 */
exports.formatDate = (date) => {
  if (!date) return '';
  
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('fr-FR', options);
};

/**
 * Formate un prix en euros
 * @param {Number} price - Prix à formater
 * @returns {String} - Prix formaté
 */
exports.formatPrice = (price) => {
  if (price === undefined || price === null) return '';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

/**
 * Tronque un texte à une longueur donnée
 * @param {String} text - Texte à tronquer
 * @param {Number} length - Longueur maximale
 * @returns {String} - Texte tronqué
 */
exports.truncateText = (text, length = 100) => {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

/**
 * Génère un slug à partir d'un texte
 * @param {String} text - Texte à transformer en slug
 * @returns {String} - Slug
 */
exports.slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Génère un ID unique
 * @returns {String} - ID unique
 */
exports.generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Calcule le temps écoulé depuis une date
 * @param {Date} date - Date de référence
 * @returns {String} - Temps écoulé en format lisible
 */
exports.timeAgo = (date) => {
  if (!date) return '';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' an' + (Math.floor(interval) > 1 ? 's' : '');
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' mois';
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' jour' + (Math.floor(interval) > 1 ? 's' : '');
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' heure' + (Math.floor(interval) > 1 ? 's' : '');
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '');
  }
  
  return Math.floor(seconds) + ' seconde' + (Math.floor(seconds) > 1 ? 's' : '');
};
