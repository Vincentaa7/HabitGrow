# 🎓 BUKU SAKU & PANDUAN SIDANG SKRIPSI: ALUR SISTEM HABITGROW
**(Penjelasan Bahasa Sederhana, Perumpamaan Mudah Diingat, & Kunci Jawaban Dosen Penguji)**

Dokumen ini dirancang khusus untuk membantu Anda memahami, mengingat, dan menjelaskan keseluruhan sistem **HabitGrow** di depan Dosen Pembimbing dan Dosen Penguji. Bahasa yang digunakan dibuat mengalir seperti bercerita dengan perumpamaan sehari-hari, namun tetap langsung terhubung ke nama file kodingan dan istilah ilmiahnya.

---

## 🌱 BAGIAN 1: CERITA BESAR HABITGROW (PAHAM DALAM 2 MENIT)

Bayangkan **HabitGrow** itu seperti **"Taman Pintar yang Punya Asisten Pribadi"**:

1. **Kebiasaan (`habits`) = Jadwal Merawat Tanaman**
   Pengguna menanam target harian, misalnya: *"Baca jurnal 3 kali sehari"* atau *"Belajar bahasa di Duolingo"*.
2. **Streak Global 🔥 (`user_streaks`) = Obor Api Penjaga Taman (Prinsip *Non-Zero Day*)**
   Di gerbang taman ada satu obor api besar. Aturannya cuma satu: **Jangan sampai harimu bernilai NOL**. Meskipun hari ini Anda punya 5 tugas dan sedang capek berat, cukup selesaikan **1 tugas saja**, maka obor api tetap menyala dan bertambah $+1$ hari!
3. **Pohon Virtual 🌳 (`user_trees`) = Cermin Kerajinan 30 Hari Terakhir**
   Kalau obor api menjaga agar Anda *hadir setiap hari*, Pohon Virtual menilai *seberapa tuntas* tugas-tugas Anda dalam **30 hari terakhir**. Makin rajin Anda menyelesaikan semua jadwal, pohon tumbuh dari **Benih (Seed)** $\rightarrow$ **Tunas (Sprout)** $\rightarrow$ **Pohon Muda** $\rightarrow$ **Pohon Sehat** $\rightarrow$ **Pohon Dewasa (Mature Tree)**. Kalau malas, pohonnya perlahan layu.
4. **SPK Metode SAW 🧠 (`prediction.ts`) = "Dokter / Asisten Pintar Pendeteksi Lelah"**
   Banyak aplikasi habit tracker lain yang "kejam": kalau user capek dan lupa centang, besoknya streak langsung hangus jadi 0, lalu user kesal dan berhenti pakai aplikasi (*Streak Fatigue*).
   Di HabitGrow, ada **Asisten Pintar berbasis SPK Metode SAW**. Dia mengamati kebiasaan Anda. Kalau dia melihat tanda-tanda Anda mulai keteteran (risiko gagal $\ge 50\%$), dia langsung memunculkan kartu bantuan di layar:
   * *"Lagi sibuk berat ya hari ini? Target baca 3 artikel kita diskon jadi 1 artikel aja yuk hari ini!"* (**Lower Target**), atau
   * *"Lagi capek ya? Cukup buka bukunya 2 menit aja hari ini biar obor streak-mu aman!"* (**Aturan 2 Menit**).

---

## 🔄 BAGIAN 2: ALUR SISTEM DARI A SAMPAI Z (PERUMPAMAAN + KODINGAN)

### Alur 1: Saat Pengguna Membuka Aplikasi & Pindah Halaman
* **Perumpamaan:**
  Bayangkan Anda masuk ke gedung eksklusif.
  1. Di pintu depan ada **Satpam Pemeriksa Kartu Akses** (`src/middleware.ts`). Kalau belum punya tiket login, Anda diarahkan ke loket masuk (`/login`).
  2. Begitu masuk ke lobi utama (`src/app/app/dashboard/page.tsx`), **Resepsionis Utama** (`/api/dashboard/summary`) langsung mengambil 4 map data sekaligus dengan dua tangan secara bersamaan (`Promise.all`), bukan jalan bolak-balik satu per satu!
  3. Sambil Anda melihat ruang utama (Dashboard), asisten di bilah atas (`src/components/layout/Navbar.tsx`) **diam-diam sudah menyiapkan isi ruangan sebelah** (halaman Habits, Tree, Achievements, Statistics, Calendar) di memori browser (`prefetchQuery`). Jadi waktu Anda klik menu pindah ruangan, pintunya langsung terbuka **0 detik** tanpa nunggu loading!
