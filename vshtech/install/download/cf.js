const BASE = '/install';
const FILE = `${BASE}/profiles/vpn.mobileconfig`;

(function initProgress(){
  const fill = document.getElementById('scrollFill');
  const update = ()=>{
    if(!fill) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max>0 ? Math.min(100, Math.max(0, (scrollY||0)/max*100)) : 0;
    fill.style.width = pct + '%';
  };
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update);
  update();
})();

const installBtn = document.getElementById('installBtn');
const progressMsg = document.getElementById('progress');

if(installBtn){
  ['contextmenu','touchstart'].forEach(evt=>{
    installBtn.addEventListener(evt, e=>{
      if(evt==='contextmenu') e.preventDefault();
      if(evt==='touchstart'){
        let timer;
        const cancel = ()=>{clearTimeout(timer);removeEventListener('touchend',cancel,{passive:true});removeEventListener('touchmove',cancel,{passive:true});};
        timer = setTimeout(()=>e.preventDefault(),350);
        addEventListener('touchend',cancel,{passive:true});
        addEventListener('touchmove',cancel,{passive:true});
      }
    }, {passive:false});
  });

  installBtn.addEventListener('click', ()=>{
    installBtn.classList.add('is-loading');
    installBtn.setAttribute('disabled','disabled');
    const strong = installBtn.querySelector('strong');
    if(strong) strong.textContent = '\u0110ang g\u1EEDi c\u1EA5u h\u00ECnh\u2026';
    if(progressMsg) progressMsg.removeAttribute('hidden');

    location.assign(FILE);
    setTimeout(()=> location.assign(`${BASE}/thanks/`), 1800);
  });
}

let VSH_VANTA = null;
window.addEventListener('DOMContentLoaded', () => {
  try{
    VSH_VANTA = VANTA.GLOBE({
      el: '#vsh-vanta',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      color: 0x4da3ff,
      color2: 0x47f1c1,
      size: 1.2,
      backgroundColor: 0x03060c
    });
  }catch(err){
    console.warn('Vanta init failed', err);
  }
});

window.addEventListener('beforeunload', () => {
  try{ VSH_VANTA && VSH_VANTA.destroy(); }catch(e){/* noop */}
});
