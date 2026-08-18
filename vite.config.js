import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/inu-kitchen-fever/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // Exploración de personajes 3D con Three.js — no está enlazada desde
        // el juego todavía, es solo para que Dany la vea sin correr nada local.
        threeDemo: fileURLToPath(new URL('./three-demo.html', import.meta.url)),
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
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
        // Incluye las fotos: sin ellas el juego offline mostraría platillos rotos.
        globPatterns: ['**/*.{js,css,html,svg,webp,png}'],
        // La demo de Three.js no es parte del juego para los jugadores —
        // que nadie se la descargue sin querer al instalar la PWA.
        globIgnores: ['three-demo.html', '**/threeDemo-*.js'],
        // Sin esto, el service worker trata three-demo.html como una ruta
        // desconocida de la SPA y le sirve index.html en su lugar — por
        // eso Dany veía el juego normal en vez de la demo 3D. Workbox
        // compara contra pathname+search, así que el "(\?.*)?" es necesario:
        // sin él, cualquier query string (?v=2, ?utm_source=..., etc.) deja
        // de matchear el "$" y la URL vuelve a caer al fallback de index.html.
        navigateFallbackDenylist: [/^\/inu-kitchen-fever\/three-demo\.html(\?.*)?$/],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Quien ya abrió el juego antes tiene un service worker viejo que le
        // serviría una versión pasada indefinidamente. Con esto el nuevo toma
        // el control en cuanto se instala y tira los cachés anteriores, sin
        // que nadie tenga que borrar datos del sitio a mano.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
