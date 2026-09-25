# Deploy ke Cloudflare

Portofolio ini di-deploy sebagai satu Cloudflare Worker (paket gratis):

- Semua file situs (`index.html`, `option-a-desktop/`, `shared/`, `asset/`) dilayani apa adanya sebagai *static assets*.
- Desktop portofolio tampil langsung di alamat utama (`iqbalsurya.com/`), tanpa `option-a-desktop` di link. File-nya tetap di folder `option-a-desktop/`; `worker/index.js` yang menyajikannya di `/`, dan link lama `/option-a-desktop/…` dialihkan ke alamat pendek (bagian `#/…` ikut terbawa). `index.html` di root hanya dipakai saat membuka proyek di lokal.
- `/api/scores` dijawab oleh `worker/index.js`, papan peringkat Boss Rush XP, dengan database D1 bernama `brxp-board`.
- File yang tidak ikut terunggah (catatan, `.claude/`, `.impeccable/`, kode worker) tercantum di `.assetsignore`.

Semua perintah di bawah dijalankan di Terminal, dari folder proyek ini. `npx` sudah ikut terpasang bersama Node.js.

## Pertama kali

1. Buat akun gratis di https://dash.cloudflare.com/sign-up.
2. Hubungkan terminal ke akun itu (browser akan terbuka untuk izin):
   ```bash
   npx wrangler@latest login
   ```
3. Buat database-nya:
   ```bash
   npx wrangler@latest d1 create brxp-board
   ```
   Perintah ini menampilkan `database_id`. Salin nilainya ke `wrangler.jsonc`, menggantikan `PASTE-DATABASE-ID-HERE`.
4. Buat tabel papan peringkat:
   ```bash
   npx wrangler@latest d1 migrations apply brxp-board --remote
   ```
5. Unggah situsnya:
   ```bash
   npx wrangler@latest deploy
   ```
   Situs tayang di `https://iqbal-surya-portfolio.<nama-akun>.workers.dev`.

## Setiap kali ada perubahan

```bash
npx wrangler@latest deploy
```

## Domain sendiri

Situs tayang di **https://iqbalsurya.com** dan **https://www.iqbalsurya.com**. Keduanya tercantum di `routes` pada `wrangler.jsonc`, jadi ikut terpasang setiap kali `npx wrangler@latest deploy` dijalankan. Alamat `workers.dev` tetap aktif (`"workers_dev": true`).

- Domain terdaftar di Hostinger. DNS-nya dikelola Cloudflare sejak 2026-09-25, lewat nameserver `luke.ns.cloudflare.com` dan `yolanda.ns.cloudflare.com`.
- Email `@iqbalsurya.com` tetap di Hostinger. Data MX, SPF (TXT), DMARC (`_dmarc`), DKIM (`hostingermail-a/b/c._domainkey`), `autodiscover`, dan `autoconfig` ada di DNS Cloudflare. Semua CNAME email harus **DNS only** (awan abu-abu), karena kalau di-proxy, email tidak lolos verifikasi.
- Jangan tambahkan data A atau CNAME untuk `@` dan `www` di DNS Cloudflare. Cloudflare membuatnya sendiri untuk Worker ini.

## Mencoba di komputer sendiri

```bash
npx wrangler@latest d1 migrations apply brxp-board --local
npx wrangler@latest dev
```

Lalu buka http://localhost:8787. Database lokal ini terpisah dari yang online.

## Moderasi papan peringkat

Buka Dashboard → Storage & Databases → D1 → `brxp-board` → Console, lalu jalankan:

```sql
-- 50 teratas
SELECT pid, name, time_ms / 1000.0 AS detik, hits FROM scores ORDER BY score_ms, at LIMIT 50;
-- hapus satu nama
DELETE FROM scores WHERE name = 'NamaYangMauDihapus';
-- kosongkan papan
DELETE FROM scores;
```

Perintah yang sama bisa dijalankan dari terminal:

```bash
npx wrangler@latest d1 execute brxp-board --remote --command "DELETE FROM scores WHERE name = 'NamaYangMauDihapus'"
```

## Yang ditolak server, dan yang tidak bisa dicegah

- **Ditolak otomatis:**
  - Waktu di bawah 60 detik. Tidak mungkin dicapai: bot yang tidak pernah kena serangan butuh sekitar 107 detik. Batasnya bisa diubah lewat `MIN_TIME` di `worker/index.js`.
  - Nama kasar, dari daftar kata Inggris dan Indonesia.
  - Lebih dari 20 kiriman per 10 menit dari satu alamat internet.
- **Tidak bisa dicegah sepenuhnya:** orang yang paham teknis tetap bisa mengirim waktu palsu di atas 60 detik. Kalau muncul, hapus lewat Console di atas.
- **Data yang disimpan:** hanya nama, waktu, jumlah serangan yang kena, dan ID acak dari browser pemain. Alamat internet tidak disimpan, hanya hash-nya selama 10 menit untuk pembatasan kiriman.

## Batas paket gratis

- Membuka file situs gratis dan tidak dihitung. Kuota hanya terpakai oleh panggilan ke `/api/scores`.
- D1 gratis membaca 5 juta baris per hari. Setiap kali papan dibuka, server membaca paling banyak sekitar dua kali jumlah pemain. Dengan 1.000 pemain, itu cukup untuk kira-kira 2.500 kali buka papan per hari.
- Kalau batas itu terlewati, papan berhenti menjawab sampai hari berikutnya. Game tetap bisa dimainkan.
- Paket Workers Paid (5 dolar per bulan) menaikkan batasnya jauh sekali.
