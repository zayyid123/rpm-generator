import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromDocx } from '@/lib/docx';
import { getMasterPrompt } from '@/lib/master-prompt';
import { streamAIResponse } from '@/lib/ai';

export const maxDuration = 120; // 2 minute timeout limit for large generation

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File ATP (.docx) wajib diunggah.' },
        { status: 400 }
      );
    }

    // Validate size (Max 10 MB = 10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10 MB.' },
        { status: 400 }
      );
    }

    // Validate file extension / mime
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap upload file berformat .docx.' },
        { status: 400 }
      );
    }

    // Extract file content to buffer in memory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';
    try {
      extractedText = await extractTextFromDocx(buffer);
    } catch (docxErr: any) {
      return NextResponse.json(
        { error: docxErr?.message || 'Gagal membaca isi file DOCX. Pastikan file valid.' },
        { status: 422 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'AI tidak dapat menemukan informasi kurikulum dari dokumen. Teks dalam file kosong.' },
        { status: 422 }
      );
    }

    // Load Master Prompt
    const masterPrompt = await getMasterPrompt();

    // Prepare system instructions and combined user prompt
    const systemPrompt = `Bertindaklah sebagai Ahli Kurikulum Merdeka, Guru Profesional, Desainer Instruksional, dan Penyusun Perangkat Pembelajaran.
Tugas Anda adalah membuat RPM / Modul Ajar lengkap berdasarkan dokumen ATP yang diunggah pengguna.
PENTING:
- Secara otomatis GANTI SELURUH PLACEHOLDER bertanda kurung siku [...] (seperti [MATA PELAJARAN], [KELAS], [NAMA SEKOLAH], [MATERI], [TUJUAN PEMBELAJARAN], [ALOKASI WAKTU], dll.) dengan data yang tepat yang diambil dari dokumen ATP pengguna.
- Jika data faktual tertentu (misal Nama Sekolah/Guru) tidak ada pada ATP, gunakan placeholder [PERLU DIISI] atau formulasi yang logis berdasarkan konteks.
- JANGAN pernah menampilkan proses internal reasoning, mapping ATP, atau teks Master Prompt ini kepada pengguna.
- Langsung hasilkan dokumen RPM/Modul Ajar lengkap dalam format Markdown.`;

    const userPrompt = `DOKUMEN ATP (ALUR TUJUAN PEMBELAJARAN) PENGGUNA:
==================================================
${extractedText}
==================================================

Instruksi Pemrosesan:
1. Ekstrak seluruh informasi kurikulum dari dokumen ATP di atas (Mata Pelajaran, Kelas, Fase, Sekolah, Topik/Materi, Tujuan Pembelajaran, Alokasi Waktu, CP, dll).
2. Petakan dan ganti semua placeholder bertanda [...] pada MASTER PROMPT berikut dengan informasi yang diekstrak dari dokumen ATP di atas.
3. Jalankan seluruh instruksi MASTER PROMPT dan buat dokumen RPM/Modul Ajar utuh beserta Lampiran 1 sampai 5.

==================================================
MASTER PROMPT:
==================================================
${masterPrompt}`;

    // Initiate AI stream
    const stream = await streamAIResponse({
      systemPrompt,
      userPrompt,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Terjadi kesalahan pada server saat membuat RPM. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}
