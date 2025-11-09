// Basic state (demo only — NOT for production)
const STORE_KEY = 'wbftd_demo_user';
const PURCHASES_KEY = 'wbftd_demo_purchases';

const PRODUCTS = [
  {id:'imz-001', category:'imazing', name:'iMazing — Profile mẫu & hướng dẫn', price:50000, filename:'imazing-profile.txt', content:'Nội dung demo: Profile & hướng dẫn iMazing.'},
  {id:'imz-002', category:'imazing', name:'iMazing — Checklist backup nâng cao', price:30000, filename:'imazing-checklist.txt', content:'Nội dung demo: Checklist backup nâng cao.'},
  {id:'and-001', category:'android', name:'Android — Cấu hình ADB cơ bản', price:30000, filename:'android-adb.txt', content:'Nội dung demo: Cấu hình ADB cơ bản.'},
  {id:'and-002', category:'android', name:'Android — Script tự động hoá', price:45000, filename:'android-script.txt', content:'Nội dung demo: Script tự động hoá.'},
  {id:'ios-001', category:'ios', name:'iOS — Shortcut script mẫu', price:40000, filename:'ios-shortcut.txt', content:'Nội dung demo: Shortcut script mẫu.'},
  {id:'ios-002', category:'ios', name:'iOS — Hướng dẫn cấu hình AltStore', price:35000, filename:'ios-altstore.txt', content:'Nội dung demo: Hướng dẫn cấu hình AltStore.'},
];

// Utilities
const fmtVND = n => (n||0).toLocaleString('vi-VN') + '₫';

async function sha256(text){
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUser(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) }catch(e){return null} }
function setUser(u){ localStorage.setItem(STORE_KEY, JSON.stringify(u)); renderHeader(); }
function getPurchases(){ try{ return JSON.parse(localStorage.getItem(PURCHASES_KEY)) || [] }catch(e){return []} }
function setPurchases(list){ localStorage.setItem(PURCHASES_KEY, JSON.stringify(list)) }

function ensureAuth(callback){
  const u = getUser();
  if(!u){ openAuthModal('login'); return; }
  callback && callback(u);
}

function buyOrDownload(product){
  ensureAuth(user => {
    const purchases = getPurchases();
    const bought = purchases.find(p => p.id === product.id);
    if(bought){ return downloadProduct(product); }

    if((user.balance||0) < product.price){
      toast('Số dư không đủ. Vui lòng nạp tiền.', 'err'); 
      return;
    }
    user.balance -= product.price;
    setUser(user);
    purchases.push({id: product.id, at: Date.now(), price: product.price});
    setPurchases(purchases);
    downloadProduct(product);
    toast('Mua thành công. Bắt đầu tải...', 'ok');
  });
}

function downloadProduct(product){
  const blob = new Blob([product.content + '\n\n— DEMO FILE —'], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = product.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Header & Nav
function renderHeader(){
  const u = getUser();
  const path = location.pathname.split('/').pop() || 'index.html';
  const active = (href) => (href === path) ? 'active' : '';
  const el = document.getElementById('app-header');
  if(!el) return;
  el.innerHTML = `
    <header class="header">
      <nav class="nav container">
        <a class="brand" href="index.html">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="28" height="24" rx="6" stroke="currentColor"></rect>
            <path d="M6 10h20M6 16h12M6 22h8" stroke="currentColor"></path>
          </svg>
          <span class="brand-name">Web Bán File</span>
        </a>
        <div class="menu">
          <a class="${active('index.html')}" href="index.html">Trang chủ</a>
          <a class="${active('imazing.html')}" href="imazing.html">iMazing</a>
          <a class="${active('android.html')}" href="android.html">File Android</a>
          <a class="${active('ios.html')}" href="ios.html">File iOS</a>
          <a class="${active('nap-tien.html')}" href="nap-tien.html">Nạp tiền</a>
        </div>
        <div class="userbox">
          ${u ? `
            <span class="balance">Số dư: <strong>${fmtVND(u.balance||0)}</strong></span>
            <div class="dropdown">
              <button class="btn" id="btn-user">${u.email || u.phone || u.provider}</button>
              <div id="user-menu" class="dropdown-menu" hidden>
                <div class="card" style="min-width:220px">
                  <div class="row" style="justify-content:space-between">
                    <strong>Tài khoản</strong>
                    <span class="badge">${u.provider ? u.provider : 'local'}</span>
                  </div>
                  <div class="muted" style="font-size:14px;margin:6px 0">${u.email || u.phone || ''}</div>
                  <button class="btn" id="btn-purchases">Đơn đã mua</button>
                  <button class="btn" id="btn-logout">Đăng xuất</button>
                </div>
              </div>
            </div>
          ` : `
            <button class="btn btn-primary" id="btn-login">Đăng nhập</button>
          `}
        </div>
      </nav>
    </header>
  `;
  // attach handlers
  if(u){
    document.getElementById('btn-user').addEventListener('click', () => {
      const m = document.getElementById('user-menu');
      m.hidden = !m.hidden;
    });
    document.addEventListener('click', (e) => {
      const m = document.getElementById('user-menu');
      if(!m) return;
      const btn = document.getElementById('btn-user');
      if(!m.contains(e.target) && e.target !== btn){
        m.hidden = true;
      }
    });
    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem(STORE_KEY);
      toast('Đã đăng xuất.', 'ok');
      renderHeader();
    });
    document.getElementById('btn-purchases').addEventListener('click', () => {
      const purchases = getPurchases();
      if(!purchases.length) return toast('Bạn chưa mua file nào.', 'err');
      const lines = purchases.map(p => {
        const prod = PRODUCTS.find(x => x.id === p.id);
        return `• ${prod ? prod.name : p.id} — ${fmtVND(p.price)} — ${new Date(p.at).toLocaleString('vi-VN')}`;
      }).join('\n');
      alert('Đơn đã mua:\n\n' + lines);
    });
  } else {
    const b = document.getElementById('btn-login');
    if(b) b.addEventListener('click', () => openAuthModal('login'));
  }
}

