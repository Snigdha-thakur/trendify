let allData = [], filtered = [], currentPage = 1;
const fmt = d => d ? new Date(d).toLocaleString('en-IN') : '—';
const fmtAmt = a => '₹' + parseFloat(a||0).toLocaleString('en-IN');
const copyText = (t,b) => navigator.clipboard.writeText(t).then(()=>{b.textContent='✓';setTimeout(()=>b.textContent='⧉',1200)});
const badge = s => s==='Success'||s==='Paid'?`<span class="badge-paid">✓ Paid</span>`:s==='Pending'?`<span class="badge-pending">⊙ Pending</span>`:`<span class="badge-failed">${s}</span>`;

async function loadData() {
  const [payouts, users] = await Promise.all([AdminAPI.getCreatorPayouts(), AdminAPI.getUsers()]);
  const uMap = {}; users.forEach(u => uMap[u.id] = {name:u.name||'—',email:u.email||'—',phone:u.phone||'—'});
  allData = payouts.map(r => ({
    id: r.id,
    creator: (uMap[r.creator_id]||{}).name||'—',
    phone: (uMap[r.creator_id]||{}).phone||'—',
    creatorEmail: (uMap[r.creator_id]||{}).email||'—',
    buyerEmail: r.buyer_email||'—',
    amount: fmtAmt(r.amount),
    status: r.status||'Pending',
    date: fmt(r.created_at),
  }));
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
      <td><div class="txn-id-cell"><button class="copy-btn" onclick="copyText('${r.id}',this)">⧉</button>${r.id}</div></td>
      <td><div style="font-weight:700;color:var(--white)">${r.creator}</div><div style="font-family:var(--f-mono);font-size:11px;color:var(--smoke)">${r.phone}</div><div style="font-size:11px;color:var(--violet)">${r.creatorEmail}</div></td>
      <td><div style="display:flex;align-items:center;gap:6px"><button class="copy-btn" onclick="copyText('${r.buyerEmail}',this)">⧉</button><span style="color:var(--violet)">${r.buyerEmail}</span></div></td>
      <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
      <td>${badge(r.status)}</td>
      <td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap">${r.date}</td>
    </tr>`).join('');
  }
  renderPagination(totalPages);
}
function renderPagination(t){const pg=document.getElementById('pagination');if(t<=1){pg.innerHTML='';return;}let h=`<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;for(let i=1;i<=t;i++){if(t>7&&i>2&&i<t-1&&Math.abs(i-currentPage)>1){if(i===3||i===t-2)h+=`<span class="pg-btn" style="cursor:default;opacity:.4">…</span>`;continue;}h+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;}h+=`<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===t?'disabled':''}>›</button>`;pg.innerHTML=h;}
function goPage(n){const p=parseInt(document.getElementById('perPage').value);const t=Math.ceil(filtered.length/p);if(n<1||n>t)return;currentPage=n;renderTable();}
function filterTable(){const q=document.getElementById('searchInput').value.trim().toLowerCase();const s=document.getElementById('statusFilter')?document.getElementById('statusFilter').value:'';filtered=allData.filter(r=>(!q||r.id.toLowerCase().includes(q)||r.creator.toLowerCase().includes(q)||r.buyerEmail.toLowerCase().includes(q))&&(!s||r.status===s));currentPage=1;renderTable();}
function toggleSidebar() {
  const sb = document.getElementById('adminSidebar');
  const ov = document.getElementById('sbOverlay');
  sb.classList.toggle('collapsed');
  if (ov) ov.classList.toggle('open', sb.classList.contains('collapsed') && window.innerWidth <= 768);
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