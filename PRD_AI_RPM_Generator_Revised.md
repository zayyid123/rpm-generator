# PRD — AI RPM Generator

## 1. Konsep Produk

Aplikasi web sederhana untuk menghasilkan **RPM/Modul Ajar menggunakan AI**.

User tidak perlu login dan tidak ada data yang disimpan oleh aplikasi.

User cukup:
1. Upload file ATP `.docx`
2. Sistem mengirim file ke AI
3. AI membaca dan memahami isi ATP
4. AI mengambil informasi kurikulum yang relevan dari ATP
5. AI menerapkan informasi tersebut ke **Master Prompt RPM**
6. AI menjalankan seluruh instruksi Master Prompt
7. Hasil RPM ditampilkan langsung di frontend

Master Prompt berasal dari dokumen **PROMPT AI MODUL 1 TP ATAU 1 PERTEMUAN** dan sudah disesuaikan agar placeholder yang sebelumnya diisi manual dapat diisi otomatis berdasarkan ATP.

---

# 2. Core Flow

```text
Upload DOCX
     ↓
POST /api/generate
     ↓
AI membaca ATP
     ↓
AI memahami informasi kurikulum
     ↓
AI memetakan ATP → Master Prompt
     ↓
AI menjalankan Master Prompt
     ↓
Generate RPM lengkap
     ↓
Stream Result
     ↓
Frontend
```

Tidak ada:
- Login
- Register
- Database
- Storage permanen
- User account
- History
- Dashboard
- File persistence

---

# 3. User Flow

## Step 1 — Landing Page

Tampilan sederhana:

```text
┌─────────────────────────────────────────┐
│                                         │
│          AI RPM GENERATOR               │
│                                         │
│   Buat Modul Ajar/RPM dengan AI         │
│                                         │
│   Upload file ATP Anda dan biarkan      │
│   AI menyusun RPM secara otomatis.      │
│                                         │
│      ┌──────────────────────┐           │
│      │   Upload ATP (.docx) │           │
│      └──────────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

## Step 2 — Upload File

Supported:
```text
.docx
```

UI:

```text
┌──────────────────────────────────────┐
│                                      │
│       📄 Upload ATP                  │
│                                      │
│   Drag & drop file di sini           │
│                                      │
│          atau                        │
│                                      │
│       [ Pilih File ]                 │
│                                      │
│       Maksimal 10 MB                 │
│                                      │
└──────────────────────────────────────┘
```

Setelah file dipilih:

```text
✓ ATP.docx

[ Generate RPM ]
```

---

# 4. Pemrosesan ATP

Pada jalur utama, backend tidak perlu melakukan extraction ATP secara terpisah apabila provider/model yang digunakan benar-benar mendukung input file `.docx`.

Flow:

```text
DOCX
 ↓
AI File Input
 ↓
AI membaca dan memahami ATP
```

Namun implementasi **wajib memiliki fallback** apabila model/provider tidak mendukung DOCX secara native.

Fallback:

```text
DOCX
 ↓
Temporary DOCX parsing
 ↓
Plain Text
 ↓
AI
```

Temporary parsing hanya berlangsung selama request dan hasil extraction tidak disimpan ke database atau storage permanen.

---

# 5. Master Prompt

Master Prompt disimpan di backend/source code dan **tidak boleh dikirim dari frontend**.

File yang disarankan:

```text
prompts/
└── rpm-master.md
```

Master Prompt berikut berasal dari dokumen pengguna dan telah disesuaikan untuk sistem otomatis.

## MASTER_RPM_PROMPT

```text
BERTINDAKLAH SEBAGAI AHLI KURIKULUM, GURU PROFESIONAL, DESAINER INSTRUKSIONAL, DAN PENYUSUN PERANGKAT PEMBELAJARAN.

TUGAS UTAMA
Buat RPM/Modul Ajar lengkap berdasarkan informasi yang terdapat dalam file ATP yang diberikan.

JANGAN meminta pengguna mengisi placeholder secara manual jika informasi tersebut tersedia di ATP.