* **File Kodingan yang Bekerja:**
  * `src/middleware.ts` $\rightarrow$ Mengecek sesi login Supabase & meloloskan *prefetch* halaman secara instan.
  * `src/app/api/dashboard/summary/route.ts` $\rightarrow$ Mengambil daftar habit hari ini, status pohon, XP/level, streak, dan prediksi SPK SAW secara paralel.
  * `src/components/layout/Navbar.tsx` $\rightarrow$ Menampilkan obor streak 🔥, melakukan *prefetch* halaman lain di latar belakang, dan memantau jika jam sudah lewat pukul `00:00` tengah malam (*Midnight Rollover Detector*).

---

### Alur 2: Saat Pengguna Mencentang Habit (Kenapa Bisa Instan ~0ms?)
* **Perumpamaan:**
  Dulu, waktu pengguna klik centang, sistem bekerja seperti **pelayan restoran zaman dulu yang jalannya satu-satu**:
  > Ambil menu ke dapur $\rightarrow$ balik lagi $\rightarrow$ tanya stok ke gudang $\rightarrow$ balik lagi $\rightarrow$ hitung poin di kasir $\rightarrow$ balik lagi $\rightarrow$ tulis ke buku streak $\rightarrow$ balik lagi $\rightarrow$ siram pohon $\rightarrow$ balik lagi $\rightarrow$ cek piala achievement. Totalnya **16 kali bolak-balik**! Apalagi kalau dapurnya di Amerika (`iad1`) dan pelanggannya di Indonesia, wajar kalau nunggu 3–4 detik.

  Sekarang, setelah **Optimisasi Masif**, sistem bekerja dengan **2 Jurus Kilat**:
  1. **Jurus 1 — Stempel Lunas di Detik ke-0 (*0ms Optimistic UI*):**
     Begitu jari Anda menyentuh tombol centang di layar (`HabitCard.tsx` & `dashboard/page.tsx`), browser **tidak menunggu server**. Browser langsung menyalakan warna hijau, meledakkan konfeti 🎉, menambah XP, dan kalau itu centang pertama hari ini, angka obor api 🔥 di atas langsung naik $+1$ saat itu juga (**0 milidetik**)!
  2. **Jurus 2 — Keroyokan Paralel di Server (*2-Batch Parallel Pipeline*):**
     Di belakang layar, `CompletionService.completeHabit` di server Singapura (`sin1`) bekerja sangat ringkas:
     * **Tahap Baca Sekaligus (Batch 1):** Ambil data `habits`, riwayat `habit_completions`, dan `user_levels` sekaligus dalam 1 langkah (`Promise.all`).
     * **Tahap Hitung di Otak RAM (0ms):** Hitung naik level, streak baru, dan kesehatan pohon langsung di memori RAM server tanpa tanya database lagi.
     * **Tahap Tulis Sekaligus (Batch 2):** Simpan hasil XP, Level, Streak, Pohon, Achievement, dan Audit Log ke 6 tabel secara serentak (`Promise.all`).
* **File Kodingan yang Bekerja:**
  * `src/app/app/dashboard/page.tsx` (`completeMutation.onMutate` & `onSuccess`)
  * `src/lib/services/completion.service.ts` (`completeHabit`)

---

### Alur 3: Cara Kerja *Global Daily Streak* (Prinsip *Non-Zero Day*)
* **Perumpamaan:**
  Bayangkan Anda punya kalender dinding di kamar. Setiap hari Anda menyelesaikan **minimal 1 kebiasaan saja**, Anda menempelkan **1 stiker api 🔥** di tanggal hari itu.
  * Kalau hari ini sudah ada stiker, atau kemarin ada stiker (dan hari ini belum lewat jam 12 malam), maka rentetan stiker Anda masih hidup!
  * Tapi kalau **kemarin kosong** DAN **hari ini juga kosong**, maka rantai terputus (kembali ke `0`).
