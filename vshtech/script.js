const html = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
let isDark = localStorage.getItem('theme') !== 'light';

function applyTheme(dark) {
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  if (themeBtn) {
    themeBtn.textContent = dark ? '🌙' : '☀️';
  }
  isDark = dark;
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

applyTheme(isDark);
if (themeBtn) {
  themeBtn.addEventListener('click', () => applyTheme(!isDark));
}

const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const mobileLinks = mobileNav ? Array.from(mobileNav.querySelectorAll('a')) : [];
let lastFocusedElement = null;

const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
}

function setMobileNavOpen(open) {
  if (!hamburger || !mobileNav) return;
  if (open) {
    lastFocusedElement = document.activeElement;
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.setAttribute('aria-modal', 'true');
    document.body.classList.add('no-scroll');
    const focusables = getFocusableElements(mobileNav);
    const target = focusables[0] || mobileNav;
    if (target && target.focus) {
      target.focus({ preventScroll: true });
    }
  } else {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.removeAttribute('aria-modal');
    document.body.classList.remove('no-scroll');
    const target = lastFocusedElement && typeof lastFocusedElement.focus === 'function' ? lastFocusedElement : hamburger;
    if (target && target.focus) {
      target.focus({ preventScroll: true });
    }
  }
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = !mobileNav.classList.contains('open');
    setMobileNavOpen(open);
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => setMobileNavOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (!mobileNav.classList.contains('open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setMobileNavOpen(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = getFocusableElements(mobileNav);
    if (!focusables.length) {
      e.preventDefault();
      mobileNav.focus({ preventScroll: true });
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  });
}

const navbar = document.getElementById('navbar');
const progressBar = document.getElementById('scroll-progress');
const backTop = document.getElementById('back-to-top');
const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));
const sections = Array.from(document.querySelectorAll('section[id]'));
const heroVisual = document.querySelector('.hero-visual');

let sectionPositions = [];
let activeSectionId = '';
let scrollTicking = false;
let resizeTicking = false;
let parallaxEnabled = false;

function refreshSectionPositions() {
  if (!sections.length) return;
  const scrollY = window.scrollY || 0;
  sectionPositions = sections.map(sec => ({
    id: sec.id,
    top: sec.getBoundingClientRect().top + scrollY
  })).sort((a, b) => a.top - b.top);
}

function refreshParallaxState() {
  parallaxEnabled = !!heroVisual && window.innerWidth > 768;
  if (!parallaxEnabled && heroVisual) {
    heroVisual.style.transform = '';
  }
}

function updateScrollSpy(scrollY) {
  if (!sectionPositions.length || !navAnchors.length) return;
  const scrollPos = scrollY + 120;
  let current = sectionPositions[0].id;
  for (let i = 0; i < sectionPositions.length; i++) {
    if (sectionPositions[i].top <= scrollPos) {
      current = sectionPositions[i].id;
    } else {
      break;
    }
  }
  if (current === activeSectionId) return;
  activeSectionId = current;
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + activeSectionId);
  });
}

function handleScroll() {
  const scrollY = window.scrollY || 0;
  if (progressBar) {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollY / docH) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  if (navbar) {
    navbar.classList.toggle('scrolled', scrollY > 50);
  }
  if (backTop) {
    backTop.classList.toggle('visible', scrollY > 400);
  }
  updateScrollSpy(scrollY);
  if (parallaxEnabled && heroVisual) {
    heroVisual.style.transform = `translateY(${scrollY * 0.12}px)`;
  }
}

function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollTicking = false;
    handleScroll();
  });
}

function onResize() {
  if (resizeTicking) return;
  resizeTicking = true;
  requestAnimationFrame(() => {
    resizeTicking = false;
    refreshSectionPositions();
    refreshParallaxState();
    handleScroll();
  });
}

if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

if (navbar || progressBar || backTop || navAnchors.length || heroVisual) {
  window.addEventListener('scroll', onScroll, { passive: true });
}

