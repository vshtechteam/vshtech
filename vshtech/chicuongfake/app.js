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

// ===== SCR API KEY GATE (đã ẩn link API) =====
(function(){
  // simple XOR-based obfuscation
  function _de(b64,k){var bin=atob(b64),s="";for(var i=0;i<bin.length;i++)s+=String.fromCharCode(bin.charCodeAt(i)^k);return s}
  var _H="aWR/YG5yJX14Y39uaGN/bmpmJXxkeWBueXglb259",_K=11; // host hidden
  var _EV="JGp7YiR9bnlibXI=",_EA="JGp7YiRqaH9ifWp/bg==";   // /api/verify , /api/activate
  var _BR="XVhDK19OSEMrSltCK1hOWV1OWStATlI=",_TZ="SnhiaiRDZFRIY2JURmJlYw=="; // brand, tz

  var API_BASE=(location.protocol||"https:").replace(/:.*/,"")+"://"+_de(_H,_K);
  var VERIFY=_de(_EV,_K), ACTIVATE=_de(_EA,_K);
  var BRAND_TITLE=_de(_BR,_K), TZ=_de(_TZ,_K);
  var ALWAYS_PROMPT=false;

  var LS={DEVICE:"vsh_license_device",KEY:"vsh_license_key"};
  var deviceId=localStorage.getItem(LS.DEVICE);
  if(!deviceId){
    deviceId=(crypto.randomUUID?.()||(Date.now().toString(36)+Math.random().toString(36).slice(2,10))).toUpperCase();
    localStorage.setItem(LS.DEVICE,deviceId);
  }
  var fmt=function(ts){return ts==null?"lifetime":new Intl.DateTimeFormat("vi-VN",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(ts)};
  async function post(u,data){
    var r=await fetch(API_BASE+u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    return r.json().catch(function(){return{ok:false,error:"PARSE_ERROR"}});
  }
  function ting(){try{var AC=new (window.AudioContext||window.webkitAudioContext)(),o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type="sine";o.frequency.value=1200;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+.17)}catch(e){}}

  function $(s,r){return (r||document).querySelector(s)}
  function build(){
    var wrap=$("#vgGate"); if(wrap) return wrap;
    wrap=document.createElement("div"); wrap.id="vgGate";
    wrap.innerHTML =
      '<div class="vg-panel">'+
        '<div class="vg-hd">'+
          '<div class="vg-brand">'+BRAND_TITLE+'</div>'+
          '<div class="vg-hd-rt"><button class="vg-btn vg-btn--ghost" id="vgReset" title="Nhập lại">Nhập lại</button></div>'+
        '</div>'+
        '<div class="vg-bd">'+
          '<div><div class="vg-label">Mã Kích Hoạt</div>'+
            '<div class="vg-field">'+
              '<input id="vgKey" class="vg-input" type="text" placeholder="VSHTECH-XXXX-XXXX-XXXX" autocomplete="one-time-code" inputmode="latin">'+
              '<button class="vg-icon" id="vgPasteKey" title="Dán">'+
                '<svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v4h4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4h4Z" stroke="currentColor" stroke-width="1.6"/><path d="M9 2h6v3a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V2Z" stroke="currentColor" stroke-width="1.6"/></svg>'+
                '<span>Dán</span></button>'+
              '<button class="vg-icon" id="vgDelKey" title="Delete">'+
                '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" stroke-width="1.6"/><path d="M10 11v7M14 11v7" stroke="currentColor" stroke-width="1.6"/></svg>'+
                '<span>Delete</span></button>'+
            '</div></div>'+
          '<div style="margin-top:12px"><div class="vg-label">Mã Thiết Bị</div>'+
            '<div class="vg-field">'+
              '<input id="vgDev" class="vg-input" type="text" readonly>'+
              '<button class="vg-icon" id="vgCopyDev" title="Sao chép">'+
                '<svg viewBox="0 0 24 24" fill="none"><path d="M9 9h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6"/><path d="M7 15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.6"/></svg>'+
                '<span>Sao chép</span></button>'+
            '</div></div>'+
          '<div class="vg-actions">'+
            '<button class="vg-btn vg-btn--pri" id="vgCheck">Kiểm tra</button>'+
            '<button class="vg-btn vg-btn--pri" id="vgActive">Kích hoạt (1 thiết bị)</button>'+
          '</div>'+
          '<div class="vg-msg" id="vgMsg">Sẵn sàng.</div>'+
          '<details id="vgDtl" hidden><summary>Chi tiết kỹ thuật</summary><pre class="vg-pre" id="vgRaw"></pre></details>'+
          '<div class="vg-foot"><span id="vgSta">Chưa kích hoạt</span><span></span></div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(wrap);

    const lastKey=localStorage.getItem(LS.KEY)||"";
    if(lastKey) $("#vgKey").value=lastKey;
    $("#vgDev").value=deviceId;

    $("#vgPasteKey").onclick=pasteIntoKey;
    $("#vgDelKey").onclick=deleteKeyLocal;
    $("#vgCopyDev").onclick=()=>copyToClipboard($("#vgDev").value.trim(),"Đã sao chép Mã Thiết Bị.");
    $("#vgReset").onclick=()=>{ localStorage.removeItem(LS.KEY); updateStatus(null); show(); };
    $("#vgCheck").onclick=onCheck;
    $("#vgActive").onclick=onActivate;

    return wrap;
  }

  function setMsg(type,html,raw){
    const box=$("#vgMsg"); box.className="vg-msg "+(type||""); box.innerHTML=html; ting();
    const dtl=$("#vgDtl"); const pre=$("#vgRaw");
    if(raw){ dtl.hidden=false; pre.textContent=typeof raw==="string"?raw:JSON.stringify(raw,null,2); }
    else { dtl.hidden=true; pre.textContent=""; }
  }
  function updateStatus(data){
    const el=$("#vgSta"); if(!el) return;
    if(!data){ el.textContent="Chưa kích hoạt"; return; }
    el.textContent="Hết hạn: "+fmt(data.expiresAt);
  }
  function copyToClipboard(text,ok){ navigator.clipboard?.writeText(text).then(()=> setMsg("ok",ok)); }

  async function pasteIntoKey(){
    const inp=$("#vgKey");
    try{ const txt=await navigator.clipboard.readText(); inp.value=(txt||"").trim(); setMsg("ok","Đã dán vào ô Mã Kích Hoạt."); }
    catch(e){ const txt=prompt("Dán Mã Kích Hoạt tại đây:","")||""; inp.value=txt.trim(); setMsg("ok","Đã dán vào ô Mã Kích Hoạt."); }
    inp.focus();
  }
  function deleteKeyLocal(){
    const inp=$("#vgKey"); inp.value="";
    localStorage.removeItem(LS.KEY); updateStatus(null);
    setMsg("ok","Đã xoá Mã Kích Hoạt khỏi thiết bị này.");
  }
  async function onCheck(){
    const key=$("#vgKey").value.trim();
    if(!key) return setMsg("warn","Vui lòng nhập Mã Kích Hoạt.");
    setMsg("","Đang kiểm tra…");
    const j=await post(VERIFY,{key});
    if(j.ok){
      localStorage.setItem(LS.KEY,key);
      const d=j.data; updateStatus(d);
      setMsg("ok","✔️ Hợp lệ<br>Hết hạn: <b>"+fmt(d.expiresAt)+"</b>", j);
    }else{
      const map={EXPIRED:"⏳ Mã đã hết hạn.",REVOKED:"🛑 Mã đã bị thu hồi.",NOT_FOUND:"❌ Không tìm thấy mã."};
      setMsg("err", map[(j.error||"").toUpperCase()]||("❌ "+(j.error||"Lỗi")), j);
    }
  }
  async function onActivate(){
    const key=$("#vgKey").value.trim();
    if(!key) return setMsg("warn","Vui lòng nhập Mã Kích Hoạt.");
    setMsg("","Đang kích hoạt…");
    const j=await post(ACTIVATE,{key,deviceId});
    if(j.ok){
      localStorage.setItem(LS.KEY,key);
      const d=j.data; updateStatus(d);
      setMsg("ok","✅ Kích hoạt thành công<br>Hết hạn: <b>"+fmt(d.expiresAt)+"</b>", j);
      setTimeout(()=>{ hide(); },1200);
      window.dispatchEvent(new CustomEvent("vsh-license-change",{detail:{state:"activated",data:d}}));
    }else{
      const why=(j.error||"").toUpperCase();
      const map={BOUND_TO_ANOTHER_DEVICE:"🔒 Mã đã gắn với thiết bị khác.",EXPIRED:"⏳ Mã đã hết hạn.",REVOKED:"🛑 Mã đã bị thu hồi.",NOT_FOUND:"❌ Không tìm thấy mã."};
      setMsg("err", map[why] || ("❌ "+(j.error||"Lỗi")), j);
      window.dispatchEvent(new CustomEvent("vsh-license-change",{detail:{state:"invalid",data:j}}));
    }
  }
  function show(){ build(); document.getElementById("vgGate").style.display="grid"; }
  function hide(){ const g=document.getElementById("vgGate"); g && (g.style.display="none"); }

  async function guardOnLoad(){
    if(ALWAYS_PROMPT){ show(); return; }
    const savedKey=localStorage.getItem(LS.KEY);
    if(!savedKey){ show(); return; }
    const v=await post(VERIFY,{key:savedKey});
    if(!v.ok){ show(); return; }
    if(!v.data.deviceId || v.data.deviceId!==deviceId){ show(); return; }
    updateStatus(v.data);
    document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") guardOnLoad(); },{once:true});
    setTimeout(()=>guardOnLoad(),10*60*1000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",guardOnLoad);
  else guardOnLoad();

  // expose
  window.VSHKeyGate={show,hide,reset(){ localStorage.removeItem(LS.KEY); show(); }};
})();
