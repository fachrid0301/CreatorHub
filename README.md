# 🌟 CreatorHub — Platform Marketplace KOL & Influencer Indonesia

Platform marketplace KOL (*Key Opinion Leader*) dan influencer modern, profesional, dan responsif yang terinspirasi dari konsep **AzeraKOL**, dibangun dengan arsitektur **Node.js, Express.js**, dan penyimpanan terintegrasi langsung ke **Google Sheets API v4**.

---

## 📸 Fitur Utama

1. **Landing Page Modern & Responsif**:
   * Hero section interaktif dengan headline menarik, CTA, dan live preview card influencer.
   * Penghitung statistik (Total Kreator, Audience Reach, Kategori, Kepuasan Brand).
   * Showcase 8 kategori konten (Beauty, Tech, Food, Gaming, Lifestyle, Business, Fitness, Entertainment).
   * Bagian keunggulan platform & alur kolaborasi transparan.
   * Tampilan responsif optimal di Smartphone, Tablet, maupun Desktop.

2. **Katalog Explore Creators (`creators.html`)**:
   * Menampilkan daftar kreator dalam format card modern.
   * Filter pencarian realtime (nama, username handle, bio, dan kategori).
   * Filter platform (Instagram, TikTok, YouTube, X).
   * Filter skala followers (Nano, Micro, Macro, Mega).
   * Pengurutan (Followers terbanyak, terendah, nama A-Z).
   * Modal profil lengkap kreator dengan tautan langsung **Chat WhatsApp** dan **Portofolio / Media Kit**.

3. **Form Pendaftaran Kreator (`register.html`)**:
   * Formulir pendaftaran terstruktur untuk kreator baru.
   * **Interactive Live Preview Card**: Kartu profil kreator terupdate otomatis secara realtime saat mengisi form!
   * Validasi formulir yang ramah pengguna.
   * Data pendaftaran tersimpan langsung ke baris baru Google Sheets dengan status default **Pending**.

4. **Dashboard Admin (`admin.html`)**:
   * Autentikasi Admin aman berbasis JSON Web Token (JWT).
   * Ringkasan KPI: Total Kreator, Menunggu Review (Pending), Disetujui (Approved), Ditolak (Rejected), dan Total Reach.
   * Indikator status koneksi Google Sheets (Live vs Local Store).
   * Tabel interaktif dengan pencarian cepat dan tab filter status.
   * **Ubah Status Cepat**: Dropdown ubah status (Pending / Approved / Rejected) yang langsung tersinkronisasi ke Google Sheets.
   * Modal detail pendaftar (termasuk tombol kontak WhatsApp pendaftar).
   * Modal edit data kreator lengkap & tombol hapus data dari Google Sheets.
   * Fitur **Ekspor Data ke CSV**.

5. **Integrasi Google Sheets API Backend**:
   * Google Sheets berperan sebagai database utama.
   * Pembuatan header kolom otomatis saat pertama kali dihubungkan.
   * Kredensial aman tersimpan di backend (tidak pernah bocor ke frontend).
   * Memiliki fitur *Smart Local Fallback Store* sehingga website dapat langsung dicoba di lokal bahkan sebelum kredensial Google Cloud dipasang.

---

## 📁 Struktur Folder Proyek

```
creatorhub/
├── .env.example              # Template variabel lingkungan
├── .env                      # Konfigurasi aktif (port, admin, sheets)
├── .gitignore                # Mencegah file sensitif terunggah ke git
├── package.json              # Definisi dependensi & skrip npm
├── README.md                 # Dokumentasi lengkap proyek
├── src/
│   ├── server.js             # Entry point aplikasi Express & static server
│   ├── config/
│   │   └── googleSheets.js   # Service integrasi Google Sheets API v4
│   ├── controllers/
│   │   ├── creatorController.js  # Handler endpoint publik
│   │   └── adminController.js    # Handler endpoint admin & autentikasi
│   ├── middleware/
│   │   ├── authMiddleware.js     # Validasi JWT token admin
│   │   └── errorHandler.js       # Penanganan error terpusat
│   └── routes/
│       ├── creatorRoutes.js      # Endpoint publik (/api/creators)
│       └── adminRoutes.js        # Endpoint admin (/api/admin)
└── public/
    ├── index.html            # Halaman utama (Landing Page)
    ├── creators.html         # Halaman katalog kreator (Explore)
    ├── register.html         # Formulir pendaftaran kreator baru
    ├── admin.html            # Dashboard pengelola data
    ├── css/
    │   ├── style.css         # Desain utama (oranye, putih, abu-abu, responsif)
    │   └── admin.css         # Desain khusus dashboard admin
    └── js/
        ├── main.js           # Fungsi umum, format angka & toast notifikasi
        ├── creators.js       # Logika katalog, filter, dan modal detail
        ├── register.js       # Logika live card preview & kirim pendaftaran
        └── admin.js          # Logika login, tabel manajemen, & sinkronisasi
```

