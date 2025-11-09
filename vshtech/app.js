
/* ====== CẤU HÌNH NHANH ====== */

const AVATAR_URL = ""; // dán URL avatar của bạn
const CONTACT_URL = "https://instabio.cc/vshtech";
const BOT_LANDING_URL = "https://www.vshtech.online/bot/";
const ROLES = [
  "Seller",

  "Developer",

  "iOS Configuration",

  "iOS Certificate",

  "Mobile DevOps",

  "Game Support",

  "File Dev iOS/Android"

];

/* ====== CODE CHẠY ====== */
(function(){
  const $=(q,c=document)=>c.querySelector(q);

  // Avatar
  if(AVATAR_URL){ const im=$("#avatar"); if(im) im.src=AVATAR_URL; }

  // ===== Rotator — caret bám theo chữ, vào/ra mượt, LUÔN THẲNG HÀNG =====
  const rot=$("#rotator"), lead=$("#lead");
  function setBaselineFix(){
    if(!rot || !lead) return;
    // đo bottom của lead và rotator để tính chênh lệch baseline theo PX
    const lb=lead.getBoundingClientRect().bottom;
    const rb=rot.getBoundingClientRect().bottom;
    const delta = Math.round((lb-rb)*100)/100; // px
    rot.style.setProperty('--baseline-fix', delta+'px');
  }

  if(rot && ROLES.length){
    rot.innerHTML="";
    // đo bề rộng theo từ dài nhất (kèm dấu chấm + caret) để không giật layout
    const longest=(ROLES.reduce((a,b)=>a.length>b.length?a:b,"")+".");
    const meas=document.createElement("span");
    meas.style.cssText="position:absolute;visibility:hidden;white-space:nowrap;";
    [...longest].forEach(ch=>{const s=document.createElement("span");s.className="char";s.textContent=ch;meas.appendChild(s);});
    const caretTest=document.createElement("span"); caretTest.className="caret"; meas.appendChild(caretTest);
    rot.appendChild(meas);
    rot.style.width=Math.ceil(meas.getBoundingClientRect().width)+"px";
    meas.remove();

    const frames=[];
    const charDelay=55;   // ms
    const baseHold=1100;  // ms
    ROLES.forEach(text=>{
      const f=document.createElement("span"); f.className="frame";
      [...text+"."].forEach((ch,j)=>{
        const s=document.createElement("span"); s.className="char"; s.textContent=ch;
        s.style.transitionDelay=(j*charDelay)+"ms"; f.appendChild(s);
      });
      const caret=document.createElement("span"); caret.className="caret";
      caret.style.transitionDelay=(([...text].length)*charDelay)+"ms";
      f.appendChild(caret);
      rot.appendChild(f); frames.push(f);
    });

    let i=-1;
    const play=()=>{
      if(i>=0){frames[i].classList.remove("in"); frames[i].classList.add("out");}
      i=(i+1)%frames.length;
      const cur=frames[i];
      cur.querySelectorAll(".char").forEach((s,j)=>s.style.transitionDelay=(j*charDelay)+"ms");
      const c=cur.querySelector(".caret"); if(c) c.style.transitionDelay=(cur.querySelectorAll(".char").length-1)*charDelay+"ms";
      cur.classList.remove("out"); cur.classList.add("in");
      // căn baseline mỗi lần đổi chữ để đảm bảo thẳng tuyệt đối
      requestAnimationFrame(setBaselineFix);
      const wait=baseHold + cur.querySelectorAll(".char").length*charDelay + 60;
      setTimeout(play,wait);
    };
    play();
    // căn lại baseline khi load/resize
    addEventListener("load", setBaselineFix);
    addEventListener("resize", setBaselineFix);
  }

  // ===== Reveal + stagger =====
  const REVEALS=[...document.querySelectorAll(".reveal")];
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const d=Number(e.target.getAttribute("data-d")||0);
          setTimeout(()=>e.target.classList.add("visible"), d);
          io.unobserve(e.target);
        }
      });
    },{threshold:.15});
    REVEALS.forEach(el=>io.observe(el));
  }else{
    REVEALS.forEach(el=>el.classList.add("visible"));
  }

  // ===== Skills progress animation =====
  const skills=[...document.querySelectorAll(".skill")];
  skills.forEach(s=>{
    const v=Number(s.dataset.value||0);
    s.style.setProperty('--val', v+'%');
  });
  if("IntersectionObserver" in window){
    const io2=new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('active'); io2.unobserve(e.target);} });
    },{threshold:.3});
    skills.forEach(s=>io2.observe(s));
  }else{ skills.forEach(s=>s.classList.add('active')); }

  // ===== Scroll progress =====
  const bar=$("#progress");
  const set=()=>{const d=document.documentElement; bar.style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight||1))*100+"%";}
  addEventListener("scroll",set,{passive:true}); set();

  // ===== Share / copy =====
  const share=$("#shareBtn");
  if(share){
    share.onclick=async()=>{
      try{
        if(navigator.share){
          await navigator.share({title:"VSH TECH", text:"VSH TECH • Bio Link", url:location.href});
        }else{
          await navigator.clipboard.writeText(location.href);
          const t=share.textContent; share.textContent="Đã sao chép liên kết"; setTimeout(()=>share.textContent=t,1400);
        }
      }catch{}
    };
  }
  // ===== Contact button =====
  const contactBtn = $("#contactBtn");
  if (contactBtn) {
    contactBtn.onclick = () => {
      const url = (CONTACT_URL || "").trim();
      if (!url) return;
      // mailto: thì mở trực tiếp, còn lại mở tab mới
      if (url.startsWith("mailto:")) {
        location.href = url;
      } else {
        window.open(url, "_blank", "noopener");
      }
    };
  }
// ===== Bot landing link =====
const botLanding = document.getElementById("botLandingLink");
if (botLanding && typeof BOT_LANDING_URL === "string" && BOT_LANDING_URL.trim()){
  botLanding.href = BOT_LANDING_URL.trim(); // mở cùng tab (landing nội bộ)
  // Nếu muốn mở tab mới: botLanding.target = "_blank"; botLanding.rel = "noopener";
}
  
  // ===== Footer copy handle =====
  const y=$("#y"); if(y) y.textContent=new Date().getFullYear();
  const cp=$("#handleCopy"); if(cp){ cp.onclick=async()=>{try{await navigator.clipboard.writeText(cp.textContent||"@vshtech"); const t=cp.textContent; cp.textContent="Đã sao chép!"; setTimeout(()=>cp.textContent=t,1200);}catch{}}}
})();


