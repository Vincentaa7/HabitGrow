# PRD — HabitGrow

## Gamified Habit Tracker with Virtual Tree Progression & Machine Learning Early Warning

**Document Version:** 2.0 (Production & Automated Testing Ready)  
**Last Updated:** 26 September 2026  
**Status:** Feature Complete & Verified  
**Product Type:** Habit Tracker / Productivity / Gamification / Predictive Nudges  
**Primary Platform:** Responsive Web Application (Mobile Android/iOS & Desktop)  
**Packaging Platform:** Progressive Web App (PWA) / Android APK (Capacitor/TWA)  
**Primary Database:** Supabase PostgreSQL with Row Level Security (RLS)  
**Backend:** Next.js Route Handlers / REST API  
**Authentication:** Supabase Auth (Session Cookies & JWT)  
**Storage:** Supabase Storage  
**Frontend:** Next.js 16 + React 19 + TypeScript  
**UI/UX:** Tailwind CSS + Vanilla CSS Tokens + Lucide React  
**Data Fetching:** TanStack React Query (Optimistic UI & Cache Invalidation)  
**Machine Learning:** Logistic Regression 5-Feature Churn Prediction Engine  
**Testing Framework:** Vitest (100% Core Algorithms) + TestSprite Autonomous E2E Testing  
**Deployment:** Vercel + Supabase  

---

# 1. Product Overview

HabitGrow adalah aplikasi Habit Tracker yang membantu pengguna membangun kebiasaan positif melalui kombinasi:

* Habit tracking
* Daily checklist
* Scheduling
* Streak
* XP
* Level
* Achievement
* Consistency Score
* Statistics
* Gamification
* Virtual Tree Growth

Konsep utama aplikasi adalah:

> **Semakin konsisten pengguna menjalankan kebiasaan, semakin berkembang pohon virtual miliknya.**

Pohon virtual bukan sekadar dekorasi. Kondisi pohon harus merupakan hasil dari sistem penilaian yang ditentukan oleh aktivitas pengguna.

Contoh:

```text
User creates habit
       ↓
User completes habit
       ↓
Completion recorded
       ↓
XP calculated
       ↓
Streak updated
       ↓
Consistency Score updated
       ↓
Tree Growth Engine recalculates
       ↓
Tree visually develops
```

Aplikasi mengambil inspirasi dari konsep gamification aplikasi seperti Duolingo, tetapi **tidak meniru UI, branding, aset, atau implementasi milik aplikasi lain**.

---

# 2. Problem Statement

Banyak pengguna mengetahui kebiasaan yang ingin dibangun, tetapi mengalami masalah:

1. Sulit mempertahankan konsistensi.
2. Tidak mengetahui perkembangan kebiasaan secara jelas.
3. Habit tracking tradisional hanya berupa checklist.
4. Statistik sering terasa monoton.
5. Kurangnya feedback visual dan motivasi.
6. Pengguna dapat kehilangan motivasi setelah beberapa hari.

HabitGrow bertujuan membuat proses membangun kebiasaan lebih menarik melalui feedback visual, progression, reward, dan gamification.

---

# 3. Product Vision

HabitGrow harus terasa seperti:

> "Saya sedang merawat sesuatu dengan kebiasaan saya sendiri."

Bukan hanya:

> "Saya sedang mencentang checklist."

Setiap aktivitas pengguna harus memiliki feedback.

Contoh:

```text
Complete Habit
       ↓
+10 XP
       ↓
Streak +1
       ↓
Consistency ↑
       ↓
Tree Health ↑
       ↓
Tree grows
```

Tujuan akhirnya adalah membuat perkembangan pengguna terlihat secara visual.

---

# 4. Product Goals

### Primary Goals

1. Memudahkan pengguna membuat dan mengelola kebiasaan.
2. Memudahkan pengguna melakukan tracking harian.
3. Menghitung konsistensi secara otomatis.
4. Memberikan feedback melalui XP dan streak.
5. Memberikan representasi visual melalui virtual tree.
6. Menyediakan statistik perkembangan.
7. Menyediakan mekanisme achievement.
8. Menjadi platform yang dapat dikembangkan menjadi aplikasi Android.
9. Memiliki arsitektur yang cukup kuat untuk digunakan sebagai project skripsi.

### Secondary Goals

1. Responsive pada desktop, tablet, dan mobile.
2. Maintainable.
3. Secure.
4. Scalable.
5. API-ready.
6. Dokumentasi teknis lengkap.

---

# 5. Non-Goals

Versi HabitGrow 2.0 mempertahankan fokus tajam pada pembentukan kebiasaan personal dan gamifikasi botani. Fitur-fitur berikut **secara eksplisit bukan tujuan produk**:

* Social media feed publik atau follower tracking.
* Chat antar-pengguna atau forum komunitas terbuka.
* Mode kompetisi multipemain (*competitive multiplayer league*).
* Pasar digital (*Marketplace*), mata uang kripto (Crypto), atau NFT.
* Sistem pembayaran/transaksi moneter (*Real-money rewards*).
* Integrasi perangkat wearable medis atau diagnosis kesehatan klinis.
* Chatbot percakapan generatif yang lambat (Sistem digantikan oleh *Machine Learning Predictive Early Warning* deterministik 5-fitur berlatensi $\le 10\text{ ms}$).

---

# 6. Target Users

## 6.1 Primary User

Mahasiswa dan individu yang ingin membangun kebiasaan.

Contoh:

* Belajar.
* Olahraga.
* Membaca.
* Coding.
* Membersihkan kamar.
* Minum air.
* Tidur teratur.
* Meditasi.
* Mengerjakan tugas.

## 6.2 Admin

Administrator yang mengelola:

* Categories.
* Achievements.
* System configuration.
* Aggregated analytics.
* User management.

Admin tidak boleh membaca data private pengguna kecuali data yang memang diperlukan untuk fungsi administratif dan sudah ditentukan oleh sistem.

---

# 7. Core Product Concept

HabitGrow memiliki empat sistem utama:

```text
HABIT ENGINE
      ↓
GAMIFICATION ENGINE
      ↓
CONSISTENCY ENGINE
      ↓
TREE GROWTH ENGINE
```

## Habit Engine

Mengatur:

* Habit.
* Schedule.
* Completion.
* History.

## Gamification Engine

Mengatur:

* XP.
* Level.
* Streak.
* Achievement.

## Consistency Engine

Menghitung:

* Completion rate.
* Habit consistency.
* Overall consistency.
* Trend.

## Tree Growth Engine

Mengubah kondisi pengguna menjadi perkembangan pohon.

---

# 8. Main User Journey

```text
Landing Page
    ↓
Register
    ↓
Onboarding
    ↓
Create First Habit
    ↓
Set Schedule
    ↓
Dashboard
    ↓
Complete Habit
    ↓
XP Reward
    ↓
Streak Update
    ↓
Consistency Calculation
    ↓
Tree Progression
    ↓
Achievement
    ↓
Statistics
```

---

# 9. Application Structure

Main pages:

