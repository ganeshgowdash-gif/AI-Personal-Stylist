'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Eye, 
  Sparkles, 
  User, 
  RotateCcw, 
  Bookmark, 
  Check, 
  Shirt, 
  Scissors, 
  Footprints,
  Info,
  Shuffle
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { MannequinViewer } from '@/components/mannequin/MannequinViewer';
import { BodyShape, WardrobeItem } from '@/types/database';

function OutfitPreviewContent() {
  const searchParams = useSearchParams();
  const { 
    shirts, 
    pants, 
    shoes, 
    bodyShape, 
    setBodyShape, 
    activeMannequinOutfit, 
    setActiveMannequinOutfit,
    saveOutfit
  } = useWardrobe();

  const [isSaved, setIsSaved] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Sync from query params if navigated from Saved Outfits or Mix & Match
  useEffect(() => {
    const shirtId = searchParams.get('shirt');
    const pantsId = searchParams.get('pants');
    const shoesId = searchParams.get('shoes');

    if (shirtId || pantsId || shoesId) {
      const matchedShirt = shirtId ? shirts.find((s) => s.id === shirtId) : activeMannequinOutfit.shirt;
      const matchedPants = pantsId ? pants.find((p) => p.id === pantsId) : activeMannequinOutfit.pants;
      const matchedShoes = shoesId ? shoes.find((sh) => sh.id === shoesId) : activeMannequinOutfit.shoes;

      setActiveMannequinOutfit({
        shirt: matchedShirt || activeMannequinOutfit.shirt,
        pants: matchedPants || activeMannequinOutfit.pants,
        shoes: matchedShoes || activeMannequinOutfit.shoes,
      });
    }
  }, [searchParams, shirts, pants, shoes]);

  const selectedShirt = activeMannequinOutfit.shirt;
  const selectedPants = activeMannequinOutfit.pants;
  const selectedShoes = activeMannequinOutfit.shoes;

  const handleSelectShirt = (item: WardrobeItem) => {
    setActiveMannequinOutfit({ ...activeMannequinOutfit, shirt: item });
    setIsSaved(false);
  };

  const handleSelectPants = (item: WardrobeItem) => {
    setActiveMannequinOutfit({ ...activeMannequinOutfit, pants: item });
    setIsSaved(false);
  };

  const handleSelectShoes = (item: WardrobeItem) => {
    setActiveMannequinOutfit({ ...activeMannequinOutfit, shoes: item });
    setIsSaved(false);
  };

  const handleSaveCombination = async () => {
    if (!selectedShirt || !selectedPants || !selectedShoes) return;
    await saveOutfit(selectedShirt, selectedPants, selectedShoes, saveName.trim() || undefined);
    setIsSaved(true);
    setShowSaveModal(false);
    setSaveName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white border border-white/10">
              Interactive Three.js Engine
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            3D Mannequin Outfit Preview
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Rotate, inspect, and evaluate your authentic clothes rendered directly on an adjustable faceless mannequin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedShirt && selectedPants && selectedShoes && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved to Outfits' : 'Save this Combination'}</span>
            </button>
          )}

          <Link
            href="/mix-and-match"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Mix &amp; Match</span>
          </Link>
        </div>
      </div>

      {/* Main 3D Stage & Garment Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Mannequin Viewer (Left / Center) */}
        <div className="lg:col-span-8 flex flex-col">
          <MannequinViewer
            shirt={selectedShirt}
            pants={selectedPants}
            shoes={selectedShoes}
            bodyShape={bodyShape}
            onChangeBodyShape={setBodyShape}
            className="w-full h-[580px] bg-luxury-900/40"
          />
        </div>

        {/* Garment Selectors (Right) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl glass-card border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-white">Active Outfit Pieces</span>
              <span className="text-[10px] font-mono text-luxury-500">Tap to Change</span>
            </div>

            {/* 1. Shirt Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-luxury-400 font-medium flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-luxury-300" />
                  <span>Shirt</span>
                </span>
                <span className="text-white font-semibold truncate max-w-[140px]">
                  {selectedShirt?.name || (selectedShirt ? `${selectedShirt.primary_color} ${selectedShirt.item_type}` : 'None Selected')}
                </span>
              </div>

              {shirts.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {shirts.map((s) => {
                    const isSelected = selectedShirt?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectShirt(s)}
                        className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer border transition-all ${
                          isSelected
                            ? 'border-white scale-105 shadow-md shadow-white/20'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                        title={s.name || s.primary_color}
                      >
                        <img src={s.front_photo_url} alt="Shirt" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Link href="/shirts" className="block text-[11px] text-luxury-500 hover:text-white underline">
                  + Add shirts to your wardrobe
                </Link>
              )}
            </div>

            {/* 2. Pants Selector */}
            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-luxury-400 font-medium flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-luxury-300" />
                  <span>Pants</span>
                </span>
                <span className="text-white font-semibold truncate max-w-[140px]">
                  {selectedPants?.name || (selectedPants ? `${selectedPants.primary_color} ${selectedPants.item_type}` : 'None Selected')}
                </span>
              </div>

              {pants.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {pants.map((p) => {
                    const isSelected = selectedPants?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPants(p)}
                        className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer border transition-all ${
                          isSelected
                            ? 'border-white scale-105 shadow-md shadow-white/20'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                        title={p.name || p.primary_color}
                      >
                        <img src={p.front_photo_url} alt="Pants" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Link href="/pants" className="block text-[11px] text-luxury-500 hover:text-white underline">
                  + Add pants to your wardrobe
                </Link>
              )}
            </div>

            {/* 3. Shoes Selector */}
            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-luxury-400 font-medium flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-luxury-300" />
                  <span>Shoes</span>
                </span>
                <span className="text-white font-semibold truncate max-w-[140px]">
                  {selectedShoes?.name || (selectedShoes ? `${selectedShoes.primary_color} ${selectedShoes.item_type}` : 'None Selected')}
                </span>
              </div>

              {shoes.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {shoes.map((sh) => {
                    const isSelected = selectedShoes?.id === sh.id;
                    return (
                      <div
                        key={sh.id}
                        onClick={() => handleSelectShoes(sh)}
                        className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer border transition-all ${
                          isSelected
                            ? 'border-white scale-105 shadow-md shadow-white/20'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                        title={sh.name || sh.primary_color}
                      >
                        <img src={sh.front_photo_url} alt="Shoes" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Link href="/shoes" className="block text-[11px] text-luxury-500 hover:text-white underline">
                  + Add shoes to your wardrobe
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Outfit Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-luxury-950 border border-white/[0.1] rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Save Outfit Combination</h3>
            <p className="text-xs text-luxury-400">
              Save this combination to your personal collection to quickly reload on the 3D mannequin later.
            </p>

            <div>
              <label className="block text-xs text-luxury-300 mb-1">Custom Name (Optional)</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Monday College Ensemble"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-luxury-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCombination}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black"
              >
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutfitPreviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-luxury-400">Loading 3D Studio...</div>}>
      <OutfitPreviewContent />
    </Suspense>
  );
}