Gunakan ATP sebagai sumber utama untuk informasi kurikulum. Identifikasi dan gunakan informasi seperti:
- satuan pendidikan/sekolah
- mata pelajaran
- tahun pelajaran
- kelas
- fase
- capaian pembelajaran
- elemen pengetahuan
- elemen keterampilan
- keterampilan proses
- tujuan pembelajaran
- materi/topik
- dimensi profil lulusan
- alokasi waktu
- informasi lain yang relevan

Jika suatu informasi tidak tersedia di ATP:
- jangan mengarang data faktual;
- gunakan formulasi yang aman dan relevan berdasarkan konteks pembelajaran;
- jika data benar-benar wajib tetapi tidak tersedia, gunakan placeholder yang jelas seperti [PERLU DIISI] hanya pada bagian tersebut.

KONTEKS PEMBELAJARAN
Gunakan kata "murid" secara konsisten, bukan "peserta didik".

Buat perangkat pembelajaran menggunakan prinsip pembelajaran mendalam:
- Mindful / Berkesadaran
- Meaningful / Bermakna
- Joyful / Menyenangkan

Pilih model pembelajaran, pendekatan, metode, aktivitas, asesmen, dan media yang paling sesuai dengan materi, tujuan pembelajaran, alokasi waktu, dan karakteristik murid yang dapat dipahami dari ATP.

PROFIL LULUSAN
Pilih beberapa dimensi profil lulusan yang paling relevan dengan tujuan dan aktivitas pembelajaran dari daftar berikut:
1. Keimanan dan Ketakwaan terhadap Tuhan Yang Maha Esa
2. Kewargaan
3. Penalaran Kritis
4. Kreativitas
5. Kolaborasi
6. Kemandirian
7. Kesehatan
8. Komunikasi

Jangan memilih semua dimensi secara otomatis. Pilih hanya yang benar-benar relevan.

CAPAIAN PEMBELAJARAN
Tuliskan CP sesuai mata pelajaran dan konteks fase yang terdapat pada ATP.

Jika sumber ATP menyediakan CP, prioritaskan CP tersebut.
Jika perlu merujuk regulasi, gunakan ketentuan yang diminta oleh sumber/pengguna dan jangan mengarang nomor, kutipan, atau isi regulasi yang tidak dapat dipastikan dari sumber.

TUJUAN PEMBELAJARAN
Gunakan TP yang terdapat pada ATP sebagai sumber utama.
Jika terdapat lebih dari satu TP, tentukan TP yang relevan dengan materi/pertemuan yang akan dibuat.

Tujuan pembelajaran harus mendukung pemahaman yang bermakna dan dapat diamati/diukur.

ALOKASI WAKTU
Gunakan alokasi waktu dari ATP.

Jika dokumen secara eksplisit menunjukkan 1 pertemuan, buat modul untuk 1 pertemuan.

Jika ATP menyediakan alokasi dalam JP/menit, pertahankan informasi tersebut dan sesuaikan seluruh kegiatan pembelajaran agar realistis terhadap waktu yang tersedia.

STRUKTUR RPM / MODUL AJAR

A. IDENTITAS MODUL AJAR
Buat dalam tabel yang rapi dan profesional.

Minimal memuat informasi yang tersedia:
- Sekolah/Satuan Pendidikan
- Mata Pelajaran
- Kelas
- Fase
- Tahun Pelajaran
- Materi/Topik
- Alokasi Waktu
- Pertemuan

B. IDENTIFIKASI
Buat dalam tabel.

Murid:
- pengetahuan awal
- karakteristik murid yang relevan

Materi Pelajaran:
- tingkat kesulitan
- struktur materi
- konsep utama

Dimensi Profil Lulusan:
- pilih dimensi yang relevan dari 8 dimensi yang diberikan.

C. DESAIN PEMBELAJARAN
Buat tabel yang rapi.

