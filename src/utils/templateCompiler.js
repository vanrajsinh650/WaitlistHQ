import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory holding the templates
const TEMPLATE_DIR = path.resolve(__dirname, '../templates');

// Cache to prevent reading files from disk multiple times
const templateCache = new Map();

/**
 * Reads and compiles a dynamic HTML email template
 * @param {string} templateName - Name of the template (without extension, e.g., 'welcome')
 * @param {object} context - Key-value pairs of variables to interpolate
 * @returns {Promise<string>} Compiled HTML content
 */
export const compileTemplate = async (templateName, context = {}) => {
  const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`);
  
  try {
    let templateContent = templateCache.get(templateName);

    // Read file if not in cache
    if (!templateContent) {
      templateContent = await fs.readFile(filePath, 'utf-8');
      templateCache.set(templateName, templateContent);
    }

    let compiledHtml = templateContent;

    // Replace all placeholders like {{key}} with values from context
    for (const [key, value] of Object.entries(context)) {
      const placeholderRegex = new RegExp(`{{${key}}}`, 'g');
      const replacementValue = value !== undefined && value !== null ? String(value) : '';
      compiledHtml = compiledHtml.replace(placeholderRegex, replacementValue);
    }

    // Replace any remaining placeholders that were not provided in context with empty strings
    compiledHtml = compiledHtml.replace(/{{[a-zA-Z0-9_]+}}/g, '');

    return compiledHtml;
  } catch (error) {
    console.error(`[Template Compiler Error] Failed to compile template ${templateName}:`, error.message);
    throw new Error(`Email template compilation failed: ${error.message}`);
  }
};

/**
 * Helper to clear cache (useful in development if editing templates live)
 */
export const clearTemplateCache = () => {
  templateCache.clear();
};
