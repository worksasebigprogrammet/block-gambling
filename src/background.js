/**
 * SERVICE WORKER - Background Script
 * Gère l'interception des requêtes et le blocage
 * Manifeste V3 compatible
 */

// Import des modules utilitaires (notation de chemin V3)
// Note: Les modules sont chargés via scripts séquentiels dans le manifest

// Initialisation au démarrage de l'extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🎰 Block Gambling Extension installée');

  // Initialise le stockage
  const storage = await chrome.storage.local.get(null);
  if (!storage.userBlocklist) {
    await chrome.storage.local.set({
      userBlocklist: [],
      extensionEnabled: true,
      deletionAttempts: 0
    });
  }
});

/**
 * Intercepte les appels à chrome.webRequest (V3: utilise declarativeNetRequest)
 * Alternative: Utiliser les tabs pour rediriger après détection
 */

/**
 * Intercepte les navigations complètes (pages principales)
 * Détecte les sites à bloquer et les redirige vers la page de pause
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Seulement sur "complete" pour s'assurer que le contenu se charge
  if (changeInfo.status !== 'complete') return;

  // Vérifie que l'extension est activée
  const storage = await chrome.storage.local.get('extensionEnabled');
  if (!storage.extensionEnabled) return;

  const url = tab.url;
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }

  // Récupère les listes de blocage
  const fullStorage = await chrome.storage.local.get([
    'userBlocklist',
    'penaltyEndTime'
  ]);

  const userBlocklist = fullStorage.userBlocklist || [];
  const baseBlocklist = [
    'bet365.com', 'betfair.com', 'williamhill.com', 'ladbrokes.com',
    'paddy-power.com', 'coral.co.uk', 'sky-bet.com', 'bwin.com',
    'pokerstars.com', 'partypoker.com', 'gtbets.com', 'fanduel.com',
    'draftkings.com', 'betmgm.com', 'caesars.com', 'pointsbet.com',
    'betrivers.com', 'foxbet.com', 'playpennsylvania.com', '888.com',
    'unibet.com', 'betwild.com', 'leo-vegas.com', 'casumo.com',
    'sloty.com', 'videoslots.com', 'netbet.com', 'betfinder.com',
    'betking.com', 'betway.com', 'bet-at-home.com', 'ibet.com'
  ];

  const fullBlocklist = [...baseBlocklist, ...userBlocklist];

  // Vérifie si l'URL doit être bloquée
  const domain = extractDomain(url);
  if (!domain) return;

  const isBlocked = isBlocklistMatch(domain, fullBlocklist);

  if (isBlocked) {
    // Récupère l'état de pénalité
    const penaltyStatus = fullStorage.penaltyEndTime
      ? Date.now() < fullStorage.penaltyEndTime
      : false;

    // Crée l'URL de redirection vers la page de pause
    const pausePageUrl = chrome.runtime.getURL('pages/pause.html');
    const redirectUrl = new URL(pausePageUrl);
    redirectUrl.searchParams.set('blocked_url', encodeURIComponent(url));
    redirectUrl.searchParams.set('penalty_active', penaltyStatus ? 'true' : 'false');

    chrome.tabs.update(tabId, {
      url: redirectUrl.toString()
    });
  }
});

/**
 * Écouteur pour les messages venant du popup ou des content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ADD_BLOCK') {
    handleAddBlock(request.entry).then(sendResponse);
    return true; // Indique async
  }

  if (request.type === 'GET_BLOCKLIST') {
    handleGetBlocklist().then(sendResponse);
    return true;
  }

  if (request.type === 'ATTEMPT_DELETE') {
    handleDeletionAttempt().then(sendResponse);
    return true;
  }

  if (request.type === 'TOGGLE_EXTENSION') {
    handleToggleExtension(request.enabled).then(sendResponse);
    return true;
  }

  if (request.type === 'GET_STATUS') {
    handleGetStatus().then(sendResponse);
    return true;
  }
});

/**
 * Ajoute une entrée à la blocklist utilisateur
 */
