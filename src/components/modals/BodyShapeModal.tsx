'use client';

import React from 'react';
import { X, User, Check, Sparkles, Info } from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { BodyShape } from '@/types/database';

interface BodyShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BODY_SHAPES: { id: BodyShape; label: string; desc: string }[] = [
  { id: 'small', label: 'SMALL (Slim)', desc: 'Slender silhouette and narrower frame.' },
  { id: 'medium', label: 'MEDIUM (Average)', desc: 'Standard athletic human body proportions.' },
  { id: 'large', label: 'LARGE (Broad)', desc: 'Broader shoulders, wider chest and sturdy build.' },
];

export const BodyShapeModal: React.FC<BodyShapeModalProps> = ({ isOpen, onClose }) => {
  const { bodyShape, setBodyShape } = useWardrobe();

  if (!isOpen) return null;

  const handleSelect = async (shape: BodyShape) => {
    await setBodyShape(shape);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-luxury-950 border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Select Mannequin Body Shape</h3>
              <p className="text-xs text-luxury-400">Customizes the 3D mannequin proportions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-luxury-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {BODY_SHAPES.map((shape) => {
            const isSelected = bodyShape === shape.id;
            return (
              <div
                key={shape.id}
                onClick={() => handleSelect(shape.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md'
                    : 'glass-card border-white/[0.06] hover:border-white/20 text-white'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold tracking-wide">{shape.label}</h4>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-black/70' : 'text-luxury-400'}`}>
                    {shape.desc}
                  </p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start gap-2 text-[10px] text-luxury-400 leading-relaxed">
          <Info className="w-3.5 h-3.5 text-luxury-300 shrink-0 mt-0.5" />
          <span>
            These represent visual mannequin proportions for 3D clothing display, not guaranteed sizing or fit measurements. You can change your selection anytime.
          </span>
        </div>
      </div>
    </div>
  );
};

