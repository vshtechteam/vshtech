
// ==== helper: nạp script nếu chưa có ====
function loadScript(src){ return new Promise((ok,err)=> {
  if ([...document.scripts].some(s=>s.src.includes(src))) return ok();
  const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=err; document.head.appendChild(s);
});}

// ==== đảm bảo có container và chỉ 1 cái ====
function ensureContainer(){
  let el = document.getElementById('vsh-vanta');
  if(!el){
    el = document.createElement('div');
    el.id = 'vsh-vanta';
    document.body.prepend(el);
  }
  const all = document.querySelectorAll('#vsh-vanta');
  for (let i=1;i<all.length;i++) all[i].remove();
  return el;
}

// ==== dựng lại Vanta 1 lần, phá cái cũ nếu có ====
async function mountVantaOnce(){
  // chặn chạy lặp
  if (window.__vshVantaMounting) return; window.__vshVantaMounting = true;

  // nạp three & vanta nếu thiếu
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js").catch(()=>{});
  await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js").catch(()=>{});

  const el = ensureContainer();

  // huỷ instance cũ (nếu trước đó có init)
  try{ window.__vshVanta && window.__vshVanta.destroy(); }catch(e){}
  cancelAnimationFrame(window.__vshDriftRaf||0);

  // init 1 quả cầu duy nhất
  if (window.VANTA && window.VANTA.GLOBE){
    window.__vshVanta = VANTA.GLOBE({
      el: el,
      mouseControls:true,
      touchControls:true,
      gyroControls:false,
      minHeight:200.00,
      minWidth:200.00,
      scale:1.00,
      scaleMobile:1.00,
      color:0x3a86ff,        // màu lưới (đổi tuỳ tone)
      backgroundColor:0x0b0f14,
      size:1.00
    });

    // drift chậm để globe tự xoay (tuỳ chọn)
    let t=0;
    (function drift(){
      t += 0.0035; // nhỏ hơn -> chậm hơn
      window.dispatchEvent(new MouseEvent('mousemove',{
        clientX: innerWidth/2 + Math.sin(t)*60,
        clientY: innerHeight/2 + Math.cos(t)*40
      }));
      window.__vshDriftRaf = requestAnimationFrame(drift);
    })();
  }

  window.__vshVantaMounting = false;
}

// ==== chạy sau cùng, đè mọi thứ cũ ====
(function boot(){
  const start = ()=> mountVantaOnce();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();

  // nếu trang SPA hoặc script cũ còn init lại, ta vẫn re-mount sau 1 nhịp
  setTimeout(mountVantaOnce, 300);  // đè sau các script cũ
})();
