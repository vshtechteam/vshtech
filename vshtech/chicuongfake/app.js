  <script>
    (function(){const e=document.getElementById("particles-canvas");if(!e)return;const t=e.getContext("2d"),n=Math.min(window.devicePixelRatio||1,2);let a=0,o=0,i=[],l=0,s={x:-9999,y:-9999};const r={densityBase:.0001,maxSpeed:.35,size:[1.2,2.4],linkDist:110,linkAlpha:.12};function d(){const d=window.innerWidth,c=window.innerHeight;a=e.width=Math.floor(d*n);o=e.height=Math.floor(c*n);e.style.width=d+"px";e.style.height=c+"px";(function(){const e=Math.floor(a*o*r.densityBase/(n*n));i.length=0;for(let t=0;t<e;t++)i.push({x:Math.random()*a,y:Math.random()*o,vx:u(-r.maxSpeed,r.maxSpeed),vy:u(-r.maxSpeed,r.maxSpeed),r:u(r.size[0],r.size[1])*n})})()}function u(e,t){return e+Math.random()*(t-e)}function c(){t.clearRect(0,0,a,o);for(const e of i){e.x+=e.vx,e.y+=e.vy,(e.x<0||e.x>a)&&(e.vx*=-1),(e.y<0||e.y>o)&&(e.vy*=-1);const n=e.x-s.x,a=e.y-s.y,r=n*n+a*a;if(r<19600*n*n){const t=-.0008*n;e.vx+=t*n,e.vy+=t*a}t.beginPath(),t.arc(e.x,e.y,e.r,0,2*Math.PI),t.fillStyle="rgba(255,255,255,0.6)",t.fill()}for(let e=0;e<i.length;e++){const a=i[e];for(let o=e+1;o<i.length;o++){const e=i[o],l=a.x-e.x,s=a.y-e.y,d=Math.hypot(l,s);if(d<r.linkDist*n){const i=(1-d/(r.linkDist*n))*r.linkAlpha;t.strokeStyle=`rgba(124,242,211,${i})`,t.lineWidth=.7*n,t.beginPath(),t.moveTo(a.x,a.y),t.lineTo(e.x,e.y),t.stroke()}}}l=requestAnimationFrame(c)}function y(e){e.touches&&e.touches[0]?(s.x=e.touches[0].clientX*n,s.y=e.touches[0].clientY*n):(s.x=(null!=e.clientX?e.clientX:-9999)*n,s.y=(null!=e.clientY?e.clientY:-9999)*n)}function f(){s.x=s.y=-9999}window.addEventListener("resize",d,{passive:!0}),window.addEventListener("mousemove",y,{passive:!0}),window.addEventListener("touchmove",y,{passive:!0}),window.addEventListener("mouseleave",f,{passive:!0}),d(),cancelAnimationFrame(l),l=requestAnimationFrame(c)})();
    document.addEventListener("DOMContentLoaded",function(){
      const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
      const configToggle=q("#config-toggle"),luxToggle=q("#lux-toggle"),modeSelect=q("#mode-select"),dpiSelect=q("#dpi-select"),activateBtn=q("#activate-btn");
      const announce=q("#announce-bar"),announceClose=q("#announce-close"),menuBtn=q("#special-menu-btn"),menu=q("#special-menu"),backdrop=q("#modal-backdrop"),menuClose=q("#modal-close"),info=q("#modal-infobox"),infoClose=q("#infobox-close"),applyBtn=q("#modal-apply"),f1=q("#f-anti-shake"),f2=q("#f-aim-assist"),f3=q("#f-touch-boost"),f4=q("#f-pro-mode"),footer=q("#site-footer");
      const notice=q("#site-notice"),noticeList=q("#notice-list"),nClose=q("#notice-close"),nOk=q("#notice-ok"),n3h=q("#notice-3h"),nBackdrop=q("#notice-backdrop");
      const store={get(k,def){try{const v=localStorage.getItem(k);return v===null?def:JSON.parse(v)}catch(e){return def}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
      function restore(){const ce=store.get("config-enabled",false),le=store.get("lux-enabled",false),m=store.get("mode","muot-ma"),d=store.get("dpi","1.0");if(configToggle)configToggle.checked=!!ce;if(luxToggle)luxToggle.checked=!!le;if(modeSelect)modeSelect.value=m;if(dpiSelect)dpiSelect.value=d;applyMode(m);applyDpi(d);reflect();const a1=store.get("feat-anti-shake",false),a2=store.get("feat-aim-assist",false),a3=store.get("feat-touch-boost",false),a4=store.get("feat-pro-mode",false);if(f1)f1.checked=!!a1;if(f2)f2.checked=!!a2;if(f3)f3.checked=!!a3;if(f4)f4.checked=!!a4}
      function reflect(){qa(".toggle-switch").forEach(sw=>{const input=sw.querySelector(".toggle-input"),item=sw.closest(".function-item");if(!input||!item)return;item.dataset.state=input.checked?"on":"off";item.style.borderColor=input.checked?"rgba(34,197,94,.6)":"rgba(255,255,255,.06)"})}
      function applyMode(v){document.body.dataset.mode=v}
      function applyDpi(v){document.body.dataset.dpi=v}
      function label(v){if(v==="muot-ma")return"Mượt Mà";if(v==="cao-cap")return"Cao Cấp";if(v==="tieu-chuan")return"Tiêu Chuẩn";return v}
      function toast(message){let el=document.querySelector(".toast");if(!el){el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.setAttribute("aria-live","polite");document.body.appendChild(el)}el.textContent=message;el.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove("show"),2200)}
      function pulse(el){el.animate([{transform:"scale(1)"},{transform:"scale(1.03)"},{transform:"scale(1)"}],{duration:260,easing:"ease-out"})}
      function showBar(){announce&&announce.classList.remove("hidden")}
      function hideBar(){announce&&announce.classList.add("hidden");store.set("announcement-dismissed",true)}
      function openMenu(){menu&&menu.classList.remove("hidden");menu&&menu.setAttribute("aria-hidden","false");toast("Menu Đặc Biệt đã mở");if(!store.get("menuNoticeSeen",false)){openNotice();store.set("menuNoticeSeen",true)}}
      function closeMenu(){menu&&menu.classList.add("hidden");menu&&menu.setAttribute("aria-hidden","true")}
      function hideInfo(){info&&info.classList.add("hidden")}
      function setFooter(){const b64="QCAyMDI1IELhuqNuIHF1eeG7gW4gREVWIENISSBDVU9ORw==";function d(s){var t=atob(s),n=[];for(var i=0;i<t.length;i++)n.push("%"+("00"+t.charCodeAt(i).toString(16)).slice(-2));return decodeURIComponent(n.join(""))}if(footer)footer.textContent=d(b64)}
      function buildNotice(){const items=[{icon:"fa-gears",text:"Config Settings – Tối ưu hệ thống"},{icon:"fa-star",text:"Trợ Năng LUX – Độ mượt cảm ứng"},{icon:"fa-bullseye",text:"Hỗ trợ căn chỉnh mục tiêu"},{icon:"fa-hand-pointer",text:"Tăng tốc cảm ứng"},{icon:"fa-rocket",text:"Chế độ Pro"}];noticeList.innerHTML="";items.forEach(it=>{const li=document.createElement("li");li.className="notice-item";li.innerHTML=`<i class="fas ${it.icon}"></i><span>${it.text}</span>`;noticeList.appendChild(li)})}
      function openNotice(){buildNotice();notice.classList.remove("hidden");notice.setAttribute("aria-hidden","false")}
      function closeNotice(){notice.classList.add("hidden");notice.setAttribute("aria-hidden","true")}
      function closeNotice3h(){store.set("notice-until",Date.now()+3*60*60*1000);closeNotice()}
      function maybeShowNotice(){const until=store.get("notice-until",0);if(Date.now()>Number(until))openNotice()}
      if(configToggle)configToggle.addEventListener("change",()=>{store.set("config-enabled",configToggle.checked);reflect();toast(configToggle.checked?"Config Settings: ON":"Config Settings: OFF")});
      if(luxToggle)luxToggle.addEventListener("change",()=>{store.set("lux-enabled",luxToggle.checked);reflect();toast(luxToggle.checked?"Trợ Năng LUX: ON":"Trợ Năng LUX: OFF")});
      if(modeSelect)modeSelect.addEventListener("change",()=>{store.set("mode",modeSelect.value);applyMode(modeSelect.value);toast("Chế độ: "+label(modeSelect.value))});
      if(dpiSelect)dpiSelect.addEventListener("change",()=>{store.set("dpi",dpiSelect.value);applyDpi(dpiSelect.value);toast("DPI: "+dpiSelect.value+"x")});
      if(activateBtn)activateBtn.addEventListener("click",()=>{const s=["Config: "+(configToggle&&configToggle.checked?"ON":"OFF"),"LUX: "+(luxToggle&&luxToggle.checked?"ON":"OFF"),"Mode: "+label(modeSelect&&modeSelect.value),"DPI: "+(dpiSelect&&dpiSelect.value)+"x"].join(" • ");toast("DARG SENSITIVITY ✓  "+s);pulse(activateBtn)});
      if(announceClose)announceClose.addEventListener("click",hideBar);
      if(menuBtn)menuBtn.addEventListener("click",openMenu);
      if(backdrop)backdrop.addEventListener("click",closeMenu);
      if(menuClose)menuClose.addEventListener("click",closeMenu);
      if(infoClose)infoClose.addEventListener("click",hideInfo);
      if(applyBtn)applyBtn.addEventListener("click",()=>{store.set("feat-anti-shake",!!f1&&f1.checked);store.set("feat-aim-assist",!!f2&&f2.checked);store.set("feat-touch-boost",!!f3&&f3.checked);store.set("feat-pro-mode",!!f4&&f4.checked);toast("Đã áp dụng tuỳ chọn Menu Đặc Biệt");closeMenu()});
      if(nClose)nClose.addEventListener("click",closeNotice);
      if(nOk)nOk.addEventListener("click",closeNotice);
      if(n3h)n3h.addEventListener("click",closeNotice3h);
      if(nBackdrop)nBackdrop.addEventListener("click",closeNotice);
      if(!store.get("announcement-dismissed",false))showBar();
      setFooter();restore();maybeShowNotice();
    });
  </script>
<style id="fix-gap-only-functions">
#announce-bar.hidden,.announce.hidden{display:none!important}
.header + #announce-bar + .main-content,
.header + .main-content{margin-top:10px!important}
.main-content>.section:first-of-type{margin-top:0!important;padding-top:12px!important;display:flow-root}
.main-content>.section:first-of-type>*:first-child{margin-top:0!important}
.main-content>.section:first-of-type .section-title{margin-top:0!important;margin-bottom:10px!important;line-height:1.25}
.main-content>.section:first-of-type .function-item{margin-top:8px!important}
.main-content>.section:first-of-type .function-item:first-of-type{margin-top:0!important}
</style>

<script>
document.addEventListener("DOMContentLoaded",function(){
  var ann=document.getElementById("announce-bar")||document.querySelector(".announce");
  if(ann&&ann.classList.contains("hidden")) ann.style.display="none";
  var mc=document.querySelector(".main-content");
  if(mc){
    var first=mc.firstElementChild;
    if(first&&first.classList.contains("section")){
      first.style.marginTop="0";
      first.style.paddingTop="12px";
    }
  }
});
</script>
<script>
(function(){
  var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  var ctx=new AC(), vol=0.32;
  function chime(){
    if(ctx.state==="suspended") ctx.resume();
    var now=ctx.currentTime;
    function note(freq,dt,dur){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type="sine"; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
      var t0=now+dt, t1=t0+dur;
      g.gain.setValueAtTime(0,t0);
      g.gain.linearRampToValueAtTime(vol,t0+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,t1);
      o.start(t0); o.stop(t1+0.02);
    }
    note(1568,0.00,0.12);
    note(1976,0.08,0.12);
  }
  function bind(el,ev){ if(el) el.addEventListener(ev,chime,{passive:true}); }
  bind(document.querySelector("#config-toggle"),"change");
  bind(document.querySelector("#lux-toggle"),"change");
  bind(document.querySelector("#activate-btn"),"click");
  bind(document.querySelector("#modal-apply"),"click");
  document.querySelectorAll(".toggle-label,.btn-primary,.special-menu-btn").forEach(function(el){
    el.addEventListener("click",chime,{passive:true});
  });
})();
</script>
<script>
(function(){
  const API_BASE = 'https://botkey.vshtechteam.workers.dev';
  const BRAND_TITLE = 'VSH TECH API SERVER KEY';
  const TZ = 'Asia/Ho_Chi_Minh';
  const ALWAYS_PROMPT = false;
  const LS = { DEVICE:'vsh_license_device', KEY:'vsh_license_key' };
  let deviceId = localStorage.getItem(LS.DEVICE);
  if(!deviceId){
    deviceId = (crypto.randomUUID?.() || (Date.now().toString(36)+Math.random().toString(36).slice(2,10))).toUpperCase();
    localStorage.setItem(LS.DEVICE, deviceId);
  }
  const fmt = (ts)=> ts==null ? 'lifetime' :
    new Intl.DateTimeFormat('vi-VN',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(ts);
  async function post(url, data){
    const r = await fetch(API_BASE+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    return r.json().catch(()=>({ok:false,error:'PARSE_ERROR'}));
  }
  function ting(){
    try{
      const AC = new (window.AudioContext||window.webkitAudioContext)();
      const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime;
      o.type='sine'; o.frequency.value=1200;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(0.18,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t+0.17);
    }catch{}
  }

  // CSS (scope trong #vgGate)
  const css = `
  #vgGate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(8,10,15,.72);backdrop-filter:blur(6px)}
  #vgGate .vg-panel{width:min(620px,92vw);border:1px solid #2a2d3f;border-radius:16px;overflow:hidden;color:#e8e7ff;
    font-family:Inter,system-ui,Arial;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.018));box-shadow:0 24px 60px rgba(0,0,0,.55)}
  #vgGate .vg-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #2a2d3f}
  #vgGate .vg-brand{font-weight:900;letter-spacing:.3px;white-space:nowrap}
  #vgGate .vg-hd-rt{display:flex;gap:8px}
  #vgGate .vg-btn{padding:9px 14px;border-radius:10px;border:1px solid #3a3f56;background:#191f2a;color:#e8e7ff;cursor:pointer}
  #vgGate .vg-btn:hover{filter:brightness(1.08)}
  #vgGate .vg-btn--pri{background:#1e293b;border-color:#405075}
  #vgGate .vg-btn--ghost{background:#141924}
  #vgGate .vg-bd{padding:16px}
  #vgGate .vg-label{font-size:12px;color:#aab4d6;margin:0 0 6px 0}
  #vgGate .vg-field{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center}
  #vgGate .vg-input{padding:11px 12px;border-radius:10px;border:1px solid #3a3f56;background:#0c1017;color:#e8e7ff;width:100%}
  #vgGate .vg-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
  #vgGate .vg-msg{margin-top:12px;padding:12px;border-radius:12px;border:1px solid #2a2d3f;background:#0b1118;font-size:13px;line-height:1.45}
  #vgGate .vg-msg.ok{border-color:#2f9e44;background:#0d1a12;color:#b9ffd1}
  #vgGate .vg-msg.warn{border-color:#b8860b;background:#1b1607;color:#ffe9b0}
  #vgGate .vg-msg.err{border-color:#b02a37;background:#1a0f12;color:#ffd1d6}
  #vgGate .vg-foot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;color:#9fb0d0;font-size:12px}
  #vgGate details{margin-top:10px;border:1px dashed #2a2d3f;border-radius:12px;overflow:hidden}
  #vgGate summary{padding:10px 12px;cursor:pointer;list-style:none;background:#0b0f15}
  #vgGate summary::-webkit-details-marker{display:none}
  #vgGate .vg-pre{margin:0;padding:12px 12px 14px;background:#0b0f15;color:#bcd;max-height:220px;overflow:auto}
  #vgGate .vg-icon{display:inline-flex;align-items:center;gap:6px;padding:9px 12px;border-radius:10px;border:1px solid #3a3f56;background:#151a24;cursor:pointer}
  #vgGate .vg-icon svg{width:16px;height:16px;display:block}
  @media (max-width:520px){
    #vgGate .vg-field{grid-template-columns:1fr}
    #vgGate .vg-hd{flex-wrap:wrap}
  }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // DOM
  function $(sel, root=document){ return root.querySelector(sel); }
  function build(){
    let wrap = $('#vgGate');
    if(wrap) return wrap;
    wrap = document.createElement('div');
    wrap.id = 'vgGate';
    wrap.innerHTML = `
      <div class="vg-panel">
        <div class="vg-hd">
          <div class="vg-brand">${BRAND_TITLE}</div>
          <div class="vg-hd-rt">
            <button class="vg-btn vg-btn--ghost" id="vgReset" title="Nhập lại">Nhập lại</button>
          </div>
        </div>

        <div class="vg-bd">
          <div>
            <div class="vg-label">Mã Kích Hoạt</div>
            <div class="vg-field">
              <input id="vgKey" class="vg-input" type="text" placeholder="VSHTECH-XXXX-XXXX-XXXX" autocomplete="one-time-code" inputmode="latin">
              <button class="vg-icon" id="vgPasteKey" title="Dán">
                <svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v4h4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4h4Z" stroke="currentColor" stroke-width="1.6"/><path d="M9 2h6v3a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V2Z" stroke="currentColor" stroke-width="1.6"/></svg>
                <span>Dán</span>
              </button>
              <button class="vg-icon" id="vgDelKey" title="Delete">
                <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" stroke-width="1.6"/><path d="M10 11v7M14 11v7" stroke="currentColor" stroke-width="1.6"/></svg>
                <span>Delete</span>
              </button>
            </div>
          </div>

          <!-- Mục Mã Thiết Bị (hiển thị + sao chép) -->
          <div style="margin-top:12px">
            <div class="vg-label">Mã Thiết Bị</div>
            <div class="vg-field">
              <input id="vgDev" class="vg-input" type="text" readonly>
              <button class="vg-icon" id="vgCopyDev" title="Sao chép">
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 9h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6"/><path d="M7 15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.6"/></svg>
                <span>Sao chép</span>
              </button>
            </div>
          </div>

          <div class="vg-actions">
            <button class="vg-btn vg-btn--pri" id="vgCheck">Kiểm tra</button>
            <button class="vg-btn vg-btn--pri" id="vgActive">Kích hoạt (1 thiết bị)</button>
          </div>

          <div class="vg-msg" id="vgMsg">Sẵn sàng.</div>
          <details id="vgDtl" hidden>
            <summary>Chi tiết kỹ thuật</summary>
            <pre class="vg-pre" id="vgRaw"></pre>
          </details>

          <div class="vg-foot">
            <span id="vgSta">Chưa kích hoạt</span>
            <span></span>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    // Prefill
    const lastKey = localStorage.getItem(LS.KEY)||'';
    if(lastKey) $('#vgKey').value = lastKey;
    $('#vgDev').value = deviceId;

    // Handlers
    $('#vgPasteKey').onclick = pasteIntoKey;
    $('#vgDelKey').onclick   = deleteKeyLocal;
    $('#vgCopyDev').onclick  = ()=> copyToClipboard($('#vgDev').value.trim(), 'Đã sao chép Mã Thiết Bị.');
    $('#vgReset').onclick    = ()=> { localStorage.removeItem(LS.KEY); updateStatus(null); show(); };
    $('#vgCheck').onclick    = onCheck;
    $('#vgActive').onclick   = onActivate;

    return wrap;
  }

  function setMsg(type, html, raw){
    const box = document.querySelector('#vgMsg'); box.className = 'vg-msg '+(type||''); box.innerHTML = html; ting();
    const dtl = document.querySelector('#vgDtl'); const pre = document.querySelector('#vgRaw');
    if(raw){ dtl.hidden=false; pre.textContent = typeof raw==='string'?raw:JSON.stringify(raw,null,2); }
    else { dtl.hidden=true; pre.textContent=''; }
  }
  function updateStatus(data){
    const el = document.querySelector('#vgSta'); if(!el) return;
    if(!data){ el.textContent = 'Chưa kích hoạt'; return; }
    el.textContent = `Hết hạn: ${fmt(data.expiresAt)}`;
  }
  function copyToClipboard(text, okText){ navigator.clipboard?.writeText(text).then(()=> setMsg('ok', okText) ); }

  async function pasteIntoKey(){
    const inp = document.querySelector('#vgKey');
    try{
      const txt = await navigator.clipboard.readText();
      inp.value = (txt||'').trim();
      setMsg('ok','Đã dán vào ô Mã Kích Hoạt.');
    }catch{
      const txt = prompt('Dán Mã Kích Hoạt tại đây:','')||'';
      inp.value = txt.trim();
      setMsg('ok','Đã dán vào ô Mã Kích Hoạt.');
    }
    inp.focus();
  }
  function deleteKeyLocal(){
    const inp = document.querySelector('#vgKey');
    inp.value = '';
    localStorage.removeItem(LS.KEY);
    updateStatus(null);
    setMsg('ok','Đã xoá Mã Kích Hoạt khỏi thiết bị này.');
  }

  async function onCheck(){
    const key = document.querySelector('#vgKey').value.trim();
    if(!key) return setMsg('warn','Vui lòng nhập Mã Kích Hoạt.');
    setMsg('', 'Đang kiểm tra…');
    const j = await post('/api/verify',{key});
    if(j.ok){
      localStorage.setItem(LS.KEY,key);
      const d = j.data;
      updateStatus(d);
      setMsg('ok', `✔️ Hợp lệ<br>Hết hạn: <b>${fmt(d.expiresAt)}</b>`, j);
    }else{
      const map={EXPIRED:'⏳ Mã đã hết hạn.',REVOKED:'🛑 Mã đã bị thu hồi.',NOT_FOUND:'❌ Không tìm thấy mã.'};
      setMsg('err', map[(j.error||'').toUpperCase()]||('❌ '+(j.error||'Lỗi')), j);
    }
  }

  async function onActivate(){
    const key = document.querySelector('#vgKey').value.trim();
    if(!key) return setMsg('warn','Vui lòng nhập Mã Kích Hoạt.');
    setMsg('', 'Đang kích hoạt…');
    const j = await post('/api/activate',{key, deviceId});
    if(j.ok){
      localStorage.setItem(LS.KEY,key);
      const d=j.data;
      updateStatus(d);
      setMsg('ok', `✅ Kích hoạt thành công<br>Hết hạn: <b>${fmt(d.expiresAt)}</b>`, j);
      setTimeout(()=>{ hide(); }, 1200);
      window.dispatchEvent(new CustomEvent('vsh-license-change',{detail:{state:'activated', data:d}}));
    }else{
      const why=(j.error||'').toUpperCase();
      const map={
        BOUND_TO_ANOTHER_DEVICE:'🔒 Mã đã gắn với thiết bị khác.',
        EXPIRED:'⏳ Mã đã hết hạn.',
        REVOKED:'🛑 Mã đã bị thu hồi.',
        NOT_FOUND:'❌ Không tìm thấy mã.'
      };
      setMsg('err', map[why] || ('❌ '+(j.error||'Lỗi')), j);
      window.dispatchEvent(new CustomEvent('vsh-license-change',{detail:{state:'invalid', data:j}}));
    }
  }

  function show(){ build(); document.getElementById('vgGate').style.display='grid'; }
  function hide(){ const g=document.getElementById('vgGate'); g && (g.style.display='none'); }

  // Guard on load
  async function guardOnLoad(){
    if(ALWAYS_PROMPT){ show(); return; }
    const savedKey = localStorage.getItem(LS.KEY);
    if(!savedKey){ show(); return; }
    const v = await post('/api/verify',{ key:savedKey });
    if(!v.ok){ show(); return; }
    if(!v.data.deviceId || v.data.deviceId !== deviceId){ show(); return; }
    updateStatus(v.data);
    document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') guardOnLoad(); }, {once:true});
    setTimeout(()=>guardOnLoad(), 10*60*1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', guardOnLoad);
  else guardOnLoad();

  window.VSHKeyGate = { show, hide, reset(){ localStorage.removeItem(LS.KEY); show(); } };
})();
</script>