```text
/
├── Landing Page
├── Login
├── Register
├── Forgot Password
│
└── /app
    ├── Dashboard
    ├── Habits
    ├── Calendar
    ├── Tree
    ├── Statistics
    ├── Achievements
    ├── History
    ├── Profile
    └── Settings
       
└── /admin
    ├── Dashboard
    ├── Users
    ├── Habits
    ├── Categories
    ├── Achievements
    └── System Settings
```

---

# 10. Landing Page

Landing page harus menjelaskan:

### Hero

Headline:

> Grow Better Habits. Grow Your Tree.

Subheadline:

> Build consistent habits, earn XP, maintain your streak, and watch your virtual tree grow.

CTA:

* Get Started
* Login

### Sections

1. How it works.
2. Habit tracking.
3. Gamification.
4. Tree progression.
5. Statistics.
6. Achievement.
7. Call to action.
8. Footer.

Landing page harus responsive.

---

# 11. Authentication

Gunakan Supabase Auth.

### Required

* Register.
* Login.
* Logout.
* Forgot password.
* Reset password.
* Session persistence.
* Protected routes.

### Optional

* Google OAuth.

User registration membutuhkan:

```text
email
password
display_name
```

Supabase Auth menangani authentication.

Profile application data disimpan pada tabel `profiles`.

---

# 12. Onboarding

Setelah register, user diarahkan ke onboarding.

Step 1:

> What is your main goal?

Options:

* Productivity
* Health
* Study
* Fitness
* Personal Growth
* Other

Step 2:

> Choose your initial habits

User dapat memilih template.

Contoh:

* Read 20 minutes.
* Exercise.
* Study.
* Drink water.
* Clean room.
* Practice coding.

Step 3:

Create first habit.

Onboarding dapat dilewati.

---

# 13. Habit Management

Habit adalah core entity.

User dapat:

* Create.
* Read.
* Update.
* Archive.
* Restore.
* Delete.

Hard delete hanya diperbolehkan apabila tidak menyebabkan data historis rusak.

Default behavior: archive.

---

# 14. Habit Fields

Setiap habit minimal memiliki:

```text
id
user_id
name
description
category_id
icon
color
frequency_type
target_value
target_unit
start_date
end_date
reminder_time
is_active
created_at
updated_at
```

Contoh:

```text
name: "Belajar Coding"
frequency: DAILY
target_value: 60
target_unit: MINUTES
```

Contoh lainnya:

```text
name: "Gym"
frequency: WEEKLY
target_value: 3
target_unit: TIMES
```

---

# 15. Habit Frequency

MVP wajib mendukung:

### Daily

Setiap hari.

### Selected Days

Contoh:

```text
Monday
Wednesday
Friday
```

### Weekly Target

Contoh:

> Exercise 3 times per week.

Schedule harus disimpan secara terstruktur.

Jangan menyimpan schedule hanya sebagai text.

---

# 16. Habit Completion

User dapat menandai habit selesai.

Endpoint:

```text
POST /api/habits/:id/complete
```

Server melakukan:

1. Validasi user.
2. Validasi habit.
3. Validasi schedule.
4. Cek apakah completion sudah ada.
5. Insert completion.
6. Calculate XP.
7. Update streak.
8. Recalculate consistency.
9. Recalculate tree.
10. Check achievement.
11. Write activity log.

Semua proses penting harus bersifat idempotent.

User tidak boleh memperoleh XP dua kali dari completion yang sama.

---

# 17. Completion Model

Completion minimal memiliki:

```text
id
habit_id
user_id
completed_at
date
value
note
xp_earned
created_at
```

Unique constraint:

```text
(habit_id, date)
```

untuk habit dengan model completion sekali per hari.

Untuk habit yang mendukung beberapa completion per hari, aturan harus menggunakan model target dan progress yang berbeda.

MVP menggunakan satu completion utama per scheduled occurrence.

---

# 18. Daily Dashboard

Dashboard adalah halaman utama aplikasi.

Komponen:

```text
Greeting
Daily Progress
Today's Habits
Current Streak
XP
Level
Tree Preview
Weekly Progress
Recent Achievements
```

Contoh:

```text
Good evening, Vincent 🌱

Today's Progress
████████░░ 80%

4 / 5 habits completed
```

---

# 19. Habit Card

Setiap habit card menampilkan:

```text
Icon
Habit Name
Schedule
Target
Completion Status
Streak
XP Reward
Checkbox
```

Contoh:

```text
💻 Learn Coding

Today
60 minutes

🔥 7 day streak

+20 XP

[ ✓ ]
```

Checkbox harus memiliki micro-animation ketika selesai.

---

# 20. Calendar

Calendar memungkinkan user melihat history.

Status:

```text
Completed
Missed
Scheduled
Not Scheduled
```

Warna/indikator jangan hanya mengandalkan warna; gunakan icon/status untuk accessibility.

User dapat memilih tanggal.

---

# 21. Streak System

Streak adalah jumlah scheduled occurrence berturut-turut yang berhasil diselesaikan.

Penting:

**Streak harus memperhatikan jadwal habit.**

Contoh:

Habit:

```text
Monday
Wednesday
Friday
```

Jika user menyelesaikan Monday dan Wednesday, Tuesday tidak dihitung sebagai missed karena Tuesday tidak dijadwalkan.

---

# 22. Streak Rules

MVP:

### Complete scheduled occurrence

```text
streak + 1
```

### Miss scheduled occurrence

```text
streak reset
```

### Non-scheduled day

Tidak mengubah streak.

Sistem harus menyimpan:

```text
current_streak
longest_streak
last_completed_date
```

---

# 23. XP System

XP adalah reward utama.

Default:

```text
Normal habit completion = +10 XP
```

Habit dapat memiliki difficulty multiplier.

Contoh:

```text
Easy = 10 XP
Medium = 15 XP
Hard = 20 XP
```

MVP default difficulty:

```text
Easy
Medium
Hard
```

XP tidak boleh berasal dari data client.

Server harus menghitung XP.

---

# 24. Level System

Level ditentukan dari cumulative XP.

Contoh awal:

```text
Level 1 = 0 XP
Level 2 = 100 XP
Level 3 = 250 XP
Level 4 = 450 XP
Level 5 = 700 XP
Level 6 = 1000 XP
```

Gunakan konfigurasi terpusat sehingga threshold bisa diubah tanpa mengubah banyak bagian kode.

UI menampilkan:

```text
Level 4

320 / 450 XP

████████░░
```

---

# 25. Consistency Score

Consistency Score adalah komponen penting proyek.

MVP formula:

```text
Completion Rate =
completed scheduled occurrences
/
total scheduled occurrences
× 100
```

Nilai:

```text
0–100
```

Contoh:

```text
Scheduled = 30
Completed = 24

Consistency Score = 80%
```

Precision disimpan secukupnya, tetapi UI dapat menampilkan integer.

---

# 26. Overall Consistency Score

Overall score dihitung dari seluruh active habits.

Gunakan weighted average berdasarkan jumlah scheduled occurrences.

