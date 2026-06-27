let allPayouts = [], filtered = [], currentPage = 1;

function fmt(d) { return d ? new Date(d).toLocaleString('en-IN') : '—'; }
function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN'); }
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => { btn.textContent = '✓'; setTimeout(() => btn.textContent = '⧉', 1200); });
}

function statusBadge(s) {
  if (s === 'Paid') return `<span class="badge-paid">✓ Paid</span>`;
  if (s === 'Rejected') return `<span class="badge-failed">✗ Rejected</span>`;
  return `<span class="badge-pending">⊙ Pending</span>`;
}

function actionBtns(r) {
  if (r.status === 'Paid') return `<span style="color:var(--smoke);font-size:12px;">—</span>`;
  if (r.status === 'Rejected') return `<span style="color:var(--smoke);font-size:12px;">—</span>`;
  return `
    <button class="action-icon-btn" style="color:var(--green);font-size:11px;padding:4px 10px;" onclick="updatePayout('${r.rawId}','Paid')">Pay Now</button>
    <button class="action-icon-btn" style="color:var(--ember);font-size:11px;padding:4px 10px;margin-left:4px;" onclick="updatePayout('${r.rawId}','Rejected')">Reject</button>
  `;
}

async function updatePayout(id, status) {
  try {
    await AdminAPI.updatePayoutStatus(id, status);
    const item = allPayouts.find(p => p.rawId === id);
    if (item) item.status = status;
    filterTable();
  } catch(e) { alert('Failed to update payout: ' + e.message); }
}

async function loadData() {
  const [payouts, users] = await Promise.all([AdminAPI.getPayouts(), AdminAPI.getUsers()]);
  const userMap = {};
  users.forEach(u => { userMap[u.id] = { name: u.name || '—', email: u.email || '—', phone: u.phone || '—' }; });
  allPayouts = payouts.map(p => ({
    rawId: p.id,
    id: p.id,
    name: (userMap[p.user_id] || {}).name || '—',
    email: (userMap[p.user_id] || {}).email || '—',
    phone: (userMap[p.user_id] || {}).phone || '—',
    amount: fmtAmt(p.amount),
    status: p.status || 'Pending',
    date: fmt(p.created_at),
  }));
  filtered = [...allPayouts];
  renderTable();
}

function renderTable() {
  const perPage = parseInt(document.getElementById('perPage').value);
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const slice = filtered.slice((currentPage-1)*perPage, currentPage*perPage);
  if (!slice.length) { tbody.innerHTML = ''; empty.style.display = 'block'; }
  else {
    empty.style.display = 'none';
    tbody.innerHTML = slice.map(r => `
      <tr>
        <td><div class="txn-id-cell"><button class="copy-btn" onclick="copyText('${r.id}',this)">⧉</button>${r.id.slice(0,22)}…</div></td>
        <td style="font-weight:700;color:var(--white)">${r.name}</td>
        <td style="color:var(--violet)">${r.email}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.phone}</td>
        <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
        <td>${statusBadge(r.status)}</td>
        <td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap">${r.date}</td>
        <td>${actionBtns(r)}</td>
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
  filtered = q ? allPayouts.filter(r => r.id.includes(q) || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) : [...allPayouts];
  currentPage = 1; renderTable();
}

function toggleSidebar() {
  const sb = document.getElementById('adminSidebar');
  const ov = document.getElementById('sbOverlay');
  sb.classList.toggle('collapsed');
  if (ov) ov.classList.toggle('open', sb.classList.contains('collapsed') && window.innerWidth <= 768);
}
function toggleTheme() { document.body.classList.toggle('light-theme'); }
function toggleUserMenu() { event.stopPropagation(); document.getElementById('userPopup').classList.toggle('open'); }
document.addEventListener('click', function(e) {
  if (e.target.closest('.user-popup-item')) return;
  const popup = document.getElementById('userPopup'), user = document.getElementById('sbUser');
  if (popup && !popup.contains(e.target) && !user.contains(e.target)) popup.classList.remove('open');
});

AdminAPI.init().then(() => loadData());

window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.toggleUserMenu = toggleUserMenu;
window.filterTable = filterTable;
window.renderTable = renderTable;
window.goPage = goPage;
window.copyText = copyText;
window.updatePayout = updatePayout;
