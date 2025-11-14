const ZALO_ADMIN = 'https://zalo.me/0382304188';
const CTA_TEXT = 'Liên hệ Admin';

const BOTS = [
  {
    name: 'Bot Ký Số Cấu Hình Theo Tên Client',
    avatar: 'https://i.imgur.com/EL6qtQg.png',
    tags: ['iOS', 'Cấu hình'],
    features: [
      'Ký số & xác minh file .mobileconfig theo profile riêng',
      'Chống sửa đổi, log toàn bộ đường truyền realtime',
      'Bộ nhớ cache giúp triển khai < 30s'
    ],
    price: 'Tuỳ biến',
    buy: ZALO_ADMIN
  },
  {
    name: 'Bot Cổng API Server Key',
    avatar: 'https://i.imgur.com/7sbhoUN.jpeg',
    tags: ['API', 'Bảo mật'],
    features: [
      'Tạo, thu hồi, whitelist IP cho từng key trong vài giây',
      'Thống kê dung lượng trực tiếp trên dashboard realtime',
      'Webhook cảnh báo ngay khi có lượt quét bất thường'
    ],
    price: 'Theo gói',
    buy: ZALO_ADMIN
  },
  {
    name: 'Bot Mã Hoá Đa Tầng',
    avatar: 'https://i.imgur.com/TED4gGX.png',
    tags: ['Crypto', 'Tự động hoá'],
    features: [
      'Hỗ trợ AES, RSA, ChaCha20, custom salt theo yêu cầu',
      'Encode & decode 1 lệnh, backup offline tức thì',
      'Báo cáo audit khi phát hiện truy cập lạ'
    ],
    price: 'Liên hệ',
    buy: ZALO_ADMIN
  },
  {
    name: 'Bot Dựng Form Folder Android',
    avatar: 'https://i.imgur.com/SeGcNOm.png',
    tags: ['Android', 'Builder'],
    features: [
      'Tạo tree folder Android từ template chuẩn VSH',
      'Tự động fill code form khi hoàn tất thanh toán',
      'Xuất file .zip sẵn sàng bàn giao cho dev'
    ],
    price: 'Trọn gói',
    buy: ZALO_ADMIN
  }
];

(function renderBots(){
  const grid = document.getElementById('botGrid');
  if (!grid) return;

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bot-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 })
    : null;

  BOTS.forEach((bot, index) => {
    const card = document.createElement('article');
    card.className = 'bot';
    card.style.setProperty('--delay', `${index * 0.08}s`);

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.style.backgroundImage = `url('${bot.avatar.replace(/'/g, '%27')}')`;
    const avatarImg = document.createElement('img');
    avatarImg.src = bot.avatar;
    avatarImg.alt = `Avatar của ${bot.name}`;
    avatarImg.loading = 'lazy';
    avatar.appendChild(avatarImg);

    const body = document.createElement('div');
    body.className = 'body';

    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = bot.name;

    const tags = document.createElement('div');
    tags.className = 'tags';
    bot.tags.forEach(tagText => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tagText;
      tags.appendChild(span);
    });

    const ul = document.createElement('ul');
    ul.className = 'features';
    bot.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      ul.appendChild(li);
    });

    const row = document.createElement('div');
    row.className = 'priceRow';

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = bot.price;

    const btn = document.createElement('a');
    btn.className = 'btn btn-primary';
    btn.href = bot.buy;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="#041007" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> ${CTA_TEXT}`;

    row.appendChild(price);
    row.appendChild(btn);

    body.appendChild(title);
    body.appendChild(tags);
    body.appendChild(ul);
    body.appendChild(row);

    card.appendChild(avatar);
    card.appendChild(body);
    grid.appendChild(card);

    if (observer) {
      observer.observe(card);
    } else {
      card.classList.add('bot-visible');
    }
  });
})();

(function heroInteractions(){
  document.querySelectorAll('[data-scroll]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const selector = trigger.getAttribute('data-scroll');
      const target = selector ? document.querySelector(selector) : null;
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const visual = document.querySelector('.hero-visual');
  if (!visual) return;

  const orbs = visual.querySelectorAll('.hero-orb');
  let rafId;

  const animate = (x, y) => {
    orbs.forEach((orb, idx) => {
      const depth = (idx + 1) / orbs.length;
      orb.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
    });
  };

  visual.addEventListener('mousemove', event => {
    const rect = visual.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 24;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => animate(offsetX, offsetY));
  });

  visual.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafId);
    animate(0, 0);
  });
})();

(function modalNotice(){
  const MODAL_ID = 'vshModal';
  const KEY_UNTIL = 'vsh_modal_hide_until';
  const KEY_SESS = 'vsh_modal_closed_session';
  const KEY_LAST = 'vsh_modal_last_visit';
  const HIDE_MS = 3 * 60 * 60 * 1000;

  const now = Date.now();
  const until = parseInt(localStorage.getItem(KEY_UNTIL) || '0', 10);
  const closedSession = sessionStorage.getItem(KEY_SESS) === '1';
  const lastVisit = parseInt(localStorage.getItem(KEY_LAST) || '0', 10);
  const returning = Number.isFinite(lastVisit) && lastVisit > 0;
  const messageEl = document.querySelector('[data-modal-message]');

  const updateCopy = () => {
    if (!messageEl) return;
    if (returning) {
      const hoursAway = Math.max(1, Math.round((now - lastVisit) / (60 * 60 * 1000)));
      messageEl.innerHTML = `<strong>Chào mừng bạn quay lại sau ${hoursAway}h!</strong> Hotline bot đã sẵn sàng đồng bộ dự án mới và gửi demo trực tiếp.`;
    } else {
      messageEl.textContent = 'Cảm ơn bạn đã ghé VSH TECH. Liên hệ Admin để xem demo bot chuẩn doanh nghiệp ngay.';
    }
  };

  const open = () => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    updateCopy();
    modal.classList.add('active');
  };

  const hide = () => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.classList.remove('active');
  };

  if (!(until > now) && !closedSession) {
    setTimeout(open, 650);
  }

  document.getElementById('vshClose3h')?.addEventListener('click', () => {
    localStorage.setItem(KEY_UNTIL, String(Date.now() + HIDE_MS));
    hide();
  });

  ['vshClose', 'vshCloseX'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      sessionStorage.setItem(KEY_SESS, '1');
      hide();
    });
  });

  window.addEventListener('beforeunload', () => {
    localStorage.setItem(KEY_LAST, String(Date.now()));
  });

  localStorage.setItem(KEY_LAST, String(now));
})();