// Toast messages
let toastTimer;
function toast(msg, type='ok'){
  clearTimeout(toastTimer);
  const el = document.createElement('div');
  el.className = `alert ${type==='ok'?'ok':'err'}`;
  el.textContent = msg;
  document.querySelector('.container')?.prepend(el);
  toastTimer = setTimeout(() => el.remove(), 3000);
}

// Auth modals
function openAuthModal(mode='login'){
  const root = document.getElementById('modals-root');
  if(!root) return;
  root.innerHTML = `
    <div class="modal-backdrop" id="mb">
      <div class="modal">
        <div class="row" style="justify-content:space-between">
          <h3>${mode==='login'?'Đăng nhập':'Đăng ký'}</h3>
          <button class="btn" id="close-modal">✕</button>
        </div>
        <div class="oauth">
          <button class="btn" id="oauth-google">
            ${iconGoogle()} Google
          </button>
          <button class="btn" id="oauth-facebook">
            ${iconFacebook()} Facebook
          </button>
        </div>
        ${mode==='login' ? loginForm() : registerForm()}
        <p class="muted">${mode==='login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
          <a href="#" id="switch-auth">${mode==='login' ? 'Đăng ký ngay' : 'Đăng nhập'}</a>
        </p>
        <div class="alert">* Demo: OAuth và OTP được mô phỏng. Bản sản xuất cần backend bảo mật, hash Argon2id, token JWT/Session, anti-CSRF.</div>
      </div>
    </div>
  `;
  document.getElementById('close-modal').onclick = closeModal;
  document.getElementById('mb').onclick = (e)=>{ if(e.target.id==='mb') closeModal(); };
  document.getElementById('switch-auth').onclick = (e)=>{ e.preventDefault(); openAuthModal(mode==='login'?'register':'login'); };
  document.getElementById('oauth-google').onclick = ()=> simulateOAuth('google');
  document.getElementById('oauth-facebook').onclick = ()=> simulateOAuth('facebook');
  if(mode==='login'){
    document.getElementById('form-login').onsubmit = onLoginSubmit;
    document.getElementById('btn-otp').onclick = openOtpDemo;
  }else{
    document.getElementById('form-register').onsubmit = onRegisterSubmit;
  }
}
function closeModal(){ const root = document.getElementById('modals-root'); if(root) root.innerHTML=''; }

