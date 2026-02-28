# 🎰 Block Gambling - Extension Chrome Anti-Addiction

Une extension Chrome **open-source** pour réduire l'addiction aux jeux d'argent via une **friction intelligente** et un **engagement unidirectionnel**.

## 🎯 Philosophie

Cette extension repose sur un principe fondamental : **facile à renforcer, difficile à affaiblir**. Contrairement aux outils traditionnels qui permettent une suppression facile, Block Gambling crée un engagement durable où :

- ✅ L'ajout de sites est simple et rapide
- ✅ Les listes ne peuvent **jamais** être supprimées
- ✅ Toute tentative de contournement déclenche une pénalité de 24h
- ✅ La friction augmente avec chaque tentative d'évasion

## 🚀 Fonctionnalités

### Blocage Intelligent
- **Liste de base hardcodée** : ~30 casinos en ligne majeurs
- **Liste utilisateur append-only** : Ajout illimité, suppression impossible
- **Matching flexible** : Domaines exacts, wildcards, mots-clés

### Page de Mise en Pause
- ⏸️ Écran de pause avec compte à rebours (30-60s)
- 💭 Messages non-moralisateurs
- 🔙 Bouton "Revenir" unique (débloqué après attente)
- 🚨 Avertissements de pénalité si applicable

### Protection Contre l'Évasion
- 🛡️ Interception des modifications localStorage
- 🔒 Blocage des outils de développement
- ⚠️ Pénalité de 24h en cas de tentative de suppression
- 📱 Prévention des raccourcis clavier de fermeture

### Interface Utilisateur
- 🌓 Mode sombre/clair
- 📊 Statistiques en temps réel
- 📋 Gestion transparente des listes
- ♿ Accessibilité complète (WCAG 2.1)

## 📋 Structure du Projet

```
block-gambling/
├── manifest.json              # Manifest V3
├── src/
│   ├── background.js          # Service Worker
│   ├── content.js             # Content Script
│   ├── popup.js               # Logique du popup
│   ├── storage.js             # Gestion du stockage
│   ├── blocklist.js           # Logique de matching
│   └── utils.js               # Utilitaires
├── pages/
│   ├── popup.html            # UI du popup
│   ├── popup.css             # Styles du popup
│   ├── pause.html            # Page de pause
│   ├── pause.css             # Styles de pause
│   └── pause.js              # Logique de pause
├── assets/
│   └── icons/                # Icônes (à générer)
├── README.md                 # Cette documentation
└── INSTALLATION.md           # Guide d'installation
```

## 🔧 Installation

Voir [INSTALLATION.md](./INSTALLATION.md) pour les instructions détaillées.

### Installation Rapide (Développement)

1. **Clone ou télécharge** le repository
2. **Ouvre** `chrome://extensions`
3. **Active** "Mode développeur" (coin supérieur droit)
4. **Clique** "Charger l'extension non empaquetée"
5. **Sélectionne** le dossier `block-gambling`

## 📖 Utilisation

### Ajouter un Domaine

1. **Ouvre le popup** de l'extension
2. **Entre** un domaine (`casino.com`) ou mot-clé (`poker`)
3. **Clique** "Ajouter"

Les domaines ajoutés sont **permanents** et **non supprimables**.

### Comprendre les Listes

- **Liste de base** : 30+ sites majeurs, hardcodés dans le code
- **Mes domaines** : Domaines que vous ajoutez (append-only)
- **Total** : Somme des deux listes

### Page de Pause

Quand vous tentez d'accéder à un site bloqué :

1. Une page de pause s'affiche
2. Un compte à rebours de **60 secondes** commence
3. Vous devez attendre la fin du compte à rebours
4. Le bouton "Revenir" devient actif
5. Cliquez pour revenir à votre page précédente

