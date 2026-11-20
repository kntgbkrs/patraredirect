/* ============================================================
   KONFIGURASI — PATRA REDIRECT
   ------------------------------------------------------------
   GAS_URL      = URL Web App Apps Script Anda (berakhiran /exec).
   APP_NAME     = Nama website / brand aplikasi.
   APP_LOGO_URL = Jalur file logo Anda (letakkan di redirect-nfc/assets/logo.png).
   ============================================================ */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxRisaq29_BatlcEoGWQQ0OojyTsX1suRuty18vMP-OZ8K14dOuo4Vb9YBDFMOrFjKDng/exec';
const APP_NAME = 'Patra Redirect';
const APP_LOGO_URL = 'assets/logo.png';

/* PINTU LOGIN PETUGAS — tidak ada tombol "Login Petugas" di halaman publik.
   Petugas membuka:  https://DOMAIN-ANDA/?petugas=KUNCI_RAHASIA
   Nilai di bawah adalah SHA-256 dari KUNCI_RAHASIA (bukan kuncinya), jadi aman berada di repo publik.
   Ganti kunci: Terminal Mac/Linux →  printf '%s' 'KUNCI-BARU' | shasum -a 256
   Kosongkan ('') untuk menutup halaman login sepenuhnya. */
const STAFF_GATE_HASH = '5b014abb419403495e22084984d5266a79cfea9606ee17969753fa2a5b07199e';
