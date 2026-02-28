/**
 * Module de gestion du stockage local
 * Gère les listes de blocage (base + utilisateur)
 * Applique les pénalités temporelles
 */

/**
 * LISTE DE BASE HARDCODÉE
 * Domaines de jeux d'argent internationaux
 * Non modifiable par l'utilisateur
 */
const BASE_BLOCKLIST = [
  // Casinos en ligne
  'bet365.com',
  'betfair.com',
  'williamhill.com',
  'ladbrokes.com',
  'paddy-power.com',
  'boyle sports.com',
  'coral.co.uk',
  'sky-bet.com',
  'bwin.com',
  'pokerstars.com',
  'partypoker.com',
  'gtbets.com',
  'fanduel.com',
  'draftkings.com',
  'betmgm.com',
  'caesars.com',
  'pointsbet.com',
  'betrivers.com',
  'foxbet.com',
  'playpennsylvania.com',
  '888.com',
  'unibet.com',
  'betwild.com',
  'leo vegas.com',
  'casumo.com',
  'sloty.com',
  'videoslots.com',
  'netbet.com',
  'betfinder.com',
  'betking.com',
  'betway.com',
  'bet-at-home.com',
  'ibet.com',
  'snai.it',
  'lottomatica.it',
  'sisal.it',
  'betclic.com',
  'betsson.com',
  'redbet.com',
  'mybookie.ag',
  'everytimebet.com',
  'intertops.com',
  'sportsbetting.ag',
  'betusa.com',
  'xbet.ag',
  'wagertalk.com',
  'bodog.com',
  'winlinebet.com',
  'smarkets.com',
  '1xbet.com',
  'stake.com',
  'bc.game',
  'crypto.com/nft',
  'opensea.io',
  'nifty.com',
  'nft.com',
  'solanart.io',
  'magic-eden.io',
  'blur.io',
  'raydium.io',
  'orca.so'
];

/**
 * Mots-clés de détection (cas insensible)
 * Utilisés pour matcher les domaines non-listés
 */
const KEYWORD_PATTERNS = [
  'poker',
  'casino',
  'betting',
  'sports-bet',
  'sportsbook',
  'lottery',
  'lotto',
  'bingo',
  'slots',
  'roulette',
  'blackjack',
  'craps',
  'keno',
  'pari-mutuel',
  'turf',
  'hippodrome'
];

/**
 * STORAGE_KEYS
 */
const STORAGE_KEYS = {
  USER_BLOCKLIST: 'userBlocklist',
  PENALTY_END_TIME: 'penaltyEndTime',
  DELETION_ATTEMPTS: 'deletionAttempts',
  EXTENSION_ENABLED: 'extensionEnabled'
};

/**
 * Initialise le stockage avec les valeurs par défaut
 */
async function initializeStorage() {
  const storage = await chrome.storage.local.get(null);

  if (!storage[STORAGE_KEYS.USER_BLOCKLIST]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.USER_BLOCKLIST]: [],
      [STORAGE_KEYS.EXTENSION_ENABLED]: true,
      [STORAGE_KEYS.DELETION_ATTEMPTS]: 0
    });
  }
}

/**
 * Récupère la liste de blocage complète (base + utilisateur)
 * @returns {Promise<string[]>} tableau de domaines/mots-clés à bloquer
 */
async function getFullBlocklist() {
  const storage = await chrome.storage.local.get(STORAGE_KEYS.USER_BLOCKLIST);
  const userList = storage[STORAGE_KEYS.USER_BLOCKLIST] || [];

  return [...BASE_BLOCKLIST, ...userList];
}

/**
 * Ajoute un domaine ou mot-clé à la liste utilisateur (append-only)
 * @param {string} entry - domaine ou mot-clé à ajouter
 * @returns {Promise<boolean>} succès de l'ajout
 */
