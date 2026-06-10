let allUsers = [], filtered = [], currentPage = 1, activeCtxIdx = -1;

function fmt(d) { return d ? new Date(d).toLocaleString('en-IN') : '—'; }
function fmtAmt(a) { return '₹' + parseFloat(a || 0).toLocaleString('en-IN'); }
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => { btn.textContent = '✓'; setTimeout(() => btn.textContent = '⧉', 1200); });
}
function roleBadge(r) {
  return r === 'creator' ? `<span class="badge-role-creator">Creator</span>` : r === 'admin' ? `<span class="badge-role-creator" style="background:rgba(212,168,67,.12);color:var(--gold);border-color:rgba(212,168,67,.25)">Admin</span>` : `<span class="badge-role-user">User</span>`;
}
function statusBadge(s) {
  return s === 'active' ? `<span class="badge-kyc-approved" style="border-radius:4px">Active</span>` : `<span class="badge-under-review" style="border-radius:4px">Inactive</span>`;
}

async function loadUsers() {
  const data = await AdminAPI.getUsers();
  allUsers = data;
  filtered = [...allUsers];
  currentPage = 1;
  renderTable();
}

function openCtx(idx, btn) {
  activeCtxIdx = idx;
  const menu = document.getElementById('ctxMenu');
  const rect = btn.getBoundingClientRect();
  menu.style.top = (rect.bottom + window.scrollY + 4) + 'px';
  menu.style.left = (rect.left + window.scrollX - 140) + 'px';
  menu.classList.add('open');
}

function viewDetails(idx) {
  const u = filtered[idx];
  if (!u) return;
  const modal = document.getElementById('detailsModal');
  document.getElementById('detailsId').value = u.id || '';
  document.getElementById('detailsName').value = u.name || '';
  document.getElementById('detailsEmail').value = u.email || '';
  document.getElementById('detailsPhone').value = u.phone || '';
  document.getElementById('detailsPasswordHash').value = u.password_hash || '';
  document.getElementById('detailsRole').value = u.role || 'user';
  document.getElementById('detailsStatus').value = u.status || 'active';
  document.getElementById('detailsReferralCode').value = u.referral_code || '';
  document.getElementById('detailsReferredBy').value = u.referred_by || '';
  document.getElementById('detailsWalletBalance').value = u.wallet_balance || 0;
  document.getElementById('detailsReferralWalletBalance').value = u.referral_wallet_balance || 0;
  document.getElementById('detailsCreatedAt').value = fmt(u.created_at);
  modal.classList.add('open');
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('open');
}

async function ctxAction(action) {
  const u = filtered[activeCtxIdx];
  if (!u) return;
  if (action === 'edit') {
    viewDetails(activeCtxIdx);
  } else if (action === 'loginAsCreator') {
    if (u.role === 'creator' || u.role === 'admin') {
      window.location.href = '../creator/dashboard.html';
    } else {
      alert('User must have creator or admin role to access creator dashboard.');
    }
  } else if (action === 'status') {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    await AdminAPI.updateUserStatus(u.id, newStatus);
    u.status = newStatus;
    renderTable();
  }
  document.getElementById('ctxMenu').classList.remove('open');
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
    tbody.innerHTML = slice.map((r, i) => `
      <tr>
        <td style="font-weight:700;color:var(--white)">${r.name || '—'}</td>
        <td style="color:var(--violet);font-size:13px">${r.email || '—'}</td>
        <td style="font-family:var(--f-mono);font-size:12px;color:var(--smoke)">${r.phone || '—'}</td>
        <td><div style="display:flex;align-items:center;gap:6px"><button class="copy-btn" onclick="copyText('${r.referral_code||''}',this)">⧉</button><span style="font-family:var(--f-mono);font-size:11px;color:var(--smoke)">${r.referral_code || '—'}</span></div></td>
        <td>${roleBadge(r.role)}</td>
        <td>${statusBadge(r.status)}</td>
        <td style="font-family:var(--f-mono);font-size:11px;color:var(--smoke)">${fmtAmt(r.wallet_balance)}</td>
        <td><button class="action-icon-btn" onclick="openCtx(${(currentPage-1)*perPage+i},this)" style="font-size:16px;letter-spacing:2px;padding:4px 10px">···</button></td>
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
  filtered = q ? allUsers.filter(r => (r.name||'').toLowerCase().includes(q) || (r.email||'').toLowerCase().includes(q) || (r.phone||'').includes(q)) : [...allUsers];
  currentPage = 1; renderTable();
}

function addUser() {
  alert('Add User feature coming soon');
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('ctxMenu');
  if (menu && !menu.contains(e.target) && !e.target.closest('.action-icon-btn')) menu.classList.remove('open');
  if (e.target.closest('.user-popup-item')) return;
  const popup = document.getElementById('userPopup'), user = document.getElementById('sbUser');
  if (popup && !popup.contains(e.target) && !user.contains(e.target)) popup.classList.remove('open');
  const modal = document.getElementById('detailsModal');
  if (modal && !modal.contains(e.target) && e.target.id === 'detailsModal') closeDetailsModal();
});

function toggleSidebar() { document.getElementById('adminSidebar').classList.toggle('collapsed'); }
function toggleTheme() { document.body.classList.toggle('light-theme'); }
function toggleUserMenu() { event.stopPropagation(); document.getElementById('userPopup').classList.toggle('open'); }

AdminAPI.init().then(() => loadUsers());
