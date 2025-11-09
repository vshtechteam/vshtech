export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 👉 Nếu gọi trực tiếp favicon / apple icon thì trả ảnh logo
    const LOGO = 'https://i.imgur.com/slbUBwc.png';
    if (url.pathname === '/favicon.ico' || url.pathname === '/apple-touch-icon.png') {
      const img = await fetch(LOGO, { cf: { cacheEverything: true, cacheTtl: 86400 } });
      // Trả về dưới dạng PNG vẫn OK cho phần lớn client
      return new Response(await img.arrayBuffer(), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' }
      });
    }

    // Phần còn lại giữ nguyên như bạn đang có:
    const resp = await env.ASSETS.fetch(request);
    const type = resp.headers.get('Content-Type') || '';
    if (!type.includes('text/html')) return resp;

    const SNIPPET = `/* (giữ nguyên đoạn script tiêm favicon/og:image mà mình đã gửi) */`;
    const rewriter = new HTMLRewriter().on('head', {
      element(el) { el.append('<script>'+SNIPPET+'</script>', { html: true }); }
    });
    return rewriter.transform(resp);
  }
};
