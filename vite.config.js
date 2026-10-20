import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // If a custom domain CNAME is configured in public/, serve from root '/'
  const hasCustomDomain = fs.existsSync(path.resolve(__dirname, 'public/CNAME'))
  const basePath =
    command === 'serve'
      ? '/'
      : (process.env.VITE_BASE_PATH || (hasCustomDomain ? '/' : '/Pastry_Paws/'))

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      host: true, // Exposes the server on local network (0.0.0.0) automatically
      port: 5174,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