Contoh:

```text
Habit A = 90%
Habit B = 80%
Habit C = 70%
```

Jika bobot sama:

```text
Overall = 80%
```

Formula final harus diimplementasikan dalam satu service:

```text
ConsistencyService
```

Jangan menyalin formula ke banyak komponen.

---

# 27. Tree Growth System

Tree merupakan mekanisme gamifikasi utama.

Pohon memiliki lifecycle:

```text
Seed
↓
Sprout
↓
Young Tree
↓
Healthy Tree
↓
Mature Tree
```

Suggested thresholds:

```text
0–19   Seed
20–39  Sprout
40–59  Young Tree
60–79  Healthy Tree
80–100 Mature Tree
```

Tree stage berasal dari Overall Consistency Score.

---

# 28. Tree States

Database menyimpan:

```text
tree_stage
tree_health
consistency_score
growth_points
last_updated
```

Tree state dapat direcalculate.

Contoh:

```text
Consistency = 87

Stage = Mature Tree
Health = 87
```

---

# 29. Tree Visual Rules

Tree harus berubah secara visual.

Contoh:

### Seed

```text
Soil
Small seed
```

### Sprout

```text
Small stem
2–3 leaves
```

### Young Tree

```text
Small trunk
Several branches
More leaves
```

### Healthy Tree

```text
Large trunk
Many branches
Dense leaves
Possible flowers
```

### Mature Tree

```text
Large tree
Dense canopy
Flowers/fruits
Highest visual quality
```

Tree assets dapat menggunakan SVG/illustration/CSS atau image assets.

Asset harus mudah diganti.

Jangan membuat seluruh tree logic tergantung pada satu image hardcoded.

---

# 30. Tree Growth Feedback

Ketika tree naik stage, tampilkan:

```text
🌳 Your tree grew!

Consistency reached 80%.

New stage unlocked:
Mature Tree
```

Saat user menyelesaikan habit:

```text
+15 XP
🔥 Streak increased
🌱 Your tree is growing
```

Feedback harus terasa positif tetapi tidak mengganggu.

---

# 31. Achievement System

Achievement harus data-driven.

Contoh:

```text
First Step
Complete your first habit.

7 Day Streak
Maintain a 7-day streak.

Habit Builder
Complete 50 habits.

Consistency Master
Reach 90% consistency.

Tree Keeper
Reach Mature Tree.
```

Achievement fields:

```text
id
name
description
icon
type
threshold
xp_reward
is_active
created_at
```

User achievements:

```text
user_id
achievement_id
unlocked_at
```

Unique constraint:

```text
(user_id, achievement_id)
```

---

# 32. Achievement Engine

Setelah event penting:

```text
completion
streak update
level up
tree stage change
```

jalankan:

```text
AchievementService
```

Service mengecek achievement yang belum unlocked.

Jangan membuat achievement checking di frontend.

---

# 33. Statistics

Statistics page minimal:

### Daily

* completed.
* scheduled.
* completion rate.

### Weekly

* total completions.
* average consistency.
* XP gained.
* best streak.

### Monthly

* total completions.
* consistency trend.
* habit performance.

Charts menggunakan Recharts.

---

# 34. Statistics Charts

Required:

### Weekly Completion Chart

Bar chart:

```text
Mon Tue Wed Thu Fri Sat Sun
```

### Consistency Trend

Line chart:

```text
Week 1
Week 2
Week 3
Week 4
```

### Habit Performance

Bar chart:

```text
Study       90%
Exercise    80%
Reading     70%
Cleaning    95%
```

---

# 35. Habit Performance

User dapat melihat:

```text
Best Habit
Worst Habit
Most Consistent
Most Missed
```

Contoh:

```text
🏆 Best Habit
Reading — 95%

⚠ Needs Attention
Exercise — 54%
```

---

# 36. Activity History

History mencatat:

```text
Habit completed
Habit created
Habit archived
XP gained
Level up
Achievement unlocked
Tree stage changed
```

Example:

```text
Today, 19:32

✅ Completed "Learn Coding"
+15 XP

Today, 19:33

🌳 Tree reached Healthy Tree
```

---

# 37. Notification / Reminder

MVP:

* reminder_time.
* reminder preference.
* notification permission state.

Web dapat menggunakan browser notification apabila memungkinkan.

Notification system harus dirancang agar dapat dikembangkan menjadi push notification.

Jangan membuat reminder hanya dengan `setInterval()` di browser.

Untuk production reminder, gunakan server-side scheduler/cron pada fase berikutnya.

---

# 38. User Profile

Profile:

```text
Avatar
Display Name
Email
Level
XP
Current Streak
Longest Streak
Tree Stage
Joined Date
```

User dapat mengubah:

* Display name.
* Avatar.
* Time zone.
* Reminder preferences.

---

# 39. Settings

Sections:

### Account

* Profile.
* Password.
* Email.

### Preferences

* Theme.
* Timezone.
* Notifications.

### Privacy

* Data export.
* Account deletion.

### Application

* About.
* Version.

---

# 40. Theme

Support:

```text
Light
Dark
System
```

UI harus konsisten.

Primary visual direction:

```text
Natural
Calm
Modern
Minimal
Gamified
```

Inspirasi:

```text
Forest
Nature
Growth
Progress
Cozy
```

Jangan membuat UI seperti game anak-anak secara berlebihan.

---

# 41. Design System

Use:

```text
Tailwind CSS
shadcn/ui
Lucide icons
```

Typography harus mudah dibaca.

UI harus memiliki:

* consistent spacing.
* reusable components.
* responsive layouts.
* accessible buttons.
* focus states.
* keyboard support.
* loading states.
* empty states.
* error states.

---

# 42. Responsive Requirements

Breakpoints:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Dashboard mobile harus tetap nyaman digunakan.

Habit checklist harus dapat dilakukan dengan satu tangan pada mobile.

---

# 43. Mobile-First Considerations

Walaupun MVP dikembangkan sebagai web app, semua komponen harus mempertimbangkan future Android application.

Jangan:

```text
hardcode browser-only business logic
```

Semua business logic penting harus tersedia pada backend service/API.

---

# 44. Backend Architecture

Gunakan:

```text
Next.js App Router
        ↓
Route Handlers
        ↓
Service Layer
        ↓
Repository / Data Layer
        ↓
Supabase PostgreSQL
```

Suggested:

```text
app/
  api/
    auth/
    habits/
    completions/
    gamification/
    analytics/
    achievements/
```

Business logic:

```text
lib/
  services/
    habit.service.ts
    completion.service.ts
    xp.service.ts
    streak.service.ts
    consistency.service.ts
    tree.service.ts
    achievement.service.ts
```

---

# 45. API Standard

