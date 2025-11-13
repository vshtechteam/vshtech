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

// Khởi tạo nền quả cầu
  let VSH_VANTA = null;
  window.addEventListener('DOMContentLoaded', () => {
    VSH_VANTA = VANTA.GLOBE({
      el: "#vsh-vanta",
      mouseControls: true,     // cho phép xoay theo chuột
      touchControls: true,     // cho phép xoay theo chạm
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x3a86ff,         // màu “lưới” quả cầu (xanh lam)
      backgroundColor: 0x0b0f14, // khớp nền trang bạn
      size: 1.00
    });

    // Tạo chuyển động "đi qua lại chậm" (nhẹ, không xung đột)
    let t = 0;
    (function drift(){
      t += 0.004; // giảm/tăng để chậm/nhanh hơn
      // mô phỏng chuyển động chuột rất nhẹ để quả cầu tự xoay
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: innerWidth/2 + Math.sin(t)*60,
        clientY: innerHeight/2 + Math.cos(t)*40
      }));
      requestAnimationFrame(drift);
    })();
  });

  // Dọn dẹp khi rời trang
  window.addEventListener('beforeunload', () => {
    try { VSH_VANTA && VSH_VANTA.destroy(); } catch(e){}
  });

