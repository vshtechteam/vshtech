(function initProgress(){
  const fill = document.getElementById('scrollFill');
  const update = ()=>{
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max>0 ? Math.min(100, Math.max(0, (scrollY||0)/max*100)) : 0;
    if(fill) fill.style.width = pct + '%';
  };
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update);
  update();
})();

const FILE = '/install/profiles/vpn.mobileconfig';
const retryBtn = document.getElementById('retry');

if(retryBtn){
  retryBtn.addEventListener('click', ()=>{
    retryBtn.classList.add('is-loading');
    retryBtn.setAttribute('disabled','disabled');
    retryBtn.textContent = '\u0110ang g\u1EEDi l\u1EA1i\u2026';
    location.assign(FILE);
    setTimeout(()=> location.reload(), 900);
  });
}
