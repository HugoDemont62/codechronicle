// Modified version of build-site.js
const fs = require('fs-extra');
const path = require('path');
const frontMatter = require('front-matter');
const { marked } = require('marked');

// Configuration
const BLOG_DIR = path.join(__dirname, '../blog');
const PUBLIC_DIR = path.join(__dirname, '../public');
const TEMPLATES_DIR = path.join(__dirname, '../templates');

/**
 * Convertit les délimiteurs code block ```yaml en délimiteurs YAML standard ---
 * @param {string} content - Contenu du fichier Markdown
 * @returns {string} - Contenu avec frontmatter standardisé pour la bibliothèque front-matter
 */
function standardizeFrontmatter(content) {
  // Si le contenu commence par ```yaml, le convertir au format standard
  if (content.startsWith('```yaml')) {
    return content
    .replace(/^```yaml\n/, '---\n')
    .replace(/\n```\n/, '\n---\n');
  }
  return content;
}

// Fonction principale
async function buildSite() {
  try {
    console.log('Démarrage de la construction du site...');

    // S'assurer que le dossier public existe
    await fs.ensureDir(PUBLIC_DIR);

    // Créer les sous-dossiers nécessaires
    await fs.ensureDir(path.join(PUBLIC_DIR, 'css'));
    await fs.ensureDir(path.join(PUBLIC_DIR, 'js'));
    await fs.ensureDir(path.join(PUBLIC_DIR, 'articles'));

    // Copier les fichiers CSS et JS si existants
    await copyStaticAssets();

    // Lire tous les articles du blog
    const blogFiles = await fs.readdir(BLOG_DIR);
    const articles = [];

    // Traiter chaque article
    for (const file of blogFiles) {
      if (file.endsWith('.md')) {
        const article = await processArticle(file);
        if (article) {
          articles.push(article);
        }
      }
    }

    // Trier les articles par date (du plus récent au plus ancien)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Générer la page d'index
    await generateIndexPage(articles);

    console.log('Site construit avec succès dans le dossier public/');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la construction du site:', error.message);
    return { success: false, error: error.message };
  }
}

// Traiter un article
async function processArticle(filename) {
  try {
    const filePath = path.join(BLOG_DIR, filename);
    let content = await fs.readFile(filePath, 'utf8');

    // Standardiser le frontmatter si nécessaire
    content = standardizeFrontmatter(content);

    // Parser le frontmatter
    const parsed = frontMatter(content);
    const { title, summary, tags } = parsed.attributes;

    // Extraire la date du nom de fichier (format: YYYY-MM-DD-slug.md)
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : 'Date inconnue';

    // Convertir le contenu markdown en HTML
    const htmlContent = marked(parsed.body);

    // Créer le slug pour l'URL
    const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/, '$1');

    // Charger le template d'article
    let articleTemplate;
    try {
      articleTemplate = await fs.readFile(path.join(TEMPLATES_DIR, 'article.html'), 'utf8');
    } catch (error) {
      // Si le template n'existe pas, créer un template de base
      articleTemplate = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{title}} - CodeChronicle</title>
        <link rel="stylesheet" href="../css/style.css">
      </head>
      <body>
        <header>
          <nav>
            <a href="../index.html">Accueil</a>
          </nav>
          <h1>CodeChronicle</h1>
        </header>
        <main>
          <article>
            <header>
              <h1>{{title}}</h1>
              <p class="date">Publié le {{date}}</p>
              <p class="tags">{{tags}}</p>
            </header>
            <div class="content">
              {{content}}
            </div>
          </article>
        </main>
        <footer>
          <p>&copy; 2025 CodeChronicle - Blog technique automatisé par IA</p>
        </footer>
      </body>
      </html>
      `;
    }

    // Remplacer les variables dans le template
    const tagsHtml = tags ? Array.isArray(tags)
        ? tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')
        : `<span class="tag">${tags}</span>`
      : '';

    let articleHtml = articleTemplate
    .replace(/{{title}}/g, title || filename)  // Utiliser le nom du fichier si pas de titre
      .replace(/{{date}}/g, formatDate(date))
      .replace(/{{tags}}/g, tagsHtml)
      .replace(/{{summary}}/g, summary || '')
      .replace(/{{content}}/g, htmlContent);

    // Écrire le fichier HTML dans le dossier public/articles
    const outputPath = path.join(PUBLIC_DIR, 'articles', `${slug}.html`);
    await fs.writeFile(outputPath, articleHtml);

    console.log(`Article traité: ${filename} -> ${outputPath}`);

    return {
      title: title || filename.replace(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/, '$1'),
      summary: summary || '',
      date,
      tags: tags || [],
      slug,
      url: `articles/${slug}.html`
    };
  } catch (error) {
    console.error(`Erreur lors du traitement de l'article ${filename}:`, error.message);
    return null;
  }
}

