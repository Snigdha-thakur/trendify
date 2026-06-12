const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');
const src = path.join(distDir, 'index.html');
const dest200 = path.join(distDir, '200.html');
const srcRedirects = path.join(publicDir, '_redirects');
const destRedirects = path.join(distDir, '_redirects');

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found:', distDir);
  process.exit(0);
}

if (!fs.existsSync(src)) {
  console.error('index.html not found in dist, skipping 200.html creation');
  process.exit(0);
}

// Copy index.html to 200.html for Render SPA fallback
fs.copyFileSync(src, dest200);
console.log('✓ Created 200.html for SPA fallback');

// Copy _redirects file for Vercel SPA routing
if (fs.existsSync(srcRedirects)) {
  fs.copyFileSync(srcRedirects, destRedirects);
  console.log('✓ Copied _redirects file for Vercel routing');
} else {
  console.warn('⚠ _redirects file not found in public folder');
}
