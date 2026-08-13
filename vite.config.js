import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/inu-kitchen-fever/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'Inu Kitchen Fever',
        short_name: 'Kitchen Fever',
        description: 'El menú real de Inu Sushi convertido en juego: onigiri, bento, banderillas, rollos y Mushipan.',
        start_url: '/inu-kitchen-fever/index.html',
        scope: '/inu-kitchen-fever/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1b1520',
        theme_color: '#1b1520',
        categories: ['games', 'food'],
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
      },
    }),
  ],
});
