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
