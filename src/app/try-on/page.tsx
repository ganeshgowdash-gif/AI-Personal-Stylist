'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  Sparkles, 
  Camera, 
  User, 
  Columns, 
  ShieldCheck, 
  RotateCcw, 
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { VirtualPreviewModal } from '@/components/modals/VirtualPreviewModal';
import { OccasionSelectorModal } from '@/components/modals/OccasionSelectorModal';
import { OutfitCombination } from '@/types/database';

export default function VirtualTryOnPage() {
  const { 
    recentSuggestions, 
    savedOutfits, 
    profile, 
    updateModelAppearance, 
    setTryonConsent, 
    setTryonPhoto, 
    deleteTryonPhoto 
  } = useWardrobe();

  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);
  const [perspective, setPerspective] = useState<'front' | 'side' | 'detail'>('front');
  const [colorVariant, setColorVariant] = useState('original');
  const [isComparing, setIsComparing] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  const outfitsList: OutfitCombination[] = recentSuggestions.length > 0
    ? recentSuggestions
    : savedOutfits.map((s) => s.outfit).filter((o): o is OutfitCombination => Boolean(o));

  const activeOutfit = outfitsList[activeOutfitIndex] || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-luxury-200">
              Photorealistic Neural Studio
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Virtual Outfit Preview &amp; Try-On
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Observe realistic silhouettes, fabric drape, and proportions on customizable fashion models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {outfitsList.length > 1 && (
            <button
              onClick={() => setIsComparing(!isComparing)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isComparing
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Close Comparison' : 'Side-by-Side 3 Outfits'}</span>
            </button>
          )}

          <button
            onClick={() => setIsSuggestModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Outfits</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Badge */}
      <div className="p-3.5 rounded-2xl bg-luxury-900/60 border border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-luxury-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-white">
            AI-generated preview, not an exact fit simulation.
          </span>
          <span className="hidden md:inline text-luxury-400">
            Designs, colors, and cuts are derived directly from your uploaded items.
          </span>
        </div>
        <span className="text-[10px] font-mono text-luxury-500 uppercase">
          Studio Model Engine
        </span>
      </div>

      {outfitsList.length > 0 && activeOutfit ? (
        isComparing ? (
          /* Side-by-side comparison of 3 outfits */
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Side-by-Side Comparison: {activeOutfit.occasion}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {outfitsList.slice(0, 3).map((out, idx) => (
                <div
                  key={out.id}
                  className="rounded-3xl glass-card border border-white/[0.08] p-4 flex flex-col justify-between"
                >
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{out.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-luxury-300">
                        {out.tier.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-luxury-900 mb-4 border border-white/10 relative">
                    <img
                      src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                        `luxury fashion model wearing ${out.top_item?.primary_color} ${out.top_item?.name} and ${out.bottom_item?.primary_color} ${out.bottom_item?.name}`
                      )}?width=500&height=750&seed=${idx + 44}&nologo=true`}
                      alt={out.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 text-xs text-luxury-300">
                    <p className="line-clamp-2">{out.color_harmony_explanation}</p>
                    <button
                      onClick={() => {
                        setActiveOutfitIndex(idx);
                        setIsComparing(false);
                      }}
                      className="w-full mt-2 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-opacity"
                    >
                      Inspect in Studio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Interactive Studio View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Canvas (Left) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] max-h-[560px] rounded-3xl overflow-hidden bg-luxury-900 border border-white/10 shadow-2xl group">
                <img
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                    `luxury fashion model ${profile?.default_model_appearance?.gender || 'male'} wearing ${
                      colorVariant !== 'original' ? colorVariant : activeOutfit.top_item?.primary_color
                    } ${activeOutfit.top_item?.name} and ${activeOutfit.bottom_item?.primary_color} ${
                      activeOutfit.bottom_item?.name
                    } ${perspective} view studio lighting high fashion`
                  )}?width=700&height=950&seed=${activeOutfitIndex + 88}&nologo=true`}
                  alt="Model Preview"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />

                {/* Perspective overlays */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    {(['front', 'side', 'detail'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPerspective(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                          perspective === p
                            ? 'bg-white text-black font-semibold'
                            : 'text-luxury-300 hover:text-white'
                        }`}
                      >
                        {p} View
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    {['original', 'Cream Accent', 'Dark Tonal'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setColorVariant(v)}
                        className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                          colorVariant === v
                            ? 'bg-white text-black font-semibold'
                            : 'text-luxury-400 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Details & Wardrobe references (Right) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Outfit Tier Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-luxury-400 mb-2">
                  Select Outfit Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {outfitsList.slice(0, 3).map((o, idx) => (
                    <button
                      key={o.id}
                      onClick={() => setActiveOutfitIndex(idx)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all text-center truncate ${
                        activeOutfitIndex === idx
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/[0.04] text-luxury-400 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {o.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Breakdown */}
              <div className="p-4 rounded-2xl glass-card space-y-3">
                <span className="text-xs font-semibold text-white block">
                  Reference Wardrobe Pieces
                </span>
                <div className="space-y-2">
                  {[
                    { label: 'Top', item: activeOutfit.top_item },
                    { label: 'Bottom', item: activeOutfit.bottom_item },
                    { label: 'Shoes', item: activeOutfit.footwear_item },
                    { label: 'Outerwear', item: activeOutfit.outerwear_item },
                  ]
                    .filter((p) => p.item)
                    .map(({ label, item }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item?.photo_url}
                            alt={item?.name}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <p className="text-xs font-medium text-white">{item?.name}</p>
                            <p className="text-[10px] text-luxury-400 capitalize">
                              {item?.primary_color} • {label}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Model Appearance Controls */}
              <div className="p-4 rounded-2xl glass-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-luxury-300" />
                    <span>Model Settings</span>
                  </span>
                  <Link href="/settings" className="text-[10px] text-luxury-400 hover:text-white">
                    Save Default
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['male', 'female', 'androgynous'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        updateModelAppearance({
                          gender: g,
                          ethnicity: profile?.default_model_appearance?.ethnicity || 'diverse',
                          bodyType: profile?.default_model_appearance?.bodyType || 'regular',
                        })
                      }
                      className={`py-1.5 rounded-lg font-medium capitalize transition-all ${
                        profile?.default_model_appearance?.gender === g
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/[0.04] text-luxury-400 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-4">
          <Sparkles className="w-10 h-10 text-luxury-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No outfits generated yet</h3>
          <p className="text-xs text-luxury-400 max-w-sm mx-auto">
            Run an outfit suggestion to generate realistic human model previews matching your clothes.
          </p>
          <button
            onClick={() => setIsSuggestModalOpen(true)}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black"
          >
            Suggest Outfits Now
          </button>
        </div>
      )}

      {/* Modals */}
      <OccasionSelectorModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />
    </div>
  );
}