All API responses use consistent format.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "HABIT_NOT_FOUND",
    "message": "Habit not found"
  }
}
```

HTTP status harus sesuai.

Contoh:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

---

# 46. API Endpoints

## Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Supabase Auth tetap menjadi provider authentication.

## Habits

```text
GET    /api/habits
POST   /api/habits
GET    /api/habits/:id
PATCH  /api/habits/:id
DELETE /api/habits/:id
POST   /api/habits/:id/archive
POST   /api/habits/:id/restore
```

## Completion

```text
POST /api/habits/:id/complete
GET  /api/habits/:id/completions
DELETE /api/completions/:id
```

Completion deletion harus mengikuti business rules supaya tidak menyebabkan manipulasi XP yang tidak valid.

## Gamification

```text
GET /api/gamification/summary
GET /api/gamification/xp
GET /api/gamification/streaks
GET /api/gamification/tree
```

## Analytics

```text
GET /api/analytics/daily
GET /api/analytics/weekly
GET /api/analytics/monthly
GET /api/analytics/habits
```

## Achievements

```text
GET /api/achievements
GET /api/achievements/me
```

---

# 47. Database

Use:

**Supabase PostgreSQL**

Required tables:

```text
profiles
habit_categories
habits
habit_schedules
habit_completions
xp_transactions
user_levels
user_streaks
user_trees
achievements
user_achievements
notifications
activity_logs
```

---

# 48. `profiles`

```text
id UUID PK
display_name VARCHAR
avatar_url TEXT
timezone VARCHAR
onboarding_completed BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

`id` references `auth.users.id`.

---

# 49. `habit_categories`

```text
id UUID PK
name VARCHAR
slug VARCHAR UNIQUE
icon VARCHAR
description TEXT
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Examples:

```text
Study
Health
Fitness
Productivity
Personal
Spiritual
Other
```

---

# 50. `habits`

```text
id UUID PK
user_id UUID
category_id UUID
name VARCHAR
description TEXT
icon VARCHAR
color VARCHAR
difficulty VARCHAR
frequency_type VARCHAR
target_value NUMERIC
target_unit VARCHAR
start_date DATE
end_date DATE
reminder_time TIME
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Foreign keys:

```text
user_id → auth.users
category_id → habit_categories
```

---

# 51. `habit_schedules`

```text
id UUID PK
habit_id UUID
day_of_week INTEGER NULL
specific_date DATE NULL
target_occurrences INTEGER NULL
created_at TIMESTAMP
```

MVP schedule validation harus memastikan konfigurasi valid.

---

# 52. `habit_completions`

```text
id UUID PK
habit_id UUID
user_id UUID
date DATE
completed_at TIMESTAMP
value NUMERIC
note TEXT
xp_earned INTEGER
created_at TIMESTAMP
```

Indexes:

```text
user_id
habit_id
date
```

Constraint harus mencegah duplicate scheduled completion.

---

# 53. `xp_transactions`

Jangan hanya menyimpan total XP tanpa history.

```text
id UUID PK
user_id UUID
source_type VARCHAR
source_id UUID NULL
amount INTEGER
description TEXT
created_at TIMESTAMP
```

Contoh:

```text
source_type = habit_completion
amount = 15
```

Total XP dapat dihitung dari transaksi atau disediakan melalui summary/cache.

---

# 54. `user_levels`

```text
user_id UUID PK
level INTEGER
total_xp INTEGER
updated_at TIMESTAMP
```

Level harus konsisten dengan XP transaction history.

---

# 55. `user_streaks`

```text
id UUID PK
user_id UUID
habit_id UUID NULL
current_streak INTEGER
longest_streak INTEGER
last_completed_date DATE NULL
updated_at TIMESTAMP
```

`habit_id = NULL` dapat digunakan untuk global daily streak jika fitur tersebut diaktifkan.

---

# 56. `user_trees`

```text
user_id UUID PK
stage VARCHAR
health INTEGER
consistency_score NUMERIC
growth_points INTEGER
updated_at TIMESTAMP
```

---

# 57. `achievements`

```text
id UUID PK
name VARCHAR
slug VARCHAR UNIQUE
description TEXT
icon VARCHAR
condition_type VARCHAR
condition_value INTEGER
xp_reward INTEGER
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 58. `user_achievements`

```text
id UUID PK
user_id UUID
achievement_id UUID
unlocked_at TIMESTAMP
```

Unique:

```text
(user_id, achievement_id)
```

---

# 59. `notifications`

```text
id UUID PK
user_id UUID
type VARCHAR
title VARCHAR
message TEXT
scheduled_for TIMESTAMP
sent_at TIMESTAMP NULL
read_at TIMESTAMP NULL
status VARCHAR
created_at TIMESTAMP
```

---

# 60. `activity_logs`

```text
id UUID PK
user_id UUID
activity_type VARCHAR
entity_type VARCHAR
entity_id UUID NULL
metadata JSONB
created_at TIMESTAMP
```

Metadata dapat berisi:

```json
{
  "habit_name": "Study Coding",
  "xp": 15
}
```

Jangan menyimpan secret/private credentials dalam metadata.

---

# 61. Supabase Row Level Security

RLS wajib digunakan untuk tabel user-owned.

User hanya boleh mengakses:

```text
WHERE user_id = auth.uid()
```

Contoh tabel:

```text
habits
habit_schedules
habit_completions
xp_transactions
user_levels
user_streaks
user_trees
user_achievements
notifications
activity_logs
```

Admin access harus menggunakan role/authorization yang benar.

Jangan pernah expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

ke browser/client.

---

# 62. Environment Variables

Use `.env.local`.

Expected:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Service role key hanya server-side.

Jangan commit `.env.local`.

Provide:

```text
.env.example
```

---

# 63. Security Requirements

Wajib:

* RLS.
* Server-side authorization.
* Input validation.
* Zod.
* Secure password handling through Supabase Auth.
* CSRF considerations where applicable.
* No service-role key in client.
* Rate limiting consideration.
* Prevent XP manipulation.
* Prevent duplicate completion.
* Prevent IDOR.
* Validate ownership of every resource.

---

# 64. Validation

All API input must be validated using Zod.

Example:

```text
habit name:
minimum 1 character
maximum 100 characters
```

Description:

```text
maximum 500 characters
```

XP:

```text
server-generated only
```

User cannot submit:

```json
{
  "xp": 999999
}
```

and expect server to accept it.

---

# 65. Gamification Security

Client can request:

```text
Complete habit
```

Client cannot request:

```text
Give me 100 XP
```

Server calculates:

```text
habit difficulty
completion validity
XP reward
streak
consistency
```

---

# 66. Transaction Integrity

Completion flow should be atomic where possible.

Conceptually:

```text
BEGIN
  insert completion
  insert xp transaction
  update level
  update streak
  update tree
  insert activity log
COMMIT
```

If any critical operation fails, avoid a partially updated state.

Use appropriate Supabase/PostgreSQL transaction strategy.

---

# 67. Error Handling

UI states:

```text
Loading
Success
Empty
Error
Retry
```

Example:

```text
Unable to load today's habits.

[Retry]
```

Do not show raw database errors to users.

---

# 68. Empty States

Example:

No habits:

```text
Your garden is waiting 🌱

Create your first habit and start growing.

[Create Habit]
```

No achievements:

```text
No achievements yet.

