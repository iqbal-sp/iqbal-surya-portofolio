# Deploy ke Cloudflare

Portofolio ini di-deploy sebagai satu Cloudflare Worker (paket gratis):

- Semua file situs (`index.html`, `option-a-desktop/`, `shared/`, `asset/`) dilayani apa adanya sebagai *static assets*.
- Desktop portofolio tampil langsung di alamat utama (`iqbalsurya.com/`), tanpa `option-a-desktop` di link. File-nya tetap di folder `option-a-desktop/`; `worker/index.js` yang menyajikannya di `/`, dan link lama `/option-a-desktop/…` dialihkan ke alamat pendek (bagian `#/…` ikut terbawa). `index.html` di root hanya dipakai saat membuka proyek di lokal.
- `/api/scores` dijawab oleh `worker/index.js`, papan peringkat Boss Rush XP, dengan database D1 bernama `brxp-board`.
- `/api/message` mengirim pesan dari jendela New Message di Home ke inbox lewat Resend, dan `/api/event` menghitung apa yang dilakukan pengunjung. Keduanya memakai database yang sama (lihat bagian di bawah).
- File yang tidak ikut terunggah (catatan, `.claude/`, `.impeccable/`, kode worker) tercantum di `.assetsignore`.
- three.js (layar loading dan wallpaper hidup) dilayani dari situs sendiri di `asset/vendor/three-0.186.0/`, bukan dari jsDelivr. TV proses di Home memakai aset SVG Windows XP dan lapisan CRT, dengan distorsi lokal mengikuti mouse; renderer desk 3D lama tidak dimuat. Asal tiap file three.js tercatat di `SOURCE.md` di folder itu. `_headers` di root membuat browser menyimpan folder itu setahun, jadi versi baru masuk ke folder baru, jangan menimpa yang lama.

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

- Sejak 2026-10-05, `worker/index.js` (`moved()`) mengalihkan `http://` dan `www` ke `https://iqbalsurya.com` dengan path yang sama: 301 untuk membuka halaman, 308 untuk POST supaya isi pesan ikut. Setiap jawaban Worker di alamat ini membawa HSTS selama setahun, jadi browser yang sudah pernah membuka situs langsung memakai HTTPS. HSTS-nya tanpa `includeSubDomains`, karena subdomain email dan Resend bukan bagian situs.
- File statis yang dibuka langsung lewat `http://` (misalnya gambar) tidak lewat Worker. Untuk menutup celah itu juga, nyalakan **SSL/TLS → Edge Certificates → Always Use HTTPS** di dashboard Cloudflare.

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

Papan Screen Saver XP ada di tabel `ssxp_scores`, dengan kolom yang sama. Semua perintah di atas berlaku untuk papan itu kalau `scores` diganti `ssxp_scores`:

```sql
-- 50 teratas Screen Saver XP
SELECT pid, name, time_ms / 1000.0 AS detik, hits FROM ssxp_scores ORDER BY score_ms, at LIMIT 50;
-- hapus satu nama dari papan Screen Saver XP
DELETE FROM ssxp_scores WHERE name = 'NamaYangMauDihapus';
```

Perintah yang sama bisa dijalankan dari terminal:

```bash
npx wrangler@latest d1 execute brxp-board --remote --command "DELETE FROM scores WHERE name = 'NamaYangMauDihapus'"
```

## Yang ditolak server, dan yang tidak bisa dicegah

- **Ditolak otomatis:**
  - Waktu yang terlalu cepat untuk bisa dicapai. Batasnya diatur per game lewat `GAMES` di `worker/index.js`:
    - Boss Rush XP: di bawah 60 detik. Bot yang tidak pernah kena serangan butuh sekitar 107 detik.
    - Screen Saver XP: di bawah 120 detik. Total darah kelima bos 2.500, jadi butuh 125 detik tembakan walaupun semua peluru kena. Bot yang tidak pernah kena dan selalu membidik cincin butuh sekitar 240 detik. Kalau darah bos dikurangi, turunkan juga batas ini.
  - Nama kasar, dari daftar kata Inggris dan Indonesia.
  - Lebih dari 20 kiriman per 10 menit dari satu alamat internet, dihitung terpisah untuk setiap game.
- **Tidak bisa dicegah sepenuhnya:** orang yang paham teknis tetap bisa mengirim waktu palsu di atas batas itu. Kalau muncul, hapus lewat Console di atas.
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

Alamat tujuan dan pengirim ada di `vars` pada `wrangler.jsonc` (`MESSAGE_TO`, `MESSAGE_FROM`).

Melihat pesan yang tersimpan (Console D1, seperti di bagian moderasi):

