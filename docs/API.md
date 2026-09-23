# HabitGrow — REST API Documentation

Semua endpoint API menggunakan format standar JSON:

### Format Respons Sukses (200 / 201)
```json
{
  "success": true,
  "data": { ... }
}
```

### Format Respons Error (400 / 401 / 404 / 409 / 422 / 500)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Deskripsi pesan error",
    "details": {}
  }
}
```

---

## 1. Autentikasi (`/api/auth`)

### `POST /api/auth/register`
Mendaftarkan akun baru.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "display_name": "Vincent Pratama"
  }
  ```
- **Response**: `{ "success": true, "data": { "user": { ... } } }`

### `POST /api/auth/login`
Masuk dengan kredensial email & password.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### `POST /api/auth/logout`
Menghapus sesi pengguna.

### `GET /api/auth/me`
Mengambil profil pengguna yang sedang login.

---

## 2. Kebiasaan (`/api/habits`)

### `GET /api/habits`
Mengambil daftar kebiasaan milik pengguna.
- **Query Parameters**:
  - `archived`: `true` | `false`
  - `categoryId`: `UUID`

### `POST /api/habits`
Membuat kebiasaan baru.
- **Request Body**:
  ```json
  {
    "name": "Belajar Coding",
    "description": "Latihan algoritma & Next.js",
    "category_id": "uuid-category",
    "icon": "sparkles",
    "color": "#10b981",
    "difficulty": "MEDIUM",
    "frequency_type": "DAILY",
    "target_value": 60,
    "target_unit": "menit",
    "start_date": "2026-09-13",
    "selected_days": [1, 2, 3, 4, 5]
  }
  ```

### `GET /api/habits/:id`
Mendapatkan detail satu kebiasaan.

### `PATCH /api/habits/:id`
Memperbarui data kebiasaan.

### `DELETE /api/habits/:id`
Menghapus kebiasaan.

### `POST /api/habits/:id/complete`
Menandai kebiasaan selesai pada tanggal tertentu (**Idempotent**).
- **Request Body**:
  ```json
  {
    "date": "2026-09-13",
    "value": 1,
    "note": "Selesai modul 3"
  }
  ```
- **Proses Otomatis**:
  1. Hitung XP server-side (+10 Easy, +15 Medium, +20 Hard).
  2. Catat audit trail di `xp_transactions`.
  3. Perbarui `user_levels` & `user_streaks` (streak berjadwal).
  4. Hitung ulang Consistency Score & tahap pertumbuhan `user_trees`.
  5. Evaluasi pembukaan `achievements`.

### `POST /api/habits/:id/archive`
Mengarsipkan kebiasaan tanpa menghapus data riwayat.

### `POST /api/habits/:id/restore`
Mengaktifkan kembali kebiasaan yang diarsipkan.

---

## 3. Dashboard & Gamifikasi

### `GET /api/dashboard/summary`
Mengambil agregasi lengkap dashboard dalam 1 pemanggilan (profil, kebiasaan hari ini, streak, level, XP bar, status pohon, pencapaian terkini).

### `GET /api/achievements`
Mendapatkan seluruh pencapaian sistem dan status unlocked pengguna.

### `GET /api/analytics/weekly`
Data statistik mingguan (Senin–Minggu) penyelesaian vs target.

### `GET /api/analytics/performance`
Rincian performa per kebiasaan, Best Habit, dan Needs Attention Habit.