Keep building your habits!
```

---

# 69. Loading States

Use skeleton loaders.

Avoid blank white screens.

---

# 70. Toast Notifications

Use toast for:

```text
Habit created
Habit updated
Habit completed
Achievement unlocked
Settings saved
```

Do not use toast as the only feedback for critical state.

---

# 71. Gamification Feedback

After completion:

```text
✅ Habit completed!

+15 XP

🔥 8 day streak

🌱 Tree health +2
```

Animation duration must be short and should not block interaction.

---

# 72. Accessibility

Target WCAG-friendly implementation.

Required:

* keyboard navigation.
* focus states.
* semantic HTML.
* accessible labels.
* screen reader friendly buttons.
* sufficient contrast.
* do not rely solely on color.

---

# 73. Performance

Targets:

* Fast initial load.
* Avoid unnecessary client-side rendering.
* Use Server Components where appropriate.
* Use client components only when interaction requires them.
* Optimize images.
* Lazy-load charts where appropriate.
* Avoid unnecessary database queries.

Dashboard should ideally retrieve aggregated summary efficiently rather than dozens of independent requests.

---

# 74. Data Fetching

Use TanStack Query for client-side server state.

Use:

```text
useQuery
useMutation
invalidateQueries
```

after mutations.

Do not store server data unnecessarily in Zustand.

---

# 75. State Management

Zustand can be used for:

* UI state.
* Theme preference.
* modal state.
* onboarding state.

Do not use Zustand as the primary server-state storage.

TanStack Query handles server state.

---

# 76. Forms

Use:

```text
React Hook Form
+
Zod
```

All forms need:

* validation.
* error messages.
* loading state.
* disabled submit while processing.
* success feedback.

---

# 77. Suggested Project Structure

```text
src/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── habits/
│   │   ├── calendar/
│   │   ├── tree/
│   │   ├── statistics/
│   │   ├── achievements/
│   │   ├── history/
│   │   ├── profile/
│   │   └── settings/
│   │
│   ├── admin/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── habits/
│   ├── dashboard/
│   ├── tree/
│   ├── analytics/
│   └── gamification/
│
├── lib/
│   ├── supabase/
│   ├── services/
│   ├── validators/
│   ├── algorithms/
│   ├── utils/
│   └── constants/
│
├── hooks/
├── types/
└── config/
```

---

# 78. Services

Create dedicated services:

```text
HabitService
CompletionService
XPService
LevelService
StreakService
ConsistencyService
TreeService
AchievementService
AnalyticsService
NotificationService
```

Avoid putting business logic directly inside React components.

---

# 79. Algorithms

Create dedicated modules:

```text
calculateXP()
calculateStreak()
calculateConsistency()
calculateTreeStage()
calculateLevel()
evaluateAchievements()
```

Each must have unit tests.

---

# 80. Algorithm Example

Conceptual:

```text
completeHabit(habit, date)

→ validateSchedule()
→ createCompletion()
→ xp = calculateXP(habit)
→ addXP()
→ updateLevel()
→ updateStreak()
→ consistency = calculateConsistency()
→ tree = calculateTreeStage(consistency)
→ evaluateAchievements()
→ createActivityLog()
```

---

# 81. Design Principle

The system must remain **data-driven**.

Do NOT:

```text
if user.name === "Vincent"
```

Do NOT:

```text
treeStage = "Mature"
```

without calculation.

Do:

```text
treeStage = calculateTreeStage(consistencyScore)
```

---

# 82. Admin Panel

Admin dashboard:

```text
Total Users
Active Users
Total Habits
Completions Today
Average Consistency
```

Charts:

```text
User growth
Habit creation trend
Completion trend
```

Admin can manage:

* categories.
* achievements.
* system configuration.

---

# 83. Admin Role

Roles:

```text
USER
ADMIN
```

Authorization must be enforced server-side.

UI hiding is NOT sufficient security.

---

# 84. Initial Seed Data

Seed categories:

```text
Study
Health
Fitness
Productivity
Personal Growth
Cleaning
Other
```

Seed achievements:

```text
First Step
7 Day Streak
30 Day Streak
50 Completions
100 Completions
80% Consistency
90% Consistency
Healthy Tree
Mature Tree
```

---

# 85. Habit Templates

Optional onboarding templates:

```text
Study 30 minutes
Read 20 minutes
Exercise 30 minutes
Drink Water
Clean Room
Practice Coding
Meditate
Sleep on Time
```

Templates are starting points, not fixed user data.

---

# 86. Tree Asset System

Tree assets must be separated from business logic.

Example:

```text
tree/
  seed.svg
  sprout.svg
  young-tree.svg
  healthy-tree.svg
  mature-tree.svg
```

Tree component:

```text
<TreeVisualization stage={tree.stage} />
```

not:

```text
<TreeVisualization score={...} />
```

unless needed for animations.

---

# 87. Future Tree Expansion

Architecture should allow:

```text
different tree species
different environments
seasonal themes
cosmetic decorations
```

without rewriting the core Tree Growth Engine.

These are future features.

---

# 88. Future Mobile App

Future architecture:

```text
                 REST API
                    │
          ┌─────────┴──────────┐
          │                    │
       Next.js              Android
          │                    │
          └─────────┬──────────┘
                    │
                 Supabase
