/* ================== CẤU HÌNH BOTS ================== */
const ZALO_ADMIN = 'https://zalo.me/0382304188'; // 👉 thay bằng Zalo của bạn

// Thay avatar bằng URL của bạn
const BOTS = [
  {
    name: 'Bot Ký Xác Minh Cấu Hình Theo Tên',
    avatar: 'https://i.imgur.com/EL6qtQg.png',
    tags:   ['file','ios'],
    features: [
      'Ký & xác minh cấu hình .mobileconfig dựa trên tên hồ sơ',
      'Chống sửa đổi, chống giả mạo',
      'Nhật ký và tra cứu nhanh'
    ],
    price: 'Có Thời Hạn',
    buy: ZALO_ADMIN
  },
  {
    name: 'Bot API SERVER KEY',
    avatar: 'https://i.imgur.com/7sbhoUN.jpeg',
    tags:   ['api','auth'],
    features: [
      'Tạo Key Cho App & Web ',
      'Hạn mức, whitelisting IP, thu hồi ngay',
      'Báo cáo & thống kê theo thời gian thực'
    ],
    price: 'Có Thời Hạn',
    buy: ZALO_ADMIN
  },
  {
    name: 'Bot Mã Hóa Đa Dạng Code',
    avatar: 'https://i.imgur.com/TED4gGX.png',
    tags:   ['Decode','Encode'],
    features: [
      'Hỗ trợ nhiều chuẩn (AES/RSA/ChaCha20...)',
      'Encode & Decode (Mất Phí)',
      'Mã Hóa Đa Dạng'
    ],
    price: 'Có Thời Hạn',
    buy: ZALO_ADMIN
  },
  {
    name: 'Bot Make Form Folder Android',
    avatar: 'https://i.imgur.com/SeGcNOm.png',
    tags:   ['android','automation'],
    features: [
      'Tạo form & cấu trúc folder Android tự động',
      'Tặng kèm form code khi mua',
      'Xuất gói .zip sẵn sàng tích hợp'
    ],
    price: 'Có Thời Hạn',
    buy: ZALO_ADMIN
  }
];

/* ============ RENDER GRID ============ */
(function renderBots(){
  const grid = document.getElementById('botGrid');
  BOTS.forEach(b=>{
    const card = document.createElement('article');
    card.className = 'bot';

    const ava  = document.createElement('div');
    ava.className = 'avatar';
    ava.style.backgroundImage = `url('${b.avatar.replace(/'/g,"%27")}')`;

    const body = document.createElement('div'); body.className = 'body';

    const title= document.createElement('h3'); title.className='title'; title.textContent=b.name;
    const tags = document.createElement('div'); tags.className = 'tags';
    b.tags.forEach(t=>{ const s=document.createElement('span'); s.className='tag'; s.textContent=t; tags.appendChild(s); });

    const ul = document.createElement('ul'); ul.className='features';
    b.features.forEach(f=>{ const li=document.createElement('li'); li.textContent=f; ul.appendChild(li); });

    const row = document.createElement('div'); row.className='priceRow';
    const price = document.createElement('div'); price.className='price'; price.textContent=b.price;
    const btn = document.createElement('a'); btn.className='btn'; btn.href=b.buy; btn.target='_blank'; btn.rel='noopener';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="#001014" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Liên Hệ Admin`;

    row.appendChild(price); row.appendChild(btn);

    body.appendChild(title); body.appendChild(tags); body.appendChild(ul); body.appendChild(row);

    card.appendChild(ava); card.appendChild(body);
    grid.appendChild(card);
  });
})();

/* ============ MODAL THÔNG BÁO (kiểu mã trước) ============ */
(function modalNotice(){
  const MODAL_ID   = 'vshModal';
  const KEY_UNTIL  = 'vsh_modal_hide_until';
  const KEY_SESS   = 'vsh_modal_closed_session';
  const HIDE_MS    = 3 * 60 * 60 * 1000; // 3 giờ

  const $ = s => document.querySelector(s);
  const now = Date.now();
  const until = parseInt(localStorage.getItem(KEY_UNTIL)||'0',10);
  const closedSession = sessionStorage.getItem(KEY_SESS) === '1';

  function open(){ const el = $('#'+MODAL_ID); if (el) el.style.display = 'flex'; }
  function hide(){ const el = $('#'+MODAL_ID); if (el) el.style.display = 'none'; }

  // Chỉ mở nếu chưa đóng 3h và chưa đóng trong phiên
  if (!(until > now) && !closedSession) open();

  $('#vshClose3h')?.addEventListener('click', ()=>{
    localStorage.setItem(KEY_UNTIL, String(Date.now() + HIDE_MS));
    hide();
  });

  $('#vshClose')?.addEventListener('click', ()=>{
    sessionStorage.setItem(KEY_SESS, '1');
    hide();
  });

  $('#vshCloseX')?.addEventListener('click', ()=>{
    sessionStorage.setItem(KEY_SESS, '1');
    hide();
  });
})();
