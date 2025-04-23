const fs = require('fs-extra');
const path = require('path');
const { OpenAI } = require('openai');
const slugify = require('slugify');
const axios = require('axios');

// Configuration
require('dotenv').config();

// Initialiser OpenAI avec la clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Vérification des arguments de ligne de commande
const topic = process.argv[2];
if (!topic) {
  console.error('Veuillez spécifier un sujet pour l\'article');
  console.log('Exemple: node scripts/generate-article.js "Intelligence Artificielle Générative"');
  process.exit(1);
}

// Fonction principale
async function generateArticle() {
  try {
    console.log(`Génération d'un article sur le sujet: ${topic}`);

    // Générer le contenu via OpenAI
    const articleContent = await generateContentWithAI(topic);

    // Créer le fichier avec la date actuelle
    const date = new Date().toISOString().split('T')[0];
    const slug = slugify(topic, { lower: true, strict: true });
    const filename = `${date}-${slug}.md`;
    const filePath = path.join(__dirname, '../blog', filename);

    // Écrire le contenu dans le fichier
    await fs.writeFile(filePath, articleContent);
    console.log(`Article généré avec succès: ${filePath}`);

    // Envoyer une notification Discord si le webhook est configuré
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(`📝 Nouvel article généré: **${topic}**`);
    }

    return { success: true, filePath, topic };
  } catch (error) {
    console.error('Erreur lors de la génération de l\'article:', error.message);

    // Envoyer une notification d'erreur à Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(`❌ Échec de la génération d'article: **${topic}**\nErreur: ${error.message}`);
    }

    return { success: false, error: error.message };
  }
}

// Fonction pour générer le contenu avec OpenAI
async function generateContentWithAI(topic) {
  const prompt = `
  Écris un article technique détaillé et informatif sur le sujet suivant: "${topic}".
  
  L'article doit être structuré avec:
  - Une introduction claire
  - 3-4 sections principales avec sous-titres
  - Des exemples pratiques ou cas d'usage
  - Une conclusion
  
  Format requis:
  - Utilise Markdown
  - Inclus un frontmatter YAML au début avec title, summary, et tags
  - L'article doit faire au moins 800 mots
  
  Assure-toi que le contenu soit factuel, bien recherché et utile pour des développeurs.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "Tu es un expert en technologies qui écrit des articles techniques de haute qualité pour un blog spécialisé." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 3000
  });

  return response.choices[0].message.content;
}

// Fonction pour envoyer une notification Discord
async function sendDiscordNotification(message) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    await axios.post(webhookUrl, {
      content: message,
      username: 'CodeChronicle Bot'
    });
    console.log('Notification Discord envoyée');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification Discord:', error.message);
  }
}

// Exécution du script si lancé directement
if (require.main === module) {
  generateArticle()
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
} else {
  // Exportation pour l'utilisation en tant que module
  module.exports = { generateArticle };
}