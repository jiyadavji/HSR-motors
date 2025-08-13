const navBtns = document.querySelectorAll('.nav-btn');
const screens = document.querySelectorAll('.screen');
const pageTitle = document.getElementById('page-title');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.dataset.target;
    screens.forEach(s => s.classList.toggle('active', s.id === id));
    pageTitle.textContent = btn.textContent.trim();
  });
});

const leadsData = [
  { name:'Rahul Mehta', phone:'+91 90000 11111', source:'Website',   status:'New',       owner:'Priya Sharma', created:'2025-08-10' },
  { name:'Priya Sharma', phone:'+91 90000 22222', source:'Google Ads',status:'Converted', owner:'Rahul Mehta',  created:'2025-08-09' },
  { name:'Ananya Gupta', phone:'+91 90000 33333', source:'Facebook',  status:'Contacted', owner:'Rahul Mehta',  created:'2025-08-08' },
  { name:'Karan Verma',  phone:'+91 90000 44444', source:'Referral',  status:'Lost',      owner:'Dev Patel',    created:'2025-08-07' },
  { name:'Dev Patel',    phone:'+91 90000 55555', source:'Event',     status:'Contacted', owner:'Priya Sharma', created:'2025-08-06' },
  { name:'Meera Nair',   phone:'+91 90000 66666', source:'Website',   status:'New',       owner:'Priya Sharma', created:'2025-08-06' },
  { name:'Rohan Das',    phone:'+91 90000 77777', source:'Referral',  status:'Converted', owner:'Rahul Mehta',  created:'2025-08-05' },
  { name:'Devika Rao',   phone:'+91 90000 88888', source:'Google Ads',status:'New',       owner:'Dev Patel',    created:'2025-08-05' },
  { name:'Aman Singh',   phone:'+91 90000 99999', source:'Facebook',  status:'Lost',      owner:'Priya Sharma', created:'2025-08-04' },
  { name:'Sneha Iyer',   phone:'+91 90000 10101', source:'Event',     status:'Converted', owner:'Rahul Mehta',  created:'2025-08-04' },
];

const aiTop = [
  { n:'Rahul Mehta', s:0.82, src:'Website' },
  { n:'Priya Sharma', s:0.79, src:'Google Ads' },
  { n:'Ananya Gupta', s:0.76, src:'Facebook' },
  { n:'Karan Verma',  s:0.71, src:'Referral' },
  { n:'Dev Patel',    s:0.69, src:'Event' },
];
document.getElementById('ai-top-list').innerHTML =
  aiTop.map(x=>`<li><strong>${x.n}</strong> • Score ${x.s} • Source: ${x.src}</li>`).join('');

document.getElementById('auto-insights').innerHTML = [
  '⚡ 3 high-value leads predicted to convert this week',
  '🔔 5 leads not contacted in 48h — schedule follow-ups',
  '🔄 New website leads auto-assigned to <b>Priya Sharma</b>',
  '📩 Auto-send WhatsApp nudge after missed call'
].map(t=>`<li>${t}</li>`).join('');

const tbody = document.querySelector('#leads-table tbody');
const statusSel = document.getElementById('f-status');
const sourceSel = document.getElementById('f-source');
const fromInp = document.getElementById('f-from');
const toInp = document.getElementById('f-to');
const applyBtn = document.getElementById('apply-filters');
const resetBtn = document.getElementById('reset-filters');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const globalSearch = document.getElementById('global-search');

let page = 1, perPage = 6;
let filtered = [...leadsData];

function formatDate(d){ return new Date(d).toLocaleDateString('en-IN', {year:'numeric', month:'short', day:'2-digit'}); }

function chip(status){
  const map = { New:'info', Contacted:'info', Converted:'good', Lost:'bad' };
  const cls = map[status] || 'info';
  return `<span class="chip ${cls}">${status}</span>`;
}

function applyFilters(){
  const q = (globalSearch.value || '').toLowerCase();
  filtered = leadsData.filter(x=>{
    const hit = !q || Object.values(x).join(' ').toLowerCase().includes(q);
    const sOk = !statusSel.value || x.status === statusSel.value;
    const srcOk = !sourceSel.value || x.source === sourceSel.value;
    const fromOk = !fromInp.value || new Date(x.created) >= new Date(fromInp.value);
    const toOk = !toInp.value || new Date(x.created) <= new Date(toInp.value);
    return hit && sOk && srcOk && fromOk && toOk;
  });
  page = 1;
  renderTable();
}

