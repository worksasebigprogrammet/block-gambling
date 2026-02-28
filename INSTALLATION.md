# 📖 Guide d'Installation - Block Gambling

Guide complet pour installer et configurer l'extension Block Gambling sur votre navigateur Chrome.

## 📋 Prérequis

- **Google Chrome** v88+ (ou Chromium-based : Edge, Brave, Vivaldi, etc.)
- **OS** : Windows, macOS, Linux
- **Connexion Internet** (pour le téléchargement initial seulement)

## 🚀 Installation (Mode Développement)

Cette méthode permet de tester et développer l'extension localement.

### Étape 1 : Télécharger les Fichiers

**Option A : Via Git**
```bash
git clone https://github.com/worksasebigprogrammet/block-gambling.git
cd block-gambling
```

**Option B : Téléchargement ZIP**
1. Accède à https://github.com/worksasebigprogrammet/block-gambling
2. Clique "Code" → "Download ZIP"
3. Extrait le ZIP dans un dossier

### Étape 2 : Ouvrir le Gestionnaire d'Extensions

1. **Ouvre Chrome**
2. **Entre l'URL** : `chrome://extensions`
3. Ou : Menu → Paramètres → Extensions

### Étape 3 : Activer le Mode Développeur

1. **Coin supérieur droit** de la page
2. **Bascule** le switch "Mode développeur" → ON

```
┌─────────────────────────────────────────┐
│ 🔍 Rechercher dans les extensions       │
├─────────────────────────────────────────┤
│                          [Mode développeur] ← Clique ici
│
│ Charger l'extension non empaquetée →
│
│ Extensions installées...
└─────────────────────────────────────────┘
```

### Étape 4 : Charger l'Extension

1. **Clique** "Charger l'extension non empaquetée"
2. **Navigue** vers le dossier `block-gambling`
3. **Sélectionne** le dossier (pas un fichier)
4. **Clique** "Sélectionner le dossier"

### Étape 5 : Vérifier l'Installation

✅ L'extension apparaît dans votre liste
✅ L'icône 🎰 s'affiche dans la barre d'adresse
✅ Le popup s'ouvre quand tu cliques l'icône

## 🎮 Utilisation Basique

### Première Utilisation

1. **Clique** l'icône 🎰 dans la barre d'adresse
2. Vérifie que l'état est "🟢 Activée"
3. C'est prêt !

### Ajouter un Domaine

