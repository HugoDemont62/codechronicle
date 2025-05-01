const fs = require('fs-extra');
const path = require('path');

// Configuration
const BLOG_DIR = path.join(__dirname, 'blog');

/**
 * Convertit les délimiteurs code block ```yaml en délimiteurs YAML standard ---
 * @param {string} content - Contenu du fichier Markdown
 * @returns {string} - Contenu avec frontmatter corrigé
 */
function fixFrontmatter(content) {
  // Si le contenu commence par ```yaml, remplacer par ---
  if (content.startsWith('```yaml')) {
    return content
    .replace(/^```yaml\n/, '---\n')
    .replace(/\n```\n/, '\n---\n');
  }
  return content;
}

/**
 * Traite tous les fichiers Markdown dans le répertoire blog
 */
async function processBlogFiles() {
  try {
    // Obtenir la liste des fichiers Markdown
    const files = await fs.readdir(BLOG_DIR);
    let modifiedCount = 0;

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(BLOG_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');

        // Vérifier si le fichier contient un frontmatter à corriger
        if (content.startsWith('```yaml')) {
          const fixedContent = fixFrontmatter(content);
          await fs.writeFile(filePath, fixedContent);
          console.log(`✅ Corrigé: ${file}`);
          modifiedCount++;
        } else {
          console.log(`⏭️ Ignoré: ${file} (format déjà correct)`);
        }
      }
    }

    console.log(`\n📊 Résumé: ${modifiedCount} fichier(s) corrigé(s) sur ${files.length} fichier(s) markdown`);
  } catch (error) {
    console.error('Erreur lors du traitement des fichiers:', error);
  }
}

// Exécuter le script
processBlogFiles();