'use client';

import React from 'react';
import { WardrobeItem } from '@/types/database';

interface InlineItemCardProps {
  item: WardrobeItem;
  onClick?: (item: WardrobeItem) => void;
}

export const InlineItemCard: React.FC<InlineItemCardProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(item)}
      className="inline-flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer group"
    >
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-luxury-900 shrink-0 border border-white/10">
        <img
          src={item.front_photo_url}
          alt={item.name || item.item_type}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="text-left overflow-hidden">
        <p className="text-[11px] font-semibold text-white truncate max-w-[140px] group-hover:text-luxury-200">
          {item.name || `${item.primary_color} ${item.item_type}`}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: item.primary_color_hex }}
          />
          <span className="text-[9px] text-luxury-400 capitalize truncate">
            {item.primary_color} • {item.item_type}
          </span>
        </div>
      </div>
    </div>
  );
};
