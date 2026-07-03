const fs = require('fs');
const path = require('path');

const LOADER_HTML = `<link rel="stylesheet" href="/css/loader.css"/>
<div id="tfy-loader"><div class="tfy-ring"><svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tfy-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a67cff"/><stop offset="100%" stop-color="#00e5c8"/></linearGradient></defs><circle class="tfy-ring-track" cx="28" cy="28" r="22"/><circle class="tfy-ring-arc" cx="28" cy="28" r="22"/></svg><div class="tfy-dot"></div></div></div>
<script>(function(){function h(){var l=document.getElementById('tfy-loader');if(l)l.classList.add('tfy-done');setTimeout(function(){var l2=document.getElementById('tfy-loader');if(l2&&l2.parentNode)l2.parentNode.removeChild(l2);},500);}if(document.readyState==='complete'){h();}else{window.addEventListener('load',h);}})();</script>`;

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
let done = 0, skipped = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('tfy-loader')) { skipped++; continue; }
  if (!content.includes('<body')) { skipped++; continue; }
  content = content.replace(/(<body[^>]*>)/, '$1\n' + LOADER_HTML);
  fs.writeFileSync(f, content, 'utf8');
  console.log('DONE:', path.relative(root, f));
  done++;
}
console.log(`\nInjected: ${done}, Skipped: ${skipped}`);