* **Kenapa Streak Individual Dihapus dan Hanya Pakai Streak Global?**
  *(Ini poin emas penelitian Anda!)*
  Jika ada 2 streak (Streak Global di atas + Streak Individual di tiap kartu), maka ketika pengguna sedang sakit atau kelelahan kerja lalu menerapkan prinsip *Non-Zero Day* (hanya mengerjakan 1 habit ringan agar harinya tidak nol), **4 habit lainnya tetap akan kehilangan streak individualnya**. Melihat 4 streak hancur jadi 0 akan tetap membuat pengguna stres dan menyerah (*Streak Fatigue / What-the-Hell Effect*). Dengan hanya menggunakan **1 Global Daily Streak**, prinsip *Non-Zero Day* benar-benar melindungi mental pengguna secara utuh!
* **File Kodingan yang Bekerja:**
  * `src/lib/algorithms/streak.ts` $\rightarrow$ Fungsi `calculateGlobalDailyStreak()`
  * `src/lib/services/streak.service.ts` $\rightarrow$ Fungsi `calculateUserGlobalStreak()` & `syncGlobalStreakToDb()`

---

### Alur 4: Cara Kerja Otak SPK Metode SAW (5 Kriteria $C_1$ s/d $C_5$)
* **Perumpamaan:**
  Bayangkan SPK SAW itu seperti **Guru BK / Dokter Kesehatan Kebiasaan** yang memeriksa apakah sebuah kebiasaan hari ini **"Rawan Bolos"** atau **"Aman"**.
  Setiap kebiasaan yang belum dicentang hari ini dinilai menggunakan **5 Kriteria Risiko ($C_1$ sampai $C_5$)**. Semua kriteria bersifat **Benefit terhadap Risiko** (artinya: makin tinggi angkanya mendekati `1.0`, makin bahaya/rawan bolos kebiasaan itu hari ini).

#### Kapan Guru BK (SPK SAW) Mulai Bekerja? (Aturan 14 Hari / *Cold-Start Guard*)
* Kalau ada murid baru masuk sekolah baru **2 hari**, lalu hari ke-2 dia izin sakit, apakah adil kalau Guru BK langsung mencap murid itu *"Anak Pemalas Rawan DO (Skor Risiko 50%)"*? **Tentu tidak adil!** Datanya masih terlalu sedikit (*Small Sample Noise*).
* Karena itu, sistem menunggu sampai kebiasaan berusia **minimal 14 hari (2 minggu penuh)**. Kenapa 14 hari? Supaya setiap hari (Senin sampai Minggu) sudah terlewati **minimal 2 siklus penuh**. Pada hari ke-14 dan seterusnya, barulah kelima kriteria $C_1$ s/d $C_5$ dihitung!

#### Apa Saja 5 Kriteria yang Dinilai? (Total Bobot = 100% atau 1.00)
1. **$C_1$ — Seberapa Sering Bolong 14 Hari Terakhir (Bobot 30% / `0.30`)**
   * *Cara hitung:* Jumlah bolong dibagi jumlah jadwal dalam 14 hari terakhir.
   * *Contoh:* Dijadwalkan 14 kali, bolong 7 kali $\rightarrow C_1 = 7 / 14 = 0.50$.
2. **$C_2$ — "Alergi" di Hari Tertentu / *Day-of-Week Vulnerability* (Bobot 25% / `0.25`)**
   * *Perumpamaan:* Ada orang yang rajin tiap Senin–Jumat, tapi tiap **hari Sabtu** selalu gagal karena keasyikan nongkrong.
   * *Cara hitung:* Jika hari ini hari Sabtu, sistem mengecek 2 hari Sabtu terakhir dalam 14 hari ke belakang. Kalau dari 2 Sabtu itu dia bolong 1 kali $\rightarrow C_2 = 1 / 2 = 0.50$.
