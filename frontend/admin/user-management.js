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
  const u = filtered[idx];
  const menu = document.getElementById('ctxMenu');
  const rect = btn.getBoundingClientRect();
  menu.style.top = (rect.bottom + window.scrollY + 4) + 'px';
  menu.style.left = (rect.left + window.scrollX - 140) + 'px';
  // Dynamic label: Login as Creator / Login as User / Login as Admin
  const label = u.role === 'creator' ? 'Login as Creator' : u.role === 'admin' ? 'Login as Admin' : 'Login as User';
  document.getElementById('ctxLoginBtn').childNodes[2].textContent = ' ' + label;
  // Dynamic status label
  const statusLabel = u.status === 'active' ? 'Deactivate User' : 'Activate User';
  document.getElementById('ctxStatusBtn').childNodes[2].textContent = ' ' + statusLabel;
  menu.classList.add('open');
}

function viewDetails(idx) {
  const u = filtered[idx];
  if (!u) return;
  document.getElementById('editUserId').value = u.id || '';
  document.getElementById('editName').value = u.name || '';
  document.getElementById('editEmail').value = u.email || '';
  document.getElementById('editPhone').value = u.phone || '';
  document.getElementById('editPassword').value = '';
  document.getElementById('editPassword').type = 'password';
  document.getElementById('editPasswordToggle').innerHTML = eyeOffIcon();
  document.getElementById('editRole').value = u.role || 'user';
  document.getElementById('editStatus').value = u.status || 'active';
  document.getElementById('editUserError').textContent = '';
  document.getElementById('editSubmitBtn').disabled = false;
  document.getElementById('editSubmitBtn').innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" style="margin-right:5px"><path d="M13 2H5L2 5v9h12V2z"/><rect x="5" y="9" width="6" height="5"/><rect x="5" y="2" width="4" height="3"/></svg>Update User';
  document.getElementById('editUserModal').style.display = 'flex';
}

function closeDetailsModal() {
  document.getElementById('editUserModal').style.display = 'none';
}

function closeEditUserModal() {
  document.getElementById('editUserModal').style.display = 'none';
}

function toggleEditPassword() {
  const inp = document.getElementById('editPassword');
  const btn = document.getElementById('editPasswordToggle');
  if (inp.type === 'password') { inp.type = 'text'; btn.innerHTML = eyeIcon(); }
  else { inp.type = 'password'; btn.innerHTML = eyeOffIcon(); }
}

function generateEditPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('editPassword').value = pwd;
  document.getElementById('editPassword').type = 'text';
  document.getElementById('editPasswordToggle').innerHTML = eyeIcon();
}

async function deleteUserFromEdit() {
  const id = document.getElementById('editUserId').value;
  const name = document.getElementById('editName').value;
  if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
  try {
    await AdminAPI.deleteUser(id);
    allUsers = allUsers.filter(u => u.id !== id);
    filtered = filtered.filter(u => u.id !== id);
    renderTable();
    closeEditUserModal();
  } catch(e) {
    document.getElementById('editUserError').textContent = 'Delete failed: ' + e.message;
  }
}

async function submitEditUser() {
  const btn = document.getElementById('editSubmitBtn');
  const err = document.getElementById('editUserError');
  const id = document.getElementById('editUserId').value;
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const password = document.getElementById('editPassword').value;
  const role = document.getElementById('editRole').value;
  const status = document.getElementById('editStatus').value;
  err.textContent = '';
  if (!name) { err.textContent = 'Name is required.'; return; }
  if (!email) { err.textContent = 'Email is required.'; return; }
  btn.disabled = true;
  btn.textContent = 'Saving…';
  const payload = { name, phone: phone || null, role, status };
  if (password) payload.password = password;
  try {
    const updated = await AdminAPI.updateUser(id, payload);
    const idx = allUsers.findIndex(u => u.id === updated.id);
    if (idx !== -1) allUsers[idx] = updated;
    const fidx = filtered.findIndex(u => u.id === updated.id);
    if (fidx !== -1) filtered[fidx] = updated;
    renderTable();
    closeEditUserModal();
  } catch(e) {
    try { const j = JSON.parse(e.message); err.textContent = j.detail || e.message; }
    catch { err.textContent = e.message; }
    btn.disabled = false;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" style="margin-right:5px"><path d="M13 2H5L2 5v9h12V2z"/><rect x="5" y="9" width="6" height="5"/><rect x="5" y="2" width="4" height="3"/></svg>Update User';
  }
}

async function ctxAction(action) {
  const u = filtered[activeCtxIdx];
  if (!u) return;
  document.getElementById('ctxMenu').classList.remove('open');
  if (action === 'edit') {
    viewDetails(activeCtxIdx);
  } else if (action === 'login') {
    window.location.href = '../creator/dashboard.html';
  } else if (action === 'status') {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      await AdminAPI.updateUserStatus(u.id, newStatus);
      u.status = newStatus;
      renderTable();
    } catch(e) { alert('Failed: ' + e.message); }
  } else if (action === 'wallet') {
    document.getElementById('walletModalSub').textContent = u.name + ' — Current: ₹' + parseFloat(u.wallet_balance || 0).toLocaleString('en-IN');
    document.getElementById('walletAmount').value = '';
    document.getElementById('walletError').textContent = '';
    document.getElementById('walletSubmitBtn').disabled = false;
    document.getElementById('walletSubmitBtn').textContent = 'Update';
    document.getElementById('walletModal').style.display = 'flex';
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
  document.getElementById('addUserModal').style.display = 'flex';
  document.getElementById('addUserForm').reset();
  document.getElementById('addUserError').textContent = '';
  document.getElementById('auPassword').type = 'password';
  document.getElementById('auPasswordToggle').innerHTML = eyeOffIcon();
  document.getElementById('auSubmitBtn').textContent = '+ Create User';
  document.getElementById('auSubmitBtn').disabled = false;
}