async function addToUserBlocklist(entry) {
  if (!entry || typeof entry !== 'string') {
    return false;
  }

  const normalized = entry.toLowerCase().trim();

  // Vérifie que ce n'est pas déjà présent
  const storage = await chrome.storage.local.get(STORAGE_KEYS.USER_BLOCKLIST);
  const userList = storage[STORAGE_KEYS.USER_BLOCKLIST] || [];

  if (userList.includes(normalized)) {
    return false;
  }

  // Append-only: ajoute seulement
  userList.push(normalized);

  await chrome.storage.local.set({
    [STORAGE_KEYS.USER_BLOCKLIST]: userList
  });

  return true;
}

/**
 * Obtient la liste utilisateur (lecture seule)
 * @returns {Promise<string[]>}
 */
async function getUserBlocklist() {
  const storage = await chrome.storage.local.get(STORAGE_KEYS.USER_BLOCKLIST);
  return storage[STORAGE_KEYS.USER_BLOCKLIST] || [];
}

/**
 * PROTECTION CONTRE LA SUPPRESSION
 * Déclenche une pénalité si tentative de suppression
 * @returns {Promise<boolean>} true si extension en période de pénalité
 */
async function isPenalized() {
  const storage = await chrome.storage.local.get(STORAGE_KEYS.PENALTY_END_TIME);
  const penaltyEndTime = storage[STORAGE_KEYS.PENALTY_END_TIME];

  if (!penaltyEndTime) return false;

  const now = Date.now();
  if (now >= penaltyEndTime) {
    // Pénalité expirée, nettoie
    await chrome.storage.local.remove(STORAGE_KEYS.PENALTY_END_TIME);
    return false;
  }

  return true;
}

/**
 * Applique une pénalité temporelle (24h de blocage renforcé)
 * @param {number} duration - durée en millisecondes (défaut: 24h)
 */
async function applyPenalty(duration = 24 * 60 * 60 * 1000) {
  const penaltyEndTime = Date.now() + duration;

  await chrome.storage.local.set({
    [STORAGE_KEYS.PENALTY_END_TIME]: penaltyEndTime
  });

  console.warn(`🚨 Pénalité appliquée jusqu'à ${new Date(penaltyEndTime).toISOString()}`);
}

/**
 * Récupère le temps restant de pénalité
 * @returns {Promise<{isPenalized: boolean, remainingMs: number, endTime: string}>}
 */
async function getPenaltyStatus() {
  const storage = await chrome.storage.local.get(STORAGE_KEYS.PENALTY_END_TIME);
  const penaltyEndTime = storage[STORAGE_KEYS.PENALTY_END_TIME];

  if (!penaltyEndTime) {
    return {
      isPenalized: false,
      remainingMs: 0,
      endTime: null
    };
  }

  const now = Date.now();
  const remainingMs = Math.max(0, penaltyEndTime - now);

  return {
    isPenalized: remainingMs > 0,
    remainingMs,
    endTime: new Date(penaltyEndTime).toISOString()
  };
}

/**
 * Enregistre une tentative de suppression (pour logs)
 */
async function recordDeletionAttempt() {
  const storage = await chrome.storage.local.get(STORAGE_KEYS.DELETION_ATTEMPTS);
  const attempts = (storage[STORAGE_KEYS.DELETION_ATTEMPTS] || 0) + 1;

  await chrome.storage.local.set({
    [STORAGE_KEYS.DELETION_ATTEMPTS]: attempts
  });

  console.warn(`⚠️ Tentative de suppression détectée (${attempts} tentatives au total)`);
}

/**
 * Exporte l'état complet (à usage interne)
 */
async function exportState() {
  return await chrome.storage.local.get(null);
}

// Exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeStorage,
    getFullBlocklist,
    addToUserBlocklist,
    getUserBlocklist,
    isPenalized,
    applyPenalty,
    getPenaltyStatus,
    recordDeletionAttempt,
    exportState,
    BASE_BLOCKLIST,
    KEYWORD_PATTERNS,
    STORAGE_KEYS
  };
}
