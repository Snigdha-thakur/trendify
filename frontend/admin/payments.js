let allPayments = [], filtered = [], currentPage = 1;
let _rawPayments = [];

function fmt(d) { return d ? new Date(d).toLocaleString('en-IN', {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '—'; }
function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2}); }
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
  _rawPayments = data;
  allPayments = data.map(t => ({
    id: t.id,
    product: t.product_name || t.product_id || '—',
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
        <td style="cursor:pointer" onclick="showDetails('${r.id}')">${badge(r.status)}${r.status==='Pending'?`<button class="copy-btn refresh-btn" onclick="event.stopPropagation();refreshStatus('${r.id}',this)" style="margin-left:4px">↻</button>`:''}</td>
        <td style="color:var(--smoke);font-size:13px">${r.gateway}</td>
        <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
        <td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap">${r.date}</td>
      </tr>`).join('');
  }
  renderPagination(totalPages);
}

function showDetails(txnId) {
  const raw = _rawPayments.find(t => t.id === txnId);
  if (!raw) return;

  const commissionPct = raw.commission_amount && raw.amount
    ? Math.round((raw.commission_amount / raw.amount) * 100)
    : 0;

  // Build custom form fields rows
  let formFieldsHtml = '';

  document.getElementById('pdContent').innerHTML = `
    <div class="pd-section-title">Creator Details</div>
    <div class="pd-row"><span class="pd-label">Name</span><span class="pd-val">${raw.creator_name || '—'}</span></div>
    <div class="pd-row"><span class="pd-label">Email</span><span class="pd-val">${raw.creator_email || '—'}</span></div>
    <div class="pd-row"><span class="pd-label">Phone Number</span><span class="pd-val">${raw.creator_phone || '—'}</span></div>

    <div class="pd-divider"></div>
    <div class="pd-section-title">Customer Details</div>
    <div class="pd-row"><span class="pd-label">Name</span><span class="pd-val">${raw.buyer_name || '—'}</span></div>
    <div class="pd-row"><span class="pd-label">Email</span><span class="pd-val">${raw.buyer_email || '—'}</span></div>
    <div class="pd-row"><span class="pd-label">Phone Number</span><span class="pd-val">${raw.buyer_phone || '—'}</span></div>

    ${formFieldsHtml}

    <div class="pd-divider"></div>
    <div class="pd-section-title">Payment Details</div>
    <div class="pd-row"><span class="pd-label">Transaction Status</span><span class="pd-val">${badge(raw.status)}</span></div>
    <div class="pd-row"><span class="pd-label">Transaction ID</span><span class="pd-val pd-mono">${raw.id}</span></div>
    <div class="pd-row"><span class="pd-label">Cashfree Order ID</span><span class="pd-val pd-mono">${raw.cashfree_order_id || '—'}</span></div>
    <div class="pd-row"><span class="pd-label">Gateway</span><span class="pd-val">${raw.gateway || 'Cashfree'}</span></div>
    <div class="pd-row"><span class="pd-label">Amount Paid</span><span class="pd-val">${fmtAmt(raw.amount)}</span></div>
    <div class="pd-row"><span class="pd-label">Payout Amount</span><span class="pd-val">${fmtAmt(raw.creator_amount ?? raw.amount)}</span></div>
    <div class="pd-row"><span class="pd-label">Platform Fee (in %)</span><span class="pd-val">${commissionPct}%</span></div>
    <div class="pd-row"><span class="pd-label">Platform Fee</span><span class="pd-val">${fmtAmt(raw.commission_amount ?? 0)}</span></div>
    <div class="pd-row"><span class="pd-label">Transaction ID</span><span class="pd-val pd-mono">${raw.id}</span></div>
    <div class="pd-row"><span class="pd-label">Date</span><span class="pd-val">${fmt(raw.created_at)}</span></div>
  `;
  document.getElementById('pdOverlay').classList.add('open');
}

function closePd() {
  document.getElementById('pdOverlay').classList.remove('open');
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
style.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
.pd-overlay { display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);z-index:999;align-items:center;justify-content:center; }
.pd-overlay.open { display:flex; }
.pd-modal { background:var(--panel);border:1px solid rgba(167,124,255,.2);border-radius:12px;width:90%;max-width:520px;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.5); }
.pd-modal-head { display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(167,124,255,.1); }
.pd-modal-title { font-family:var(--f-sans);font-size:15px;font-weight:700;color:var(--white); }
.pd-close { background:none;border:none;color:var(--smoke);font-size:20px;cursor:pointer;padding:2px 6px;border-radius:4px;line-height:1;transition:color .15s; }
.pd-close:hover { color:var(--white); }
.pd-body { overflow-y:auto;padding:20px 24px;flex:1; }
.pd-body::-webkit-scrollbar{width:4px}.pd-body::-webkit-scrollbar-thumb{background:rgba(167,124,255,.25);border-radius:99px}
.pd-section-title { font-family:var(--f-sans);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--violet);margin:0 0 10px; }
.pd-row { display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:7px 0;border-bottom:1px solid rgba(167,124,255,.06); }
.pd-row:last-of-type { border-bottom:none; }
.pd-label { font-family:var(--f-sans);font-size:12px;color:var(--smoke);flex-shrink:0; }
.pd-val { font-family:var(--f-sans);font-size:12px;color:var(--white);text-align:right;word-break:break-all; }
.pd-mono { font-family:var(--f-mono);font-size:11px; }
.pd-divider { height:1px;background:rgba(167,124,255,.1);margin:14px 0; }
`;
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
window.showDetails = showDetails;
window.closePd = closePd;
