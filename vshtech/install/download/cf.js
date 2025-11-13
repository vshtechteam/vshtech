
const BASE = '/install';
const FILE = `${BASE}/profiles/vpn.mobileconfig`;


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


document.getElementById('installBtn')?.addEventListener('click', ()=>{
  document.getElementById('progress')?.removeAttribute('hidden');
  
  location.assign(FILE);
  
  setTimeout(()=> location.assign(`${BASE}/thanks/`), 1600);
});


  let VSH_VANTA = null;
  window.addEventListener('DOMContentLoaded', () => {
    VSH_VANTA = VANTA.GLOBE({
      el: "#vsh-vanta",
      mouseControls: true,    
      touchControls: true,     
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x3a86ff,        
      backgroundColor: 0x0b0f14, 
      size: 1.00
    });

    
    let t = 0;
    (function drift(){
      t += 0.004; 
      
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientX: innerWidth/2 + Math.sin(t)*60,
        clientY: innerHeight/2 + Math.cos(t)*40
      }));
      requestAnimationFrame(drift);
    })();
  });

 
  window.addEventListener('beforeunload', () => {
    try { VSH_VANTA && VSH_VANTA.destroy(); } catch(e){}
  });

