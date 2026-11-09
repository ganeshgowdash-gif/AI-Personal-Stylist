'use client';

import React, { useState, useMemo } from 'react';
import { 
  Shirt, 
  Search, 
  Filter, 
  PlusCircle, 
  Sparkles, 
  SlidersHorizontal, 
  Heart, 
  Clock, 
  ArrowUpDown,
  X
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { UploadClothingModal } from '@/components/modals/UploadClothingModal';
import { WardrobeItem, ClothingCategory } from '@/types/database';
import { POPULAR_COLORS } from '@/lib/utils';

const CATEGORIES: { id: 'all' | ClothingCategory; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'tops', label: 'Tops & Shirts' },
  { id: 'bottoms', label: 'Pants & Bottoms' },
  { id: 'outerwear', label: 'Jackets & Outerwear' },
  { id: 'footwear', label: 'Shoes & Footwear' },
  { id: 'accessories', label: 'Accessories' },
];

export default function WardrobePage() {
  const { wardrobe, seedDemoWardrobe, isLoading } = useWardrobe();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | ClothingCategory>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'worn' | 'favorite'>('newest');

  // Modals
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filter & Sort Logic
  const filteredItems = useMemo(() => {
    return wardrobe
      .filter((item) => {
        // Category
        if (activeCategory !== 'all' && item.category !== activeCategory) return false;

        // Search query (name, subcategory, brand, style)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            item.name.toLowerCase().includes(q) ||
            item.subcategory.toLowerCase().includes(q) ||
            (item.brand && item.brand.toLowerCase().includes(q)) ||
            item.style.toLowerCase().includes(q) ||
            item.primary_color.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Color filter
        if (selectedColor !== 'all' && item.primary_color.toLowerCase() !== selectedColor.toLowerCase()) {
          return false;
        }

        // Style filter
        if (selectedStyle !== 'all' && item.style.toLowerCase() !== selectedStyle.toLowerCase()) {
          return false;
        }

        // Season filter
        if (selectedSeason !== 'all' && item.season !== 'all-season' && item.season !== selectedSeason) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'favorite') {
          return (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0);
        }
        if (sortBy === 'worn') {
          return (b.times_worn || 0) - (a.times_worn || 0);
        }
        // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [wardrobe, activeCategory, searchQuery, selectedColor, selectedStyle, selectedSeason, sortBy]);

  const hasActiveFilters = selectedColor !== 'all' || selectedStyle !== 'all' || selectedSeason !== 'all';

  const resetFilters = () => {
    setSelectedColor('all');
    setSelectedStyle('all');
    setSelectedSeason('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            My Digital Wardrobe
          </h1>
          <p className="text-xs text-luxury-400 mt-1">
            {wardrobe.length} cataloged pieces with real photographs and vision classification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {wardrobe.length === 0 && (
            <button
              onClick={seedDemoWardrobe}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all"
            >
              Seed Sample Wardrobe
            </button>
          )}

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-white/5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Clothing Item</span>
          </button>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'all' 
            ? wardrobe.length 
            : wardrobe.filter((i) => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-md shadow-white/5'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-luxury-300 border border-white/[0.06]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-luxury-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="p-4 rounded-2xl glass-card border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-luxury-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by garment name, brand, style, or color..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-luxury-500 focus:outline-none focus:border-white/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Color Filter */}
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-luxury-900 border border-white/[0.08] text-xs text-luxury-300 focus:outline-none focus:border-white/30"
          >
            <option value="all">All Colors</option>
            {POPULAR_COLORS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Style Filter */}
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-luxury-900 border border-white/[0.08] text-xs text-luxury-300 focus:outline-none focus:border-white/30"
          >
            <option value="all">All Styles</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="smart-casual">Smart Casual</option>
            <option value="sporty">Sporty</option>
            <option value="party">Party</option>
            <option value="traditional">Traditional</option>
          </select>

          {/* Season Filter */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-luxury-900 border border-white/[0.08] text-xs text-luxury-300 focus:outline-none focus:border-white/30"
          >
            <option value="all">All Seasons</option>
            <option value="summer">Summer</option>
            <option value="winter">Winter</option>
            <option value="spring">Spring</option>
            <option value="autumn">Autumn</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1 pl-2 border-l border-white/[0.08]">
            <ArrowUpDown className="w-3 h-3 text-luxury-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-luxury-900 border border-white/[0.08] text-xs text-white font-medium focus:outline-none focus:border-white/30"
            >
              <option value="newest">Recently Added</option>
              <option value="worn">Most Worn</option>
              <option value="favorite">Favorites First</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-luxury-400 hover:text-white px-2 py-1 rounded hover:bg-white/[0.05]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Wardrobe Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onClick={(it) => setSelectedItem(it)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl glass-card border border-white/[0.08] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-luxury-400 mx-auto">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">No items match your criteria</h3>
            <p className="text-xs text-luxury-400 max-w-sm mx-auto mt-1">
              Try adjusting your search filters or upload new clothing items to expand your wardrobe collection.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-opacity"
            >
              Upload Clothing
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <UploadClothingModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}

