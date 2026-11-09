'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  Compass, 
  CheckCircle2, 
  SlidersHorizontal,
  Eye,
  Plus
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { OutfitCard } from '@/components/outfit/OutfitCard';
import { OccasionSelectorModal } from '@/components/modals/OccasionSelectorModal';
import { VirtualPreviewModal } from '@/components/modals/VirtualPreviewModal';
import { OutfitCombination } from '@/types/database';

export default function SuggestionsPage() {
  const { recentSuggestions, wardrobe } = useWardrobe();

  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(recentSuggestions.length === 0);
  const [previewOutfit, setPreviewOutfit] = useState<OutfitCombination | null>(null);

  const activeOccasion = recentSuggestions[0]?.occasion || 'Your Occasion';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-luxury-200">
              Personalized Stylist
            </span>
            {recentSuggestions.length > 0 && (
              <span className="text-xs text-luxury-400">Occasion: <strong className="text-white">{activeOccasion}</strong></span>
            )}
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            AI Outfit Recommendations
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Engineered strictly from your verified {wardrobe.length} wardrobe pieces. Zero invented clothes.
          </p>
        </div>

        <button
          onClick={() => setIsSuggestModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-white/5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curate For New Occasion</span>
        </button>
      </div>

      {recentSuggestions.length > 0 ? (
        <div className="space-y-8">
          {/* Missing pieces notice if flagged by AI */}
          {recentSuggestions[0]?.missing_pieces_notes && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Stylist Wardrobe Note:</span>
                <span>{recentSuggestions[0].missing_pieces_notes}</span>
              </div>
            </div>
          )}

          {/* 3 Outfit Cards (Outfit 1, 2, and 3) */}
          <div className="grid grid-cols-1 gap-6">
            {recentSuggestions.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                allOutfits={recentSuggestions}
                onOpenPreview={(o) => setPreviewOutfit(o)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-luxury-300 mx-auto">
            <Sparkles className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Ready to find your best outfit?
            </h3>
            <p className="text-xs text-luxury-400 max-w-md mx-auto mt-1">
              Select what occasion you are dressing for (College, Office, Party, Casual, Date, etc.) and AI will coordinate 3 balanced outfits with detailed color harmony and styling rationale.
            </p>
          </div>
          <button
            onClick={() => setIsSuggestModalOpen(true)}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-all shadow-lg shadow-white/10"
          >
            Select Occasion &amp; Style Me
          </button>
        </div>
      )}

      {/* Modals */}
      <OccasionSelectorModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />

      <VirtualPreviewModal
        isOpen={Boolean(previewOutfit)}
        onClose={() => setPreviewOutfit(null)}
        outfit={previewOutfit}
        allOutfits={recentSuggestions}
      />
    </div>
  );
}

