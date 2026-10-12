# 🌿 HabitGrow — Dokumen Arsitektur Proyek & Panduan Skripsi Lengkap

> **Versi Dokumen:** 1.3.0  
> **Terakhir Diperbarui:** 12 Oktober 2026  
> **Target Pengguna:** Pengembang, Agen AI (*Context File*), dan Penulisan Laporan Tugas Akhir / Skripsi (Program Studi Sistem Komputer / Teknik Informatika / Sistem Informasi).

---

## 📑 DAFTAR ISI
1. [Ringkasan Eksekutif & Latar Belakang](#1-ringkasan-eksekutif--latar-belakang)
2. [Spesifikasi Kebutuhan Sistem (SRS)](#2-spesifikasi-kebutuhan-sistem-srs)
3. [Arsitektur Perangkat Lunak, Bahasa Pemrograman & Metodologi](#3-arsitektur-perangkat-lunak--teknologi)
   * 3.1 Rincian Tech Stack
   * 3.2 Bahasa Pemrograman yang Digunakan & Peran Spesifiknya
   * 3.3 Metodologi Rekayasa Perangkat Lunak (SDLC) & Riset Akademis
   * 3.4 Landasan Teori Ilmiah & Model Perilaku Pengguna (Behavioral Psychology)
   * 3.5 Arsitektur Distribusi & Generasi File Instalasi Mobile (Android APK)
   * 3.6 Arsitektur Antarmuka Responsif Mobile (Android/iOS), Drawer Hamburger & Eliminasi Containing-Block Bug
   * 3.7 Arsitektur Web Push Latar Belakang (Service Worker, VAPID, FCM & PWA Notifikasi Layar Terkunci)
   * 3.8 Pemodelan Diagram Alir Data (Data Flow Diagram - DFD)
   * 3.9 Standarisasi Simbol Flowchart ANSI/ISO & Pemetaan Sistem
   * 3.10 Pemodelan Diagram Alir Sistem (Flowchart Detail Alur Bisnis & Algoritma)
4. [Perancangan Basis Data & Skema ERD](#4-perancangan-basis-data--skema-erd)
   * 4.1 Diagram Hubungan Entitas (ERD 13 Tabel)
   * 4.2 Kamus Data & Spesifikasi Tabel (13 Tabel Relasional)
   * 4.3 Matriks Relasi & Kardinalitas Antar Entitas
5. [Formulasi Algoritma & Logika Matematika Inti](#5-formulasi-algoritma--logika-matematika)
   * 5.1 Logika Non-Zero Day Global Daily Streak
   * 5.2 Logika Deteksi & Pemulihan Streak Putus (*Broken Streak*)
   * 5.3 Logika Skor Konsistensi Bergulir 30 Hari (*Rolling Consistency*)
   * 5.4 Logika Siklus Hidup Pohon Virtual (*Tree Growth & Lifecycle*)
   * 5.5 Logika Perhitungan XP & Progresi Level
   * 5.6 Logika Mutasi Antarmuka Instan (*Optimistic UI State & Rollback*)
   * 5.7 Formulasi Sistem Pendukung Keputusan (SPK) Metode SAW: Prediksi Risiko Kegagalan (*Habit Churn*)
6. [Katalog Endpoint RESTful API](#6-katalog-endpoint-restful-api)
7. [Alur Bisnis End-to-End (User Journey & State Machine)](#7-alur-bisnis-end-to-end-user-journey--state-machine)
   * 7.1 Alur Eksekusi Checklist Taktil (Optimistic UI & Server Sync)
   * 7.2 Alur Sistem Pendukung Keputusan (SPK) SAW & Rekomendasi Adaptif
8. [Struktur Direktori & Pemetaan Kode Sumber](#8-struktur-direktori--pemetaan-kode-sumber)
   * 8.1 Identitas Visual, Filosofi Logo & Lokasi Aset Gambar
9. [Cetak Biru Integrasi IoT untuk Skripsi Sistem Komputer](#9-cetak-biru-integrasi-iot-untuk-skripsi-sistem-komputer)
10. [Panduan Penulisan Proposal & Bab Skripsi (Bab 1 s/d Bab 5)](#10-panduan-penulisan-proposal--bab-skripsi)
    * 10.1 Pilihan Judul Skripsi yang Layak Diajukan
    * 10.2 Kerangka Bab Skripsi (Bab 1 s/d Bab 5)
    * 10.3 Matriks Pemetaan Diagram Pemodelan untuk Bab 3 & Bab 4 Skripsi

---

## 1. RINGKASAN EKSEKUTIF & LATAR BELAKANG

### 1.1 Identitas Aplikasi
* **Nama Proyek:** HabitGrow
* **Tagline:** *Gamified Habit Tracker & Virtual Tree Progression System*
* **Platform:** Web Responsive (PWA-ready) & IoT Extensible
* **Paradigma Inti:** *Non-Zero Day Principle*, *Visual Empathy*, *Botanical Metaphor Gamification*, *Decision Support System (DSS) Early Warning*.

### 1.2 Masalah yang Diselesaikan (*Problem Statement*)
Aplikasi pelacak kebiasaan konvensional sering kali gagal mempertahankan retensi pengguna dalam jangka panjang karena:
1. **Efek *Streak Fatigue* & Keputusasaan:** Pada aplikasi biasa, ketika pengguna gagal melakukan kebiasaan selama satu hari saja, *streak* gabungan langsung di-reset ke nol. Hal ini memicu efek psikologis *“what-the-hell effect”*, di mana pengguna merasa semua usahanya sia-sia dan akhirnya meninggalkan aplikasi.
2. **Visualisasi yang Kering dan Monoton:** Hanya berupa daftar checklist teks tanpa representasi visual organik yang mencerminkan pertumbuhan diri.
3. **Latensi Checklist yang Mengganggu:** Ketergantungan pada panggilan jaringan asinkron lambat membuat antarmuka terasa kaku saat mencentang kebiasaan.
4. **Ketiadaan Hubungan dengan Dunia Nyata:** Pelacak digital terisolasi di dalam layar gawai tanpa kehadiran fisik di meja kerja pengguna.
5. **Ketiadaan Sistem Pencegahan Dini Bersifat Prediktif (*Lack of Proactive Early Warning*):** Aplikasi umum bersifat pasif; hanya mencatat kegagalan setelah hari berganti, tanpa memberikan peringatan dini atau rekomendasi adaptif saat pengguna sedang berisiko tinggi melewatkan tugas hari itu.

### 1.3 Solusi HabitGrow
HabitGrow mengatasi masalah tersebut melalui:
* **Algoritma *Non-Zero Day Global Streak*:** Pengguna cukup menyelesaikan minimal 1 kebiasaan apa pun setiap hari agar api *streak* utama tidak padam.
* **Sistem Metafora Pohon Virtual (*Botanical Progression*):** Rutinitas pengguna secara langsung memberi nutrisi pada pohon virtual interaktif yang berevolusi melalui 5 tahap kehidupan (*Seed* $\rightarrow$ *Sprout* $\rightarrow$ *Young Tree* $\rightarrow$ *Healthy Tree* $\rightarrow$ *Mature Tree*).
* **Desain UI Berorientasi Manusia (*Human-Crafted Editorial*):** Menolak tata letak generik buatan AI; mengedepankan sapaan hangat personal, palet warna alam organik, kartu taktil dengan respons 0ms (*Optimistic UI*), dan konfeti perayaan instan.
* **Sistem Pendukung Keputusan (DSS) Deteksi Risiko & Rekomendasi Adaptif (*Simple Additive Weighting - SAW*):** Mengevaluasi kebiasaan yang berisiko terlewat hari ini menggunakan metode Multi-Criteria Decision Making **Simple Additive Weighting (SAW)** dengan 5 kriteria perilaku ($V_i \ge 0.50$), serta menyajikan rekomendasi keputusan preskriptif (*Smart Nudge / Aturan 2 Menit*) 1-klik untuk menurunkan target sementara.
* **Kesiapan Arsitektur IoT (Khusus Skripsi Sistem Komputer):** Backend berbasis REST API murni yang siap menerima pemicu fisik dari mikrokontroler (ESP32/RFID/NFC) maupun perangkat display meja mini.

---

## 2. SPESIFIKASI KEBUTUHAN SISTEM (SRS)

### 2.1 Kebutuhan Fungsional (Functional Requirements)
* **[FR-01] Autentikasi & Profil:** Pengguna dapat mendaftar, masuk, keluar, serta memperbarui nama tampilan dan preferensi zona waktu secara aman.
* **[FR-02] Manajemen Kebiasaan (CRUD):** Pengguna dapat membuat, melihat, memperbarui (Edit Modal), mengarsipkan, dan menghapus kebiasaan dengan kustomisasi ikon, warna hex, tingkat kesulitan (*Easy/Medium/Hard*), target kuantitatif, dan satuan. Konfirmasi penghapusan disajikan melalui modal dialog kustom profesional dengan peringatan risiko kehilangan riwayat data.
* **[FR-03] Penjadwalan Fleksibel:** Sistem mendukung tiga modalitas frekuensi: Harian (*DAILY*), Hari Tertentu (*SELECTED_DAYS*), dan Target Mingguan (*WEEKLY_TARGET*).
* **[FR-04] Eksekusi & Checklist Instan:** Pengguna dapat mencentang kebiasaan harian dengan umpan balik visual instan (0 milidetik) melalui mekanisme *Optimistic UI Update*.
* **[FR-05] Mesin Gamifikasi XP & Level:** Setiap penyelesaian kebiasaan menghasilkan *Experience Points* (XP) berdasarkan tingkat kesulitan yang berkontribusi pada kenaikan level pengguna secara terstruktur.
* **[FR-06] Pelacak Multi-Streak (Global & Individual):** Sistem memelihara *streak* spesifik untuk masing-masing kebiasaan sekaligus menghitung *Global Daily Streak* berbasis prinsip *Non-Zero Day*.
* **[FR-07] Deteksi & Peringatan Streak Putus (*Broken Streak Alert*):** Sistem secara otomatis mendeteksi jika sebuah kebiasaan mengalami putus *streak* pada hari kemarin dan menampilkan banner pemberitahuan yang empatik.
* **[FR-08] Ekosistem Pohon Virtual:** Pertumbuhan dan kesehatan pohon ditentukan oleh skor konsistensi bergulir 30 hari (*Rolling 30-Day Consistency Score*).
* **[FR-09] Sistem Pencapaian (*Achievements*):** Membuka lencana dan trofi khusus ketika pengguna mencapai tonggak sejarah tertentu (misal: *First Step*, *Streak 7 Days*, *Mature Tree*).
* **[FR-10] Analitik & Riwayat:** Menyajikan rekapitulasi data visual, kalender aktivitas, dan distribusi kebiasaan.
* **[FR-11] Filter Dashboard Dinamis:** Memfasilitasi penyaringan daftar tugas hari ini (*Semua*, *Belum Selesai*, *Selesai*).
* **[FR-12] Dukungan Tema Ganda:** Antarmuka responsif dengan transisi mulus antara Mode Gelap (*Dark Mode*) dan Mode Terang (*Light Mode*).
* **[FR-13] Sistem Pendukung Keputusan (DSS) Risiko Kegagalan (*Simple Additive Weighting - SAW*):** Sistem secara proaktif mengevaluasi riwayat 14 hari pengguna menggunakan metode Multi-Criteria Decision Making **Simple Additive Weighting (SAW)** dengan 5 kriteria terbobot ($W_1 = 0.30, W_2 = 0.25, W_3 = 0.15, W_4 = 0.15, W_5 = 0.15$). Jika nilai preferensi $V_i \ge 0.50$ (50%), sistem menyajikan rekomendasi adaptif (*Decision Support Nudge / Aturan 2 Menit*) dengan opsi penyesuaian target kuantitas 1-klik (`PATCH /api/habits/[id]`).
* **[FR-14] Sistem Notifikasi & Pengingat Proaktif Browser (Web Notification API):** Sistem terintegrasi dengan Web Notification API standar peramban untuk mengirimkan notifikasi pengingat kebiasaan harian dan peringatan dini (*Early Warning Push Notification*) secara otomatis langsung ke layar perangkat pengguna saat metode SAW mendeteksi risiko kegagalan kebiasaan sebelum tengah malam.

### 2.2 Kebutuhan Non-Fungsional (Non-Functional Requirements)
* **[NFR-01] Latensi Umpan Balik Antarmuka:** Perubahan status visual checklist harus $\le 50\text{ ms}$ di sisi klien tanpa menunggu *round-trip* server selesai.
* **[NFR-02] Integritas Data & Keamanan (RLS):** Seluruh baris data pada PostgreSQL dilindungi oleh *Row Level Security* (RLS) di mana pengguna hanya dapat membaca dan memodifikasi datanya sendiri.
* **[NFR-03] Kepatuhan Standar RESTful:** Seluruh komunikasi klien-server menggunakan protokol HTTP dengan kata kerja standar (`GET`, `POST`, `PATCH`, `DELETE`) dan payload berformat JSON.
* **[NFR-04] Ketersediaan API untuk Eksternal:** API dirancang *stateless* sehingga dapat diakses oleh mikrokontroler IoT dengan autentikasi berbasis Bearer Token / Supabase JWT.
* **[NFR-05] Keandalan Pengujian (*Test Coverage*):** Seluruh modul algoritma matematika inti wajib memiliki *unit tests* terotomatisasi dengan tingkat keberhasilan 100%.
* **[NFR-06] Efisiensi Komputasi Algoritma SPK SAW (Serverless Execution Latency):** Waktu komputasi normalisasi 5 kriteria dan perhitungan nilai preferensi SAW pada serverless runtime harus $\le 10\text{ ms}$ per evaluasi tanpa membebani performa server atau memerlukan microservice Python/GPU terpisah.
* **[NFR-07] Ergonomi Responsif Seluler (Mobile Android & iOS UI/UX):** Antarmuka wajib mematuhi standar ergonomi *thumb zone* seluler (touch target $\ge 40\text{px}$), bilah navigasi bawah (*Bottom Navigation Bar*) terlabuh di dasar viewport dengan perlindungan *safe area* iOS (`env(safe-area-inset-bottom)`), laci navigasi samping (*Slide-over Hamburger Drawer*) untuk rute komprehensif dan profil/logout, serta tata letak metrik *Executive Command Bar* berbasis grid 3-kolom proporsional tanpa wrapping tak beraturan pada resolusi sempit ($360\text{px} - 430\text{px}$).

---

## 3. ARSITEKTUR PERANGKAT LUNAK & TEKNOLOGI

Aplikasi HabitGrow mengadopsi arsitektur modern **Fullstack Jamstack / Micro-Services Ready** dengan pemisahan tegas antara lapisan presentasi, logika bisnis, dan basis data:

```mermaid
graph TD
    subgraph Klien / Frontend (Next.js 16 + React 19)
        UI[Halaman & Komponen UI]
        RQ[TanStack React Query - Cache & Optimistic UI]
        UI -->|Aksi Centang 0ms| RQ
    end

    subgraph Perangkat Eksternal (IoT)
        ESP32[Mikrokontroler ESP32 / RFID Sensor]
    end

    subgraph Lapisan Server / API Routes
        API[Next.js Route Handlers / REST API]
        VAL[Zod Schema Validators]
        SVC[Domain Service Layer]
        ALG[Pure Mathematical Algorithms]
        API --> VAL --> SVC --> ALG
    end

    subgraph Lapisan Basis Data (Supabase Cloud)
        AUTH[Supabase Auth - JWT]
        PG[(PostgreSQL 15)]
        RLS[Row Level Security Engine]
        PG --- RLS
    end

    RQ -->|HTTP REST JSON| API
    ESP32 -->|HTTP POST /api/habits/:id/complete| API
    SVC -->|Supabase SDK / SQL| PG
```

### 3.1 Rincian Tech Stack
* **Framework Frontend:** Next.js 16.3.5 (App Router, Turbopack Engine).
* **Library Antarmuka:** React 19, Lucide React (ikonografi modern), Canvas Confetti (efek selebrasi taktil).
* **Manajemen State & Cache Server:** TanStack React Query v5 (Optimistic Mutations, Automatic Invalidation, Cache Rollback).
* **Styling & Desain:** Tailwind CSS v4, CSS Variables, Nature-inspired HSL color tokens.
* **Backend Runtime & Arsitektur API:** Node.js 20+ / Next.js Serverless Route Handlers (RESTful API murni dengan verba HTTP baku `GET`, `POST`, `PATCH`, `DELETE`).
* **Mesin Sistem Pendukung Keputusan (DSS):** Multi-Criteria Decision Making (MCDM) metode **Simple Additive Weighting (SAW)** dengan 5 Kriteria Terbobot ($C_1..C_5$) dan normalisasi linear benefit (waktu eksekusi $< 1\text{ ms}$ secara deterministik).
* **Validasi Skema:** Zod v3 (validasi *runtime payload* ketat di sisi klien dan server).
* **Basis Data & Keamanan:** PostgreSQL 15 via Supabase Cloud (Row Level Security / RLS, Foreign Keys, UUID v4, Triggers).
* **Otentikasi & Verifikasi Email:** Supabase Auth dengan PKCE Flow & SSR Callback Route (`/auth/callback`) untuk pertukaran kode verifikasi email lintas perangkat (*mobile-friendly*).
* **Platform Hosting & Distribusi:** Vercel Cloud Platform (URL Produksi: `https://habitsgrow.vercel.app/`) dengan kapabilitas Progressive Web App (PWA) responsif seluler.
* **Unit Testing:** Vitest v5 (menjamin kebenaran seluruh formula algoritma matematika 100% lulus 41 test cases).

---

### 3.2 Bahasa Pemrograman yang Digunakan & Peran Spesifiknya

Untuk keperluan penulisan Bab 3 Skripsi dan pemahaman mendalam AI, berikut adalah taksonomi bahasa pemrograman yang digunakan pada proyek HabitGrow:

| No | Bahasa Pemrograman | Lingkungan / Lapisan | Peran & Tanggung Jawab dalam Sistem |
| :---: | :--- | :--- | :--- |
| 1 | **TypeScript (v5.x)** | Fullstack (Frontend & Backend Route Handlers) | Merupakan bahasa pemrograman utama pada seluruh aplikasi. Menggunakan sistem pengetikan statis (*static typing*), *interface*, dan *generics* untuk mencegah galat *runtime* (*null/undefined pointer*), mempercepat *refactoring*, serta memastikan konsistensi kontrak data antara klien dan server. |
| 2 | **SQL (PostgreSQL 15 Dialect)** | Basis Data (Supabase Cloud) | Digunakan untuk mendefinisikan skema tabel (*DDL*), relasi kunci asing, *unique constraints*, fungsi pemicu (*triggers*), indeks kinerja (B-Tree), dan kebijakan keamanan baris data (*Row Level Security / RLS*). |
| 3 | **CSS3 (Tailwind CSS v4 Engine)** | Frontend Presentation Layer | Mengatur seluruh tata letak visual, responsivitas multi-layar, variabel warna dinamis (HSL), efek kaca (*glassmorphism*), serta transisi *micro-animation* tema terang/gelap. |
| 4 | **HTML5 (Semantic JSX)** | Frontend Structure | Struktur dokumen web berbasis tag semantik (`<header>`, `<main>`, `<section>`, `<article>`), atribut aksesibilitas (*ARIA labels*), dan kepatuhan standar WCAG. |
| 5 | **C / C++ (Arduino Framework)** *(Sub-sistem IoT)* | Firmware Mikrokontroler (ESP32) | Digunakan pada skenario skripsi Sistem Komputer untuk memprogram mikrokontroler ESP32: menginisialisasi modul sensor RFID-RC522 via antarmuka SPI, membaca kartu NFC, mengendalikan layar TFT, serta mengirimkan paket HTTP POST JSON ke server via Wi-Fi. |

---

### 3.3 Metodologi Rekayasa Perangkat Lunak (SDLC) & Riset Akademis

Dalam penyusunan skripsi, proyek ini mengadopsi metodologi pengembangan formal berikut:

#### 1. Model Pengembangan Sistem: *Agile Development with Prototyping*
* **Fase 1: Analisis Kebutuhan (*Requirements Engineering*):** Identifikasi masalah psikologis *streak fatigue*, perumusan Kebutuhan Fungsional (FR) dan Non-Fungsional (NFR).
* **Fase 2: Perancangan Arsitektur (*System Architecture & Database Design*):** Perancangan ERD relasional 13 tabel, pemodelan diagram sekuens, dan spesifikasi REST API.
* **Fase 3: Implementasi Bertahap (*Incremental Sprints*):**
  * *Sprint 1:* Autentikasi dan fondasi CRUD kebiasaan.
  * *Sprint 2:* Implementasi algoritma matematika (*Streak*, *Consistency*, *Level*, *Tree*).
  * *Sprint 3:* Optimasi antarmuka taktil (0ms *Optimistic UI Update*) dan selebrasi visual.
  * *Sprint 4:* Integrasi modul deteksi streak putus dan filter kebiasaan harian.
* **Fase 4: Pengujian & Evaluasi (*Verification & Validation*):** Pengujian unit terotomatisasi (*Unit Testing*) dan pengujian fungsi kotak hitam (*Black-box Testing*).

#### 2. Metodologi Pengujian (*Testing Methodology*):
* **Unit Testing Terotomatisasi (Vitest):** Pengujian unit berbasis pendekatan *Test-Driven Development (TDD)* pada modul algoritma matematika (`src/lib/algorithms/__tests__/`). Menjalankan **31 skenario uji deterministik** (12 uji streak, 6 uji pohon, 5 uji level, 4 uji XP, 4 uji konsistensi) dengan tingkat kelulusan 100%.
* **Blackbox Functional Testing:** Pengujian seluruh rute antarmuka pengguna, validasi form Zod, transisi tema terang/gelap, dan penanganan galat HTTP (400, 401, 500).
* **Network & Latency Testing:** Mengukur perbedaan waktu persepsi pengguna antara rendering optimistik lokal ($\le 10\text{ ms}$) dibandingkan respons jaringan Supabase (rata-rata $150 - 400\text{ ms}$).

---

### 3.4 Landasan Teori Ilmiah & Model Perilaku Pengguna (Behavioral Psychology)

HabitGrow bukan sekadar aplikasi pencatat, melainkan implementasi sistem dari teori-teori psikologi perilaku pembentukan kebiasaan:

1. **Teori *The Habit Loop* (Charles Duhigg & James Clear - *Atomic Habits*):**
   * **Cue (Pemicu):** Tampilan tanggal personal, status kebun harian, serta pemicu fisik meja (*NFC desk tag*).
   * **Routine (Rutinitas):** Pelaksanaan kebiasaan positif yang dicatat melalui checklist taktil.
   * **Reward (Hadiah Instan):** Perolehan XP, animasi konfeti mekar, pembaruan level, dan kesegaran visual pohon virtual.
2. **Prinsip Psikologis *Non-Zero Day*:**
   * Menghilangkan rasa bersalah dan keputusasaan (*the what-the-hell effect*). Filosofi bahwa melakukan 1 kemajuan kecil jauh lebih bermakna daripada tidak sama sekali (0%). Hal ini diterjemahkan ke dalam algoritma *Global Daily Streak*.
3. **Teori Determinasi Diri (*Self-Determination Theory / SDT*) & Kerangka Gamifikasi Octalysis (Yu-kai Chou):**
   * *Development & Accomplishment:* Sistem Level bertingkat dan lencana pencapaian (*Achievements*).
   * *Ownership & Possession:* Pohon virtual yang bertumbuh seiring kedisiplinan diri.
   * *Empowerment of Creativity:* Kebebasan memilih warna, ikon, target kuantitas, dan frekuensi jadwal kebiasaan.

---

### 3.5 Arsitektur Distribusi & Generasi File Instalasi Mobile (Android APK)

Dalam konteks penyelesaian Tugas Akhir / Skripsi yang membutuhkan pengujian langsung pada gawai *smartphone* Android pengguna atau dosen penguji, sistem HabitGrow dirancang untuk dapat diekstrak menjadi **file paket instalasi fisik (`.apk`)**.

#### 1. Tiga Modalitas Pembangkitan File Instalasi Android (`.apk`):
* **Modalitas A: PWABuilder / Trusted Web Activity (TWA) — Instan & Efisien:**
  * Memanfaatkan *Progressive Web App manifest* dan integrasi Chrome Custom Tabs / TWA resmi dari Google.
  * Platform [PWABuilder](https://www.pwabuilder.com) membungkus URL hosting produksi (`https://habit-grow.vercel.app`) menjadi file `HabitGrow.apk` dalam hitungan 5 menit tanpa perlu mengunduh SDK Android Studio berukuran puluhan gigabyte di laptop pengembang.
* **Modalitas B: Capacitor Native Bridge (`@capacitor/android`) — Standar Industri Hybrid:**
  * Mengintegrasikan `@capacitor/core` dan `@capacitor/android` langsung ke repositori Next.js.
  * Mengonfigurasi `capacitor.config.json` dengan parameter `server.url` yang mengarah ke Vercel.
  * Menghasilkan proyek Android Studio native lengkap dengan struktur Gradle, di mana perintah `./gradlew assembleDebug` langsung memproduksi berkas fisik:
    `android/app/build/outputs/apk/debug/app-debug.apk`.
* **Modalitas C: Expo / React Native EAS Cloud Build — Full Native Frontend:**
  * Membangun frontend khusus seluler terpisah yang mengonsumsi Supabase Database dan REST API HabitGrow.
  * Menggunakan kompilasi cloud Expo (`eas build -p android --profile preview`) yang secara otomatis menghasilkan link unduhan file `.apk` mandiri.

#### 2. Justifikasi Akademis: Kebijakan Google Play Store vs. Standar Pengujian Skripsi:
* **Fakta Regulasi Akademis:** Standar kelulusan dan sidang skripsi di perguruan tinggi (berdasarkan panduan BAN-PT dan LAM INFOKOM) menitikberatkan pada validitas algoritma, kesesuaian arsitektur sistem, dan pengujian fungsionalitas (*Blackbox & UAT*).
* **Tidak Ada Keharusan Masuk Play Store:** Penguji tidak mewajibkan aplikasi terdaftar di Google Play Store publik. Kebijakan Google Play Store saat ini yang mewajibkan biaya registrasi $25 USD serta pengujian tertutup 20 orang selama 14 hari merupakan regulasi komersial distribusi massal, bukan parameter keilmuan teknologi informasi.
* **Format Demonstrasi Sidang:** Menghasilkan file instalasi mandiri berformat `.apk` yang dipasang melalui *package installer* (fitur *sideloading*) pada smartphone penguji sudah 100% memenuhi syarat demonstrasi karya perangkat lunak dan dicantumkan secara formal pada Bab 1 sub-bab *Batasan Masalah*.

---

### 3.6 Arsitektur Antarmuka Responsif Mobile (Android/iOS), Drawer Hamburger & Eliminasi Containing-Block Bug

Pengalaman pengguna (*User Experience*) pada peramban seluler (Chrome Android & Safari iOS) memerlukan penanganan arsitektural khusus agar antarmuka tidak mengalami disorientasi visual (*layout shift*) maupun tumpang tindih elemen (*visual clipping*).

#### 1. Identifikasi Akar Masalah & Eliminasi "CSS Containing Block Bug":
* **Gejala Masalah Sebelumnya:** Pada pengujian awal di perangkat seluler Android, bilah navigasi bawah (*Bottom Navigation Bar*) tampak menempel di bagian paling atas layar persis di bawah URL bar Chrome, dengan 6 ikon menu berdesakan dan memicu tumpang tindih dengan header.
* **Akar Masalah Matematis/Spesifikasi CSS:**
  Sesuai spesifikasi W3C CSS Transforms Module Level 1 & Filter Effects Module Level 1:
  $$\text{Jika suatu elemen memiliki } \texttt{backdrop-filter} \ne \text{none}, \text{ maka elemen tersebut menjadi } \textbf{containing block} \text{ baru bagi keturunan } \texttt{position: fixed}.$$
  Karena bilah navigasi seluler sebelumnya diletakkan sebagai anak (*child*) di dalam `<header className="... backdrop-blur-md">`, instruksi `fixed bottom-0` tidak lagi mengacu pada dasar layar *viewport* ponsel, melainkan mengacu pada dasar elemen `<header>` di bagian atas layar!
* **Solusi Arsitektural:** Memindahkan komponen laci navigasi samping (*Slide-over Drawer*) dan bilah navigasi bawah (*Mobile Bottom Navigation Bar*) keluar dari elemen `<header>` menggunakan React Fragments (`<> <header /> <Drawer /> <nav /> </>`). Dengan demikian, `fixed bottom-0` dan `fixed inset-0` secara murni terlabuh pada *root viewport* perangkat.

#### 2. Spesifikasi Slide-Over Hamburger Drawer Navigation:
* **Desain Header Seluler Bersih (*Clean Minimalist Top Header*):** Header seluler di bagian atas hanya menampilkan logo HabitGrow di sebelah kiri dan sakelar tema (`ThemeToggle`) di sebelah kanan. Tombol menu di kanan atas dihilangkan untuk menghindari duplikasi antarmuka (*redundancy*) dengan bilah navigasi bawah.
* **Pemicu Tab Menu Bawah:** Laci navigasi samping (*Slide-over Drawer*) dipicu secara elegan melalui tombol tab `Menu` pada bilah navigasi bawah (*Bottom Nav*), yang berada langsung dalam jangkauan alami ibu jari pengguna (*thumb-zone*).
* **Backdrop Blur & Animasi Sheet:** Ketika tombol ditekan, lembaran drawer samping (`w-[85%] max-w-xs h-full`) muncul dari sisi kanan dengan efek *slide-in-from-right* dan latar belakang semi-transparan `bg-slate-950/60 backdrop-blur-xs`, lengkap dengan tombol penutup silang (`X`) di sudut kanan atas lembaran drawer.
* **Kunci Scroll Tubuh Dokumen (*Body Scroll Lock*):**
  ```typescript
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);
  ```
* **Navigasi Rute Komprehensif:** Menyediakan 6 rute lengkap (Dashboard, Kebiasaan, Pohon Virtual, Kalender, Statistik, Pencapaian) dengan target sentuh tinggi $\ge 44\text{px}$, tautan profil pengguna, dan tombol keluar (*logout*) terisolasi.
* **Auto-Close on Route Change:** Drawer otomatis menutup secara mulus saat pengguna menavigasi ke halaman baru melalui *listener* `pathname`.

#### 3. Bilah Navigasi Bawah Ergonomis (*Ergonomic Mobile Bottom Nav*):
* **Optimasi Thumb-Zone (5 Tab Utama):** Disederhanakan menjadi 5 tab berjarak seimbang: `Beranda`, `Kebiasaan`, `Pohon`, `Kalender`, dan `Menu` (yang membuka Hamburger Drawer).
* **Perlindungan Safe-Area iOS:** Menggunakan utilitas dinamis `pb-[max(0.375rem,env(safe-area-inset-bottom))]` guna mencegah tab navigasi terhalang oleh garis bilah beranda (*home indicator bar*) pada iPhone modern.
* **Layout Offset:** Elemen `<main>` pada `app/layout.tsx` dilengkapi padding bawah `pb-24 md:pb-12` agar konten terbawah kartu tugas tidak pernah tertutup oleh bilah navigasi.

#### 4. Tata Letak Dashboard Command Bar & Habit Card Ramah Sentuh:
* **Metrik 3-Kolom Rapat:** Tiga kartu statistik inti (Streak, Level XP, Konsistensi) diorganisasikan dalam grid 3-kolom seimbang (`grid grid-cols-3 gap-2 w-full`) dengan teks ringkas terpotong rapi (*no wrapping*), diikuti tombol "+ Tambah Kebiasaan" selebar penuh (*full-width CTA*) di bawahnya agar mudah dijangkau ibu jari pengguna dengan satu tangan.
* **Header & Tab Filter Seluler:** Judul "Rencana Kebiasaan Hari Ini" dan tombol "Kelola Semua" terkunci rapi pada satu baris (`flex items-center justify-between`), serta tab filter `Semua`, `Belum`, `Selesai` terbagi proporsional 3-kolom rata di layar sempit.
* **Kartu Kebiasaan (*HabitCard*):** Diberi padding rapat `p-3.5 sm:p-5`, avatar ikon `w-10 h-10`, lencana kategori mikro, serta tombol centang lingkaran taktil berukuran optimal (`w-9 h-9 sm:w-11 sm:h-11`) dengan utilitas `touch-manipulation` untuk respons sentuhan berlatensi 0ms.

### 3.7 Arsitektur Web Push Latar Belakang (Service Worker, VAPID, FCM & PWA Notifikasi Layar Terkunci)

Salah satu pertanyaan fundamental dalam perancangan aplikasi pelacak kebiasaan berbasis web adalah: **"Apakah aplikasi web tetap dapat mengirimkan pengingat dan peringatan dini SPK ketika ponsel dalam keadaan layar terkunci (lock screen) dan peramban (Chrome/Safari) tidak sedang dibuka?"**

Pada aplikasi web generasi lampau, notifikasi hanya dapat muncul jika tab halaman sedang aktif terbuka (*in-app notification*). Namun, dengan standar **Progressive Web App (PWA)** modern, HabitGrow menerapkan arsitektur **Web Push Notifications** standar W3C & IETF (RFC 8030, RFC 8291, RFC 8292) yang mampu membangunkan sistem operasi ponsel secara independen di latar belakang:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Ponsel Layar Terkunci)
    participant OS as OS Ponsel (Android / iOS)
    participant SW as Service Worker (public/sw.js)
    participant FCM as Push Service (Google FCM / Apple APNs)
    participant Server as Server HabitGrow (Next.js API)
    participant Cron as Evaluator SPK SAW / Cron Job

    Note over User,SW: Fase 1: Registrasi & Handshake Awal (Sekali Saja)
    User->>SW: Klik "Aktifkan Web Push" di Dashboard/Profil
    SW->>OS: Minta Izin Notifikasi (Notification.requestPermission())
    OS-->>SW: Izin Diberikan ("granted")
    SW->>FCM: pushManager.subscribe(VAPID Public Key)
    FCM-->>SW: PushSubscription (Endpoint URL + Kunci Enkripsi p256dh & auth)
    SW->>Server: POST /api/notifications/subscribe { subscription }
    Server->>Server: Simpan ke tabel notifications (type: 'PUSH_SUBSCRIPTION')

    Note over User,OS: Fase 2: Pengiriman Notifikasi Saat Layar Mati / Chrome Ditutup
    Cron->>Server: POST /api/cron/reminders (Pukul 19:00 / Terjadwal)
    Server->>Server: Evaluasi Matriks SPK SAW (Deteksi Habit Risiko Vi >= 0.50)
    Server->>FCM: webpush.sendNotification(PushSubscription, Encrypted Payload)
    FCM->>OS: Kirim Sinyal Push Jaringan ke Device Token
    Note over OS: Ponsel berdering/bergetar di Lock Screen
    OS->>SW: Bangunkan Background Service Worker (event: 'push')
    SW->>OS: self.registration.showNotification(Title, { vibrate, tag, data })
    OS-->>User: Tampilkan Banner Notifikasi Peringatan SPK di Lock Screen!
    User->>OS: Tap Notifikasi di Lock Screen
    OS->>SW: Tangani event: 'notificationclick'
    SW->>OS: Buka/Fokuskan Tab https://habitgrow.app/app/dashboard
```

#### Komponen Utama Arsitektur Web Push HabitGrow:
1. **Voluntary Application Server Identification (VAPID):**
   * Menggunakan pasangan kunci kurva eliptik P-256 (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY`). Kunci ini menandatangani token JWT secara kriptografis sehingga Push Service (Google FCM / Apple APNs) dapat memverifikasi bahwa sinyal push memang berasal dari server resmi HabitGrow tanpa memerlukan akun developer berbayar.
2. **Background Service Worker (`public/sw.js`):**
   * Beroperasi pada *thread* terpisah di luar konteks DOM halaman web. Ketika sistem operasi perangkat menerima paket data dari FCM/APNs, OS mengalokasikan siklus CPU mikro untuk mengeksekusi `self.addEventListener('push')`, menguraikan payload JSON, memicu pola getaran ponsel (`vibrate: [200, 100, 200]`), dan menampilkan dialog notifikasi sistem.
3. **Penyimpanan Subscription Fleksibel (Supabase):**
   * Langganan push disimpan pada tabel relasional `public.notifications` dengan `type = 'PUSH_SUBSCRIPTION'` dan `message = JSON.stringify(subscription)`. Jika pengguna mencabut izin atau token kedaluwarsa (HTTP 410 Gone), server secara otomatis membersihkan rekaman tersebut untuk menjaga kebersihan basis data.
4. **Trigger Otomatis SPK SAW & Pengingat Streak (`/api/cron/reminders`):**
   * **Mekanisme Otomatis (`vercel.json`):** Dikonfigurasi menggunakan Vercel Cron Jobs pada berkas `vercel.json` dengan jadwal `0 13 * * *` (pukul 13:00 UTC = 20:00 WIB / 21:00 WITA setiap malam). Saat cron berjalan, server mengevaluasi seluruh pengguna terdaftar yang memiliki langganan Web Push aktif.
   * **Logika Penerima Push (Siapa yang Menerima Push):**
     1. **Kondisi 1 — Peringatan Dini SPK (`SPK_SAW_EARLY_WARNING`):** Jika ditemukan minimal satu kebiasaan dengan skor risiko $V_i \ge 0.50$ (50%) yang belum selesai hari ini, server langsung mengirim push notifikasi peringatan SPK untuk kebiasaan dengan risiko tertinggi:  
        `"⚠️ Peringatan SPK: [Nama Kebiasaan] - Risiko terlewat [X]%. [Tips Mitigasi]"`
     2. **Kondisi 2 — Penyelamatan Streak (`STREAK_DEFENSE`):** Jika TIDAK ADA kebiasaan berisiko tinggi ($V_i < 0.50$), namun pengguna memiliki *streak* aktif ($> 0$) dan masih ada kebiasaan terjadwal hari ini yang belum selesai, server mengirim push pengingat pertahanan streak:  
        `"🔥 Pertahankan Streak [X] Hari! Tersisa [N] kebiasaan hari ini..."`
     3. **Kondisi 3 — Aman / Selesai Semua:** Jika seluruh kebiasaan hari ini sudah dicentang selesai, server tidak mengirim notifikasi apapun (*silent*).

#### 3.7.1 Fungsi & Peran Tombol "Evaluasi SPK SAW Sekarang" (On-Demand Trigger vs Automated Cron):
Di halaman profil pengguna (`/app/profile`), terdapat tombol interaktif **"Evaluasi SPK SAW Sekarang"**. Tombol ini memiliki peran penting:
1. **Pemicu Evaluasi Seketika (*On-Demand Execution*):**
   * Vercel Cron berjalan otomatis 1 kali sehari di malam hari (pukul 20:00 WIB / 21:00 WITA). Namun, untuk keperluan **pengujian pengguna (user testing), pengujian dosen penguji saat sidang skripsi, atau demonstrasi live**, penguji tidak perlu menunggu jadwal malam tiba. Tombol ini memungkinkan pengguna atau penguji memicu komputasi SPK SAW secara *real-time* kapan saja.
2. **Alur Komputasi yang Dijalankan:**
   * Begitu tombol ditekan, frontend mengirim permintaan `POST /api/cron/reminders` dengan sesi pengguna aktif.
   * Server mengeksekusi `PredictionService.getAtRiskHabitsToday()` khusus untuk akun pengguna tersebut:
     1. Menarik seluruh jadwal kebiasaan hari ini yang belum selesai.
     2. Menghitung 5 kriteria SAW ($C_1$ s/d $C_5$) dan nilai preferensi $V_i$.
     3. Mengirimkan push notifikasi (`SPK_SAW_EARLY_WARNING` jika ada kebiasaan $V_i \ge 0.50$, atau `STREAK_DEFENSE` jika ada streak aktif yang belum terlindungi).
3. **Umpan Balik Transparan:**
   * Antarmuka menampilkan status langsung: `"✅ Evaluasi SPK selesai. Mengirim [X] notifikasi push."` sehingga pengguna dan evaluator skripsi dapat memvalidasi bahwa mesin SPK SAW berfungsi secara aktif dan nyata.

---

### 3.8 Pemodelan Diagram Alir Data (Data Flow Diagram - DFD)

Diagram Alir Data (*Data Flow Diagram* / DFD) adalah teknik pemodelan terstruktur yang menggambarkan aliran data logis melalui sistem perangkat lunak, proses transformasi data, entitas eksternal yang menjadi sumber (*source*) atau tujuan (*sink*) data, serta repositori penyimpanan data (*data store*). Notasi yang digunakan merujuk pada standar **Gane & Sarson / Yourdon & DeMarco** yang diakui secara luas dalam bidang Rekayasa Perangkat Lunak akademik.

#### 3.8.1 Diagram Konteks (DFD Level 0)

Diagram Konteks memodelkan batas sistem HabitGrow secara makro (*high-level*). Seluruh fungsionalitas aplikasi direpresentasikan sebagai satu proses tunggal terpadu (**Proses 0.0: Sistem HabitGrow**), yang berinteraksi dengan tiga entitas eksternal (*External Entities*):

1. **Entitas Eksternal 1: Pengguna / User (Peramban Web & Android PWA Client)**
   * **Aliran Data Masuk (*Inflow*):**
     * Kredensial Pendaftaran & Autentikasi (Email, Kata Sandi, Data Profil).
     * Formulir Pembuatan/Pengubahan Kebiasaan (Nama, Kategori, Tingkat Kesulitan, Satuan Target, Pola Penjadwalan, Jam Pengingat).
     * Aksi Interaksi Checklist Harian Taktil (*Checkbox Tap Event* berlatensi 0ms).
     * Token Kunci Kriptografi Web Push Subscription (*Endpoint URL*, *p256dh*, *auth* via VAPID).
     * Pemicu Evaluasi SPK SAW Seketika (*On-Demand Trigger* via Halaman Profil).
   * **Aliran Data Keluar (*Outflow*):**
     * Ringkasan Dasbor Real-time (Status Streak Global & Individual, Level XP, Bilah Konsistensi Bergulir 30 Hari).
     * Visualisasi Metamorfosis Pohon Virtual (Tahap Pertumbuhan, Persentase Kesehatan Organik).
     * Umpan Balik Taktil Antarmuka (Animasi Ceklis, Efek Letupan Konfeti Partikel Instan).
     * Kartu Peringatan Dini SPK SAW & Rekomendasi Adaptif Tindakan Mitigasi (Aturan 2-Menit, Penyesuaian Beban).
     * Lencana Pencapaian (*Achievement Badges*) & Log Riwayat Aktivitas Kalender.

2. **Entitas Eksternal 2: Vercel Cron Trigger (Cloud Serverless Automated Scheduler)**
   * **Aliran Data Masuk (*Inflow*):**
     * Pemicu Eksekusi Otomatis Terjadwal via HTTP POST ke `/api/cron/reminders` setiap pukul 20:00 WIB (13:00 UTC) disertai token rahasia `CRON_SECRET`.
   * **Aliran Data Keluar (*Outflow*):**
     * Laporan Status Eksekusi Batch Serverless (Status HTTP 200 OK, Total Pengguna Terproses, Jumlah Push Terkirim, Waktu Eksekusi Komputasi).

3. **Entitas Eksternal 3: Push Notification Gateway (Google FCM & Apple APNs)**
   * **Aliran Data Masuk (*Inflow*):**
     * Respons Status Pengiriman Jaringan (HTTP 201 Created jika paket push berhasil diterima gateway; HTTP 410 Gone / 404 Not Found jika token perangkat kedaluwarsa atau izin dicabut oleh pengguna).
   * **Aliran Data Keluar (*Outflow*):**
     * Muatan Data Push Terenkripsi (*Encrypted Push Payload* standar W3C RFC 8291/8292) bertanda tangan VAPID JWT untuk dikirimkan langsung ke layar ponsel pengguna (*Lock Screen*).

```mermaid
flowchart TD
    classDef entity fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A;
    classDef process fill:#ECFDF5,stroke:#10B981,stroke-width:2px,color:#064E3B;

    User["👤 Entitas Eksternal 1:<br/>Pengguna (Web & Android PWA)"]:::entity
    Cron["⏱️ Entitas Eksternal 2:<br/>Vercel Cron Trigger (20:00 WIB)"]:::entity
    Gateway["☁️ Entitas Eksternal 3:<br/>Push Gateway (Google FCM / APNs)"]:::entity

    P0(("0.0<br/>SISTEM HABITGROW<br/>(Habit Tracker, Gamifikasi & SPK SAW)")):::process

    User -->|1. Data Registrasi & Kredensial Login| P0
    User -->|2. Form Kebiasaan, Kategori & Penjadwalan| P0
    User -->|3. Aksi Checklist Taktil 0ms| P0
    User -->|4. Token Registrasi Web Push VAPID| P0
    User -->|5. Pemicu Evaluasi SPK On-Demand| P0

    P0 -->|6. Dashboard Summary, Streak & Level XP| User
    P0 -->|7. Rendering Tahap & Kesehatan Pohon Virtual| User
    P0 -->|8. Umpan Balik Taktil & Letupan Konfeti| User
    P0 -->|9. Peringatan Dini SPK SAW & Rekomendasi Adaptif| User
    P0 -->|10. Katalog Lencana Pencapaian & Kalender| User

    Cron -->|Pemicu Evaluasi Harian Otomatis + Bearer Secret| P0
    P0 -->|Laporan Status Eksekusi Batch Cron Log| Cron

    P0 -->|Kirim Muatan Push Terenkripsi VAPID RFC 8291/8292| Gateway
    Gateway -->|Konfirmasi Status Pengiriman (201 OK / 410 Gone)| P0
    Gateway -->|Penyampaian Sinyal Push ke Layar Terkunci Gawai| User
```

---

#### 3.8.2 DFD Level 1 (Dekomposisi Fungsional Terstruktur)

DFD Level 1 mendekomposisi Proses 0.0 menjadi **6 proses fungsional utama** yang saling berinteraksi secara dinamis dengan **6 Data Store relasional**:

1. **Proses 1.0 — Autentikasi & Manajemen Profil Pengguna:**
   * Menangani pendaftaran akun baru, login sesi aman berbasis *cookie*, pembaruan zona waktu lokal (*timezone*), serta sinkronisasi nama tampilan pengguna.
   * *Akses Data Store:* Membaca dan menulis ke **D1: Profil & Akun Pengguna (`profiles` & `auth.users`)**.

2. **Proses 2.0 — Manajemen Kebiasaan, Kategori & Penjadwalan:**
   * Memvalidasi pembuatan kebiasaan baru, klasifikasi kategori botani, tingkat kesulitan (EASY, MEDIUM, HARD), target kuantitas harian, serta pengaturan hari berulang (*selected days*).
   * *Akses Data Store:* Membaca dan menulis ke **D2: Kebiasaan & Jadwal (`habits`, `habit_categories`, `habit_schedules`)**.

3. **Proses 3.0 — Pencatatan Checklist Harian Taktil & Histori Kalender:**
   * Menangani interaksi centang tugas harian pengguna, memvalidasi aturan unik satu centang per tanggal kalender lokal (`UNIQUE(habit_id, date)`), dan memproses pembatalan centang (*uncheck*).
   * *Akses Data Store:* Membaca dan menulis ke **D3: Riwayat Checklist Harian (`habit_completions`)**.

4. **Proses 4.0 — Mesin Gamifikasi, XP, Streak & Metamorfosis Pohon Virtual:**
   * Menerima sinyal penyelesaian dari Proses 3.0, menghitung akumulasi XP berdasarkan kesulitan tugas, memicu kenaikan level progresi, memperbarui *Non-Zero Day global streak*, menghitung konsistensi bergulir 30 hari (*rolling consistency*), serta menentukan tahap hidup pohon virtual (Benih s/d Pohon Rimbun).
   * *Akses Data Store:* Membaca dari **D3**; menulis ke **D4: Pohon Virtual (`user_trees`)** dan **D5: Metrik Gamifikasi (`user_streaks`, `user_levels`, `xp_transactions`, `user_achievements`, `achievements`)**.

5. **Proses 5.0 — Evaluasi SPK SAW Risiko Kegagalan (*Habit Churn Prediction Engine*):**
   * Dipicu oleh Proses 6.0 (Cron harian pukul 20:00 WIB atau tombol *on-demand* di profil). Menarik seluruh kebiasaan terjadwal hari ini yang belum selesai, mengabaikan kebiasaan di bawah 14 hari (*Cold-Start Guard*), membentuk matriks keputusan dari 5 kriteria terbobot ($C_1..C_5$), melakukan normalisasi matriks $R$, menghitung nilai preferensi $V_i$, mengelompokkan risiko (HIGH, MODERATE, LOW), dan merumuskan saran adaptif (aturan 2-menit / *micro-habits*).
   * *Akses Data Store:* Membaca dari **D2: Kebiasaan & Jadwal** dan **D3: Riwayat Checklist**.

6. **Proses 6.0 — Layanan Komunikasi & Web Push Notifications:**
   * Menerima hasil evaluasi dari Proses 5.0 atau pengingat penyelamatan *streak*, memverifikasi langganan push aktif, menandatangani paket data menggunakan VAPID Private Key, dan mengirimkannya ke Push Gateway (FCM/APNs) untuk membangunkan Service Worker di ponsel pengguna.
   * *Akses Data Store:* Membaca dan membersihkan token dari **D6: Notifikasi & Audit Log (`notifications`, `activity_logs`)**.

```mermaid
flowchart TD
    classDef entity fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A;
    classDef process fill:#ECFDF5,stroke:#10B981,stroke-width:2px,color:#064E3B;
    classDef datastore fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F;

    User["👤 Pengguna (Client)"]:::entity
    Cron["⏱️ Vercel Cron"]:::entity
    FCM["☁️ FCM / APNs"]:::entity

    P1(("1.0<br/>Autentikasi &<br/>Profil")):::process
    P2(("2.0<br/>Manajemen<br/>Kebiasaan & Jadwal")):::process
    P3(("3.0<br/>Pencatatan<br/>Checklist Harian")):::process
    P4(("4.0<br/>Gamifikasi, Streak<br/>& Pohon Virtual")):::process
    P5(("5.0<br/>Evaluasi SPK SAW<br/>Risiko Kegagalan")):::process
    P6(("6.0<br/>Layanan Web Push<br/>& Notifikasi")):::process

    D1[("D1: profiles & auth_users")]:::datastore
    D2[("D2: habits, categories, schedules")]:::datastore
    D3[("D3: habit_completions")]:::datastore
    D4[("D4: user_trees")]:::datastore
    D5[("D5: streaks, levels, xp, achievements")]:::datastore
    D6[("D6: notifications & activity_logs")]:::datastore

    %% Aliran Proses 1.0
    User -->|Kredensial & Profil| P1
    P1 <-->|Read / Write Akun & Timezone| D1
    P1 -->|Sesi Login & Data User| User

    %% Aliran Proses 2.0
    User -->|Input Form Kebiasaan & Pola Hari| P2
    P2 <-->|CRUD Kebiasaan, Kategori & Jadwal| D2
    P2 -->|Daftar Kebiasaan Terstruktur| User

    %% Aliran Proses 3.0
    User -->|Tap Checklist 0ms| P3
    P3 <-->|Catat / Hapus Penyelesaian Harian| D3
    P3 -->|Trigger Konfeti & Status Centang| User
    P3 -->|Sinyal Event Penyelesaian Tugas| P4

    %% Aliran Proses 4.0
    P4 <-->|Hitung XP, Streak Global & Broken Streak| D5
    P4 <-->|Kalkulasi Konsistensi 30 Hari & Tahap Pohon| D4
    P4 -->|Update Dashboard XP/Level/Streak/Pohon| User

    %% Aliran Proses 5.0
    Cron -->|Pemicu Otomatis 20:00 WIB| P6
    User -->|Pemicu On-Demand SPK| P6
    P6 -->|Jalankan Komputasi SPK SAW| P5
    P5 <--|Baca Kebiasaan Hari Ini| D2
    P5 <--|Baca Riwayat Centang 30 Hari| D3
    P5 -->|Hasil Evaluasi: Skor Vi & Rekomendasi 2-Menit| P6
    P5 -->|Tampilkan Kartu Peringatan Dini di Dashboard| User

    %% Aliran Proses 6.0
    User -->|Token Push Subscription VAPID| P6
    P6 <-->|Simpan / Hapus Langganan Push Token| D6
    P6 -->|Kirim Encrypted Web Push via VAPID| FCM
    FCM -->|Push Sinyal ke Lock Screen Ponsel| User
    FCM -->|Status Delivery 201 OK / 410 Gone| P6
```

---

### 3.9 Standarisasi Simbol Flowchart ANSI/ISO & Pemetaan Sistem

Dalam penulisan laporan ilmiah (Skripsi/Tugas Akhir), standarisasi bagan alir (*flowchart*) wajib mematuhi standar internasional **ANSI X3.5 / ISO 5807**. Standar ini menjamin bahwa setiap simbol memiliki arti operasional yang baku dan tidak ambigu bagi penguji maupun pengembang perangkat lunak.

Berikut adalah tabel rujukan lengkap simbol-simbol *flowchart* yang diimplementasikan dalam dokumentasi sistem HabitGrow:

| No | Nama Simbol Standar | Bentuk Visual (*Geometry*) | Standar ANSI/ISO | Fungsi Formal dalam Pemodelan | Penerapan Konkret pada Sistem HabitGrow |
|:---:|:---|:---:|:---:|:---|:---|
| **1** | **Terminal / Terminator** | Oval / Stadion (*Stadium*) | ANSI X3.5 §4.1 | Menandai titik permulaan (*Start / Mulai*) atau titik akhir (*End / Selesai*) dari suatu bagan alir algoritma atau prosedur sistem. | Titik awal saat pengguna mengetuk tombol centang, awal pemanggilan cron job Vercel pukul 20:00 WIB, dan akhir alur pengembalian respon HTTP 200 OK. |
| **2** | **Process / Pemrosesan** | Persegi Panjang (*Rectangle*) | ANSI X3.5 §4.2 | Menunjukkan operasi aritmatika, komputasi data, transformasi nilai, atau manipulasi logika internal oleh CPU/server. | Perhitungan normalisasi matriks $R_{ij} = x_{ij} / \max(x_j)$, penjumlahan terbobot $V_i = \sum W_j R_{ij}$, penambahan XP (`total_xp + 15`), dan pergeseran jendela konsistensi 30 hari. |
| **3** | **Decision / Keputusan** | Belah Ketupat (*Diamond*) | ANSI X3.5 §4.3 | Menunjukkan percabangan bersyarat (*conditional branch*) dengan dua atau lebih jalur keluaran berbasis evaluasi logika boolean (Ya/Tidak, *True/False*). | Pengecekan umur kebiasaan: *Apakah usia $\ge 14$ hari?*; Evaluasi ambang batas: *Apakah $V_i \ge 0.50$?*; Pengecekan status: *Apakah kebiasaan sudah dicentang hari ini?*. |
| **4** | **Input / Output (Data)** | Jajar Genjang (*Parallelogram*) | ANSI X3.5 §4.4 | Menunjukkan instruksi penerimaan masukan (*input*) data dari luar sistem atau penyajian keluaran (*output*) informasi ke antarmuka pengguna. | Penerimaan input formulir kebiasaan baru oleh pengguna, pembacaan parameter URL, penampilan dialog perayaan konfeti, dan pengiriman notifikasi visual ke layar gawai. |
| **5** | **Predefined Process / Sub-proses** | Persegi Panjang Bergaris Ganda (*Striped Rectangle*) | ANSI X3.5 §4.5 | Menunjukkan pemanggilan sekumpulan prosedur, fungsi, modul, atau *service layer* eksternal yang definisinya dimodelkan secara terpisah. | Pemanggilan method `PredictionService.getAtRiskHabitsToday()`, `ConsistencyService.recalculateUserConsistencyAndTree()`, dan `webpush.sendNotification()`. |
| **6** | **Database / On-line Storage** | Tabung Silinder (*Cylinder*) | ANSI X3.5 §4.8 | Menunjukkan operasi penyimpanan fisik atau pembacaan rekaman data ke media basis data terstruktur (*data persistence*). | Kueri `SELECT FROM habits`, penulisan log transaksi `INSERT INTO habit_completions`, mutasi rekaman `UPDATE user_trees`, dan pembersihan langganan `DELETE FROM notifications`. |
| **7** | **Flowline / Garis Alir** | Garis Berpanah (*Arrowhead Line*) | ANSI X3.5 §4.6 | Menunjukkan arah urutan kendali eksekusi langkah operasional dari satu simbol ke simbol berikutnya. | Alur eksekusi berurutan dari langkah inisialisasi variabel, melewati percabangan keputusan, hingga terminasi proses. |
| **8** | **Connector / Penghubung** | Lingkaran Kecil (*Small Circle*) | ANSI X3.5 §4.7 | Menghubungkan bagian-bagian bagan alir yang terputus pada halaman dokumen yang sama untuk menghindari garis yang saling bertabrakan (*cross-lines*). | Titik temu penggabungan jalur rollback kegagalan jaringan kembali ke siklus pemantauan antarmuka normal. |

---

### 3.10 Pemodelan Diagram Alir Sistem (Flowchart Detail Alur Bisnis & Algoritma)

Bagian ini memodelkan seluruh logika inti sistem HabitGrow ke dalam **5 Diagram Alir Resmi** yang siap digunakan langsung pada **Bab 3 Laporan Skripsi**:

#### 3.10.1 Flowchart 1: Metodologi Rekayasa Perangkat Lunak (SDLC Model Prototyping/Agile)

Bagan alir ini menggambarkan siklus hidup metodologi pengembangan sistem yang diterapkan pada proyek HabitGrow:

```mermaid
flowchart TD
    Start([Mulai: Identifikasi Kebutuhan & Masalah Riset]) --> LitReview[Studi Literatur: Teori Kebiasaan & SPK SAW]
    LitReview --> SpecSRS[Penyusunan SRS: Kebutuhan Fungsional & Non-Fungsional]
    SpecSRS --> ProtoDesign[Perancangan Prototipe: Wireframe UI & Skema Database 3NF]
    ProtoDesign --> Coding[Pengkodean Sistem: Next.js 16, Supabase, Tailwind, Vitest]
    Coding --> UnitTesting[Pengujian Unit Otomatis: 48 Test Cases Vitest]
    
    UnitTesting --> CheckUnit{Seluruh Unit Test Lulus 100%?}
    CheckUnit -- Tidak --> FixCode[Perbaikan Bug & Refaktorisasi Logika]
    FixCode --> Coding
    CheckUnit -- Ya --> DeployStaging[Deployment Vercel & PWA Build Testing]
    
    DeployStaging --> E2ETesting[Pengujian End-to-End Otomatis & Uji Pengguna]
    E2ETesting --> CheckE2E{Memenuhi Syarat Evaluasi Pengguna?}
    CheckE2E -- Tidak --> ProtoDesign
    CheckE2E -- Ya --> ProdRelease[Rilis Produksi Publik: habitsgrow.vercel.app]
    ProdRelease --> End([Selesai: Sistem Siap Diuji Sidang Skripsi])
```

---

#### 3.10.2 Flowchart 2: Alur Komputasi SPK SAW Prediksi Risiko Kegagalan (*Habit Churn Prediction Engine*)

Bagan alir algoritma inti Sistem Pendukung Keputusan menggunakan metode *Simple Additive Weighting* (SAW) terintegrasi *Cold-Start Guard* dan sistem rekomendasi adaptif:

```mermaid
flowchart TD
    Start([Mulai: Pemicu Evaluasi SPK SAW]) --> FetchPending[/Tarik Seluruh Kebiasaan Terjadwal Hari Ini yang Belum Selesai/]
    FetchPending --> CheckList{Apakah Ada Kebiasaan Belum Tuntas?}
    CheckList -- Tidak --> ReturnZero[/Kembalikan Hasil: Risiko Nihil - Seluruh Tugas Aman/]
    ReturnZero --> End([Selesai])

    CheckList -- Ya --> LoopHabit[Iterasi Setiap Kebiasaan Terjadwal]
    LoopHabit --> CalcAge[Hitung Usia Kebiasaan: Tanggal Hari Ini - Tanggal Mulai]
    CalcAge --> CheckColdStart{Usia Kebiasaan < 14 Hari?<br/>Cold-Start Guard}
    
    CheckColdStart -- Ya --> AssignColdStart[Tetapkan Status: COLD_START<br/>Skor Vi = 0.00, Beri Afirmasi Adaptasi Baru]
    AssignColdStart --> NextHabit{Masih Ada Kebiasaan Lain?}

    CheckColdStart -- Tidak --> ComputeC1[Hitung C1: Miss Rate 30 Hari Terakhir - Bobot 30%]
    ComputeC1 --> ComputeC2[Hitung C2: Historic Miss Rate pada Hari Serupa - Bobot 25%]
    ComputeC2 --> ComputeC3[Hitung C3: Daily Workload Ratio - Bobot 15%]
    ComputeC3 --> ComputeC4[Hitung C4: Kebalikan Maturity Usia Kebiasaan - Bobot 15%]
    ComputeC4 --> ComputeC5[Hitung C5: Faktor Keterlambatan Waktu Saat Ini - Bobot 15%]

    ComputeC5 --> Normalize[Normalisasi Matriks Keputusan R: Rij = Xij / Max Xj]
    Normalize --> SAWScore[Hitung Nilai Preferensi Vi = SUM Wj * Rij]

    SAWScore --> CheckHigh{Apakah Vi >= 0.70?}
    CheckHigh -- Ya --> SetHigh[Tetapkan Status: TINGGI / HIGH RISK<br/>Generate Rekomendasi Adaptif Aturan 2-Menit]
    
    CheckHigh -- Tidak --> CheckMod{Apakah Vi >= 0.50?}
    CheckMod -- Ya --> SetMod[Tetapkan Status: SEDANG / MODERATE RISK<br/>Generate Rekomendasi Pengingat & Pemecahan Tugas]
    CheckMod -- Tidak --> SetLow[Tetapkan Status: RENDAH / LOW RISK<br/>Status Terkendali]

    SetHigh --> NextHabit
    SetMod --> NextHabit
    SetLow --> NextHabit

    NextHabit -- Ya --> LoopHabit
    NextHabit -- Tidak --> SortResult[Urutkan Kebiasaan Berdasarkan Skor Vi Tertinggi]
    SortResult --> OutputResult[/Keluarkan Daftar Risiko & Rekomendasi Mitigasi/]
    OutputResult --> End
```

---

#### 3.10.3 Flowchart 3: Alur Mesin Pertumbuhan Pohon Virtual (*Tree Growth Engine & Rolling Consistency*)

Bagan alir logika gamifikasi botanical pertumbuhan pohon virtual dengan batas jendela geser 30 hari (*rolling 30-day window*) dan perlindungan hari pertama (*graceful first day*):

```mermaid
flowchart TD
    Start([Mulai: Mutasi Checklist atau Pembukaan Dashboard]) --> FetchWindow[/Ambil Riwayat Checklist Selama 30 Hari Terakhir/]
    FetchWindow --> CheckNewUser{Pengguna Baru / Hari Pertama<br/>Tanpa Riwayat Bolong Lampau?}
    
    CheckNewUser -- Ya --> SetGraceful[Tetapkan Status Benih Sehat Awal:<br/>Tahap = Seed, Skor Konsistensi = 100%, Kesehatan = 100%]
    SetGraceful --> PersistDB[(Update Tabel user_trees)]

    CheckNewUser -- Tidak --> CalcTotalSched[Hitung Total Hari Terjadwal Seluruh Kebiasaan dalam Jendela 30 Hari]
    CalcTotalSched --> CalcTotalDone[Hitung Total Hari Berhasil Dicentang Selesai]
    CalcTotalDone --> CheckZeroSched{Total Terjadwal == 0?}
    
    CheckZeroSched -- Ya --> SetDefaultSeed[Konsistensi = 0%, Tahap = Seed]
    CheckZeroSched -- Tidak --> CalcScore[Hitung Skor Konsistensi:<br/>CR = Total Selesai / Total Terjadwal * 100%]

    CalcScore --> CheckMature{CR >= 80%?}
    CheckMature -- Ya --> StageMature[Tahap: Mature Tree / Pohon Rimbun Dewasa]
    
    CheckMature -- Tidak --> CheckHealthy{CR >= 60%?}
    CheckHealthy -- Ya --> StageHealthy[Tahap: Healthy Tree / Pohon Sehat Berbunga]
    
    CheckHealthy -- Tidak --> CheckYoung{CR >= 40%?}
    CheckYoung -- Ya --> StageYoung[Tahap: Young Tree / Pohon Muda Berdaun]
    
    CheckYoung -- Tidak --> CheckSprout{CR >= 20%?}
    CheckSprout -- Ya --> StageSprout[Tahap: Sprout / Tunas Kecil Bertumbuh]
    
    CheckSprout -- Tidak --> StageSeed[Tahap: Seed / Benih Baru Tertanam]

    StageMature --> CalcHealth[Hitung Nilai Kesehatan Pohon: Min 100, Math.round CR]
    StageHealthy --> CalcHealth
    StageYoung --> CalcHealth
    StageSprout --> CalcHealth
    StageSeed --> CalcHealth

    CalcHealth --> PersistDB
    SetDefaultSeed --> PersistDB
    PersistDB --> BroadcastUI[/Render Pohon Virtual Responsif & Progress Bar di Dashboard/]
    BroadcastUI --> End([Selesai])
```

---

#### 3.10.4 Flowchart 4: Alur Eksekusi Checklist Taktil (0ms Optimistic UI & Server Sync)

Bagan alir mutasi instan checklist kartu kebiasaan dengan penanganan pemulihan kegagalan (*rollback*):

```mermaid
flowchart TD
    Start([Mulai: Pengguna Mengetuk Tombol Centang Kartu]) --> OptimisticLocal[Perbarui State Klien Secara Seketika - Latensi 0ms:<br/>Tandai Tugas Selesai di Antarmuka]
    OptimisticLocal --> TriggerConfetti[/Tembakkan Animasi Letupan Konfeti Partikel/]
    OptimisticLocal --> OptimisticCounter[Tambah Angka Selesai & XP Sementara di Layar]
    
    OptimisticCounter --> AsyncCall[Kirim Permintaan Asinkron di Latar Belakang:<br/>POST /api/habits/:id/complete]
    AsyncCall --> ValidateAuth{Autentikasi Sesi & CSRF Valid?}
    
    ValidateAuth -- Tidak --> TriggerRollback[Batalkan Perubahan Klien: Kembalikan State ke Semula]
    ValidateAuth -- Ya --> CheckUniqueDate{Apakah Tugas Sudah Pernah Dicentang Hari Ini?<br/>Constraint Unik Tanggal}
    
    CheckUniqueDate -- Duplikat --> TriggerRollback
    CheckUniqueDate -- Lolos --> CommitDB[(Simpan Rekaman ke habit_completions)]
    
    CommitDB --> RecordXP[(Catat Transaksi ke xp_transactions & user_levels)]
    RecordXP --> UpdateStreakSub[Panggil Sub-proses: Mutasi user_streaks Global & Individual]
    UpdateStreakSub --> UpdateTreeSub[Panggil Sub-proses: Mutasi user_trees Konsistensi 30 Hari]
    
    UpdateTreeSub --> ServerOK[/Server Merespon HTTP 200 OK dengan Payload Baru/]
    ServerOK --> InvalidateQuery[TanStack Query Invalidate & Revalidate Silent]
    InvalidateQuery --> End([Selesai: Sinkronisasi Sempurna])

    TriggerRollback --> ShowToast[/Tampilkan Pesan Peringatan Toast Error ke Pengguna/]
    ShowToast --> End
```

---

#### 3.10.5 Flowchart 5: Alur Cron Job Serverless & Background Web Push Notification

Bagan alir eksekusi otomatis latar belakang pengiriman notifikasi layar terkunci ponsel (*Lock Screen Web Push*):

```mermaid
flowchart TD
    Start([Mulai: Vercel Cron Terjadwal Pukul 20:00 WIB / 13:00 UTC]) --> VerifySecret{Header Authorization == CRON_SECRET?}
    VerifySecret -- Ditolak --> Return401[/Tolak Akses: HTTP 401 Unauthorized/]
    Return401 --> End([Selesai])

    VerifySecret -- Diterima --> QuerySubs[(Tarik Seluruh Pengguna dengan Push Subscription Aktif di Tabel notifications)]
    QuerySubs --> CheckAnyUser{Apakah Ada Pengguna Berlangganan?}
    CheckAnyUser -- Tidak --> Return200Silent[/Return HTTP 200: Tidak Ada Target Pengiriman/]
    Return200Silent --> End

    CheckAnyUser -- Ya --> LoopUsers[Iterasi Setiap Pengguna Terdaftar]
    LoopUsers --> RunSPK[Eksekusi Evaluasi SPK SAW Hari Ini untuk Pengguna Tersebut]
    RunSPK --> CheckHighRisk{Ada Kebiasaan Belum Tuntas dengan Skor Vi >= 0.50?}

    CheckHighRisk -- Ya --> PrepareWarning[Bentuk Payload SPK_SAW_EARLY_WARNING:<br/>'⚠️ Peringatan SPK: [Nama Habit] - Risiko terlewat X%. Aturan 2 menit!']
    CheckHighRisk -- Tidak --> CheckStreak{Streak Pengguna > 0 DAN Masih Ada Tugas Terjadwal Belum Tuntas?}
    
    CheckStreak -- Ya --> PrepareStreak[Bentuk Payload STREAK_DEFENSE:<br/>'🔥 Pertahankan Streak X Hari! Selesaikan 1 tugas sebelum tengah malam.']
    CheckStreak -- Tidak --> SkipUser[Lewati Pengguna: Kondisi Aman / Tugas Sudah Selesai Semua]

    PrepareWarning --> SignVAPID[Tandatangani Payload Kriptografis via VAPID Private Key RFC 8292]
    PrepareStreak --> SignVAPID

    SignVAPID --> SendGateway[Kirim Paket ke Push Gateway: Google FCM / Apple APNs]
    SendGateway --> CheckDeliveryStatus{Status Respons Gateway?}

    CheckDeliveryStatus -- 201 Created --> LogSuccess[(Catat Status Sukses di activity_logs)]
    CheckDeliveryStatus -- 410 Gone / 404 --> CleanupToken[(Hapus Subscription Kadaluwarsa dari notifications)]
    CheckDeliveryStatus -- Error Lain --> LogError[(Catat Kegagalan Jaringan)]

    SkipUser --> NextUser{Masih Ada Pengguna Berikutnya?}
    LogSuccess --> NextUser
    CleanupToken --> NextUser
    LogError --> NextUser

    NextUser -- Ya --> LoopUsers
    NextUser -- Tidak --> FinalReport[/Kembalikan Ringkasan Laporan Batch: HTTP 200 OK/]
    FinalReport --> End
```

---

## 4. PERANCANGAN BASIS DATA & SKEMA ERD

Basis data HabitGrow dirancang dalam bentuk relasional normalisasi ketiga (3NF) dengan total **13 tabel terstruktur**.

### 4.1 Diagram Hubungan Entitas (ERD)

```mermaid
erDiagram
    auth_users ||--o{ profiles : "memiliki (1:1)"
    auth_users ||--o{ habits : "memiliki (1:N)"
    auth_users ||--o{ habit_completions : "mencatat (1:N)"
    auth_users ||--o{ xp_transactions : "menerima (1:N)"
    auth_users ||--o{ user_levels : "memiliki (1:1)"
    auth_users ||--o{ user_streaks : "memiliki (1:N)"
    auth_users ||--o{ user_trees : "memiliki (1:1)"
    auth_users ||--o{ user_achievements : "mengoleksi (1:N)"
    auth_users ||--o{ notifications : "menerima (1:N)"
    auth_users ||--o{ activity_logs : "mencatat audit (1:N)"

    habit_categories ||--o{ habits : "mengelompokkan (1:N)"
    habits ||--o{ habit_schedules : "memiliki jadwal (1:N)"
    habits ||--o{ habit_completions : "memiliki rekaman (1:N)"
    habits ||--o{ user_streaks : "memiliki streak (1:1)"
    achievements ||--o{ user_achievements : "dibuka dalam (1:N)"
```

### 4.2 Kamus Data & Spesifikasi Tabel

#### 1. Tabel `profiles`
Menyimpan atribut personal pengguna yang terhubung langsung dengan tabel `auth.users` bawaan Supabase.
* `id` (UUID, Primary Key, FK ke `auth.users.id` ON DELETE CASCADE)
* `display_name` (VARCHAR 100, Nama tampilan yang disapa di dashboard)
* `avatar_url` (TEXT, Tautan foto profil pengguna)
* `timezone` (VARCHAR 50, Default: 'UTC')
* `role` (VARCHAR 20, Nilai: 'USER', 'ADMIN')
* `created_at`, `updated_at` (TIMESTAMPTZ)

#### 2. Tabel `habit_categories`
Daftar kategori untuk mengelompokkan kebiasaan.
* `id` (UUID, Primary Key)
* `name` (VARCHAR 100, contoh: 'Fitness', 'Learning', 'Cleaning', 'Health')
* `slug` (VARCHAR 100, Unik)
* `icon` (VARCHAR 50, identifier ikon Lucide)
* `description` (TEXT)
* `is_active` (BOOLEAN, Default: true)

#### 3. Tabel `habits`
Entitas utama kebiasaan yang dibuat oleh pengguna.
* `id` (UUID, Primary Key)
* `user_id` (UUID, FK ke `auth.users.id` ON DELETE CASCADE)
* `category_id` (UUID, FK ke `habit_categories.id` ON DELETE SET NULL)
* `name` (VARCHAR 100, Judul kebiasaan)
* `description` (TEXT)
* `icon` (VARCHAR 50, Ikon kartu)
* `color` (VARCHAR 30, Kode HEX warna aksen)
* `difficulty` (VARCHAR 20, Enum: 'EASY', 'MEDIUM', 'HARD')
* `frequency_type` (VARCHAR 30, Enum: 'DAILY', 'SELECTED_DAYS', 'WEEKLY_TARGET')
* `target_value` (NUMERIC 10,2, Nilai target kuantitas)
* `target_unit` (VARCHAR 50, Satuan target, misal: 'kali', 'halaman', 'menit')
* `start_date` (DATE, Tanggal kebiasaan dimulai)
* `end_date` (DATE, Opsional)
* `reminder_time` (TIME, Waktu notifikasi)
* `is_active` (BOOLEAN, Default: true)
* `is_archived` (BOOLEAN, Default: false)

#### 4. Tabel `habit_schedules`
Rincian hari spesifik jika kebiasaan menggunakan frekuensi `SELECTED_DAYS`.
* `id` (UUID, Primary Key)
* `habit_id` (UUID, FK ke `habits.id` ON DELETE CASCADE)
* `day_of_week` (INTEGER, 0 = Minggu, 1 = Senin, ..., 6 = Sabtu)

#### 5. Tabel `habit_completions`
Log transaksi penyelesaian kebiasaan harian.
* `id` (UUID, Primary Key)
* `habit_id` (UUID, FK ke `habits.id` ON DELETE CASCADE)
* `user_id` (UUID, FK ke `auth.users.id` ON DELETE CASCADE)
* `date` (DATE, Tanggal pengerjaan)
* `completed_at` (TIMESTAMPTZ, Waktu tepat penyelesaian)
* `value` (NUMERIC 10,2, Kuantitas yang diselesaikan)
* `xp_earned` (INTEGER, Jumlah XP yang didapat saat itu)
* *Constraint Unik:* `UNIQUE(habit_id, date)` menjamin kebiasaan hanya bisa diselesaikan 1 kali per hari kalender.

#### 6. Tabel `xp_transactions`
Buku besar (*ledger*) perolehan pengalaman pengguna.
* `id` (UUID, Primary Key)
* `user_id` (UUID, FK ke `auth.users.id`)
* `source_type` (VARCHAR 50, contoh: 'habit_completion', 'achievement', 'bonus')
* `source_id` (UUID, Referensi ke entitas pemicu)
* `amount` (INTEGER, Nominal XP)
* `created_at` (TIMESTAMPTZ)

#### 7. Tabel `user_levels`
Status level progresif pengguna.
* `user_id` (UUID, Primary Key, FK ke `auth.users.id`)
* `level` (INTEGER, Default: 1)
* `total_xp` (INTEGER, Akumulasi seluruh XP)

#### 8. Tabel `user_streaks`
Pencatatan rekor konsistensi berturut-turut untuk setiap kebiasaan.
* `id` (UUID, Primary Key)
* `user_id` (UUID, FK ke `auth.users.id`)
* `habit_id` (UUID, FK ke `habits.id`)
* `current_streak` (INTEGER, Streak berjalan)
* `longest_streak` (INTEGER, Rekor terbaik)
* `last_completed_date` (DATE, Tanggal terakhir centang)

#### 9. Tabel `user_trees`
Representasi virtual pohon tanaman pengguna.
* `user_id` (UUID, Primary Key, FK ke `auth.users.id`)
* `stage` (VARCHAR 50, Tahapan: 'Seed', 'Sprout', 'Young Tree', 'Healthy Tree', 'Mature Tree')
* `health` (INTEGER, Nilai 0 sampai 100)
* `consistency_score` (NUMERIC 5,2, Nilai 0.00 sampai 100.00%)
* `growth_points` (INTEGER)

#### 10. Tabel `achievements`
Katalog master lencana pencapaian yang dapat diraih pengguna melalui berbagai tonggak kedisiplinan.
* `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
* `name` (VARCHAR 100, Nama lencana pencapaian)
* `slug` (VARCHAR 100, Identifikasi unik slug)
* `description` (TEXT, Uraian syarat membuka lencana)
* `icon` (VARCHAR 50, Nama identifier ikon Lucide, Default: 'trophy')
* `condition_type` (VARCHAR 50, Jenis kriteria: 'first_step', 'streak_days', 'total_completions', 'consistency_rate', 'tree_stage')
* `condition_value` (INTEGER, Nilai ambang batas pembukaan)
* `xp_reward` (INTEGER, Hadiah perolehan XP saat lencana terbuka, Default: 50)
* `is_active` (BOOLEAN, Status lencana aktif/nonaktif, Default: true)
* `created_at`, `updated_at` (TIMESTAMPTZ)

#### 11. Tabel `user_achievements`
Tabel relasi penghubung (*junction table*) pembukaan pencapaian per pengguna.
* `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
* `user_id` (UUID, FK ke `auth.users.id` ON DELETE CASCADE)
* `achievement_id` (UUID, FK ke `public.achievements.id` ON DELETE CASCADE)
* `unlocked_at` (TIMESTAMPTZ, Waktu tepat pencapaian berhasil dibuka)
* *Constraint Unik:* `UNIQUE(user_id, achievement_id)` menjamin pengguna tidak dapat mengklaim lencana yang sama lebih dari satu kali.

#### 12. Tabel `notifications`
Penyimpanan langganan Web Push latar belakang berbasis token VAPID serta log notifikasi yang telah/akan dikirimkan ke perangkat pengguna.
* `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
* `user_id` (UUID, FK ke `auth.users.id` ON DELETE CASCADE)
* `type` (VARCHAR 50, Jenis notifikasi: 'PUSH_SUBSCRIPTION', 'SPK_SAW_EARLY_WARNING', 'STREAK_DEFENSE', 'SYSTEM')
* `title` (VARCHAR 150, Judul pesan notifikasi)
* `message` (TEXT, Isi teks pesan notifikasi atau payload string JSON push subscription)
* `scheduled_for` (TIMESTAMPTZ, Waktu notifikasi dijadwalkan)
* `sent_at` (TIMESTAMPTZ, Waktu paket sinyal push dikirim ke FCM/APNs)
* `read_at` (TIMESTAMPTZ, Waktu pengguna membuka/membaca notifikasi)
* `status` (VARCHAR 30, Status pesan: 'PENDING', 'SENT', 'READ', 'FAILED', Default: 'PENDING')
* `created_at` (TIMESTAMPTZ)

#### 13. Tabel `activity_logs`
Buku catatan rekam jejak audit (*audit trail log*) yang mencatat setiap peristiwa penting dalam ekosistem HabitGrow untuk keperluan keamanan, analitik, dan transparansi data.
* `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
* `user_id` (UUID, FK ke `auth.users.id` ON DELETE CASCADE)
* `activity_type` (VARCHAR 50, Enum kejadian: 'HABIT_CREATED', 'HABIT_COMPLETED', 'XP_EARNED', 'LEVEL_UP', 'STREAK_INCREASED', 'TREE_GREW', 'ACHIEVEMENT_UNLOCKED')
* `entity_type` (VARCHAR 50, Entitas terdampak: 'habit', 'tree', 'level', 'achievement')
* `entity_id` (UUID, Kunci ID spesifik dari entitas yang bersangkutan)
* `metadata` (JSONB, Informasi atribut terperinci dalam format JSON terstruktur, Default: '{}')
* `created_at` (TIMESTAMPTZ)

---

### 4.3 Matriks Relasi & Kardinalitas Antar Entitas

Tabel matriks di bawah ini menyajikan seluruh relasi relasional, aturan integritas referensial (*referential integrity*), serta batasan penghapusan data berjenjang (*cascade rules*) untuk keperluan pelaporan **Bab 3 Skripsi**:

| No | Entitas Asal (*Parent Table*) | Entitas Tujuan (*Child Table*) | Kardinalitas | Kunci Tamu (*Foreign Key*) | Aturan Integritas (*ON DELETE*) | Makna Bisnis & Aturan Data |
|:---:|:---|:---|:---:|:---|:---|:---|
| **1** | `auth.users` | `public.profiles` | **1 : 1** | `profiles.id` $\rightarrow$ `auth.users.id` | **CASCADE** | Setiap akun pengguna terdaftar wajib memiliki tepat satu profil personal. Jika akun dihapus, profil otomatis terhapus. |
| **2** | `auth.users` | `public.user_levels` | **1 : 1** | `user_levels.user_id` $\rightarrow$ `auth.users.id` | **CASCADE** | Setiap pengguna memiliki tepat satu rekaman progres level dan akumulasi XP akun. |
| **3** | `auth.users` | `public.user_trees` | **1 : 1** | `user_trees.user_id` $\rightarrow$ `auth.users.id` | **CASCADE** | Setiap pengguna memiliki tepat satu pohon virtual yang merefleksikan kedisiplinan 30 hari. |
| **4** | `auth.users` | `public.habits` | **1 : N** | `habits.user_id` $\rightarrow$ `auth.users.id` | **CASCADE** | Satu pengguna dapat membuat banyak kartu kebiasaan (0 s/d tak terbatas). |
| **5** | `habit_categories` | `public.habits` | **1 : N** | `habits.category_id` $\rightarrow$ `habit_categories.id` | **SET NULL** | Satu kategori dapat menaungi banyak kebiasaan. Jika kategori dihapus, kebiasaan tetap ada dengan kategori kosong. |
| **6** | `habits` | `public.habit_schedules` | **1 : N** | `habit_schedules.habit_id` $\rightarrow$ `habits.id` | **CASCADE** | Satu kebiasaan dapat memiliki banyak hari penjadwalan berulang (0 = Minggu s/d 6 = Sabtu). |
| **7** | `habits` | `public.habit_completions`| **1 : N** | `habit_completions.habit_id` $\rightarrow$ `habits.id`| **CASCADE** | Satu kebiasaan memiliki banyak riwayat centang checklist harian (*constraint unique per habit & date*). |
| **8** | `habits` | `public.user_streaks` | **1 : 1** | `user_streaks.habit_id` $\rightarrow$ `habits.id` | **CASCADE** | Setiap kebiasaan memiliki tepat satu rekaman pelacak streak individual. |
| **9** | `auth.users` | `public.xp_transactions` | **1 : N** | `xp_transactions.user_id` $\rightarrow$ `auth.users.id` | **CASCADE** | Satu pengguna memiliki banyak transaksi penerimaan XP dalam buku besar (*ledger*). |
| **10**| `auth.users` | `public.user_achievements`| **1 : N** | `user_achievements.user_id` $\rightarrow$ `auth.users.id`| **CASCADE** | Satu pengguna dapat membuka banyak lencana pencapaian. |
| **11**| `achievements` | `public.user_achievements`| **1 : N** | `user_achievements.achievement_id` $\rightarrow$ `achievements.id` | **CASCADE** | Satu jenis lencana dapat dibuka oleh banyak pengguna (*many-to-many junction* via `user_achievements`). |
| **12**| `auth.users` | `public.notifications` | **1 : N** | `notifications.user_id` $\rightarrow$ `auth.users.id` | **CASCADE** | Satu pengguna dapat mendaftarkan beberapa token push subscription (misal di ponsel dan laptop) serta menerima log notifikasi. |
| **13**| `auth.users` | `public.activity_logs` | **1 : N** | `activity_logs.user_id` $\rightarrow$ `auth.users.id` | **CASCADE** | Satu pengguna menghasilkan riwayat audit log aktivitas yang lengkap dari waktu ke waktu. |

---

## 5. FORMULASI ALGORITMA & LOGIKA MATEMATIKA

Di dalam laporan Skripsi, bagian ini merupakan materi krusial untuk **Bab 3 (Metodologi Penelitian & Perancangan Sistem)**.

### 5.1 Algoritma *Non-Zero Day Global Daily Streak*
*Berkas Implementasi:* `src/lib/algorithms/streak.ts` $\rightarrow$ `calculateGlobalDailyStreak()`

#### Definisi Masalah:
Bagaimana cara menghitung hari beruntun pengguna tanpa menghukum pengguna jika salah satu dari banyak tugas terlewat, selama pengguna tetap berprogres minimal pada satu tugas?

#### Formulasi Matematis:
Misalkan $D_{active} = \{d_1, d_2, \dots, d_n\}$ adalah himpunan tanggal unik terurut di mana pengguna menyelesaikan sekurang-kurangnya satu kebiasaan ($\sum \text{completions}(d_i) \ge 1$).

Misalkan $d_{today}$ adalah tanggal hari evaluasi saat ini, dan $d_{yesterday} = d_{today} - 1\text{ hari}$.

1. **Kondisi Reset Streak ke Nol:**
   $$\text{CurrentStreak} = 0 \iff (d_{today} \notin D_{active}) \land (d_{yesterday} \notin D_{active})$$
2. **Kondisi Berjalan (*Active In-Progress*):**
   * Jika $d_{today} \in D_{active}$, penghitungan mundur (*backward walk*) dimulai dari $d_{today}$.
   * Jika $d_{today} \notin D_{active}$ namun $d_{yesterday} \in D_{active}$, hari ini dianggap masih berlangsung (*grace period*) dan penghitungan mundur dimulai dari $d_{yesterday}$.
3. **Akumulasi Streak Berjalan:**
   $$\text{CurrentStreak} = k \quad \text{di mana } \forall i \in [0, k-1], \, (d_{start} - i) \in D_{active} \text{ dan } (d_{start} - k) \notin D_{active}$$
4. **Rekor Streak Terpanjang (*Longest Streak*):**
   $$\text{LongestStreak} = \max_{j} (\text{ConsecutiveDays}_j)$$

#### 5.1.1 Perbedaan Streak Global vs. Streak Individual Kebiasaan (*Per-Habit Streak*):
* **Streak Global (Ditampilkan pada Command Bar Atas):** Berprinsip *Non-Zero Day*. Selama pengguna menyelesaikan minimal 1 kebiasaan apapun setiap hari, streak global akun tetap hidup.
* **Streak Individual (Ditampilkan pada Masing-Masing Kartu Kebiasaan):**
  * Terikat ketat pada jadwal masing-masing kebiasaan (`DAILY`, `SELECTED_DAYS`, `WEEKLY_TARGET`).
  * Jika suatu kebiasaan dijadwalkan kemarin ($d_{yesterday}$) dan tidak diselesaikan, maka streak individual kebiasaan tersebut **hangus dan di-reset ke 0**.
* **Mekanisme Sinkronisasi Otomatis (*Self-Healing Streak Sync*):**
  * *Berkas:* `src/lib/services/streak.service.ts` $\rightarrow$ `recalculateAllUserStreaks()`
  * Karena basis data Supabase menyimpan `user_streaks` secara statis, ketika pengguna melewati hari tanpa mencentang tugas, mutasi `completeHabit` tidak terpanggil.
  * Setiap kali dashboard dibuka (`GET /api/dashboard/summary`), sistem secara otomatis menjalankan `recalculateAllUserStreaks(supabase, userId, evalDate)` di latar belakang. Fungsi ini mengevaluasi seluruh riwayat centang terhadap tanggal evaluasi lokal, mendeteksi tugas yang terlewat kemarin, dan menyinkronkan nilai `current_streak: 0` ke dalam basis data secara instan.

---

### 5.2 Algoritma Deteksi & Pemulihan Streak Putus (*Broken Streak Detection*)
*Berkas Implementasi:* `src/lib/algorithms/streak.ts` $\rightarrow$ `detectBrokenStreak()`

#### Tujuan:
Mendeteksi kegagalan pada hari terjadwal terakhir dan menghitung berapa hari *streak* yang hilang untuk memicu empati dan notifikasi pemulihan.

#### Logika:
1. Dapatkan tanggal terjadwal terakhir sebelum hari ini: $d_{last\_sched} < d_{today}$.
2. Jika $d_{last\_sched} \in \text{Completions}$, maka $\text{isBroken} = \text{false}$.
3. Jika $d_{last\_sched} \notin \text{Completions}$ dan rentang waktu $(d_{today} - d_{last\_sched}) \le 3\text{ hari}$:
   * Hitung hari beruntun sebelum $d_{last\_sched}$ yang berhasil diselesaikan:
   $$\text{LostStreak} = \sum_{i=1}^{m} 1 \quad \text{selama } (d_{last\_sched} - i) \in \text{Completions}$$
   * Jika $\text{LostStreak} > 0$, maka $\text{isBroken} = \text{true}$ dan sistem mengeluarkan banner peringatan.

---

### 5.3 Algoritma Skor Konsistensi Bergulir 30 Hari (*Rolling Consistency Score*)
*Berkas Implementasi:* `src/lib/algorithms/consistency.ts` $\rightarrow$ `calculateOverallConsistency()`

#### Definisi Matematis:
Konsistensi diukur secara proporsional berbobot (*weighted completion rate*) dalam jendela 30 hari terakhir:

$$C = \left( \frac{\sum_{i=1}^{N} \min(\text{Completed}_i, \text{Scheduled}_i)}{\sum_{i=1}^{N} \text{Scheduled}_i} \right) \times 100\%$$

*Jika $\sum \text{Scheduled}_i = 0$, maka $C = 0\%$.*  
*Nilai $C$ di-clamp ketat pada interval $[0.00, 100.00]$.*

---

### 5.4 Algoritma Siklus Hidup Pohon Virtual (*Tree Growth & Health Lifecycle*)
*Berkas Implementasi:* `src/lib/algorithms/tree.ts` $\rightarrow$ `calculateTreeStage()`

#### Aturan Ambang Batas (*Thresholds*):
Tahap visual pohon ($S$) dipetakan secara deterministik berdasarkan skor konsistensi $C$:

$$S(C) = \begin{cases} 
\text{Seed (Benih)} & 0.00 \le C < 20.00 \\
\text{Sprout (Tunas)} & 20.00 \le C < 40.00 \\
\text{Young Tree (Pohon Muda)} & 40.00 \le C < 60.00 \\
\text{Healthy Tree (Pohon Sehat)} & 60.00 \le C < 80.00 \\
\text{Mature Tree (Pohon Dewasa)} & 80.00 \le C \le 100.00
\end{cases}$$

#### Rumus Poin Menuju Evolusi Berikutnya:
$$\Delta C_{next} = \max(0, \text{Threshold}_{next} - C)$$

---

### 5.5 Algoritma XP & Kurva Pertumbuhan Level
*Berkas Implementasi:* `src/lib/algorithms/xp.ts` & `src/lib/algorithms/level.ts`

#### Formula Hadiah XP:
$$\text{XP}_{earned} = \begin{cases} 
10\text{ XP} & \text{Difficulty} = \text{EASY} \\
15\text{ XP} & \text{Difficulty} = \text{MEDIUM} \\
20\text{ XP} & \text{Difficulty} = \text{HARD}
\end{cases}$$

#### Tabel Progresi Level:
| Level | Rentang Total XP | XP Perlu di Level Tersebut |
| :---: | :---: | :---: |
| 1 | 0 – 99 | 100 XP |
| 2 | 100 – 249 | 150 XP |
| 3 | 250 – 449 | 200 XP |
| 4 | 450 – 699 | 250 XP |
| 5 | 700 – 999 | 300 XP |
| 6 | 1000 – 1349 | 350 XP |
| 7 | 1350 – 1749 | 400 XP |
| $\dots$ | $\dots$ | $+50\text{ XP per level}$ |

---

### 5.6 Logika Mutasi Antarmuka Instan (*Optimistic UI State & Rollback Logic*)
*Berkas Implementasi:* `src/components/habits/HabitCard.tsx` & `src/app/app/dashboard/page.tsx`

#### Masalah yang Diselesaikan:
Dalam aplikasi pelacak kebiasaan, jeda jaringan sebesar $200 - 500\text{ ms}$ saat menekan centang merusak kepuasan psikologis (*dopamine hit*) pengguna.

#### Alur Logika Klien-Server:
1. **Langkah 1 (0ms - Klien):** Saat pengguna mengklik tombol centang:
   * Status lokal `isCompleted` langsung diubah menjadi `true`.
   * Partikel konfeti (`canvas-confetti`) langsung diledakkan seketika.
   * `queryClient.cancelQueries(['dashboard-summary'])` dijalankan untuk mencegah refetch yang menimpa state sementara.
   * Snapshot data cache lama disimpan ke memori: `previousSummary = queryClient.getQueryData(...)`.
2. **Langkah 2 (Kalkulasi Optimistik Cache):**
   * `completed_count` ditambah 1.
   * `completion_percentage` dihitung ulang secara instan.
   * Jika ini kebiasaan pertama hari ini, `streak.current_streak` dinaikkan secara optimistik.
   * `user_level.total_xp` ditambahkan dengan `xp_reward`.
3. **Langkah 3 (Sinkronisasi Asinkron):**
   * HTTP POST dikirim ke `/api/habits/[id]/complete`.
4. **Langkah 4 (Penanganan Kegagalan / Rollback):**
   * Jika respons server gagal (misal: koneksi terputus atau HTTP 500), `onError` dipicu:
     * `queryClient.setQueryData(['dashboard-summary'], context.previousSummary)` mengembalikan antarmuka ke keadaan awal secara otomatis tanpa merusak integritas state.

---

### 5.7 Formulasi Sistem Pendukung Keputusan (SPK) Metode Simple Additive Weighting (SAW)
*Berkas Implementasi:* `src/lib/algorithms/prediction.ts` & `src/lib/services/prediction.service.ts`

#### Definisi & Masalah yang Diselesaikan:
Sistem secara proaktif mengevaluasi kebiasaan terjadwal yang memiliki tingkat kerentanan kegagalan/terlewat pada hari ini menggunakan metode Multi-Criteria Decision Making (MCDM) **Simple Additive Weighting (SAW)**. Ketika skor preferensi risiko mencapai ambang batas $V_i \ge 0.50$ (atau $50\%$) setelah masa adaptasi 14 hari, sistem menyajikan rekomendasi adaptif (*Smart Decision Support Nudge*) seperti penurunan target kuantitas sementara untuk mencegah pemutusan *streak*.

#### Kriteria Keputusan ($C_1 \dots C_5$) dan Pembobotan ($W$):
Seluruh kriteria bertipe **Benefit** (semakin tinggi nilainya, semakin besar risiko kebiasaan tersebut berpotensi terlewat/gagal hari ini). Total bobot memenuhi aksioma normalisasi MCDM: $\sum_{j=1}^{5} W_j = 1.00$ (100%).

> **Metodologi Penentuan Bobot (Direct Rating / Subjective Weighting oleh Peneliti):**  
> Pembobotan ditentukan secara langsung (*Direct Assignment*) oleh perancang sistem berdasarkan pertimbangan rasionalitas tingkatan pengaruh (*Behavioral Priority Tier*):
> 1. **Tier 1 — Bukti Perilaku Riwayat Langsung (Total 55%):** Diberikan bobot terbesar karena rekam jejak penyelesaian nyata merupakan prediktor paling akurat dari kedisiplinan pengguna ($C_1 = 30\%$, $C_2 = 25\%$).
> 2. **Tier 2 — Beban Kognitif & Kerentanan Usia (Total 30%):** Mempertimbangkan faktor psikologis kelelahan mental harian ($C_3 = 15\%$) dan fase pembentukan kebiasaan ($C_4 = 15\%$).
> 3. **Tier 3 — Faktor Penundaan Waktu (Total 15%):** Mempertimbangkan risiko ketiduran akibat penundaan ke larut malam ($C_5 = 15\%$).
> 
> *Catatan Akademik:* Literatur psikologi perilaku (seperti riset kebiasaan Dr. Phillippa Lally, teori beban kognitif, dan konsep *Atomic Habits*) dijadikan sebagai **landasan konseptual dalam pemilihan variabel kriteria**, bukan sebagai sumber yang mengeluarkan angka persentase eksak tersebut. Angka bobot ditentukan oleh peneliti untuk pemodelan SPK pada sistem ini.

1. **$C_1$ — Recent Miss Rate 14 Hari Terakhir (Bobot $W_1 = 0.30$ / 30%):**
   Rasio hari terjadwal yang terlewat dalam 2 minggu terakhir:
   $$C_1 = \frac{\text{Jumlah Jadwal Terlewat}}{\text{Jumlah Total Jadwal 14 Hari Terakhir}} \in [0.0, 1.0]$$
2. **$C_2$ — Day-of-Week Vulnerability (Bobot $W_2 = 0.25$ / 25%):**
   Rasio historis kegagalan khusus pada hari yang sama dalam seminggu selama 14 hari terakhir (menangkap 2 siklus kalender penuh):
   $$C_2 = \frac{\text{Terlewat pada Hari Serupa}}{\text{Jadwal pada Hari Serupa 14 Hari Terakhir}} \in [0.0, 1.0]$$
3. **$C_3$ — Daily Cognitive Workload / Fatigue (Bobot $W_3 = 0.15$ / 15%):**
   Akumulasi bobot kesulitan kebiasaan yang terjadwal hari ini (Easy: 1, Medium: 2, Hard: 3), dinormalisasi terhadap ambang kelelahan 16 poin:
   $$C_3 = \min\left(1.0, \frac{\text{Total Poin Kesulitan Hari Ini}}{16}\right)$$
4. **$C_4$ — Habit Maturity & Fragility (Bobot $W_4 = 0.15$ / 15%):**
   Faktor kerentanan usia kebiasaan sejak dibuat. Kebiasaan baru masih dalam fase penyesuaian:
   $$C_4 = \begin{cases} 
   0.85, & \text{jika usia} < 7\text{ hari (fase kritis)} \\
   0.65, & \text{jika } 7 \le \text{usia} \le 13\text{ hari} \\
   0.35, & \text{jika } 14 \le \text{usia} \le 29\text{ hari (mulai stabil)} \\
   0.12, & \text{jika usia} \ge 30\text{ hari (kebiasaan matang/terbentuk)}
   \end{cases}$$
5. **$C_5$ — Late Hour Procrastination (Bobot $W_5 = 0.15$ / 15%):**
   Pola penundaan waktu pengerjaan berdasarkan rata-rata jam penyelesaian riwayat:
   $$C_5 = \begin{cases} 
   0.85, & \text{jika rata-rata jam} \ge 22.00\text{ (larut malam, rawan tertidur)} \\
   0.65, & \text{jika } 20.00 \le \text{rata-rata jam} < 22.00 \\
   0.40, & \text{jika } 16.00 \le \text{rata-rata jam} < 20.00 \\
   0.15, & \text{jika rata-rata jam} < 16.00\text{ (pagi / siang hari)}
   \end{cases}$$

#### Normalisasi Matriks ($R$) & Formulasi Nilai Preferensi SAW ($V_i$):
Karena seluruh nilai kriteria $C_1 \dots C_5$ telah terpetakan secara proporsional dalam domain skala $[0.0, 1.0]$, maka elemen matriks ternormalisasi bernilai $R_{ij} = C_j$.

Formulasi nilai preferensi alternatif kebiasaan ke-$i$ ($V_i$):
$$V_i = \sum_{j=1}^{5} W_j \cdot R_{ij}$$
$$V_i = (0.30 \cdot C_1) + (0.25 \cdot C_2) + (0.15 \cdot C_3) + (0.15 \cdot C_4) + (0.15 \cdot C_5)$$

Skor Persentase Risiko Kegagalan:
$$\text{Failure Percentage} = \min(99, \max(1, \text{round}(V_i \times 100)))$$

#### Klasifikasi Tingkat Risiko & Deteksi Faktor Dominan:
* **Tingkat Risiko:**
  * `HIGH` ($V_i \ge 0.70$ atau Skor $\ge 70\%$)
  * `MODERATE` ($0.50 \le V_i < 0.70$ atau Skor $50\% - 69\%$)
  * `LOW / AMAN` ($V_i < 0.50$ atau Skor $< 50\%$, tidak memicu banner)
* **Explainability (Faktor Dominan):** Sistem mengurutkan kontribusi terbobot ($W_j \cdot R_{ij}$) dan menetapkan kriteria dengan nilai terbobot tertinggi sebagai penyebab utama risiko untuk ditampilkan secara transparan kepada pengguna.

#### Simulasi Kasus Nyata Perhitungan SAW (Contoh Komputasi):
Misalkan hari evaluasi adalah hari **Rabu**, dan sistem mengevaluasi kebiasaan *"Baca Buku 30 Halaman"*:

1. **Pengumpulan Data Mentah & Normalisasi ($C_1 \dots C_5$):**
   * **$C_1$ (Miss Rate 14 Hari):** Dalam 14 hari terakhir, pengguna bolong 4 kali dari 14 jadwal.  
     $$C_1 = \frac{4}{14} = 0.2857 \approx \mathbf{0.28}$$
   * **$C_2$ (Kerentanan Hari Rabu):** Dalam 14 hari terakhir ada 2 kali hari Rabu. Pengguna bolong 1 kali pada hari Rabu.  
     $$C_2 = \frac{1}{2} = \mathbf{0.50}$$
   * **$C_3$ (Beban Kesulitan Harian):** Pengguna memiliki 4 jadwal kebiasaan hari ini dengan tingkat kesulitan: Minum Air (`EASY` = 1), Baca Buku (`MEDIUM` = 2), Belajar Coding (`HARD` = 3), dan Olahraga (`MEDIUM` = 2). Total kesulitan $= 1 + 2 + 3 + 2 = 8$ poin dari ambang batas lelah 16 poin:  
     $$C_3 = \frac{8}{16} = \mathbf{0.50}$$  
     *(Catatan: Jika total poin $\ge 16$, fungsi `Math.min(1.0, total/16)` mengunci nilainya maksimal tetap $1.0$ sesuai batas atas kejenuhan mental kognitif).*
   * **$C_4$ (Usia Kebiasaan):** Kebiasaan telah berjalan 20 hari (fase adaptasi menengah). Berdasarkan tabel bobot umur, $C_4 = \mathbf{0.35}$.
   * **$C_5$ (Pola Jam Malam):** Rata-rata jam penyelesaian riwayat adalah pukul 22.30 malam ($\ge 22.00$, rawan tertidur/menunda). Maka $C_5 = \mathbf{0.85}$.

2. **Matriks Perhitungan Terbobot SAW:**

| Kriteria ($j$) | Deskripsi Indikator | Nilai Normalisasi ($R_{ij}$) | Bobot Kriteria ($W_j$) | Nilai Terbobot ($W_j \times R_{ij}$) |
| :---: | :--- | :---: | :---: | :---: |
| **$C_1$** | Tingkat Terlewat 14 Hari | $0.28$ | $0.30$ | **$0.084$** |
| **$C_2$** | Kerentanan Hari Serupa (Rabu) | $0.50$ | $0.25$ | **$0.125$** |
| **$C_3$** | Beban Kognitif Hari Ini | $0.50$ | $0.15$ | **$0.075$** |
| **$C_4$** | Kerentanan Usia Kebiasaan | $0.35$ | $0.15$ | **$0.052$** |
| **$C_5$** | Pola Penundaan Larut Malam | $0.85$ | $0.15$ | **$0.128$** |
| **TOTAL** | **Nilai Preferensi Alternatif ($V_i$)** | — | **$1.00$** | **$0.464$ (Skor: $46\%$)** |

3. **Pengambilan Keputusan:**
   * Skor Risiko $= 0.464 \times 100\% = \mathbf{46\%}$.
   * Karena skor $< 50\%$, status dikategorikan sebagai **LOW (AMAN)**, sehingga banner intervensi tidak perlu dimunculkan agar tidak mengganggu fokus pengguna.
   * **Skenario Risiko Tinggi:** Seandainya $C_1$ bolong 7 hari ($C_1 = 7/14 = 0.50$), maka total $V_i$ melonjak menjadi **$0.530$ ($53\%$)**. Sistem seketika mengaktifkan status **MODERATE RISK**, mendeteksi $C_5$ dan $C_1$ sebagai faktor dominan, dan menerbitkan rekomendasi adaptif.

#### Landasan Ilmiah Pemilihan Jendela 14 Hari & Cold-Start Guard:
Penetapan jendela observasi dan ambang batas aktivasi model prediktif pada **14 hari (2 minggu)** didasarkan pada tiga pertimbangan metodologis dan psikologis:
1. **Mengatasi Masalah Sampel Minim (*Small Sample Noise*):**
   Jika pengguna memiliki kebiasaan yang hanya dijadwalkan 2 kali seminggu (misalnya Senin dan Kamis), jendela 7 hari hanya menangkap 1 kali kesempatan per hari tersebut. Jika pengguna melewatkannya sekali saja karena urusan darurat, tingkat kegagalan (*miss rate*) seketika melonjak menjadi $100\%$ ($1/1$). Hal ini memicu *false alarm* (peringatan palsu) yang mengganggu kenyamanan pengguna.
2. **Menangkap 2 Siklus Kalender Lengkap:**
   Dengan rentang 14 hari, setiap hari dalam seminggu memiliki minimal 2 titik data evaluasi. Rasio keterlewatan menjadi lebih terdistribusi secara wajar ($0\%$, $50\%$, atau $100\%$), sehingga nilai kriteria $C_1$ (*Miss Rate*) dan $C_2$ (*Day-of-Week Vulnerability*) menjadi jauh lebih representatif dan stabil.
3. **Keseimbangan Memori (*Recency vs. Baseline Memory Balance*):**
   Rentang 30 hari terlalu lambat dalam mendeteksi kejenuhan pengguna (*burnout*), sedangkan 7 hari terlalu reaktif terhadap anomali sesaat. Rentang 14 hari (2 minggu) adalah *sweet spot* psikologis untuk mendeteksi tren penurunan motivasi sebelum kebiasaan benar-benar ditinggalkan.

#### Aturan Tindakan Adaptif (*Adaptive Decision Support Nudge*):
* **Cold-Start Guard (Filter Ambang Batas 2 Minggu / 14 Hari):**
  * Kebiasaan baru dengan usia $< 14\text{ hari}$ berada dalam *initial onboarding baseline period*. Peringatan prediksi risiko dini otomatis **dinonaktifkan** selama 14 hari pertama untuk menangkap 2 siklus kalender utuh dan mencegah *false alarm* pada pengguna atau kebiasaan baru.
* **Kriteria Evaluasi ($V_i \ge 0.50$ atau Skor Risiko $\ge 50\%$ setelah 14 hari):**
  * Diklasifikasikan sebagai `HIGH` ($V_i \ge 0.70$) atau `MODERATE` ($0.50 \le V_i < 0.70$).
  * **Jalur 1 — Tipe Kuantitatif (`target_value > 1` atau Satuan Jam/Liter):**
    * *Pesan Rekomendasi:* `"Beban hari ini terdeteksi tinggi. Amankan streak dengan memangkas target menjadi [X] [Satuan]."`
    * *Formulasi Pangkas:* $\text{Target Baru} = \max\left(1, \left\lfloor \frac{\text{Target Lama}}{2} \right\rfloor\right)$.
    * *Konversi Cerdas Satuan:*
      * Jika `target_unit: 'jam'` dan target bernilai 1, sistem otomatis mengonversinya menjadi **30 menit**.
      * Jika `target_unit: 'liter'` (atau `'l'`) dan target bernilai 1, sistem otomatis mengonversinya menjadi **500 ml** (setara 2 gelas air).
    * *Aksi Tombol Utama:* `[⚡ Pangkas Target Jadi [X] [Satuan]]` yang mengeksekusi `PATCH /api/habits/[id]` seketika.
    * *Aksi Sekunder:* `[Saya Sanggup Target Normal]` yang menutup banner tanpa memodifikasi data kebiasaan.
  * **Jalur 2 — Tipe Biner / Checklist (`target_value = 1` Non-Jam/Liter):**
    * *Pesan Rekomendasi:* `"[Nama] biasanya rawan terlewat di hari [Hari]. Gunakan prinsip 2 menit: lakukan versi teringan sekarang agar pohon virtualmu tidak kekurangan nutrisi."`
    * *Aksi Tombol Utama:* `[✓ Tandai Selesai Cepat (2 Menit)]` yang langsung mengeksekusi `POST /api/habits/[id]/complete` dengan ledakan konfeti dan pembaruan antarmuka instan (0ms).
    * *Aksi Alternatif:* `[⏰ Ingatkan 1 Jam Lagi]` yang menunda (*snooze*) penayangan banner peringatan selama 60 menit via *client-side local storage*.
* **Penyajian Antarmuka Antirumpang:**
  * Komponen `PredictionAlertBanner` menyajikan kotak *callout* rekomendasi SPK secara visual dan eksplisit sehingga pengguna mendapatkan instruksi tindakan yang jelas sebelum memilih opsi.

---

### 5.8 Manajemen Zona Waktu & Siklus Pergantian Hari (*Timezone Synchronization & Midnight Reset*)
*Berkas Implementasi:* `src/app/api/dashboard/summary/route.ts`, `src/lib/services/habit.service.ts`, `src/lib/algorithms/schedule.ts`, `src/app/app/dashboard/page.tsx`

#### Masalah Zona Waktu Serverless (UTC vs Waktu Lokal):
* Server *cloud/serverless* (seperti Vercel) mengeksekusi fungsi backend dalam zona waktu **UTC (GMT+0)**.
* Di Indonesia (WIB UTC+7, WITA UTC+8, WIT UTC+9), jam 00:00 (tengah malam) waktu lokal setara dengan jam 16:00-17:00 UTC kemarin.
* Jika backend hanya mengandalkan `new Date()` internal server tanpa parameter tanggal lokal klien:
  1. Pergantian hari baru (*reset checklist*) di sisi server baru akan terjadi saat jam 07:00 WIB / 08:00 WITA (tengah malam UTC).
  2. Antara jam 00:00 hingga 08:00 pagi waktu lokal, pengguna melihat tanggal sudah berganti (misal: Sabtu), namun checklist masih menampilkan status centang dari hari sebelumnya (Jumat) karena server masih menganggapnya hari Jumat.

#### Solusi Arsitektur (*Client-Anchored Date Evaluation*):
1. **Query Param `?date=YYYY-MM-DD`:**
   Setiap permintaan data agregasi dashboard (`GET /api/dashboard/summary?date=...`) dan analitik menyertakan tanggal lokal perangkat pengguna (`toDateString(new Date())`).
2. **Pencatatan Checklist Sinkron:**
   Saat pengguna menekan centang kebiasaan, mutasi `POST /api/habits/[id]/complete` mengirimkan `{ date: localDate }` sehingga catatan penyelesaian di database terikat presisi pada tanggal kalender lokal pengguna.
3. **Penyelarasan Algoritma:**
   Semua fungsi evaluasi (`getTodayHabits`, `calculateUserGlobalStreak`, `detectBrokenStreaks`, dan `getAtRiskHabitsToday`) menerima parameter `evalDate` yang diselaraskan dengan tanggal kalender pengguna, memastikan siklus reset habit terjadi tepat pukul **00:00 (tengah malam) waktu lokal masing-masing pengguna**.

---

## 6. KATALOG ENDPOINT RESTFUL API

Seluruh endpoint menerima header `Content-Type: application/json` dan cookie sesi / Bearer Token Supabase untuk otentikasi.

| Method | Endpoint URI | Fungsi & Deskripsi | Request Body / Query | Format Response Utama | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Mendaftarkan akun pengguna baru | `{ email, password, full_name }` | `{ success: true, user }` | `201 Created` |
| **POST** | `/api/auth/login` | Masuk ke sistem | `{ email, password }` | `{ success: true, session }` | `200 OK` |
| **POST** | `/api/auth/logout` | Menghapus sesi otentikasi | *-* | `{ success: true }` | `200 OK` |
| **GET** | `/api/dashboard/summary` | Mengambil data agregasi dashboard (mendukung zona waktu lokal) | `?date=YYYY-MM-DD` | `{ success: true, data: DashboardSummary }` | `200 OK` |
| **GET** | `/api/calendar/activity` | Mengambil data riwayat aktivitas kebiasaan tahunan & bulanan | `?year=2026` | `{ success: true, data: CalendarActivityResponse }` | `200 OK` |
| **GET** | `/api/calendar/day` | Mengambil rincian kebiasaan terjadwal per tanggal | `?date=YYYY-MM-DD` | `{ success: true, data: CalendarDayDetail }` | `200 OK` |
| **GET** | `/api/habits` | Mendapatkan seluruh kebiasaan user | `?archived=false&categoryId=...` | `{ success: true, data: HabitItem[] }` | `200 OK` |
| **POST** | `/api/habits` | Membuat kebiasaan baru | `{ name, category_id, difficulty, frequency_type, ... }` | `{ success: true, data: Habit }` | `201 Created` |
| **PATCH**| `/api/habits/[id]` | Memperbarui nama/target kebiasaan | `{ name?, target_value?, ... }` | `{ success: true, data: Habit }` | `200 OK` |
| **DELETE**| `/api/habits/[id]`| Menghapus kebiasaan secara permanen | *-* | `{ success: true }` | `200 OK` |
| **POST** | `/api/habits/[id]/complete` | **Mencatat checklist kebiasaan hari ini** | `{ date?: string, note?: string }` | `{ success: true, data: { xp_earned, streak, tree } }` | `200 OK` |
| **GET** | `/api/categories` | Mendapatkan daftar kategori aktif | *-* | `{ success: true, data: Category[] }` | `200 OK` |
| **GET** | `/api/achievements` | Mendapatkan daftar pencapaian user | *-* | `{ success: true, data: Achievement[] }` | `200 OK` |
| **GET** | `/api/analytics/weekly` | Mendapatkan performa penyelesaian per tanggal lokal & rentang hari (Mingguan/Bulanan) | `?date=YYYY-MM-DD&range=7\|30` | `{ success: true, data: WeeklyChartData[] }` | `200 OK` |
| **GET** | `/api/analytics/performance` | Mendapatkan ringkasan performa kebiasaan | `?date=YYYY-MM-DD` | `{ success: true, data: PerformanceSummary }` | `200 OK` |
| **POST** | `/api/notifications/subscribe` | Menyimpan langganan Web Push perangkat ke basis data | `{ subscription: PushSubscription }` | `{ success: true, message }` | `200 OK` |
| **DELETE**| `/api/notifications/subscribe` | Mencabut langganan Web Push pengguna | *-* | `{ success: true, message }` | `200 OK` |
| **POST** | `/api/notifications/test-push` | Menguji pengiriman push notification dari server ke ponsel pengguna (mendukung jeda waktu) | `{ delaySeconds?: number }` | `{ success: true, message }` | `200 OK` |
| **POST** | `/api/cron/reminders` | Evaluator otomatis/cron SPK SAW & Pengingat Streak Latar Belakang | Bearer CRON_SECRET atau Session | `{ success: true, dispatched, details }` | `200 OK` |

---

## 7. ALUR BISNIS END-TO-END (USER JOURNEY & STATE MACHINE)

### 7.1 Alur Eksekusi Checklist Taktil (Optimistic UI & Server Sync)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna
    participant UI as Komponen Dashboard (React)
    participant Cache as TanStack React Query Cache
    participant API as Next.js REST API
    participant DB as PostgreSQL (Supabase)

    User->>UI: Menekan tombol centang pada kebiasaan
    Note over UI,Cache: FASE 1: OPTIMISTIC UPDATE (0ms)
    UI->>UI: Ubah ikon jadi hijau centang & bunyikan confetti
    UI->>Cache: Update cache lokal (streak + 1, completed_count + 1, XP bertambah)
    UI-->>User: Tampilan langsung tercentang seketika

    Note over UI,DB: FASE 2: SERVER SYNCHRONIZATION
    UI->>API: POST /api/habits/[id]/complete
    API->>DB: Validasi RLS & Cek unique_habit_completion_per_day
    API->>DB: INSERT into habit_completions
    API->>DB: Evaluasi streak, kalkulasi konsistensi 30 hari & status pohon
    API->>DB: INSERT into xp_transactions & UPDATE user_levels
    DB-->>API: Data transaksi tersimpan aman
    API-->>UI: Response JSON 200 OK (Data resmi server)

    alt Jika Request Gagal / Putus Jaringan
        API-->>UI: Response 500 / Network Error
        UI->>Cache: Rollback ke snapshot sebelum centang
        UI-->>User: Kembalikan centang & tampilkan notifikasi kendala
    end
```

### 7.2 Alur Sistem Pendukung Keputusan (SPK) SAW & Nudge Adaptif

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna
    participant UI as Dashboard & PredictionAlertBanner
    participant API as GET /api/dashboard/summary
    participant DSS as PredictionService & SAW Engine
    participant DB as PostgreSQL (Supabase)

    User->>UI: Membuka halaman Dashboard HabitGrow
    UI->>API: Request data ringkasan harian
    API->>DB: Query daftar kebiasaan hari ini & riwayat 14 hari
    DB-->>API: Data mentah kebiasaan dan status completion
    API->>DSS: Evaluasi kebiasaan belum tuntas (Cek Usia Kebiasaan >= 14 Hari)
    alt Usia Kebiasaan < 14 Hari (Masa Adaptasi Awal 2 Siklus)
        DSS-->>API: Lewati evaluasi (Cegah false alarm & noise sampel minim)
    else Usia Kebiasaan >= 14 Hari
        DSS->>DSS: Normalisasi 5 Kriteria (C1-C5) & Hitung Nilai Preferensi SAW (Vi)
        alt Nilai Preferensi Vi >= 0.50 (Skor Risiko >= 50%)
            DSS-->>API: Buat rekomendasi adaptif (LOWER_TARGET jika >1, CHECKLIST_2MIN jika =1)
        end
    end
    API-->>UI: Response JSON 200 OK (Memuat daftar at_risk_habits)
    UI->>User: Tampilkan PredictionAlertBanner (Penyebab Utama, Rekomendasi SPK & Tombol Aksi)
    
    opt Pengguna Memilih Aksi Adaptif
        alt Opsi LOWER_TARGET
            User->>UI: Klik tombol "Ubah Target Jadi [X] (Mode Ringan)"
            UI->>API: PATCH /api/habits/[id] (target_value baru)
            API->>DB: UPDATE habits SET target_value = new_target
            DB-->>API: Berhasil update
            API-->>UI: Response 200 OK
            UI-->>User: Target baru aktif seketika, risiko gagal termitigasi & banner tertutup
        else Opsi EARLY_NUDGE
            User->>UI: Klik tombol "Siap, Kerjakan Lebih Awal"
            UI-->>User: Komitmen dicatat, tampilkan pesan semangat & tutup banner
        end
    end
```

---

## 8. STRUKTUR DIREKTORI & PEMETAAN KODE SUMBER

```text
HabitGrow/
├── src/
│   ├── app/                                # Next.js 16 App Router
│   │   ├── (auth)/                         # Rute Publik (Login, Register)
│   │   ├── app/                            # Rute Terproteksi
│   │   │   ├── dashboard/page.tsx          # Dashboard Utama (Executive Command Bar & 2-Col Grid)
│   │   │   ├── habits/page.tsx             # Manajemen Daftar Kebiasaan
│   │   │   ├── tree/page.tsx               # Halaman Detail Sanctuary Pohon
│   │   │   ├── calendar/page.tsx           # Kalender Bulanan Interaktif Per-Bulan & Per-Tanggal (Senin s/d Minggu)
│   │   │   ├── statistics/page.tsx         # Grafik Analisis & Heatmap
│   │   │   └── achievements/page.tsx       # Galeri Trofi & Pencapaian
│   │   └── api/                            # Backend REST API Endpoints
│   │       ├── auth/                       # API Auth Login/Register/Logout
│   │       ├── habits/                     # API CRUD Habits, /complete, & PATCH adaptif
│   │       ├── dashboard/summary/          # API Aggregator Ringkasan Dashboard + ML Risk
│   │       ├── calendar/                   # API Matriks Aktivitas (/activity & /day)
│   │       ├── categories/                 # API Kategori
│   │       ├── achievements/               # API Pencapaian
│   │       ├── notifications/              # API Web Push (/subscribe & /test-push)
│   │       └── cron/reminders/             # API Evaluator Otomatis SPK SAW & Background Push
│   ├── components/                         # Komponen Antarmuka Reusable
│   │   ├── habits/
│   │   │   ├── HabitCard.tsx               # Kartu Kebiasaan Taktil (0ms Optimistic UI)
│   │   │   ├── HabitFormModal.tsx          # Modal Tambah/Edit Kebiasaan
│   │   │   ├── StreakAlertBanner.tsx       # Banner Empatis Streak Putus
│   │   │   └── PredictionAlertBanner.tsx   # Banner Peringatan Dini ML + Aksi Adaptif 1-Klik
│   │   ├── notifications/
│   │   │   └── NotificationPermissionBanner.tsx # Banner Persetujuan Web Push PWA
│   │   ├── tree/
│   │   │   └── TreeVisualization.tsx       # Komponen SVG Animasi Pohon (5 Tahap)
│   │   ├── layout/
│   │   │   └── Navbar.tsx                  # Navigasi Responsif, Drawer & Tombol PWA Install
│   │   └── ui/                             # Komponen Atomik (Button, Input, ThemeToggle)
│   ├── hooks/                              # Custom React Hooks
│   │   ├── use-browser-notifications.ts    # Hook Manajemen Izin & Web Push Dispatch
│   │   └── use-pwa-install.ts              # Hook Deteksi Event beforeinstallprompt (WebAPK)
│   ├── lib/
│   │   ├── algorithms/                     # PURE LOGIC (Dapat Diuji Tanpa Database)
│   │   │   ├── streak.ts                   # Algoritma Non-Zero Day & Broken Streak
│   │   │   ├── tree.ts                     # Ambang Batas 5 Tahap Pohon & Kesehatan
│   │   │   ├── consistency.ts              # Rolling Window Consistency Formula
│   │   │   ├── level.ts                    # Logika Threshold & Progresi XP
│   │   │   ├── xp.ts                       # Multiplier XP Berdasarkan Kesulitan
│   │   │   ├── prediction.ts               # Decision Support System (DSS) Metode SAW 5 Kriteria
│   │   │   └── __tests__/                  # Unit Tests (41 Test Cases Passing)
│   │   │       ├── streak.test.ts
│   │   │       ├── tree.test.ts
│   │   │       ├── level.test.ts
│   │   │       ├── xp.test.ts
│   │   │       ├── consistency.test.ts
│   │   │       └── prediction.test.ts      # 10 Skenario Evaluasi DSS SAW & Nudge Preskriptif
│   │   ├── services/                       # Lapisan Layanan Bisnis Database
│   │   │   ├── habit.service.ts
│   │   │   ├── streak.service.ts
│   │   │   ├── consistency.service.ts
│   │   │   ├── achievement.service.ts
│   │   │   ├── prediction.service.ts       # Ekstraksi Fitur 14 Hari & Skoring Risiko
│   │   │   ├── web-push.service.ts         # Layanan Enkripsi VAPID & Dispatch Push Server
│   │   │   ├── browser-notification.service.ts # Service Worker & PushManager Bridge
│   │   │   └── __tests__/
│   │   │       └── web-push.test.ts        # Unit Tests Web Push Service (6 Tests Passing)
│   │   ├── supabase/                       # Klien Supabase (Client, Server, Admin)
│   │   ├── validators/                     # Zod Schemas
│   │   └── utils.ts                        # Helper Format Tanggal Indonesia & Greeting
│   └── types/                              # Definisi TypeScript & Tipe Database
├── image/                                  # Direktori Master Aset Visual & Branding
│   ├── habitgrow_logo.jpg                  # Logo Render 3D Glassmorphic Botani (1024x1024)
│   ├── habitgrow_logo.svg                  # Vektor Master Scalable Icon (Squircle 512x512)
│   └── habitgrow_brand_horizontal.svg      # Vektor Brand Horizontal Lengkap dengan Tipografi
├── public/                                 # Aset Statis Web Publik & PWA Engine
│   ├── sw.js                               # Background Service Worker (Push & Cache Fetch Handler)
│   ├── manifest.json                       # Web App Manifest Standar W3C PWA
│   ├── icons/                              # Paket Ikon PWA PNG (192x192, 512x512, Apple Touch)
│   └── image/                              # Salinan Aset Logo untuk Browser & PWA
├── supabase/
│   ├── migrations/                         # Berkas Migrasi SQL (Schema & RLS)
│   └── seed.sql                            # Data Awal Kategori & Pencapaian
├── PROJECT_DOCUMENTATION.md                # Berkas Dokumentasi Induk (Dokumen Ini)
└── package.json                            # Dependensi Proyek
```

---

### 8.1 Identitas Visual, Filosofi Logo & Lokasi Aset Gambar

Untuk kebutuhan presentasi, laporan cetak tugas akhir, maupun pembuatan *icon launcher* aplikasi mobile, HabitGrow memiliki identitas visual berbasis metafora botani dan sains komputasi:

#### 1. Filosofi Logo:
* **Tunas Daun Organik (*The Sprout*):** Melambangkan proses pembentukan kebiasaan baru yang bertumbuh dari langkah kecil (*incremental growth*). Daun yang bercabang mencerminkan konsistensi harian.
* **Landasan Kristal Heksagonal (*The Crystal Seed Base*):** Terinspirasi dari struktur digital dan sains komputasi, merepresentasikan fondasi data yang kuat, terukur, dan disiplin ilmiah di balik pelacakan kebiasaan.
* **Cincin Terarium Digital (*Ambient Glow & Glassmorphism*):** Lingkaran pelindung neon menggambarkan ekosistem aman yang memelihara semangat pengguna agar tidak mengalami kelelahan mental (*streak fatigue*).

#### 2. Palet Warna Resmi (*Brand Palette*):
* **Emerald Green (`#059669` / `#047857`):** Menandakan ketenangan, stabilitas, dan alam.
* **Mint Neon Teal (`#10b981` / `#34d399`):** Menandakan energi, vitalitas, dan dorongan motivasi harian.
* **Dark Botanical Canvas (`#0c1914` / `#111a16`):** Latar belakang elegan berstandar *sleek dark mode* yang nyaman di mata pengguna.

#### 3. Lokasi Berkas Logo di Komputer:
* `image/habitgrow_logo.jpg` — Berkas gambar resolusi tinggi (1024x1024) dengan efek 3D glassmorphic neon, cocok untuk cover skripsi, slide PPT, dan icon installer.
* `image/habitgrow_logo.svg` — Berkas vektor SVG tanpa batas resolusi (*lossless scalable vector*) untuk keperluan desain grafis dan pencetakan dokumen.
* `image/habitgrow_brand_horizontal.svg` — Berkas logo horizontal memanjang yang memadukan icon dan teks tipografi *HabitGrow* beserta tagline.
* `public/image/` — Salinan aset publik yang dapat diakses langsung oleh browser atau tag HTML `<img>`.

---

## 9. CETAK BIRU INTEGRASI IOT UNTUK SKRIPSI SISTEM KOMPUTER

Khusus mahasiswa **Sistem Komputer**, HabitGrow dapat diekspansi menjadi sistem *Cyber-Physical* (*Smart Botanical Companion*) dengan arsitektur berikut:

```mermaid
graph LR
    subgraph Lingkungan Fisik di Meja Kerja
        NFC[Kartu/Stiker NFC pada Botol/Buku]
        RC522[Modul RFID-RC522]
        ESP32[Mikrokontroler ESP32 Wi-Fi]
        TFT[Layar Mini TFT LCD 1.8 inch]
        RGB[LED Neopixel Ring WS2812B]
        
        NFC -->|Tap Fisik| RC522
        RC522 -->|SPI Interface| ESP32
        ESP32 -->|SPI/I2C| TFT
        ESP32 -->|GPIO PWM| RGB
    end

    subgraph Cloud Server HabitGrow
        REST[REST API /api/habits/:id/complete]
        DB[(Supabase Database)]
    end

    ESP32 -->|HTTP POST JSON via Wi-Fi| REST
    REST --> DB
```

### 9.1 Skenario Pengujian Skripsi Hardware:
1. **Pemicu Fisik (*NFC Physical Habit Check-in*):**
   * Mahasiswa menempelkan tag NFC pada botol air minum atau buku belajar.
   * Saat botol menyentuh sensor RC522 di meja kerja, ESP32 membaca UID kartu dan memetakan ke `habit_id` tertentu.
   * ESP32 mengirim HTTP POST ke `/api/habits/{id}/complete`.
   * Dashboard web pengguna langsung tercentang secara otomatis tanpa interaksi tetikus/papan ketik.
2. **Umpan Balik Visual Meja (*Physical Ambient Display*):**
   * Layar TFT mini menampilkan gambar pohon sesuai tahap di database (*Seed/Sprout/Tree*).
   * LED Neopixel memancarkan warna hijau jika seluruh kebiasaan hari itu tuntas, atau berkedip oranye jika ada kebiasaan yang hampir putus *streak*-nya.

---

## 10. PANDUAN PENULISAN PROPOSAL & BAB SKRIPSI

### 10.1 Pilihan Judul Skripsi yang Layak Diajukan (Sesuai Pedoman ITB STIKOM Bali Maks. 14 Kata)

Berdasarkan pedoman akademik ITB STIKOM Bali yang membatasi panjang judul Tugas Akhir **maksimal 14 kata**, berikut adalah 5 pilihan judul resmi yang telah diverifikasi jumlah katanya dan sangat direkomendasikan untuk diajukan dalam proposal:

* **Opsi 1 (10 Kata — Sangat Direkomendasikan / Paling Kuat & Padat):**  
  > *"Sistem Pendukung Keputusan Habit Tracker Menggunakan Metode Simple Additive Weighting"*
* **Opsi 2 (11 Kata — Menonjolkan Nama Aplikasi HabitGrow):**  
  > *"Penerapan Metode Simple Additive Weighting pada Sistem Pendukung Keputusan Aplikasi HabitGrow"*
* **Opsi 3 (13 Kata — Menegaskan Platform Web):**  
  > *"Sistem Pendukung Keputusan Habit Tracker Berbasis Web Menggunakan Metode Simple Additive Weighting"*
* **Opsi 4 (12 Kata — Menonjolkan Nilai Tambah Gamifikasi):**  
  > *"Sistem Pendukung Keputusan Habit Tracker Berbasis Gamifikasi dengan Metode Simple Additive Weighting"*
* **Opsi 5 (13 Kata — Kombinasi Lengkap Penerapan Metode & Web):**  
  > *"Penerapan Metode Simple Additive Weighting pada Sistem Pendukung Keputusan Habit Tracker Berbasis Web"*

---

### 10.2 Kerangka Bab Skripsi (Pedoman Penyusunan Bab 1 s/d Bab 5)

#### BAB 1: PENDAHULUAN
* **Latar Belakang:** Fenomena rendahnya konsistensi pembentukan kebiasaan baru (*habit dropout*); kelemahan sistem streak konvensional yang menghukum pengguna secara berlebihan (*streak fatigue* & *what-the-hell effect*); pentingnya integrasi Sistem Pendukung Keputusan untuk mencegah kegagalan secara proaktif sebelum hari berakhir serta gamifikasi empatik pertumbuhan pohon virtual.
* **Rumusan Masalah:**
  1. Bagaimana merancang arsitektur perangkat lunak pelacak kebiasaan yang memitigasi efek keputusasaan (*streak fatigue*) menggunakan prinsip *Non-Zero Day*?
  2. Bagaimana merumuskan model metamorfosis pohon virtual berbasis konsistensi bergulir 30 hari?
  3. Bagaimana mengimplementasikan Sistem Pendukung Keputusan (SPK) menggunakan metode Simple Additive Weighting (SAW) untuk memprediksi dan memitigasi risiko kegagalan kebiasaan (*habit churn*) secara adaptif?
  4. *(Jika IoT)* Bagaimana mengintegrasikan modul pemicu fisik NFC dan mikrokontroler ESP32 dengan RESTful API server cloud secara andal?
* **Batasan Masalah:**
  1. Sistem dikembangkan berbasis Web Responsif modern (Next.js 16, React 19, Supabase PostgreSQL) dan di-deploy secara publik di Vercel (`https://habitsgrow.vercel.app/`) dengan kapabilitas *Progressive Web App* (PWA) tanpa memerlukan proses publikasi komersial ke Google Play Store.
  2. Pengujian fungsionalitas dan retensi dibatasi pada pengguna aktif dengan frekuensi pemantauan harian.
  3. Modul Sistem Pendukung Keputusan (DSS) dijalankan secara komputasi ringan (*edge/serverless*) menggunakan metode Simple Additive Weighting (SAW) 5 kriteria terbobot.
* **Tujuan & Manfaat Penelitian:** Menghasilkan platform pelacak kebiasaan berbasis web yang mampu meningkatkan retensi kedisiplinan diri secara terukur, interaktif, dan adaptif.

#### BAB 2: TINJAUAN PUSTAKA & DASAR TEORI
* Teori Pembentukan Kebiasaan (*The Habit Loop: Cue, Routine, Reward* - Charles Duhigg & James Clear).
* Konsep Psikologis *Non-Zero Day* dan Teori Gamifikasi (*Self-Determination Theory*).
* Sistem Pendukung Keputusan (DSS / SPK) dan Metode *Multi-Criteria Decision Making* (MCDM).
* Metode *Simple Additive Weighting* (SAW): Konsep Kriteria Benefit, Normalisasi Matriks ($R$), dan Pembobotan Preferensi ($V$).
* Arsitektur RESTful API, Serverless Computing, dan PostgreSQL Row Level Security (RLS).
* *(Jika IoT)* Komunikasi Data IoT (HTTP REST Client pada ESP32, Protokol SPI/I2C, Modul RFID/NFC).

#### BAB 3: METODOLOGI PENELITIAN & PERANCANGAN SISTEM
* **Metode Pengembangan:** *Software Development Life Cycle* (SDLC) model Agile / Prototyping (Rujuk Flowchart 1 pada Sub-bab 3.10.1).
* **Pemodelan Aliran Data Terstruktur (DFD):**
  * Diagram Konteks Level 0 (3 Entitas Eksternal: User, Vercel Cron, Push Gateway FCM/APNs $\leftrightarrow$ Sistem HabitGrow — Sub-bab 3.8.1).
  * DFD Level 1 Dekomposisi Fungsional 6 Proses Utama (Autentikasi, Manajemen Habit, Checklist Harian, Gamifikasi/Pohon, SPK SAW, Layanan Web Push) dan 6 Data Store — Sub-bab 3.8.2.
* **Perancangan Basis Data Relasional:**
  * ERD Relasional 13 Tabel (Sub-bab 4.1).
  * Kamus Data & Spesifikasi 13 Tabel (Sub-bab 4.2).
  * Matriks Relasi & Kardinalitas Entitas (Sub-bab 4.3).
* **Standarisasi Bagan Alir (Flowchart) ANSI/ISO:** Tabel rujukan 8 simbol standar ANSI X3.5 / ISO 5807 (Sub-bab 3.9).
* **Pemodelan Bagan Alir Sistem & Algoritma Inti (Flowchart):**
  * Flowchart Metodologi SDLC Prototyping (Sub-bab 3.10.1).
  * Flowchart Algoritma SPK SAW Prediksi Risiko Kegagalan dengan Cold-Start Guard 14 Hari (Sub-bab 3.10.2).
  * Flowchart Mesin Pertumbuhan Pohon Virtual & Rolling Consistency 30 Hari (Sub-bab 3.10.3).
  * Flowchart Prosedur Checklist Taktil 0ms Optimistic UI & Sinkronisasi Server (Sub-bab 3.10.4).
  * Flowchart Serverless Cron Job Pukul 20:00 WIB & Background Web Push Notification (Sub-bab 3.10.5).
* **Formulasi Algoritma & Perhitungan Matematika Inti:** Tuliskan seluruh rumus matematika dari Bab 5 dokumen ini (*Streak*, *Consistency Rate*, *Tree Lifecycle*, *Leveling Curve*, serta Matriks Normalisasi & Penjumlahan Terbobot Metode SAW).
* **Perancangan Antarmuka & REST API:** Diagram Sequence (Bab 7 dokumen ini) dan Tabel Endpoint API (Bab 6 dokumen ini).

#### BAB 4: IMPLEMENTASI & PENGUJIAN SISTEM
* **Lingkungan Implementasi:** Spesifikasi perangkat keras, perangkat lunak, dan konfigurasi server.
* **Hasil Pengujian Algoritma (*Unit Testing* - Vitest):**
  * Tampilkan tabel hasil pengujian **48 test cases** Vitest pada 7 berkas pengujian dengan tingkat kelulusan 100%:
    * `streak.test.ts` (12 skenario pengujian streak global, per-habit streak, self-healing broken streak sync).
    * `prediction.test.ts` (10 skenario evaluasi Sistem Pendukung Keputusan metode Simple Additive Weighting [SAW], pembobotan 5 kriteria, cold-start guard 14 hari, aturan 2 menit biner, dan konversi cerdas kuantitatif jam ke menit serta liter ke ml).
    * `web-push.test.ts` (7 skenario pengujian background web push notification, VAPID token signature RFC 8292, payload handler, dan penanganan auto-cleanup status HTTP 410 Gone).
    * `tree.test.ts` (6 skenario transisi 5 tahap kehidupan pohon virtual dan kalkulasi persentase kesehatan organik).
    * `level.test.ts` (5 skenario formula kurva kenaikan level bertingkat).
    * `xp.test.ts` (4 skenario perhitungan perolehan XP berdasarkan tingkat kesulitan tugas EASY, MEDIUM, HARD).
    * `consistency.test.ts` (4 skenario batas jendela geser 30 hari dan proteksi hari pertama pengguna baru).
* **Hasil Pengujian Otomatis Antarmuka (*Automated E2E Testing* - TestSprite MCP):**
  * Pengujian otonom berbasis peramban virtual Playwright/Chromium terhadap 15 skenario antarmuka end-to-end dengan akun `gura3497@gmail.com`.
  * **Tingkat Kelulusan:** 80.00% (12 skenario Lulus, 2 Gagal pada edge case, 1 Terblokir karena ketiadaan data arsip awal).
  * Seluruh alur utama (*Core Happy Path*) lulus 100%: Autentikasi Login, Proteksi Sesi Cookie, Navigasi Dashboard, Checklist 0ms & Konfeti, Akumulasi Streak/XP, Visualisasi Pohon Virtual, Bilah Navigasi Bawah, Laci Navigasi Seluler (*Hamburger Drawer*), dan Sakelar Tema (*Dark/Light Mode*).
* **Arsitektur Optimasi Performa Sistem (Anti-Lag, Bypass Middleware & Konkurensi Paralel):**
  * **Pengecualian Rute API dari Middleware (`src/middleware.ts`):** Mengeliminasi intersepsi middleware pada seluruh rute `/api/*`. Hal ini menghapus *double network round-trip* ke Supabase Auth (`supabase.auth.getUser()`), memangkas latensi respon setiap API sebesar **200–400 ms**.
  * **Paralelisasi Kueri Backend Bebas Hambatan (`Promise.all`):** Rute `/api/dashboard/summary` mengeksekusi sinkronisasi streak harian secara paralel bersamaan dengan komponen dashboard lainnya, menghilangkan jeda sekuensial *blocking* sebesar **200–300 ms**.
  * **Optimasi Kueri Riwayat Kalender (`/api/calendar/activity`):** Mengganti pemindaian seluruh baris data checklist historis (*unbounded scan*) dengan kueri `.limit(1)` untuk menemukan tahun terlama dalam 1 baris data, menghemat memori server dan bandwidth jaringan.
  * **Tree-Shaking & Bundle Optimization (`next.config.ts`):** Mengaktifkan `experimental.optimizePackageImports` pada pustaka berat (`lucide-react`, `recharts`, `date-fns`, `canvas-confetti`, `@tanstack/react-query`) untuk memangkas ukuran berkas JavaScript dan mempercepat waktu *parse/hydration* di peramban.
  * **Higienitas Cache Multi-Akun (`queryClient.clear()`):** Pembersihan memori cache TanStack Query secara seketika saat Logout (`Navbar.tsx`) dan Login (`login/page.tsx`), mengeliminasi bug data akun sebelumnya yang "nyangkut" saat beralih akun.
  * **Navigasi Klien Instan (0ms):** Penerapan `prefetch={true}` pada seluruh tautan navigasi dan unifikasi query key dengan parameter tanggal lokal (`['dashboard-summary']`), sehingga perpindahan antara Dashboard, Pohon Virtual, Kebiasaan, dan Kalender berjalan instan tanpa jeda.
* **Redesain Antarmuka Kalender Per-Bulan & Per-Tanggal (`src/app/app/calendar/page.tsx`):**
  * Menggantikan matriks 52 minggu tahunan yang padat dengan tata letak kisi kalender bulanan 7 kolom (**Senin s/d Minggu**) dan penanggalan terstruktur 1..31.
  * Dilengkapi baris *quick month pills* (Jan s/d Des), *year stepper* `< 2026 >`, tombol instan "Kembali ke Hari Ini", kartu ringkasan metrik bulanan, lencana botani tingkat penyelesaian, dan panel inspektur rincian hari terpilih.
* **Penyempurnaan Form Kebiasaan & Manajemen (`src/app/app/habits/page.tsx`):**
  * Menghadirkan tombol chip preset cepat angka `[1] [2] [3] [4] [5]` pada Target Harian dan chip pilihan satuan `['kali', 'menit', 'halaman', 'jam', 'liter', 'ml', 'gelas', 'bab']` pada Satuan.
  * Menu Edit Kebiasaan (`Pencil` icon) yang terintegrasi dengan modal dan `PATCH /api/habits/[id]`.
  * Dialog konfirmasi hapus khusus (*Custom Danger Alert Modal*) dengan efek *backdrop blur* yang menggantikan dialog bawaan peramban `window.confirm()`.
* **Perbaikan Logika Gamifikasi Pohon & Sinkronisasi Zona Waktu (Tree Growth Engine Fix):**
  * **Penyelarasan Zona Waktu Lokal vs UTC (`evalDate`):** Menyelesaikan anomali pohon tiba-tiba jatuh ke 0% (Seed) saat checklist diselesaikan lewat tengah malam (WIB/WITA/WIT). Pemanggilan `ConsistencyService.recalculateUserConsistencyAndTree` dan `StreakService.recalculateHabitStreak` kini secara eksplisit menerima tanggal lokal penyelesaian (`todayStr`), sehingga data checklist pada tanggal lokal tidak lagi terabaikan sebagai "data di masa depan" akibat perbedaan waktu server UTC.
  * **Rekalkulasi Dinamis Tanpa Baris Basi (`user_trees`):** Rute `/api/dashboard/summary` kini mengeksekusi `ConsistencyService.recalculateUserConsistencyAndTree` secara langsung dan paralel dalam `Promise.all` dengan jangkar tanggal lokal pengguna (`evalDate`). Hal ini memulihkan mekanisme peluruhan (*tree withering*) bagi pengguna inaktif (seperti akun Willson `gura3497@gmail.com` yang pohonnya kini otomatis meluruh ke Benih 0% jika tugas-tugas historis terlewati tanpa pernah dikerjakan) serta memastikan pohon langsung pulih ke tahap yang sesuai (misal *Young Tree* 44%) ketika pengguna aktif menyelesaikan kebiasaannya.
  * **Rolling Window 30 Hari & Proteksi Hari Pertama (*Graceful First Day*):** Algoritma konsistensi menerapkan batas jendela 30 hari ke belakang (`thirtyDaysAgo`) agar pengguna dapat bangkit dari periode inaktif. Jika pengguna baru saja mendaftar atau membuat kebiasaan pada hari H tanpa ada riwayat hari lampau yang terlewat, benih diberikan status sehat awal (*Seed, 100% health*) alih-alih layu sebelum hari berakhir.
* **Pengujian Latensi Jaringan:** Uji waktu respons panggilan REST API (`GET /api/dashboard/summary` rata-rata 120-250 ms pasca-optimasi).
* *(Jika IoT)* Uji keberhasilan pembacaan kartu NFC dan latensi sinkronisasi dari hardware ke dashboard web.

#### BAB 5: KESIMPULAN & SARAN
* **Kesimpulan:** Keberhasilan penerapan prinsip *Non-Zero Day*, metafora pohon virtual, dan model prediksi risiko dalam menyediakan sistem pelacak kebiasaan yang adaptif dan terstruktur.
* **Saran Pengembangan:** Pembuatan casing fisik cetak 3D untuk IoT ambient display dan integrasi bot notifikasi multi-platform.

---

### 10.3 Matriks Pemetaan Diagram Pemodelan untuk Bab 3 & Bab 4 Skripsi

Gunakan tabel rujukan berikut saat menyusun bab perancangan dan implementasi dalam proposal maupun naskah skripsi:

| No | Nama Diagram / Model | Tipe Notasi Standar | Bab Skripsi Tujuan | Sub-bab Dokumen Ini | Berkas Sumber / Implementasi Terkait | Peran & Justifikasi Ilmiah dalam Skripsi |
|:---:|:---|:---|:---:|:---:|:---|:---|
| **1** | **Diagram Konteks (DFD Level 0)** | Gane & Sarson / Yourdon | **Bab 3** | Sub-bab 3.8.1 | `src/app/api/*`, `public/sw.js`, `vercel.json` | Mendefinisikan batasan sistem makro dan interaksi sistem dengan 3 entitas luar (User, Cron Job, Push Gateway FCM). |
| **2** | **DFD Level 1 (Dekomposisi)** | Gane & Sarson / Yourdon | **Bab 3** | Sub-bab 3.8.2 | Seluruh `src/lib/services/*` dan tabel database | Menjabarkan pembagian 6 modul fungsional sistem dan aliran akses data ke 6 data store relasional. |
| **3** | **Tabel Standarisasi Simbol Flowchart** | ANSI X3.5 / ISO 5807 | **Bab 3** | Sub-bab 3.9 | Sub-bab 3.9 | Menjelaskan kaidah baku 8 simbol bagan alir yang dipakai agar naskah skripsi sesuai dengan pedoman karya ilmiah. |
| **4** | **Flowchart SDLC Prototyping** | ANSI X3.5 | **Bab 3** | Sub-bab 3.10.1 | Git Repository & Release Cycle | Menggambarkan metodologi pengembangan perangkat lunak iteratif yang diterapkan dalam pengerjaan tugas akhir. |
| **5** | **Flowchart Algoritma SPK SAW** | ANSI X3.5 | **Bab 3** | Sub-bab 3.10.2 | `src/lib/algorithms/prediction.ts` | Memodelkan langkah komputasi 5 kriteria terbobot, normalisasi matriks $R$, skor $V_i$, cold-start guard, dan rekomendasi 2-menit. |
| **6** | **Flowchart Mesin Pohon Virtual** | ANSI X3.5 | **Bab 3** | Sub-bab 3.10.3 | `src/lib/algorithms/tree.ts`, `consistency.ts` | Menggambarkan kalkulasi konsistensi 30 hari bergulir dan transisi 5 tahap metamorfosis botani. |
| **7** | **Flowchart Checklist 0ms Optimistic UI**| ANSI X3.5 | **Bab 3** | Sub-bab 3.10.4 | `src/app/app/dashboard/page.tsx`, `/api/habits/[id]/complete` | Memodelkan responsifitas sentuhan instan klien dan mekanisme penanganan rollback jika server offline. |
| **8** | **Flowchart Serverless Web Push Cron** | ANSI X3.5 | **Bab 3** | Sub-bab 3.10.5 | `src/app/api/cron/reminders/route.ts`, `src/lib/services/web-push.service.ts` | Menggambarkan alur eksekusi otomatis pukul 20:00 WIB, deteksi kebiasaan terancam, dan pengiriman notifikasi lock-screen. |
| **9** | **ERD Relasional (13 Tabel)** | Crow's Foot Chen / UML DB | **Bab 3** | Sub-bab 4.1 | `supabase/migrations/001_initial_schema.sql` | Memodelkan struktur relasi basis data normalisasi ketiga (3NF) antar entitas. |
| **10**| **Kamus Data & Spesifikasi Tabel** | Relational Data Dictionary | **Bab 3** | Sub-bab 4.2 | `001_initial_schema.sql` | Menyajikan detail atribut, tipe data, dan konstrain pada 13 tabel basis data. |
| **11**| **Matriks Kardinalitas & Cascade Rules**| Entity Cardinality Matrix | **Bab 3** | Sub-bab 4.3 | `001_initial_schema.sql` | Merinci relasi 1:1, 1:N, M:N dan aturan `ON DELETE CASCADE / SET NULL` demi integritas data referensial. |
| **12**| **Sequence Diagram Checklist Taktil** | UML Sequence | **Bab 3** | Sub-bab 7.1 | `src/app/app/dashboard/page.tsx` $\leftrightarrow$ API | Menggambarkan urutan pesan kronologis antara Pengguna, Browser Klien, API Server, dan Database. |
| **13**| **Sequence Diagram Web Push Latar Belakang**| UML Sequence | **Bab 3** | Sub-bab 3.7 | `public/sw.js` $\leftrightarrow$ FCM $\leftrightarrow$ Server | Menggambarkan interaksi kriptografi VAPID antara Service Worker ponsel, Google FCM/APNs, dan Vercel Cron. |
| **14**| **State Machine Metamorfosis Pohon** | UML State Machine | **Bab 3** | Sub-bab 7.3 | `src/lib/algorithms/tree.ts` | Memodelkan status transisi keadaan pohon (*Seed* $\rightarrow$ *Sprout* $\rightarrow$ *Young* $\rightarrow$ *Healthy* $\rightarrow$ *Mature*). |
| **15**| **Tabel Pengujian Unit Vitest (48 Kasus)**| White-box Unit Test Table | **Bab 4** | Sub-bab 10.2 | `src/lib/algorithms/__tests__/*`, `src/lib/services/__tests__/*` | Membuktikan kebenaran matematis dan fungsional seluruh modul algoritma dengan kelulusan 100%. |
| **16**| **Tabel Pengujian E2E TestSprite (15 Kasus)**| Black-box E2E Test Table | **Bab 4** | Sub-bab 10.2 | TestSprite MCP Autonomous Browser Reports | Memvalidasi kehandalan antarmuka pengguna pada peramban Chromium secara otonom. |

---

### 11. INSTRUKSI PENGGUNAAN BERKAS INI DENGAN AI KEDEPANNYA
Jika Anda ingin berdiskusi dengan AI lain di masa mendatang mengenai proyek ini, Anda cukup menyalin atau mengunggah berkas `PROJECT_DOCUMENTATION.md` ini dan memberikan prompt pembuka:
> *"Saya memiliki proyek bernama HabitGrow. Terlampir adalah dokumen arsitektur dan panduan teknis lengkapnya (PROJECT_DOCUMENTATION.md). Pelajari seluruh struktur data, algoritma matematika, endpoint API, dan alur kodenya sebelum kita melanjutkan pengembangan."*
