/**
 * Configuración e identidad de marca para Lumina Lab.
 * Centraliza nombres, lemas, paleta de colores y enlaces sociales oficiales.
 */
export const siteConfig = {
  name: 'Lumina Lab',
  tagline: 'Estudio de Iluminación contemporánea de formas escultóricas',
  description: 'Lumina Lab — Estudio de Iluminación. Lámparas de diseño contemporáneo y formas escultóricas con iluminación inalámbrica recargable.',
  colors: {
    primary: '#E07A5F',     // Terracota / luz cálida
    secondary: '#3D405B',   // Azul noche elegante
    accent: '#81B29A',      // Verde salvia / balance natural
    background: '#FAF9F6',  // Fondo cálido off-white
    surface: '#FFFFFF',     // Superficie de tarjetas
    text: '#2B2D42',        // Texto principal de alta legibilidad
    muted: '#6B7280',       // Texto secundario / sutil
  },
  social: {
    instagram: {
      handle: '@luminalab_co',
      url: 'https://www.instagram.com/luminalab_co/',
    },
    whatsapp: {
      number: '+573001234567',
      url: 'https://wa.me/573001234567?text=Hola%20Lumina%20Lab',
    },
  },
  payments: {
    gatewayEnabled: false,
    defaultMethod: 'whatsapp',
  },
  heroImageUrl: 'https://res.cloudinary.com/dja3bhm9j/image/upload/v1795490346/Leora-Floral-May-2025_4_ue6skw.jpg',
};

/**
 * Actualiza la configuración del sitio a partir del endpoint dinámico /api/content/
 */
export function updateSiteConfigFromContent(content) {
  if (!content || typeof content !== 'object') return;
  if (content.whatsapp_number) {
    siteConfig.social.whatsapp.number = content.whatsapp_number;
    const cleanNumber = content.whatsapp_number.replace(/[^0-9]/g, '');
    siteConfig.social.whatsapp.url = `https://wa.me/${cleanNumber}?text=Hola%20Lumina%20Lab`;
  }
  if (content.instagram_handle) {
    siteConfig.social.instagram.handle = content.instagram_handle;
  }
  if (content.instagram_url) {
    siteConfig.social.instagram.url = content.instagram_url;
  } else if (content.instagram_handle) {
    const cleanHandle = content.instagram_handle.replace(/^@+/, '').trim();
    if (cleanHandle) {
      siteConfig.social.instagram.url = `https://www.instagram.com/${cleanHandle}/`;
    }
  }
  if (content.hero_image_url) {
    siteConfig.heroImageUrl = content.hero_image_url;
  }
}

export default siteConfig;
