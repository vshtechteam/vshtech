// Dùng đường dẫn tuyệt đối trong nhánh /install
const BASE = '/install';
const FILE = `${BASE}/profiles/vpn.mobileconfig`;

const retryBtn = document.getElementById('retry');
if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    window.location.assign(FILE);
    setTimeout(() => { location.reload(); }, 600);
  });
}
