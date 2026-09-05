'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { GenerationProgress } from '@/components/generation-progress';
import { RpmResult } from '@/components/rpm-result';
import { GenerationState } from '@/types';
import { ShieldCheck, BookOpen, Sparkles, FileSpreadsheet, RotateCcw, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<GenerationState>('idle');
  const [resultMarkdown, setResultMarkdown] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<number>(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setResultMarkdown('');
    setState('idle');
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setState('uploading');
    setErrorMessage(null);
    setResultMarkdown('');
    setProgressStep(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Step 1: Upload & Reading file
      setProgressStep(1);
      setState('generating');

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Server error (${response.status})` };
        }
        throw new Error(errorData.error || 'Gagal membuat RPM. Silakan coba lagi.');
      }

      if (!response.body) {
        throw new Error('Response body dari server kosong.');
      }

      // Step 2 & 3: Streaming text
      setProgressStep(2);
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let hasReceivedFirstChunk = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setResultMarkdown(accumulatedText);

        if (!hasReceivedFirstChunk && accumulatedText.length > 50) {
          hasReceivedFirstChunk = true;
          setProgressStep(3);
        }
      }

      setState('completed');
    } catch (err: any) {
      console.error('Generation Error:', err);
      setErrorMessage(err?.message || 'Terjadi kesalahan tidak terduga saat membuat RPM.');
      setState('error');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern relative flex flex-col justify-between">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col justify-center">
        {/* Navigation / Header */}
        <header className="flex items-center justify-between py-6 border-b border-slate-800/80 mb-10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-100 tracking-tight flex items-center gap-2">
                AI RPM Generator
                <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Kurikulum Merdeka
                </span>
              </h1>
              <p className="text-xs text-slate-400">Penyusun Modul Ajar Otomatis dari Dokumen ATP</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Preserved (No DB & Storage)</span>
          </div>
        </header>

        {/* Hero Banner (Only when idle or error or uploading) */}
        {(state === 'idle' || state === 'uploading' || state === 'error') && !resultMarkdown && (
          <div className="text-center space-y-4 mb-10 print:hidden">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Otomatisasi RPM 1 Pertemuan / Modul Lengkap</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Susun Modul Ajar & RPM <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Instan dari File ATP Anda
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              Cukup upload file ATP (<code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded">.docx</code>), AI akan membaca kurikulum, memetakan tujuan pembelajaran, dan menghasilkan dokumen RPM utuh beserta 5 lampiran asesmen & LKPD.
            </p>
          </div>
        )}

        {/* Dynamic Content Views */}
        <div className="my-auto py-4">
          {/* STATE: IDLE or UPLOADING */}
          {(state === 'idle' || state === 'uploading') && !resultMarkdown && (
            <div className="space-y-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                onGenerate={handleGenerate}
                selectedFile={selectedFile}
                onClearFile={handleClearFile}
                disabled={state === 'uploading'}
              />

              {/* Privacy Guarantee Note */}
              <div className="text-center max-w-xl mx-auto p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  File yang Anda upload hanya digunakan untuk proses pembuatan RPM saat ini dan <strong>tidak disimpan oleh aplikasi</strong>.
                </span>
              </div>
            </div>
          )}

          {/* STATE: GENERATING (Progress loader when streaming hasn't started or is initializing) */}
          {state === 'generating' && !resultMarkdown && (
            <div className="py-12">
              <GenerationProgress currentStepIndex={progressStep} />
            </div>
          )}

          {/* STATE: STREAMING or COMPLETED (Result viewer) */}
          {(state === 'completed' || (state === 'generating' && resultMarkdown)) && (
            <RpmResult
              markdownContent={resultMarkdown}
              onRegenerate={handleGenerate}
              isStreaming={state === 'generating'}
            />
          )}

          {/* STATE: ERROR */}
          {state === 'error' && (
            <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 backdrop-blur-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-100">Gagal Membuat RPM</h3>
                <p className="text-sm text-rose-300 bg-rose-950/40 p-4 rounded-xl border border-rose-900/50">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => setState('idle')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 print:hidden relative z-10">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} AI RPM Generator — Kurikulum Merdeka. Stateless & Privacy-First.</p>
        </div>
      </footer>
    </main>
  );
}
