/**
 * Fonctions d'aide pour les templates EJS
 */

/**
 * Formate une date en format lisible
 * @param {Date} date - La date à formater
 * @returns {String} - La date formatée
 */
exports.formatDate = function(date) {
  if (!date) return 'N/A';
  
  const options = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('fr-FR', options);
};

/**
 * Retourne une couleur en fonction du statut du projet
 * @param {String} status - Le statut du projet
 * @returns {String} - La couleur correspondante
 */
exports.getStatusColor = function(status) {
  const statusColors = {
    'en cours': 'purple',
    'terminé': 'green',
    'en attente': 'gray',
    'en pause': 'yellow',
    'annulé': 'red',
    'en révision': 'blue'
  };
  
  return statusColors[status.toLowerCase()] || 'gray';
};

/**
 * Retourne une couleur en fonction du type de projet
 * @param {Object} project - Le projet
 * @returns {String} - La couleur correspondante
 */
exports.getProjectColor = function(project) {
  if (!project || !project.type) return 'purple';
  
  const typeColors = {
    'site web': 'purple',
    'e-commerce': 'indigo',
    'application mobile': 'green',
    'application web': 'blue',
    'dashboard': 'orange',
    'api': 'red',
    'autre': 'gray'
  };
  
  return typeColors[project.type.toLowerCase()] || 'purple';
};

/**
 * Retourne une icône en fonction du type de projet
 * @param {Object} project - Le projet
 * @returns {String} - Le nom de l'icône Font Awesome
 */
exports.getProjectIcon = function(project) {
  if (!project || !project.type) return 'laptop-code';
  
  const typeIcons = {
    'site web': 'globe',
    'e-commerce': 'shopping-cart',
    'application mobile': 'mobile-alt',
    'application web': 'desktop',
    'dashboard': 'chart-line',
    'api': 'server',
    'autre': 'code'
  };
  
  return typeIcons[project.type.toLowerCase()] || 'laptop-code';
};

/**
 * Retourne une couleur en fonction du statut de la commande
 * @param {String} status - Le statut de la commande
 * @returns {String} - La couleur correspondante
 */
exports.getOrderStatusColor = function(status) {
  const statusColors = {
    'payé': 'green',
    'en attente': 'yellow',
    'remboursé': 'red',
    'annulé': 'gray',
    'traitement': 'blue',
    'livré': 'purple'
  };
  
  return statusColors[status.toLowerCase()] || 'gray';
};

/**
 * Tronque un texte à la longueur spécifiée
 * @param {String} text - Le texte à tronquer
 * @param {Number} length - La longueur maximale
 * @returns {String} - Le texte tronqué
 */
exports.truncate = function(text, length = 100) {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};