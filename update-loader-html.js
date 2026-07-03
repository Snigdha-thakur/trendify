const fs = require('fs');
const path = require('path');

const OLD = `<div id="tfy-loader"><div class="tfy-ring"><svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle class="tfy-ring-track" cx="14" cy="14" r="12"/><circle class="tfy-ring-arc" cx="14" cy="14" r="12"/></svg></div><span class="tfy-label">Please wait...</span></div>`;

const NEW = `<div id="tfy-loader"><div class="tfy-ring"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><span class="tfy-label">Please wait...</span></div>`;

// Also handle the older SVG variant that may still exist
const OLD2 = `<div id="tfy-loader"><div class="tfy-ring"><svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tfy-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a67cff"/><stop offset="100%" stop-color="#00e5c8"/></linearGradient></defs><circle class="tfy-ring-track" cx="28" cy="28" r="22"/><circle class="tfy-ring-arc" cx="28" cy="28" r="22"/></svg><div class="tfy-dot"></div></div></div>`;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'dist' && e.name !== 'node_modules') {
      files = files.concat(walk(full));
    } else if (e.isFile() && e.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const root = path.join(__dirname, 'frontend');
const files = walk(root);
let done = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  if (content.includes(OLD)) {
    content = content.replace(OLD, NEW);
    changed = true;
  } else if (content.includes(OLD2)) {
    content = content.replace(OLD2, NEW);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('UPDATED:', path.relative(root, f));
    done++;
  }
}
console.log(`\nUpdated: ${done} files`);
