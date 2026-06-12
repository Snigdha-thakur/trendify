let allData = [], filtered = [], currentPage = 1;
const fmt = d => d ? new Date(d).toLocaleString('en-IN') : '—';
const copyText = (t, b) => navigator.clipboard.writeText(t).then(() => { b.textContent = '✓'; setTimeout(() => b.textContent = '⧉', 1200); });
const statusBadge = s => (s === 'Active' || s === 'active')
  ? '<span class="badge-kyc-approved" style="border-radius:4px">Active</span>'
  : '<span class="badge-under-review" style="border-radius:4px">Under Review</span>';

const SUPABASE_URL = 'https://hzukzpxelruvdmporrak.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWt6cHhlbHJ1dmRtcG9ycmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjA5MjgsImV4cCI6MjA5NTMzNjkyOH0.9EQ7E6LKZc1lceSuy1h-jEX0QVkFifeBVjHqyHEAF3M';
const getToken = () => { try { return JSON.parse(localStorage.getItem('trendify_session')).access_token; } catch { return ANON_KEY; } };

async function loadData() {
  const [products, users] = await Promise.all([AdminAPI.getProducts(), AdminAPI.getUsers()]);
  const uMap = {};
  users.forEach(u => { uMap[u.id] = u.email || '—'; });
  allData = products.map(r => ({
    id: r.id,
    name: r.name || '—',
    email: uMap[r.creator_id] || '—',
    priceType: r.price_type || '—',
    status: r.status || 'Under review',
    whitelabeled: !!r.whitelabeled,
    date: fmt(r.created_at),
  }));
  filtered = [...allData];
  renderTable();
}

async function toggleWhitelabel(id, val) {
  await fetch(SUPABASE_URL + '/rest/v1/digital_products?id=eq.' + id, {
    method: 'PATCH',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ whitelabeled: val }),
  });
}

function renderTable() {
  const perPage = parseInt(document.getElementById('perPage').value);
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * perPage;
  const slice = filtered.slice(start, start + perPage);
  if (!slice.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = slice.map(r => {
      return '<tr>'
        + '<td style="font-weight:700;color:var(--white)">' + r.name + '</td>'
        + '<td style="color:var(--smoke);font-size:13px">' + r.email + '</td>'
        + '<td style="color:var(--smoke);font-size:13px">' + r.priceType + '</td>'
        + '<td>' + statusBadge(r.status) + '</td>'
        + '<td><label class="dp-toggle"><input type="checkbox" ' + (r.whitelabeled ? 'checked' : '') + ' onchange="toggleWhitelabel(\'' + r.id + '\',this.checked)"/><span class="dp-toggle-slider"></span></label></td>'
        + '<td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap;color:var(--smoke)">' + r.date + '</td>'
        + '<td><button class="action-icon-btn" onclick="copyText(\'' + r.name + '\',this)" title="Copy">⧉</button></td>'
        + '</tr>';
    }).join('');
  }
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pg = document.getElementById('pagination');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }
  let h = '<button class="pg-btn" onclick="goPage(' + (currentPage - 1) + ')" ' + (currentPage === 1 ? 'disabled' : '') + '>‹</button>';
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
      if (i === 3 || i === totalPages - 2) h += '<span class="pg-btn" style="cursor:default;opacity:.4">…</span>';
      continue;
    }
    h += '<button class="pg-btn ' + (i === currentPage ? 'active' : '') + '" onclick="goPage(' + i + ')">' + i + '</button>';
  }
  h += '<button class="pg-btn" onclick="goPage(' + (currentPage + 1) + ')" ' + (currentPage === totalPages ? 'disabled' : '') + '>›</button>';
  pg.innerHTML = h;
}

function goPage(n) {
  const perPage = parseInt(document.getElementById('perPage').value);
  const totalPages = Math.ceil(filtered.length / perPage);
  if (n < 1 || n > totalPages) return;
  currentPage = n;
  renderTable();
}

function filterTable() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const s = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';
  filtered = allData.filter(r =>
    (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) &&
    (!s || r.status === s)
  );
  currentPage = 1;
  renderTable();
}

function toggleSidebar() { document.getElementById('adminSidebar').classList.toggle('collapsed'); }
function toggleTheme() { document.body.classList.toggle('light-theme'); }
function toggleUserMenu() { event.stopPropagation(); document.getElementById('userPopup').classList.toggle('open'); }
document.addEventListener('click', function(e) {
  if (e.target.closest('.user-popup-item')) return;
  const p = document.getElementById('userPopup'), u = document.getElementById('sbUser');
  if (p && !p.contains(e.target) && !u.contains(e.target)) p.classList.remove('open');
});

loadData();

window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.toggleUserMenu = toggleUserMenu;
window.filterTable = filterTable;
window.renderTable = renderTable;
window.goPage = goPage;
window.copyText = copyText;
window.toggleWhitelabel = toggleWhitelabel;