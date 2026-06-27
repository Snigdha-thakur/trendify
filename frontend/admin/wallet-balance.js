let allWallets = [], filtered = [], currentPage = 1, selected = new Set();

function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN'); }
function kycBadge(k) {
  return k === 'Approved' ? `<span class="badge-kyc-approved">✓ Approved</span>` : `<span class="badge-kyc-pending">⊙ Not Submitted</span>`;
}

async function loadData() {
  const [users, kycs] = await Promise.all([AdminAPI.getUsers(), AdminAPI.getKYC()]);
  const kycMap = {};
  kycs.forEach(k => { kycMap[k.user_id] = k.status === 'Approved' ? 'Approved' : 'Not Submitted'; });
  allWallets = users.map(u => ({
    id: u.id,
    name: u.name || '—',
    email: u.email || '—',
    phone: u.phone || '—',
    password_hash: u.password_hash || '—',
    role: u.role || 'user',
    status: u.status || 'active',
    referral_code: u.referral_code || '—',
    referred_by: u.referred_by || '—',
    wallet_balance: u.wallet_balance || 0,
    referral_wallet_balance: u.referral_wallet_balance || 0,
    created_at: u.created_at || '—',
    wallet: fmtAmt(u.wallet_balance),
    kyc: kycMap[u.id] || 'Not Submitted',
  }));
  filtered = [...allWallets];
  renderTable();
}

function toggleSelectAll(cb) {
  const perPage = parseInt(document.getElementById('perPage').value);
  const slice = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  slice.forEach((_, i) => { const idx = (currentPage-1)*perPage+i; cb.checked ? selected.add(idx) : selected.delete(idx); });
  renderTable();
}
function toggleRow(idx, cb) { cb.checked ? selected.add(idx) : selected.delete(idx); }
async function payAll() {
  // Determine target users: selected ones, or all filtered if none selected
  let targets;
  if (selected.size > 0) {
    targets = [...selected].map(idx => allWallets[idx]).filter(u => u && u.wallet_balance > 0);
  } else {
    targets = filtered.filter(u => u.wallet_balance > 0);
  }
  if (!targets.length) { alert('No users with wallet balance to pay.'); return; }
  const names = targets.map(u => `${u.name} (${fmtAmt(u.wallet_balance)})`).join('\n');
  if (!confirm(`Pay the following ${targets.length} user(s)?\n\n${names}`)) return;
  const btn = document.getElementById('payAllBtn');
  btn.disabled = true; btn.textContent = 'Paying…';
  try {
    const res = await AdminAPI.payWallets(targets.map(u => u.id));
    alert(`✓ Successfully paid ${res.count} user(s).`);
    selected.clear();
    await loadData();
  } catch(e) {
    alert('Payment failed: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Pay All';
  }
}

function renderTable() {
  const perPage = parseInt(document.getElementById('perPage').value);
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage-1)*perPage;
  const slice = filtered.slice(start, start+perPage);
  if (!slice.length) { tbody.innerHTML = ''; empty.style.display = 'block'; }
  else {
    empty.style.display = 'none';
    tbody.innerHTML = slice.map((r, i) => {
      const idx = start+i;
      return `<tr>
        <td><input type="checkbox" ${selected.has(idx)?'checked':''} onchange="toggleRow(${idx},this)"/></td>
        <td style="font-weight:700;color:var(--white)">${r.name}</td>
        <td style="color:var(--violet)">${r.email}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.phone}</td>
        <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.wallet}</td>
        <td>${kycBadge(r.kyc)}</td>
      </tr>`;
    }).join('');
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
  filtered = q ? allWallets.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.includes(q)) : [...allWallets];
  currentPage = 1; selected.clear(); renderTable();
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

AdminAPI.init().then(() => {
  loadData();
  setInterval(loadData, 10000);
});

window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.toggleUserMenu = toggleUserMenu;
window.filterTable = filterTable;
window.renderTable = renderTable;
window.goPage = goPage;
window.toggleSelectAll = toggleSelectAll;
window.toggleRow = toggleRow;
window.payAll = payAll;
