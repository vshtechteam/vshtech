const STORE_KEY='wbftd_user';
const PURCHASES_KEY='wbftd_purchases';

const PRODUCTS=[
  {id:'imz-001',cat:'imazing',name:'iMazing — Profile & hướng dẫn',price:50000,filename:'imazing-profile.txt',content:'Nội dung iMazing'},
  {id:'imz-002',cat:'imazing',name:'iMazing — Checklist backup',price:30000,filename:'imazing-checklist.txt',content:'Checklist iMazing'},
  {id:'and-001',cat:'android',name:'Android — Cấu hình ADB',price:30000,filename:'android-adb.txt',content:'ADB config'},
  {id:'and-002',cat:'android',name:'Android — Script tự động',price:45000,filename:'android-script.txt',content:'Script tự động'},
  {id:'ios-001',cat:'ios',name:'iOS — Shortcut script',price:40000,filename:'ios-shortcut.txt',content:'Shortcut iOS'},
  {id:'ios-002',cat:'ios',name:'iOS — Hướng dẫn AltStore',price:35000,filename:'ios-altstore.txt',content:'Hướng dẫn AltStore'}
];

const fmtVND=n=>(n||0).toLocaleString('vi-VN')+'₫';
const byId=x=>document.getElementById(x);
const q=x=>document.querySelector(x);
const qa=x=>[...document.querySelectorAll(x)];