```

Possible Android implementation:

```text
React Native / Expo
```

The mobile application should reuse the same API/business contract.

---

# 89. PWA

MVP can include basic PWA support.

Requirements:

* installable.
* app icon.
* manifest.
* responsive.
* offline fallback where practical.

Offline habit completion synchronization is optional and should not be implemented before the online flow is stable.

---

# 90. Testing Strategy

Required:

### Unit Testing

Test:

```text
calculateXP
calculateStreak
calculateConsistency
calculateTreeStage
calculateLevel
evaluateAchievements
```

### Integration Testing

Test:

```text
register
create habit
complete habit
XP update
streak update
tree update
achievement unlock
```

### UI Testing

Test:

```text
login
create habit
complete habit
view statistics
```

---

# 91. Acceptance Criteria — Authentication

Registration successful:

```text
User account created
Profile created
Session established
Dashboard accessible
```

Invalid credentials:

```text
Clear error displayed
```

Protected page without session:

```text
Redirect to login
```

---

# 92. Acceptance Criteria — Habit

User can:

```text
Create
Edit
Archive
Restore
View
```

Invalid form:

```text
Cannot submit
Validation shown
```

---

# 93. Acceptance Criteria — Completion

When user completes scheduled habit:

```text
Completion stored
XP awarded once
Streak recalculated
Consistency recalculated
Tree recalculated
Achievement checked
Activity logged
```

Refreshing the page must not award XP again.

---

# 94. Acceptance Criteria — Tree

Given:

```text
Consistency = 85
```

Tree must:

```text
Stage = Mature Tree
```

Given:

```text
Consistency = 65
```

Tree:

```text
Stage = Healthy Tree
```

Thresholds must be centralized.

---

# 95. Acceptance Criteria — Security

User A cannot:

```text
GET User B habit
PATCH User B habit
DELETE User B habit
GET User B completion
```

Even when attempting to manipulate URL IDs.

---

# 96. Acceptance Criteria — Dashboard

Dashboard displays accurate:

```text
today's habits
completed count
completion %
XP
level
streak
tree
weekly progress
```

All values must originate from actual database data.

---

# 97. Acceptance Criteria — Statistics

Statistics must match raw completion data.

Example:

```text
30 scheduled
24 completed
```

UI must show:

```text
80%
```

No fabricated numbers.

---

# 98. Database Migration

All schema changes must use versioned migrations.

Never rely on manually creating tables only through Supabase dashboard.

Repository must contain:

```text
supabase/migrations/
```

---

# 99. Seed Scripts

Provide:

```text
supabase/seed.sql
```

or equivalent seed mechanism.

Seed data must be deterministic.

---

# 100. API Documentation

Create:

```text
docs/API.md
```

Document:

* Endpoint.
* Method.
* Authentication.
* Request.
* Response.
* Error.
* Example.

---

# 101. Environment Documentation

Create:

```text
README.md
.env.example
```

README must explain:

```text
Prerequisites
Installation
Environment variables
Supabase setup
Database migration
Seed
Development
Testing
Build
Deployment
```

---

# 102. Git Requirements

Use conventional commits.

Examples:

```text
feat: add habit creation
feat: implement streak engine
feat: implement tree progression
fix: prevent duplicate habit completion
refactor: extract consistency service
test: add streak calculation tests
docs: update API documentation
```

---

# 103. Code Quality

Requirements:

* TypeScript strict mode.
* No unnecessary `any`.
* Reusable components.
* No duplicated business logic.
* ESLint.
* Prettier.
* Clear naming.
* Error handling.
* Comments only where necessary.

---

# 104. Type Safety

Create shared types:

```text
Habit
HabitSchedule
HabitCompletion
XPTransaction
Achievement
UserAchievement
TreeState
AnalyticsSummary
```

Do not duplicate interfaces in multiple files.

---

# 105. Logging

Server should log important operational errors.

Do not log:

* passwords.
* access tokens.
* service role keys.
* sensitive private user data.

---

# 106. Deployment

### Frontend/API

Deploy to:

```text
Vercel
```

### Database/Auth/Storage

Use:

```text
Supabase
```

### Domain

Optional:

```text
habitgrow.app
```

or other available domain.

---

# 107. Production Requirements

Before production:

* environment variables configured.
* RLS enabled.
* no development credentials.
* error handling enabled.
* migrations applied.
* seed not containing test users.
* HTTPS.
* production Supabase project.
* backup strategy considered.

---

# 108. MVP Development Order

AI coding agent MUST NOT attempt everything simultaneously.

Implement in this order.

### Phase 1

Project setup:

```text
Next.js
TypeScript
Tailwind
shadcn
Supabase
ESLint
Prettier
```

### Phase 2

Authentication.

### Phase 3

Database schema + migrations + RLS.

### Phase 4

Habit CRUD.

### Phase 5

Schedule + completion.

### Phase 6

XP + level.

### Phase 7

Streak.

### Phase 8

Consistency engine.

### Phase 9

Tree growth.

### Phase 10

Achievement.

### Phase 11

Analytics.

### Phase 12

Admin.

### Phase 13

Testing.

### Phase 14

Performance/security review.

### Phase 15

Deployment.

---

# 109. MVP Definition

MVP dianggap selesai apabila pengguna dapat melakukan:

```text
Register
↓
Login
↓
Create Habit
↓
Set Schedule
↓
See Today's Habit
↓
Complete Habit
↓
Receive XP
↓
Increase Streak
↓
Update Consistency
↓
Grow Tree
↓
Unlock Achievement
↓
View Statistics
```

---

# 110. Future Features

Do not implement in MVP.

Potential v2:

```text
AI habit recommendation
AI habit coaching
Smart reminders
Push notification
PWA offline sync
Multiple tree species
Garden customization
Decorations
Daily quests
Challenges
Friends
Social features
Leaderboards
Mobile app
Android widgets
Wearable integration
```

---

# 111. Important Product Rule

**Gamification must support the habit, not become the habit.**

The UI should motivate users without becoming overly addictive or stressful.

Avoid excessive:

```text
popups
animations
notifications
sound effects
competitive pressure
```

---

# 112. Important Research-Oriented Rule

Because the project may become a thesis project, the implementation must preserve data needed for evaluation.

System should record:

```text
habit creation date
habit schedule
completion date
completion status
streak
consistency score
XP
tree stage
achievement unlock
```

Do not permanently overwrite historical data where it is important for research analysis.

---

# 113. Research Data Consideration

Create architecture allowing anonymized export later.

Possible future admin/export format:

```text
user_hash
date
habit_count
completed_count
completion_rate
streak
xp
tree_stage
consistency_score
```

Do not expose personally identifiable information unnecessarily.

---

# 114. Future Thesis Evaluation

Potential research question:

> Does gamification based on virtual tree progression improve habit consistency?

Potential independent variable:

```text
Gamification mechanism
```

Potential dependent variable:

```text
Habit consistency
```

Possible evaluation approaches can be determined during thesis methodology design.

The production application itself must not make claims that its gamification "proves" increased motivation unless research testing supports that conclusion.

---

# 115. Important Coding-Agent Instructions

The AI coding agent MUST:

1. Read this PRD completely before implementation.
2. Not arbitrarily change the technology stack.
3. Not skip database migrations.
4. Not place business logic directly inside UI components.
5. Not trust client-submitted XP.
6. Not bypass RLS.
7. Not expose service-role credentials.
8. Not create fake analytics data in production.
9. Not use hardcoded user-specific values.
10. Not duplicate business rules.
11. Write tests for core algorithms.
12. Keep code modular.
13. Document significant architecture decisions.
14. Maintain mobile-responsive UI.
15. Treat Supabase as production infrastructure, not as a temporary mock.
16. Build the MVP before implementing optional features.

---

# 116. Coding-Agent Execution Rules

When starting the project:

```text
STEP 1
Analyze PRD.

STEP 2
Create implementation plan.

STEP 3
Create project structure.

STEP 4
Create Supabase migrations.

STEP 5
Implement authentication.

STEP 6
Implement habit system.

STEP 7
Implement gamification.

STEP 8
Implement tree.

STEP 9
Implement analytics.

STEP 10
Test.

STEP 11
Security review.

STEP 12
Production build.
```

The agent should not skip directly to UI polishing before the core domain logic works.

---

# 117. Definition of Done

A feature is DONE only if:

```text
UI implemented
+
API implemented where applicable
+
Database integrated
+
Validation implemented
+
Authorization implemented
+
Error handling implemented
+
Loading state implemented
+
Empty state implemented
+
Responsive
+
Tests implemented where relevant
+
Documentation updated
```

---

# 118. Final Product Architecture

```text
                         HABITGROW
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
       Web Client                         Future Android
       Next.js                             App
           │                                   │
           └─────────────────┬─────────────────┘
                             │
                         REST API
                             │
                     Next.js Backend
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   Habit Service       Gamification        Analytics
        │                    │                    │
        │          ┌─────────┼─────────┐          │
        │          │         │         │          │
        │         XP       Streak     Tree        │
        │                    │         │           │
        └────────────────────┼─────────┘           │
                             │
                         Supabase
                             │
                  ┌──────────┼──────────┐
                  │          │          │
              PostgreSQL    Auth      Storage
