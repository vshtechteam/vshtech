const AVATAR_URL = "";
const CONTACT_URL = "https://instabio.cc/vshtech";
const BOT_LANDING_URL = "https://www.vshtech.online/bot/";
const ROLES = [
  "Digital Seller",
  "Hệ sinh thái cấu hình",
  "Mobile DevOps",
  "iOS Certificate Specialist",
  "Game Support Lead",
  "File Dev iOS/Android"
];

(function () {
  const $ = (q, c = document) => c.querySelector(q);

  if (AVATAR_URL) {
    const im = $("#avatar");
    if (im) im.src = AVATAR_URL;
  }

  const rot = $("#rotator"), lead = $("#lead");
  function setBaselineFix() {
    if (!rot || !lead) return;
    const lb = lead.getBoundingClientRect().bottom;
    const rb = rot.getBoundingClientRect().bottom;
    const delta = Math.round((lb - rb) * 100) / 100;
    rot.style.setProperty("--baseline-fix", delta + "px");
  }

  if (rot && ROLES.length) {
    rot.innerHTML = "";
    const longest = (ROLES.reduce((a, b) => (a.length > b.length ? a : b), "") + ".");
    const meas = document.createElement("span");
    meas.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;";
    [...longest].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch;
      meas.appendChild(s);
    });
    const caretTest = document.createElement("span");
    caretTest.className = "caret";
    meas.appendChild(caretTest);
    rot.appendChild(meas);
    rot.style.width = Math.ceil(meas.getBoundingClientRect().width) + "px";
    meas.remove();

    const frames = [];
    const charDelay = 55;
    const baseHold = 1100;
    ROLES.forEach((text) => {
      const f = document.createElement("span");
      f.className = "frame";
      [...text + "."].forEach((ch, j) => {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = ch;
        s.style.transitionDelay = j * charDelay + "ms";
        f.appendChild(s);
      });
      const caret = document.createElement("span");
      caret.className = "caret";
      caret.style.transitionDelay = ([...text].length * charDelay) + "ms";
      f.appendChild(caret);
      rot.appendChild(f);
      frames.push(f);
    });

    let i = -1;
    const play = () => {
      if (i >= 0) {
        frames[i].classList.remove("in");
        frames[i].classList.add("out");
      }
      i = (i + 1) % frames.length;
      const cur = frames[i];
      cur.querySelectorAll(".char").forEach((s, j) => (s.style.transitionDelay = j * charDelay + "ms"));
      const c = cur.querySelector(".caret");
      if (c) c.style.transitionDelay = (cur.querySelectorAll(".char").length - 1) * charDelay + "ms";
      cur.classList.remove("out");
      cur.classList.add("in");

      requestAnimationFrame(setBaselineFix);
      const wait = baseHold + cur.querySelectorAll(".char").length * charDelay + 60;
      setTimeout(play, wait);
    };
    play();

    addEventListener("load", setBaselineFix);
    addEventListener("resize", setBaselineFix);
  }

  const reveals = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const d = Number(e.target.getAttribute("data-d") || 0);
            setTimeout(() => e.target.classList.add("visible"), d);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  const skills = [...document.querySelectorAll(".skill")];
  skills.forEach((s) => {
    const v = Number(s.dataset.value || 0);
    s.style.setProperty("--val", v + "%");
  });
  if ("IntersectionObserver" in window) {
    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("active");
            io2.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    skills.forEach((s) => io2.observe(s));
  } else {
    skills.forEach((s) => s.classList.add("active"));
  }

  const bar = $("#progress");
  if (bar) {
    const set = () => {
      const d = document.documentElement;
      const ratio = d.scrollTop / ((d.scrollHeight - d.clientHeight) || 1);
      bar.style.width = ratio * 100 + "%";
    };
    addEventListener("scroll", set, { passive: true });
    set();
  }

  const share = $("#shareBtn");
  if (share) {
    share.addEventListener("click", async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: "VSH TECH",
            text: "VSH TECH – Digital ecosystem",
            url: location.href
          });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(location.href);
          const t = share.textContent;
          share.textContent = "Đã sao chép liên kết";
          setTimeout(() => (share.textContent = t), 1400);
        }
      } catch {}
    });
  }

  const contactBtn = $("#contactBtn");
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      const url = (CONTACT_URL || "").trim();
      if (!url) return;
      if (url.startsWith("mailto:")) {
        location.href = url;
      } else {
        window.open(url, "_blank", "noopener");
      }
    });
  }

  const botLanding = document.getElementById("botLandingLink");
  if (botLanding && typeof BOT_LANDING_URL === "string" && BOT_LANDING_URL.trim()) {
    botLanding.href = BOT_LANDING_URL.trim();
  }

  const tiltCards = [...document.querySelectorAll("[data-tilt]")];
  if (tiltCards.length) {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const reset = (card) => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
      card.style.removeProperty("--tiltX");
      card.style.removeProperty("--tiltY");
    };
    tiltCards.forEach((card) => {
      let leaveFrame = null;
      card.addEventListener(
        "pointermove",
        (e) => {
          const rect = card.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const relY = e.clientY - rect.top;
          const mx = clamp((relX / rect.width) * 100, 0, 100);
          const my = clamp((relY / rect.height) * 100, 0, 100);
          card.style.setProperty("--mx", mx + "%");
          card.style.setProperty("--my", my + "%");
          const tiltX = ((relY - rect.height / 2) / rect.height) * -6;
          const tiltY = ((relX - rect.width / 2) / rect.width) * 6;
          card.style.setProperty("--tiltX", tiltX.toFixed(2) + "deg");
          card.style.setProperty("--tiltY", tiltY.toFixed(2) + "deg");
          if (leaveFrame) {
            cancelAnimationFrame(leaveFrame);
            leaveFrame = null;
          }
        },
        { passive: true }
      );

      card.addEventListener("pointerleave", () => {
        leaveFrame = requestAnimationFrame(() => reset(card));
      });
    });
  }

  const y = $("#y");
  if (y) y.textContent = new Date().getFullYear();

  const cp = $("#handleCopy");
  if (cp) {
    cp.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("@vshtech");
        const t = cp.textContent;
        cp.textContent = "Đã sao chép!";
        setTimeout(() => (cp.textContent = t), 1200);
      } catch {}
    });
  }
})();
