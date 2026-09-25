# Deploy ke Cloudflare

Portofolio ini di-deploy sebagai satu Cloudflare Worker (paket gratis):

- Semua file situs (`index.html`, `option-a-desktop/`, `shared/`, `asset/`) dilayani apa adanya sebagai *static assets*.
- Desktop portofolio tampil langsung di alamat utama (`iqbalsurya.com/`), tanpa `option-a-desktop` di link. File-nya tetap di folder `option-a-desktop/`; `worker/index.js` yang menyajikannya di `/`, dan link lama `/option-a-desktop/…` dialihkan ke alamat pendek (bagian `#/…` ikut terbawa). `index.html` di root hanya dipakai saat membuka proyek di lokal.
- `/api/scores` dijawab oleh `worker/index.js`, papan peringkat Boss Rush XP, dengan database D1 bernama `brxp-board`.
- `/api/message` mengirim pesan dari jendela New Message di Home ke inbox lewat Resend, dan `/api/event` menghitung apa yang dilakukan pengunjung. Keduanya memakai database yang sama (lihat bagian di bawah).
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

Kalau ada file baru di `worker/migrations/` (misalnya `0002_messages_events.sql`), jalankan dulu perintah ini sebelum `deploy`:

```bash
npx wrangler@latest d1 migrations apply brxp-board --remote
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

- Membuka file situs gratis dan tidak dihitung. Kuota hanya terpakai oleh panggilan ke `/api/scores`, `/api/message` dan `/api/event`.
- D1 gratis menulis 100 ribu baris per hari. Setiap kejadian yang dihitung (bagian "Apa yang dilakukan pengunjung") memakai sekitar tiga tulisan, jadi kira-kira 30 ribu klik per hari masih muat. Kalau terlewati, hitungan dan papan berhenti sampai hari berikutnya, dan form tetap bisa membuka aplikasi email.
- D1 gratis membaca 5 juta baris per hari. Setiap kali papan dibuka, server membaca paling banyak sekitar dua kali jumlah pemain. Dengan 1.000 pemain, itu cukup untuk kira-kira 2.500 kali buka papan per hari.
- Kalau batas itu terlewati, papan berhenti menjawab sampai hari berikutnya. Game tetap bisa dimainkan.
- Paket Workers Paid (5 dolar per bulan) menaikkan batasnya jauh sekali.

## Link ke satu studi kasus

`iqbalsurya.com/work/krool` (juga `serenity-spa`, `findmentor`, `boxify`, `sensorstack`) membuka desktop langsung di studi kasus itu, tanpa layar welcome. Bedanya dengan `/#/work/krool`: LinkedIn, WhatsApp dan Slack menampilkan judul, teks dan gambar kasus itu sendiri, bukan kartu Home. Tombol "Copy link" di player menyalin alamat ini.

- Daftar kasusnya ada di `worker/cases.js`, dan gambar preview-nya di `asset/share/case-<slug>-1200x630.jpg`. Kalau ada kasus baru atau namanya berubah di `shared/content.js`, tambahkan juga di kedua tempat itu.
- `iqbalsurya.com/sitemap.xml` mendaftar Home dan kelima kasus untuk mesin pencari, dan `robots.txt` menunjuk ke sana.
- LinkedIn menyimpan preview lama. Setelah deploy, tempel link kasus di https://www.linkedin.com/post-inspector/ untuk memperbaruinya.

## Pesan dari form (New Message di Home)

Pengunjung mengisi kolom Dari, Subjek dan pesan, lalu menekan "Send me a message". Pesannya dikirim ke `hello@iqbalsurya.com` lewat Resend, dan tombol Reply langsung membalas ke alamat pengunjung. Setiap pesan juga disimpan di database, jadi tidak hilang walaupun Resend menolaknya.

Selama Resend belum disiapkan, atau kalau pengiriman gagal, tombol itu membuka aplikasi email pengunjung (`mailto:`) dengan pesan yang sama, dan di sebelah tombol muncul keterangan apa yang terjadi.

Menyiapkan Resend (sekali saja, paket gratis 3.000 email per bulan):

1. Buat akun di https://resend.com/signup.
2. Buka **Domains → Add Domain**, isi `iqbalsurya.com`. Resend menampilkan beberapa data DNS (MX dan TXT untuk `send`, TXT untuk `resend._domainkey`). Tambahkan di DNS Cloudflare sebagai **DNS only**, atau pakai tombol otomatis untuk Cloudflare kalau ditawarkan. Data MX dan SPF utama milik Hostinger tidak perlu diubah, karena Resend memakai subdomain `send`.
3. Tunggu sampai status domain **Verified**.
4. Buka **API Keys → Create API Key** dengan izin *Sending access*, lalu salin kuncinya.
5. Simpan kunci itu di Worker (terminal akan meminta kuncinya):
   ```bash
   npx wrangler@latest secret put RESEND_API_KEY
   ```
6. Deploy, lalu coba kirim pesan dari situs.

Alamat tujuan dan pengirim ada di `vars` pada `wrangler.jsonc` (`MESSAGE_TO`, `MESSAGE_FROM`). Satu alamat internet bisa mengirim paling banyak 5 pesan per jam.

Melihat pesan yang tersimpan (Console D1, seperti di bagian moderasi):

```sql
-- 20 pesan terbaru; mailed = 0 artinya Resend menolaknya
SELECT id, datetime(at / 1000, 'unixepoch') AS waktu, sender, subject, body, mailed FROM messages ORDER BY at DESC LIMIT 20;
```

## Apa yang dilakukan pengunjung

Situs menghitung beberapa kejadian per hari, tanpa cookie dan tanpa data apa pun tentang pengunjung (hanya angka per hari):

| name | detail | artinya |
|---|---|---|
| `case` | slug kasus, misalnya `krool` | studi kasus dibuka di player |
| `window` | `about`, `work`, `contact`, `resume`, `game` | jendela dibuka |
| `cv` | `open`, `save`, `request` | CV dibuka, diunduh, atau diminta lewat email |
| `send` | `api`, `mailto` | pesan terkirim dari form, atau jatuh ke aplikasi email |
| `copy` | `email` | alamat email disalin |
| `start` | (kosong) | tombol "Start a project" ditekan |
| `social` | `linkedin`, `dribbble`, `behance`, `upwork` | tautan profil diklik |

```sql
-- total 30 hari terakhir
SELECT name, detail, SUM(n) AS total FROM events WHERE day >= date('now', '-30 day') GROUP BY name, detail ORDER BY name, total DESC;
-- per hari untuk satu kejadian
SELECT day, detail, n FROM events WHERE name = 'case' ORDER BY day DESC, n DESC;
```

Untuk jumlah pengunjung, halaman yang dibuka, negara dan perangkat, aktifkan **Cloudflare Web Analytics** (gratis, tanpa cookie): Dashboard → **Analytics & Logs → Web Analytics → Add a site** → `iqbalsurya.com`, pilih pemasangan otomatis. Kalau setelah sehari datanya masih kosong, pilih pemasangan manual dan salin token-nya; satu baris script lalu ditambahkan ke `option-a-desktop/index.html`.
