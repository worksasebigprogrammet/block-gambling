/**
 * Module de logique de blocage
 * Détermine si un URL doit être bloqué
 * Gère les patterns de matching
 */

/**
 * Extrait le domaine d'une URL
 * @param {string} url
 * @returns {string|null} domaine normalisé
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Normalise un domaine pour comparison
 * Supprime 'www.' si présent
 * @param {string} domain
 * @returns {string}
 */
function normalizeDomain(domain) {
  return domain.replace(/^www\./, '').toLowerCase();
}

/**
 * Vérifie si un domaine matche un item de la blocklist
 * Supporte:
 *   - Domaines exacts: 'bet365.com' matche 'bet365.com' et 'www.bet365.com'
 *   - Wildcards: '*.betting.com' matche 'site.betting.com'
 *   - Mots-clés: 'casino' matche 'casino.com', 'online-casino.net', etc.
 * @param {string} domain
 * @param {string[]} blocklist
 * @returns {boolean}
 */
function isBlocklistMatch(domain, blocklist) {
  const normalizedDomain = normalizeDomain(domain);

  for (const entry of blocklist) {
    const normalizedEntry = entry.toLowerCase();

    // Exact match
    if (normalizedDomain === normalizedEntry ||
        normalizedDomain === `www.${normalizedEntry}`) {
      return true;
    }

    // Wildcard match (*.domain.com)
    if (normalizedEntry.startsWith('*.')) {
      const pattern = normalizedEntry.slice(2); // Retire '*.'
      if (normalizedDomain.endsWith(`.${pattern}`) ||
          normalizedDomain === pattern) {
        return true;
      }
    }

    // Keyword match (substring)
    if (normalizedDomain.includes(normalizedEntry)) {
      return true;
    }
  }

  return false;
}

/**
 * Détermine si une URL doit être bloquée
 * @param {string} url - URL complète ou domaine
 * @param {string[]} blocklist - liste de domaines/mots-clés à bloquer
 * @returns {boolean}
 */
function shouldBlockUrl(url, blocklist) {
  const domain = extractDomain(url);

  if (!domain) {
    return false;
  }

  return isBlocklistMatch(domain, blocklist);
}

/**
 * Crée une clé unique pour une tentative de blocage
 * Utilisée pour éviter les blocages multiples de la même URL
 * @param {string} url
 * @returns {string}
 */
function getBlockageKey(url) {
  const domain = extractDomain(url);
  return `blocked_${domain}_${Math.floor(Date.now() / 1000)}`;
}

/**
 * Sanitize et valide une entrée utilisateur avant ajout à la blocklist
 * @param {string} input
 * @returns {{valid: boolean, normalized: string|null, error: string|null}}
 */
function validateBlocklistEntry(input) {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      normalized: null,
      error: 'Entrée invalide'
    };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      normalized: null,
      error: 'Entrée vide'
    };
  }

  if (trimmed.length > 255) {
    return {
      valid: false,
      normalized: null,
      error: 'Entrée trop longue (max 255 caractères)'
    };
  }

  // Accepte domaines ou mots-clés
  // Format: 'example.com', 'casino', '*.poker.com'
  const validPattern = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})?$|^\*\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*(\.[a-z]{2,})?$|^[a-z]{2,}$/i;

  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      normalized: null,
      error: 'Format invalide (domaine ou mot-clé attendu)'
    };
  }

  const normalized = trimmed.toLowerCase();

  return {
    valid: true,
    normalized,
    error: null
  };
}

// Exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractDomain,
    normalizeDomain,
    isBlocklistMatch,
    shouldBlockUrl,
    getBlockageKey,
    validateBlocklistEntry
  };
}
