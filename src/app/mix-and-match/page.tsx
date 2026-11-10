'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Shuffle, 
  Sparkles, 
  Eye, 
  Bookmark, 
  Check, 
  SlidersHorizontal, 
  Filter, 
  Shirt, 
  Scissors, 
  Footprints,
  Dices
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { OutfitCombination, WardrobeItem } from '@/types/database';
import { MannequinViewer } from '@/components/mannequin/MannequinViewer';

export default function MixAndMatchPage() {
  const { 
    shirts, 
    pants, 
    shoes, 
    generateAllMixAndMatch, 
    generateSurpriseMe, 
    activeMannequinOutfit, 
    setActiveMannequinOutfit,
    saveOutfit,
    bodyShape,
    setBodyShape
  } = useWardrobe();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCombination, setSelectedCombination] = useState<OutfitCombination | null>(null);
  const [showMannequinModal, setShowMannequinModal] = useState(false);
  const [surpriseNotice, setSurpriseNotice] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Manual Picker selections
  const [pickedShirt, setPickedShirt] = useState<WardrobeItem | null>(activeMannequinOutfit.shirt || shirts[0] || null);
  const [pickedPants, setPickedPants] = useState<WardrobeItem | null>(activeMannequinOutfit.pants || pants[0] || null);
  const [pickedShoes, setPickedShoes] = useState<WardrobeItem | null>(activeMannequinOutfit.shoes || shoes[0] || null);

  // Dynamic combinations calculation: shirts × pants × shoes
  const allCombinations = useMemo(() => {
    return generateAllMixAndMatch(activeFilter);
  }, [generateAllMixAndMatch, activeFilter]);

  const totalCalculated = shirts.length * pants.length * shoes.length;

  const handleApplyManualSelection = () => {
    if (!pickedShirt || !pickedPants || !pickedShoes) return;
    setActiveMannequinOutfit({
      shirt: pickedShirt,
      pants: pickedPants,
      shoes: pickedShoes,
    });
    setShowMannequinModal(true);
  };

  const handleSelectCombo = (combo: OutfitCombination) => {
    setSelectedCombination(combo);
    if (combo.shirt && combo.pants && combo.shoes) {
      setActiveMannequinOutfit({
        shirt: combo.shirt,
        pants: combo.pants,
        shoes: combo.shoes,
      });
    }
    setShowMannequinModal(true);
  };

  const handleSurpriseMe = () => {
    const random = generateSurpriseMe();
    if (random) {
      setSelectedCombination(random);
      setSurpriseNotice(random.why_they_match);
      setShowMannequinModal(true);
      setTimeout(() => setSurpriseNotice(null), 5000);
    }
  };

  const handleSave = async (combo: OutfitCombination) => {
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
              Combinatorics Engine
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Mix &amp; Match
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Explore every possible outfit from your wardrobe ({totalCalculated} combinations).
          </p>
        </div>

        {/* Surprise Me & View 3D */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSurpriseMe}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-md shadow-white/5"
          >
            <Dices className="w-4 h-4 text-black" />
            <span>Surprise Me</span>
          </button>

          <Link
            href="/preview"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Studio</span>
          </Link>
        </div>
      </div>

      {surpriseNotice && (
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/20 text-xs text-white flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-white shrink-0" />
          <span>{surpriseNotice}</span>
        </div>
      )}

      {/* 1. Interactive Three-Column Selector (My Shirts, My Pants, My Shoes) */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">
            Custom Mix: Pick 1 Shirt + 1 Pants + 1 Shoes
          </h2>
          <button
            onClick={handleApplyManualSelection}
            disabled={!pickedShirt || !pickedPants || !pickedShoes}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View on 3D Mannequin</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shirts Column */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-luxury-400 block">
              My Shirts ({shirts.length})
            </span>
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {shirts.map((s) => {
                const isSelected = pickedShirt?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setPickedShirt(s)}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all relative ${
                      isSelected ? 'border-white ring-2 ring-white/30 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={s.front_photo_url} alt="Shirt" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 p-0.5 rounded-full bg-white text-black">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pants Column */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-luxury-400 block">
              My Pants ({pants.length})
            </span>
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {pants.map((p) => {
                const isSelected = pickedPants?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPickedPants(p)}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all relative ${
                      isSelected ? 'border-white ring-2 ring-white/30 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.front_photo_url} alt="Pants" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 p-0.5 rounded-full bg-white text-black">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shoes Column */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-luxury-400 block">
              My Shoes ({shoes.length})
            </span>
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {shoes.map((sh) => {
                const isSelected = pickedShoes?.id === sh.id;
                return (
                  <div
                    key={sh.id}
                    onClick={() => setPickedShoes(sh)}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all relative ${
                      isSelected ? 'border-white ring-2 ring-white/30 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={sh.front_photo_url} alt="Shoes" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 p-0.5 rounded-full bg-white text-black">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. All Generated Combinations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">
              All Calculated Combinations ({allCombinations.length})
            </h2>
            <p className="text-xs text-luxury-400">
              Formed dynamically from your real wardrobe: {shirts.length} shirts × {pants.length} pants × {shoes.length} shoes = {totalCalculated} total.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Combos' },
              { id: 'best', label: 'Best Colour Matches' },
              { id: 'casual', label: 'Casual' },
              { id: 'formal', label: 'Formal' },
              { id: 'party', label: 'Party' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/[0.04] text-luxury-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {allCombinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCombinations.slice(0, 36).map((combo) => (
              <div
                key={combo.id}
                className="p-4 rounded-3xl glass-card border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                    {combo.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                    ★ {combo.score}
                  </span>
                </div>

                {/* 3 Photos Thumbnail Row */}
                <div className="grid grid-cols-3 gap-2">
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

                <p className="text-[11px] text-luxury-400 leading-relaxed line-clamp-2">
                  {combo.why_they_match}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                  <button
                    onClick={() => handleSelectCombo(combo)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-luxury-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View on 3D Mannequin</span>
                  </button>

                  <button
                    onClick={() => handleSave(combo)}
                    className="p-1.5 rounded-lg text-luxury-400 hover:text-white transition-colors"
                    title="Save Outfit"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedSuccessId === combo.id ? 'fill-white text-white' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-2">
            <p className="text-xs text-luxury-400">
              Need at least 1 shirt, 1 pair of pants, and 1 pair of shoes to calculate combinations.
            </p>
          </div>
        )}
      </div>

      {/* 3D Mannequin Inspection Modal */}
      {showMannequinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-luxury-950 border border-white/[0.1] rounded-3xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-luxury-900/60">
              <div>
                <h3 className="text-sm font-semibold text-white">3D Mannequin Preview</h3>
                <p className="text-[11px] text-luxury-400">
                  {activeMannequinOutfit.shirt?.name || activeMannequinOutfit.shirt?.primary_color} +{' '}
                  {activeMannequinOutfit.pants?.name || activeMannequinOutfit.pants?.primary_color} +{' '}
                  {activeMannequinOutfit.shoes?.name || activeMannequinOutfit.shoes?.primary_color}
                </p>
              </div>

              <button
                onClick={() => setShowMannequinModal(false)}
                className="p-2 text-luxury-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <MannequinViewer
                shirt={activeMannequinOutfit.shirt}
                pants={activeMannequinOutfit.pants}
                shoes={activeMannequinOutfit.shoes}
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

