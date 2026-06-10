let allData = [], filtered = [], currentPage = 1;
const fmt = d => d ? new Date(d).toLocaleString('en-IN') : '—';
const copyText = (t,b) => navigator.clipboard.writeText(t).then(()=>{b.textContent='✓';setTimeout(()=>b.textContent='⧉',1200)});
const shortUrl = u => u.length>45?u.slice(0,45)+'…':u;

async function loadData() {
  const [logs, users] = await Promise.all([AdminAPI.getWebhookLogs(), AdminAPI.getUsers()]);
  const uMap = {}; users.forEach(u => uMap[u.id] = {name:u.name||'—', email:u.email||'—'});
  allData = logs.map(r => ({
    user: (uMap[r.user_id]||{}).name||'—',
    email: (uMap[r.user_id]||{}).email||'—',
    url: r.webhook_url||'—',
    txnId: r.transaction_id||'—',
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
      <td style="font-weight:700;color:var(--white)">${r.user}</td>
      <td><div style="display:flex;align-items:center;gap:6px"><button class="copy-btn" onclick="copyText('${r.email}',this)">⧉</button><span style="color:var(--white)">${r.email}</span></div></td>
      <td><div style="display:flex;align-items:center;gap:6px"><button class="copy-btn" onclick="copyText('${r.url}',this)">⧉</button><span style="color:var(--violet);font-family:var(--f-mono);font-size:12px">${shortUrl(r.url)}</span></div></td>
      <td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap;color:var(--smoke)">${r.date}</td>
    </tr>`).join('');
  }
  renderPagination(totalPages);
}
function renderPagination(t){const pg=document.getElementById('pagination');if(t<=1){pg.innerHTML='';return;}let h=`<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;for(let i=1;i<=t;i++){if(t>7&&i>2&&i<t-1&&Math.abs(i-currentPage)>1){if(i===3||i===t-2)h+=`<span class="pg-btn" style="cursor:default;opacity:.4">…</span>`;continue;}h+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;}h+=`<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===t?'disabled':''}>›</button>`;pg.innerHTML=h;}
function goPage(n){const p=parseInt(document.getElementById('perPage').value);const t=Math.ceil(filtered.length/p);if(n<1||n>t)return;currentPage=n;renderTable();}
function filterTable(){const q=document.getElementById('searchInput').value.trim().toLowerCase();filtered=q?allData.filter(r=>r.user.toLowerCase().includes(q)||r.email.toLowerCase().includes(q)||r.url.toLowerCase().includes(q)):[...allData];currentPage=1;renderTable();}
function toggleSidebar(){document.getElementById('adminSidebar').classList.toggle('collapsed');}
function toggleTheme(){document.body.classList.toggle('light-theme');}
function toggleUserMenu(){event.stopPropagation();document.getElementById('userPopup').classList.toggle('open');}
document.addEventListener('click',function(e){if(e.target.closest('.user-popup-item'))return;const p=document.getElementById('userPopup'),u=document.getElementById('sbUser');if(p&&!p.contains(e.target)&&!u.contains(e.target))p.classList.remove('open');});
loadData();