function closeAddUserModal() {
  document.getElementById('addUserModal').style.display = 'none';
}

function eyeIcon() {
  return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><ellipse cx="8" cy="8" rx="7" ry="4"/><circle cx="8" cy="8" r="2"/></svg>';
}
function eyeOffIcon() {
  return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 2l12 12M6.5 6.5A2 2 0 0 0 9.5 9.5"/><path d="M4 4.3C2.5 5.2 1.3 6.5 1 8c.8 3 3.6 5 7 5a9 9 0 0 0 3.7-.8M6.4 3.1A9 9 0 0 1 8 3c3.4 0 6.2 2 7 5a9.5 9.5 0 0 1-1.8 3"/></svg>';
}

function toggleAUPassword() {
  const inp = document.getElementById('auPassword');
  const btn = document.getElementById('auPasswordToggle');
  if (inp.type === 'password') { inp.type = 'text'; btn.innerHTML = eyeIcon(); }
  else { inp.type = 'password'; btn.innerHTML = eyeOffIcon(); }
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  const inp = document.getElementById('auPassword');
  inp.value = pwd;
  inp.type = 'text';
  document.getElementById('auPasswordToggle').innerHTML = eyeIcon();
}

async function submitAddUser() {
  const btn = document.getElementById('auSubmitBtn');
  const err = document.getElementById('addUserError');
  const name = document.getElementById('auName').value.trim();
  const phone = document.getElementById('auPhone').value.trim();
  const email = document.getElementById('auEmail').value.trim();
  const password = document.getElementById('auPassword').value;
  const role = document.getElementById('auRole').value;
  const status = document.getElementById('auStatus').value;
  err.textContent = '';
  if (!name) { err.textContent = 'Name is required.'; return; }
  if (!email) { err.textContent = 'Email is required.'; return; }
  if (!password) { err.textContent = 'Password is required.'; return; }
  btn.disabled = true;
  btn.textContent = 'Creating…';
  try {
    const newUser = await AdminAPI.createUser({ name, email, phone: phone || null, password, role, status });
    allUsers.unshift(newUser);
    filtered = [...allUsers];
    currentPage = 1;
    renderTable();
    closeAddUserModal();
  } catch (e) {
    try { const j = JSON.parse(e.message); err.textContent = j.detail || e.message; }
    catch { err.textContent = e.message; }
    btn.disabled = false;
    btn.textContent = '+ Create User';
  }
}

function closeWalletModal() {
  document.getElementById('walletModal').style.display = 'none';
}

async function submitWalletUpdate() {
  const u = filtered[activeCtxIdx];
  if (!u) return;
  const btn = document.getElementById('walletSubmitBtn');
  const err = document.getElementById('walletError');
  const amount = parseFloat(document.getElementById('walletAmount').value);
  const type = document.getElementById('walletType').value;
  err.textContent = '';
  if (isNaN(amount) || amount <= 0) { err.textContent = 'Enter a valid amount.'; return; }
  btn.disabled = true;
  btn.textContent = 'Updating…';
  try {
    const updated = await AdminAPI.updateUserWallet(u.id, amount, type);
    u.wallet_balance = updated.wallet_balance;
    renderTable();
    closeWalletModal();
  } catch(e) {
    err.textContent = e.message;
    btn.disabled = false;
    btn.textContent = 'Update';
  }
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('ctxMenu');
  if (menu && !menu.contains(e.target) && !e.target.closest('.action-icon-btn')) menu.classList.remove('open');
  if (e.target.closest('.user-popup-item')) return;
  const popup = document.getElementById('userPopup'), user = document.getElementById('sbUser');
  if (popup && !popup.contains(e.target) && !user.contains(e.target)) popup.classList.remove('open');
  const modal = document.getElementById('detailsModal');
  if (modal && !modal.contains(e.target) && e.target.id === 'detailsModal') closeDetailsModal();
  if (e.target.id === 'addUserModal') closeAddUserModal();
  if (e.target.id === 'walletModal') closeWalletModal();
  if (e.target.id === 'detailsModal') closeDetailsModal();
  if (e.target.id === 'editUserModal') closeEditUserModal();
});

function toggleSidebar() { document.getElementById('adminSidebar').classList.toggle('collapsed'); }
function toggleTheme() { document.body.classList.toggle('light-theme'); }
function toggleUserMenu() { event.stopPropagation(); document.getElementById('userPopup').classList.toggle('open'); }

AdminAPI.init().then(() => loadUsers());

// Expose functions used in inline onclick handlers
window.addUser = addUser;
window.closeAddUserModal = closeAddUserModal;
window.generatePassword = generatePassword;
window.toggleAUPassword = toggleAUPassword;
window.submitAddUser = submitAddUser;
window.filterTable = filterTable;
window.renderTable = renderTable;
window.goPage = goPage;
window.openCtx = openCtx;
window.ctxAction = ctxAction;
window.closeDetailsModal = closeDetailsModal;
window.closeEditUserModal = closeEditUserModal;
window.toggleEditPassword = toggleEditPassword;
window.generateEditPassword = generateEditPassword;
window.submitEditUser = submitEditUser;
window.deleteUserFromEdit = deleteUserFromEdit;
window.closeWalletModal = closeWalletModal;
window.submitWalletUpdate = submitWalletUpdate;
window.copyText = copyText;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.toggleUserMenu = toggleUserMenu;