// Générer la page d'index
async function generateIndexPage(articles) {
  // Charger le template d'index
  let indexTemplate;
  try {
    indexTemplate = await fs.readFile(path.join(TEMPLATES_DIR, 'index.html'), 'utf8');
  } catch (error) {
    // Si le template n'existe pas, créer un template de base
    indexTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeChronicle - Blog Technique IA</title>
      <link rel="stylesheet" href="css/style.css">
    </head>
    <body>
      <header>
        <h1>CodeChronicle</h1>
        <p>Blog technique automatisé par Intelligence Artificielle</p>
      </header>
      <main>
        <section class="articles">
          <h2>Articles Récents</h2>
          {{articles}}
        </section>
      </main>
      <footer>
        <p>&copy; 2025 CodeChronicle - Blog technique automatisé par IA</p>
      </footer>
    </body>
    </html>
    `;
  }

  // Générer le HTML pour chaque article
  const articlesHtml = articles.map(article => `
    <article class="article-card">
      <h3><a href="${article.url}">${article.title || 'Article sans titre'}</a></h3>
      <p class="date">Publié le ${formatDate(article.date)}</p>
      <p class="summary">${article.summary || ''}</p>
      <p class="tags">
        ${Array.isArray(article.tags)
    ? article.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')
    : article.tags ? `<span class="tag">${article.tags}</span>` : ''}
      </p>
    </article>
  `).join('');

  // Remplacer les variables dans le template
  const indexHtml = indexTemplate.replace(/{{articles}}/g, articlesHtml);

  // Écrire le fichier HTML dans le dossier public
  await fs.writeFile(path.join(PUBLIC_DIR, 'index.html'), indexHtml);

  console.log('Page d\'index générée');
}

// Copier les assets statiques
async function copyStaticAssets() {
  try {
    // Créer un fichier CSS de base s'il n'existe pas
    const cssDir = path.join(PUBLIC_DIR, 'css');
    const cssFile = path.join(cssDir, 'style.css');

    if (!await fs.pathExists(cssFile)) {
      const defaultCss = `
        /* Style de base pour CodeChronicle */
        :root {
          --primary-color: #3498db;
          --secondary-color: #2c3e50;
          --background-color: #f9f9f9;
          --text-color: #333;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background-color: var(--background-color);
          margin: 0;
          padding: 0;
        }
        
        header {
          background-color: var(--secondary-color);
          color: #fff;
          padding: 1.5rem;
          text-align: center;
        }
        
        main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        footer {
          background-color: var(--secondary-color);
          color: #fff;
          text-align: center;
          padding: 1rem;
          margin-top: 2rem;
        }
        
        a {
          color: var(--primary-color);
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        .articles {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .article-card {
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          padding: 1.5rem;
          transition: transform 0.3s ease;
        }
        
        .article-card:hover {
          transform: translateY(-5px);
        }
        
        .tag {
          background-color: var(--primary-color);
          color: white;
          border-radius: 3px;
          padding: 2px 8px;
          margin-right: 5px;
          font-size: 0.8rem;
        }
        
        .date {
          color: #666;
          font-size: 0.9rem;
        }
        
        article {
          line-height: 1.8;
        }
        
        article h1 {
          color: var(--secondary-color);
        }
        
        article .content img {
          max-width: 100%;
          height: auto;
        }
      `;
      await fs.writeFile(cssFile, defaultCss);
      console.log('Fichier CSS par défaut créé');
    }

    // Vous pouvez ajouter ici d'autres assets comme JavaScript, images, etc.
  } catch (error) {
    console.error('Erreur lors de la copie des assets statiques:', error.message);
  }
}

// Formater une date
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

// Exécution du script si lancé directement
if (require.main === module) {
  buildSite()
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
  module.exports = { buildSite };
}