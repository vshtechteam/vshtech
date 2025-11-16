// Particles background
(function(){
  const canvas=document.getElementById("particles-canvas"); if(!canvas) return;
  const ctx=canvas.getContext("2d"), dpr=Math.min(window.devicePixelRatio||1,2);
  let W=0,H=0, particles=[], raf=0, cursor={x:-9999,y:-9999};
  const conf={densityBase:.0001,maxSpeed:.35,size:[1.2,2.4],linkDist:110,linkAlpha:.12};

  function rand(a,b){return a+Math.random()*(b-a)}
  function resize(){
    const w=window.innerWidth, h=window.innerHeight;
    W=canvas.width=Math.floor(w*dpr); H=canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+"px"; canvas.style.height=h+"px";
    const n=Math.floor(W*H*conf.densityBase/(dpr*dpr));
    particles.length=0;
    for(let i=0;i<n;i++){
      particles.push({x:Math.random()*W,y:Math.random()*H,vx:rand(-conf.maxSpeed,conf.maxSpeed),vy:rand(-conf.maxSpeed,conf.maxSpeed),r:rand(conf.size[0],conf.size[1])*dpr});
    }
  }
  function step(){
    ctx.clearRect(0,0,W,H);
    for(const p of particles){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      const dx=p.x-cursor.x, dy=p.y-cursor.y, dd=dx*dx+dy*dy;
      if(dd<19600*dpr*dpr){const ax=-.0008*dx; p.vx+=ax*dx; p.vy+=ax*dy;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,2*Math.PI); ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.fill();
    }
    for(let i=0;i<particles.length;i++){
      const a=particles[i];
      for(let j=i+1;j<particles.length;j++){
        const b=particles[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
        if(d<conf.linkDist*dpr){
          const alpha=(1-d/(conf.linkDist*dpr))*conf.linkAlpha;
          ctx.strokeStyle=`rgba(124,242,211,${alpha})`; ctx.lineWidth=.7*dpr;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    raf=requestAnimationFrame(step);
  }
  function move(e){
    if(e.touches&&e.touches[0]){cursor.x=e.touches[0].clientX*dpr; cursor.y=e.touches[0].clientY*dpr;}
    else{cursor.x=(e.clientX??-9999)*dpr; cursor.y=(e.clientY??-9999)*dpr;}
  }
  function leave(){cursor.x=cursor.y=-9999}

  window.addEventListener("resize",resize,{passive:true});
  window.addEventListener("mousemove",move,{passive:true});
  window.addEventListener("touchmove",move,{passive:true});
  window.addEventListener("mouseleave",leave,{passive:true});
  resize(); cancelAnimationFrame(raf); raf=requestAnimationFrame(step);
})();

// App UI
document.addEventListener("DOMContentLoaded",function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  const configToggle=$("#config-toggle"), luxToggle=$("#lux-toggle"), modeSelect=$("#mode-select"), dpiSelect=$("#dpi-select"), activateBtn=$("#activate-btn");
  const announce=$("#announce-bar"), announceClose=$("#announce-close");
  const menuBtn=$("#special-menu-btn"), menu=$("#special-menu"), backdrop=$("#modal-backdrop"), menuClose=$("#modal-close"), info=$("#modal-infobox"), infoClose=$("#infobox-close"), applyBtn=$("#modal-apply");
  const f1=$("#f-anti-shake"), f2=$("#f-aim-assist"), f3=$("#f-touch-boost"), f4=$("#f-pro-mode");
  const footer=$("#site-footer");

  const notice=$("#site-notice"), noticeList=$("#notice-list"), nClose=$("#notice-close"), nOk=$("#notice-ok"), n3h=$("#notice-3h"), nBackdrop=$("#notice-backdrop");

  const store={
    get(k,def){try{const v=localStorage.getItem(k);return v===null?def:JSON.parse(v)}catch(e){return def}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };

  // toast
  function toast(msg){
    let el=document.querySelector(".toast");
    if(!el){el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.setAttribute("aria-live","polite");document.body.appendChild(el)}
    el.textContent=msg; el.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove("show"),2200);
  }
  function pulse(el){el&&el.animate([{transform:"scale(1)"},{transform:"scale(1.03)"},{transform:"scale(1)"}],{duration:260,easing:"ease-out"})}

  // chime sound
  (function(){
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    const ctx=new AC(), vol=0.32;
    function chime(){
      if(ctx.state==="suspended") ctx.resume();
      const now=ctx.currentTime;
      function note(freq,dt,dur){
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.type="sine"; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
        const t0=now+dt, t1=t0+dur;
        g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t1);
        o.start(t0); o.stop(t1+0.02);
      }
      note(1568,0.00,0.12); note(1976,0.08,0.12);
    }
    function bind(el,ev){ if(el) el.addEventListener(ev,chime,{passive:true}); }
    bind(configToggle,"change"); bind(luxToggle,"change"); bind(activateBtn,"click"); bind(applyBtn,"click");
    $$(".toggle-label,.btn-primary,.special-menu-btn").forEach(el=>el.addEventListener("click",chime,{passive:true}));
  })();

  // state + reflect
  function reflect(){
    $$(".toggle-switch").forEach(sw=>{
      const input=sw.querySelector(".toggle-input"), item=sw.closest(".function-item");
      if(!input||!item) return;
      item.dataset.state=input.checked?"on":"off";
      item.style.borderColor=input.checked?"rgba(34,197,94,.6)":"rgba(255,255,255,.06)";
    });
  }
  function applyMode(v){document.body.dataset.mode=v}
  function applyDpi(v){document.body.dataset.dpi=v}
  function label(v){if(v==="muot-ma")return"Mượt Mà"; if(v==="cao-cap")return"Cao Cấp"; if(v==="tieu-chuan")return"Tiêu Chuẩn"; return v}

  function restore(){
    const ce=store.get("config-enabled",false), le=store.get("lux-enabled",false), m=store.get("mode","muot-ma"), d=store.get("dpi","1.0");
    if(configToggle) configToggle.checked=!!ce;
    if(luxToggle) luxToggle.checked=!!le;
    if(modeSelect) modeSelect.value=m;
    if(dpiSelect) dpiSelect.value=d;
    applyMode(m); applyDpi(d); reflect();

    const a1=store.get("feat-anti-shake",false),a2=store.get("feat-aim-assist",false),a3=store.get("feat-touch-boost",false),a4=store.get("feat-pro-mode",false);
    if(f1) f1.checked=!!a1; if(f2) f2.checked=!!a2; if(f3) f3.checked=!!a3; if(f4) f4.checked=!!a4;
  }

  // announce bar
  function showBar(){announce&&announce.classList.remove("hidden")}
  function hideBar(){announce&&announce.classList.add("hidden"); store.set("announcement-dismissed",true)}

  // footer (Base64)
  function setFooter(){
    const b64="QCAyMDI1IELhuqNuIHF1eeG7gW4gREVWIENISSBDVU9ORw==";
    function dec(s){const bin=atob(s), arr=[]; for(let i=0;i<bin.length;i++) arr.push("%"+("00"+bin.charCodeAt(i).toString(16)).slice(-2)); return decodeURIComponent(arr.join("")); }
    if(footer) footer.textContent=dec(b64);
  }

  // notice popup khi mở menu
  function buildNotice(){
    const items=[
      {icon:"fa-gears",text:"Config Settings – Tối ưu hệ thống"},
      {icon:"fa-star",text:"Trợ Năng LUX – Độ mượt cảm ứng"},
      {icon:"fa-bullseye",text:"Hỗ trợ căn chỉnh mục tiêu"},
      {icon:"fa-hand-pointer",text:"Tăng tốc cảm ứng"},
      {icon:"fa-rocket",text:"Chế độ Pro"}
    ];
    noticeList.innerHTML="";
    items.forEach(it=>{
      const li=document.createElement("li");
      li.className="notice-item";
      li.innerHTML=`<i class="fas ${it.icon}"></i><span>${it.text}</span>`;
      noticeList.appendChild(li);
    });
  }
  function openNotice(){buildNotice(); notice.classList.remove("hidden"); notice.setAttribute("aria-hidden","false")}
  function closeNotice(){notice.classList.add("hidden"); notice.setAttribute("aria-hidden","true")}
  function closeNotice3h(){store.set("notice-until",Date.now()+3*60*60*1000); closeNotice()}
  function maybeShowNotice(){const until=store.get("notice-until",0); if(Date.now()>Number(until)) openNotice()}

  // menu open/close
  function openMenu(){menu&&menu.classList.remove("hidden"); menu&&menu.setAttribute("aria-hidden","false"); toast("Menu Đặc Biệt đã mở"); if(!store.get("menuNoticeSeen",false)){openNotice(); store.set("menuNoticeSeen",true)}}
  function closeMenu(){menu&&menu.classList.add("hidden"); menu&&menu.setAttribute("aria-hidden","true")}
  function hideInfo(){info&&info.classList.add("hidden")}

  // events
  if(configToggle) configToggle.addEventListener("change",()=>{store.set("config-enabled",configToggle.checked); reflect(); toast(configToggle.checked?"Config Settings: ON":"Config Settings: OFF")});
  if(luxToggle)    luxToggle.addEventListener("change",()=>{store.set("lux-enabled",luxToggle.checked); reflect(); toast(luxToggle.checked?"Trợ Năng LUX: ON":"Trợ Năng LUX: OFF")});
  if(modeSelect)   modeSelect.addEventListener("change",()=>{store.set("mode",modeSelect.value); applyMode(modeSelect.value); toast("Chế độ: "+label(modeSelect.value))});
  if(dpiSelect)    dpiSelect.addEventListener("change",()=>{store.set("dpi",dpiSelect.value); applyDpi(dpiSelect.value); toast("DPI: "+dpiSelect.value+"x")});
  if(activateBtn)  activateBtn.addEventListener("click",()=>{
    const s=[
      "Config: "+(configToggle&&configToggle.checked?"ON":"OFF"),
      "LUX: "+(luxToggle&&luxToggle.checked?"ON":"OFF"),
      "Mode: "+label(modeSelect&&modeSelect.value),
      "DPI: "+(dpiSelect&&dpiSelect.value)+"x"
    ].join(" • ");
    toast("DARG SENSITIVITY ✓  "+s); pulse(activateBtn);
  });

  if(announceClose) announceClose.addEventListener("click",hideBar);
  if(menuBtn)       menuBtn.addEventListener("click",openMenu);
  if(backdrop)      backdrop.addEventListener("click",closeMenu);
  if(menuClose)     menuClose.addEventListener("click",closeMenu);
  if(infoClose)     infoClose.addEventListener("click",hideInfo);
  if(applyBtn)      applyBtn.addEventListener("click",()=>{store.set("feat-anti-shake",!!f1&&f1.checked);store.set("feat-aim-assist",!!f2&&f2.checked);store.set("feat-touch-boost",!!f3&&f3.checked);store.set("feat-pro-mode",!!f4&&f4.checked); toast("Đã áp dụng tuỳ chọn Menu Đặc Biệt"); closeMenu()});

  if(nClose)   nClose.addEventListener("click",closeNotice);
  if(nOk)      nOk.addEventListener("click",closeNotice);
  if(n3h)      n3h.addEventListener("click",closeNotice3h);
  if(nBackdrop)nBackdrop.addEventListener("click",closeNotice);

  // fix gap chỉ khu vực CHỨC NĂNG và ẩn hoàn toàn announce khi đã hidden
  (function(){
    const ann=document.getElementById("announce-bar")||document.querySelector(".announce");
    if(ann&&ann.classList.contains("hidden")) ann.style.display="none";
    const mc=document.querySelector(".main-content");
    if(mc){
      const first=mc.firstElementChild;
      if(first&&first.classList.contains("section")){
        first.style.marginTop="0"; first.style.paddingTop="12px";
      }
    }
  })();

  if(!store.get("announcement-dismissed",false)) showBar();
  setFooter(); restore(); maybeShowNotice();
});





(function(){
  function ensureKeyGateButton(){
    var header=document.querySelector(".header");
    if(!header) return;

    // Tạo nhóm actions bên phải nếu chưa có
    var actions=header.querySelector(".header-actions");
    if(!actions){
      actions=document.createElement("div");
      actions.className="header-actions";
      // Di chuyển nút "Menu Đặc Biệt" vào nhóm
      var menuBtn=document.getElementById("special-menu-btn");
      if(menuBtn) actions.appendChild(menuBtn);
      header.appendChild(actions);
    }

    // Nếu đã có nút Nhập Key thì thôi
    if(document.getElementById("btn-key-gate")) return;

    // Tạo nút Nhập Key
    var keyBtn=document.createElement("button");
    keyBtn.id="btn-key-gate";
    keyBtn.className="special-menu-btn";
    keyBtn.innerHTML='<i class="fas fa-key"></i><span>Nhập Key</span>';
    keyBtn.addEventListener("click",function(){
      if(window.VSHKeyGate && typeof window.VSHKeyGate.show==="function"){
        window.VSHKeyGate.show();
      }else{
        alert("Module Key chưa sẵn sàng. Kiểm tra app.js (phần SCR API KEY GATE).");
      }
    },{passive:true});
    actions.appendChild(keyBtn);
  }

  // Phím tắt Ctrl/⌘ + K để mở gate
  window.addEventListener("keydown",function(e){
    var k=(e.key||"").toLowerCase();
    if((e.ctrlKey||e.metaKey) && k==="k"){
      e.preventDefault();
      if(window.VSHKeyGate && window.VSHKeyGate.show) window.VSHKeyGate.show();
    }
  });

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ensureKeyGateButton);
  else ensureKeyGateButton();
})();

(function(){
  // Chờ gate build rồi mới bind
  function bindDraftSave(){
    var inp=document.getElementById("vgKey");
    if(!inp){ setTimeout(bindDraftSave,200); return; }
    inp.addEventListener("input",function(){
      try{ localStorage.setItem("vsh_license_key", JSON.stringify(inp.value.trim())); }catch(e){}
    });
  }
  bindDraftSave();
})();
(function(){
  function openGate(){ if(window.VSHKeyGate&&window.VSHKeyGate.show) window.VSHKeyGate.show(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",openGate);
  else openGate();
})();
(function(){
  function S(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function off(){
    var keys=["config-enabled","lux-enabled","feat-anti-shake","feat-aim-assist","feat-touch-boost","feat-pro-mode"];
    for(var i=0;i<keys.length;i++) S(keys[i],false);
  }
  function reflect(){
    var a=document.querySelector("#config-toggle"),b=document.querySelector("#lux-toggle");
    if(a) a.checked=false; if(b) b.checked=false;
    ["#f-anti-shake","#f-aim-assist","#f-touch-boost","#f-pro-mode"].forEach(function(s){var el=document.querySelector(s); if(el) el.checked=false;});
    document.querySelectorAll(".toggle-switch").forEach(function(sw){
      var i=sw.querySelector(".toggle-input"), it=sw.closest(".function-item");
      if(!i||!it) return; it.dataset.state=i.checked?"on":"off"; it.style.borderColor=i.checked?"rgba(34,197,94,.6)":"rgba(255,255,255,.06)";
    });
  }
  window.addEventListener("pagehide",off);
  window.addEventListener("beforeunload",off);
  document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="hidden") off(); });
  window.addEventListener("pageshow",function(e){ if(e.persisted) reflect(); });
})();




(function(){
  /* ==== CẤU HÌNH NHANH ==== */
  var FORCE_SHOW_ON_START = false; // -> true nếu muốn luôn mở gate khi vào app
  var OFF_KEYS = ["config-enabled","lux-enabled","feat-anti-shake","feat-aim-assist","feat-touch-boost","feat-pro-mode"];
  var LS = { KEY: "vsh_license_key" };

  /* ==== ẨN API (không lộ host/path) ==== */
  function ub(s){ s = s.replace(/[^A-Za-z0-9+/=]/g,''); return atob(s.split('').reverse().join('')); }
  var HOST = "2VGZuMncltmcvdnLtFWZ0h2YlRHazZnL5V2a09mY";           // rev(base64("botkey.vshtechteam.workers.dev"))
  var VFY  = "=knZpJXZ29SawF2L";                                   // rev(base64("/api/verify"))
  var ACT  = "==QZ0FmdpR3Yh9SawF2L";                               // rev(base64("/api/activate"))
  var API_BASE = (location.protocol||"https:").replace(/:.*/,"")+"://"+ub(HOST);
  function post(p, body){
    return fetch(API_BASE+ub(p), {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    }).then(r=>r.json()).catch(()=>({ok:false,error:"NET"}));
  }

  /* ==== TẮT CHỨC NĂNG + CẬP NHẬT UI ==== */
  function offAll(){
    try{ OFF_KEYS.forEach(k=>localStorage.setItem(k,"false")); }catch(e){}
    try{
      ["#config-toggle","#lux-toggle","#f-anti-shake","#f-aim-assist","#f-touch-boost","#f-pro-mode"].forEach(sel=>{
        var el=document.querySelector(sel); if(el) el.checked=false;
      });
      document.querySelectorAll(".toggle-switch").forEach(sw=>{
        var i=sw.querySelector(".toggle-input"), it=sw.closest(".function-item");
        if(!i||!it) return;
        it.dataset.state = i.checked ? "on" : "off";
        it.style.borderColor = i.checked ? "rgba(34,197,94,.6)" : "rgba(255,255,255,.06)";
      });
    }catch(e){}
  }

  /* ==== MỞ GATE NHẬP KEY ==== */
  function insistGate(msg){
    function open(){
      if(window.VSHKeyGate && typeof window.VSHKeyGate.show==="function"){
        window.VSHKeyGate.show();
        try{ if(msg && typeof window.setMsg==="function") setMsg("warn", msg); }catch(e){}
        return true;
      }
      return false;
    }
    if(!open()){
      var iv=setInterval(function(){ if(open()) clearInterval(iv); },200);
      setTimeout(()=>clearInterval(iv),8000);
    }
  }

  /* ==== WATCH HẾT HẠN ==== */
  var expTimer=null;
  function toTs(x){
    if(x==null) return null;
    if(typeof x==="number") return x<1e12?x*1000:x;
    var p=Date.parse(x); return isFinite(p)?p: null;
  }
  function hitExpired(){
    offAll();
    insistGate("⏳ Key đã hết hạn — vui lòng nhập key mới.");
  }
  function watchExpiry(expiresAt){
    if(expTimer){ clearTimeout(expTimer); expTimer=null; }
    var t=toTs(expiresAt); if(!t) return;           // lifetime or invalid => không đặt timer
    var ms=t - Date.now();
    if(ms<=0){ hitExpired(); return; }
    expTimer=setTimeout(hitExpired, ms+1000);
  }

  /* ==== VERIFY KEY ĐÃ LƯU ==== */
  async function verifySavedKey(){
    var raw=null;
    try{ raw = JSON.parse(localStorage.getItem(LS.KEY)||'""'); }catch(e){}
    var key = (typeof raw==="string") ? raw.trim() : (raw||"").toString().trim();
    if(!key){ insistGate("Vui lòng nhập key để tiếp tục."); return; }

    var v = await post(VFY, {key:key});
    if(!v || !v.ok || !v.data){
      offAll();
      insistGate("Key không hợp lệ hoặc đã hết hạn. Vui lòng nhập lại.");
      return;
    }
    watchExpiry(v.data && v.data.expiresAt);
  }

  /* ==== BIND THOÁT APP -> TẮT CHỨC NĂNG ==== */
  function bindExitOff(){
    var off=offAll;
    window.addEventListener("pagehide",off);
    window.addEventListener("beforeunload",off);
    document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="hidden") off(); });
    // Khi quay lại từ BFCache
    window.addEventListener("pageshow",function(e){ if(e.persisted) off(); });
  }

  /* ==== KHỞI TẠO ==== */
  function init(){
    bindExitOff();
    if(FORCE_SHOW_ON_START){ insistGate(); } else { verifySavedKey(); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();


(function(){
  var AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;

  // Dùng 1 AudioContext duy nhất để tránh xung đột
  var ctx = window.__ting_ctx || new AC(); window.__ting_ctx = ctx;
  var VOL = 0.32; // chỉnh âm lượng tại đây (0.0 → 1.0)

  function note(freq, t0, dur){
    var o = ctx.createOscillator(), g = ctx.createGain(), t1 = t0 + dur;
    o.type = "sine"; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(VOL, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t1);
    o.start(t0); o.stop(t1 + 0.02);
  }
  function chime(){
    if(ctx.state === "suspended" && ctx.resume) ctx.resume();
    var now = ctx.currentTime;
    note(1568, now,      0.12);
    note(1976, now+0.08, 0.12);
  }

  // Mở khoá audio cho iOS/Safari (cần 1 gesture)
  function unlock(){ if(ctx.state==="suspended" && ctx.resume) ctx.resume();
    document.removeEventListener("touchstart", unlock, true);
    document.removeEventListener("click", unlock, true);
  }
  document.addEventListener("touchstart", unlock, true);
  document.addEventListener("click", unlock, true);

  // Gắn âm bằng cơ chế ủy quyền (không đè handler hiện có)
  var clickSel = [
    ".special-menu-btn",".btn-primary","#activate-btn","#modal-apply",
    ".announce-close","#modal-close","#notice-ok","#notice-3h","#notice-close",
    "#vgCheck","#vgActive","#vgPasteKey","#vgDelKey","#vgCopyDev","#vgReset",
    "#btn-key-gate"
  ];
  var changeSel = [
    "#config-toggle","#lux-toggle","#f-anti-shake","#f-aim-assist","#f-touch-boost","#f-pro-mode"
  ];

  document.addEventListener("click", function(e){
    for(var i=0;i<clickSel.length;i++){
      if(e.target.closest && e.target.closest(clickSel[i])){ chime(); break; }
    }
  }, {passive:true});

  document.addEventListener("change", function(e){
    var t = e.target;
    for(var i=0;i<changeSel.length;i++){
      if(t.matches && t.matches(changeSel[i])){ chime(); break; }
    }
  }, {passive:true});

  // Cho phép tự gọi thử trong Console: playChime()
  window.playChime = chime;
})();


<script>
/* Cổng mật khẩu cực đơn giản – KHÔNG an toàn cho sản phẩm thật.
   Mật khẩu: 111
   Mẹo: thay sessionStorage -> localStorage nếu muốn khỏi hỏi lại giữa các trang/lần tải. */
(function () {
  // 1) Ẩn trang thật sớm
  var gateStyle = document.createElement('style');
  gateStyle.setAttribute('data-password-gate', '');
  gateStyle.textContent = 'html{visibility:hidden!important}';
  (document.head || document.documentElement).appendChild(gateStyle);

  // 2) Nếu đã mở khoá trong tab này, hiện luôn
  try {
    if (sessionStorage.getItem('pw_ok') === '1') {
      gateStyle.remove();
      return;
    }
  } catch (e) {}

  // 3) Hỏi mật khẩu (tối đa 3 lần)
  var ok = false;
  for (var i = 0; i < 3; i++) {
    var v = window.prompt('Nhập mật khẩu để vào:');
    if (v === null) break;            // bấm Hủy
    if (v === '111') { ok = true; break; }
    alert('Sai mật khẩu, thử lại!');
  }

  if (ok) {
    try { sessionStorage.setItem('pw_ok', '1'); } catch (e) {}
    gateStyle.remove();               // hiện lại trang
  } else {
    // 4) Từ chối truy cập & chặn tải tiếp
    document.open();
    document.write('<!doctype html><meta charset="utf-8"><title>Từ chối truy cập</title><style>body{font-family:system-ui;padding:40px;text-align:center}</style><h1>Không có quyền truy cập</h1><p>Mật khẩu không đúng.</p>');
    document.close();
  }
})();
<script>
/* Cổng mật khẩu cực đơn giản – KHÔNG an toàn cho sản phẩm thật.
   Mật khẩu: 111
   Mẹo: thay sessionStorage -> localStorage nếu muốn khỏi hỏi lại giữa các trang/lần tải. */
(function () {
  // 1) Ẩn trang thật sớm
  var gateStyle = document.createElement('style');
  gateStyle.setAttribute('data-password-gate', '');
  gateStyle.textContent = 'html{visibility:hidden!important}';
  (document.head || document.documentElement).appendChild(gateStyle);

  // 2) Nếu đã mở khoá trong tab này, hiện luôn
  try {
    if (sessionStorage.getItem('pw_ok') === '1') {
      gateStyle.remove();
      return;
    }
  } catch (e) {}

  // 3) Hỏi mật khẩu (tối đa 3 lần)
  var ok = false;
  for (var i = 0; i < 3; i++) {
    var v = window.prompt('Nhập mật khẩu để vào:');
    if (v === null) break;            // bấm Hủy
    if (v === '111') { ok = true; break; }
    alert('Sai mật khẩu, thử lại!');
  }

  if (ok) {
    try { sessionStorage.setItem('pw_ok', '1'); } catch (e) {}
    gateStyle.remove();               // hiện lại trang
  } else {
    // 4) Từ chối truy cập & chặn tải tiếp
    document.open();
    document.write('<!doctype html><meta charset="utf-8"><title>Từ chối truy cập</title><style>body{font-family:system-ui;padding:40px;text-align:center}</style><h1>Không có quyền truy cập</h1><p>Mật khẩu không đúng.</p>');
    document.close();
  }
})();


/* Cổng mật khẩu cực đơn giản – KHÔNG an toàn cho sản phẩm thật.
   Mật khẩu: 111
   Mẹo: thay sessionStorage -> localStorage nếu muốn khỏi hỏi lại giữa các trang/lần tải. */
(function () {
  // 1) Ẩn trang thật sớm
  var gateStyle = document.createElement('style');
  gateStyle.setAttribute('data-password-gate', '');
  gateStyle.textContent = 'html{visibility:hidden!important}';
  (document.head || document.documentElement).appendChild(gateStyle);

  // 2) Nếu đã mở khoá trong tab này, hiện luôn
  try {
    if (sessionStorage.getItem('pw_ok') === '1') {
      gateStyle.remove();
      return;
    }
  } catch (e) {}

  // 3) Hỏi mật khẩu (tối đa 3 lần)
  var ok = false;
  for (var i = 0; i < 3; i++) {
    var v = window.prompt('Nhập mật khẩu để vào:');
    if (v === null) break;            // bấm Hủy
    if (v === '111') { ok = true; break; }
    alert('Sai mật khẩu, thử lại!');
  }

  if (ok) {
    try { sessionStorage.setItem('pw_ok', '1'); } catch (e) {}
    gateStyle.remove();               // hiện lại trang
  } else {
    // 4) Từ chối truy cập & chặn tải tiếp
    document.open();
    document.write('<!doctype html><meta charset="utf-8"><title>Từ chối truy cập</title><style>body{font-family:system-ui;padding:40px;text-align:center}</style><h1>Không có quyền truy cập</h1><p>Mật khẩu không đúng.</p>');
    document.close();
  }
})();
