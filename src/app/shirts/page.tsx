'use client';

import React, { useState, useMemo } from 'react';
import { Shirt, PlusCircle, Search, Filter, X } from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { UploadClothingModal } from '@/components/modals/UploadClothingModal';
import { WardrobeItem } from '@/types/database';

export default function ShirtsPage() {
  const { shirts } = useWardrobe();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const filteredShirts = useMemo(() => {
    return shirts.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.name && item.name.toLowerCase().includes(q)) ||
          item.item_type.toLowerCase().includes(q) ||
          item.primary_color.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedStyle !== 'all' && item.style !== selectedStyle) return false;
      return true;
    });
  }, [shirts, searchQuery, selectedStyle]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            My Shirts ({shirts.length})
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Formal shirts, casual shirts, t-shirts, polo t-shirts, and printed shirts.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Shirts</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-luxury-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shirts by color, type, or name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-luxury-500 focus:outline-none focus:border-white/30"
          />
        </div>

        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.08] text-xs text-luxury-300 focus:outline-none"
        >
          <option value="all">All Styles</option>
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
          <option value="smart-casual">Smart Casual</option>
          <option value="sporty">Sporty</option>
          <option value="party">Party</option>
        </select>
      </div>

      {/* Grid */}
      {filteredShirts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredShirts.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onClick={(it) => setSelectedItem(it)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-4">
          <Shirt className="w-10 h-10 text-luxury-500 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-white">No shirts in your wardrobe yet</h3>
            <p className="text-xs text-luxury-400 max-w-sm mx-auto mt-1">
              Add the shirts and t-shirts you own to see them texture onto your 3D mannequin.
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90"
          >
            Add Your First Shirt
          </button>
        </div>
      )}

      {/* Modals */}
      <UploadClothingModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultCategory="shirt"
      />

      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}

