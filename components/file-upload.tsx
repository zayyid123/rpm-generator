'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Sparkles } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onGenerate: () => void;
  selectedFile: File | null;
  onClearFile: () => void;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  onGenerate,
  selectedFile,
  onClearFile,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setErrorMessage(null);

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar. Maksimal 10 MB.');
      return;
    }

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setErrorMessage('Format file tidak didukung. Harap upload file berformat .docx.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900/90'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-100">
                Drag & drop file ATP Anda di sini
              </p>
              <p className="text-sm text-slate-400">
                atau <span className="text-indigo-400 hover:underline font-medium">pilih file</span> dari perangkat Anda
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-xs text-slate-400 border border-slate-700">
              <span>Format didukung: <strong>.docx</strong></span>
              <span>•</span>
              <span>Maksimal 10 MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center space-y-0 gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)} • File DOCX Terpilih</p>
              </div>
            </div>

            {!disabled && (
              <button
                onClick={onClearFile}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
                title="Hapus file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={onGenerate}
            disabled={disabled}
            className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate RPM</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
