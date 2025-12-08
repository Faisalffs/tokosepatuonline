# 👟 SepatuKita - Premium Online Shoe Store

**SepatuKita** adalah aplikasi *e-commerce* modern berbasis web yang dibangun dengan konsep *Single Page Application* (SPA). Aplikasi ini hadir dengan antarmuka **Premium Glassmorphism** (Dark Mode) dan fitur lengkap mulai dari katalog interaktif, manajemen pesanan real-time, hingga dashboard admin yang informatif.

Project ini memanfaatkan teknologi **Serverless Firebase** untuk database dan autentikasi, memungkinkan pengelolaan toko online tanpa biaya server backend konvensional.

---

## 👥 Anggota Kelompok 8
Project ini dikerjakan untuk memenuhi Tugas Final Project mata kuliah **Rekayasa Perangkat Lunak**.

| NIM | Nama Mahasiswa | Peran (Jobdesk) |
| :--- | :--- | :--- |
| **701230300** | **Ahmad Faisal Assaudi** | *Fullstack Developer* (Logic JS, Firebase Integration, Admin Panel) |
| **701230095** | **Riska Fitria Rahmadani** | *UI/UX Designer* (CSS Styling, Glassmorphism UI, Responsive) |
| **701230299** | **Ahmad Fikri Gunawan** | *System Analyst* (Testing/UAT, Flowchart, Documentation) |

---

## 🔗 Link Demo & Deployment

* 🌐 **Akses Website:**(http://127.0.0.1:5500/index.html)
* 🎥 **Video Demo:** [https://www.youtube.com/watch?v=QTJ5W8P-ZpY]

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan *Vanilla JavaScript* modern (ES6 Modules) untuk performa maksimal tanpa framework frontend berat.

* **Frontend:** HTML5, CSS3 (Modern Glassmorphism, Animations, Responsive Grid), JavaScript.
* **Backend:** Google Firebase (Authentication & Cloud Firestore).
* **Tools:** Visual Studio Code, Git/GitHub.

---

## ✨ Fitur Unggulan

### 1. Sisi Pengguna (User)
* 🎨 **UI Premium:** Desain gelap (Dark Mode) dengan efek *Glassmorphism* dan animasi partikel.
* 🔍 **Smart Catalog:** Fitur pencarian nama sepatu, filter kategori (Pria/Wanita/Sport/dll), dan urutkan harga.
* 🛒 **Keranjang Sidebar:** Keranjang belanja muncul dari sisi kanan (*Slide-in*) tanpa me-refresh halaman.
* 💸 **Checkout Transfer:** Formulir konfirmasi pembayaran via Transfer Bank (BCA/Dana) dengan fitur **Upload Bukti Bayar** (Gambar).
* 📦 **Status Pesanan:** Sidebar khusus untuk memantau status pesanan (Menunggu Verifikasi, Proses, Selesai) secara real-time.

### 2. Sisi Admin (Dashboard)
* 📊 **Statistik Dashboard:** Kartu indikator jumlah total produk, total stok, dan total pesanan masuk.
* 📂 **Manajemen Produk Terpisah:** Tab terpisah untuk "Daftar Produk" dan "Tambah Produk" agar lebih rapi.
* 📝 **Edit Produk Pop-up:** Mengedit data produk (Nama, Harga, Stok, Foto) melalui modal pop-up yang interaktif.
* ✅ **Verifikasi Pesanan:** Admin dapat melihat foto bukti transfer user, lalu mengubah status pesanan (Menunggu -> Lunas -> Selesai) dengan tombol konfirmasi aman.
* 🖼️ **Image Handling:** Mendukung upload gambar produk maupun emoji sebagai visual produk.

---

## 🔑 Akun Demo (Untuk Pengujian)

Silakan gunakan akun berikut untuk login dan menguji fitur aplikasi:

### **👑 1. Akun Admin (Akses Dashboard)**
* **Email:** `admin@test.com`
* **Password:** `123456`
> *Admin memiliki akses penuh mengelola produk dan memverifikasi pesanan.*

### **👤 2. Akun User (Akses Belanja)**
* **Email:** `user@test.com`
* **Password:** `123456`
> *User dapat melakukan pembelian, upload bukti bayar, dan melihat status pesanan.*

*(Anda juga bisa mendaftar akun user baru melalui menu Register)*

---

## 🚀 Cara Menjalankan Project (Lokal)

Jika ingin menjalankan project ini di komputer sendiri:

1. **Clone Repository**
   ```bash
   git clone [https://github.com/username-anda/SepatuKita.git](https://github.com/username-anda/SepatuKita.git)
