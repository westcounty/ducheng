/**
 * generate-pdfs.js
 * 读城 — 道具模板 PDF 生成脚本
 *
 * 用法:
 *   cd props/
 *   npm install
 *   npm run generate
 *
 * 输出: output/{city}/ 目录下每个模板对应一个 PDF 文件
 */

import puppeteer from 'puppeteer';
import { readdir, mkdir } from 'fs/promises';
import { resolve, join, basename, extname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const TEMPLATES_DIR = resolve(__dirname, 'templates');
const OUTPUT_DIR = resolve(__dirname, 'output');

// ── PDF options (A4 with background graphics) ────────────────────
const PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '0mm',
    right: '0mm',
    bottom: '0mm',
    left: '0mm',
  },
};

// ── Wait options for page load ────────────────────────────────────
const WAIT_OPTIONS = {
  waitUntil: 'networkidle0',
  timeout: 60_000,
};

/**
 * Find all .html files in the templates directories.
 * Returns an array of { path, city } objects, sorted by city/filename.
 */
async function findTemplates() {
  const results = [];

  // Original Shanghai templates
  const mainEntries = await readdir(TEMPLATES_DIR).catch(() => []);
  for (const f of mainEntries) {
    if (extname(f).toLowerCase() === '.html') {
      results.push({ path: resolve(TEMPLATES_DIR, f), city: 'shanghai' });
    }
  }

  // City-specific templates
  for (const city of ['nanjing', 'hangzhou', 'xian']) {
    const cityDir = resolve(__dirname, city, 'templates');
    const entries = await readdir(cityDir).catch(() => []);
    for (const f of entries) {
      if (extname(f).toLowerCase() === '.html') {
        results.push({ path: resolve(cityDir, f), city });
      }
    }
  }

  return results.sort((a, b) =>
    `${a.city}/${basename(a.path)}`.localeCompare(`${b.city}/${basename(b.path)}`)
  );
}

/**
 * Generate a PDF from a single HTML template file.
 *
 * @param {import('puppeteer').Browser} browser - Puppeteer browser instance
 * @param {{ path: string, city: string }} template - Template descriptor
 * @param {string} outputDir - Base output directory
 */
async function generatePdf(browser, { path: htmlPath, city }, outputDir) {
  const name = basename(htmlPath, '.html');
  const cityOutputDir = join(outputDir, city);
  await mkdir(cityOutputDir, { recursive: true });
  const outputPath = join(cityOutputDir, `${name}.pdf`);
  const fileUrl = pathToFileURL(htmlPath).href;

  const page = await browser.newPage();

  try {
    console.log(`  → Loading: ${basename(htmlPath)}`);
    await page.goto(fileUrl, WAIT_OPTIONS);

    // Give Google Fonts a moment to load (even if offline, graceful fallback)
    await new Promise((r) => setTimeout(r, 500));

    console.log(`  → Generating PDF: ${basename(outputPath)}`);
    await page.pdf({
      path: outputPath,
      ...PDF_OPTIONS,
    });

    console.log(`  ✓ Saved: ${outputPath}`);
  } catch (err) {
    console.error(`  ✗ Failed [${basename(htmlPath)}]:`, err.message);
  } finally {
    await page.close();
  }
}

/**
 * Main entry point.
 */
async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   读城 — PDF 生成工具                  ║');
  console.log('║   DuCheng Props Generator             ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Discover templates
  const templates = await findTemplates();
  if (templates.length === 0) {
    console.error('No HTML templates found in:', TEMPLATES_DIR);
    process.exit(1);
  }

  console.log(`Found ${templates.length} template(s):`);
  templates.forEach(({ path: p, city }) => console.log(`  • [${city}] ${basename(p)}`));
  console.log('');

  // Launch browser once for all templates
  console.log('Launching browser…');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // Allow file:// access (needed to load shared-styles.css)
      '--allow-file-access-from-files',
      '--disable-web-security',
    ],
  });

  console.log('Browser ready.\n');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  for (const template of templates) {
    try {
      await generatePdf(browser, template, OUTPUT_DIR);
      successCount++;
    } catch (err) {
      console.error(`Unexpected error for ${basename(template.path)}:`, err);
      failCount++;
    }
    console.log('');
  }

  await browser.close();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('─────────────────────────────────────────');
  console.log(`Done in ${elapsed}s`);
  console.log(`  ✓ Success: ${successCount}`);
  if (failCount > 0) {
    console.log(`  ✗ Failed:  ${failCount}`);
  }
  console.log('');
  console.log(`PDFs saved to: ${OUTPUT_DIR}/{city}/`);
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
