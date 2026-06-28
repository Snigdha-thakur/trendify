let allTxns = [], filtered = [], currentPage = 1;
let allTxnsRaw = [];

function fmt(d) { return d ? new Date(d).toLocaleString('en-IN') : '—'; }
function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN'); }
function badge(s) {
  const cls = s === 'Success' ? 'badge-success' : s === 'Pending' ? 'badge-pending' : 'badge-failed';
  return `<span class="${cls}">${s}</span>`;
}
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => { btn.textContent = '✓'; setTimeout(() => btn.textContent = '⧉', 1200); });
}

async function loadStats(days = 'all') {
  try {
    const stats = await AdminAPI.getStats(days);
    if (!stats) return;
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

function getCutoff(days) {
  if (!days || days === 'all') return null;
  if (days === 'today') { const d = new Date(); d.setHours(0,0,0,0); return d; }
  const parsed = parseInt(days);
  if (!isNaN(parsed)) return new Date(Date.now() - parsed * 86400000);
  return null;
}

async function loadTransactions() {
  try {
    const [data, products] = await Promise.all([AdminAPI.getTransactions('all'), AdminAPI.getProducts()]);
    const productMap = {};
    (products || []).forEach(p => { productMap[p.id] = p.name || p.title || p.id; });

    if (!data || data.length === 0) { allTxnsRaw = []; applyTxnFilter(); return; }

    const userIds = [...new Set(data.map(t => t.creator_id).filter(Boolean))];
    const names = await Promise.all(userIds.map(id => AdminAPI.getUserName(id)));
    const nameMap = {};
    userIds.forEach((id, i) => { nameMap[id] = names[i]; });

    allTxnsRaw = data.map(t => ({
      id: t.id,
      creator: nameMap[t.creator_id] || '—',
      product: t.product_id ? (productMap[t.product_id] || t.product_id.slice(0, 8) + '…') : '—',
      amount: fmtAmt(t.amount),
      status: t.status || 'Pending',
      date: fmt(t.created_at),
      created_at: t.created_at,
    }));
    applyTxnFilter();
  } catch (error) {
    console.error('Error loading transactions:', error);
    allTxnsRaw = []; applyTxnFilter();
  }
}

function applyTxnFilter() {
  const days = document.getElementById('dateFilter').value;
  const cutoff = getCutoff(days);
  allTxns = cutoff
    ? allTxnsRaw.filter(t => t.created_at && new Date(t.created_at) >= cutoff)
    : [...allTxnsRaw];
  filtered = [...allTxns];
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
  document.querySelector('.admin-page-body').scrollTop = 0;
}

function filterTable() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  filtered = q ? allTxns.filter(r => r.id.includes(q) || r.creator.toLowerCase().includes(q) || r.product.toLowerCase().includes(q)) : [...allTxns];
  currentPage = 1; renderTable();
}

function applyDateFilter() {
  const days = document.getElementById('dateFilter').value;
  loadStats(days);
  applyTxnFilter();
}

loadStats('all');
loadTransactions();

window.filterTable = filterTable;
window.renderTable = renderTable;
window.goPage = goPage;
window.applyDateFilter = applyDateFilter;
window.copyText = copyText;
