const fs = require('fs');
const path = require('path');

const INLINE_SCRIPT = `<script>(function(){var _p=0,_h=null,_s=null,_f=window.fetch;function _show(){clearTimeout(_h);var l=document.getElementById('tfy-loader');if(l){l.classList.remove('tfy-done');clearTimeout(_s);_s=setTimeout(function(){var lb=l.querySelector('.tfy-label');if(lb)lb.textContent='Server waking up, please wait...';},5000);}}function _hide(){clearTimeout(_s);_h=setTimeout(function(){if(_p<=0){var l=document.getElementById('tfy-loader');if(l){var lb=l.querySelector('.tfy-label');if(lb)lb.textContent='Please wait...';l.classList.add('tfy-done');}setTimeout(function(){var l2=document.getElementById('tfy-loader');if(l2&&l2.parentNode)l2.parentNode.removeChild(l2);},450);}},120);}window.fetch=function(){_p++;_show();return _f.apply(this,arguments).finally(function(){_p=Math.max(0,_p-1);if(_p===0)_hide();});};window.addEventListener('load',function(){if(_p===0)_hide();});var _api=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'http://localhost:8000':'https://trendify-pxkx.onrender.com';function _ping(){_f(_api+'/health',{method:'GET',cache:'no-store'}).catch(function(){});}setTimeout(_ping,500);setInterval(_ping,840000);})();</script>`;

const OLD_EXTERNAL_ROOT = `<script src="/js/tfy-loader-api.js"></script>`;
const OLD_EXTERNAL_SUB  = `<script src="../js/tfy-loader-api.js"></script>`;

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
  if (content.includes(OLD_EXTERNAL_ROOT)) {
    content = content.replace(OLD_EXTERNAL_ROOT, INLINE_SCRIPT);
    changed = true;
  } else if (content.includes(OLD_EXTERNAL_SUB)) {
    content = content.replace(OLD_EXTERNAL_SUB, INLINE_SCRIPT);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('UPDATED:', path.relative(root, f));
    done++;
  }
}
console.log(`\nUpdated: ${done} files`);
