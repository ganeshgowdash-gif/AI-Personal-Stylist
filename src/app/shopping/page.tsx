'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Tag, 
  ShieldCheck, 
  AlertCircle,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { CheckBeforeBuyingModal } from '@/components/modals/CheckBeforeBuyingModal';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { WardrobeItem, ShoppingRecommendation } from '@/types/database';

export default function SmartShoppingPage() {
  const { shoppingRecommendations, wardrobe, refreshShoppingRecommendations } = useWardrobe();

  const [isCheckBeforeBuyingOpen, setIsCheckBeforeBuyingOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Wardrobe Gap Analysis
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Smart Shopping Assistant
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Prioritizing versatility, cost-per-wear, and genuine utility over transient trends.
          </p>
        </div>

        {/* Check Before Buying Button */}
        <button
          onClick={() => setIsCheckBeforeBuyingOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-white/10"
        >
          <Camera className="w-4 h-4" />
          <span>Check Before Buying In-Store</span>
        </button>
      </div>

      {/* Feature Showcase Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-luxury-900 to-luxury-950 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Standing in a clothing store right now?</span>
          </div>
          <p className="text-xs text-luxury-300 leading-relaxed">
            Snap a photo of any shirt, jacket, or shoes. AI will check for duplicates, count how many new outfits it unlocks with your current clothes, and give you an objective Buy / Don&apos;t Buy verdict.
          </p>
        </div>

        <button
          onClick={() => setIsCheckBeforeBuyingOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.1] transition-all shrink-0"
        >
          Upload Store Item Photo
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Recommended Additions ({shoppingRecommendations.length})
            </h2>
            <p className="text-xs text-luxury-400">
              Ranked by outfit multiplier score and compatibility with your {wardrobe.length} items
            </p>
          </div>
        </div>

        {shoppingRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shoppingRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-3xl glass-card border border-white/[0.08] p-6 space-y-5 flex flex-col justify-between"
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rec.color_hex }} />
                        <span className="text-[11px] font-mono uppercase text-luxury-400">
                          {rec.color} • {rec.category}
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-white tracking-wide">
                        {rec.item_name}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                        rec.verdict === 'Must Buy'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/10 text-luxury-200 border-white/20'
                      }`}
                    >
                      {rec.verdict}
                    </span>
                  </div>

                  <p className="text-xs text-luxury-300 leading-relaxed">
                    {rec.reasoning}
                  </p>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-luxury-500 uppercase block">
                      Outfit Multiplier
                    </span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                      +{rec.enabled_outfits_count} New Combinations
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-luxury-500 uppercase block">
                      Versatility Index
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {rec.versatility_rating}
                    </span>
                  </div>
                </div>

                {/* Color compatibility & Occasions */}
                <div className="space-y-2 pt-2 border-t border-white/[0.05] text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-luxury-400 uppercase block mb-1">
                      Harmonizes With:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.color_compatibility.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] text-luxury-300 border border-white/[0.06]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-mono text-luxury-400 uppercase block mb-1">
                      Supported Occasions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.supported_occasions.map((occ) => (
                        <span
                          key={occ}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] text-luxury-300 border border-white/[0.06]"
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Matching Wardrobe Pieces */}
                {rec.matching_items && rec.matching_items.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-luxury-400 uppercase block mb-2">
                      Pairs with your existing ({rec.matching_items.length}) items:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {rec.matching_items.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="w-10 h-10 rounded-xl overflow-hidden bg-luxury-900 border border-white/10 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          title={item.name}
                        >
                          <img
                            src={item.photo_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-card rounded-2xl">
            <p className="text-xs text-luxury-400">
              Your wardrobe is thoroughly equipped across all staple categories!
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CheckBeforeBuyingModal
        isOpen={isCheckBeforeBuyingOpen}
        onClose={() => setIsCheckBeforeBuyingOpen(false)}
      />

      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}