async function handleAddBlock(entry) {
  const validation = validateEntry(entry);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  const storage = await chrome.storage.local.get('userBlocklist');
  const userBlocklist = storage.userBlocklist || [];

  // Append-only: vérifie que ce n'est pas déjà présent
  if (userBlocklist.includes(validation.normalized)) {
    return {
      success: false,
      error: 'Entrée déjà présente'
    };
  }

  userBlocklist.push(validation.normalized);

  await chrome.storage.local.set({
    userBlocklist
  });

  console.log(`✅ Domaine ajouté à la blocklist: ${validation.normalized}`);

  return {
    success: true,
    added: validation.normalized
  };
}

/**
 * Récupère l'état complet de la blocklist
 */
async function handleGetBlocklist() {
  const storage = await chrome.storage.local.get('userBlocklist');
  const userBlocklist = storage.userBlocklist || [];

  const baseBlocklist = [
    'bet365.com', 'betfair.com', 'williamhill.com', 'ladbrokes.com',
    'paddy-power.com', 'coral.co.uk', 'sky-bet.com', 'bwin.com',
    'pokerstars.com', 'partypoker.com', 'gtbets.com', 'fanduel.com',
    'draftkings.com', 'betmgm.com', 'caesars.com', 'pointsbet.com',
    'betrivers.com', 'foxbet.com', 'playpennsylvania.com', '888.com',
    'unibet.com', 'betwild.com', 'leo-vegas.com', 'casumo.com',
    'sloty.com', 'videoslots.com', 'netbet.com', 'betfinder.com',
    'betking.com', 'betway.com', 'bet-at-home.com', 'ibet.com'
  ];

  return {
    base: baseBlocklist,
    user: userBlocklist,
    total: baseBlocklist.length + userBlocklist.length
  };
}

/**
 * Gère une tentative de suppression (triggers pénalité)
 */
async function handleDeletionAttempt() {
  const duration = 24 * 60 * 60 * 1000; // 24 heures
  const penaltyEndTime = Date.now() + duration;

  await chrome.storage.local.set({
    penaltyEndTime
  });

  console.warn('🚨 Tentative de suppression détectée - pénalité appliquée');

  return {
    penalized: true,
    endTime: new Date(penaltyEndTime).toISOString(),
    durationHours: 24
  };
}

/**
 * Active/désactive l'extension
 */
async function handleToggleExtension(enabled) {
  await chrome.storage.local.set({
    extensionEnabled: !!enabled
  });

  return {
    extensionEnabled: enabled
  };
}

/**
 * Récupère le statut complet de l'extension
 */
async function handleGetStatus() {
  const storage = await chrome.storage.local.get([
    'extensionEnabled',
    'penaltyEndTime',
    'userBlocklist'
  ]);

  const extensionEnabled = storage.extensionEnabled !== false;
  const penaltyEndTime = storage.penaltyEndTime;
  const userBlocklist = storage.userBlocklist || [];

  const now = Date.now();
  const penaltyActive = penaltyEndTime && now < penaltyEndTime;

  return {
    extensionEnabled,
    penaltyActive,
    penaltyEndTime: penaltyActive ? new Date(penaltyEndTime).toISOString() : null,
    userBlocklistCount: userBlocklist.length
  };
}

/**
 * Valide une entrée de blocklist
 */
function validateEntry(input) {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      error: 'Entrée invalide'
    };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Entrée vide'
    };
  }

  if (trimmed.length > 255) {
    return {
      valid: false,
      error: 'Entrée trop longue'
    };
  }

  const normalized = trimmed.toLowerCase();

  return {
    valid: true,
    normalized
  };
}

/**
 * Extrait le domaine d'une URL
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
 * Normalise un domaine
 */
function normalizeDomain(domain) {
  return domain.replace(/^www\./, '').toLowerCase();
}

/**
 * Vérifie si un domaine matche la blocklist
 */
function isBlocklistMatch(domain, blocklist) {
  const normalized = normalizeDomain(domain);

  for (const entry of blocklist) {
    const normalizedEntry = entry.toLowerCase();

    // Exact match
    if (normalized === normalizedEntry ||
        normalized === `www.${normalizedEntry}`) {
      return true;
    }

    // Wildcard
    if (normalizedEntry.startsWith('*.')) {
      const pattern = normalizedEntry.slice(2);
      if (normalized.endsWith(`.${pattern}`) || normalized === pattern) {
        return true;
      }
    }

    // Keyword match
    if (normalized.includes(normalizedEntry)) {
      return true;
    }
  }

  return false;
}
