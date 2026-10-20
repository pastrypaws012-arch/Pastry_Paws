import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  // 1. Create 404.html in dist (Render & GitHub Pages automatically serve 404.html as SPA fallback)
  fs.writeFileSync(path.join(distDir, '404.html'), indexHtml);

  // 2. Pre-generate sub-route index.html entry points so Render Static Sites return 200 OK directly on reload
  const routes = ['menu', 'order', 'track-order', 'order-status', 'admin'];
  for (const route of routes) {
    const routeDir = path.join(distDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);
  }

  // 3. Prevent Jekyll from processing files on GitHub Pages
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

  console.log('✅ Postbuild: Successfully generated 404.html, route entry points, and .nojekyll for SPA hosting!');
} else {
  console.warn('⚠️ Postbuild warning: dist/index.html not found.');
}