Wajib memuat:
- Capaian Pembelajaran
- Lintas Disiplin Ilmu
- Tujuan Pembelajaran
- Topik Pembelajaran
- Praktik Pedagogis
- Kemitraan Pembelajaran
- Lingkungan Pembelajaran
- Pemanfaatan Digital

Pemanfaatan digital dapat mencakup PPT, video, kuis/interaksi digital, atau aplikasi digital lain yang relevan.

Jangan memaksakan penggunaan teknologi jika tidak sesuai kondisi pembelajaran.

D. PENGALAMAN BELAJAR
Buat secara rinci, operasional, dan realistis sesuai sintaks model pembelajaran yang dipilih.

Seluruh kegiatan harus mencerminkan:
- Mindful / Berkesadaran
- Meaningful / Bermakna
- Joyful / Menyenangkan

Buat dalam tabel.

Bagi menjadi:

1. Kegiatan Awal
- pembukaan
- kegiatan yang membangun kesiapan belajar
- apersepsi
- pertanyaan pemantik
- ice breaking yang relevan
- menyanyikan lagu nasional
- penyampaian tujuan pembelajaran

2. Kegiatan Inti
Sesuaikan dengan sintaks model pembelajaran yang dipilih.

Gunakan tahapan:
- Memahami
- Mengaplikasikan
- Merefleksi

Jika diperlukan, tambahkan ice breaking singkat yang tidak mengganggu alokasi waktu.

Setiap aktivitas harus memiliki hubungan jelas dengan TP dan asesmen.

3. Kegiatan Penutup
- refleksi
- penguatan
- kesimpulan
- tindak lanjut
- penutupan secara berkesadaran

E. ASESMEN PEMBELAJARAN
Buat dalam tabel.

Wajib memuat:

1. Asesmen Awal
- teknik
- instrumen
- tujuan

2. Asesmen Proses
- teknik
- instrumen
- aspek yang dinilai

3. Asesmen Akhir / Sumatif
- teknik
- instrumen
- tes tertulis di akhir pembelajaran

Pastikan asesmen benar-benar mengukur TP.

F. REFLEKSI GURU DAN MURID
Buat pertanyaan refleksi yang relevan untuk guru dan murid.

G. GLOSARIUM
Masukkan istilah penting yang muncul dalam materi.

H. DAFTAR PUSTAKA
Gunakan sumber yang relevan.
Jangan membuat referensi fiktif.
Jika sumber spesifik tidak tersedia, berikan daftar sumber yang perlu dilengkapi secara jelas.

TAMBAHAN
Tambahkan tempat tanda tangan:

Mengetahui,
Kepala Sekolah

(__________________)

Guru Mata Pelajaran

(__________________)

Gunakan kata "murid" secara konsisten di seluruh dokumen.

LAMPIRAN 1 — ASESMEN

A. ASESMEN AWAL (LISAN)

Buat 2 soal/pertanyaan pemantik yang relevan untuk mengecek kesiapan belajar.

SANGAT PENTING:
Pertanyaan pemantik pada Lampiran 1 harus SAMA PERSIS dengan pertanyaan pemantik yang digunakan pada Kegiatan Pendahuluan di bagian Pengalaman Belajar.

Sertakan:
- 2 pertanyaan
- tujuan masing-masing pertanyaan
- kunci jawaban/pedoman jawaban

B. ASESMEN PROSES

Buat rubrik skala 1–4.

a. Rubrik Sikap
Buat 4 aspek:
- Disiplin
- Tanggung Jawab
- Kerja Sama
- Toleransi

Untuk setiap aspek berikan deskripsi kriteria skor 1, 2, 3, dan 4.

b. Rubrik Pengetahuan
Buat 4 aspek kompetensi yang benar-benar sesuai dengan materi dan TP.
Setiap aspek memiliki deskripsi skor 1–4.

c. Rubrik Keterampilan
Buat 4 aspek keterampilan praktis/produk yang sesuai dengan aktivitas pembelajaran.
Setiap aspek memiliki deskripsi skor 1–4.

Buat tabel yang rapi.