```

---

# 119. Core Domain Flow

```text
                  USER
                   │
                   ▼
              HABIT ENGINE
                   │
                   ▼
              COMPLETION
                   │
          ┌────────┼────────┐
          │        │        │
          ▼        ▼        ▼
         XP      STREAK  HISTORY
          │        │
          └────┬───┘
               ▼
        CONSISTENCY ENGINE
               │
               ▼
        CONSISTENCY SCORE
               │
               ▼
         TREE ENGINE
               │
               ▼
        VIRTUAL TREE 🌱
               │
               ▼
          ACHIEVEMENT
```

---

# 120. Product Principle

HabitGrow should answer three questions immediately whenever the user opens the application:

> **What should I do today?**

> **How consistent have I been?**

> **How is my tree growing?** 🌱

These three questions are the heart of the product.

---

# 121. Machine Learning Predictive Habit Churn & Adaptive Nudge System

Versi 2.0 mengintegrasikan modul kecerdasan buatan berbasis *Binary Logistic Regression* yang beroperasi secara *serverless* dengan latensi sangat rendah ($\le 10\text{ ms}$).

### 121.1 Tujuan Modul
Mendeteksi secara proaktif kebiasaan yang berisiko tinggi terlewatkan (*churn*) pada hari evaluasi berjalan ($P \ge 60\%$), serta menyajikan rekomendasi penyesuaian target 1-klik (*Adaptive Nudge*) agar pengguna tidak mengalami keputusasaan.

### 121.2 Ekstraksi 5 Fitur Numerik
Untuk setiap kebiasaan aktif yang terjadwal hari ini, sistem mengekstraksi riwayat 14 hari terakhir:
1. $x_1$ (`completion_rate_7d`): Rasio penyelesaian dalam 7 hari terakhir $[0, 1]$.
2. $x_2$ (`completion_rate_14d`): Rasio penyelesaian dalam 14 hari terakhir $[0, 1]$.
3. $x_3$ (`days_since_last_completed`): Jumlah hari sejak kebiasaan ini terakhir diselesaikan ($\ge 0$).
4. $x_4$ (`current_streak`): Rentetan keberhasilan kebiasaan saat ini ($\ge 0$).
5. $x_5$ (`is_weekend`): Bobot faktor akhir pekan ($1$ untuk Sabtu/Minggu, $0$ untuk hari kerja).

### 121.3 Formulasi Model & Nilai Bobot
Log-odds $z$ dihitung dengan kombinasi linier terbobot:
$$z = w_0 + w_1 x_1 + w_2 x_2 + w_3 \min(x_3, 5) + w_4 \min(x_4, 10) + w_5 x_5$$

Vektor bobot terkalibrasi (*empirically calibrated weights*):
* Bias ($w_0$): $+0.50$ (Kecenderungan risiko inersia awal)
* Bobot Tren 7 Hari ($w_1$): $-2.00$ (Konsistensi seminggu sangat menurunkan risiko)
* Bobot Tren 14 Hari ($w_2$): $-1.50$ (Konsistensi 2 minggu menurunkan risiko)
* Bobot Hari Terlewat ($w_3$): $+0.80$ (Semakin lama tidak dikerjakan, risiko melonjak tajam)
* Bobot Penyangga Streak ($w_4$): $-0.20$ (Streak panjang bertindak sebagai *habit buffer*)
* Bobot Gangguan Akhir Pekan ($w_5$): $+0.40$ (Akhir pekan memiliki variansi jadwal tinggi)

Probabilitas risiko kegagalan dihitung melalui fungsi aktivasi Sigmoid standar:
$$P(\text{churn}) = \sigma(z) = \frac{1}{1 + e^{-z}}$$

### 121.4 Threshold & Tindakan Adaptif
* **Ambang Batas Peringatan:** Jika $P(\text{churn}) \ge 0.60$ (Tingkat risiko $\ge 60\%$).
* **Fase Adaptasi Dingin (*Cold-Start Guard*):** Evaluasi prediktif baru aktif setelah kebiasaan berusia $\ge 7\text{ hari}$ agar pengguna baru tidak dibebani peringatan saat baru membuat akun.
* **Aksi Nudge 1-Klik:** Menampilkan kartu *Smart Predictive Nudge* berwarna oranye-amber di atas daftar kebiasaan hari ini dengan tombol adaptif 1-klik untuk menurunkan target kuantitas sementara (`PATCH /api/habits/[id]`).

---

# 122. Non-Zero Day Global Daily Streak & Broken Streak Architecture

Sistem *streak* HabitGrow dirancang untuk memutus siklus keputusasaan (*streak fatigue*) melalui dua pilar utama:

### 122.1 Prinsip Non-Zero Day Global Streak
* Tidak mewajibkan penyelesaian seluruh kebiasaan sekaligus dalam sehari untuk mempertahankan api *Global Daily Streak*.
* Cukup menyelesaikan **minimal 1 kebiasaan terjadwal apa pun hari ini**, maka api *Global Streak* tetap menyala ($+1\text{ hari}$).
* Jika tidak ada kebiasaan yang diselesaikan sama sekali pada hari sebelumnya, api *Global Streak* padam dan kembali ke 0.

### 122.2 Deteksi & Pemulihan Streak Putus Empatik (*Broken Streak Alert*)
* Ketika pengguna membuka aplikasi (`GET /api/dashboard/summary`), sistem secara dinamis membandingkan jadwal kemarin dengan riwayat checklist.
* Jika ada kebiasaan terjadwal yang terlewat kemarin dan mengalami pemutusan streak individu, sistem menyajikan *Broken Streak Banner* dengan pesan motivasional empatik (menampilkan rekor hari yang telah dicapai pengguna) serta tombol penutup (*dismiss*).

---

# 123. Botanical Contribution Matrix (GitHub-Style 52-Week Activity Heatmap)

Pada halaman `/app/calendar`, HabitGrow menyajikan kalender aktivitas visual 365/366 hari yang terinspirasi dari grafik kontribusi GitHub dengan sentuhan botani organik:

### 123.1 Karakteristik Matriks
* **Dimensi Grid:** 7 baris horizontal (mewakili hari dalam sepekan: Min s/d Sab) dan 53 kolom vertikal (mewakili 52–53 pekan dalam setahun kalender).
* **5 Tingkat Intensitas Warna Hijau Botani:**
  * **Level 0 (0 checklist):** Abu-abu netral tipis (`bg-slate-100` / `dark:bg-slate-800/50`).
  * **Level 1 (1–2 checklist):** Hijau kecambah muda (`#a7f3d0`).
  * **Level 2 (3–4 checklist):** Hijau daun segar (`#34d399`).
  * **Level 3 (5–6 checklist):** Hijau zamrud pekat (`#059669`).
  * **Level 4 ($\ge 7$ checklist):** Hijau hutan lebat bernutrisi tinggi (`#064e3b`).