---

## 🚀 Panduan Instalasi & Menjalankan Website

### 1. Buka Proyek di Visual Studio Code
Buka folder `creatorhub` melalui Visual Studio Code:
* File -> Open Folder -> pilih folder `creatorhub`.
* Buka Terminal terintegrasi di VS Code (`Ctrl + ~` atau `Terminal -> New Terminal`).

### 2. Instalasi Dependensi
Pastikan **Node.js** (v16+) telah terpasang di komputer Anda. Jalankan:
```bash
npm install
```

### 3. Konfigurasi File `.env`
Salin template konfigurasi:
```bash
# Untuk Windows PowerShell:
cp .env.example .env
```
File `.env` sudah siap dengan pengaturan bawaan untuk langsung dicoba di lokal:
* Port default: `3000` (otomatis beralih ke `3001` jika port 3000 sedang digunakan).
* Akun Admin default:
  * Username: `admin`
  * Password: `creatorhub123`

### 4. Jalankan Server
```bash
# Menjalankan server standar:
npm start

# Atau mode pengembang (reload otomatis):
npm run dev
```

Buka browser Anda dan akses:
* 🌐 **Landing Page**: [http://localhost:3000](http://localhost:3000)
* 🔍 **Explore Creators**: [http://localhost:3000/creators.html](http://localhost:3000/creators.html)
* 📝 **Pendaftaran Kreator**: [http://localhost:3000/register.html](http://localhost:3000/register.html)
* ⚙️ **Dashboard Admin**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 📊 Panduan Lengkap Menghubungkan Google Sheets API

Agar seluruh data tersimpan permanen dan tersinkronisasi langsung ke Google Sheets Anda, ikuti langkah mudah berikut:

### Langkah 1: Buat Project di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Login dengan akun Google Anda.
3. Di pojok kiri atas, klik **Select a project** -> **New Project**.
4. Beri nama proyek, misalnya `CreatorHub-Marketplace`, lalu klik **Create**.

### Langkah 2: Aktifkan Google Sheets API
1. Pada menu navigasi kiri, pilih **APIs & Services** -> **Library**.
2. Di kotak pencarian, ketik **Google Sheets API**.
3. Klik pada **Google Sheets API** dan tekan tombol **Enable**.

### Langkah 3: Buat Service Account & Unduh File JSON Kunci
1. Buka menu **APIs & Services** -> **Credentials**.
2. Klik tombol **+ Create Credentials** di bagian atas, pilih **Service Account**.
3. Isi nama service account, misalnya `creatorhub-bot`, lalu klik **Create and Continue**.
4. Pada pilihan role, Anda dapat memilih **Editor** atau lewati (opsional), lalu klik **Done**.
5. Di daftar Service Accounts, klik email service account yang baru dibuat (formatnya mirip: `creatorhub-bot@nama-project.iam.gserviceaccount.com`). **Salin alamat email ini.**
6. Buka tab **Keys** di halaman detail service account.
7. Klik **Add Key** -> **Create new key**.
8. Pilih tipe format **JSON** lalu klik **Create**.
9. File `.json` akan otomatis terunduh ke komputer Anda.
10. Ganti nama file tersebut menjadi `service-account.json` dan letakkan di dalam folder utama proyek `creatorhub/`.

### Langkah 4: Buat Spreadsheet Baru di Google Drive
1. Buka [Google Sheets](https://sheets.new) di browser Anda untuk membuat spreadsheet baru.
2. Beri nama spreadsheet, misalnya `CreatorHub Database`.
3. Klik tombol **Share (Bagikan)** di pojok kanan atas.
4. Masukkan alamat email Service Account yang telah Anda salin pada Langkah 3.
5. Pastikan hak aksesnya adalah **Editor**, lalu hilangkan centang "Notify people" dan klik **Share / Bagikan**.
6. Perhatikan URL spreadsheet Anda di address bar browser:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ```
   Karakter di antara `/d/` dan `/edit` adalah **Spreadsheet ID** Anda.

### Langkah 5: Isi Konfigurasi di File `.env`
Buka file `.env` di VS Code dan lengkapi:

```env
PORT=3000

# Spreadsheet ID dari Langkah 4
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SHEET_NAME=Creators

# Path ke file JSON kredensial dari Langkah 3
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account.json

# Akun Login Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=creatorhub123
JWT_SECRET=kunci_rahasia_jwt_creatorhub_2026
```

### Langkah 6: Restart Server
Jalankan ulang server:
```bash
npm start
```
Console akan menampilkan:
```
✅ [CreatorHub] Terhubung ke Google Sheets API v4 (Spreadsheet ID: 1BxiMV...upms)
📋 [CreatorHub] Header kolom Google Sheet berhasil dibuat.
✨ [CreatorHub] Data awal berhasil disinkronkan ke Google Sheet.
```

Kini setiap kali ada kreator yang mendaftar melalui form registrasi atau admin yang menyetujui/menolak status, perubahannya akan langsung tercatat di Google Sheets secara realtime!

---

## 🎨 Menata Desain Spreadsheet Menjadi Profesional (1-Klik)

Untuk menerapkan desain visual yang rapi, warna oranye khas CreatorHub, pembekuan baris, perataan lebar kolom, validasi dropdown, dan conditional formatting status secara instan, jalankan:

```bash
npm run beautify-sheet
```

Skrip ini akan otomatis:
1. Menata baris header dengan warna oranye brand `#EA580C` dan teks putih tebal.
2. Membekukan Baris 1 (*Freeze Row 1*) agar judul tetap terlihat saat discroll.
3. Mengatur lebar 15 kolom secara presisi pixel.
4. Memformat kolom followers dengan ribuan (`#,##0`).
5. Memasang dropdown *Data Validation* (Platform, Kategori, Status).
6. Memasang *Conditional Formatting* (Status Approved = hijau, Pending = kuning, Rejected = merah).
7. Membuat tab eksekutif `📊 Dashboard` dengan formula realtime (`COUNTA`, `COUNTIF`, `SUMIF`).

---

## 📋 Struktur Kolom di Google Sheet

Backend CreatorHub secara otomatis membuat kolom-kolom berikut di spreadsheet:

| No | Nama Kolom | Keterangan |
|---|---|---|
| A | ID | Kode unik kreator (cth: `CR-1001`) |
| B | Nama Lengkap | Nama pendaftar |
| C | Email | Alamat email aktif |
| D | WhatsApp | Nomor telepon/WA pendaftar |
| E | Platform | Instagram, TikTok, YouTube, atau X |
| F | Username | Handle akun media sosial |
| G | Followers | Jumlah angka followers |
| H | Kategori | Niche konten (Beauty, Tech, Food, dll.) |
| I | Portofolio | Tautan Media Kit / Google Drive |
| J | Foto Profil | Tautan gambar profil |
| K | Bio | Deskripsi singkat profil |
| L | Rate Card | Perkiraan harga kerjasama |
| M | Status | `Pending`, `Approved`, atau `Rejected` |
| N | Tanggal Daftar | Tanggal submit formulir |
| O | Terakhir Diperbarui | Tanggal update terakhir oleh admin |

---

## 🛡️ Keamanan & Praktik Terbaik

* Kredensial Google Cloud Service Account dan JWT Secret hanya berada di sisi backend Node.js dan tidak pernah diekspos ke frontend.
* Endpoint admin dilindungi oleh Bearer Token JWT.
* Input formulir pendaftaran divalidasi di sisi klien dan server sebelum disimpan.

---

## 📄 Lisensi
Dilisensikan di bawah [MIT License](LICENSE).
Dikembangkan untuk platform KOL & Influencer Marketplace modern di Indonesia.