```sql
-- 20 pesan terbaru; mailed = 0 artinya belum sampai inbox: ditahan (held terisi) atau ditolak Resend (held kosong)
SELECT id, datetime(at / 1000, 'unixepoch') AS waktu, sender, subject, body, held, mailed FROM messages ORDER BY at DESC LIMIT 20;
```

### Alamat email pengirim

Sebelum pesan disimpan, server memeriksa alamat di kolom Dari. Dalam dua kasus berikut, pesan dikembalikan ke form: tidak ada yang disimpan atau dikirim, dan di atas tombol kirim muncul balon XP.

- **Salah ketik nama penyedia email besar** (gmail.com, yahoo.com, yahoo.co.id, hotmail.com, outlook.com, icloud.com), misalnya `gmai.com` atau `yaho.com`. Balon menawarkan "Maksudnya …@gmail.com?" dengan tombol "Pakai alamat ini". Sebagian domain salah ketik dimiliki orang lain yang ikut menerima emailnya (`gmai.com`), jadi balasanmu bisa nyasar ke sana. Kalau pengirim yakin alamatnya benar, dia cukup mengirim sekali lagi, dan alamatnya diterima apa adanya. Daftarnya ada di `PROVIDERS` dan `NEIGHBOURS` di `worker/index.js`.
- **Domain yang tidak bisa menerima email**: domain yang tidak ada (`asdf.asdf`), tidak punya server email (`test.com`), atau menolak email (`example.com`). Balon meminta pengirim memeriksa ejaannya. Pemeriksaannya lewat DNS Cloudflare. Kalau DNS tidak menjawab dalam 2 detik, alamatnya dianggap benar supaya klien asli tidak tertolak.

Alamat karangan di penyedia asli (`asal123@gmail.com`) tidak bisa dikenali tanpa email verifikasi. Pesan dari alamat seperti itu diperlakukan seperti pesan lain: bisa ditahan, dan jaringannya bisa diblokir.

### Pesan yang ditahan

Pesan yang mencurigakan tidak masuk inbox. Pesannya tetap disimpan di database, dan pengirimnya tetap melihat "Pesan terkirim", jadi orang iseng tidak tahu pesannya ditahan. Alasannya tercatat di kolom `held`:

| `held` | artinya |
|---|---|
| `blocked` | jaringan pengirimnya sedang diblokir (lihat di bawah) |
| `day` | sudah ada 10 pesan dari jaringan yang sama dalam 24 jam |
| `hour` | sudah ada 3 pesan dari jaringan yang sama dalam 1 jam |
| `same` | isinya sama persis dengan pesan lain dalam 24 jam |
| `rude` | ada kata kasar di pesan atau di alamat email (daftar yang sama dengan nama di papan peringkat, dicek per kata). Di alamat email hanya kata yang panjang yang dihitung, karena kata pendek seperti "tai" juga bisa nama orang |
| `links` | ada 3 link atau lebih |
| `short` | kurang dari 3 kata, misalnya "tes" atau "halo bang" |

Lebih dari 20 kiriman per jam dari satu alamat internet dianggap skrip. Pesannya tidak disimpan sama sekali, tapi pengirimnya tetap melihat "Pesan terkirim". Semua angka ini ada di `HOLD` dan `MSG` di `worker/index.js`.

**Ringkasan pagi.** Setiap pagi jam 08.00 WIB, Worker mengirim satu email berisi pesan yang ditahan sejak ringkasan sebelumnya. Isinya paling banyak 30 pesan; kalau lebih, sisanya hanya disebut jumlahnya. Kalau tidak ada yang ditahan, tidak ada email. Setiap pesan di ringkasan punya dua tautan:

- **Loloskan ke inbox**: pesannya dikirim ke inbox seperti pesan biasa, dan Reply langsung ke pengirimnya.
- **Blokir 7 hari**: semua pesan dari jaringan yang sama ditahan selama 7 hari, apa pun alamat email yang dipakai.

Setiap pesan yang langsung masuk inbox juga punya tautan "Blokir pengirim ini" di bagian bawahnya. Semua tautan itu membuka halaman konfirmasi dulu dan baru bertindak setelah tombolnya ditekan, karena aplikasi email kadang membuka tautan sendiri untuk memeriksanya. Jadwal ringkasan ada di `triggers` pada `wrangler.jsonc` (`0 1 * * *`, jam 01.00 UTC).

**Jaringan pengirim** adalah alamat internet (IP) dari wifi atau data seluler yang dipakai; untuk IPv6, separuh depan alamatnya. Yang disimpan hanya hash-nya, bukan alamatnya, dan dikosongkan setelah 30 hari. Setelah itu, pesan lama tidak bisa lagi dipakai untuk memblokir. Kalau pengirim pindah jaringan, pesannya bisa masuk lagi sampai diblokir sekali lagi.

