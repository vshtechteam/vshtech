// Cloudflare Worker to serve key.js without hosting the raw file on Pages.
// Usage:
// - Set secrets: KEY_JS_BASE64 (base64 of your key.js content), ACCESS_TOKEN (optional).
// - Set env var: ALLOWED_HOST (default: vshtech.online).
// - Attach route: https://vshtech.online/keyserver/key.js -> this worker.
// Client requests can include ?token=ACCESS_TOKEN if you want an extra gate.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/keyserver/key.js") {
      return new Response("Not Found", { status: 404 });
    }

    const allowedHost = (env.ALLOWED_HOST || "vshtech.online").toLowerCase();
    const referer = (request.headers.get("referer") || "").toLowerCase();
    const token = url.searchParams.get("token") || request.headers.get("x-access-token") || "";

    // Require either same-site referer or matching token if ACCESS_TOKEN is set.
    const requireToken = !!env.ACCESS_TOKEN;
    const refererOk = referer.includes(allowedHost);
    const tokenOk = !requireToken || token === env.ACCESS_TOKEN;

    if (!refererOk && !tokenOk) {
      return new Response("// forbidden\n", {
        status: 403,
        headers: {
          "Content-Type": "application/javascript; charset=UTF-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const realJs = env.KEY_JS_BASE64 ? atob(env.KEY_JS_BASE64) : "// missing KEY_JS_BASE64";
    return new Response(realJs, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=UTF-8",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
