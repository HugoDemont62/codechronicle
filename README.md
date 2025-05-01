# CodeChronicle 🚀

[![GitHub last commit](https://img.shields.io/github/last-commit/username/codechronicle.svg)](https://github.com/HugoDemont62/codechronicle/commits/master/)
[![Discord](https://img.shields.io/badge/Discord-Notifications-7289DA.svg)](https://discord.gg)

> Blog technique automatisé par l'Intelligence Artificielle

CodeChronicle est un projet de blog technique dont le contenu est généré automatiquement par l'IA. Les articles sont créés via l'API OpenAI, convertis en HTML statique, et déployés manuellement sur InfinityFree.

## 📋 Fonctionnalités

- ✅ Génération automatique d'articles techniques via l'IA (OpenAI)
- ✅ Conversion Markdown vers HTML avec frontmatter YAML
- ✅ Workflows GitHub Actions pour l'automatisation
- ✅ Notifications Discord automatiques
- ✅ Commentaires automatiques sur les Pull Requests
- ✅ Site statique facilement déployable

## 🛠️ Technologies utilisées

- Node.js - Environnement d'exécution JavaScript
- GitHub Actions - Automatisation des workflows
- Markdown - Format des articles
- OpenAI API - Génération de contenu
- Discord Webhooks - Notifications
- HTML/CSS - Site statique

## 🗂️ Structure du projet

```
codechronicle/
├── .github/workflows/          # Workflows GitHub Actions
├── scripts/                    # Scripts Node.js
├── blog/                       # Articles en Markdown
├── public/                     # Site statique généré
├── templates/                  # Templates HTML
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Installation

1. Cloner le dépôt
   ```bash
   git clone https://github.com/username/codechronicle.git
   cd codechronicle
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
    - Créer un fichier `.env` à la racine du projet:
   ```
   OPENAI_API_KEY=votre-clé-api
   DISCORD_WEBHOOK_URL=votre-url-webhook
   ```

### Construire le site
```bash
npm run build
```

### Lancer les GitHub Actions

Pour générer un article via GitHub Actions, utilisez l'action "Generate Article" dans l'onglet Actions du dépôt GitHub et fournissez un sujet.

## 🔄 Workflows GitHub Actions

1. **generate-article.yml** - Génère un nouvel article sur un sujet donné via l'API OpenAI
2. **pr-comment.yml** - Ajoute des commentaires automatiques aux Pull Requests
3. **discord-notification.yml** - Envoie des notifications Discord lors des événements importants

## 📜 Gestion des secrets

Les secrets (clé API OpenAI, webhook Discord) sont gérés via GitHub Secrets et ne doivent jamais être commités dans le code source.

Pour ajouter ces secrets dans votre dépôt GitHub :
1. Aller dans "Settings" > "Secrets and variables" > "Actions"
2. Cliquer sur "New repository secret"
3. Ajouter `OPENAI_API_KEY` et `DISCORD_WEBHOOK_URL` avec leurs valeurs respectives
