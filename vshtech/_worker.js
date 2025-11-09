// vshtech/_worker.js
export default {
  async fetch(request, env, ctx) {
    // phục vụ static assets trước
    const resp = await env.ASSETS.fetch(request);

    // chỉ chèn script cho HTML
    const type = resp.headers.get('Content-Type') || '';
    if (!type.includes('text/html')) return resp;

    const SNIPPET = `
    (function(){
      var LOGO  = 'https://i.imgur.com/slbUBwc.png';   // ảnh avatar/logo của bạn
      var THEME = '#0b1220';

      var head = document.head;
      function mk(tag, attrs){
        var el = document.createElement(tag);
        for (var k in attrs){ if(k==='text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
        head.appendChild(el); return el;
      }
      function del(sel){ document.querySelectorAll(sel).forEach(function(el){ el.remove(); }); }

      // dọn các thẻ cũ để tránh xung đột
      del('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="mask-icon"],link[rel="manifest"]');
      del('meta[name="theme-color"],meta[property^="og:"],meta[name^="twitter:"]');

      // favicon & apple-touch-icon
      mk('link',{rel:'preload',as:'image',href:LOGO});
      mk('link',{rel:'icon',type:'image/png',sizes:'32x32',href:LOGO});
      mk('link',{rel:'icon',type:'image/png',sizes:'192x192',href:LOGO});
      mk('link',{rel:'apple-touch-icon',href:LOGO});
      mk('link',{rel:'mask-icon',href:LOGO,color:'#22c55e'});
      mk('meta',{name:'theme-color',content:THEME});

      // OpenGraph/Twitter (share mạng XH)
      mk('meta',{property:'og:site_name',content:'VSH TECH'});
      mk('meta',{property:'og:title',content:document.title||'VSH TECH'});
      mk('meta',{property:'og:image',content:LOGO});
      mk('meta',{property:'og:image:width',content:'1200'});
      mk('meta',{property:'og:image:height',content:'630'});
      mk('meta',{name:'twitter:card',content:'summary_large_image'});

      // Manifest tạm thời để có icon PWA
      try{
        var manifest = {
          name:'VSH TECH',
          short_name:'VSH TECH',
          icons:[
            {src:LOGO,sizes:'192x192',type:'image/png'},
            {src:LOGO,sizes:'512x512',type:'image/png'}
          ],
          theme_color:THEME,
          background_color:THEME,
          display:'standalone'
        };
        var blob = new Blob([JSON.stringify(manifest)], {type:'application/manifest+json'});
        mk('link',{rel:'manifest',href:URL.createObjectURL(blob)});
      }catch(e){}

      // CSS var để bạn dùng làm avatar UI nếu muốn
      document.documentElement.style.setProperty('--logo-img','url("'+LOGO+'")');
      if(!document.getElementById('vsh-brand-style')){
        var st=document.createElement('style'); st.id='vsh-brand-style';
        st.textContent='.brandRow{display:flex;align-items:center;gap:8px}.brandAvatar{width:28px;height:28px;border-radius:999px;background:var(--logo-img) center/cover no-repeat;box-shadow:0 0 0 2px rgba(255,255,255,.06)}';
        head.appendChild(st);
      }
    })();`;

    // chèn SNIPPET vào cuối <head>
    const rewriter = new HTMLRewriter().on('head', {
      element(el) { el.append(`<script>${SNIPPET}</script>`, { html: true }); }
    });

    return rewriter.transform(resp);
  }
};
