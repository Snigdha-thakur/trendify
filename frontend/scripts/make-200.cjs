const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const src = path.join(distDir, 'index.html');
const dest = path.join(distDir, '200.html');

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found:', distDir);
  process.exit(0);
}

if (!fs.existsSync(src)) {
  console.error('index.html not found in dist, skipping 200.html creation');
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log('Created 200.html for SPA fallback');
