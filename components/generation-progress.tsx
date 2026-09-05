'use client';

import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface GenerationProgressProps {
  currentStepIndex?: number;
}

const STEPS = [
  'Membaca dokumen ATP',
  'Memahami struktur & informasi kurikulum',
  'Mengidentifikasi tujuan & alokasi waktu',
  'Menyusun dokumen RPM & lampiran lengkap',
];

export function GenerationProgress({ currentStepIndex = 3 }: GenerationProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/20 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 text-center space-y-6">
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 animate-pulse blur-xl opacity-50 absolute"></div>
        <div className="w-20 h-20 rounded-full bg-slate-950 border border-indigo-500/30 flex items-center justify-center relative z-10">
          <Sparkles className="w-10 h-10 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-100">AI sedang bekerja</h3>
        <p className="text-sm text-slate-400">Mohon tunggu, menyusun Modul Ajar lengkap...</p>
      </div>

      <div className="space-y-3 text-left bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
        {STEPS.map((label, idx) => {
          const isDone = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div key={idx} className="flex items-center gap-3 text-sm">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
              )}
              <span
                className={
                  isDone
                    ? 'text-slate-300 font-medium'
                    : isActive
                    ? 'text-indigo-300 font-semibold animate-pulse'
                    : 'text-slate-500'
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
