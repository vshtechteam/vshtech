const PRODUCTS=[
  {id:'imz-001',cat:'iMazing',name:'iMazing — Profile & hướng dẫn',price:50000,filename:'imazing-profile.txt',content:'Nội dung iMazing'},
  {id:'and-001',cat:'Android',name:'Android — Cấu hình ADB',price:30000,filename:'android-adb.txt',content:'ADB config'},
  {id:'ios-001',cat:'iOS',name:'iOS — Shortcut script',price:40000,filename:'ios-shortcut.txt',content:'Shortcut iOS'}
];
const fmtVND=n=>(n||0).toLocaleString('vi-VN')+'₫';
function cardHtml(p){return `<div class="card"><span class="badge">${p.cat}</span><h3>${p.name}</h3><div class="actions"><span class="price">${fmtVND(p.price)}</span><button class="btn btn-primary" data-buy="${p.id}">Mua & tải</button></div></div>`;}
function renderFeatured(){const el=document.getElementById('featured'); if(!el) return; el.innerHTML=PRODUCTS.map(cardHtml).join(''); el.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(PRODUCTS.find(x=>x.id===b.dataset.buy)));}
function renderCategory(gridId,cat){const el=document.getElementById(gridId); if(!el) return; const list=PRODUCTS.filter(p=>p.cat.toLowerCase()===cat); el.innerHTML=list.map(cardHtml).join(''); el.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(PRODUCTS.find(x=>x.id===b.dataset.buy)));}
function buy(p){const blob=new Blob([p.content+'\n\n— FILE —'],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=p.filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
function setupTabs(){const btns=[...document.querySelectorAll('.tab-btn')];const panels=[...document.querySelectorAll('.tab-panel')];btns.forEach(b=>b.onclick=()=>{btns.forEach(x=>x.classList.remove('active'));panels.forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById('tab-'+b.dataset.tab).classList.add('active');});}
document.addEventListener('DOMContentLoaded',()=>{
  const d=document.getElementById('drawer'); if(d){document.getElementById('btn-drawer').onclick=()=>{d.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}; document.getElementById('btn-close-drawer').onclick=()=>{d.setAttribute('aria-hidden','true');document.body.style.overflow='';}; d.onclick=e=>{if(e.target.id==='drawer') d.setAttribute('aria-hidden','true');};}
  const page=document.body.dataset.page;
  if(page==='home'){renderFeatured();}
  if(page==='imazing'){renderCategory('grid-imazing','imazing');}
  if(page==='android'){renderCategory('grid-android','android');}
  if(page==='ios'){renderCategory('grid-ios','ios');}
  if(page==='nap-tien'){setupTabs();}
});
