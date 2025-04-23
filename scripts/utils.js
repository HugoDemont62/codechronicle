const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const frontMatter = require('front-matter');

/**
 * Envoie une notification à un webhook Discord
 * @param {string} webhookUrl - URL du webhook Discord
 * @param {Object} message - Message à envoyer
 */
async function sendDiscordNotification(webhookUrl, message) {
  try {
    if (!webhookUrl) {
      throw new Error('URL du webhook Discord non fournie');
    }

    const payload = typeof message === 'string'
      ? { content: message, username: 'Gros sac orange' }
      : { ...message, username: 'Gros sac orange' };

    await axios.post(webhookUrl, payload);
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

        articles.push({
          filename: file,
          path: filePath,
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