C. ASESMEN AKHIR / SUMATIF

Buat:
1. Kisi-kisi
2. Soal pilihan ganda
3. Soal uraian
4. Kunci jawaban
5. Pedoman penskoran

Jumlah soal harus proporsional dengan alokasi waktu dan tujuan pembelajaran.

D. LEMBAR PENILAIAN

Buat lembar penilaian yang dapat langsung digunakan guru untuk:
- asesmen awal
- asesmen proses
- asesmen akhir

LAMPIRAN 2 — MATERI AJAR

Bertindaklah sebagai ahli kurikulum dan desainer bahan ajar.

Buat materi ajar berdasarkan TP.

Pastikan seluruh isi:
- mendukung pencapaian TP
- menggunakan bahasa yang mudah dipahami murid
- sistematis
- kontekstual
- menarik
- dilengkapi contoh
- memiliki aktivitas singkat bila relevan
- memiliki rangkuman
- memiliki refleksi

Materi harus siap dimasukkan ke dalam Modul Ajar/RPM.

Jangan memasukkan materi yang tidak mendukung TP.

LAMPIRAN 3 — LKPD

Buat LKPD yang selaras dengan modul dan TP.

Untuk setiap pertemuan, buat LKPD yang:
- memiliki identitas
- memuat tujuan pembelajaran
- memiliki petunjuk
- memiliki apersepsi
- memiliki aktivitas inti bertahap
- kreatif
- kontekstual
- interaktif
- mendukung pembelajaran aktif
- Mindful
- Meaningful
- Joyful
- menggunakan bahasa sederhana
- siap dicetak pada kertas A4

Jika hanya 1 pertemuan, buat 1 LKPD yang sesuai dengan pertemuan tersebut.

Aktivitas harus fokus pada pencapaian TP.

Jangan mengulang format aktivitas secara mekanis.

LAMPIRAN 4 — PENGAYAAN DAN REMEDIAL

A. PROGRAM REMEDIAL

Buat program remedial berdasarkan TP dalam format tabel resmi sekolah.

Minimal memuat:
- sekolah
- kelas/semester
- mata pelajaran
- bentuk asesmen
- materi

Buat tabel hasil analisis berisi:
- nama murid
- nilai
- indikator yang belum dikuasai
- bentuk pelaksanaan remedial
- nomor soal remedial
- nilai tes remedial
- keterangan

Bentuk pelaksanaan dapat berupa:
- bimbingan individu
- latihan ulang
- tugas sederhana

Instrumen remedial:
- 5 soal pilihan ganda dengan tingkat kesulitan mudah–sulit
- 5 soal esai berbentuk studi kasus kontekstual
- kunci jawaban
- kisi-kisi

Kisi-kisi minimal berisi:
- tujuan pembelajaran
- materi
- bentuk soal
- nomor soal
- level kognitif Bloom
- kunci jawaban/pedoman penilaian

B. PROGRAM PENGAYAAN

Buat program pengayaan berdasarkan TP dalam format tabel resmi sekolah.

Minimal memuat:
- sekolah
- kelas/semester
- mata pelajaran
- bentuk asesmen
- materi

Buat tabel hasil analisis berisi:
- nama murid
- nilai
- indikator yang dikuasai dengan baik
- bentuk pelaksanaan pengayaan
- produk/proyek
- nilai pengayaan
- keterangan

Bentuk pelaksanaan dapat berupa:
- proyek mini
- penelitian sederhana
- eksperimen
- portofolio

Instrumen pengayaan:
- 5 soal esai HOTS
- berfokus pada analisis
- evaluasi
- kreativitas

LAMPIRAN 5 — MEDIA PEMBELAJARAN

Buat media pembelajaran yang sesuai dengan materi, TP, karakteristik murid, dan fasilitas yang masuk akal.

Pisahkan:
- media digital
- media nondigital
- alat/peraga
- bahan yang diperlukan
- cara penggunaan singkat

Jangan memaksakan media yang tidak relevan.

ATURAN KUALITAS OUTPUT

