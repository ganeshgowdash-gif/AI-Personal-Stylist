'use client';

import React from 'react';
import { Heart, Clock } from 'lucide-react';
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
      className="group relative rounded-2xl glass-card overflow-hidden cursor-pointer flex flex-col justify-between border border-white/[0.06] hover:border-white/20 transition-all"
    >
      {/* Original Photo Display */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-luxury-900">
        <img
          src={item.front_photo_url}
          alt={item.name || item.primary_color}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
            {item.category}
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
                : 'bg-black/50 text-white/70 hover:text-white border border-white/10 hover:scale-110'
            }`}
          >
            <Heart className={`w-3 h-3 ${item.is_favorite ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Back Photo Indicator if available */}
        {item.back_photo_url && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-mono bg-black/60 text-luxury-300 border border-white/10">
            Front + Back
          </div>
        )}

        {/* Times Worn */}
        {item.times_worn > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-black/70 text-luxury-300 border border-white/10 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>{item.times_worn}x</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3 space-y-1.5">
        <div>
          <h4 className="text-xs font-semibold text-white tracking-wide truncate group-hover:text-luxury-200">
            {item.name || `${item.primary_color} ${item.item_type}`}
          </h4>
          <p className="text-[10px] text-luxury-400 capitalize truncate">{item.item_type}</p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/20"
              style={{ backgroundColor: item.primary_color_hex }}
            />
            <span className="text-[10px] text-luxury-300 capitalize truncate max-w-[80px]">
              {item.primary_color}
            </span>
          </div>

          <span className="text-[9px] font-mono uppercase text-luxury-500 px-1 py-0.5 rounded bg-white/[0.02]">
            {item.style}
          </span>
        </div>
      </div>
    </div>
  );
};
