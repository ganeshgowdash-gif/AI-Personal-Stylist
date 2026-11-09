'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  UploadCloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { CheckBeforeBuyingResult } from '@/types/database';

interface CheckBeforeBuyingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckBeforeBuyingModal: React.FC<CheckBeforeBuyingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wardrobe } = useWardrobe();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CheckBeforeBuyingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      await analyzeStoreItem(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeStoreItem = async (imageBase64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/shopping/check-before-buying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          wardrobe,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed. Please check your photo and try again.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect store item.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-luxury-950 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-luxury-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                Check Before Buying
              </h2>
              <p className="text-xs text-luxury-400">
                AI cross-references the store item against your wardrobe before you spend.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-luxury-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!imagePreview ? (
            /* Upload State */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-72 border-2 border-dashed border-white/20 hover:border-white/40 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-300 group-hover:scale-110 transition-transform mb-3 border border-white/10">
                <UploadCloud className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-semibold text-white mb-1">
                Upload Photo of the Store Item
              </span>
              <p className="text-xs text-luxury-400 text-center max-w-md">
                Photograph any shirt, trouser, shoe, or jacket while shopping in-store or take a screenshot from an online shop.
              </p>
            </div>
          ) : isAnalyzing ? (
            /* Analyzing State */
            <div className="h-72 flex flex-col items-center justify-center p-8 bg-luxury-900/40 rounded-3xl border border-white/[0.08]">
              <RefreshCw className="w-8 h-8 text-white animate-spin mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-white">
                Auditing Against Your Wardrobe Database...
              </p>
              <p className="text-[11px] text-luxury-400 mt-1">
                Evaluating color harmony, duplicate risks, and combination counts.
              </p>
            </div>
          ) : result ? (
            /* Result Screen */
            <div className="space-y-6">
              {/* Verdict Card */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  result.verdict === 'Buy'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : result.verdict === 'Do Not Buy'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      result.verdict === 'Buy'
                        ? 'bg-emerald-500 text-black'
                        : result.verdict === 'Do Not Buy'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-black'
                    }`}
                  >
                    {result.verdict === 'Buy' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : result.verdict === 'Do Not Buy' ? (
                      <XCircle className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-luxury-300">
                        AI Stylist Verdict:
                      </span>
                      <span className="text-sm font-bold text-white tracking-wide uppercase">
                        {result.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-luxury-200 mt-1 leading-relaxed max-w-xl">
                      {result.verdict_reasoning}
                    </p>
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white text-white hover:text-black font-medium transition-colors shrink-0"
                >
                  Test Another Item
                </button>
              </div>

              {/* 5 Core Questions Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] text-luxury-400 block mb-0.5">
                    1. Matches Existing Clothes?
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {result.matches_existing_clothes ? 'Yes, Strong Alignment' : 'Limited Match'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] text-luxury-400 block mb-0.5">
                    2. Outfits Unlocked
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    +{result.enabled_outfits_count} New Combinations
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] text-luxury-400 block mb-0.5">
                    3. Duplicate of Owned Piece?
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      result.is_duplicate ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.is_duplicate ? 'Yes, Duplicate Alert' : 'No, Fills a Gap'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[11px] text-luxury-400 block mb-0.5">
                    4. Matching Pieces Count
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {result.matching_items.length} items in your wardrobe
                  </span>
                </div>
              </div>

              {/* Matching items in your wardrobe */}
              {result.matching_items.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-luxury-400 mb-2.5">
                    Exact Items in Your Wardrobe That Pair With It:
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {result.matching_items.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-luxury-900 mb-1.5 border border-white/5">
                          <img
                            src={item.photo_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-white truncate">{item.name}</p>
                        <p className="text-[9px] text-luxury-500 capitalize">{item.primary_color}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Potential Combinations */}
              {result.potential_combinations.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-luxury-400 mb-2.5">
                    Visual Combination Preview with Your Clothes:
                  </h4>
                  {result.potential_combinations.map((comb, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{comb.title}</span>
                        <span className="text-[10px] text-luxury-400">{comb.occasion}</span>
                      </div>
                      <p className="text-xs text-luxury-300">{comb.why_it_works}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