1. Jangan menjelaskan proses internal AI.
2. Jangan menampilkan proses mapping ATP ke prompt.
3. Jangan menampilkan Master Prompt dalam hasil RPM.
4. Langsung hasilkan RPM/Modul Ajar.
5. Jangan mengarang informasi spesifik yang tidak tersedia.
6. Prioritaskan informasi dari ATP.
7. Pastikan semua bagian saling konsisten.
8. TP harus selaras dengan kegiatan pembelajaran.
9. Kegiatan pembelajaran harus selaras dengan asesmen.
10. Lampiran asesmen harus selaras dengan TP dan kegiatan.
11. Pertanyaan pemantik di Lampiran 1 harus sama persis dengan pertanyaan pemantik di kegiatan awal.
12. Gunakan kata "murid", bukan "peserta didik".
13. Gunakan bahasa Indonesia yang edukatif, profesional, dan mudah dipahami.
14. Hindari pengulangan isi yang tidak diperlukan.
15. Jangan membuat data sekolah, nama guru, nama kepala sekolah, atau data faktual lain jika tidak tersedia.
16. Pastikan alokasi waktu seluruh kegiatan realistis dan jumlah waktunya tidak melebihi alokasi yang tersedia.
17. Gunakan Markdown yang terstruktur agar mudah dirender frontend.
18. Gunakan tabel Markdown untuk bagian yang memang diminta berbentuk tabel.
19. Jangan menggunakan HTML/CSS inline untuk styling.
20. Hasil akhir harus berupa dokumen RPM/Modul Ajar lengkap yang siap ditinjau dan diedit oleh guru.
```

---

# 6. AI Instruction / Orchestration

Backend mengirim satu request ke AI.

Secara konseptual:

```text
SYSTEM INSTRUCTION
+
MASTER RPM PROMPT
+
ATP DOCX
↓
AI
↓
FINAL RPM
```

AI harus melakukan dua pekerjaan dalam satu request:

### Tahap 1 — Understand

```text
ATP.docx
 ↓
AI membaca
 ↓
AI memahami struktur dan informasi kurikulum
```

### Tahap 2 — Execute

```text
Informasi ATP
+
Master Prompt
 ↓
Final RPM
```

Backend tidak perlu melakukan prompt chaining menjadi dua request AI.

Instruksi sistem harus menegaskan:

```text
Baca dan pahami file ATP yang diberikan.

Gunakan ATP sebagai sumber utama informasi kurikulum.

Identifikasi informasi yang relevan.

Terapkan informasi tersebut ke Master Prompt.

Kemudian jalankan seluruh instruksi Master Prompt.

Jangan menjelaskan proses internal.

Langsung hasilkan RPM.
```

---

# 7. Important AI Behavior

AI harus:

- membaca ATP sebelum membuat RPM;
- menggunakan ATP sebagai sumber utama;
- tidak meminta user mengisi informasi yang sebenarnya tersedia di ATP;
- tidak mengarang informasi faktual;
- menjaga konsistensi antara ATP, TP, kegiatan, asesmen, LKPD, materi, remedial, dan pengayaan;
- menyesuaikan aktivitas dengan alokasi waktu;
- menggunakan kata "murid";
- menghasilkan seluruh lampiran;
- mengembalikan output dalam Markdown.

Jika informasi tidak tersedia, AI harus menggunakan `[PERLU DIISI]` hanya pada bagian yang memang membutuhkan data tersebut.

AI tidak boleh menampilkan:
- proses reasoning/internal reasoning;
- hasil mapping mentah ATP;
- Master Prompt;
- instruksi sistem.

---

# 8. Backend API

Hanya membutuhkan satu endpoint utama:

```http
POST /api/generate
```

Request:

```text
multipart/form-data
```

Field:

```text
file
```

Backend:

```text
POST /api/generate
        ↓
validate file
        ↓
load Master Prompt
        ↓
attach DOCX / extracted text
        ↓
call AI
        ↓
stream response
        ↓
