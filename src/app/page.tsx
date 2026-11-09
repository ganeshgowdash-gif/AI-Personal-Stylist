'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shirt, 
  Sparkles, 
  Footprints, 
  Watch, 
  Bookmark, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Plus,
  Eye,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { VirtualPreviewModal } from '@/components/modals/VirtualPreviewModal';
import { OccasionSelectorModal } from '@/components/modals/OccasionSelectorModal';
import { WardrobeItem, OutfitCombination } from '@/types/database';

export default function DashboardPage() {
  const { 
    wardrobe, 
    savedOutfits, 
    shoppingRecommendations, 
    recentSuggestions, 
    seedDemoWardrobe,
    isLoading 
  } = useWardrobe();

  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [previewOutfit, setPreviewOutfit] = useState<OutfitCombination | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  // Statistics calculation
  const totalItems = wardrobe.length;
  const topsCount = wardrobe.filter((i) => i.category === 'tops').length;
  const bottomsCount = wardrobe.filter((i) => i.category === 'bottoms').length;
  const shoesCount = wardrobe.filter((i) => i.category === 'footwear').length;
  const accessoriesCount = wardrobe.filter((i) => i.category === 'accessories').length;
  const footwearAndAccessories = shoesCount + accessoriesCount;
  const favoritesCount = wardrobe.filter((i) => i.is_favorite).length;

  const recentlyAdded = [...wardrobe]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Identify Missing Essentials
  const missingAlerts: string[] = [];
  if (topsCount === 0) missingAlerts.push('Essential tops (Shirts, Tees)');
  if (bottomsCount === 0) missingAlerts.push('Staple bottoms (Chinos, Jeans)');
  if (shoesCount === 0) missingAlerts.push('Versatile footwear (Sneakers, Loafers)');
  if (accessoriesCount === 0) missingAlerts.push('Accents (Watch, Belt)');

  const topOutfit = recentSuggestions[0] || (savedOutfits[0]?.outfit ?? null);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-luxury-900 via-luxury-950 to-luxury-900 border border-white/[0.08] shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-white/10 text-luxury-200 backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Wardrobe Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            Curated Elegance, <br className="hidden sm:inline" />
            Engineered for Your Day.
          </h1>

          <p className="text-xs sm:text-sm text-luxury-300 leading-relaxed max-w-xl">
            Welcome to your personal AI styling studio. Every recommendation is verified against your actual wardrobe pieces with color harmony and occasion fit.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-white/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggest My Outfit</span>
            </button>

            <Link
              href="/wardrobe"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all"
            >
              <Shirt className="w-3.5 h-3.5 text-luxury-300" />
              <span>Manage Wardrobe</span>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />
      </div>

      {/* Wardrobe Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Clothes */}
        <div className="p-5 rounded-2xl glass-card border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-luxury-400 uppercase tracking-wider">
              Total Pieces
            </span>
            <p className="text-2xl font-bold font-serif text-white">{totalItems}</p>
            <p className="text-[11px] text-luxury-500">
              {topsCount} tops • {bottomsCount} bottoms
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Shirt className="w-5 h-5" />
          </div>
        </div>

        {/* Shoes & Accessories */}
        <div className="p-5 rounded-2xl glass-card border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-luxury-400 uppercase tracking-wider">
              Shoes & Accs
            </span>
            <p className="text-2xl font-bold font-serif text-white">{footwearAndAccessories}</p>
            <p className="text-[11px] text-luxury-500">
              {shoesCount} shoes • {accessoriesCount} accs
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Footprints className="w-5 h-5" />
          </div>
        </div>

        {/* Saved / Favorites */}
        <div className="p-5 rounded-2xl glass-card border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-luxury-400 uppercase tracking-wider">
              Saved Outfits
            </span>
            <p className="text-2xl font-bold font-serif text-white">{savedOutfits.length}</p>
            <p className="text-[11px] text-luxury-500">{favoritesCount} favorite items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-300">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>

        {/* Shopping Opportunities */}
        <div className="p-5 rounded-2xl glass-card border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-luxury-400 uppercase tracking-wider">
              Smart Shopping
            </span>
            <p className="text-2xl font-bold font-serif text-emerald-400">
              {shoppingRecommendations.length}
            </p>
            <p className="text-[11px] text-luxury-500">Wardrobe gap items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Outfit Suggestion + Missing Essentials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Featured Outfit (Left) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-luxury-400">
                Today&apos;s Featured Recommendation
              </span>
            </div>
            <Link
              href="/suggestions"
              className="text-xs font-medium text-luxury-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Explore all tiers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topOutfit ? (
            <div className="rounded-3xl glass-card border border-white/[0.08] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white">
                    {topOutfit.title}
                  </span>
                  <p className="text-xs text-luxury-400 mt-1">Occasion: {topOutfit.occasion}</p>
                </div>

                <button
                  onClick={() => setPreviewOutfit(topOutfit)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-all shadow-md"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Virtual Preview</span>
                </button>
              </div>

              {/* Pieces Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Top', item: topOutfit.top_item },
                  { label: 'Bottom', item: topOutfit.bottom_item },
                  { label: 'Shoes', item: topOutfit.footwear_item },
                  { label: 'Outerwear', item: topOutfit.outerwear_item },
                ]
                  .filter((p) => p.item)
                  .map(({ label, item }) => (
                    <div
                      key={label}
                      className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-luxury-900 mb-1.5 border border-white/5">
                        <img
                          src={item?.photo_url}
                          alt={item?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[10px] font-mono uppercase text-luxury-400">{label}</p>
                      <p className="text-xs font-semibold text-white truncate">{item?.name}</p>
                    </div>
                  ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs text-luxury-300 leading-relaxed">
                  {topOutfit.color_harmony_explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl glass-card border border-white/[0.08] p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-luxury-500 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No outfit generated yet</h3>
              <p className="text-xs text-luxury-400 max-w-sm mx-auto">
                Click &quot;Suggest My Outfit&quot; to pick an occasion and receive 3 personalized outfits from your clothes.
              </p>
              <button
                onClick={() => setIsSuggestModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black"
              >
                Curate Today&apos;s Outfit
              </button>
            </div>
          )}
        </div>

        {/* Missing Essentials & Smart Shopping Gaps (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-luxury-400">
              Wardrobe Gap Audit
            </span>
            <Link
              href="/shopping"
              className="text-xs font-medium text-luxury-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Smart Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-3xl glass-card border border-white/[0.08] space-y-4">
            {missingAlerts.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Missing Fundamental Categories</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  To maximize multi-occasion outfit variety, consider uploading: {missingAlerts.join(', ')}.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <span className="text-xs font-semibold text-white block">
                Top Priority Additions (Versatility Rated)
              </span>

              {shoppingRecommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                >
                  <div className="space-y-0.5 max-w-[200px]">
                    <p className="text-xs font-semibold text-white truncate">{rec.item_name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      +{rec.enabled_outfits_count} outfits enabled • {rec.versatility_rating}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-white/10 text-white">
                    {rec.verdict}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/shopping"
              className="block w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all"
            >
              View Full Shopping Analysis & Check In-Store Items
            </Link>
          </div>
        </div>
      </div>

      {/* Recently Added Clothes Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recently Added Clothes</h3>
            <p className="text-xs text-luxury-400">Your latest wardrobe additions with AI classification</p>
          </div>
          <Link
            href="/wardrobe"
            className="text-xs font-medium text-luxury-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All ({totalItems})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyAdded.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onClick={(it) => setSelectedItem(it)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-card rounded-2xl">
            <p className="text-xs text-luxury-500">Your wardrobe is empty.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <VirtualPreviewModal
        isOpen={Boolean(previewOutfit)}
        onClose={() => setPreviewOutfit(null)}
        outfit={previewOutfit}
      />

      <OccasionSelectorModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />
    </div>
  );
}
