// vshtech/shared/site-head.js
(function () {
  // Ảnh avatar dùng chung cho toàn site
  const ICON = '/shared/IMG_4623.png?v=3';

  function add(tag, attrs) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }

  // Favicon
  add('link', { rel: 'icon', type: 'image/png', href: ICON });

  // iOS Add to Home Screen
  add('link', { rel: 'apple-touch-icon', sizes: '180x180', href: ICON });

  // (Tùy chọn) Màu thanh địa chỉ
  add('meta', { name: 'theme-color', content: '#0b1220' });

  // Lưu ý: bot share (FB/Zalo) KHÔNG chạy JS, nên nếu cần ảnh preview khi share,
  // hãy đặt <meta property="og:image"> tĩnh trong từng trang.
})();