**Important** : Les tentatives de contournement (DevTools, fermeture d'onglet, refresh) sont bloquées.

## 🛡️ Sécurité & Évasion

### Protections Implémentées

| Menace | Protection |
|--------|-----------|
| Suppression via localStorage | Interception et pénalité |
| Modification du code | Content Script en lire seul |
| Ouverture de DevTools | Prévention + pénalité |
| Fermeture d'onglet | beforeunload + avertissement |
| Ctrl+W / Escape | Interception clavier |
| Clear du localStorage | Vérification des clés |
| Modification du manifest | Impossible (fichier statique) |

### Pénalités

Une tentative de suppression ou d'évasion déclenche :

```
🚨 PÉNALITÉ : 24h de blocage renforcé
```

Pendant cette période, **même le bouton "Revenir" ne fonctionne pas**.

## 🎨 Architecture Technique

### Manifest V3

L'extension utilise **Manifest V3** (standard moderne) :
- Service Worker au lieu de background page
- Pas de content script injecting dans le DOM
- API chrome.tabs pour interception de navigation
- Pas de tracking ni analytics

### Flux de Données

```
┌─────────────────────────────────────────┐
│  Service Worker (background.js)          │
│  - Écoute chrome.tabs.onUpdated          │
│  - Récupère la blocklist complète        │
│  - Redirige vers pause.html si bloqué   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Pause Page (pause.html/js)              │
│  - Affiche le compte à rebours           │
│  - Bloque les évasions                   │
│  - Enregistre les tentatives             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Popup (popup.html/js)                   │
│  - Gère l'ajout de domaines              │
│  - Affiche les statistiques              │
│  - Permet toggle on/off                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Storage (chrome.storage.local)          │
│  - userBlocklist (append-only)           │
│  - penaltyEndTime                        │
│  - extensionEnabled                      │
└─────────────────────────────────────────┘
```

### Algorithme de Matching

```javascript
isBlocklistMatch(domain, blocklist) {
  for (entry of blocklist) {
    // Exact match: "bet365.com" === "bet365.com"
    // Wildcard: "*.casino.com" matches "site.casino.com"
    // Keyword: "casino" matches "online-casino.net"
  }
}
```

## 🔐 Pas de Serveur, Pas de Tracking

✅ **Aucune donnée envoyée en ligne**
✅ **Aucun tracking utilisateur**
✅ **Fonctionnement 100% hors-ligne**
✅ **Données stockées localement uniquement**

Tout est stocké dans `chrome.storage.local`.

## 📊 Liste de Base Hardcodée

La liste inclut les plus gros opérateurs :

### Casinos Majeurs
- bet365.com, betfair.com, williamhill.com, ladbrokes.com
- bwin.com, 888.com, unibet.com, betway.com
- fanduel.com, draftkings.com, betmgm.com, caesars.com

### Poker
- pokerstars.com, partypoker.com

### Crypto/NFT (Gambling-like)
- stake.com, bc.game, blur.io

[Voir la liste complète dans `src/storage.js`](./src/storage.js)

## 🎯 Cas d'Usage

### Pour les Individus
- Réduire les dépenses aux jeux
- Créer une friction anti-impulsion
- Engager un changement durable

### Pour les Familles
- Protéger les enfants/ados
- Montrer le compromis parents-enfants
- Créer des limites claires

## 🚀 Développement

### Requirements
- Chrome 88+
- JavaScript (vanilla, pas de frameworks)

### Architecture

- **Manifest V3** compatible
- **Modules séparés** pour testabilité
- **Pas de dépendances** externes
- **Code commenté** en français

### Extension des Listes

Pour ajouter des domaines à la liste de base :

```javascript
// src/storage.js
const BASE_BLOCKLIST = [
  'bet365.com',
  'nouveau-domaine.com',  // ← Ajoute ici
  // ...
];
```

Rechargez l'extension dans `chrome://extensions`.

## ⚙️ Configuration Avancée

### Modifier le Temps de Pause

```javascript
// src/pause.js
const WAIT_TIME_SECONDS = 60;  // ← Change ici
```

### Modifier la Durée de Pénalité

```javascript
// src/background.js
const duration = 24 * 60 * 60 * 1000;  // ← 24h, change si besoin
```

## 📱 Limitations Connues

| Limitation | Raison |
|-----------|--------|
| Ne bloque pas le HTTPS (décryptage) | Restriction de V3 |
| VPN permet le contournement | Limitations de l'API |
| Nécessite rechargement après modification | Manifest V3 |
| Pas d'interface de monitoring avancée | Fenêtre popup limitée |

## 🤝 Contribution

Les contributions sont bienvenues !

### Comment Contribuer

1. Fork le repository
2. Crée une branche (`git checkout -b feature/ma-feature`)
3. Commit tes changements (`git commit -m 'Add: nouvelle fonctionnalité'`)
4. Push (`git push origin feature/ma-feature`)
5. Crée une Pull Request

### Idées d'Amélioration

- [ ] Support pour Safari
- [ ] Synchronisation cross-device (serveur optionnel)
- [ ] Rapports d'usage (local)
- [ ] Blocage avancé (image, vidéo)
- [ ] Intégration avec services d'aide

## 📜 Licence

MIT - Libre d'utilisation, modification, distribution.

## 🆘 Support

### Installation Échouée ?
→ Voir [INSTALLATION.md](./INSTALLATION.md)

### Questions Techniques ?
→ Ouvre une [Issue GitHub](https://github.com/worksasebigprogrammet/block-gambling/issues)

### Signaler un Bug ?
→ Crée une [Issue avec le label `bug`](https://github.com/worksasebigprogrammet/block-gambling/issues)

## 🙏 Remerciements

Inspirée par :
- Nir Eyal - *Indistractable*
- Mark Griffiths - Recherche sur l'addiction comportementale
- Jaron Lanier - *Arguments pour le bien-être digital*

## 📚 Ressources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [Problem Gambling Resources](https://www.ncpg.org/)
- [Addiction Psychology](https://www.apa.org/)

---

**Créé avec ❤️ pour un internet plus sain.**

*Block Gambling - Votre allié contre l'addiction aux jeux d'argent.*
