const fs = require('fs');
const path = require('path');

// The new loader script tag to inject (replaces old inline script)
const NEW_SCRIPT = `<script src="/js/tfy-loader-api.js"></script>`;
const NEW_SCRIPT_SUB = `<script src="../js/tfy-loader-api.js"></script>`;

// Old inline script pattern to replace
const OLD_SCRIPT = `<script>(function(){function h(){var l=document.getElementById('tfy-loader');if(l)l.classList.add('tfy-done');setTimeout(function(){var l2=document.getElementById('tfy-loader');if(l2&&l2.parentNode)l2.parentNode.removeChild(l2);},500);}if(document.readyState==='complete'){h();}else{window.addEventListener('load',h);}})();</script>`;

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
const subdirs = ['admin', 'creator', 'user'];
const files = walk(root);
let done = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes(OLD_SCRIPT)) { continue; }

  // Determine if this is a subdirectory page
  const rel = path.relative(root, f);
  const isSub = subdirs.some(s => rel.startsWith(s + path.sep));
  const scriptTag = isSub ? NEW_SCRIPT_SUB : NEW_SCRIPT;

  content = content.replace(OLD_SCRIPT, scriptTag);
  fs.writeFileSync(f, content, 'utf8');
  console.log('UPDATED:', rel);
  done++;
}
console.log(`\nUpdated: ${done} files`);
