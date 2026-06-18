let allData = [], filtered = [], currentPage = 1;
const fmt = d => d ? new Date(d).toLocaleString('en-IN') : '—';
const fmtAmt = a => '₹' + parseFloat(a||0).toLocaleString('en-IN');
const copyText = (t,b) => navigator.clipboard.writeText(t).then(()=>{b.textContent='✓';setTimeout(()=>b.textContent='⧉',1200)});
const typeBadge = t => t==='Credit'?`<span class="badge-credit">↗ Credit</span>`:`<span class="badge-debit">↘ Debit</span>`;
const walletBadge = w => w === 'Referral Wallet' ? '<span class="badge-wallet-ref">Referral Wallet</span>' : '<span class="badge-wallet-main">Main Wallet</span>';

async function loadData() {
  const [logs, users] = await Promise.all([AdminAPI.getWalletLogs(), AdminAPI.getUsers()]);
  const uMap = {}; users.forEach(u => uMap[u.id] = u.email||u.name||'—');
  allData = logs.map(r => ({
    email: uMap[r.user_id]||'—', txnId: r.transaction_id||'N/A',
    walletType: r.wallet_type||'main', type: r.type||'—',
    existing: fmtAmt(r.existing_balance), amount: fmtAmt(r.amount),
    newBal: fmtAmt(r.new_balance), date: fmt(r.created_at),
  }));

  // Live stats
  const totalWallet = users.reduce((s, u) => s + parseFloat(u.wallet_balance||0) + parseFloat(u.referral_wallet_balance||0), 0);
  if (document.getElementById('statTotalWallet'))
    document.getElementById('statTotalWallet').textContent = fmtAmt(totalWallet);
  if (document.getElementById('statTotalTxns'))
    document.getElementById('statTotalTxns').textContent = logs.length.toLocaleString('en-IN');

  filtered = [...allData]; renderTable();
}

function renderTable() {
  const perPage = parseInt(document.getElementById('perPage').value);
  const tbody = document.getElementById('tableBody'), empty = document.getElementById('emptyState');
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const slice = filtered.slice((currentPage-1)*perPage, currentPage*perPage);
  if (!slice.length) { tbody.innerHTML=''; empty.style.display='block'; }
  else {
    empty.style.display='none';
    tbody.innerHTML = slice.map(r=>`<tr>
      <td><div style="display:flex;align-items:center;gap:5px"><button class="copy-btn" onclick="copyText('${r.email}',this)">⧉</button><span style="color:var(--violet);font-size:12px">${r.email}</span></div></td>
      <td><div style="display:flex;align-items:center;gap:5px">${r.txnId!=='N/A'?`<button class="copy-btn" onclick="copyText('${r.txnId}',this)">⧉</button>`:''}<span style="font-family:var(--f-mono);font-size:11px;color:var(--smoke)">${r.txnId!=='N/A'?r.txnId.slice(0,20)+'…':'N/A'}</span></div></td>
      <td>${walletBadge(r.walletType)}</td><td>${typeBadge(r.type)}</td>
      <td style="font-family:var(--f-mono);font-size:12px;color:var(--smoke)">${r.existing}</td>
      <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
      <td style="font-family:var(--f-mono);font-size:12px;color:var(--smoke)">${r.newBal}</td>
      <td style="font-family:var(--f-mono);font-size:11px;white-space:nowrap;color:var(--smoke)">${r.date}</td>
    </tr>`).join('');
  }
  renderPagination(totalPages);
}
function renderPagination(t){const pg=document.getElementById('pagination');if(t<=1){pg.innerHTML='';return;}let h=`<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;for(let i=1;i<=t;i++){if(t>7&&i>2&&i<t-1&&Math.abs(i-currentPage)>1){if(i===3||i===t-2)h+=`<span class="pg-btn" style="cursor:default;opacity:.4">…</span>`;continue;}h+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;}h+=`<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===t?'disabled':''}>›</button>`;pg.innerHTML=h;}
function goPage(n){const p=parseInt(document.getElementById('perPage').value);const t=Math.ceil(filtered.length/p);if(n<1||n>t)return;currentPage=n;renderTable();}
function filterTable(){const q=document.getElementById('searchInput').value.trim().toLowerCase();filtered=q?allData.filter(r=>r.email.includes(q)||r.txnId.includes(q)||r.type.toLowerCase().includes(q)):[...allData];currentPage=1;renderTable();}
function toggleSidebar() {
  const sb = document.getElementById('adminSidebar');
  const ov = document.getElementById('sbOverlay');
  sb.classList.toggle('collapsed');
  if (ov) ov.classList.toggle('open', !sb.classList.contains('collapsed') && window.innerWidth <= 768);
}
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
window.copyText = copyText;