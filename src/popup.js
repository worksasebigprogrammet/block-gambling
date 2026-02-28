/**
 * POPUP SCRIPT
 * Gère l'interface utilisateur du popup
 */

const DARK_MODE_PREFERENCE = 'darkModePreference';

/**
 * Initialise le popup au chargement
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📋 Popup chargé');

  // Charge le thème
  loadThemePreference();

  // Initialise les éléments
  setupEventListeners();

  // Charge l'état initial
  await refreshStatus();

  // Charge la blocklist
  await displayBlocklist();
});

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
  // Bouton d'ajout
  const addBtn = document.getElementById('add-button');
  const input = document.getElementById('entry-input');

  if (addBtn) {
    addBtn.addEventListener('click', handleAddEntry);
  }

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAddEntry();
      }
    });
  }

  // Toggle extension
  const toggleBtn = document.getElementById('toggle-extension');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', handleToggleExtension);
  }

  // Toggle dark mode
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode);
  }

  // Refresh blocklist
  const refreshBtn = document.getElementById('refresh-button');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await refreshStatus();
      await displayBlocklist();
    });
  }
}

/**
 * Ajoute une entrée à la blocklist
 */
async function handleAddEntry() {
  const input = document.getElementById('entry-input');
  const entry = input.value.trim();

  if (!entry) {
    showMessage('Veuillez entrer un domaine', 'error');
    return;
  }

  // Désactive le bouton pendant le traitement
  const addBtn = document.getElementById('add-button');
  const originalText = addBtn.textContent;
  addBtn.disabled = true;
  addBtn.textContent = 'Ajout en cours...';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ADD_BLOCK',
      entry
    });

    if (response.success) {
      showMessage(`✅ ${response.added} ajouté à la blocklist`, 'success');
      input.value = '';
      await displayBlocklist();
      await refreshStatus();
    } else {
      showMessage(`❌ Erreur: ${response.error}`, 'error');
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error);
    showMessage('Erreur lors de l\'ajout', 'error');
  } finally {
    addBtn.disabled = false;
    addBtn.textContent = originalText;
  }
}

/**
 * Bascule l'extension on/off
 */
async function handleToggleExtension() {
  const status = await chrome.runtime.sendMessage({
    type: 'GET_STATUS'
  });

  const newState = !status.extensionEnabled;

  const response = await chrome.runtime.sendMessage({
    type: 'TOGGLE_EXTENSION',
    enabled: newState
  });

  if (response.extensionEnabled) {
    showMessage('✅ Extension activée', 'success');
  } else {
    showMessage('⚠️ Extension désactivée', 'info');
  }

  await refreshStatus();
}

/**
 * Affiche le statut de l'extension
 */
async function refreshStatus() {
  const status = await chrome.runtime.sendMessage({
    type: 'GET_STATUS'
  });

  const statusEl = document.getElementById('extension-status');
  const toggleBtn = document.getElementById('toggle-extension');

  if (statusEl) {
    if (status.extensionEnabled) {
      statusEl.textContent = '🟢 Activée';
      statusEl.className = 'status-active';
      if (toggleBtn) toggleBtn.textContent = 'Désactiver';
    } else {
      statusEl.textContent = '🔴 Désactivée';
      statusEl.className = 'status-inactive';
      if (toggleBtn) toggleBtn.textContent = 'Activer';
    }
  }

  // Affiche l'état de pénalité si actif
  if (status.penaltyActive) {
    const penaltyEl = document.getElementById('penalty-status');
    if (penaltyEl) {
      const remaining = Math.ceil(
        (new Date(status.penaltyEndTime) - Date.now()) / 1000
      );
      const hours = Math.ceil(remaining / 3600);
      penaltyEl.innerHTML = `
        <div class="penalty-warning">
          🚨 <strong>Pénalité active:</strong> Blocage renforcé pendant ${hours}h
        </div>
      `;
    }
  }

  // Compte des entrées utilisateur
  const countEl = document.getElementById('user-count');
  if (countEl) {
    countEl.textContent = status.userBlocklistCount;
  }
}

/**
 * Affiche la liste de blocage (parties base et utilisateur)
 */
async function displayBlocklist() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_BLOCKLIST'
    });

    const baseCount = response.base.length;
    const userCount = response.user.length;

    // Affiche les statistiques
    const statsEl = document.getElementById('stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stats-container">
          <div class="stat-item">
            <span class="stat-label">Liste de base:</span>
            <span class="stat-value">${baseCount}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Mes domaines:</span>
            <span class="stat-value">${userCount}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value">${response.total}</span>
          </div>
        </div>
      `;
    }

    // Affiche les domaines utilisateur
    const userListEl = document.getElementById('user-blocklist');
    if (userListEl) {
      if (userCount === 0) {
        userListEl.innerHTML = '<p class="empty-state">Aucun domaine personnalisé</p>';
      } else {
        userListEl.innerHTML = response.user
          .map(domain => `<div class="blocklist-item">${escapeHtml(domain)}</div>`)
          .join('');
      }
    }

    // Affiche la liste de base (collapsible)
    const baseListEl = document.getElementById('base-blocklist');
    if (baseListEl) {
      baseListEl.innerHTML = `
        <details>
          <summary>📋 Voir les ${baseCount} domaines de la liste de base</summary>
          <div class="base-list">
            ${response.base
              .map(domain => `<div class="blocklist-item">${escapeHtml(domain)}</div>`)
              .join('')}
          </div>
        </details>
      `;
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la blocklist:', error);
  }
}

/**
 * Affiche un message transitoire
 */
function showMessage(text, type = 'info') {
  const messageEl = document.getElementById('message');
  if (!messageEl) return;

  messageEl.textContent = text;
  messageEl.className = `message message-${type} visible`;

  setTimeout(() => {
    messageEl.classList.remove('visible');
  }, 3000);
}

/**
 * Gère le thème sombre
 */
function loadThemePreference() {
  const isDark = localStorage.getItem(DARK_MODE_PREFERENCE) === 'true';

  if (isDark) {
    document.body.classList.add('dark-mode');
  }

  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.textContent = isDark ? '☀️' : '🌙';
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(DARK_MODE_PREFERENCE, isDark);

  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.textContent = isDark ? '☀️' : '🌙';
  }
}

/**
 * Échappe les caractères HTML pour éviter les injections
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}
