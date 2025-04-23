const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const frontMatter = require('front-matter');
const slugify = require('slugify');

/**
 * Envoie une notification améliorée à un webhook Discord
 * @param {string} webhookUrl - URL du webhook Discord
 * @param {Object} options - Options pour la notification
 */
async function sendDiscordNotification(webhookUrl, options) {
  try {
    if (!webhookUrl) {
      throw new Error('URL du webhook Discord non fournie');
    }

    // Si options est une simple chaîne, la considérer comme le contenu du message
    if (typeof options === 'string') {
      options = { content: options };
    }

    // Configuration de base pour tous les messages
    const payload = {
      username: options.username || 'Gros sac orange',
      avatar_url: options.avatar || 'https://i.imgur.com/6vYNJUQ.png', // Vous pouvez changer cette URL pour votre propre avatar
      content: options.content || ''
    };

    // Si des embeds sont fournis, les utiliser
    if (options.embeds) {
      payload.embeds = options.embeds;
    }
    // Sinon, si les données d'article sont fournies, créer un embed automatiquement
    else if (options.article) {
      const article = options.article;
      const slug = article.slug || slugify(article.title, { lower: true, strict: true });
      const articleUrl = `http://codechroniclehd.great-site.net/articles/${slug}.html`;

      const embed = {
        title: article.title || 'Nouvel article',
        description: article.summary || 'Un nouvel article a été publié sur CodeChronicle',
        url: articleUrl,
        color: 3447003, // Couleur bleue, vous pouvez modifier cette valeur
        timestamp: new Date().toISOString(),
        footer: {
          text: 'CodeChronicle - Blog technique automatisé par IA'
        },
        thumbnail: {
          url: 'https://i.imgur.com/6vYNJUQ.png' // Vous pouvez changer cette URL pour un logo spécifique
        },
        fields: []
      };

      // Ajouter le champ de date si disponible
      if (article.date) {
        embed.fields.push({
          name: 'Date de publication',
          value: formatDate(article.date),
          inline: true
        });
      }

      // Ajouter les tags si disponibles
      if (article.tags && article.tags.length > 0) {
        const tagsText = Array.isArray(article.tags)
          ? article.tags.join(', ')
          : article.tags;

        embed.fields.push({
          name: 'Tags',
          value: tagsText,
          inline: true
        });
      }

      // Ajouter le lien vers l'article
      embed.fields.push({
        name: 'Lien vers l\'article',
        value: `[Lire l'article complet](${articleUrl})`,
        inline: false
      });

      payload.embeds = [embed];
    }
    // Pour les événements GitHub (PR, commits, etc.)
    else if (options.github) {
      const github = options.github;
      const embed = {
        title: github.title || 'Événement GitHub',
        description: github.description || '',
        url: github.url || '',
        color: 7506394, // Couleur verte, vous pouvez modifier cette valeur
        timestamp: new Date().toISOString(),
        footer: {
          text: 'CodeChronicle - GitHub Integration'
        },
        fields: []
      };

      // Ajouter les champs spécifiques à l'événement GitHub
      if (github.fields && github.fields.length > 0) {
        embed.fields = github.fields;
      }

      payload.embeds = [embed];
    }

    await axios.post(webhookUrl, payload);
    console.log('Notification Discord envoyée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification Discord:', error.message);
    return false;
  }
}

/**
 * Récupère tous les articles du blog avec leurs métadonnées
 * @returns {Array} Liste des articles avec leurs métadonnées
 */
async function getAllArticles() {
  const blogDir = path.join(__dirname, '../blog');
  const articles = [];

  try {
    const files = await fs.readdir(blogDir);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(blogDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = frontMatter(content);

        // Extraire la date du nom de fichier
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : 'Date inconnue';

        // Extraire le slug du nom de fichier
        const slugMatch = file.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
        const slug = slugMatch ? slugMatch[1] : slugify(parsed.attributes.title || 'article', { lower: true, strict: true });

        articles.push({
          filename: file,
          path: filePath,
          slug,
          ...parsed.attributes,
          date,
          content: parsed.body
        });
      }
    }

    // Trier par date (du plus récent au plus ancien)
    return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error.message);
    return [];
  }
}

/**
 * Formater une date en format français
 * @param {string} dateStr - Date au format ISO (YYYY-MM-DD)
 * @returns {string} - Date formatée en français
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateStr;
  }
}

/**
 * Vérifie si une chaîne est un JSON valide
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean} - true si JSON valide, false sinon
 */
function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  sendDiscordNotification,
  getAllArticles,
  formatDate,
  isValidJson
};