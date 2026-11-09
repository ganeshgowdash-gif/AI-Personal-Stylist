'use client';

import React from 'react';
import { Heart, Clock, Sparkles } from 'lucide-react';
import { WardrobeItem } from '@/types/database';
import { useWardrobe } from '@/context/WardrobeContext';

interface ClothingCardProps {
  item: WardrobeItem;
  onClick: (item: WardrobeItem) => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({ item, onClick }) => {
  const { toggleFavorite } = useWardrobe();

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative rounded-2xl glass-card overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      {/* Image Showcase */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-luxury-900">
        <img
          src={item.photo_url}
          alt={item.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
            {item.subcategory}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              item.is_favorite
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-black/40 text-white/70 hover:text-white border border-white/10 hover:scale-110'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Times Worn overlay on bottom right */}
        {item.times_worn > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/70 backdrop-blur-md text-luxury-300 border border-white/10 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>{item.times_worn}x</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3.5 space-y-2">
        <div>
          <h4 className="text-xs font-semibold text-white tracking-wide truncate group-hover:text-luxury-200 transition-colors">
            {item.name}
          </h4>
          {item.brand && (
            <p className="text-[11px] text-luxury-400 font-medium truncate">{item.brand}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/30"
              style={{ backgroundColor: item.primary_color_hex }}
            />
            <span className="text-[11px] text-luxury-300 capitalize">{item.primary_color}</span>
          </div>

          <span className="text-[10px] font-mono uppercase text-luxury-500 px-1.5 py-0.5 rounded bg-white/[0.03]">
            {item.style}
          </span>
        </div>
      </div>
    </div>
  );
};
