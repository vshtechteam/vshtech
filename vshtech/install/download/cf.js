// Đổi tên file nếu bạn đặt khác (ví dụ '/profiles/8.mobileconfig')
const FILE = '/install/profiles/vpn.mobileconfig';

const btn  = document.getElementById('installBtn');
const prog = document.getElementById('progress');

// Chặn context menu & nhấn-giữ trên nút để hạn chế "tải tệp" không mong muốn
['contextmenu','touchstart'].forEach(evt=>{
  document.addEventListener(evt, e=>{
    const isBtn = e.target.closest && e.target.closest('#installBtn');
    if (!isBtn) return;

    if (evt === 'touchstart') {
      let t;
      const cancel = () => {
        clearTimeout(t);
        document.removeEventListener('touchend', cancel, {passive:true});
        document.removeEventListener('touchmove', cancel, {passive:true});
      };
      t = setTimeout(()=>{ e.preventDefault(); }, 400);
      document.addEventListener('touchend', cancel, {passive:true});
      document.addEventListener('touchmove', cancel, {passive:true});
    }
    if (evt === 'contextmenu') e.preventDefault();
  }, {passive:false});
});

if (btn) {
  btn.addEventListener('click', ()=>{
    if (prog) prog.hidden = false;
    // Điều hướng trực tiếp để iOS hiện "Cho phép"
    window.location.assign(FILE);
    // Sau ~1.6s chuyển sang trang cảm ơn/hướng dẫn
    setTimeout(()=>{ window.location.assign('install/thanks/'); }, 1600);
  });
}
