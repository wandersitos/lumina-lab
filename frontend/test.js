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

// =============================================================================
// 6. R1-R3 (008-rediseno-ui): Minimalismo Cálido Nórdico & Elementos de Confianza
// =============================================================================
console.log('Verifying 008-rediseno-ui requirements (Warm Nordic Minimalism)...');

const indexCssContent = fs.readFileSync(indexCssPath, 'utf-8');
const productCardContent = fs.readFileSync(productCardPath, 'utf-8');
const productDetailContent = fs.readFileSync(productDetailModalPath, 'utf-8');

// R1: Navbar flotante con blur translúcido y paleta en index.css
assert(indexCssContent.includes('backdrop-filter') && indexCssContent.includes('blur'), 'R1 (008): index.css must contain backdrop-filter blur for floating glassmorphism navbar/drawers');
assert(indexCssContent.includes('--color-primary: #E07A5F') || indexCssContent.includes('#E07A5F'), 'R1 (008): index.css must define warm terracotta primary color');
assert(indexCssContent.includes('16px'), 'R1 (008): index.css must include 16px soft border-radius scale');

// R1: Hero editorial con badge artesanal y píldoras de valor en App.jsx
assert(appContent.includes('Taller de Diseño 3D en Colombia'), 'R1 (008): App.jsx must render hero badge "Taller de Diseño 3D en Colombia"');
assert(appContent.includes('Envío asegurado'), 'R1 (008): App.jsx must render "Envío asegurado" value pill');
assert(appContent.includes('Filamento ecológico PLA'), 'R1 (008): App.jsx must render "Filamento ecológico PLA" value pill');
assert(appContent.includes('Iluminación LED incluida'), 'R1 (008): App.jsx must render "Iluminación LED incluida" value pill');

// R1: Sección de confianza y proceso de fabricación en App.jsx
assert(appContent.includes('Del diseño 3D a tu espacio'), 'R1 (008): App.jsx must render process section "Del diseño 3D a tu espacio"');
assert(appContent.includes('Modelado Digital'), 'R1 (008): App.jsx process section must describe step 1 "Modelado Digital"');
assert(appContent.includes('Impresión 3D'), 'R1 (008): App.jsx process section must describe step 2 "Impresión 3D"');
assert(appContent.includes('Ensamblado y Prueba de Luz'), 'R1 (008): App.jsx process section must describe step 3 "Ensamblado y Prueba de Luz"');
assert(appContent.includes('Entrega Asegurada a tu Puerta') || appContent.includes('Entrega Asegurada'), 'R1 (008): App.jsx process section must describe step 4 "Entrega Asegurada"');

// R1: Footer con información de marca y redes oficiales
assert(appContent.includes('footer') || appContent.includes('Footer') || appContent.includes('site-footer'), 'R1 (008): App.jsx must include structured site footer');
assert(appContent.includes('@luminalab_co'), 'R1 (008): App.jsx footer must include official instagram handle @luminalab_co');

// R2: Badges y estética en tarjetas de producto (opción de colores eliminada por requerimiento)
assert(!productCardContent.includes('color-swatch-btn'), 'R2 (008): ProductCard.jsx must not render color swatches per user request');
assert(productCardContent.includes('Bajo demanda') || productCardContent.includes('Bajo Demanda'), 'R2 (008): ProductCard.jsx must display on-demand badge');
assert(productCardContent.includes('formatCOP') || productCardContent.includes('COP'), 'R2 (008): ProductCard.jsx must format prices in COP');

// R3: Carrito y Checkout con embudo de WhatsApp
assert(cartDrawerContent.includes('whatsapp') || cartDrawerContent.includes('WhatsApp'), 'R3 (008): CartDrawer must have WhatsApp button');
assert(checkoutModalContent.includes('WhatsApp') || checkoutModalContent.includes('wa.me'), 'R3 (008): CheckoutModal must provide WhatsApp order action');

// =============================================================================
// 7. R1-R4 (009-catalogo-astro-lumina): Catálogo Astro Lighting y Datos Lumina Lab
// =============================================================================
console.log('Verifying 009-catalogo-astro-lumina requirements (Astro Lighting & Lumina Catalog)...');