3. **$C_3$ — Beratnya Beban Ransel Hari Ini / *Cognitive Workload* (Bobot 15% / `0.15`)**
   * *Perumpamaan:* Kalau hari ini Anda cuma punya 1 tugas mudah, pikiran Anda ringan. Tapi kalau hari ini ada 6 tugas berat sekaligus, otak Anda pasti lelah.
   * *Cara hitung:* Tiap habit yang jatuh tempo hari ini dihitung poin bebannya: `EASY = 1 poin`, `MEDIUM = 2 poin`, `HARD = 3 poin`. Lalu dijumlahkan dan **dibagi 16 poin**.
   * *Kenapa dibagi 16 poin?* Karena 16 poin itu setara dengan beban penuh seharian (misalnya **8 kebiasaan tingkat Menengah** [$8 \times 2 = 16$] atau **5 kebiasaan Berat + 1 Mudah** [$5 \times 3 + 1 = 16$]). Secara psikologis, di atas 16 poin manusia sudah mengalami kejenuhan kognitif penuh (*burnout* = `1.0`).
4. **$C_4$ — Kerentanan Umur Kebiasaan / *Habit Maturity* (Bobot 15% / `0.15`)**
   * *Perumpamaan:* Tanaman yang baru berumur 2 minggu masih rapuh dan gampang mati dibandingkan pohon yang sudah berumur 3 bulan.
   * *Skor:* Umur 14–20 hari = `0.85` (sangat rawan), 21–29 hari = `0.65`, 30–59 hari = `0.35`, $\ge 60$ hari = `0.12` (sudah jadi kebiasaan otomatis).
5. **$C_5$ — Kebiasaan Menunda Sampai Larut Malam / *Late Hour Procrastination* (Bobot 15% / `0.15`)**
   * *Perumpamaan:* Orang yang biasanya baru mencentang tugas jam **11 malam** sangat rawan ketiduran dan lupa dibandingkan orang yang rajin mencentang jam **8 pagi**.
   * *Cara hitung:* Sistem mengecek jam rata-rata pengguna menyelesaikan habit tersebut sesuai zona waktu lokalnya (WIB/WITA/WIT).
   * *Skor:* Rata-rata jam $\ge 22.00$ malam = `0.85`, jam $20.00–21.59$ = `0.65`, jam $16.00–19.59$ = `0.40`, sebelum jam $16.00$ sore = `0.15`.

#### Bagaimana Rumus Akhir SAW dan Kapan Bantuan Muncul?
Semua nilai $C_1$ s/d $C_5$ dikalikan bobotnya lalu dijumlahkan:
$$V_i = (0.30 \times C_1) + (0.25 \times C_2) + (0.15 \times C_3) + (0.15 \times C_4) + (0.15 \times C_5)$$
* Jika skor $V_i < 0.50$ ($< 50\%$): **AMAN**, tidak muncul pop-up agar tidak berisik.
* Jika skor $V_i \ge 0.50$ ($\ge 50\%$): **RAWAN GAGAL!** Muncul `PredictionAlertBanner` di bagian atas layar dengan solusi cerdas:
  * **Kalau targetnya angka $> 1$ (misal: *"Baca 3 artikel"* atau *"Minum 2 liter"*):** Sistem menyarankan **Potong Target Jadi Setengah** (`LOWER_TARGET`, misal dari 3 kali dipangkas jadi 1 kali).
  * **Kalau targetnya cuma 1 kali biner (misal: *"Duolingo 1 kali"*):** Karena angka 1 tidak bisa dibagi dua jadi 0,5 kali, sistem menyarankan **Aturan 2 Menit** (`CHECKLIST_2MIN` — kerjakan versi paling ringannya selama 2 menit saja lalu klik selesai).
* **File Kodingan yang Bekerja:**
  * `src/lib/algorithms/prediction.ts` $\rightarrow$ Fungsi `predictHabitFailureRisk()` & `isHabitEligibleForPrediction()`
  * `src/lib/services/prediction.service.ts` $\rightarrow$ Fungsi `getAtRiskHabitsToday()`
  * `src/components/habits/PredictionAlertBanner.tsx` $\rightarrow$ Tampilan kartu pop-up rekomendasi SPK SAW.

