import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running frontend verification tests (003-catalogo-productos)...');

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

// R2 (002): Canales de contacto en site.js
assert.strictEqual(siteConfig.social?.instagram?.handle, '@luminalab.co', 'R2: instagram handle must be @luminalab.co');
assert.strictEqual(siteConfig.social?.instagram?.url, 'https://instagram.com/luminalab.co', 'R2: instagram url must match');
assert.strictEqual(siteConfig.social?.whatsapp?.number, '+573001234567', 'R2: whatsapp number must be +573001234567');
assert(siteConfig.social?.whatsapp?.url?.includes('573001234567'), 'R2: whatsapp url must include number');

// 3. R3 (003): Componentes de Catálogo
const productCardPath = path.join(__dirname, 'src/components/ProductCard.jsx');
const productGridPath = path.join(__dirname, 'src/components/ProductGrid.jsx');
const productDetailModalPath = path.join(__dirname, 'src/components/ProductDetailModal.jsx');

assert(fs.existsSync(productCardPath), 'R3: src/components/ProductCard.jsx must exist');
assert(fs.existsSync(productGridPath), 'R3: src/components/ProductGrid.jsx must exist');
assert(fs.existsSync(productDetailModalPath), 'R3: src/components/ProductDetailModal.jsx must exist');

// Verificaciones de contenido en componentes de catálogo
const cardContent = fs.readFileSync(productCardPath, 'utf-8');
assert(cardContent.includes('COP') || cardContent.includes('format') || cardContent.includes('Intl'), 'R3: ProductCard must format price in COP');
assert(cardContent.includes('color') || cardContent.includes('colors'), 'R3: ProductCard must handle filament color selection');

const gridContent = fs.readFileSync(productGridPath, 'utf-8');
assert(gridContent.includes('/api/products/'), 'R3: ProductGrid must fetch /api/products/');
assert(gridContent.includes('ProductCard'), 'R3: ProductGrid must render ProductCard');

const modalContent = fs.readFileSync(productDetailModalPath, 'utf-8');
assert(modalContent.includes('dimensions') || modalContent.includes('Medidas') || modalContent.includes('Dimensiones'), 'R3: ProductDetailModal must display dimensions');
assert(modalContent.includes('demanda') || modalContent.includes('días') || modalContent.includes('impresión') || modalContent.includes('fabricación'), 'R3: ProductDetailModal must display print-on-demand note');

// 4. Integración en App.jsx
const appContent = fs.readFileSync(appJsxPath, 'utf-8');
assert(appContent.includes('ProductGrid'), 'R3: App.jsx must include ProductGrid');

// CSS variables y responsive design en index.css
const cssContent = fs.readFileSync(indexCssPath, 'utf-8');
assert(cssContent.includes('.product-grid') || cssContent.includes('product-card'), 'R3: index.css must contain product grid/card styling');
assert(cssContent.includes('@media'), 'R3: index.css must include responsive styles (@media rules)');

console.log('All frontend verification tests passed successfully!');
