let allTxns = [], filtered = [], currentPage = 1;

function fmt(d) { return d ? new Date(d).toLocaleString('en-IN') : '—'; }
function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN'); }
function badge(s) {
  const cls = s === 'Success' ? 'badge-success' : s === 'Pending' ? 'badge-pending' : 'badge-failed';
  return `<span class="${cls}">${s}</span>`;
}
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => { btn.textContent = '✓'; setTimeout(() => btn.textContent = '⧉', 1200); });
}

async function loadStats() {
  try {
    const stats = await AdminAPI.getStats();
    console.log('Stats loaded:', stats);
    
    if (!stats) {
      console.error('No stats returned from API');
      return;
    }
    
    document.getElementById('statCreators').textContent = (stats.creators || 0).toLocaleString('en-IN');
    document.getElementById('statUsers').textContent = (stats.totalUsers || 0).toLocaleString('en-IN');
    document.getElementById('statTxns').textContent = (stats.totalTxns || 0).toLocaleString('en-IN');
    document.getElementById('statProducts').textContent = (stats.totalProducts || 0).toLocaleString('en-IN');
    if (document.getElementById('statRevenue'))
      document.getElementById('statRevenue').textContent = '₹' + (stats.totalRevenue || 0).toLocaleString('en-IN', {maximumFractionDigits:2});
    if (document.getElementById('statCommission'))
      document.getElementById('statCommission').textContent = '₹' + (stats.platformCommission || 0).toLocaleString('en-IN', {maximumFractionDigits:2});
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadTransactions(days) {
  try {
    const data = await AdminAPI.getTransactions(days);
    console.log('Transactions loaded:', data);
    
    if (!data || data.length === 0) {
      allTxns = [];
      filtered = [];
      renderTable();
      return;
    }
    
    // Resolve creator names
    const names = await Promise.all(data.map(t => AdminAPI.getUserName(t.creator_id)));
    allTxns = data.map((t, i) => ({
      id: t.id,
    creator: names[i],
    product: t.product_id ? t.product_id.slice(0, 8) + '…' : '—',
    amount: fmtAmt(t.amount),
    status: t.status || 'Pending',
    date: fmt(t.created_at),
  }));
  filtered = [...allTxns];
  currentPage = 1;
  renderTable();
  } catch (error) {
    console.error('Error loading transactions:', error);
    allTxns = [];
    filtered = [];
    renderTable();
  }
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
        <td><div class="txn-id-cell"><button class="copy-btn" onclick="copyText('${r.id}',this)">⧉</button>${r.id}</div></td>
        <td>${r.creator}</td>
        <td>${r.product}</td>
        <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
        <td>${badge(r.status)}</td>
        <td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap">${r.date}</td>
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
  filtered = q ? allTxns.filter(r => r.id.includes(q) || r.creator.toLowerCase().includes(q) || r.product.toLowerCase().includes(q)) : [...allTxns];
  currentPage = 1; renderTable();
}

function applyDateFilter() {
  const days = document.getElementById('dateFilter').value;
  loadTransactions(days);
}

function toggleSidebar() { document.getElementById('adminSidebar').classList.toggle('collapsed'); }
function toggleTheme() { document.body.classList.toggle('light-theme'); }
function toggleUserMenu() { event.stopPropagation(); document.getElementById('userPopup').classList.toggle('open'); }
document.addEventListener('click', function(e) {
  if (e.target.closest('.user-popup-item')) return;
  const popup = document.getElementById('userPopup'), user = document.getElementById('sbUser');
  if (popup && !popup.contains(e.target) && !user.contains(e.target)) popup.classList.remove('open');
});

loadStats();
loadTransactions('all');