### 123.2 Metrik Kinerja Tahunan
Di atas kanvas matriks, disajikan 4 kartu metrik eksekutif tahunan:
1. **Total Checklist:** Akumulasi total checklist kebiasaan yang tuntas pada tahun berjalan.
2. **Hari Non-Zero (Disiplin):** Jumlah hari aktif di mana pengguna menyelesaikan setidaknya 1 tugas.
3. **Akumulasi XP:** Total perolehan XP yang terkumpul sepanjang tahun.
4. **Rekor Streak Terpanjang:** *Streak* harian kontinu terpanjang yang tercapai pada tahun tersebut.

### 123.3 Interaktivitas & Mode Tampilan
* **Year Selector:** Beralih instan antar tahun kalender yang tersedia.
* **Tampilan Ganda:** Tombol sakelar antara *Matriks 52 Minggu* dan *Tampilan Bulanan*.
* **Day Inspector Card:** Mengklik kotak tanggal mana pun di matriks akan memicu panel inspektur di sebelah kanan yang merinci daftar kebiasaan yang selesai, perolehan XP, dan status kepatuhan target.

---

# 124. Mobile Responsive Architecture & Slide-Over Drawer Navigation

Antarmuka HabitGrow dioptimalkan secara mendalam untuk perangkat Android & iOS dengan panduan ergonomi *thumb zone*:

### 124.1 Desain Header Bersih & Minimalis
* Header bagian atas pada perangkat seluler hanya memuat Logo resmi HabitGrow dan Sakelar Tema (*Light/Dark mode*).
* Menghindari tombol menu di kanan atas untuk mencegah redundansi (*visual clutter*).

### 124.2 Bilah Navigasi Bawah Ergonomis (*Bottom Navigation Bar*)
* Terlabuh kokoh di dasar *viewport* (`fixed bottom-0 left-0 right-0`) di luar elemen header untuk mengeliminasi *CSS Containing Block Bug*.
* Disederhanakan menjadi 5 tab utama berjarak seimbang: **Beranda**, **Kebiasaan**, **Pohon**, **Kalender**, dan **Menu**.
* Dilengkapi utilitas bantalan *safe area* iOS: `pb-[max(0.375rem,env(safe-area-inset-bottom))]` agar tidak terhalang oleh *home indicator bar* iPhone.

### 124.3 Slide-Over Hamburger Drawer Navigation
* Dipicu dari tab **Menu** pada bilah navigasi bawah.
* Membuka panel lembaran samping dari sisi kanan (`w-[85%] max-w-xs h-full`) dengan efek *slide-in-from-right* dan latar belakang *backdrop blur*.
* Mengunci gulir halaman latar belakang (`document.body.style.overflow = 'hidden'`) saat terbuka, serta otomatis tertutup saat rute berubah.
* Menyajikan akses lengkap ke seluruh rute sistem, pengaturan profil akun, dan tombol keluar (*logout*).

### 124.4 Executive Command Bar & Kartu Taktil
* **Grid 3-Kolom Proporsional:** 3 kartu statistik inti (*Streak*, *Level XP*, *Konsistensi*) disusun rapi dalam grid 3-kolom seimbang di mobile tanpa *line wrapping* tak beraturan.
* **Full-Width CTA:** Tombol `+ Tambah Kebiasaan` membentang penuh tepat di bawah 3 metrik sehingga sangat mudah dijangkau dengan ibu jari satu tangan.
* **Kartu Taktil & Confetti:** Kartu kebiasaan (*HabitCard*) memiliki padding responsif `p-3.5 sm:p-5`, target sentuh centang taktil lingkaran, latensi 0ms (*Optimistic UI*), dan semburan partikel konfeti perayaan instan.

---

# 125. Automated Testing & Verification Suite (Vitest & TestSprite Integration)

Untuk menjamin keandalan sistem berskala produksi dan kepatuhan standar tugas akhir akademik, HabitGrow menerapkan dua lapis pengujian otomatis:

### 125.1 Pengujian Unit Matematika & Algoritma (Vitest)
Menjalankan 39 pengujian unit terotomatisasi dengan tingkat kelulusan 100%:
* `streak.test.ts` (12 tests): Validasi Non-Zero Day, kalkulasi streak individual, rekor streak terpanjang, dan deteksi broken streak.
* `prediction.test.ts` (8 tests): Validasi ekstraksi 5 fitur numerik, formulasi sigmoid, ambang batas $P \ge 60\%$, dan filter cold-start 7 hari.
* `tree.test.ts` (6 tests): Validasi 5 tahap evolusi botani (*Seed* $\rightarrow$ *Mature Tree*) dan ambang batas kesehatan pohon.
* `level.test.ts` (5 tests): Validasi ambang batas XP kumulatif dan kenaikan level pengguna.
* `consistency.test.ts` (4 tests): Validasi skor konsistensi bergulir 30 hari (*Rolling 30-Day Consistency*).
* `xp.test.ts` (4 tests): Validasi perolehan XP berdasarkan tingkat kesulitan kebiasaan (*Easy*, *Medium*, *Hard*).

### 125.2 Pengujian Otomatis End-to-End Browser (TestSprite MCP)
Pengujian fungsionalitas antarmuka dan alur pengguna nyata (*Real User Journey*) menggunakan bot pengujian otonom TestSprite:
* **Target Lingkungan Server Lokal:** `http://localhost:3000` (Port 3000).
* **Rute Masuk Awal:** `/login` (Halaman Masuk Pengguna).
* **Akun Pengujian Terotentikasi (*Test User Account*):**
  * **Email:** `gura3497@gmail.com`
  * **Password:** `gurarawr@#01`
* **Cakupan Skenario Pengujian:**
  1. *Authentication Flow*: Login dengan kredensial uji, verifikasi pembuatan sesi cookie, dan pengalihan otomatis ke `/app/dashboard`.
  2. *Dashboard Command Bar Verification*: Memeriksa rendering sapaan nama pengguna, streak, level XP, dan persentase pohon.
  3. *Habit Checklist Execution*: Memeriksa penekanan tombol centang lingkaran, animasi Optimistic UI, dan perayaan partikel konfeti.
  4. *Habit Management (CRUD)*: Membuka modal "+ Tambah Kebiasaan", mengisi formulir dengan validasi Zod, dan menambahkan rutinitas baru.
  5. *Mobile Navigation & Drawer*: Membuka tab Menu di bilah bawah, memeriksa pembukaan Slide-Over Drawer, navigasi ke halaman lain, dan penutupan menu.
  6. *Theme Switching*: Beralih antara tema gelap (*Dark Mode*) dan terang (*Light Mode*) dengan persistensi visual mulus.

---

