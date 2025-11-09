// vshtech/shared/site-brand.js
(function () {
  // === cấu hình nhanh ===
  const LOGO = '/shared/IMG_4623.png';  // ảnh bạn vừa up
  const BRAND = 'VSH TECH';
  const HOME  = '/';

  // ---- FAVICON (logo trên tab) ----
  // xóa favicon cũ (nếu có) để tránh trùng
  Array.from(document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'))
       .forEach(e => e.parentNode.removeChild(e));

  const head = document.head || document.getElementsByTagName('head')[0];
  [
    { rel:'icon',             href:LOGO, type:'image/png' },      // Chrome/Firefox
    { rel:'shortcut icon',    href:LOGO, type:'image/png' },      // IE/Legacy
    { rel:'apple-touch-icon', href:LOGO }                         // iOS Safari (tab & home screen)
  ].forEach(o => { const l=document.createElement('link'); Object.assign(l,o); head.appendChild(l); });

  // (tuỳ chọn) set theme-color cho thanh địa chỉ di động
  if (!document.querySelector('meta[name="theme-color"]')) {
    const m = document.createElement('meta');
    m.name = 'theme-color'; m.content = '#0b1220';
    head.appendChild(m);
  }

  // ---- HEADER (nếu không muốn, có thể xoá khối dưới) ----
  if (!document.getElementById('vsh-logo-bar')) {
    const css = `
      .vsh-bar{position:sticky;top:0;z-index:60;background:linear-gradient(180deg,rgba(12,18,32,.9),rgba(12,18,32,.75));
               backdrop-filter:saturate(1.2) blur(8px);border-bottom:1px solid rgba(255,255,255,.06)}
      .vsh-wrap{max-width:1200px;margin:0 auto;padding:0 16px}
      .vsh-row{height:56px;display:flex;align-items:center;justify-content:space-between;gap:12px}
      .vsh-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#eaf1ff}
      .vsh-logo{width:30px;height:30px;border-radius:10px;flex:0 0 30px;background:#0f1a2e url('${LOGO}') center/cover no-repeat;
                box-shadow:0 0 0 2px rgba(255,255,255,.06), 0 4px 14px rgba(0,0,0,.35)}
      .vsh-name{font-weight:900;letter-spacing:.2px}
      .vsh-dot{width:8px;height:8px;border-radius:999px;background:#22c55e;box-shadow:0 0 12px #22c55e}
      .vsh-tick{width:18px;height:18px;border-radius:999px;display:inline-grid;place-items:center;color:#fff;
                background:linear-gradient(145deg,#60a5fa,#2563eb);box-shadow:0 0 0 2px #0b1220,0 0 0 3px rgba(255,255,255,.9)}
      .vsh-tick:before{content:"";width:9px;height:6px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg)}
      @media (max-width:420px){ .vsh-name{display:none} }
    `;
    const style = document.createElement('style'); style.textContent = css; head.appendChild(style);

    const bar = document.createElement('header');
    bar.id = 'vsh-logo-bar';
    bar.className = 'vsh-bar';
    bar.innerHTML = `
      <div class="vsh-wrap"><div class="vsh-row">
        <a class="vsh-brand" href="${HOME}">
          <span class="vsh-logo" aria-hidden="true"></span>
          <span class="vsh-name"><span class="vsh-dot"></span>&nbsp;${BRAND}&nbsp;<span class="vsh-tick" title="Đã xác minh"></span></span>
        </a>
        <div style="min-width:12px"></div>
      </div></div>`;
    (document.body.firstChild) ? document.body.insertBefore(bar, document.body.firstChild)
                               : document.body.appendChild(bar);
  }
})();
