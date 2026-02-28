/**
 * UTILITAIRES - Fonctions d'aide communes
 */

/**
 * Échappe les caractères HTML
 * Prévient les injections XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Valide une adresse e-mail (optionnel pour futur)
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Formate la durée en texte lisible
 * @param {number} ms - millisecondes
 * @returns {string}
 */
function formatDuration(ms) {
  if (ms <= 0) return 'Maintenant';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}j ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Récupère les paramètres d'une URL
 * @param {string} url
 * @returns {Object}
 */
function getUrlParams(url) {
  try {
    const urlObj = new URL(url);
    const params = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
}

/**
 * Crée un élément DOM avec classes et attributs
 */
function createElement(tag, { classes = [], attrs = {}, text = '' } = {}) {
  const el = document.createElement(tag);

  if (Array.isArray(classes)) {
    el.classList.add(...classes);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'text') {
      el.textContent = value;
    } else {
      el.setAttribute(key, value);
    }
  });

  if (text) {
    el.textContent = text;
  }

  return el;
}

/**
 * Attends une durée spécifiée
 * @param {number} ms
 * @returns {Promise}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Stockage local sécurisé (wrapper)
 */
const SecureStorage = {
  /**
   * Récupère une valeur
   */
  get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  /**
   * Définit une valeur
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Supprime une clé
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Crée un identifiant unique
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clone profond d'un objet
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Vérifie si l'extension est en mode développement
 */
function isDevelopmentMode() {
  return !('update_url' in chrome.runtime.getManifest());
}

// Exports pour Node.js/tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    isValidEmail,
    formatDuration,
    getUrlParams,
    createElement,
    delay,
    SecureStorage,
    generateId,
    deepClone,
    isDevelopmentMode
  };
}
