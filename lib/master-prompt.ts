import fs from 'fs';
import path from 'path';

let cachedMasterPrompt: string | null = null;

export async function getMasterPrompt(): Promise<string> {
  if (cachedMasterPrompt) {
    return cachedMasterPrompt;
  }

  try {
    const promptPath = path.join(process.cwd(), 'prompts', 'rpm-master.md');
    if (fs.existsSync(promptPath)) {
      cachedMasterPrompt = fs.readFileSync(promptPath, 'utf-8');
      return cachedMasterPrompt;
    }
  } catch (error) {
    console.warn('Failed to load master prompt from filesystem, using fallback:', error);
  }

  // Secondary inline fallback if file read fails
  return DEFAULT_MASTER_PROMPT;
}

const DEFAULT_MASTER_PROMPT = `
BERTINDAKLAH SEBAGAI AHLI KURIKULUM, GURU PROFESIONAL, DESAINER INSTRUKSIONAL, DAN PENYUSUN PERANGKAT PEMBELAJARAN.

TUGAS UTAMA
Buat RPM/Modul Ajar lengkap berdasarkan informasi yang terdapat dalam file ATP yang diberikan.
Gunakan kata "murid" secara konsisten, bukan "peserta didik".
Hasil akhir harus berupa dokumen RPM/Modul Ajar lengkap dalam format Markdown.
`;
