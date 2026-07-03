let allKyc = [], filtered = [], currentPage = 1;

function badge(s) {
  if (s === 'Approved') return `<span class="badge-kyc-approved">✓ Approved</span>`;
  if (s === 'Rejected') return `<span class="badge-failed">✗ Rejected</span>`;
  return `<span class="badge-pending">⊙ Pending</span>`;
}

async function loadData() {
  const [kycs, users, banks] = await Promise.all([AdminAPI.getKYC(), AdminAPI.getUsers(), AdminAPI.getBankDetails()]);
  const userMap = {};
  users.forEach(u => { userMap[u.id] = u.name || u.email || u.id.slice(0,8); });
  const bankMap = {};
  banks.forEach(b => { bankMap[b.user_id] = b; });
  allKyc = kycs.map(k => {
    const bank = bankMap[k.user_id] || {};
    return {
      id: k.id,
      user_id: k.user_id,
      name: userMap[k.user_id] || '—',
      aadhar: k.aadhar || '—',
      pan: k.pan || '—',
      gst: k.gst || '—',
      udyam: k.udyam || '—',
      website: k.website || '—',
      phone: k.phone || '—',
      email: k.email || '—',
      status: k.status || 'Pending',
      bank_name: bank.bank_name || '—',
      account_holder_name: bank.account_holder_name || '—',
      account_number: bank.account_number || '—',
      ifsc_code: bank.ifsc_code || '—',
    };
  });
  filtered = [...allKyc];
  renderTable();
}

function showDetail(id) {
  const r = allKyc.find(k => k.id === id);
  if (!r) return;
  document.getElementById('detailModal').innerHTML = `
    <div class="kyc-detail-card">
      <button class="kyc-detail-close" onclick="document.getElementById('detailModal').style.display='none'">✕</button>
      <div class="kyc-detail-name">${r.name}</div>
      <div class="kyc-detail-section">KYC Details</div>
      <div class="kyc-detail-grid">
        <div class="kyc-detail-row"><span class="kyc-detail-label">Aadhaar</span><span class="kyc-detail-val">${r.aadhar}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">PAN</span><span class="kyc-detail-val">${r.pan}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">GST</span><span class="kyc-detail-val">${r.gst}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">UDYAM</span><span class="kyc-detail-val">${r.udyam}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">Website</span><span class="kyc-detail-val">${r.website}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">Phone</span><span class="kyc-detail-val">${r.phone}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">Email</span><span class="kyc-detail-val">${r.email}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">Status</span><span class="kyc-detail-val">${badge(r.status)}</span></div>
      </div>
      <div class="kyc-detail-section" style="margin-top:20px;">Bank Details</div>
      <div class="kyc-detail-grid">
        <div class="kyc-detail-row"><span class="kyc-detail-label">Bank Name</span><span class="kyc-detail-val">${r.bank_name}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">Account Holder</span><span class="kyc-detail-val">${r.account_holder_name}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">Account Number</span><span class="kyc-detail-val">${r.account_number}</span></div>
        <div class="kyc-detail-row"><span class="kyc-detail-label">IFSC Code</span><span class="kyc-detail-val">${r.ifsc_code}</span></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:24px;justify-content:center;">
        ${r.status !== 'Approved' ? `<button class="action-icon-btn" onclick="updateKYC('${r.id}','Approved');document.getElementById('detailModal').style.display='none'" style="font-size:12px;padding:8px 20px;color:var(--green)">✓ Approve</button>` : ''}
        ${r.status !== 'Rejected' ? `<button class="action-icon-btn" onclick="updateKYC('${r.id}','Rejected');document.getElementById('detailModal').style.display='none'" style="font-size:12px;padding:8px 20px;color:var(--ember)">✗ Reject</button>` : ''}
      </div>
    </div>`;
  document.getElementById('detailModal').style.display = 'flex';
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
        <td style="cursor:pointer;font-weight:700;color:var(--white);text-decoration:underline;text-underline-offset:3px;" onclick="showDetail('${r.id}')">${r.name}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.aadhar}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.pan}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.gst}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.udyam}</td>
        <td style="font-size:13px;color:var(--smoke)">${r.website}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.phone}</td>
        <td style="color:var(--violet);font-size:12px">${r.email}</td>
        <td style="font-size:12px">${r.bank_name}</td>
        <td style="font-size:12px">${r.account_holder_name}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.account_number}</td>
        <td style="font-family:var(--f-mono);font-size:12px">${r.ifsc_code}</td>
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
window.updateKYC = updateKYC;
window.showDetail = showDetail;
