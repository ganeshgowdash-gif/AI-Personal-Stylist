'use client';

import React, { useState, useMemo } from 'react';
import { Scissors, PlusCircle, Search } from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { UploadClothingModal } from '@/components/modals/UploadClothingModal';
import { WardrobeItem } from '@/types/database';

export default function PantsPage() {
  const { pants } = useWardrobe();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const filteredPants = useMemo(() => {
    return pants.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.name && item.name.toLowerCase().includes(q)) ||
          item.item_type.toLowerCase().includes(q) ||
          item.primary_color.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedType !== 'all' && item.item_type !== selectedType) return false;
      return true;
    });
  }, [pants, searchQuery, selectedType]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            My Pants ({pants.length})
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            Jeans, chinos, formal trousers, joggers, and shorts.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Pants</span>
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
            placeholder="Search pants by color, type (jeans, chinos, trousers)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-luxury-500 focus:outline-none focus:border-white/30"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.08] text-xs text-luxury-300 focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="jeans">Jeans</option>
          <option value="chinos">Chinos</option>
          <option value="formal trousers">Formal Trousers</option>
          <option value="joggers">Joggers</option>
          <option value="shorts">Shorts</option>
        </select>
      </div>

      {/* Grid */}
      {filteredPants.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPants.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onClick={(it) => setSelectedItem(it)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-4">
          <Scissors className="w-10 h-10 text-luxury-500 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-white">No pants in your wardrobe yet</h3>
            <p className="text-xs text-luxury-400 max-w-sm mx-auto mt-1">
              Upload your jeans, chinos, and trousers with front and back photos for 3D preview.
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90"
          >
            Add Your First Pants
          </button>
        </div>
      )}

      {/* Modals */}
      <UploadClothingModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultCategory="pants"
      />

      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}

