let listData = [], pendingData = [], filtered = [], currentPage = 1, activeTab = 'list';
const fmt = d => d ? new Date(d).toLocaleString('en-IN') : '—';
const fmtAmt = a => '₹' + parseFloat(a||0).toLocaleString('en-IN');

async function loadData() {
  const [payouts, users] = await Promise.all([AdminAPI.getReferralEarnings(), AdminAPI.getUsers()]);
  const uMap = {}; users.forEach(u => uMap[u.id] = {name:u.name||'—',email:u.email||'—',phone:u.phone||'—',balance:u.referral_wallet_balance||0});
  listData = payouts.map(r => ({
    name: (uMap[r.referrer_id]||{}).name||'—',
    phone: (uMap[r.referrer_id]||{}).phone||'—',
    email: (uMap[r.referrer_id]||{}).email||'—',
    amount: fmtAmt(r.amount),
    date: fmt(r.created_at),
  }));
  // Pending = users with referral_wallet_balance > 0
  pendingData = users.filter(u => parseFloat(u.referral_wallet_balance||0) > 0).map(u => ({
    id: u.id, name: u.name||'—', phone: u.phone||'—', email: u.email||'—',
    balance: fmtAmt(u.referral_wallet_balance),
  }));
  switchTab('list');
}

function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tabList').classList.toggle('active', tab==='list');
  document.getElementById('tabPending').classList.toggle('active', tab==='pending');
  filtered = tab==='list' ? [...listData] : [...pendingData];
  document.getElementById('searchInput').value = '';
  currentPage = 1; renderTable();
}

function renderTable() {
  const perPage = parseInt(document.getElementById('perPage').value);
  const thead = document.getElementById('tableHead'), tbody = document.getElementById('tableBody'), empty = document.getElementById('emptyState');
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const slice = filtered.slice((currentPage-1)*perPage, currentPage*perPage);
  if (activeTab==='list') {
    thead.innerHTML = `<tr><th>Name</th><th>Phone</th><th>Email</th><th>Amount</th><th>Date</th></tr>`;
    if (!slice.length) { tbody.innerHTML=''; empty.style.display='block'; }
    else { empty.style.display='none'; tbody.innerHTML=slice.map(r=>`<tr><td style="font-weight:700;color:var(--white)">${r.name}</td><td style="font-family:var(--f-mono);font-size:12px">${r.phone}</td><td style="color:var(--violet)">${r.email}</td><td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td><td style="font-family:var(--f-mono);font-size:12px;color:var(--smoke)">${r.date}</td></tr>`).join(''); }
  } else {
    thead.innerHTML = `<tr><th>Name</th><th>Phone</th><th>Email</th><th>Balance</th><th>Action</th></tr>`;
    if (!slice.length) { tbody.innerHTML=''; empty.style.display='block'; }
    else { empty.style.display='none'; tbody.innerHTML=slice.map(r=>`<tr><td style="font-weight:700;color:var(--white)">${r.name}</td><td style="font-family:var(--f-mono);font-size:12px">${r.phone}</td><td style="color:var(--violet)">${r.email}</td><td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.balance}</td><td><button class="rp-pay-btn" onclick="alert('Payout for ${r.name}')">Pay</button></td></tr>`).join(''); }
  }
  renderPagination(totalPages);
}
function renderPagination(t){const pg=document.getElementById('pagination');if(t<=1){pg.innerHTML='';return;}let h=`<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;for(let i=1;i<=t;i++){h+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;}h+=`<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===t?'disabled':''}>›</button>`;pg.innerHTML=h;}
function goPage(n){const p=parseInt(document.getElementById('perPage').value);const t=Math.ceil(filtered.length/p);if(n<1||n>t)return;currentPage=n;renderTable();}
function filterTable(){const q=document.getElementById('searchInput').value.trim().toLowerCase();const src=activeTab==='list'?listData:pendingData;filtered=q?src.filter(r=>r.name.toLowerCase().includes(q)||r.email.includes(q)||r.phone.includes(q)):[...src];currentPage=1;renderTable();}
function toggleSidebar(){document.getElementById('adminSidebar').classList.toggle('collapsed');}
function toggleTheme(){document.body.classList.toggle('light-theme');}
function toggleUserMenu(){event.stopPropagation();document.getElementById('userPopup').classList.toggle('open');}
document.addEventListener('click',function(e){if(e.target.closest('.user-popup-item'))return;const p=document.getElementById('userPopup'),u=document.getElementById('sbUser');if(p&&!p.contains(e.target)&&!u.contains(e.target))p.classList.remove('open');});
loadData();

window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.toggleUserMenu = toggleUserMenu;
window.filterTable = filterTable;
window.renderTable = renderTable;
window.goPage = goPage;
window.switchTab = switchTab;