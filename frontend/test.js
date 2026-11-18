import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running frontend verification tests (004-carrito-envios)...');

const appJsxPath = path.join(__dirname, 'src/App.jsx');
const mainJsxPath = path.join(__dirname, 'src/main.jsx');
const indexPath = path.join(__dirname, 'index.html');
const siteConfigPath = path.join(__dirname, 'src/config/site.js');
const indexCssPath = path.join(__dirname, 'src/index.css');

// 1. Archivos estructurales básicos
assert(fs.existsSync(appJsxPath), 'src/App.jsx must exist');
assert(fs.existsSync(mainJsxPath), 'src/main.jsx must exist');
assert(fs.existsSync(indexPath), 'index.html must exist');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');
assert(indexHtml.includes('<title>Lumina Lab</title>'), 'index.html must have title Lumina Lab');

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
assert.strictEqual(siteConfig.social?.instagram?.handle, '@luminalab_co', 'R2: instagram handle must be @luminalab_co');
assert.strictEqual(siteConfig.social?.instagram?.url, 'https://www.instagram.com/luminalab_co/', 'R2: instagram url must match');
assert.strictEqual(siteConfig.social?.whatsapp?.number, '+573001234567', 'R2: whatsapp number must be +573001234567');
assert(siteConfig.social?.whatsapp?.url?.includes('573001234567'), 'R2: whatsapp url must include number');

// 3. R3 (003): Componentes de Catálogo
const productCardPath = path.join(__dirname, 'src/components/ProductCard.jsx');
const productGridPath = path.join(__dirname, 'src/components/ProductGrid.jsx');
const productDetailModalPath = path.join(__dirname, 'src/components/ProductDetailModal.jsx');

assert(fs.existsSync(productCardPath), 'R3: src/components/ProductCard.jsx must exist');
assert(fs.existsSync(productGridPath), 'R3: src/components/ProductGrid.jsx must exist');
assert(fs.existsSync(productDetailModalPath), 'R3: src/components/ProductDetailModal.jsx must exist');

// 4. R3 (004): Carrito y Cotización de Envíos
const cartContextPath = path.join(__dirname, 'src/context/CartContext.jsx');
const cartDrawerPath = path.join(__dirname, 'src/components/CartDrawer.jsx');
const shippingCalculatorPath = path.join(__dirname, 'src/components/ShippingCalculator.jsx');

assert(fs.existsSync(cartContextPath), 'R3: src/context/CartContext.jsx must exist');
assert(fs.existsSync(cartDrawerPath), 'R3: src/components/CartDrawer.jsx must exist');
assert(fs.existsSync(shippingCalculatorPath), 'R3: src/components/ShippingCalculator.jsx must exist');

const cartContextContent = fs.readFileSync(cartContextPath, 'utf-8');
assert(cartContextContent.includes('useCart'), 'R3: CartContext must export useCart hook');
assert(cartContextContent.includes('addToCart'), 'R3: CartContext must provide addToCart');
assert(cartContextContent.includes('removeFromCart'), 'R3: CartContext must provide removeFromCart');
assert(cartContextContent.includes('updateQuantity'), 'R3: CartContext must provide updateQuantity');
assert(cartContextContent.includes('localStorage'), 'R3: CartContext must persist cart in localStorage');

const cartDrawerContent = fs.readFileSync(cartDrawerPath, 'utf-8');
assert(cartDrawerContent.includes('ShippingCalculator'), 'R3: CartDrawer must include ShippingCalculator');
assert(cartDrawerContent.includes('subtotal') || cartDrawerContent.includes('Subtotal'), 'R3: CartDrawer must display subtotal');
assert(cartDrawerContent.includes('total') || cartDrawerContent.includes('Total'), 'R3: CartDrawer must display total');
assert(cartDrawerContent.includes('whatsapp') || cartDrawerContent.includes('WhatsApp'), 'R3: CartDrawer must have WhatsApp order button');

const shippingCalcContent = fs.readFileSync(shippingCalculatorPath, 'utf-8');
assert(shippingCalcContent.includes('/api/shipping/quote/'), 'R3: ShippingCalculator must call /api/shipping/quote/');
assert(shippingCalcContent.includes('Medellín') || shippingCalcContent.includes('Medellin') || shippingCalcContent.includes('Bogotá') || shippingCalcContent.includes('Bogota'), 'R3: ShippingCalculator must list Colombian cities');

const appContent = fs.readFileSync(appJsxPath, 'utf-8');
assert(appContent.includes('CartProvider'), 'R3: App.jsx must wrap application in CartProvider');
assert(appContent.includes('CartDrawer'), 'R3: App.jsx must render CartDrawer');

// 5. R3 (005): Checkout, pasarela desacoplada y pedidos por WhatsApp
assert(siteConfig.payments, 'R3 (005): siteConfig must have payments section');
assert.strictEqual(siteConfig.payments.gatewayEnabled, false, 'R3 (005): gatewayEnabled must be false by default');
assert.strictEqual(siteConfig.payments.defaultMethod, 'whatsapp', 'R3 (005): defaultMethod must be whatsapp');

assert(cartContextContent.includes('clearCart'), 'R3 (005): CartContext must expose clearCart()');

const checkoutModalPath = path.join(__dirname, 'src/components/CheckoutModal.jsx');
assert(fs.existsSync(checkoutModalPath), 'R3 (005): CheckoutModal.jsx must exist');
const checkoutModalContent = fs.readFileSync(checkoutModalPath, 'utf-8');
assert(checkoutModalContent.includes('/api/checkout/'), 'R3 (005): CheckoutModal must submit to /api/checkout/');
assert(checkoutModalContent.includes('clearCart'), 'R3 (005): CheckoutModal must call clearCart on confirmed order');
assert(checkoutModalContent.includes('wa.me') || checkoutModalContent.includes('WhatsApp'), 'R3 (005): CheckoutModal must include WhatsApp order option');
assert(checkoutModalContent.includes('gatewayEnabled'), 'R3 (005): CheckoutModal must inspect gatewayEnabled setting');

assert(cartDrawerContent.includes('CheckoutModal') || cartDrawerContent.includes('checkout') || cartDrawerContent.includes('Checkout'), 'R3 (005): CartDrawer must trigger checkout process');

assert(appContent.includes('CheckoutModal'), 'R3 (005): App.jsx must mount CheckoutModal');

console.log('All frontend verification tests passed successfully!');
