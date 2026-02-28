/**
 * CONTENT SCRIPT
 * S'injecte dans les pages pour détecter les tentatives d'évasion
 * Empêche les manipulations du localStorage/sessionStorage
 */

/**
 * Protège le localStorage contre la suppression de la blocklist
 * Intercepte les écritures et supprime les tentatives malveillantes
 */
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;
const originalClear = Storage.prototype.clear;

// Clés sensibles à protéger
const PROTECTED_KEYS = [
  'userBlocklist',
  'penaltyEndTime',
  'extensionEnabled',
  'deletionAttempts'
];

/**
 * Intercepte setItem - empêche les modifications de clés protégées
 */
Storage.prototype.setItem = function(key, value) {
  if (PROTECTED_KEYS.includes(key)) {
    console.warn(`🛡️ Tentative de modification détectée: ${key}`);
    // Alerter le background pour enregistrer
    chrome.runtime.sendMessage({
      type: 'ATTEMPT_DELETE'
    }).catch(() => {});
    return;
  }

  return originalSetItem.call(this, key, value);
};

/**
 * Intercepte removeItem - empêche la suppression de clés protégées
 */
Storage.prototype.removeItem = function(key) {
  if (PROTECTED_KEYS.includes(key)) {
    console.warn(`🛡️ Tentative de suppression détectée: ${key}`);
    // Alerter le background
    chrome.runtime.sendMessage({
      type: 'ATTEMPT_DELETE'
    }).catch(() => {});
    return;
  }

  return originalRemoveItem.call(this, key);
};

/**
 * Intercepte clear - empêche le clear complet
 */
Storage.prototype.clear = function() {
  // Vérifie s'il y a des clés protégées
  let hasProtectedKeys = false;
  for (let i = 0; i < this.length; i++) {
    const key = this.key(i);
    if (PROTECTED_KEYS.includes(key)) {
      hasProtectedKeys = true;
      break;
    }
  }

  if (hasProtectedKeys) {
    console.warn('🛡️ Tentative de clear avec clés protégées détectée');
    // Alerter le background
    chrome.runtime.sendMessage({
      type: 'ATTEMPT_DELETE'
    }).catch(() => {});
    return;
  }

  return originalClear.call(this);
};

/**
 * Protège contre la manipulation du DOM pour supprimer des éléments
 * Empêche les modification du manifest ou des ressources critiques
 */
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // Vérifie si quelqu'un tente de modifier des éléments critiques
    if (mutation.type === 'childList') {
      mutation.removedNodes.forEach((node) => {
        // Log les suppressions suspectes
        if (node.dataset && node.dataset.extension === 'block-gambling') {
          console.warn('🛡️ Tentative de suppression d\'élément critique');
        }
      });
    }
  });
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

/**
 * Envoie les signaux de "still alive" au background
 * Permet de détecter les tentatives de désactivation
 */
setInterval(() => {
  chrome.runtime.sendMessage({
    type: 'HEARTBEAT',
    timestamp: Date.now()
  }).catch(() => {
    // Extension non disponible, normal si page quittée
  });
}, 30000); // Toutes les 30 secondes

console.log('✅ Block Gambling content script chargé');