```sql
-- pesan yang sedang ditahan
SELECT id, datetime(at / 1000, 'unixepoch') AS waktu, sender, held AS alasan, substr(body, 1, 200) AS isi FROM messages WHERE held IS NOT NULL AND mailed = 0 ORDER BY at DESC LIMIT 50;
-- jaringan yang sedang diblokir
SELECT net, datetime(until / 1000, 'unixepoch') AS sampai FROM blocked WHERE until > unixepoch() * 1000;
-- buka semua blokir
DELETE FROM blocked;
```

## Apa yang dilakukan pengunjung

Situs menghitung beberapa kejadian per hari, tanpa cookie dan tanpa data apa pun tentang pengunjung (hanya angka per hari):

| name | detail | artinya |
|---|---|---|
| `case` | slug kasus, misalnya `krool` | studi kasus dibuka di player |
| `window` | `about`, `work`, `contact`, `resume`, `game`, `recycle`, `gamegate`, `screensaver` | jendela dibuka (`gamegate` adalah pesan "mainkan di komputer" Boss Rush XP di HP) |
| `cv` | `open`, `save`, `request` | CV dibuka, diunduh, atau diminta lewat email |
| `send` | `api`, `mailto` | pesan terkirim dari form, atau jatuh ke aplikasi email |
| `copy` | `email` | alamat email disalin |
| `start` | (kosong) | tombol "Start a project" ditekan |
| `social` | `linkedin`, `dribbble`, `behance`, `upwork` | tautan profil diklik |
| `door` | `ss:display`, `ss:idle`, `ss:gate`, `ss:menu`, `ss:link` | Screen Saver XP dibuka dari menu klik kanan desktop (Properties), dari balon tawaran setelah screensaver, dari tombol di gate HP Boss Rush XP, dari Start > Accessories, atau dari link `#/screensaver` |
| `door` | `br:bin`, `br:balloon`, `br:konami`, `br:pet`, `br:menu`, `br:link` | Boss Rush XP dibuka dari jangan-dibuka.exe di Tempat Sampah, dari exe yang sama setelah balon petunjuk membuka Tempat Sampah, dari kode Konami, dari stickman di taskbar, dari Start > Accessories, atau dari link `#/game` |
| `hint` | `bin`, `idle`, `offer` | balon petunjuk Tempat Sampah tampil, screensaver saat diam muncul, atau balon tawaran Screen Saver XP tampil |
| `run` | `ss:start`, `ss:boss2`, `ss:boss3`, `ss:boss4`, `ss:final`, `ss:win` | run penuh Screen Saver XP dimulai, sampai di Mystify, 3D Pipes, Marquee, Blank, lalu menang. Main lagi dan Mulai ulang dihitung sebagai start baru, sedangkan Coba lagi setelah kalah tidak dihitung |
| `run` | `ss:practice`, `ss:practice-done` | latihan dimulai, atau selesai sampai langkah terakhir |
| `boot` | `fail:<bagian>`, `skip:<bagian>` | layar loading gagal memuat satu bagian (`fonts`, `content`, `cases`, `icons`, `app`, `wall`, `home`), atau melanjutkan tanpa bagian itu karena tidak akan pernah datang (hanya `fonts`, `wall`, `home`). Dihitung sekali per sesi. Kalau `fail:` naik tiba-tiba setelah deploy, kemungkinan ada file yang tidak ikut terunggah |

```sql
-- total 30 hari terakhir
SELECT name, detail, SUM(n) AS total FROM events WHERE day >= date('now', '-30 day') GROUP BY name, detail ORDER BY name, total DESC;
-- per hari untuk satu kejadian
SELECT day, detail, n FROM events WHERE name = 'case' ORDER BY day DESC, n DESC;
-- sejauh mana run Screen Saver XP bertahan, 30 hari terakhir
SELECT detail, SUM(n) AS total FROM events WHERE name = 'run' AND day >= date('now', '-30 day') GROUP BY detail ORDER BY total DESC;
-- dari mana kedua game dibuka, dan petunjuk yang tampil
SELECT name, detail, SUM(n) AS total FROM events WHERE name IN ('door', 'hint') AND day >= date('now', '-30 day') GROUP BY name, detail ORDER BY name, total DESC;
-- bagian layar loading yang gagal atau dilewati, 30 hari terakhir
SELECT day, detail, n FROM events WHERE name = 'boot' AND day >= date('now', '-30 day') ORDER BY day DESC, n DESC;
```

Untuk jumlah pengunjung, halaman yang dibuka, negara dan perangkat, aktifkan **Cloudflare Web Analytics** (gratis, tanpa cookie): Dashboard → **Analytics & Logs → Web Analytics → Add a site** → `iqbalsurya.com`, pilih pemasangan otomatis. Kalau setelah sehari datanya masih kosong, pilih pemasangan manual dan salin token-nya; satu baris script lalu ditambahkan ke `option-a-desktop/index.html`.
