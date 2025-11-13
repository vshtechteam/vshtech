// ===== cấu hình đường dẫn =====
const BASE = '/install';
const FILE = `${BASE}/profiles/vpn.mobileconfig`;

// progress bar
(function(){
  const f = document.getElementById('scrollFill');
  const upd = ()=> {
    const y = window.scrollY||0, dh = document.documentElement.scrollHeight - innerHeight;
    f.style.width = (dh>0 ? Math.min(100, Math.max(0, y/dh*100)) : 0) + '%';
  };
  addEventListener('scroll', upd, {passive:true});
  addEventListener('resize', upd);
  upd();
})();

// chống nhấn-giữ & context menu trên nút
['contextmenu','touchstart'].forEach(evt=>{
  document.addEventListener(evt, e=>{
    const isBtn = e.target.closest && e.target.closest('#installBtn'); if(!isBtn) return;
    if(evt==='touchstart'){
      let t; const cancel=()=>{clearTimeout(t);removeEventListener('touchend',cancel,{passive:true});removeEventListener('touchmove',cancel,{passive:true});};
      t=setTimeout(()=>{e.preventDefault();},400);
      addEventListener('touchend',cancel,{passive:true});
      addEventListener('touchmove',cancel,{passive:true});
    }
    if(evt==='contextmenu') e.preventDefault();
  }, {passive:false});
});

// click => mở hồ sơ + chuyển thanks
document.getElementById('installBtn')?.addEventListener('click', ()=>{
  document.getElementById('progress')?.removeAttribute('hidden');
  // Điều hướng trực tiếp để iOS bật "Cho phép"
  location.assign(FILE);
  // Sau ~1.6s sang trang cảm ơn/hướng dẫn
  setTimeout(()=> location.assign(`${BASE}/thanks/`), 1600);
});
