# 🎨 Icons - Block Gambling Extension

## Fichiers Nécessaires

L'extension requiert 3 fichiers PNG pour les icônes :

```
assets/icons/
├── icon-16.png   (16x16 pixels)
├── icon-48.png   (48x48 pixels)
└── icon-128.png  (128x128 pixels)
```

## Générer les Icônes

### Option 1 : Utiliser une Plateforme en Ligne

1. Accède à https://www.favicon-generator.org/ ou https://realfavicongenerator.net/
2. **Charge** une image de base (un casino/poker/dé à jouer)
3. **Exporte** pour Chrome Extension
4. **Redimensionne** à : 16x16, 48x48, 128x128
5. **Place** dans ce dossier

### Option 2 : Utiliser ImageMagick (Ligne de Commande)

```bash
# Installe ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: Télécharge depuis imagemagick.org

# Depuis une image source "icon.png" (128x128 min)
convert icon.png -resize 16x16 icon-16.png
convert icon.png -resize 48x48 icon-48.png
convert icon.png -resize 128x128 icon-128.png
```

### Option 3 : Utiliser Figma

1. Crée un compte gratuit : https://figma.com
2. Crée un design pour 🎰 (casino emoji style)
3. Exporte en PNG à chaque taille
4. Place dans ce dossier

### Option 4 : Design Simple

Voici un design minimaliste en Unicode + Image :

```
🎰 = Emoji Casino (utiliser comme base)
   Couleur : #ef4444 (rouge)
   Fond blanc/transparent
```

## Format Requis

- **Format** : PNG
- **Résolutions** : 16x16, 48x48, 128x128
- **Fond** : Transparent (PNG avec alpha)
- **Couleur** : Rouge (#ef4444) recommandée
- **Style** : Simple, reconnaissable, distinctif

## Exemples de Design

### Design 1 : Emoji Stylisé
```
Utilise l'emoji 🎰 comme base
Encadre avec cercle rouge
Fond blanc transparent
```

### Design 2 : Géométrique
```
Carré rouge avec "G" blanc
G = Gambling
Simple et mémorisable
```

### Design 3 : Symbole de Blocage
```
Cercle rouge avec ligne diagonale (🚫)
Signale clairement le blocage
Universel et reconnaissable
```

## Vérifier les Icônes

Après ajout des fichiers :

1. **Ouvre** `chrome://extensions`
2. **Recharge** l'extension (bouton 🔄)
3. Vérifie que l'icône s'affiche correctement dans la barre

Si l'icône ne s'affiche pas :
1. Vérifie que les fichiers sont au bon format (PNG)
2. Vérifie les noms exacts (icon-16.png, etc.)
3. Recharge l'extension complètement
4. Vérifiez dans la console pour les erreurs

## Licence

Les icônes que tu crées doivent être :
- Ton travail original, OU
- Sous licence open-source compatible (CC0, MIT, etc.)

## Ressources d'Icônes Libres

Si tu as besoin d'inspiration :

- **Noun Project** : https://thenounproject.com/ (libre/payant)
- **Flaticon** : https://www.flaticon.com/ (gratuit avec attribution)
- **Icons8** : https://icons8.com/ (gratuit avec attribution)
- **Feather Icons** : https://feathericons.com/ (gratuit, open-source)

---

**À faire** : Ajoute 3 fichiers PNG avec les noms exacts pour que l'extension s'affiche correctement.