return to frontend
```

Catatan penting: format `file input` harus disesuaikan dengan provider/model AI yang benar-benar digunakan. Jangan mengasumsikan semua model melalui 9Router mendukung DOCX secara native.

---

# 9. Frontend

Recommended:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

Tidak perlu state management kompleks.

State:

```typescript
type GenerationState =
  | "idle"
  | "uploading"
  | "generating"
  | "completed"
  | "error";
```

---

# 10. Generation UI

Setelah Generate:

```text
┌─────────────────────────────────────┐
│                                     │
│          AI sedang bekerja          │
│                                     │
│  ✓ Membaca ATP                      │
│  ✓ Memahami kurikulum               │
│  ✓ Mengidentifikasi tujuan          │
│  ● Menyusun RPM                     │
│                                     │
│       Mohon tunggu...               │
│                                     │
└─────────────────────────────────────┘
```

Catatan UX:
Status di atas adalah **indikator UI**, bukan klaim bahwa backend melakukan beberapa request AI terpisah.

Jika streaming digunakan, hasil dapat mulai muncul ketika AI masih menghasilkan bagian berikutnya.

---

# 11. Result UI

```text
┌────────────────────────────────────────────┐
│ RPM / MODUL AJAR                           │
│                                            │
│ [Copy] [Download] [Print] [Generate Ulang] │
├────────────────────────────────────────────┤
│                                            │
│ A. IDENTITAS MODUL                         │
│                                            │
│ ┌────────────┬───────────────────────────┐ │
│ │ Sekolah    │ SMP 2 Trans-Sains ...     │ │
│ │ Mapel      │ IPS                       │ │
│ │ Kelas      │ VIII                      │ │
│ │ Fase       │ D                         │ │
│ └────────────┴───────────────────────────┘ │
│                                            │
│ B. IDENTIFIKASI                            │
│                                            │
│ ...                                        │
│                                            │
└────────────────────────────────────────────┘
```

---

# 12. Render Result

AI mengembalikan:

```text
Markdown
```

Frontend menggunakan Markdown renderer.

Contoh:

```markdown
# A. IDENTITAS MODUL AJAR

| Komponen | Keterangan |
|---|---|
| Sekolah | ... |
| Mata Pelajaran | ... |
| Kelas | ... |
```

Frontend merender Markdown menjadi UI yang rapi.

Untuk MVP, tabel tetap menggunakan Markdown agar mudah diproses dan ditampilkan.

---

# 13. Output Requirement

Output wajib mempertahankan struktur:

```text
A. IDENTITAS MODUL AJAR
B. IDENTIFIKASI
C. DESAIN PEMBELAJARAN
D. PENGALAMAN BELAJAR
E. ASESMEN PEMBELAJARAN
F. REFLEKSI GURU DAN MURID
G. GLOSARIUM
H. DAFTAR PUSTAKA
```

Kemudian:

```text
LAMPIRAN 1 — ASESMEN
LAMPIRAN 2 — MATERI AJAR
LAMPIRAN 3 — LKPD
LAMPIRAN 4 — PENGAYAAN DAN REMEDIAL
LAMPIRAN 5 — MEDIA PEMBELAJARAN
```

Struktur ini mengikuti Master Prompt sumber pengguna. fileciteturn1file0L67-L90

---

# 14. No Database

Tidak ada database.

Tidak ada:

```text
users
documents
rpm_documents
history
versions
```

Setelah response selesai:

```text
AI
 ↓
Frontend
```

Data hasil hanya berada di memory/state browser selama halaman digunakan.

---

# 15. No Storage

File ATP tidak disimpan.

Flow:

```text
User selects file
       ↓
Browser
       ↓
Backend
       ↓
AI
       ↓
Response
       ↓
