'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Eye, 
  Bookmark, 
  Check, 
  AlertCircle, 
  Shirt, 
  Scissors, 
  Footprints,
  Compass
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { OutfitCombination } from '@/types/database';
import { MannequinViewer } from '@/components/mannequin/MannequinViewer';

const OCCASIONS = [
  'College',
  'Office',
  'Formal meetings',
  'Casual outings',
  'Friends meetups',
  'Parties',
  'Birthday celebrations',
  'Weddings',
  'Functions',
  'Travel',
  'Other',
];

export default function SuggestionsPage() {
  const { 
    shirts, 
    pants, 
    shoes, 
    generateOutfits, 
    recentSuggestions, 
    saveOutfit, 
    setActiveMannequinOutfit,
    bodyShape,
    setBodyShape
  } = useWardrobe();

  // Wizard state
  const [selectedOccasion, setSelectedOccasion] = useState<string>('College');
  const [weather, setWeather] = useState('Mild');
  const [preferredColor, setPreferredColor] = useState('');
  const [comfortLevel, setComfortLevel] = useState('Balanced');
  const [dressCode, setDressCode] = useState('Appropriate');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [previewCombo, setPreviewCombo] = useState<OutfitCombination | null>(null);

  const handleCurate = async () => {
    setIsSubmitting(true);
    setMissingMessage(null);

    const result = await generateOutfits({
      occasion: selectedOccasion,
      weather,
      preferredColor: preferredColor.trim() || undefined,
      comfortLevel,
      dressCode,
    });

    if (result.missingNotice) {
      setMissingMessage(result.missingNotice);
    }

    setIsSubmitting(false);
  };

  const handleOpenOnMannequin = (combo: OutfitCombination) => {
    if (combo.shirt && combo.pants && combo.shoes) {
      setActiveMannequinOutfit({
        shirt: combo.shirt,
        pants: combo.pants,
        shoes: combo.shoes,
      });
      setPreviewCombo(combo);
    }
  };

  const handleSaveCombo = async (combo: OutfitCombination) => {
    if (!combo.shirt || !combo.pants || !combo.shoes) return;
    await saveOutfit(combo.shirt, combo.pants, combo.shoes, combo.title);
    setSavedSuccessId(combo.id);
    setTimeout(() => setSavedSuccessId(null), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white">
              AI Outfit Recommendations
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Suggest My Outfit
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Recommends up to 3 combinations strictly from your authentic wardrobe items.
          </p>
        </div>
      </div>

      {/* Occasion Selection Wizard */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-5">
        <h2 className="text-sm font-semibold text-white">
          1. What is the occasion? (Required)
        </h2>

        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occ) => {
            const isSelected = selectedOccasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => setSelectedOccasion(occ)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-luxury-300 border border-white/[0.06]'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>

        {/* Optional Preferences */}
        <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-luxury-400 mb-1">Weather (Optional)</label>
            <input
              type="text"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="e.g. Mild, Hot, Rainy"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
            />
          </div>

          <div>
            <label className="block text-luxury-400 mb-1">Preferred Colour (Optional)</label>
            <input
              type="text"
              value={preferredColor}
              onChange={(e) => setPreferredColor(e.target.value)}
              placeholder="e.g. Navy, White, Any"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
            />
          </div>

          <div>
            <label className="block text-luxury-400 mb-1">Comfort Level</label>
            <select
              value={comfortLevel}
              onChange={(e) => setComfortLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.08] text-white"
            >
              <option value="Balanced">Balanced</option>
              <option value="High Comfort">High Comfort</option>
              <option value="Sharp Tailoring">Sharp Tailoring</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleCurate}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Curate Outfits from My Wardrobe</span>
          </button>
        </div>
      </div>

      {/* Missing Notice Alert */}
      {missingMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{missingMessage}</span>
        </div>
      )}

      {/* 3 Outfit Combinations */}
      {recentSuggestions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-base font-semibold text-white">
            Curated Combinations for {selectedOccasion}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentSuggestions.map((combo) => (
              <div
                key={combo.id}
                className="p-5 rounded-3xl glass-card border border-white/[0.08] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {combo.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                      ★ {combo.score}
                    </span>
                  </div>

                  {/* 3 Item Photos */}
                  <div className="grid grid-cols-3 gap-2 my-3">
                    <div className="aspect-square rounded-xl overflow-hidden bg-luxury-900 border border-white/5">
                      {combo.shirt && <img src={combo.shirt.front_photo_url} alt="Shirt" className="w-full h-full object-cover" />}
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-luxury-900 border border-white/5">
                      {combo.pants && <img src={combo.pants.front_photo_url} alt="Pants" className="w-full h-full object-cover" />}
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-luxury-900 border border-white/5">
                      {combo.shoes && <img src={combo.shoes.front_photo_url} alt="Shoes" className="w-full h-full object-cover" />}
                    </div>
                  </div>

                  {/* Explanation Bullet Points */}
                  <div className="space-y-2 text-xs text-luxury-300">
                    <div>
                      <span className="font-semibold text-white block">Why they match:</span>
                      <p className="text-[11px] text-luxury-400">{combo.why_they_match}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-white block">Color compatibility:</span>
                      <p className="text-[11px] text-luxury-400">{combo.color_compatibility}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-white block">Occasion suitability:</span>
                      <p className="text-[11px] text-luxury-400">{combo.occasion_suitability}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => handleOpenOnMannequin(combo)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-luxury-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View on 3D Mannequin</span>
                  </button>

                  <button
                    onClick={() => handleSaveCombo(combo)}
                    className="flex items-center gap-1 text-xs text-luxury-400 hover:text-white"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedSuccessId === combo.id ? 'fill-white text-white' : ''}`} />
                    <span>{savedSuccessId === combo.id ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Mannequin Preview Modal */}
      {previewCombo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-luxury-950 border border-white/[0.1] rounded-3xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-luxury-900/60">
              <h3 className="text-sm font-semibold text-white">
                3D Mannequin: {previewCombo.title}
              </h3>
              <button
                onClick={() => setPreviewCombo(null)}
                className="p-2 text-luxury-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <MannequinViewer
                shirt={previewCombo.shirt}
                pants={previewCombo.pants}
                shoes={previewCombo.shoes}
                bodyShape={bodyShape}
                onChangeBodyShape={setBodyShape}
                className="w-full h-[520px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