function loginForm(){
  return `
    <form id="form-login" class="form">
      <label>Email hoặc SĐT
        <input required name="identity" placeholder="email@domain.com hoặc 09...">
      </label>
      <label>Mật khẩu
        <input required type="password" name="password" placeholder="••••••••">
      </label>
      <div class="row" style="justify-content:space-between">
        <button type="submit" class="btn btn-primary">Đăng nhập</button>
        <button type="button" class="btn" id="btn-otp">Đăng nhập bằng OTP</button>
      </div>
    </form>
  `;
}
function registerForm(){
  return `
    <form id="form-register" class="form">
      <label>Email
        <input required type="email" name="email" placeholder="email@domain.com">
      </label>
      <label>Số điện thoại
        <input required type="tel" name="phone" placeholder="09xxxxxxxx" pattern="0[0-9]{9}">
      </label>
      <label>Mật khẩu
        <input required type="password" name="password" minlength="8" placeholder="Tối thiểu 8 ký tự">
      </label>
      <label>Nhập lại mật khẩu
        <input required type="password" name="confirm" minlength="8" placeholder="Nhập lại">
      </label>
      <label style="display:flex;gap:8px;align-items:center">
        <input type="checkbox" required> Tôi đồng ý với Điều khoản dịch vụ
      </label>
      <button type="submit" class="btn btn-primary">Tạo tài khoản</button>
    </form>
  `;
}

async function onRegisterSubmit(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email').trim().toLowerCase();
  const phone = fd.get('phone').trim();
  const pass = fd.get('password');
  const confirm = fd.get('confirm');
  if(pass !== confirm){ return toast('Mật khẩu nhập lại không khớp.', 'err'); }
  const existing = getUser();
  if(existing && (existing.email===email || existing.phone===phone)){
    return toast('Tài khoản đã tồn tại (demo chỉ 1 người dùng cục bộ).', 'err');
  }
  const passwordHash = await sha256(pass);
  const user = { id: 'u-'+Date.now(), email, phone, passwordHash, balance: 0, provider: null };
  setUser(user);
  closeModal();
  toast('Tạo tài khoản thành công.', 'ok');
}

async function onLoginSubmit(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const identity = fd.get('identity').trim().toLowerCase();
  const passHash = await sha256(fd.get('password'));
  const u = getUser();
  if(!u){ return toast('Chưa có tài khoản cục bộ. Vui lòng đăng ký.', 'err'); }
  const match = (u.email===identity || u.phone===identity) && u.passwordHash===passHash;
  if(!match){ return toast('Thông tin đăng nhập không đúng.', 'err'); }
  setUser(u);
  closeModal();
  toast('Đăng nhập thành công.', 'ok');
}

function openOtpDemo(){
  const root = document.getElementById('modals-root');
  root.querySelector('.modal').innerHTML += `
    <div class="alert">Demo OTP: mã mặc định <strong>123456</strong>. Bản thật cần SMS/Email OTP.</div>
    <form id="form-otp" class="form">
      <label>Nhập mã OTP
        <input required name="otp" placeholder="123456" pattern="[0-9]{6}">
      </label>
      <button class="btn btn-primary" type="submit">Xác nhận</button>
    </form>
  `;
  document.getElementById('form-otp').onsubmit = (e)=>{
    e.preventDefault();
    const code = new FormData(e.target).get('otp');
    if(code==='123456'){
      let u = getUser();
      if(!u){
        u = { id:'otp-'+Date.now(), email:null, phone:'(OTP demo)', balance:0, provider:'otp-demo' };
      }
      setUser(u);
      closeModal();
      toast('Đăng nhập OTP demo thành công.', 'ok');
    } else {
      toast('OTP sai.', 'err');
    }
  }
}

function simulateOAuth(provider){
  const user = { id: provider+'-'+Date.now(), email: provider+'@demo.local', phone:null, balance: 0, provider };
  setUser(user);
  closeModal();
  toast('Đăng nhập qua ' + provider.toUpperCase() + ' (demo).', 'ok');
}

// Render products per page
function renderProducts(containerId, category){
  const wrap = document.getElementById(containerId);
  if(!wrap) return;
  const items = PRODUCTS.filter(p => p.category === category);
  wrap.innerHTML = items.map(p => `
    <div class="card product-card">
      <div class="badge">${category}</div>
      <div class="title">${p.name}</div>
      <div class="meta">ID: ${p.id}</div>
      <div class="row actions">
        <span class="price">${fmtVND(p.price)}</span>
        <button class="btn btn-primary" data-buy="${p.id}">Mua & tải</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-buy]').forEach(btn=>{
    btn.addEventListener('click', () => {
      const prod = PRODUCTS.find(x => x.id === btn.dataset.buy);
      buyOrDownload(prod);
    });
  });
}

function renderFeatured(){
  const wrap = document.getElementById('featured-grid');
  if(!wrap) return;
  const featured = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[4]].filter(Boolean);
  wrap.innerHTML = featured.map(p => `
    <div class="card product-card">
      <div class="badge">${p.category}</div>
      <div class="title">${p.name}</div>
      <div class="row actions">
        <span class="price">${fmtVND(p.price)}</span>
        <button class="btn btn-primary" data-buy="${p.id}">Mua & tải</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-buy]').forEach(btn=>{
    btn.addEventListener('click', () => {
      const prod = PRODUCTS.find(x => x.id === btn.dataset.buy);
      buyOrDownload(prod);
    });
  });
}

