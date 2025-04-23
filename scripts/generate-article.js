const fs = require('fs-extra');
const path = require('path');
const { OpenAI } = require('openai');
const slugify = require('slugify');
const { sendDiscordNotification, formatDate } = require('./utils');

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

    // Extraire le frontmatter pour récupérer le titre et le résumé
    const frontmatterMatch = articleContent.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

    let title = topic;
    let summary = '';
    let tags = process.argv[3] || 'ia, technologie';

    // Extraire le titre et le résumé du frontmatter
    const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?$/m);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    const summaryMatch = frontmatter.match(/summary:\s*["']?(.*?)["']?$/m);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }

    const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1].trim();
    }

    // Créer le fichier avec la date actuelle
    const date = new Date().toISOString().split('T')[0];
    const slug = slugify(title, { lower: true, strict: true });
    const filename = `${date}-${slug}.md`;
    const filePath = path.join(__dirname, '../blog', filename);

    // Écrire le contenu dans le fichier
    await fs.writeFile(filePath, articleContent);
    console.log(`Article généré avec succès: ${filePath}`);

    // Créer l'objet article pour la notification
    const article = {
      title,
      summary,
      tags,
      date,
      slug,
      filename
    };

    // Envoyer une notification Discord améliorée si le webhook est configuré
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(process.env.DISCORD_WEBHOOK_URL, {
        content: `📝 **Nouvel article généré !**`,
        article: article,
        deployed: false // Indiquer que l'article n'est pas encore déployé
      });
    }

    return { success: true, filePath, article };
  } catch (error) {
    console.error('Erreur lors de la génération de l\'article:', error.message);

    // Envoyer une notification d'erreur à Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(process.env.DISCORD_WEBHOOK_URL, {
        content: `❌ **Échec de la génération d'article**`,
        embeds: [{
          title: `Erreur : ${topic}`,
          description: `Une erreur est survenue lors de la génération de l'article sur "${topic}"`,
          color: 15158332, // Rouge
          fields: [
            {
              name: 'Message d\'erreur',
              value: error.message || 'Erreur inconnue'
            }
          ]
        }]
      });
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
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "Tu es un expert en technologies qui écrit des articles techniques de haute qualité pour un blog spécialisé." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 3000
  });

  return response.choices[0].message.content;
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