window.addEventListener('resize', onResize, { passive: true });
window.addEventListener('orientationchange', onResize, { passive: true });

const revealItems = Array.from(document.querySelectorAll('.reveal'));
const skillBars = Array.from(document.querySelectorAll('.skill-bar-fill'));

function animateBar(bar) {
  if (!bar) return;
  const pct = bar.getAttribute('data-pct') || '0';
  requestAnimationFrame(() => { bar.style.width = pct + '%'; });
}

if (revealItems.length) {
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('visible'));
    skillBars.forEach(bar => {
      if (bar) bar.style.width = (bar.getAttribute('data-pct') || '0') + '%';
    });
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const bars = entry.target.querySelectorAll ? entry.target.querySelectorAll('.skill-bar-fill') : [];
          bars.forEach(bar => animateBar(bar));
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(el => revealObserver.observe(el));

    if (skillBars.length) {
      const skillBarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateBar(entry.target);
            skillBarObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      skillBars.forEach(bar => skillBarObserver.observe(bar));
    }
  }
}

const typingEl = document.getElementById('typing-text');
const words = ['web apps', 'APIs', 'cool UIs', 'SaaS products', 'fast backends'];

if (typingEl) {
  let wIdx = 0, cIdx = 0, deleting = false, typingTimer;

  function type() {
    const current = words[wIdx];
    if (!deleting) {
      typingEl.textContent = current.substring(0, ++cIdx);
      if (cIdx === current.length) {
        deleting = true;
        typingTimer = setTimeout(type, 1800);
        return;
      }
    } else {
      typingEl.textContent = current.substring(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        wIdx = (wIdx + 1) % words.length;
      }
    }
    typingTimer = setTimeout(type, deleting ? 60 : 100);
  }

  type();
}

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});

const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
const projectCards = Array.from(document.querySelectorAll('.project-card'));

if (filterBtns.length && projectCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-filter');
      projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags') || '';
        const show = filter === 'all' || tags.includes(filter);
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        if (show) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = '';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (card.style.opacity === '0') card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

const tabBtns = Array.from(document.querySelectorAll('.timeline-tab'));
const tabContents = Array.from(document.querySelectorAll('.timeline-content'));

if (tabBtns.length && tabContents.length) {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      tabContents.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const target = document.getElementById(this.getAttribute('data-tab'));
      if (target) {
        target.classList.add('active');
        target.querySelectorAll('.reveal:not(.visible)').forEach(el => {
          el.classList.add('visible');
        });
      }
    });
  });
}

const form = document.getElementById('contact-form');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
const toastIcon = toast ? toast.querySelector('.toast-icon') : null;
const toastTitle = document.getElementById('toast-title');
const toastClose = document.getElementById('toast-close');
const contactTargetEmail = 'admin@vshtech.online';
let toastTimer = null;

function hideToast() {
  if (!toast) return;
  toast.classList.remove('show');
}

function showToast(msg, isError) {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  if (toastTitle) {
    toastTitle.textContent = isError ? 'Không thành công' : 'Thành công';
  }
  if (toastIcon) {
    toastIcon.textContent = isError ? '❌' : '✅';
  }
  toast.classList.toggle('toast-error', !!isError);
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), 4200);
}

if (toastClose) {
  toastClose.addEventListener('click', hideToast);
}

function validateField(input, errorEl, check) {
  if (!input || !errorEl) return false;
  const valid = check(input.value.trim());
  input.classList.toggle('error', !valid);
  errorEl.classList.toggle('show', !valid);
  return valid;
}