// Top up logic
function setupTopupPage(){
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(b=>b.addEventListener('click', ()=>{
    tabBtns.forEach(x=>x.classList.remove('active'));
    panels.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById('tab-'+b.dataset.tab).classList.add('active');
  }));

  const fCard = document.getElementById('form-card');
  if(fCard){
    fCard.addEventListener('submit', e=>{
      e.preventDefault();
      ensureAuth(u => {
        const fd = new FormData(fCard);
        const amount = parseInt(fd.get('amount'), 10) || 0;
        const serial = (fd.get('serial')||'').trim();
        const pin = (fd.get('pin')||'').trim();
        if(serial.length < 8 || pin.length < 8){
          return toast('Serial/Pin không hợp lệ (demo).', 'err');
        }
        u.balance = (u.balance||0) + amount;
        setUser(u);
        toast('Nạp thẻ thành công (demo) +'+fmtVND(amount), 'ok');
        fCard.reset();
      });
    });
  }

  const fBank = document.getElementById('form-bank');
  const box = document.getElementById('banking-instruction');
  if(fBank && box){
    fBank.addEventListener('submit', e=>{
      e.preventDefault();
      ensureAuth(u => {
        const fd = new FormData(fBank);
        const amount = parseInt(fd.get('amount'), 10) || 0;
        const bank = fd.get('bank');
        const code = 'TX' + Math.random().toString().slice(2,8).toUpperCase();
        box.hidden = false;
        box.innerHTML = `
          <h4>Hướng dẫn chuyển khoản (demo)</h4>
          <p>Ngân hàng: <strong>${bank.toUpperCase()}</strong> — Số tiền: <strong>${fmtVND(amount)}</strong></p>
          <p>Nội dung chuyển khoản: <strong>${code}</strong></p>
          <div class="row" style="gap:8px;margin-top:8px">
            <button class="btn" id="btn-confirm-paid">Xác nhận đã chuyển</button>
            <button class="btn" id="btn-cancel">Huỷ</button>
          </div>
        `;
        document.getElementById('btn-cancel').onclick = ()=>{ box.hidden = true; box.innerHTML=''; };
        document.getElementById('btn-confirm-paid').onclick = ()=>{
          u.balance = (u.balance||0) + amount;
          setUser(u);
          toast('Đã cộng số dư (demo) +'+fmtVND(amount), 'ok');
          fBank.reset();
          box.hidden = true;
          box.innerHTML='';
        };
      });
    });
  }
}

// Icons
function iconGoogle(){
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.602,6.053,29.084,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.86,21.355,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.602,6.053,29.084,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c4.93,0,9.418-1.888,12.837-4.961l-5.926-5.016C29.883,35.255,27.072,36,24,36 c-5.202,0-9.619-3.317-11.277-7.953l-6.534,5.033C9.594,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.1,5.6c0.001-0.001,0.002-0.001,0.003-0.002 l6.957,5.278C37.951,39.074,44,32.886,44,24C44,22.659,43.86,21.355,43.611,20.083z"/></svg>`;
}
function iconFacebook(){
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12.05C22 6.49 17.52 2 11.96 2S2 6.49 2 12.05c0 5 3.66 9.14 8.44 9.95v-7.03H7.9v-2.92h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.92h-2.3V22c4.78-.81 8.44-4.95 8.44-9.95Z"/></svg>`;
}

// Page router
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  const page = document.body.dataset.page;
  if(page==='home'){ renderFeatured(); }
  if(page==='imazing'){ renderProducts('imazing-grid', 'imazing'); }
  if(page==='android'){ renderProducts('android-grid', 'android'); }
  if(page==='ios'){ renderProducts('ios-grid', 'ios'); }
  if(page==='topup'){ setupTopupPage(); }
});
