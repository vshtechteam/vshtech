// Đổi đường dẫn này nếu tên file khác (ví dụ '/profiles/8.mobileconfig')
const FILE = '/install/profiles/vpn.mobileconfig';

const retryBtn = document.getElementById('retry');
if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    window.location.assign(FILE);
    setTimeout(() => { location.reload(); }, 600);
  });
}