Frontend
```

Setelah request selesai, backend tidak menyimpan file.

Jika fallback parser digunakan, hasil parsing juga hanya digunakan sementara selama request.

---

# 16. Privacy

Aplikasi harus menjelaskan:

> File yang Anda upload hanya digunakan untuk proses pembuatan RPM dan tidak disimpan oleh aplikasi.

Implementasi harus memastikan:
- file tidak dipersistenkan;
- isi file tidak dimasukkan ke database;
- tidak ada storage permanen;
- logging tidak mencatat isi dokumen;
- API key tidak pernah dikirim ke browser.

Catatan: jika provider AI menyimpan input berdasarkan kebijakan provider, hal tersebut harus dijelaskan sesuai kebijakan provider yang digunakan. Klaim "tidak disimpan" pada sisi aplikasi tidak otomatis berarti provider AI tidak menyimpan data.

---

# 17. Environment Variables

Minimal:

```env
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=
```

Jika menggunakan 9Router:

```env
NINEROUTER_API_KEY=
NINEROUTER_BASE_URL=
NINEROUTER_MODEL=
```

API key hanya berada di server.

**Jangan pernah expose API key ke frontend.**

---

# 18. Project Structure

```text
app/
├── page.tsx
├── api/
│   └── generate/
│       └── route.ts

components/
├── file-upload.tsx
├── generation-progress.tsx
├── rpm-result.tsx
└── markdown-renderer.tsx

lib/
├── ai.ts
└── master-prompt.ts

prompts/
└── rpm-master.md

types/
└── index.ts
```

---

# 19. Master Prompt Location

Untuk prompt panjang:

```text
prompts/
└── rpm-master.md
```

Backend membaca prompt tersebut saat request.

Alternatif sederhana:

```text
lib/master-prompt.ts
```

```typescript
export const MASTER_RPM_PROMPT = `
[MASTER PROMPT]
`;
```

Namun file `.md` lebih mudah dirawat dan diedit oleh non-developer.

---

# 20. AI Request

Pseudo-code:

```typescript
const masterPrompt = await getMasterPrompt();

const result = await ai.generate({
  model: process.env.AI_MODEL,

  input: [
    {
      type: "file",
      file: uploadedFile
    },
    {
      type: "text",
      text: `
        Baca dan pahami file ATP yang diberikan.

        Gunakan ATP sebagai sumber utama informasi kurikulum.

        Terapkan informasi ATP ke Master Prompt berikut:

        ${masterPrompt}

        Setelah itu jalankan seluruh instruksi Master Prompt
        dan hasilkan RPM lengkap dalam Markdown.

        Jangan menjelaskan proses internal.
        Langsung hasilkan RPM.
      `
    }
  ]
});
```

Format request aktual harus mengikuti API provider/model yang digunakan.

---

# 21. Fallback Jika AI Tidak Bisa Membaca DOCX

Jika model tidak mendukung DOCX secara langsung:

```text
DOCX
 ↓
Backend temporary parsing
 ↓
Plain Text
 ↓
AI
```

Parser hanya digunakan selama request.

File:
- tidak disimpan;
- tidak masuk database;
- tidak masuk storage permanen.

Fallback parser dapat menggunakan library DOCX parser yang sesuai dengan stack backend.

---

# 22. Error Handling

### File terlalu besar

```text
File terlalu besar.
Silakan upload file DOCX yang lebih kecil.
```

### Format salah

```text
Format file tidak didukung.
Gunakan file .docx.
```

### AI gagal

```text
Gagal membuat RPM.

Silakan coba lagi.
```

### ATP tidak terbaca

```text
AI tidak dapat menemukan informasi
kurikulum yang diperlukan dari dokumen.

