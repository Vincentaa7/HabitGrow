# HabitGrow 🌱
### Gamified Habit Tracker with Virtual Tree Progression

Aplikasi pelacak kebiasaan berbasis web responsif dengan gamifikasi evolusi pohon virtual (*Virtual Tree Growth Engine*). Dibangun dengan **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **TanStack Query**, dan **Supabase PostgreSQL**.

---

## 🌟 Fitur Utama

- **Virtual Tree Growth Engine**: Pohon bertumbuh melalui 5 fase (*Seed*, *Sprout*, *Young Tree*, *Healthy Tree*, *Mature Tree*) berdasarkan *Consistency Score* aktual (0–100%).
- **Schedule-Aware Streak**: Streak bertambah pada hari terjadwal dan **tidak** terputus oleh hari libur atau non-scheduled days.
- **Server-Authoritative Gamification**: Perolehan XP (+10 Easy, +15 Medium, +20 Hard) dan level dihitung sepenuhnya di server secara idempoten.
- **Data-Driven Achievements**: 9 pencapaian sistem dengan reward XP otomatis.
- **Analytics & Calendar**: Visualisasi mingguan Recharts, analisis habit terbaik, dan kalender riwayat aktivitas.
- **Thesis/Research Ready**: Ekspor data komprehensif berformat JSON sesuai kepatuhan etika penelitian.

---

## 🚀 Panduan Memulai Cepat

### 1. Prasyarat
- Node.js >= 18
- Akun Supabase (Gratis)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment
Salin template lingkungan:
```bash
cp .env.example .env.local
```
Isi nilai dari dashboard Supabase Anda (`Project Settings -> API`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Setup Database & Migrasi
Buka tab **SQL Editor** pada dashboard Supabase dan jalankan berkas berikut secara berurutan:
1. `supabase/migrations/001_initial_schema.sql` (13 tabel utama, constraint & index)
2. `supabase/migrations/002_row_level_security.sql` (Kebijakan RLS & trigger signup pengguna baru)
3. `supabase/seed.sql` (Kategori awal dan data pencapaian)

### 5. Menjalankan Mode Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

### 6. Menjalankan Unit Tests Algoritma
```bash
npm test
```

---

## 📁 Struktur Proyek

```text
src/
├── app/
│   ├── (auth)/             # Halaman Login & Register
│   ├── app/                # Halaman Aplikasi Terproteksi
│   │   ├── dashboard/      # Dashboard Utama & Progres Harian
│   │   ├── habits/         # Manajemen CRUD Kebiasaan
│   │   ├── tree/           # Detail Visual Pohon Virtual
│   │   ├── calendar/       # Kalender Riwayat
│   │   ├── statistics/     # Statistik & Grafik Recharts
│   │   ├── achievements/   # Galeri Pencapaian
│   │   └── profile/        # Profil, Tema & Ekspor Data
│   └── api/                # REST API Route Handlers
├── components/
│   ├── tree/               # Visualisasi SVG Dinamis 5 Tahap Pohon
│   ├── habits/             # Kartu Kebiasaan & Form Modal
│   ├── layout/             # Navbar Responsif & Navigasi Mobile
│   └── providers/          # ThemeProvider & QueryProvider
├── lib/
│   ├── algorithms/         # Single Source of Truth Algoritma Gamifikasi
│   ├── services/           # Domain Service Layer
│   ├── supabase/           # Klien Supabase (Browser, Server, Admin)
│   └── validators/         # Skema Validasi Zod
└── types/                  # Entitas TypeScript Database & Kontrak API
```

---

## 🧪 Pengujian Algoritma Inti
Semua formula matematis memiliki unit tests mandiri di `src/lib/algorithms/__tests__/`:
- `xp.test.ts`: Validasi pengali kesulitan
- `level.test.ts`: Validasi ambang batas level kumulatif
- `streak.test.ts`: Validasi streak berjadwal vs hari tidak terjadwal
- `consistency.test.ts`: Validasi formula tingkat konsistensi
- `tree.test.ts`: Validasi mapping ambang skor ke tahap pohon
