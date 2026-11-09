'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  AlertTriangle,
  History,
  CheckCircle2
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { CalendarView } from '@/components/planner/CalendarView';
import { OccasionSelectorModal } from '@/components/modals/OccasionSelectorModal';
import { VirtualPreviewModal } from '@/components/modals/VirtualPreviewModal';
import { OutfitCombination } from '@/types/database';
import { formatDate } from '@/lib/utils';

export default function OutfitPlannerPage() {
  const { outfitHistory, savedOutfits } = useWardrobe();

  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [previewOutfit, setPreviewOutfit] = useState<OutfitCombination | null>(null);

  const handleOpenSuggestForDate = (date: string, occasion: string) => {
    setIsSuggestModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-luxury-200">
              Wardrobe Schedule
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Wardrobe Outfit Planner
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Plan college and office schedules in advance, prevent premature outfit repeats, and log worn history.
          </p>
        </div>

        <button
          onClick={() => setIsSuggestModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-white/5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Outfit Suggestion</span>
        </button>
      </div>

      {/* Interactive Calendar Strip */}
      <CalendarView
        onOpenSuggestForDate={handleOpenSuggestForDate}
        onOpenPreview={(o) => setPreviewOutfit(o)}
      />

      {/* Worn History & Saved Combinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Worn History */}
        <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-luxury-300" />
              <span>Recently Worn History</span>
            </h3>
            <span className="text-[10px] font-mono text-luxury-500">
              {outfitHistory.length} Recorded
            </span>
          </div>

          {outfitHistory.length > 0 ? (
            <div className="space-y-3">
              {outfitHistory.slice(0, 4).map((hist) => (
                <div
                  key={hist.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-white">
                      {hist.outfit?.title || 'Custom Outfit'}
                    </p>
                    <p className="text-[11px] text-luxury-400">
                      {hist.occasion} • Worn on {formatDate(hist.worn_date)}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Logged
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-luxury-500">
              No worn outfits recorded yet. When you mark an outfit as worn, it appears here to help prevent premature repeats.
            </div>
          )}
        </div>

        {/* Favorite Saved Combinations */}
        <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Saved Combinations</span>
            </h3>
            <span className="text-[10px] font-mono text-luxury-500">
              {savedOutfits.length} Saved
            </span>
          </div>

          {savedOutfits.length > 0 ? (
            <div className="space-y-3">
              {savedOutfits.slice(0, 4).map((saved) => (
                <div
                  key={saved.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-white">
                      {saved.custom_name || saved.outfit?.title || 'Favorite Outfit'}
                    </p>
                    <p className="text-[11px] text-luxury-400">
                      {saved.outfit?.occasion} • {saved.outfit?.tier.replace('_', ' ')}
                    </p>
                  </div>

                  {saved.outfit && (
                    <button
                      onClick={() => setPreviewOutfit(saved.outfit!)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white text-white hover:text-black transition-colors"
                    >
                      Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-luxury-500">
              Save your favorite generated outfits to quickly schedule them on calendar days.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OccasionSelectorModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />

      <VirtualPreviewModal
        isOpen={Boolean(previewOutfit)}
        onClose={() => setPreviewOutfit(null)}
        outfit={previewOutfit}
      />
    </div>
  );
}
