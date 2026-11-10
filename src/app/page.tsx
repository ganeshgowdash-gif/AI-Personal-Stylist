'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shirt, 
  Scissors, 
  Footprints, 
  Sparkles, 
  Shuffle, 
  Eye, 
  Bookmark, 
  PlusCircle, 
  ArrowRight,
  Layers,
  Clock
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { UploadClothingModal } from '@/components/modals/UploadClothingModal';
import { WardrobeItem, WardrobeCategory } from '@/types/database';

export default function DashboardPage() {
  const { 
    wardrobe, 
    shirts, 
    pants, 
    shoes, 
    savedOutfits, 
    isLoading 
  } = useWardrobe();

  const [uploadCategory, setUploadCategory] = useState<WardrobeCategory>('shirt');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const openUpload = (cat: WardrobeCategory) => {
    setUploadCategory(cat);
    setIsUploadOpen(true);
  };

  const recentlyUploaded = [...wardrobe]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  // EMPTY WARDROBE WELCOME STATE
  if (wardrobe.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        {/* Welcome Empty State Banner */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-white/[0.08] text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto shadow-sm">
            <Shirt className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Welcome to your personal wardrobe.
            </h1>
            <p className="text-xs sm:text-sm text-luxury-400 max-w-md mx-auto leading-relaxed">
              Your wardrobe is empty. Add the clothes you already own to get started.
            </p>
          </div>

          {/* Three Primary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => openUpload('shirt')}
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all group"
            >
              <Shirt className="w-6 h-6 text-white group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-semibold text-white tracking-wider uppercase">
                ADD YOUR SHIRTS
              </span>
              <span className="text-[10px] text-luxury-500 mt-1">Front &amp; Back photo</span>
            </button>

            <button
              onClick={() => openUpload('pants')}
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all group"
            >
              <Scissors className="w-6 h-6 text-white group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-semibold text-white tracking-wider uppercase">
                ADD YOUR PANTS
              </span>
              <span className="text-[10px] text-luxury-500 mt-1">Jeans, Chinos, Trousers</span>
            </button>

            <button
              onClick={() => openUpload('shoes')}
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all group"
            >
              <Footprints className="w-6 h-6 text-white group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-semibold text-white tracking-wider uppercase">
                ADD YOUR SHOES
              </span>
              <span className="text-[10px] text-luxury-500 mt-1">Sneakers, Formal, Loafers</span>
            </button>
          </div>

          {/* Real Initial Database Counts (strictly 0) */}
          <div className="pt-4 border-t border-white/[0.05] grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="font-mono text-base font-bold text-white block">0</span>
              <span className="text-[10px] text-luxury-500 uppercase">Shirts</span>
            </div>
            <div>
              <span className="font-mono text-base font-bold text-white block">0</span>
              <span className="text-[10px] text-luxury-500 uppercase">Pants</span>
            </div>
            <div>
              <span className="font-mono text-base font-bold text-white block">0</span>
              <span className="text-[10px] text-luxury-500 uppercase">Shoes</span>
            </div>
            <div>
              <span className="font-mono text-base font-bold text-white block">0</span>
              <span className="text-[10px] text-luxury-500 uppercase">Total Items</span>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadClothingModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          defaultCategory={uploadCategory}
        />
      </div>
    );
  }

  // ACTIVE DASHBOARD (Real Database Counts)
  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Personal Digital Wardrobe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            My Wardrobe Overview
          </h1>
          <p className="text-xs text-luxury-400 max-w-md">
            Backed by real database queries. Explore combinations on your 3D mannequin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/suggestions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggest My Outfit</span>
          </Link>
          <Link
            href="/mix-and-match"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Mix &amp; Match</span>
          </Link>
        </div>
      </div>

      {/* Real Database Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Shirts */}
        <Link
          href="/shirts"
          className="p-4 rounded-2xl glass-card border border-white/[0.06] hover:border-white/20 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-luxury-400 uppercase">Shirts</span>
            <Shirt className="w-4 h-4 text-luxury-300" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{shirts.length}</p>
          <span className="text-[10px] text-luxury-500 mt-1">View Collection &rarr;</span>
        </Link>

        {/* Total Pants */}
        <Link
          href="/pants"
          className="p-4 rounded-2xl glass-card border border-white/[0.06] hover:border-white/20 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-luxury-400 uppercase">Pants</span>
            <Scissors className="w-4 h-4 text-luxury-300" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{pants.length}</p>
          <span className="text-[10px] text-luxury-500 mt-1">View Collection &rarr;</span>
        </Link>

        {/* Total Shoes */}
        <Link
          href="/shoes"
          className="p-4 rounded-2xl glass-card border border-white/[0.06] hover:border-white/20 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-luxury-400 uppercase">Shoes</span>
            <Footprints className="w-4 h-4 text-luxury-300" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{shoes.length}</p>
          <span className="text-[10px] text-luxury-500 mt-1">View Collection &rarr;</span>
        </Link>

        {/* Total Items */}
        <div className="p-4 rounded-2xl glass-card border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-luxury-400 uppercase">Total Items</span>
            <Layers className="w-4 h-4 text-luxury-300" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{wardrobe.length}</p>
          <span className="text-[10px] text-luxury-500 mt-1">Verified Pieces</span>
        </div>

        {/* Saved Combinations */}
        <div className="p-4 rounded-2xl glass-card border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-luxury-400 uppercase">Saved Outfits</span>
            <Bookmark className="w-4 h-4 text-luxury-300" />
          </div>
          <p className="text-2xl font-serif font-bold text-white">{savedOutfits.length}</p>
          <span className="text-[10px] text-luxury-500 mt-1">Saved Combos</span>
        </div>
      </div>

      {/* 3D Mannequin Quick Launch & Mix & Match Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/preview"
          className="p-6 rounded-3xl glass-card border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-xs font-mono uppercase text-luxury-300">Interactive 3D Engine</span>
            </div>
            <h3 className="text-base font-serif font-bold text-white">3D Outfit Preview</h3>
            <p className="text-xs text-luxury-400 max-w-xs">
              View your exact clothes on the rotatable faceless mannequin.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/mix-and-match"
          className="p-6 rounded-3xl glass-card border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-white" />
              <span className="text-xs font-mono uppercase text-luxury-300">Combinations Explorer</span>
            </div>
            <h3 className="text-base font-serif font-bold text-white">
              Mix &amp; Match ({shirts.length * pants.length * shoes.length} Combos)
            </h3>
            <p className="text-xs text-luxury-400 max-w-xs">
              Calculate all possible combinations from your wardrobe dynamically.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Recently Uploaded Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">
              Recently Uploaded Clothes
            </h2>
            <p className="text-xs text-luxury-400">Your original photographs stored in your private vault</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {recentlyUploaded.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onClick={(it) => setSelectedItem(it)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <UploadClothingModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultCategory={uploadCategory}
      />

      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
