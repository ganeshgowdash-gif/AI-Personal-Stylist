'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  Bookmark, 
  Check, 
  Calendar, 
  CheckCircle2, 
  Palette, 
  Compass, 
  Footprints, 
  Watch,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { OutfitCombination, WardrobeItem } from '@/types/database';
import { useWardrobe } from '@/context/WardrobeContext';

interface OutfitCardProps {
  outfit: OutfitCombination;
  allOutfits?: OutfitCombination[];
  onOpenPreview: (outfit: OutfitCombination) => void;
  onOpenPlanner?: (outfit: OutfitCombination) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  allOutfits = [],
  onOpenPreview,
  onOpenPlanner,
}) => {
  const { saveOutfit, unsaveOutfit, savedOutfits, markOutfitWorn } = useWardrobe();
  const [isWorn, setIsWorn] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isSaved = savedOutfits.some((s) => s.outfit_id === outfit.id);

  const handleToggleSave = async () => {
    if (isSaved) {
      await unsaveOutfit(outfit.id);
    } else {
      await saveOutfit(outfit);
    }
  };

  const handleMarkWorn = async () => {
    await markOutfitWorn(outfit);
    setIsWorn(true);
  };

  const tierBadgeStyle =
    outfit.tier === 'best_match'
      ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
      : outfit.tier === 'stylish_alternative'
      ? 'bg-purple-400/10 text-purple-300 border-purple-400/20'
      : 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';

  const items = [
    { label: 'Top', item: outfit.top_item },
    { label: 'Bottom', item: outfit.bottom_item },
    { label: 'Outerwear', item: outfit.outerwear_item },
    { label: 'Footwear', item: outfit.footwear_item },
  ].filter((p) => Boolean(p.item));

  return (
    <div className="rounded-3xl glass-card border border-white/[0.08] overflow-hidden flex flex-col justify-between">
      {/* Top Banner */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-luxury-900/40">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${tierBadgeStyle}`}>
            {outfit.title}
          </span>
          <span className="text-xs text-luxury-400 font-medium">for {outfit.occasion}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/10">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{outfit.score.toFixed(1)}/10</span>
        </div>
      </div>

      {/* Outfit Visual Composition Bar */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map(({ label, item }) => (
            <div
              key={label}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between group hover:border-white/20 transition-all"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-luxury-900 mb-2 border border-white/5">
                {item?.photo_url && (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 backdrop-blur-md text-white border border-white/10">
                  {label}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-white truncate">{item?.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-2 h-2 rounded-full border border-white/30"
                    style={{ backgroundColor: item?.primary_color_hex }}
                  />
                  <span className="text-[10px] text-luxury-400 capitalize truncate">
                    {item?.primary_color}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Accessories Row if present */}
        {outfit.accessory_items && outfit.accessory_items.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-luxury-400">
              <Watch className="w-3.5 h-3.5 text-luxury-300" />
              <span>Accessories:</span>
              <span className="text-white font-medium">
                {outfit.accessory_items.map((a) => `${a.primary_color} ${a.name}`).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Core Explanations Grid */}
        <div className="mt-5 space-y-3">
          {/* Color Harmony Explanation */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2 mb-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-semibold text-white">Color Harmony Rationale</span>
            </div>
            <p className="text-xs text-luxury-300 leading-relaxed">
              {outfit.color_harmony_explanation}
            </p>
          </div>

          {/* Occasion Suitability */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2 mb-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs font-semibold text-white">Occasion Fit</span>
            </div>
            <p className="text-xs text-luxury-300 leading-relaxed">
              {outfit.occasion_fit_explanation}
            </p>
          </div>

          {/* Toggleable Shoes & Accessories Rationale */}
          {showDetails && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Footprints className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-xs font-semibold text-white">Footwear Coordination</span>
                </div>
                <p className="text-xs text-luxury-300 leading-relaxed">
                  {outfit.shoes_fit_explanation}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Watch className="w-3.5 h-3.5 text-purple-300" />
                  <span className="text-xs font-semibold text-white">Accents & Finishing</span>
                </div>
                <p className="text-xs text-luxury-300 leading-relaxed">
                  {outfit.accessories_explanation}
                </p>
              </div>

              {outfit.general_styling_tips && (
                <p className="text-xs text-luxury-400 italic px-2">
                  Tip: {outfit.general_styling_tips}
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] font-medium text-luxury-400 hover:text-white transition-colors pt-1"
          >
            <span>{showDetails ? 'Hide Footwear & Styling Details' : 'Show Footwear & Styling Details'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/[0.06] bg-luxury-900/40 flex flex-wrap items-center justify-between gap-3">
        {/* Virtual Preview Trigger */}
        <button
          onClick={() => onOpenPreview(outfit)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-white/5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Virtual Outfit Preview</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Favorite / Save Toggle */}
          <button
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isSaved
                ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                : 'bg-white/[0.04] text-luxury-300 hover:text-white border-white/[0.08]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Mark as Worn */}
          <button
            onClick={handleMarkWorn}
            disabled={isWorn}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isWorn
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 cursor-default'
                : 'bg-white/[0.04] text-luxury-300 hover:text-white border-white/[0.08]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isWorn ? 'Worn Today' : 'Wear Today'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

