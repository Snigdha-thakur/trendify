const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'frontend');

// For admin/ and creator/ and user/ pages, the CSS path needs to be ../css/loader.css
const subdirs = ['admin', 'creator', 'user'];

for (const sub of subdirs) {
  const dir = path.join(root, sub);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  for (const f of files) {
    const full = path.join(dir, f);
    let content = fs.readFileSync(full, 'utf8');
    if (content.includes('href="/css/loader.css"')) {
      content = content.replace('href="/css/loader.css"', 'href="../css/loader.css"');
      fs.writeFileSync(full, content, 'utf8');
      console.log('FIXED:', sub + '/' + f);
    }
  }
}
console.log('Done');