---

### Alur 5: Cara Kerja Pohon Virtual & Konsistensi 30 Hari
* **Perumpamaan:**
  Pohon Virtual adalah **"Rapor Bulanan"** Anda. Sistem melihat ke belakang selama **30 hari terakhir** (`Rolling 30-Day Window`).
  * Misalkan dalam 30 hari terakhir total jadwal yang harusnya Anda kerjakan adalah **50 tugas**, dan Anda berhasil menyelesaikan **40 tugas**.
  * Maka **Skor Konsistensi** Anda = $(40 / 50) \times 100\% = \mathbf{80\%}$.
  * Skor $80\%$ ini langsung menentukan wujud pohon Anda:
    * $0\% - 19\%$ = **Seed (Benih)** 🌰
    * $20\% - 39\%$ = **Sprout (Tunas)** 🌱
    * $40\% - 59\%$ = **Young Tree (Pohon Muda)** 🌿
    * $60\% - 79\%$ = **Healthy Tree (Pohon Sehat)** 🌳
    * $80\% - 100\%$ = **Mature Tree (Pohon Rindang Dewasa)** 🌲✨
* **Kenapa Hanya Menghitung 30 Hari Terakhir, Bukan Sejak Awal Buat Akun?**
  Supaya kalau pengguna sempat sibuk ujian dan bolong sebulan penuh di masa lalu, dia tidak dihukum selamanya! Dengan jendela bergulir 30 hari, begitu dia rajin lagi bulan ini, pohonnya bisa sehat dan tumbuh besar kembali.
* **File Kodingan yang Bekerja:**
  * `src/lib/algorithms/consistency.ts` $\rightarrow$ `calculateOverallConsistency()`
  * `src/lib/algorithms/tree.ts` $\rightarrow$ `calculateTreeStage()`
  * `src/lib/services/consistency.service.ts` $\rightarrow$ `computeConsistencyFromData()`

---

### Alur 6: Cara Mengingat 13 Tabel Database (3NF) TanpaPusing
Jangan menghafal 13 tabel secara acak! Kelompokkan menjadi **4 Keluarga Besar** (1 + 4 + 6 + 2 = **13 Tabel**):

1. **Keluarga 1: Identitas Pengguna (1 Tabel)**
   * `profiles` $\rightarrow$ Biodata pengguna (nama, avatar, role, timezone).
2. **Keluarga 2: Inti Kebiasaan / Habit (4 Tabel)**
   * `habit_categories` $\rightarrow$ Master kategori (Health, Learning, Fitness, dll).
   * `habits` $\rightarrow$ Daftar kebiasaan yang dibuat user.
   * `habit_schedules` $\rightarrow$ Hari-hari jadwalnya (Senin=1, Selasa=2, dst).
   * `habit_completions` $\rightarrow$ Bukti centang penyelesaian harian.
3. **Keluarga 3: Gamifikasi, Streak & Pohon (6 Tabel)**
   * `user_streaks` $\rightarrow$ Penyimpan obor *Non-Zero Day Global Streak* (1 user = 1 baris).
   * `user_trees` $\rightarrow$ Penyimpan tahap & kesehatan Pohon Virtual (1 user = 1 baris).
   * `user_levels` $\rightarrow$ Penyimpan Level & Total XP pengguna saat ini.
   * `xp_transactions` $\rightarrow$ Buku tabungan riwayat keluar-masuknya XP (*ledger*).
   * `achievements` $\rightarrow$ Katalog master piala/lencana.
   * `user_achievements` $\rightarrow$ Daftar piala yang sudah berhasil dibuka oleh user.
4. **Keluarga 4: Pengingat & Rekam Jejak Keamanan (2 Tabel)**
   * `notifications` $\rightarrow$ Token Web Push & riwayat notifikasi pengingat.
   * `activity_logs` $\rightarrow$ Buku catatan CCTV (*audit trail*) semua aktivitas penting user.

