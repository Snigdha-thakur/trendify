let allData = [], filtered = [], currentPage = 1;
const fmt = d => d ? new Date(d).toLocaleString('en-IN') : '—';
const fmtAmt = a => '₹' + parseFloat(a||0).toLocaleString('en-IN');
const copyText = (t,b) => navigator.clipboard.writeText(t).then(()=>{b.textContent='✓';setTimeout(()=>b.textContent='⧉',1200)});

async function loadData() {
  const [refs, users] = await Promise.all([AdminAPI.getReferralEarnings(), AdminAPI.getUsers()]);
  const uMap = {}; users.forEach(u => uMap[u.id] = {name:u.name||'—',email:u.email||'—',phone:u.phone||'—'});
  allData = refs.map(r => ({
    id: r.transaction_id||r.id,
    referrer: uMap[r.referrer_id]||{name:'—',email:'—',phone:'—'},
    fromCreator: uMap[r.from_creator_id]||{name:'—',email:'—',phone:'—'},
    source: r.source||'referral',
    amount: fmtAmt(r.amount),
    pct: r.percentage||'—',
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
      <td><div style="font-weight:700;color:var(--white)">${r.referrer.name}</div><div style="font-family:var(--f-mono);font-size:11px;color:var(--smoke)">${r.referrer.phone}</div><div style="font-size:11px;color:var(--violet)">${r.referrer.email}</div></td>
      <td><div style="font-weight:700;color:var(--white)">${r.fromCreator.name}</div><div style="font-family:var(--f-mono);font-size:11px;color:var(--smoke)">${r.fromCreator.phone}</div><div style="font-size:11px;color:var(--violet)">${r.fromCreator.email}</div></td>
      <td style="font-size:12px;color:var(--smoke)">${r.source}</td>
      <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.amount}</td>
      <td style="font-family:var(--f-mono);font-weight:600;color:var(--white)">${r.pct}</td>
      <td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap;color:var(--smoke)">${r.date}</td>
    </tr>`).join('');
  }
  renderPagination(totalPages);
}
function renderPagination(t){const pg=document.getElementById('pagination');if(t<=1){pg.innerHTML='';return;}let h=`<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;for(let i=1;i<=t;i++){if(t>7&&i>2&&i<t-1&&Math.abs(i-currentPage)>1){if(i===3||i===t-2)h+=`<span class="pg-btn" style="cursor:default;opacity:.4">…</span>`;continue;}h+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;}h+=`<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===t?'disabled':''}>›</button>`;pg.innerHTML=h;}
function goPage(n){const p=parseInt(document.getElementById('perPage').value);const t=Math.ceil(filtered.length/p);if(n<1||n>t)return;currentPage=n;renderTable();}
function filterTable(){const q=document.getElementById('searchInput').value.trim().toLowerCase();filtered=q?allData.filter(r=>r.id.includes(q)||r.referrer.name.toLowerCase().includes(q)||r.fromCreator.name.toLowerCase().includes(q)):[...allData];currentPage=1;renderTable();}
function toggleSidebar(){document.getElementById('adminSidebar').classList.toggle('collapsed');}
function toggleTheme(){document.body.classList.toggle('light-theme');}
function toggleUserMenu(){event.stopPropagation();document.getElementById('userPopup').classList.toggle('open');}
document.addEventListener('click',function(e){if(e.target.closest('.user-popup-item'))return;const p=document.getElementById('userPopup'),u=document.getElementById('sbUser');if(p&&!p.contains(e.target)&&!u.contains(e.target))p.classList.remove('open');});
loadData();
