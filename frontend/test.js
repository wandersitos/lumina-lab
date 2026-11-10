import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running frontend verification tests (002-theming-marcas)...');

const appJsxPath = path.join(__dirname, 'src/App.jsx');
const mainJsxPath = path.join(__dirname, 'src/main.jsx');
const indexPath = path.join(__dirname, 'index.html');
const siteConfigPath = path.join(__dirname, 'src/config/site.js');
const indexCssPath = path.join(__dirname, 'src/index.css');

// 1. Archivos estructurales básicos
assert(fs.existsSync(appJsxPath), 'src/App.jsx must exist');
assert(fs.existsSync(mainJsxPath), 'src/main.jsx must exist');
assert(fs.existsSync(indexPath), 'index.html must exist');

// 2. R1: Tokens de diseño e identidad en site.js
assert(fs.existsSync(siteConfigPath), 'R1: src/config/site.js must exist');
const { siteConfig } = await import('./src/config/site.js');
assert(siteConfig, 'R1: siteConfig must be exported');
assert.strictEqual(siteConfig.name, 'Lumina Lab', 'R1: site name must be Lumina Lab');
assert(siteConfig.tagline?.includes('Lámparas de diseño y piezas 3D'), 'R1: tagline must match Lumina Lab');
assert.strictEqual(siteConfig.colors?.primary?.toUpperCase(), '#E07A5F', 'R1: primary color token must be #E07A5F');
assert.strictEqual(siteConfig.colors?.secondary?.toUpperCase(), '#3D405B', 'R1: secondary color token must be #3D405B');
assert.strictEqual(siteConfig.colors?.background?.toUpperCase(), '#FAF9F6', 'R1: background color token must be #FAF9F6');
assert.strictEqual(siteConfig.colors?.text?.toUpperCase(), '#2B2D42', 'R1: text color token must be #2B2D42');

// R2: Canales de contacto en site.js
assert.strictEqual(siteConfig.social?.instagram?.handle, '@luminalab.co', 'R2: instagram handle must be @luminalab.co');
assert.strictEqual(siteConfig.social?.instagram?.url, 'https://instagram.com/luminalab.co', 'R2: instagram url must match');
assert.strictEqual(siteConfig.social?.whatsapp?.number, '+573001234567', 'R2: whatsapp number must be +573001234567');
assert(siteConfig.social?.whatsapp?.url?.includes('573001234567'), 'R2: whatsapp url must include number');

// 3. R1 / R3: CSS variables y responsive design en index.css
const cssContent = fs.readFileSync(indexCssPath, 'utf-8');
assert(cssContent.includes('--color-primary: #E07A5F') || cssContent.includes('--color-primary:#E07A5F') || cssContent.toUpperCase().includes('#E07A5F'), 'R1: index.css must define primary color variable #E07A5F');
assert(cssContent.includes('--color-secondary') || cssContent.toUpperCase().includes('#3D405B'), 'R1: index.css must define secondary color variable');
assert(cssContent.includes('--color-background') || cssContent.toUpperCase().includes('#FAF9F6'), 'R1: index.css must define background color variable');
assert(cssContent.includes('@media'), 'R3: index.css must include responsive styles (@media rules)');

// 4. R2: Navbar, Hero y preservación de health check en App.jsx
const appContent = fs.readFileSync(appJsxPath, 'utf-8');
assert(appContent.includes('siteConfig') || appContent.includes('Lumina Lab'), 'R2: App.jsx must render Lumina Lab brand');
assert(appContent.includes('instagram') || appContent.includes('Instagram'), 'R2: App.jsx must include Instagram link/button');
assert(appContent.includes('whatsapp') || appContent.includes('WhatsApp'), 'R2: App.jsx must include WhatsApp link/button');
assert(appContent.includes('/api/health/'), 'No regresión: App.jsx must connect to /api/health/');
assert(appContent.includes('status-badge') || appContent.includes('healthStatus'), 'No regresión: App.jsx must display health status');

console.log('All frontend verification tests passed successfully!');
