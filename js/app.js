'use strict';
/* ============================================================
   BOOT — menentukan halaman pertama dari URL (?id=KODE&aksi=kelola)
   ============================================================ */
function hideBoot() { const b = $('boot'); if (b) { b.classList.add('out'); setTimeout(function () { if (b.parentNode) b.remove(); }, 300); } }

/* Perbarui nomor WhatsApp admin tanpa merender ulang form yang sedang diisi */
function refreshHelp() { const el = document.querySelector('.help-pill'); if (el) el.outerHTML = helpPill(); }
function setWa(wa) { wa = wa || ''; if (wa !== S.wa) { S.wa = wa; lsSet('rnfc-wa', wa); refreshHelp(); } }

async function loadConfig() {
  const r = await apiGet({ action: 'config' });
  if (r && r.success && r.data) setWa(r.data.wa);
}
async function restoreSession() {
  let t = null; try { t = sessionStorage.getItem('rnfc-tok'); } catch (e) {}
  if (!t) return;
  const r = await rpc('staffBootstrap', [t]);               /* S.token masih kosong → tidak memicu "sesi berakhir" */
  if (!r.success) { try { sessionStorage.removeItem('rnfc-tok'); } catch (e) {} return; }
  if (S.view !== 'portal' && S.view !== 'login') return;
  S.token = t; applyBoot(r.data); startAuto();
  go(S.role === 'master' ? 'overview' : 'cards');
}

/* Pintu Login Petugas: ?petugas=KUNCI dicocokkan dengan STAFF_GATE_HASH (SHA-256). Kunci salah → portal biasa, tanpa petunjuk. */
async function openStaffGate() {
  const k = QS.get('petugas');
  if (k === null) return false;
  try { history.replaceState(null, '', location.pathname); } catch (e) {}   /* buang kunci dari address bar & riwayat */
  if (typeof STAFF_GATE_HASH === 'undefined' || !STAFF_GATE_HASH || !(window.crypto && crypto.subtle)) return false;
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(k));
    const hex = Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    if (hex !== STAFF_GATE_HASH.toLowerCase()) return false;
  } catch (e) { return false; }
  S.gate = k;
  try { sessionStorage.setItem('rnfc-gate', k); } catch (e) {}           /* bertahan selama tab terbuka, seperti token */
  return true;
}

(async function boot() {
  if (!gasReady()) { go('setup'); hideBoot(); return; }

  if (!INIT.code) {                                         /* tanpa kode kartu → portal kelola (atau login bila kunci petugas benar) */
    go((await openStaffGate()) ? 'login' : 'portal'); hideBoot();
    loadConfig(); restoreSession();
    return;
  }

  /* Jika mode kelola kartu, tampilkan antarmuka resolving */
  if (INIT.aksi === 'kelola') {
    go('resolving'); hideBoot();
  }

  /* Ambil data kartu dari promise prefetch di <head> atau panggil API */
  let r = window.__cardP ? await window.__cardP : null;
  if (!r || r.success === undefined) r = await apiGet({ action: 'card', id: INIT.code, log: INIT.aksi ? 0 : 1 });
  if (!r || !r.success) {
    INIT.error = (r && r.message) || 'Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba pindai ulang.';
    go('info'); hideBoot(); return;
  }
  INIT.card = r.data.card;
  setWa(r.data.waAdmin);
  const c = INIT.card;

  /* INSTANT REDIRECT jika kartu terhubung dan bukan mode kelola */
  if (c && c.status === 'terhubung') {
    if (INIT.aksi === 'kelola') {
      S.pin = { val: '', err: '', locked: false };
      go('pin'); hideBoot(); return;
    }
    if (/^https?:\/\//i.test(c.url || '')) {
      window.location.replace(c.url);
      /* Cadangan bila navigasi browser tertahan (mis. data saver) */
      setTimeout(function () { go('redirect'); hideBoot(); }, 800);
      return;
    }
  }

  let v = 'info';
  if (c && c.status === 'belum_setup') v = 'register';
  go(v);
  hideBoot();
})();
window.addEventListener('offline', function () { toast('warn', 'Anda sedang offline', 'Perubahan akan gagal sampai koneksi kembali.'); });
