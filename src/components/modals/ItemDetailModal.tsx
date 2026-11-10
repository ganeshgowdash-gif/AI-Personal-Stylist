'use client';

import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  Check, 
  Clock, 
  Camera, 
  Eye, 
  Shirt, 
  Scissors, 
  Footprints 
} from 'lucide-react';
import { WardrobeItem, ClothingPattern, ClothingStyle } from '@/types/database';
import { useWardrobe } from '@/context/WardrobeContext';
import { formatDate } from '@/lib/utils';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WardrobeItem | null;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { updateItem, deleteItem, toggleFavorite, recordItemWorn } = useWardrobe();

  if (!isOpen || !item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name || '');
  const [itemType, setItemType] = useState(item.item_type);
  const [primaryColor, setPrimaryColor] = useState(item.primary_color);
  const [primaryColorHex, setPrimaryColorHex] = useState(item.primary_color_hex);
  const [pattern, setPattern] = useState<ClothingPattern>(item.pattern);
  const [style, setStyle] = useState<ClothingStyle>(item.style);
  const [notes, setNotes] = useState(item.notes || '');

  const handleSave = async () => {
    await updateItem(item.id, {
      name: name.trim() || null,
      item_type: itemType,
      primary_color: primaryColor,
      primary_color_hex: primaryColorHex,
      pattern,
      style,
      notes: notes.trim() || null,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete this ${item.category} from your wardrobe?`)) {
      await deleteItem(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-luxury-950 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-luxury-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-luxury-400">
              {item.category.toUpperCase()} DETAILS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(item.id)}
              className={`p-2 rounded-xl border transition-colors ${
                item.is_favorite
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'text-luxury-400 hover:text-white border-white/[0.06]'
              }`}
            >
              <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-rose-400' : ''}`} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Item"
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-luxury-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photos Showcase */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-luxury-900 border border-white/10 shadow-lg">
              <img
                src={item.front_photo_url}
                alt={item.name || item.primary_color}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-white">
                Front View
              </span>
            </div>

            {/* Back Photo Thumbnail if available */}
            {item.back_photo_url && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <img
                  src={item.back_photo_url}
                  alt="Back View"
                  className="w-12 h-12 rounded-lg object-cover border border-white/10"
                />
                <div>
                  <span className="text-[10px] font-mono uppercase text-luxury-400 block">Back Photo Attached</span>
                  <span className="text-xs text-white">Mapped onto 3D back UV</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <div className="flex items-center gap-1.5 text-luxury-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Worn {item.times_worn || 0} times</span>
              </div>
              <button
                onClick={() => recordItemWorn(item.id)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-medium transition-colors text-[11px]"
              >
                + Record Worn
              </button>
            </div>
          </div>

          {/* Details & Edit */}
          <div className="space-y-4">
            {!isEditing ? (
              <>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                    {item.name || `${item.primary_color} ${item.item_type}`}
                  </h3>
                  <p className="text-xs text-luxury-400 mt-1 capitalize">
                    {item.item_type} • {item.style}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-luxury-500 uppercase block">Main Color</span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-medium text-white">
                      <span
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: item.primary_color_hex }}
                      />
                      <span>{item.primary_color}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-luxury-500 uppercase block">Pattern</span>
                    <span className="font-medium text-white capitalize mt-0.5 block">{item.pattern}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-luxury-500 uppercase block">Style</span>
                    <span className="font-medium text-white capitalize mt-0.5 block">{item.style}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-luxury-500 uppercase block">Category</span>
                    <span className="font-medium text-white capitalize mt-0.5 block">{item.category}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-luxury-500 uppercase block mb-1">
                      Fabric &amp; Cut Notes
                    </span>
                    <p className="text-xs text-luxury-300 leading-relaxed">{item.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-luxury-500">
                  <span>Added {formatDate(item.created_at)}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium border border-white/[0.1] transition-all"
                  >
                    Edit Details
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-luxury-400 block mb-1">Item Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white"
                  />
                </div>

                <div>
                  <label className="text-luxury-400 block mb-1">Item Type</label>
                  <input
                    type="text"
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-luxury-400 block mb-1">Primary Color</label>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-luxury-400 block mb-1">Hex Code</label>
                    <input
                      type="text"
                      value={primaryColorHex}
                      onChange={(e) => setPrimaryColorHex(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-luxury-400 block mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-luxury-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