1. **Ouvre le popup** (clique l'icône 🎰)
2. **Entre** un domaine ou mot-clé
   - Exemples : `casino.com`, `poker`, `*.betting.com`
3. **Clique** "Ajouter"
4. ✅ Domaine ajouté (permanent)

### Tester le Blocage

1. **Ajoute** un site dans la liste (ex: `example.com`)
2. **Navigue vers** `https://example.com`
3. La page de pause s'affiche
4. Le compte à rebours commence
5. Après 60s, tu peux revenir

## ⚙️ Configuration Avancée

### Modifier la Durée de Pause

```javascript
// pages/pause.js - Ligne ~15
const WAIT_TIME_SECONDS = 60;  // ← Change la valeur (ex: 30, 120)
```

Puis recharge l'extension dans `chrome://extensions`.

### Ajouter des Domaines à la Liste de Base

```javascript
// src/storage.js - Ligne ~12
const BASE_BLOCKLIST = [
  'bet365.com',
  'nouveau-site.com',  // ← Ajoute ici
  // ...
];
```

### Augmenter la Durée de Pénalité

```javascript
// src/background.js - Ligne ~150
const duration = 24 * 60 * 60 * 1000;  // ← 24h en ms
// Exemple : 48h = 48 * 60 * 60 * 1000
```

## 🔄 Mise à Jour

### Mettre à Jour l'Extension

1. **Télécharge** la dernière version
2. **Remplace** les fichiers dans le dossier `block-gambling`
3. **Ouvre** `chrome://extensions`
4. **Clique** l'icône de rechargement 🔄 sur Block Gambling
5. ✅ À jour !

Les données (domaines ajoutés) sont préservées.

## 🆘 Dépannage

### L'extension ne s'affiche pas

**Problème** : Après installation, l'extension n'apparaît pas
**Solution** :
1. Vérifie que tu as sélectionné le bon dossier (avec `manifest.json`)
2. Actualise `chrome://extensions` (F5)
3. Redémarre Chrome complètement

### Le popup ne s'ouvre pas

**Problème** : Clique sur l'icône ne fait rien
**Solution** :
1. Recharge l'extension (`chrome://extensions` → Rechargement)
2. Vérifie les permissions (Menu → Paramètres → Extensions → Block Gambling)
3. Assure-toi que `popup.html` et `popup.js` existent

### Le blocage ne fonctionne pas

**Problème** : Les sites bloqués ne sont pas interceptés
**Solution** :
1. Vérifie que l'extension est "🟢 Activée" dans le popup
2. Test avec un domaine simple (ex: `test.com`)
3. Ouvre la Console (F12) pour voir les erreurs
4. Recharge l'extension complètement

### Erreur lors de l'ajout d'un domaine

**Problème** : Message d'erreur lors de l'ajout
**Solution** :
```
Formats valides :
✅ example.com
✅ poker
✅ *.betting.com

❌ http://example.com (pas de protocole)
❌ example..com (domaine invalide)
❌ 123@456 (caractères spéciaux)
```

### La page de pause s'affiche mais ne fonctionne pas

**Problème** : Compte à rebours figé ou bouton ne fonctionne pas
**Solution** :
1. Recharge l'extension
2. Vérifie que `pause.html`, `pause.js`, `pause.css` existent
3. Ouvre la Console (F12) pour voir les erreurs
4. Test avec une URL simple

## 🐛 Vérifier les Erreurs

### Ouvrir la Console d'Erreurs

1. **Ouvre** `chrome://extensions`
2. **Clique** "Détails" sur Block Gambling
3. **Cherche** la section "Service Worker"
4. **Clique** le lien bleu pour afficher la console

### Ouvrir la Console de Débogage

1. Lors du test du popup : `F12` puis clique l'onglet "Console"
2. Quand la page de pause s'affiche : `F12` → "Console"

## 📱 Installation sur Autres Navigateurs

### Microsoft Edge

1. **Ouvre** Edge
2. **Paramètres** → Extensions
3. **Bascule** "Mode développeur" → ON
4. **Clique** "Charger l'extension non empaquetée"
5. **Sélectionne** le dossier `block-gambling`

### Brave

Même processus qu'Edge.

### Vivaldi

1. **Menu** → Extensions
2. **Clique** "Gérer les extensions"
3. Identique à Chrome

## ✅ Checklist d'Installation

Après installation, vérifie que tout fonctionne :

- [ ] L'icône 🎰 s'affiche dans la barre d'adresse
- [ ] Le popup s'ouvre quand je clique l'icône
- [ ] L'extension affiche "🟢 Activée"
- [ ] Je peux ajouter un domaine sans erreur
- [ ] La liste de base s'affiche dans le popup
- [ ] Je peux voir mes domaines ajoutés
- [ ] Quand je navigue vers un site bloqué, la page de pause s'affiche
- [ ] Le compte à rebours fonctionne
- [ ] Le bouton "Revenir" s'active après 60s
- [ ] Mode sombre/clair fonctionne (bouton 🌙)

## 🚨 Problèmes Avancés

### Supprimer Complètement l'Extension

1. **Ouvre** `chrome://extensions`
2. **Clique** "Supprimer" sur Block Gambling
3. **Confirme** la suppression

### Réinitialiser les Paramètres

La données sont stockées localement et persistent après rechargement.
Pour réinitialiser :

1. **Supprime** l'extension (voir au-dessus)
2. **Réinstalle**
3. Données supprimées, nouvelle installation vierge

### Exporter / Importer les Données

Les données ne sont **pas** directement exportables via l'UI.

Pour exporter via Console (développeur) :

```javascript
// Dans la console de la page de popup (F12)
chrome.storage.local.get(null, (data) => {
  console.log(JSON.stringify(data, null, 2));
});
```

Copie le résultat et sauvegarde dans un fichier JSON.

## 📞 Support Technique

### Avant de Demander de l'Aide

1. Essaie de **recharger** l'extension (`chrome://extensions` → 🔄)
2. Essaie de **redémarrer** Chrome complètement
3. Vérifie que tu as **la dernière version**
4. Teste sur un **domaine simple** (ex: `test.com`)
5. Ouvre la **Console** (`F12`) pour voir les erreurs

### Signaler un Bug

1. Ouvre une Issue : https://github.com/worksasebigprogrammet/block-gambling/issues
2. Décris le problème clairement
3. Inclu les étapes pour reproduire
4. Partage la version de Chrome (Menu → À propos de Google Chrome)
5. Partage les erreurs de console (F12 → Console)

## 🎓 Tutoriels Vidéo (à faire)

- [ ] Installation complète (2 min)
- [ ] Ajouter des domaines (1 min)
- [ ] Tester le blocage (1 min)
- [ ] Comprendre les pénalités (2 min)

## 📚 Ressources Additionnelles

- [Documentation Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [Troubleshooting Extensions](https://support.google.com/chrome/a/answer/2714220)

---

**Besoin d'aide ?** → Consulte le [README.md](./README.md) ou ouvre une [Issue](https://github.com/worksasebigprogrammet/block-gambling/issues).

*Installation simple, protection durable.* 🛡️
