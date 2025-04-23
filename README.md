# CodeChronicle 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/username/codechronicle/actions/workflows/generate-article.yml/badge.svg)](https://github.com/username/codechronicle/actions/workflows/generate-article.yml)
[![GitHub last commit](https://img.shields.io/github/last-commit/username/codechronicle.svg)](https://github.com/username/codechronicle/commits/main)
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

## 📝 Utilisation

### Générer un article
```bash
npm run generate "Sujet de l'article"
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

## 🌐 Déploiement

Le déploiement sur InfinityFree se fait manuellement :

1. Construire le site : `npm run build`
2. Uploader le contenu du dossier `public/` sur votre hébergement InfinityFree via FTP
    - Nom d'hôte FTP : généralement `ftpupload.net`
    - Nom d'utilisateur/mot de passe : ceux fournis par InfinityFree
    - Dossier distant : généralement `htdocs/`

## 📜 Gestion des secrets

Les secrets (clé API OpenAI, webhook Discord) sont gérés via GitHub Secrets et ne doivent jamais être commités dans le code source.

Pour ajouter ces secrets dans votre dépôt GitHub :
1. Aller dans "Settings" > "Secrets and variables" > "Actions"
2. Cliquer sur "New repository secret"
3. Ajouter `OPENAI_API_KEY` et `DISCORD_WEBHOOK_URL` avec leurs valeurs respectives

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commiter vos changements (`git commit -m 'feat: add amazing feature'`)
4. Pusher vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.