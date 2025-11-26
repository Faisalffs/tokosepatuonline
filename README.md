# 👟 SepatuKita - Web Toko Sepatu Online

![Banner SepatuKita](https://via.placeholder.com/1000x300?text=SepatuKita+Banner)
*(Ganti link gambar di atas dengan screenshot aplikasi Anda jika ada)*

**SepatuKita** adalah aplikasi *e-commerce* berbasis web yang dibangun dengan konsep *Single Page Application* (SPA). Aplikasi ini dirancang untuk memudahkan UMKM sepatu mengelola produk secara online tanpa biaya server backend yang mahal, memanfaatkan teknologi **Serverless Firebase**.

---

## 👥 Anggota Kelompok 8
Project ini dikerjakan untuk memenuhi Tugas Final Project mata kuliah **Rekayasa Perangkat Lunak**.

| NIM | Nama Mahasiswa | Peran (Jobdesk) |
| :--- | :--- | :--- |
| **701230300** | **Ahmad Faisal Assaudi** | *Fullstack Developer* (Logic JS, Firebase Integration) |
| **701230095** | **Riska Fitria Rahmadani** | *UI/UX Designer* (CSS Styling, Responsive Layout) |
| **701230299** | **Ahmad Fikri Gunawan** | *System Analyst* (SRS, Flowchart, Testing/UAT) |

---

## 🔗 Link Demo & Deployment

* 🌐 **Akses Website:** [KLIK DISINI - LINK GITHUB PAGES ANDA]
* 🎥 **Video Demo:** [KLIK DISINI - LINK YOUTUBE ANDA]

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun tanpa framework berat, melainkan menggunakan *Vanilla JavaScript* modern untuk performa maksimal.

* **Frontend:** HTML5, CSS3 (Modern Glassmorphism & Dark Mode), JavaScript (ES6 Modules).
* **Backend:** Google Firebase (Authentication & Cloud Firestore).
* **Tools:** Visual Studio Code, Git/GitHub.

---

## ✨ Fitur Unggulan

### 1. Sisi Pengguna (User)
* 🛒 **Keranjang Sidebar:** Menu keranjang muncul dari samping kanan tanpa menutupi layar (*Push Layout*).
* 🚀 **Animasi "Terbang":** Efek visual produk terbang masuk ke ikon keranjang saat tombol ditekan.
* 🔍 **Smart Sorting:** Fitur urutkan produk (Termurah, Termahal, Terbaru, A-Z).
* 📱 **Checkout WhatsApp:** Pesanan langsung terhubung ke WhatsApp Admin dengan format pesan otomatis.

### 2. Sisi Admin (Dashboard)
* 🔐 **Role-Based Login:** Sistem otomatis mendeteksi Admin dan mengarahkannya ke Dashboard khusus.
* 🖼️ **Hemat Storage:** Upload foto produk menggunakan teknik konversi **Base64** (disimpan langsung di database tanpa biaya Cloud Storage).
* 📝 **CRUD Realtime:** Tambah, Edit, dan Hapus produk dengan pembaruan data langsung (*Realtime Listener*).

---

## 🔑 Akun Demo (Untuk Pengujian)

Gunakan akun berikut untuk mencoba fitur aplikasi:

### **1. Akun Admin (Akses Dashboard)**
* **Email:** `admin@test.com`
* **Password:** `123456`

### **2. Akun User (Akses Belanja)**
* **Email:** `user@test.com`
* **Password:** `123456`
*(Atau Anda bisa mendaftar akun baru sendiri melalui menu Register)*

---

## 🚀 Cara Menjalankan Project (Lokal)

Jika ingin menjalankan project ini di komputer sendiri:

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/username-anda/SepatuKita.git](https://github.com/username-anda/SepatuKita.git)
    ```
2.  **Buka di VS Code**
    Buka folder hasil clone menggunakan Visual Studio Code.
3.  **Install Live Server**
    Pastikan ekstensi *Live Server* sudah terinstall di VS Code.
4.  **Jalankan**
    Klik kanan pada file `index.html`, lalu pilih **"Open with Live Server"**.

> **Catatan:** Koneksi internet diperlukan karena aplikasi mengambil data langsung dari Firebase.

---

## ⚠️ Batasan Sistem & Catatan
* **Ukuran Gambar:** Karena menggunakan Base64, ukuran file gambar saat upload dibatasi maksimal **900KB**.
* **Pembayaran:** Belum terintegrasi dengan Payment Gateway otomatis (Transfer manual via konfirmasi WA).

---

## 📄 Lisensi & Kredit
Project ini dibuat untuk keperluan akademik di **Universitas Islam Negeri Sultan Thaha Saifuddin Jambi**, Fakultas Sains dan Teknologi, Prodi Sistem Informasi.

**Dosen Pengampu:** [MASUKKAN NAMA DOSEN DISINI]