Silakan gunakan ATP dengan struktur
yang lebih jelas.
```

### Provider tidak mendukung file

```text
Model AI yang digunakan tidak mendukung
pembacaan file DOCX secara langsung.
Sistem akan menggunakan pemrosesan alternatif.
```

---

# 23. Regenerate

Setelah hasil muncul:

```text
[ Generate Ulang ]
```

Jika diklik, ulangi request menggunakan file yang sama selama file masih tersedia di browser.

Tidak perlu menyimpan file di server.

---

# 24. Download

MVP menyediakan:

```text
Copy
Print
Download Markdown
```

Tahap berikutnya:

```text
Download DOCX
Download PDF
```

Jika ingin DOCX/PDF yang sangat rapi, renderer/exporter dibuat setelah generator AI stabil.

---

# 25. Minimal MVP

## Frontend

```text
1. Upload
2. Generate button
3. Loading state
4. Streaming result
5. Result renderer
6. Copy
7. Print
8. Download Markdown
9. Generate Ulang
```

## Backend

```text
1. File validation
2. Master Prompt loading
3. DOCX file input
4. Fallback parser
5. AI request
6. Streaming response
7. Error handling
8. Privacy-safe request handling
```

## AI

```text
DOCX
+
Master Prompt
↓
RPM Lengkap
```

---

# 26. Non-Goals

Versi pertama tidak memiliki:

- Login
- Register
- Database
- Storage permanen
- Dashboard
- User profile
- History
- Payment
- Subscription
- Admin panel
- Multi-user management
- Marketplace
- Collaboration

---

# 27. Final Architecture

```text
                    ┌──────────────┐
                    │    USER      │
                    └──────┬───────┘
                           │
                           │ DOCX
                           ▼
                  ┌──────────────────┐
                  │    NEXT.JS FE    │
                  └────────┬─────────┘
                           │
                           │ multipart
                           ▼
                  ┌──────────────────┐
                  │    API ROUTE     │
                  │  /api/generate   │
                  └────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌──────────────┐        ┌────────────────┐
       │  ATP DOCX    │        │ MASTER PROMPT  │
       └──────┬───────┘        └───────┬────────┘
              │                         │
              └────────────┬────────────┘
                           ▼
                    ┌──────────────┐
                    │     AI       │
                    │   Provider   │
                    └──────┬───────┘
                           │
                           │ RPM Markdown
                           ▼
                  ┌──────────────────┐
                  │    NEXT.JS FE    │
                  │   RPM Renderer   │
                  └──────────────────┘
```

---

# 28. Prinsip Utama

**Satu request → satu proses AI.**

Tidak perlu:

```text
Upload
→ save DB
→ parse
→ save extraction
→ retrieve
→ prompt
→ save
→ generate
```

Cukup:

```text
Upload DOCX
      ↓
AI membaca ATP
      ↓
AI menerapkan Master Prompt
      ↓
AI menghasilkan RPM
      ↓
Tampilkan
```

Dengan fallback:

```text
Upload DOCX
      ↓
Coba file input native
      ↓
Jika tidak didukung
      ↓
Temporary parse
      ↓
AI
      ↓
RPM
```

Master Prompt mencakup modul utama, asesmen, materi ajar, LKPD, remedial, pengayaan, dan media pembelajaran sebagaimana dokumen sumber. fileciteturn1file0L92-L135

---

# 29. Acceptance Criteria

MVP dianggap berhasil jika:

- User dapat upload `.docx` maksimal 10 MB.
- File divalidasi sebelum dikirim.
- User tidak perlu login.
- Tidak ada database.
- Tidak ada storage permanen.
- API key hanya berada di server.
- Sistem dapat membaca informasi ATP.
- Sistem dapat menggunakan informasi ATP untuk mengisi kebutuhan Master Prompt.
- Sistem menghasilkan RPM dalam satu proses AI.
- Output mengikuti struktur A–H.
- Output menghasilkan Lampiran 1–5.
- Semua bagian konsisten dengan TP dan materi.
- Pertanyaan pemantik di Lampiran 1 sama persis dengan pertanyaan pemantik di kegiatan awal.
- Sistem menggunakan istilah "murid".
- Alokasi waktu kegiatan tidak melebihi alokasi ATP.
- Output dapat di-stream ke frontend.
- User dapat Copy, Print, Download Markdown, dan Generate Ulang.
- Jika native DOCX tidak didukung model, sistem dapat menggunakan fallback parsing sementara.
- Sistem tidak menampilkan Master Prompt kepada user.
- Sistem tidak menampilkan proses internal AI.
