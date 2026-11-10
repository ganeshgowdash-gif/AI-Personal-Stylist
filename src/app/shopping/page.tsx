'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Info, 
  ArrowRight,
  Shirt,
  Scissors,
  Footprints
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';

export default function SmartShoppingPage() {
  const { loadShoppingAnalysis, shoppingRecommendations, wardrobe } = useWardrobe();
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleRunAnalysis = () => {
    loadShoppingAnalysis();
    setHasLoaded(true);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white border border-white/10">
              Optional Utility Audit
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Smart Shopping Assistant
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Identifies strategic missing staple pieces that multiply your existing wardrobe combinations. No ads.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>What Should I Buy?</span>
        </button>
      </div>

      {/* Intro Box */}
      <div className="p-5 rounded-3xl glass-card border border-white/[0.08] flex items-start gap-3">
        <Info className="w-5 h-5 text-luxury-300 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-luxury-300 leading-relaxed">
          <p className="font-semibold text-white">Dedicated &amp; Unobtrusive Feature</p>
          <p className="text-luxury-400">
            Smart Shopping appears strictly on this page upon request. It evaluates your current {wardrobe.length} items to detect gaps in versatile neutrals or foundational silhouettes that would unlock the highest number of new outfit combinations.
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      {hasLoaded && shoppingRecommendations.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white">
            Recommended Additions for Your Closet ({shoppingRecommendations.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shoppingRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-6 rounded-3xl glass-card border border-white/[0.08] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                      {rec.category}
                    </span>
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: rec.color_hex }} />
                  </div>

                  <div>
                    <h3 className="text-base font-serif font-bold text-white">{rec.item_name}</h3>
                    <p className="text-xs text-luxury-300 mt-1 leading-relaxed">{rec.why_useful}</p>
                  </div>

                  {/* Impact Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-[10px] text-luxury-500 font-mono uppercase block">Matches</span>
                      <span className="text-sm font-bold text-white block mt-0.5">
                        {rec.matching_items_count} Owned Items
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-[10px] text-luxury-500 font-mono uppercase block">New Combos</span>
                      <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                        +{rec.new_combinations_count} Outfits
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-luxury-400 block mb-1">
                      Supported Occasions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {rec.supported_occasions.map((occ) => (
                        <span key={occ} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-luxury-300">
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05] text-[11px] text-luxury-400">
                  <span>Versatility Rating: <strong>High</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hasLoaded ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-2">
          <p className="text-xs text-luxury-400">
            Your wardrobe already contains essential neutral staples across shirts, pants, and footwear!
          </p>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-3">
          <ShoppingBag className="w-10 h-10 text-luxury-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Wardrobe Gap Analysis Ready</h3>
          <p className="text-xs text-luxury-400 max-w-sm mx-auto">
            Click &quot;What Should I Buy?&quot; above to calculate missing items that will maximize your combinations.
          </p>
        </div>
      )}
    </div>
  );
}
