// vshtech/shared/site-head.js
(function () {
  const ICON = 'https://i.imgur.com/H5YAlSa.png'; // ảnh avatar dùng cho mọi trang

  function add(tag, attrs) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }

  // Favicon (tab trình duyệt)
  add('link', { rel: 'icon', type: 'image/png', sizes: 'any', href: ICON });

  // iOS Add to Home Screen
  add('link', { rel: 'apple-touch-icon', href: ICON });

  // Ảnh preview khi share link (OG/Twitter)
  add('meta', { property: 'og:image', content: ICON });
  add('meta', { name: 'twitter:image', content: ICON });
})();
