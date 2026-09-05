'use client';

import React, { useState } from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import { Copy, Check, Printer, Download, RefreshCw, Sparkles } from 'lucide-react';

interface RpmResultProps {
  markdownContent: string;
  onRegenerate: () => void;
  isStreaming?: boolean;
}

export function RpmResult({
  markdownContent,
  onRegenerate,
  isStreaming = false,
}: RpmResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RPM_Modul_Ajar_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Action Toolbar */}
      <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">RPM / Modul Ajar Ready</h2>
            {isStreaming && (
              <p className="text-xs text-indigo-400 animate-pulse">Menghasilkan bagian dokumen berikutnya...</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={isStreaming || !markdownContent}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all disabled:opacity-50"
            title="Salin ke clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            disabled={isStreaming || !markdownContent}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all disabled:opacity-50"
            title="Cetak dokumen"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            disabled={isStreaming || !markdownContent}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all disabled:opacity-50"
            title="Download file Markdown"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Download .md</span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={isStreaming}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
            title="Generate Ulang dari ATP yang sama"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Ulang</span>
          </button>
        </div>
      </div>

      {/* Render Document Container */}
      <div className="p-8 md:p-12 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-md print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        <MarkdownRenderer content={markdownContent} />
      </div>
    </div>
  );
}
