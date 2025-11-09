// vshtech/shared/site-logo.js
(function () {
  // === CẤU HÌNH NHANH ===
  const LOGO  = '/shared/IMG_4623.png';   // ảnh bạn đã upload
  const BRAND = 'VSH TECH';               // chữ thương hiệu
  const LINK  = '/';                      // click vào về trang chủ

  // Nếu trang có <meta name="vsh-logo" content="off"> thì bỏ qua
  const meta = document.querySelector('meta[name="vsh-logo"]');
  if (meta && (meta.content || '').toLowerCase() === 'off') return;

  // Tránh chèn trùng
  if (document.getElementById('vsh-logo-bar')) return;

  // === CSS (namespaced, tránh xung đột) ===
  const css = `
  .vsh-container{max-width:1200px;margin:0 auto;padding:0 16px}
  .vsh-bar{
    position:sticky;top:0;z-index:60;
    background:linear-gradient(180deg,rgba(12,18,32,.9),rgba(12,18,32,.75));
    backdrop-filter:saturate(1.2) blur(8px);
    border-bottom:1px solid rgba(255,255,255,.06);
  }
  .vsh-row{height:56px;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .vsh-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#eaf1ff}
  .vsh-logo{
    width:30px;height:30px;border-radius:10px;flex:0 0 30px;
    background:#0f1a2e url('${LOGO}') center/cover no-repeat;
    box-shadow:0 0 0 2px rgba(255,255,255,.06), 0 4px 14px rgba(0,0,0,.35);
  }
  .vsh-name{font-weight:900;letter-spacing:.2px}
  .vsh-dot{width:8px;height:8px;border-radius:999px;background:#22c55e;box-shadow:0 0 12px #22c55e}
  .vsh-tick{
    width:18px;height:18px;border-radius:999px;display:inline-grid;place-items:center;
    color:#fff;background:linear-gradient(145deg,#60a5fa,#2563eb);
    box-shadow:0 0 0 2px #0b1220, 0 0 0 3px rgba(255,255,255,.9)
  }
  .vsh-tick:before{content:"";width:9px;height:6px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg)}
  @media (max-width:420px){ .vsh-name{display:none} } /* màn nhỏ chỉ hiện logo */
  `;

  const style = document.createElement('style');
  style.id = 'vsh-logo-style';
  style.textContent = css;
  document.head.appendChild(style);

  // === HTML header ===
  const bar = document.createElement('header');
  bar.id = 'vsh-logo-bar';
  bar.className = 'vsh-bar';
  bar.innerHTML = `
    <div class="vsh-container">
      <div class="vsh-row">
        <a class="vsh-brand" href="${LINK}">
          <span class="vsh-logo" aria-hidden="true"></span>
          <span class="vsh-name">
            <span class="vsh-dot" aria-hidden="true"></span>
            &nbsp;${BRAND}
            &nbsp;<span class="vsh-tick" title="Đã xác minh" aria-label="Đã xác minh"></span>
          </span>
        </a>
        <!-- chỗ trống bên phải, nếu mai mốt muốn thêm nút -->
        <div style="min-width:12px"></div>
      </div>
    </div>
  `;

  // Chèn lên đầu <body>
  const body = document.body;
  if (body.firstChild) body.insertBefore(bar, body.firstChild);
  else body.appendChild(bar);
})();