> **Kenapa Database Ini Sudah 3NF (Third Normal Form)?**
> 1. **1NF:** Tidak ada kolom yang isinya digabung-gabung pakai koma (contoh: jadwal hari tidak disimpan sebagai `"Senin,Rabu,Jumat"` di tabel `habits`, tapi dipisah rapi ke tabel `habit_schedules`).
> 2. **2NF:** Semua kolom bergantung penuh pada Primary Key masing-masing tabel (misal daftar piala yang diraih user dipisah ke tabel penghubung `user_achievements`).
> 3. **3NF:** Tidak ada ketergantungan transitif (misal nama dan ikon kategori disimpan di `habit_categories`, sedangkan tabel `habits` hanya menyimpan `category_id`-nya saja. Kalau nama kategori diubah, tidak perlu mengedit ribuan baris habit).

---

## 🎯 BAGIAN 3: PREDIKSI PERTANYAAN DOSEN PENGUJI & JAWABAN PAMUNGKAS

Berikut adalah daftar pertanyaan yang paling sering ditanyakan oleh Dosen Penguji pada sidang skripsi bertema **SPK SAW & Gamifikasi**, lengkap dengan cara menjawab yang tenang, ilmiah, dan meyakinkan:

---

### ❓ Pertanyaan 1: *"Kenapa kamu memilih metode SAW (Simple Additive Weighting)? Kenapa tidak pakai metode lain seperti AHP, TOPSIS, atau Machine Learning?"*
* **Jawaban Anda:**
  > *"Baik Pak/Bu, alasan saya memilih metode **SAW** ada tiga:*
  > *1. **Sifat Evaluasi Independen per Kebiasaan:** Dalam HabitGrow, kita tidak sedang memilih 1 kebiasaan terbaik untuk membuang kebiasaan lainnya, melainkan menghitung **Indeks Risiko Kegagalan absolut ($0\%–100\%$)** pada masing-masing kebiasaan. Metode seperti TOPSIS membutuhkan pembandingan jarak terhadap solusi ideal positif dan negatif antar-alternatif, sehingga kurang tepat jika pengguna hanya memiliki 1 atau 2 kebiasaan aktif.*
  > *2. **Komputasi Sangat Ringan (Real-Time Serverless):** SAW memiliki kompleksitas waktu linier $O(n \times m)$ yang sangat cepat dieksekusi di memori server dalam hitungan milidetik setiap kali pengguna membuka dashboard.*
  > *3. **Explainability (Mudah Dijelaskan ke Pengguna):** Dengan SAW, kontribusi terbobot ($W_j \times R_{ij}$) dari tiap kriteria bisa langsung diurutkan, sehingga sistem bisa memberi tahu alasan spesifik kepada pengguna—misalnya: 'Habit ini berisiko tinggi karena kamu sering menundanya lewat jam 10 malam ($C_5$)'. Jika menggunakan Black-Box Machine Learning, pengguna baru tidak punya ribuan data latih dan alasannya sulit dijelaskan secara transparan."*

---

### ❓ Pertanyaan 2: *"Dari mana kamu mendapatkan angka bobot $C_1=30\%$, $C_2=25\%$, $C_3=15\%$, $C_4=15\%$, $C_5=15\%$? Apakah ada di jurnal atau kamu tentukan sendiri?"*
* **Jawaban Anda:**
  > *"Pemilihan **kelima variabel kriterianya** didasarkan pada literatur psikologi perilaku—seperti riset pembentukan kebiasaan Dr. Phillippa Lally untuk usia kebiasaan ($C_4$), teori beban kognitif untuk kelelahan harian ($C_3$), dan buku Atomic Habits James Clear.*
  > *Sedangkan untuk **angka persentase bobotnya**, dalam metode MCDM SAW peneliti bertindak sebagai Decision Maker menggunakan teknik **Direct Rating berdasarkan 3 Tier Prioritas Perilaku**:*
  > *- **Tier 1 (Bukti Riwayat Nyata = 55%):** Dibagi menjadi $C_1$ (Miss Rate 14 hari = **30%**) dan $C_2$ (Kerentanan hari yang sama = **25%**), karena bukti historis nyata adalah prediktor paling kuat.*
  > *- **Tier 2 (Kondisi Kognitif & Usia Habit = 30%):** Dibagi rata untuk $C_3$ (Beban tugas hari ini = **15%**) dan $C_4$ (Usia habit = **15%**).*
  > *- **Tier 3 (Konteks Waktu = 15%):** Diberikan pada $C_5$ (Penundaan jam malam = **15%**).*
  > *Total keseluruhan bobot memenuhi syarat normalisasi SAW yaitu $\sum W_j = 1.00$ atau $100\%$."*

