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

// Gửi lại hồ sơ
const FILE = '/install/profiles/vpn.mobileconfig';
document.getElementById('retry')?.addEventListener('click', ()=>{
  location.assign(FILE);
  setTimeout(()=> location.reload(), 600);
});
window.__vshVanta = window.__vshVanta || null;

  function mountVanta(){
    // nếu đã có instance -> destroy trước khi tạo lại
    if (window.__vshVanta) {
      try { window.__vshVanta.destroy(); } catch(e){}
      window.__vshVanta = null;
    }
    window.__vshVanta = VANTA.GLOBE({
      el: "#vsh-vanta",
      mouseControls:true,
      touchControls:true,
      gyroControls:false,
      minHeight:200.00,
      minWidth:200.00,
      scale:1.00,
      scaleMobile:1.00,
      color:0x3a86ff,
      backgroundColor:0x0b0f14,
      size:1.00
    });

    // drift nhẹ để globe tự xoay (tuỳ chọn)
    let t = 0;
    cancelAnimationFrame(window.__vshDriftRaf||0);
    (function drift(){
      t += 0.003;
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: innerWidth/2 + Math.sin(t)*60,
        clientY: innerHeight/2 + Math.cos(t)*40
      }));
      window.__vshDriftRaf = requestAnimationFrame(drift);
    })();
  }

  // Chỉ cho phép mount đúng 1 lần mỗi lần load trang
  if (!document.body.dataset.vantaMounted) {
    document.body.dataset.vantaMounted = '1';
    window.addEventListener('DOMContentLoaded', mountVanta, { once: true });
  }

  // dọn dẹp khi rời trang
  window.addEventListener('beforeunload', ()=>{
    try { window.__vshVanta && window.__vshVanta.destroy(); } catch(e){}
    cancelAnimationFrame(window.__vshDriftRaf||0);
  });