const luminaProductsPath = path.join(__dirname, 'src/data/luminaProducts.js');
const productFiltersPath = path.join(__dirname, 'src/components/ProductFilters.jsx');
const homePagePath = path.join(__dirname, 'src/pages/HomePage.jsx');
const productsPagePath = path.join(__dirname, 'src/pages/ProductsPage.jsx');
const productDetailPagePath = path.join(__dirname, 'src/pages/ProductDetailPage.jsx');

// R1: Navegación limpia y archivos de páginas
assert(fs.existsSync(homePagePath), 'R1 (009): src/pages/HomePage.jsx must exist');
assert(fs.existsSync(productsPagePath), 'R1 (009): src/pages/ProductsPage.jsx must exist');
assert(fs.existsSync(productDetailPagePath), 'R1 (009): src/pages/ProductDetailPage.jsx must exist');
assert(appContent.includes("onNavigate") || appContent.includes("handleNavigate"), 'R1 (009): App.jsx must support navigation between / and /products');
assert(appContent.includes('Inicio'), 'R1 (009): App.jsx navbar must render "Inicio" option');
assert(appContent.includes('Productos'), 'R1 (009): App.jsx navbar must render "Productos" option');
assert(!appContent.includes('href="#bespoke"'), 'R1 (009): App.jsx navbar must not include obsolete bespoke link');

// R2: Componente ProductFilters y vista ProductsPage estilo Astro Lighting
assert(fs.existsSync(productFiltersPath), 'R2 (009): src/components/ProductFilters.jsx must exist');
const productFiltersContent = fs.readFileSync(productFiltersPath, 'utf-8');
assert(productFiltersContent.includes('Colección') || productFiltersContent.includes('coleccion'), 'R2 (009): ProductFilters must filter by collection');
assert(productFiltersContent.includes('Categoría') || productFiltersContent.includes('categoria'), 'R2 (009): ProductFilters must filter by category');
assert(productFiltersContent.includes('Disponibilidad') || productFiltersContent.includes('En Stock'), 'R2 (009): ProductFilters must filter by availability');
assert(productFiltersContent.includes('Limpiar filtros') || productFiltersContent.includes('btn-clear-filters'), 'R2 (009): ProductFilters must provide clear filters button');

const productsPageContent = fs.readFileSync(productsPagePath, 'utf-8');
assert(productsPageContent.includes('ProductFilters'), 'R2 (009): ProductsPage must render ProductFilters');
assert(productsPageContent.includes('products-count') || productsPageContent.includes('Mostrando'), 'R2 (009): ProductsPage must show dynamic products count');
assert(productsPageContent.includes('sort') || productsPageContent.includes('Ordenar por'), 'R2 (009): ProductsPage must provide sorting');

// R3: Catálogo oficial Lumina Lab importado desde lumina-lab
assert(fs.existsSync(luminaProductsPath), 'R3 (009): src/data/luminaProducts.js must exist');
const { products: luminaProducts, collections: luminaColls } = await import('./src/data/luminaProducts.js');
assert(Array.isArray(luminaColls) && luminaColls.length >= 2, 'R3 (009): collections must contain Leora and Kumo');
assert(luminaColls.some(c => c.id === 'leora'), 'R3 (009): collections must include leora');
assert(luminaColls.some(c => c.id === 'kumo'), 'R3 (009): collections must include kumo');

assert(Array.isArray(luminaProducts) && luminaProducts.length >= 35, 'R3 (009): catalog must contain at least 35 official products');

// Validar lámparas emblemáticas de Leora
const o1Gravity = luminaProducts.find(p => p.slug === 'o1-gravity-sculpted-lamp');
assert(o1Gravity, 'R3 (009): O1 Gravity Sculpted Lamp must exist in catalog');
assert.strictEqual(o1Gravity.price, 150000, 'R3 (009): O1 Gravity price must be 150.000 COP');
assert.strictEqual(o1Gravity.category, 'Sculpted', 'R3 (009): O1 Gravity category must be Sculpted');
assert.strictEqual(o1Gravity.collection, 'leora', 'R3 (009): O1 Gravity collection must be leora');

const o11Ocean = luminaProducts.find(p => p.slug === 'o11-s-ocean-petals-sculpted-mini-lamp');
assert(o11Ocean, 'R3 (009): O11-S Ocean Petals Mini Lamp must exist');
assert.strictEqual(o11Ocean.price, 150000, 'R3 (009): O11-S price must be 150.000 COP');
assert.strictEqual(o11Ocean.category, 'Mini', 'R3 (009): O11-S category must be Mini');

