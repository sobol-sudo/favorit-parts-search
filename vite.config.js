import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API отдаётся только по HTTP, поэтому в браузер ходим через прокси:
// локально — dev-сервер Vite, на проде — rewrite в vercel.json.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/hsprice': {
        target: 'http://api.favorit-parts.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hsprice/, '/hs/hsprice/'),
      },
    },
  },
})
