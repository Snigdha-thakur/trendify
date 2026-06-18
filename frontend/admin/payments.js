let allPayments = [], filtered = [], currentPage = 1;

function fmt(d) { return d ? new Date(d).toLocaleString('en-IN') : '—'; }
function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN'); }
function badge(s) {
  const cls = s === 'Success' ? 'badge-success' : s === 'Pending' ? 'badge-pending' : 'badge-failed';
  return `<span class="${cls}">${s}</span>`;
}
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => { btn.textContent = '✓'; setTimeout(() => btn.textContent = '⧉', 1200); });
}
async function refreshStatus(id, btn) {
  btn.style.animation = 'spin .6s linear infinite';
  try {
    const result = await AdminAPI.verifyTransaction(id);
    if (result && result.status === 'success') {
      await loadPayments();
    } else {
      btn.style.animation = '';
    }
  } catch(e) {
    btn.style.animation = '';
  }
}

async function loadPayments() {
  const data = await AdminAPI.getPayments();
  allPayments = data.map(t => ({
    id: t.id,
    product: t.product_id || '—',
    email: t.buyer_email || '—',
    status: t.status || 'Pending',
    gateway: t.gateway || 'Cashfree',
    amount: fmtAmt(t.amount),
    date: fmt(t.created_at),
  }));
  filtered = [...allPayments];
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
        <td>${r.product}</td>
        <td><div style="display:flex;align-items:center;gap:6px"><button class="copy-btn" onclick="copyText('${r.email}',this)">⧉</button>${r.email}</div></td>
        <td>${badge(r.status)}${r.status==='Pending'?`<button class="copy-btn refresh-btn" onclick="refreshStatus('${r.id}',this)" style="margin-left:4px">↻</button>`:''}</td>
        <td style="color:var(--smoke);font-size:13px">${r.gateway}</td>
        <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
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
  filtered = q ? allPayments.filter(r => r.id.includes(q) || r.product.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) : [...allPayments];
  currentPage = 1; renderTable();
}

const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);

AdminAPI.init().then(() => {
  loadPayments();
  setInterval(loadPayments, 10000);
});

window.filterTable = filterTable;
window.renderTable = renderTable;
window.goPage = goPage;
window.copyText = copyText;
window.refreshStatus = refreshStatus;