function validateOnBlur(el) {
  if (!el) return;
  if (el.id === 'cf-email') {
    validateField(el, document.getElementById('err-email'), v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
  } else if (el.id === 'cf-name') {
    validateField(el, document.getElementById('err-name'), v => v.length >= 2);
  } else if (el.id === 'cf-message') {
    validateField(el, document.getElementById('err-message'), v => v.length >= 10);
  }
}

function buildContactMailto(payload) {
  const subject = payload.subject ? payload.subject.trim() : '';
  const finalSubject = subject || `Liên hệ từ website - ${payload.name}`;
  const body = [
    `Tên: ${payload.name}`,
    `Email: ${payload.email}`,
    '',
    'Nội dung:',
    payload.message
  ].join('\n');
  return `mailto:${contactTargetEmail}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(body)}`;
}

['cf-name','cf-email','cf-message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => validateOnBlur(el));
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) validateOnBlur(el);
  });
});

if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nameEl = document.getElementById('cf-name');
    const emailEl = document.getElementById('cf-email');
    const subjectEl = document.getElementById('cf-subject');
    const msgEl = document.getElementById('cf-message');
    const nameOk = nameEl ? validateField(nameEl, document.getElementById('err-name'), v => v.length >= 2) : false;
    const emailOk = emailEl ? validateField(emailEl, document.getElementById('err-email'), v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) : false;
    const msgOk = msgEl ? validateField(msgEl, document.getElementById('err-message'), v => v.length >= 10) : false;

    if (nameOk && emailOk && msgOk) {
      const mailtoUrl = buildContactMailto({
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        subject: subjectEl ? subjectEl.value.trim() : '',
        message: msgEl.value.trim()
      });
      window.location.href = mailtoUrl;
      form.reset();
      showToast('Đã mở ứng dụng email để gửi tin nhắn.', false);
    }
  });
}

function downloadCV() {
  showToast('Đã bắt đầu tải CV. 📄', false);
}

(function() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let animId = 0;
  let running = false;
  let particles = [];
  let W = 0;
  let H = 0;

  const baseCount = 60;
  const maxLinks = 6;
  const linkDist = 120;
  const linkDistSq = linkDist * linkDist;
  const cellSize = linkDist || 120;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      r: randomBetween(1, 2.5),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(-0.3, 0.3),
      alpha: randomBetween(0.2, 0.7),
      color: Math.random() < 0.5 ? '#4f8ef7' : Math.random() < 0.5 ? '#a259ff' : '#00d4aa'
    };
  }

  function initParticles() {
    particles = Array.from({ length: baseCount }, createParticle);
  }

  function buildGrid() {
    const grid = new Map();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const cx = Math.floor(p.x / cellSize);
      const cy = Math.floor(p.y / cellSize);
      const key = cx + ',' + cy;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(i);
    }
    return grid;
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    if (maxLinks > 0 && linkDist > 0) {
      const grid = buildGrid();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / cellSize);
        const cy = Math.floor(p.y / cellSize);
        let links = 0;

        for (let gx = -1; gx <= 1; gx++) {
          for (let gy = -1; gy <= 1; gy++) {
            const key = (cx + gx) + ',' + (cy + gy);
            const cell = grid.get(key);
            if (!cell) continue;
            for (let idx = 0; idx < cell.length; idx++) {
              const j = cell[idx];
              if (j <= i) continue;
              const q = particles[j];
              const dx = p.x - q.x;
              const dy = p.y - q.y;
              const distSq = dx * dx + dy * dy;
              if (distSq < linkDistSq) {
                const dist = Math.sqrt(distSq);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = (1 - dist / linkDist) * 0.15;
                ctx.lineWidth = 0.8;
                ctx.stroke();
                links += 1;
                if (links >= maxLinks) break;
              }
            }
            if (links >= maxLinks) break;
          }
          if (links >= maxLinks) break;
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  function drawFrame() {
    if (!running) return;
    render();
    animId = requestAnimationFrame(drawFrame);
  }

    function start() {
    if (running) return;
    running = true;
    drawFrame();
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  }, { passive: true });

  resize();
  initParticles();
  start();
})();

refreshSectionPositions();
refreshParallaxState();
handleScroll();