async function sha256(t){const d=new TextEncoder().encode(t);const h=await crypto.subtle.digest('SHA-256',d);return[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');}

function getUser(){try{return JSON.parse(localStorage.getItem(STORE_KEY))}catch(_){return null}}
function setUser(u){localStorage.setItem(STORE_KEY,JSON.stringify(u));renderUserCta();renderDrawerAuth();}
function getPurchases(){try{return JSON.parse(localStorage.getItem(PURCHASES_KEY))||[]}catch(_){return[]}}
function setPurchases(p){localStorage.setItem(PURCHASES_KEY,JSON.stringify(p))}

// Header user area
function renderUserCta(){
  const u=getUser();
  const el=byId('user-cta');
  if(!el) return;
  if(u){
    el.innerHTML=`<span class="badge balance">Số dư: <strong>${fmtVND(u.balance||0)}</strong></span>
    <div class="dropdown">
      <button class="btn" id="btn-user">${u.email||u.phone||u.provider}</button>
      <div class="dropdown-menu" id="menu-user" hidden>
        <div class="muted" style="margin:6px 0">${u.email||u.phone||''}</div>
        <button class="btn" id="btn-purchases">Đơn đã mua</button>
        <button class="btn" id="btn-logout">Đăng xuất</button>
      </div>
    </div>`;
    byId('btn-user').onclick=()=>{byId('menu-user').hidden=!byId('menu-user').hidden;};
    document.addEventListener('click',(e)=>{
      const d=q('.dropdown'); if(!d) return;
      if(!d.contains(e.target)) byId('menu-user').hidden=true;
    });
    byId('btn-purchases').onclick=()=>{
      const list=getPurchases();
      if(!list.length) return toast('Bạn chưa mua file nào','err');
      const lines=list.map(p=>{const pd=PRODUCTS.find(x=>x.id===p.id);return `• ${pd?pd.name:p.id} — ${fmtVND(p.price)} — ${new Date(p.at).toLocaleString('vi-VN')}`}).join('\n');
      alert('Đơn đã mua:\n\n'+lines);
    };
    byId('btn-logout').onclick=()=>{localStorage.removeItem(STORE_KEY);toast('Đã đăng xuất');renderUserCta();renderDrawerAuth();};
  }else{
    el.innerHTML=`<button class="btn btn-outline" id="btn-register">Đăng ký</button>
                  <button class="btn btn-primary" id="btn-login">Đăng nhập</button>`;
    byId('btn-login').onclick=()=>openAuthModal('login');
    byId('btn-register').onclick=()=>openAuthModal('register');
  }
}
function renderDrawerAuth(){
  const el=byId('drawer-auth'); if(!el) return; const u=getUser();
  if(u){el.innerHTML=`<div class="badge balance">Số dư: <strong>${fmtVND(u.balance||0)}</strong></div><a href="#" class="btn" id="drawer-logout">Đăng xuất</a>`; byId('drawer-logout').onclick=(e)=>{e.preventDefault(); localStorage.removeItem(STORE_KEY); toast('Đã đăng xuất'); renderUserCta(); renderDrawerAuth(); };}
  else{el.innerHTML=`<a href="#" class="btn btn-primary" id="drawer-login">Đăng nhập</a><a href="#" class="btn" id="drawer-register">Đăng ký</a>`; byId('drawer-login').onclick=(e)=>{e.preventDefault(); openAuthModal('login');}; byId('drawer-register').onclick=(e)=>{e.preventDefault(); openAuthModal('register');};}
}

// Drawer
function openDrawer(){byId('drawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function closeDrawer(){byId('drawer').setAttribute('aria-hidden','true');document.body.style.overflow='';}
function setupDrawer(){ const dr=byId('drawer'); if(!dr) return; byId('btn-drawer').onclick=openDrawer; byId('btn-close-drawer').onclick=closeDrawer; dr.onclick=(e)=>{ if(e.target.id==='drawer') closeDrawer(); }; qa('.acc-btn').forEach(b=>{b.onclick=()=>{const id='acc-'+b.dataset.acc; byId(id).classList.toggle('open');};});}

// Toast
let toastTimer; function toast(msg,type='ok'){ clearTimeout(toastTimer); const el=document.createElement('div'); el.className='toast '+(type==='ok'?'ok':'err'); el.textContent=msg; document.body.appendChild(el); toastTimer=setTimeout(()=>el.remove(),2800);}

// Auth modal
function openAuthModal(mode='login'){
  const root=byId('modals-root');
  root.innerHTML=`<div class="modal-backdrop" id="mb"><div class="modal">
    <div class="row"><h3>${mode==='login'?'Đăng nhập':'Đăng ký'}</h3><button class="icon-btn" id="close-modal"><span class="i i-x"></span></button></div>
    ${mode==='login'?loginForm():registerForm()}
    <div class="muted">${mode==='login'?'Chưa có tài khoản?':'Đã có tài khoản?'} <a href="#" id="switch-auth">${mode==='login'?'Đăng ký':'Đăng nhập'}</a></div>
  </div></div>`;
  byId('close-modal').onclick=closeModal; byId('mb').onclick=(e)=>{if(e.target.id==='mb') closeModal();};
  byId('switch-auth').onclick=(e)=>{e.preventDefault(); openAuthModal(mode==='login'?'register':'login');};
  if(mode==='login'){ byId('form-login').onsubmit=onLoginSubmit; byId('btn-otp').onclick=openOtp; } else { byId('form-register').onsubmit=onRegisterSubmit; }
}
function closeModal(){ byId('modals-root').innerHTML=''; }

function loginForm(){ return `<form id="form-login" class="form">
  <label>Email hoặc SĐT<input name="identity" required placeholder="email@domain.com hoặc 09..."></label>
  <label>Mật khẩu<input type="password" name="password" required></label>
  <div class="row"><button class="btn btn-primary" type="submit">Đăng nhập</button><button class="btn" type="button" id="btn-otp">Đăng nhập bằng OTP</button></div>
</form>`}
function registerForm(){ return `<form id="form-register" class="form">
  <label>Email<input type="email" name="email" required></label>
  <label>Số điện thoại<input type="tel" name="phone" required pattern="0[0-9]{9}"></label>
  <label>Mật khẩu<input type="password" name="password" minlength="8" required></label>
  <label>Nhập lại mật khẩu<input type="password" name="confirm" minlength="8" required></label>
  <button class="btn btn-primary" type="submit">Tạo tài khoản</button>
</form>`}
async function onRegisterSubmit(e){ e.preventDefault(); const f=new FormData(e.target); const email=f.get('email').trim().toLowerCase(); const phone=f.get('phone').trim(); const pass=f.get('password'); const confirm=f.get('confirm'); if(pass!==confirm) return toast('Mật khẩu nhập lại không khớp','err'); const user={id:'u-'+Date.now(),email,phone,passwordHash:await sha256(pass),balance:0,provider:null}; setUser(user); closeModal(); toast('Tạo tài khoản thành công'); }
async function onLoginSubmit(e){ e.preventDefault(); const f=new FormData(e.target); const identity=f.get('identity').trim().toLowerCase(); const passHash=await sha256(f.get('password')); const u=getUser(); if(!u) return toast('Chưa có tài khoản. Vui lòng đăng ký','err'); const ok=(u.email===identity||u.phone===identity)&&u.passwordHash===passHash; if(!ok) return toast('Thông tin đăng nhập không đúng','err'); setUser(u); closeModal(); toast('Đăng nhập thành công'); }
function openOtp(){ const m=q('.modal'); m.insertAdjacentHTML('beforeend',`<div class="note">OTP mặc định: <strong>123456</strong></div><form id="form-otp" class="form"><label>Nhập OTP<input name="otp" pattern="[0-9]{6}" required></label><button class="btn btn-primary">Xác nhận</button></form>`); byId('form-otp').onsubmit=(e)=>{ e.preventDefault(); const code=new FormData(e.target).get('otp'); if(code==='123456'){ let u=getUser(); if(!u) u={id:'otp-'+Date.now(),email:null,phone:'(OTP)',balance:0,provider:'otp'}; setUser(u); closeModal(); toast('Đăng nhập OTP thành công'); } else toast('OTP sai','err'); }; }

// Products & purchase
function ensureAuth(cb){ const u=getUser(); if(!u){ openAuthModal('login'); return; } cb&&cb(u); }
function buy(p){ ensureAuth(u=>{ if((u.balance||0)<p.price) return toast('Số dư không đủ','err'); u.balance-=p.price; setUser(u); const list=getPurchases(); list.push({id:p.id,price:p.price,at:Date.now()}); setPurchases(list); const blob=new Blob([p.content+'\n\n— FILE —'],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=p.filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000); toast('Mua & tải thành công'); }); }
function cardHtml(p){ return `<div class="card"><div class="meta">ID: ${p.id}</div><h3>${p.name}</h3><div class="actions"><span class="price">${fmtVND(p.price)}</span><button class="btn btn-primary" data-buy="${p.id}">Mua & tải</button></div></div>`; }
function renderCategory(gridId,cat){ const el=byId(gridId); if(!el) return; const items=PRODUCTS.filter(x=>x.cat===cat); el.innerHTML=items.map(cardHtml).join(''); el.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{ const p=PRODUCTS.find(x=>x.id===b.dataset.buy); buy(p); }); }
function renderFeatured(){ const wrap=byId('featured'); if(!wrap) return; const f=[PRODUCTS[0],PRODUCTS[2],PRODUCTS[4]].filter(Boolean); wrap.innerHTML=f.map(cardHtml).join(''); wrap.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{ const p=PRODUCTS.find(x=>x.id===b.dataset.buy); buy(p); }); }

// Nạp tiền
function setupTopupTabs(){ const btns=qa('.tab-btn'); const panels=qa('.tab-panel'); btns.forEach(b=>b.onclick=()=>{ btns.forEach(x=>x.classList.remove('active')); panels.forEach(x=>x.classList.remove('active')); b.classList.add('active'); byId('tab-'+b.dataset.tab).classList.add('active'); }); }
function setupCardTopup(){ const f=byId('form-card'); if(!f) return; f.onsubmit=(e)=>{ e.preventDefault(); ensureAuth(u=>{ const amount=parseInt(new FormData(f).get('amount'))||0; u.balance=(u.balance||0)+amount; setUser(u); toast('Nạp thành công +'+fmtVND(amount)); f.reset(); }); }; }
function setupBankTopup(){ const f=byId('form-bank'), box=byId('banking'); if(!f||!box) return; f.onsubmit=(e)=>{ e.preventDefault(); ensureAuth(u=>{ const fd=new FormData(f); const amount=parseInt(fd.get('amount'))||0; const bank=fd.get('bank'); const code='TX'+Math.random().toString().slice(2,8).toUpperCase(); box.hidden=false; box.innerHTML=`<div class="row" style="justify-content:space-between"><strong>Thông tin chuyển</strong><span class="badge">Mã: ${code}</span></div><div class="note">Ngân hàng: <strong>${bank.toUpperCase()}</strong> · Số tiền: <strong>${fmtVND(amount)}</strong></div><div class="row" style="gap:8px;margin-top:8px"><button class="btn" id="btn-paid">Xác nhận đã chuyển</button><button class="btn" id="btn-cancel">Huỷ</button></div>`; byId('btn-cancel').onclick=()=>{box.hidden=True;box.innerHTML='';}; byId('btn-paid').onclick=()=>{ u.balance=(u.balance||0)+amount; setUser(u); toast('Đã cộng số dư +'+fmtVND(amount)); f.reset(); box.hidden=true; box.innerHTML=''; }; }); }; }

document.addEventListener('DOMContentLoaded',()=>{
  // Drawer + auth controls
  const dr=byId('drawer'); if(dr){ byId('btn-drawer').onclick=()=>{dr.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';}; byId('btn-close-drawer').onclick=()=>{dr.setAttribute('aria-hidden','true'); document.body.style.overflow='';}; dr.onclick=(e)=>{ if(e.target.id==='drawer') {dr.setAttribute('aria-hidden','true'); document.body.style.overflow='';} }; }
  qa('.acc-btn').forEach(b=>b.onclick=()=>{byId('acc-'+b.dataset.acc).classList.toggle('open');});
  renderUserCta(); renderDrawerAuth();

  // Page routers
  const page=document.body.dataset.page;
  if(page==='home'){ renderFeatured(); }
  if(page==='imazing'){ renderCategory('grid-imazing','imazing'); }
  if(page==='android'){ renderCategory('grid-android','android'); }
  if(page==='ios'){ renderCategory('grid-ios','ios'); }
  if(page==='nap-tien'){ setupTopupTabs(); setupCardTopup(); setupBankTopup(); }
});
