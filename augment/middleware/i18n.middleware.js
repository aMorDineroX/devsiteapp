const i18n = require('i18n');
const path = require('path');

// Configuration de i18n
i18n.configure({
  locales: ['fr', 'en', 'es'],
  defaultLocale: 'fr',
  directory: path.join(__dirname, '../locales'),
  objectNotation: true,
  updateFiles: false,
  syncFiles: false,
  cookie: 'lang',
  queryParameter: 'lang',
  autoReload: true,
  missingKeyFn: function(locale, value) {
    console.warn(`[i18n] Missing translation: ${value} (${locale})`);
    return value;
  }
});

/**
 * Middleware pour l'internationalisation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
const i18nMiddleware = (req, res, next) => {
  // Détecter la langue à partir des paramètres de requête, des cookies ou de l'en-tête Accept-Language
  let locale = req.query.lang || (req.cookies && req.cookies.lang);
  
  if (!locale) {
    // Détecter la langue à partir de l'en-tête Accept-Language
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
      
      // Trouver la première langue supportée
      for (const lang of languages) {
        const shortLang = lang.substring(0, 2);
        if (i18n.getLocales().includes(shortLang)) {
          locale = shortLang;
          break;
        }
      }
    }
  }
  
  // Si une langue valide est détectée, la définir
  if (locale && i18n.getLocales().includes(locale)) {
    i18n.setLocale(req, locale);
    
    // Définir un cookie pour se souvenir de la langue
    if (!req.cookies || req.cookies.lang !== locale) {
      res.cookie('lang', locale, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 an
        httpOnly: true
      });
    }
  }
  
  // Ajouter des fonctions d'aide pour les vues
  res.locals.__ = res.__ = function() {
    return i18n.__.apply(req, arguments);
  };
  
  res.locals.__n = res.__n = function() {
    return i18n.__n.apply(req, arguments);
  };
  
  res.locals.getLocale = req.getLocale = function() {
    return i18n.getLocale(req);
  };
  
  res.locals.getLocales = function() {
    return i18n.getLocales();
  };
  
  next();
};

module.exports = {
  i18n,
  i18nMiddleware
};