---

### ❓ Pertanyaan 3: *"Kenapa pada Kriteria $C_3$ (Beban Kognitif) total poin kesulitan dibagi 16? Kenapa harus angka 16?"*
* **Jawaban Anda:**
  > *"Angka 16 adalah **Ambang Batas Kejenuhan Harian (Daily Fatigue Ceiling)** yang kami tetapkan dari skala poin kesulitan HabitGrow, di mana habit Mudah = 1 poin, Sedang = 2 poin, dan Berat = 3 poin.*
  > *16 poin merepresentasikan kapasitas maksimal yang realistis bagi satu orang dalam sehari—yaitu setara dengan mengerjakan **8 kebiasaan tingkat Sedang** ($8 \times 2 = 16$) atau **5 kebiasaan tingkat Berat ditambah 1 kebiasaan Mudah** ($5 \times 3 + 1 = 16$). Jika beban harian seseorang sudah mencapai 16 poin ke atas, maka risiko kelelahan mentalnya bernilai penuh atau $1.0$ ($100\%$)."*

---

### ❓ Pertanyaan 4: *"Kenapa SPK SAW baru memberikan peringatan setelah habit berumur 14 hari? Bagaimana kalau umur 4 hari sudah bolong?"*
* **Jawaban Anda:**
  > *"Itu yang kami sebut sebagai **14-Day Cold-Start Guard**, Pak/Bu. Alasannya untuk mencegah **False Alarm akibat sampel data yang terlalu kecil (Small Sample Noise)**.*
  > *Contohnya, jika pengguna membuat kebiasaan yang hanya dijadwalkan setiap **hari Rabu**, maka dalam 7 hari pertama hari Rabu baru muncul **1 kali**. Kalau kebetulan hari Rabu pertama itu pengguna ada urusan mendadak dan terlewat, rasio kegagalannya langsung terbaca $1/1 = 100\%$. Dengan menunggu **14 hari (2 minggu)**, setiap hari dari Senin sampai Minggu sudah melewati **minimal 2 siklus kalender penuh**, sehingga perhitungan kriteria $C_1$ dan $C_2$ menjadi akurat dan valid."*

---

### ❓ Pertanyaan 5: *"Apa perbedaan antara fitur Streak Global dengan Pohon Virtual? Kenapa harus ada dua-duanya?"*
* **Jawaban Anda:**
  > *"Keduanya saling melengkapi karena mengukur dua dimensi disiplin yang berbeda, Pak/Bu:*
  > *1. **Global Streak 🔥 (Berbasis Prinsip Non-Zero Day)** berfungsi menjaga **Kehadiran Harian (Daily Continuity)**. Asalkan pengguna menyelesaikan minimal 1 kebiasaan hari ini, streak-nya tetap menyala agar pengguna tidak mengalami keputusasaan (*streak fatigue*).*
  > *2. **Pohon Virtual 🌳 (Berbasis Rolling 30-Day Consistency)** berfungsi menjaga **Kualitas & Ketuntasan Total (Completion Volume)**. Kalau pengguna punya 5 kebiasaan sehari tapi setiap hari hanya mengerjakan 1 kebiasaan saja demi menyelamatkan obor streak, maka skor konsistensinya hanya $1/5 = 20\%$ (pohonnya hanya tumbuh sebatas Tunas Kecil, tidak bisa menjadi Pohon Dewasa). Jadi Streak menjaga agar pengguna **tidak berhenti**, sedangkan Pohon memotivasi pengguna agar **menyelesaikan seluruh targetnya**."*

