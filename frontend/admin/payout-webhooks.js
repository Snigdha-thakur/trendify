let allData = [], filtered = [], currentPage = 1;
const fmt = d => d ? new Date(d).toLocaleString('en-IN') : '—';
const copyText = (t,b) => navigator.clipboard.writeText(t).then(()=>{b.textContent='✓';setTimeout(()=>b.textContent='⧉',1200)});
const SUPABASE_URL = 'https://hzukzpxelruvdmporrak.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWt6cHhlbHJ1dmRtcG9ycmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjA5MjgsImV4cCI6MjA5NTMzNjkyOH0.9EQ7E6LKZc1lceSuy1h-jEX0QVkFifeBVjHqyHEAF3M';
const getToken = () => { try { return JSON.parse(localStorage.getItem('trendify_session')).access_token; } catch { return ANON_KEY; } };

async function loadData() {
  const [hooks, users] = await Promise.all([AdminAPI.getPayoutWebhooks(), AdminAPI.getUsers()]);
  const uMap = {}; users.forEach(u => uMap[u.id] = {name:u.name||'—',email:u.email||'—',phone:u.phone||'—'});
  allData = hooks.map(r => ({
    id: r.id,
    name: (uMap[r.user_id]||{}).name||'—',
    phone: (uMap[r.user_id]||{}).phone||'—',
    email: (uMap[r.user_id]||{}).email||'—',
    url: r.webhook_url||'—',
    active: !!r.is_active,
    date: fmt(r.created_at),
  }));
  filtered = [...allData]; renderTable();
}

async function toggleActive(id, val) {
  await fetch(`${SUPABASE_URL}/rest/v1/payout_webhooks?id=eq.${id}`, {
    method: 'PATCH',
    headers: {'apikey':ANON_KEY,'Authorization':`Bearer ${getToken()}`,'Content-Type':'application/json'},
    body: JSON.stringify({is_active: val}),
  });
  const item = allData.find(r=>r.id===id);
  if (item) item.active = val;
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
      <td style="font-weight:700;color:var(--white)">${r.name}</td>
      <td style="font-family:var(--f-mono);font-size:12px">${r.phone}</td>
      <td style="color:var(--smoke)">${r.email}</td>
      <td style="color:var(--violet);font-family:var(--f-mono);font-size:12px">${r.url}</td>
      <td><label class="dp-toggle"><input type="checkbox" ${r.active?'checked':''} onchange="toggleActive('${r.id}',this.checked)"/><span class="dp-toggle-slider"></span></label></td>
      <td style="font-family:var(--f-mono);font-size:12px;white-space:nowrap;color:var(--smoke)">${r.date}</td>
      <td><button class="action-icon-btn" onclick="copyText('${r.url}',this)" title="Copy URL">⧉</button></td>
    </tr>`).join('');
  }
  renderPagination(totalPages);
}
function renderPagination(t){const pg=document.getElementById('pagination');if(t<=1){pg.innerHTML='';return;}let h=`<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;for(let i=1;i<=t;i++){h+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;}h+=`<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===t?'disabled':''}>›</button>`;pg.innerHTML=h;}
function goPage(n){const p=parseInt(document.getElementById('perPage').value);const t=Math.ceil(filtered.length/p);if(n<1||n>t)return;currentPage=n;renderTable();}
function filterTable(){const q=document.getElementById('searchInput').value.trim().toLowerCase();filtered=q?allData.filter(r=>r.name.toLowerCase().includes(q)||r.email.toLowerCase().includes(q)||r.url.toLowerCase().includes(q)):[...allData];currentPage=1;renderTable();}
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
window.copyText = copyText;
window.toggleActive = toggleActive;