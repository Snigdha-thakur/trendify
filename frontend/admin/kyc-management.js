let allKyc = [], filtered = [], currentPage = 1;

function badge(s) {
  if (s === 'Approved') return `<span class="badge-kyc-approved">✓ Approved</span>`;
  if (s === 'Rejected') return `<span class="badge-failed">✗ Rejected</span>`;
  return `<span class="badge-pending">⊙ Pending</span>`;
}

async function loadData() {
  const [kycs, users] = await Promise.all([AdminAPI.getKYC(), AdminAPI.getUsers()]);
  const userMap = {};
  users.forEach(u => { userMap[u.id] = u.name || u.email || u.id.slice(0,8); });
  allKyc = kycs.map(k => ({
    id: k.id,
    name: userMap[k.user_id] || '—',
    aadhar: k.aadhar || '—',
    pan: k.pan || '—',
    gst: k.gst || '—',
    udyam: k.udyam || '—',
    website: k.website || '—',
    phone: k.phone || '—',
    email: k.email || '—',
    status: k.status || 'Pending',
  }));
  filtered = [...allKyc];
  renderTable();
}

async function updateKYC(id, status) {
  await AdminAPI.updateKYCStatus(id, status);
  const item = allKyc.find(k => k.id === id);
  if (item) item.status = status;
  filterTable();
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
        <td><span style="font-weight:700;color:var(--white)">${r.name}</span></td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.aadhar}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.pan}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.gst}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.udyam}</td>
        <td style="font-size:13px;color:var(--smoke)">${r.website}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.phone}</td>
        <td style="color:var(--violet);font-size:12px">${r.email}</td>
        <td>${badge(r.status)}</td>
        <td>
          ${r.status !== 'Approved' ? `<button class="action-icon-btn" onclick="updateKYC('${r.id}','Approved')" style="font-size:11px;padding:4px 10px;color:var(--green)">Approve</button>` : ''}
          ${r.status !== 'Rejected' ? `<button class="action-icon-btn" onclick="updateKYC('${r.id}','Rejected')" style="font-size:11px;padding:4px 10px;color:var(--ember)">Reject</button>` : ''}
        </td>
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
  const s = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';
  filtered = allKyc.filter(r =>
    (!q || r.name.toLowerCase().includes(q) || r.aadhar.includes(q) || r.pan.toLowerCase().includes(q) || r.gst.toLowerCase().includes(q)) &&
    (!s || r.status === s)
  );
  currentPage = 1; renderTable();
}

function toggleSidebar() {
  const sb = document.getElementById('adminSidebar');
  const ov = document.getElementById('sbOverlay');
  sb.classList.toggle('collapsed');
  if (ov) ov.classList.toggle('open', !sb.classList.contains('collapsed') && window.innerWidth <= 768);
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
window.updateKYC = updateKYC;
