import mammoth from 'mammoth';

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    if (!text) {
      throw new Error('Dokumen DOCX kosong atau tidak memiliki teks yang terbaca.');
    }
    return text;
  } catch (error: any) {
    console.error('Mammoth extraction error:', error);
    throw new Error(
      error?.message || 'Gagal mengekstrak teks dari file DOCX. Pastikan file tidak rusak.'
    );
  }
}