---

### ❓ Pertanyaan 6: *"Tadi saat didemokan, waktu kamu klik centang dan pindah menu rasanya cepat sekali hampir tanpa loading. Bagaimana cara kamu mengoptimasinya?"*
* **Jawaban Anda:**
  > *"Kami menerapkan 5 teknik rekayasa performa pada arsitektur Next.js dan Supabase kami, Pak/Bu:*
  > *1. **0ms Optimistic UI Update:** Saat tombol centang ditekan, state tampilan di browser langsung diperbarui di milidetik ke-0 menggunakan TanStack React Query sebelum menunggu balasan server.*
  > *2. **Parallel Batching & In-Memory Compute:** Di sisi server (`CompletionService`), kami memangkas 16 kueri database beruntun menjadi **2 batch paralel (`Promise.all`)** dan menghitung rumus Streak, Pohon, serta XP langsung di memori RAM server.*
  > *3. **Background Tab Prefetching:** Saat pengguna membuka Dashboard, sistem secara otomatis mengunduh data halaman lain di latar belakang sehingga perpindahan menu terasa instan.*
  > *4. **Middleware Prefetch Fast-Path:** Membebaskan rute API dan request prefetch dari pemeriksaan ulang token ke server eksternal.*
  > *5. **Serverless Region Alignment (`sin1`):** Menempatkan fungsi serverless Vercel di Singapura (`sin1`) agar dekat dengan pengguna di Indonesia dan database Supabase."*

---

## 🗺️ BAGIAN 4: CHEAT SHEET LOKASI FILE KODINGAN (JIKA DOSEN MINTA BUKA KODE)

Jika saat sidang Dosen Penguji berkata: *"Coba buka VS Code kamu, tunjukkan di mana kodingan rumus SAW / Streak / Pohon / Database!"*, langsung buka file di tabel ini:

| Fitur / Rumus yang Ditanyakan Dosen | Nama File yang Harus Dibuka | Nama Fungsi di Dalamnya |
| :--- | :--- | :--- |
| **Rumus Matematika SPK SAW (5 Kriteria $C_1$–$C_5$, Bobot, & Rekomendasi 2 Menit / Potong Target)** | `src/lib/algorithms/prediction.ts` | `predictHabitFailureRisk()`, `isHabitEligibleForPrediction()`, & `getHourInTimezone()` |
| **Pengambilan Data Database untuk SPK SAW** | `src/lib/services/prediction.service.ts` | `getAtRiskHabitsToday()` |
| **Rumus *Non-Zero Day Global Daily Streak*** | `src/lib/algorithms/streak.ts` | `calculateGlobalDailyStreak()` |
| **Rumus Konsistensi 30 Hari Terakhir** | `src/lib/algorithms/consistency.ts` | `calculateOverallConsistency()` |
| **Rumus 5 Tahap Pertumbuhan Pohon Virtual** | `src/lib/algorithms/tree.ts` | `calculateTreeStage()` & `TREE_STAGES` |
| **Rumus Perolehan XP & Kenaikan Level** | `src/lib/algorithms/xp.ts` & `src/lib/algorithms/level.ts` | `calculateXP()` & `calculateLevel()` |
| **Proses Centang Habit Paralel Super Cepat** | `src/lib/services/completion.service.ts` | `completeHabit()` |
| **Tampilan Dashboard & Optimistic UI 0ms** | `src/app/app/dashboard/page.tsx` | `DashboardPage()` & `completeMutation` |
| **Pop-up Kartu Peringatan SPK SAW di Layar** | `src/components/habits/PredictionAlertBanner.tsx` | `PredictionAlertBanner()` |
| **13 Tabel Database SQL & Row Level Security** | `supabase/migrations/001_initial_schema.sql` | Seluruh definisi `CREATE TABLE` |

---
*Semoga sukses besar pada bimbingan dan sidang skripsi Anda! Anda sudah menguasai baik teori psikologinya, rumus matematikanya, maupun arsitektur kodingannya.*