const o12Fire = luminaProducts.find(p => p.slug === 'o12-s-fire-sculpted-mini-lamp');
assert(o12Fire, 'R3 (009): O12-S Fire Mini Lamp must exist');
assert.strictEqual(o12Fire.price, 125000, 'R3 (009): O12-S price must be 125.000 COP');

// Validar productos Kumo
const baseArch = luminaProducts.find(p => p.slug === 'base-arch');
assert(baseArch, 'R3 (009): Base Arch must exist in Kumo series');
assert.strictEqual(baseArch.price, 180000, 'R3 (009): Base Arch price must be 180.000 COP');

// R4: Integración con Bolsa y WhatsApp
assert(productCardContent.includes('addToCart'), 'R4 (009): ProductCard must connect to addToCart');
assert(productCardContent.includes('WhatsApp') || productCardContent.includes('wa.me'), 'R4 (009): ProductCard must provide direct WhatsApp purchase option');
assert(productsPageContent.includes('ProductCard'), 'R4 (009): ProductsPage must render ProductCard in catalog grid');

// =============================================================================
// 8. R1-R4 (010-catalogo-api-django): Catálogo y Filtros Servidos desde API Django
// =============================================================================
console.log('Verifying 010-catalogo-api-django requirements (API Django Catalog & Dynamic Filters)...');

const updatedProductsPageContent = fs.readFileSync(productsPagePath, 'utf-8');
const updatedProductFiltersContent = fs.readFileSync(productFiltersPath, 'utf-8');

// R1/R3: ProductsPage debe conectarse a /api/products/ mediante fetch y manejar loading/error/fallback
assert(updatedProductsPageContent.includes('/api/products/'), 'R3 (010): ProductsPage must fetch /api/products/');
assert(updatedProductsPageContent.includes('loading') || updatedProductsPageContent.includes('isLoading'), 'R3 (010): ProductsPage must handle loading state');
assert(updatedProductsPageContent.includes('officialProducts') || updatedProductsPageContent.includes('fallback') || updatedProductsPageContent.includes('luminaProducts'), 'R3 (010): ProductsPage must maintain fallback to luminaProducts for resilience');

// R4: ProductFilters debe atenuar o deshabilitar opciones cuando el conteo es 0 (count === 0)
assert(updatedProductFiltersContent.includes('count === 0') || updatedProductFiltersContent.includes('count <= 0'), 'R4 (010): ProductFilters must check if count === 0');
assert(updatedProductFiltersContent.includes('opacity-') || updatedProductFiltersContent.includes('disabled') || updatedProductFiltersContent.includes('pointer-events-none'), 'R4 (010): ProductFilters must dim or disable options when count === 0');

// =============================================================================
// 9. BUG 011 (011-productos-desincronizados-bd): Sincronización exacta con BD Django y Proxy
// =============================================================================
console.log('Verifying 011-productos-desincronizados-bd (Vite proxy and DB sync)...');

const viteConfigPath = path.join(__dirname, 'vite.config.js');
assert(fs.existsSync(viteConfigPath), 'vite.config.js must exist');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');

// R1: vite.config.js debe configurar proxy para /api hacia http://127.0.0.1:8000 (o localhost:8000)
assert(viteConfigContent.includes('proxy'), 'BUG 011: vite.config.js must configure proxy for /api');
assert(viteConfigContent.includes('/api'), 'BUG 011: vite.config.js proxy must include /api path');
assert(viteConfigContent.includes('8000'), 'BUG 011: vite.config.js proxy must target backend at port 8000');

// R2: ProductsPage.jsx debe resolver la URL del backend dinámicamente y no inicializar con hardcoded 35 productos
assert(!updatedProductsPageContent.includes('useState(officialProducts)'), 'BUG 011: ProductsPage must not initialize state with hardcoded officialProducts');
assert(updatedProductsPageContent.includes('getApiBaseUrl') || updatedProductsPageContent.includes('8000') || updatedProductsPageContent.includes('API_BASE') || updatedProductsPageContent.includes('VITE_API_URL'), 'BUG 011: ProductsPage must resolve API base url');

console.log('All frontend verification tests passed successfully!');
