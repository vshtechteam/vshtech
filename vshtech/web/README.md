# Web Bán File Tự Động — Demo tĩnh (Front‑end)

**Cách chạy:** tải file ZIP về, giải nén và mở `index.html` bằng trình duyệt.
> Đây là bản **demo giao diện** (không có backend). Đăng ký/đăng nhập, nạp tiền, mua file đều **mô phỏng** bằng localStorage.

## Tính năng trong demo
- Đăng ký/đăng nhập UI: Email, SĐT + mật khẩu; nút Google/Facebook (mô phỏng); OTP demo `123456`.
- Nạp tiền: tab **Thẻ cào** và **Banking** (mô phỏng cộng số dư).
- Mua & tải file: trừ số dư và tải file `.txt` sinh động.
- Danh mục: Trang chủ, iMazing, File Android, File iOS, Nạp tiền.

## Định hướng triển khai thật (bảo mật)
- **Kiến trúc**: Next.js (App Router) + API (NestJS/Express/Fastify). DB: PostgreSQL. Redis cho session/rate-limit/queue.
- **Xác thực**:
  - Email/SĐT + mật khẩu **Argon2id** (pepper + per‑user salt).
  - OAuth 2.0: Google & Facebook (PKCE). Thư viện: **NextAuth/Auth.js** hoặc **Passport.js**.
  - OTP: SMS/Email qua nhà cung cấp (e.g. Twilio/SendGrid/Zalo OA). 2FA TOTP (RFC6238).
  - Session cookie `HttpOnly`, `SameSite=Lax`, `Secure`; CSRF token (double submit hoặc SameSite).
- **Bảo vệ**: rate limiting, recaptcha turnstile, login throttling, IP/device fingerprint, nhật ký bảo mật, bắt buộc HTTPS.
- **Thanh toán/Nạp**:
  - Ngân hàng/QR: tích hợp cổng thanh toán trong nước (VD: VietQR, VNPay, MoMo, v.v.).
  - Thẻ cào: dùng đối tác có API hợp lệ; kiểm tra gian lận & webhook đối soát.
- **Phân phối file**:
  - Lưu file trên object storage (S3/Wasabi), **signed URL** hết hạn, watermark/ID giao dịch.
  - Giao dịch dạng **atomic** (DB transaction), kiểm tra số dư, xuất hoá đơn.
- **Kiểm thử & tuân thủ**: OWASP ASVS/Top10, kiểm thử xâm nhập, backup/restore, log & alert.

## Mã nguồn
- HTML/CSS/JS thuần, không phụ thuộc thư viện ngoài.
- Code sạch, tách bạch: `assets/js/app.js`, `assets/css/style.css`.

> Demo chỉ nhằm mục đích minh hoạ quy trình. Vui lòng không sử dụng demo này cho môi trường sản xuất.
