let allData = [], filtered = [], currentPage = 1;

function fmt(d) { return d ? new Date(d).toLocaleString('en-IN') : '—'; }
function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN'); }
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => { btn.textContent = '✓'; setTimeout(() => btn.textContent = '⧉', 1200); });
}

async function loadData() {
  const data = await AdminAPI.getCreatorPayouts();
  const names = await Promise.all(data.map(r => AdminAPI.getUserName(r.creator_id)));
  allData = data.map((r, i) => ({
    name: names[i],
    email: r.buyer_email || '—',
    phone: '—',
    amount: fmtAmt(r.amount),
    date: fmt(r.created_at),
  }));
  filtered = [...allData];
  currentPage = 1;
  renderTable();
}

function renderTable() {
  const perPage = parseInt(document.getElementById('perPage').value);
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const slice = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  if (!slice.length) { tbody.innerHTML = ''; empty.style.display = 'block'; }
  else {
    empty.style.display = 'none';
    tbody.innerHTML = slice.map(r => `
      <tr>
        <td>${r.name}</td>
        <td><button class="copy-btn" onclick="copyText('${r.email}',this)">⧉</button>${r.email}</td>
        <td><button class="copy-btn" onclick="copyText('${r.phone}',this)">⧉</button>${r.phone}</td>
        <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.date}</td>
      </tr>`).join('');
  }
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pg = document.getElementById('pagination');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }
  let html = `<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages-1 && Math.abs(i-currentPage) > 1) { if (i===3||i===totalPages-2) html+=`<span class="pg-btn" style="cursor:default;opacity:.4">…</span>`; continue; }
    html += `<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>›</button>`;
  pg.innerHTML = html;
}

function goPage(n) {
  const perPage = parseInt(document.getElementById('perPage').value);
  const totalPages = Math.ceil(filtered.length / perPage);
  if (n < 1 || n > totalPages) return;
  currentPage = n; renderTable();
}

function filterTable() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  filtered = q ? allData.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) : [...allData];
  currentPage = 1; renderTable();
}

function toggleSidebar() {
  const sb = document.getElementById('adminSidebar');
  const ov = document.getElementById('sbOverlay');
  sb.classList.toggle('collapsed');
  if (ov) ov.classList.toggle('open', sb.classList.contains('collapsed') && window.innerWidth <= 768);
  try { localStorage.setItem('adminSidebarCollapsed', sb.classList.contains('collapsed')); } catch(e){}
}
function toggleTheme() { document.body.classList.toggle('light-theme'); }
function toggleUserMenu() { event.stopPropagation(); document.getElementById('userPopup').classList.toggle('open'); }
document.addEventListener('click', function(e) {
  if (e.target.closest('.user-popup-item')) return;
  const popup = document.getElementById('userPopup'), user = document.getElementById('sbUser');
  if (popup && !popup.contains(e.target) && !user.contains(e.target)) popup.classList.remove('open');
});

// Wrap .sb-link text nodes in <span class="sb-link-text"> for CSS targeting
function initSidebar() {
  const sb = document.getElementById('adminSidebar');
  if (!sb) return;
  sb.querySelectorAll('.sb-link').forEach(function(link) {
    Array.from(link.childNodes).forEach(function(node) {
      if (node.nodeType === 3 && node.textContent.trim()) {
        const span = document.createElement('span');
        span.className = 'sb-link-text';
        span.textContent = node.textContent.trim();
        link.replaceChild(span, node);
        // Set title for tooltip when collapsed
        if (!link.title) link.title = span.textContent;
      }
    });
  });
  // Restore collapsed state from localStorage
  try {
    if (localStorage.getItem('adminSidebarCollapsed') === 'true') sb.classList.add('collapsed');
  } catch(e){}
}
document.addEventListener('DOMContentLoaded', initSidebar);

loadData();