function renderTable(){
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  page = Math.min(page, totalPages);
  const start = (page-1)*perPage;
  const rows = filtered.slice(start, start+perPage).map(x=>(
    `<tr>
      <td><a href="#" class="link lead-link" data-name="${x.name}">${x.name}</a></td>
      <td>${x.phone}</td>
      <td>${x.source}</td>
      <td>${chip(x.status)}</td>
      <td>${x.owner}</td>
      <td>${formatDate(x.created)}</td>
    </tr>`
  )).join('');
  tbody.innerHTML = rows || `<tr><td colspan="6" style="text-align:center; color:var(--sub)">No results</td></tr>`;
  pageInfo.textContent = `Page ${page} of ${totalPages}`;
  prevBtn.disabled = page<=1; nextBtn.disabled = page>=totalPages;

  document.querySelectorAll('.lead-link').forEach(a=>{
    a.addEventListener('click',(e)=>{
      e.preventDefault();
      showDetails(a.dataset.name);
    });
  });
}

applyBtn.addEventListener('click', applyFilters);
resetBtn.addEventListener('click', ()=>{
  statusSel.value = ''; sourceSel.value=''; fromInp.value=''; toInp.value=''; globalSearch.value='';
  applyFilters();
});
globalSearch.addEventListener('input', applyFilters);
prevBtn.addEventListener('click', ()=>{ page=Math.max(1, page-1); renderTable(); });
nextBtn.addEventListener('click', ()=>{ page=page+1; renderTable(); });

renderTable();

document.getElementById('export-btn').addEventListener('click', ()=>{
  const headers = ['Lead Name','Contact','Source','Status','Owner','Created'];
  const csv = [headers.join(',')].concat(
    filtered.map(x=>[x.name,x.phone,x.source,x.status,x.owner,x.created].join(','))
  ).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'leads_export.csv'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('add-lead-btn').addEventListener('click', ()=>{
  const n = `New Lead ${Math.floor(Math.random()*1000)}`;
  leadsData.unshift({ name:n, phone:'+91 90000 00000', source:'Website', status:'New', owner:'Auto Assign', created:new Date().toISOString().slice(0,10) });
  applyFilters();
  document.getElementById('kpi-total').textContent = Number(document.getElementById('kpi-total').textContent)+1;
});

function showDetails(name){
  const lead = leadsData.find(l=>l.name===name) || leadsData[0];
  document.getElementById('d-name').textContent = lead.name;
  document.getElementById('d-phone').textContent = lead.phone;
  document.getElementById('d-email').textContent = (lead.name.split(' ')[0] || 'lead').toLowerCase() + '@example.com';
  document.getElementById('d-source').textContent = lead.source;
  document.getElementById('d-owner').textContent = lead.owner;
  const st = document.getElementById('d-status');
  st.textContent = lead.status;
  st.className = 'chip ' + ({Converted:'good', Lost:'bad', Contacted:'info', New:'info'}[lead.status] || 'info');

  const score = lead.status==='Converted' ? 0.9 : lead.status==='Contacted' ? 0.72 : lead.status==='New' ? 0.55 : 0.2;
  document.getElementById('gauge-fill').style.width = (score*100)+'%';
  document.getElementById('gauge-text').textContent = Math.round(score*100)+'%';

  document.getElementById('ai-reasons').innerHTML = [
    '• Viewed pricing page 3×',
    '• Replied on WhatsApp within 1h',
    '• Engaged with 2 emails last 48h'
  ].map(x=>`<li>${x}</li>`).join('');

  document.getElementById('timeline').innerHTML = [
    `<li><b>Missed Call</b> — Yesterday 4:12 PM</li>`,
    `<li><b>Email Sent</b> — Yesterday 10:05 AM</li>`,
    `<li><b>Lead Created</b> — ${new Date(lead.created).toLocaleDateString('en-IN',{month:'short', day:'2-digit', year:'numeric'})}</li>`
  ].join('');

  navBtns.forEach(b=>b.classList.remove('active'));
  document.querySelector('.nav-btn[data-target="details"]').classList.add('active');
  screens.forEach(s=>s.classList.toggle('active', s.id==='details'));
  pageTitle.textContent = 'Lead Details';
}

function makeCharts(){
  const trendCtx = document.getElementById('trendChart');
  const srcCtx   = document.getElementById('sourceChart');

  new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        label:'Leads',
        data:[18,22,15,25,20,10,12],
        tension:.35,
        fill:true
      }]
    },
    options: {
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ color:'#162235' }, ticks:{ color:'#9fb0c2' } },
        y:{ grid:{ color:'#162235' }, ticks:{ color:'#9fb0c2' } }
      }
    }
  });

  new Chart(srcCtx, {
    type:'doughnut',
    data:{
      labels:['Website','Google Ads','Facebook','Referral','Event'],
      datasets:[{ data:[32,28,18,12,10] }]
    },
    options:{
      plugins:{ legend:{ position:'bottom', labels:{ color:'#e8ecf3' } } },
      cutout:'58%'
    }
  });
}
document.addEventListener('DOMContentLoaded', makeCharts);

document.getElementById('rule-btn')?.addEventListener('click', ()=>{
  alert('Rule editor is not implemented in this demo.');
});
