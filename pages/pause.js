/**
 * PAUSE PAGE SCRIPT
 * Gère le compte à rebours et l'interaction utilisateur
 */

// Configuration
const WAIT_TIME_SECONDS = 60; // Temps d'attente par défaut

// États
let countdownTime = WAIT_TIME_SECONDS;
let countdownInterval = null;
let blockedUrl = null;
let penaltyActive = false;

/**
 * Initialise la page de pause
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('📍 Page de pause chargée');

  // Récupère les paramètres d'URL
  const params = new URLSearchParams(window.location.search);
  blockedUrl = params.get('blocked_url');
  penaltyActive = params.get('penalty_active') === 'true';

  // Configure l'affichage
  setupUI();

  // Démarre le compte à rebours
  startCountdown();

  // Empêche les raccourcis clavier courants pour quitter
  preventEvasion();
});

/**
 * Configure l'interface utilisateur
 */
function setupUI() {
  // Affiche l'URL bloquée si présente
  if (blockedUrl) {
    const urlInfo = document.getElementById('blocked-url-info');
    const urlText = document.getElementById('blocked-url');

    if (urlInfo && urlText) {
      try {
        const decodedUrl = decodeURIComponent(blockedUrl);
        const urlObj = new URL(decodedUrl);
        urlText.textContent = `${urlObj.hostname}`;
        urlInfo.style.display = 'block';
      } catch (e) {
        urlText.textContent = blockedUrl;
        urlInfo.style.display = 'block';
      }
    }
  }

  // Affiche l'avertissement de pénalité si actif
  if (penaltyActive) {
    const penaltyInfo = document.getElementById('penalty-info');
    if (penaltyInfo) {
      penaltyInfo.style.display = 'block';
    }
  }

  // Configure le bouton "Revenir"
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', goBack);
  }
}

/**
 * Démarre le compte à rebours
 */
function startCountdown() {
  updateCountdownDisplay();

  countdownInterval = setInterval(() => {
    countdownTime--;

    updateCountdownDisplay();

    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      enableBackButton();
    }
  }, 1000);
}

/**
 * Met à jour l'affichage du compte à rebours
 */
function updateCountdownDisplay() {
  const countdownEl = document.getElementById('countdown');

  if (countdownEl) {
    countdownEl.textContent = Math.max(0, countdownTime);
  }

  // Met à jour la barre de progression
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const percentage = (countdownTime / WAIT_TIME_SECONDS) * 100;
    progressBar.style.width = `${percentage}%`;
  }
}

/**
 * Active le bouton "Revenir"
 */
function enableBackButton() {
  const backButton = document.getElementById('back-button');

  if (backButton) {
    backButton.disabled = false;
    backButton.textContent = '✓ Revenir';
    backButton.style.cursor = 'pointer';

    // Ajout d'une animation
    backButton.style.animation = 'pulse 0.5s ease-out';
  }

  console.log('✅ Bouton "Revenir" activé');
}

/**
 * Revient à la page précédente
 */
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Si pas d'historique, ferme l'onglet ou va à la page d'accueil
    window.location.href = 'about:blank';
  }
}

/**
 * Empêche les évasions courantes
 */
function preventEvasion() {
  // Désactive les raccourcis clavier
  document.addEventListener('keydown', (e) => {
    // Bloque Ctrl+W, Ctrl+Shift+W (fermeture d'onglet/fenêtre)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W')) {
      e.preventDefault();
      showWarning('Impossible de fermer cet onglet tant que le compte à rebours n\'est pas terminé.');
    }

    // Bloque Escape si le compte à rebours est en cours
    if (e.key === 'Escape' && countdownTime > 0) {
      e.preventDefault();
      showWarning('Patientez jusqu\'à la fin du compte à rebours.');
    }

    // Bloque F12, Ctrl+Shift+I (DevTools)
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      recordEvasionAttempt();
      showWarning('Les outils de développement ne peuvent pas être utilisés.');
    }
  });

  // Désactive le click droit pendant le compte à rebours
  if (countdownTime > 0) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Empêche la navigation avant la fin du compte à rebours
  window.addEventListener('beforeunload', (e) => {
    if (countdownTime > 0) {
      e.preventDefault();
      e.returnValue = 'Veuillez attendre la fin du compte à rebours.';
      return false;
    }
  });

  // Empêche les tentatives de reload
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      if (countdownTime > 0) {
        e.preventDefault();
        showWarning('Rechargement désactivé. Attendez la fin du compte à rebours.');
      }
    }
  });
}

/**
 * Affiche un avertissement temporaire
 */
function showWarning(message) {
  // Crée un élément d'avertissement
  let warningEl = document.getElementById('warning-message');

  if (!warningEl) {
    warningEl = document.createElement('div');
    warningEl.id = 'warning-message';
    warningEl.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #fef2f2;
      border: 2px solid #ef4444;
      color: #ef4444;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      z-index: 10000;
      font-weight: 600;
      max-width: 90%;
      text-align: center;
      animation: slideDown 0.3s ease-out;
    `;

    // Ajoute l'animation CSS
    if (!document.querySelector('style[data-warnings]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-warnings', '');
      styleEl.textContent = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `;
      document.head.appendChild(styleEl);
    }

    document.body.appendChild(warningEl);
  }

  warningEl.textContent = message;
  warningEl.style.display = 'block';

  // Cache après 3 secondes
  setTimeout(() => {
    warningEl.style.display = 'none';
  }, 3000);
}

/**
 * Enregistre une tentative d'évasion
 */
function recordEvasionAttempt() {
  console.warn('⚠️ Tentative d\'évasion détectée');

  // Notifie le background script
  chrome.runtime.sendMessage({
    type: 'ATTEMPT_DELETE'
  }).catch(() => {
    console.warn('Impossible de contacter le service worker');
  });
}

// Validation de sécurité supplémentaire
Object.defineProperty(window, 'close', {
  value: function() {
    console.warn('❌ Fermeture bloquée');
  },
  writable: false,
  configurable: false
});

console.log('✅ Page de pause sécurisée');
