'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Sparkles, 
  CloudSun, 
  Sliders, 
  Clock, 
  Palette, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { Occasion } from '@/types/database';
import { ALL_OCCASIONS } from '@/lib/utils';

interface OccasionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OccasionSelectorModal: React.FC<OccasionSelectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const { generateOutfits, wardrobe } = useWardrobe();

  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | string>('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [weather, setWeather] = useState('Mild & Clear (22°C)');
  const [season, setSeason] = useState('Current Season');
  const [preferredColor, setPreferredColor] = useState('');
  const [comfortLevel, setComfortLevel] = useState<'Balanced' | 'High' | 'Structured'>('Balanced');
  const [dressCode, setDressCode] = useState<'Appropriate' | 'Casual' | 'Smart Casual' | 'Formal' | 'Statement'>('Appropriate');
  const [timeOfDay, setTimeOfDay] = useState<'Daytime' | 'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Daytime');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOccasion = selectedOccasion === 'Other' && customOccasion.trim()
      ? customOccasion.trim()
      : selectedOccasion;

    if (!finalOccasion) {
      setError('Please select an occasion to generate your personalized outfits.');
      return;
    }

    if (wardrobe.length === 0) {
      setError('Your wardrobe is currently empty. Please add a few items first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await generateOutfits({
        occasion: finalOccasion,
        weather,
        season,
        preferredColor: preferredColor.trim() ? preferredColor : undefined,
        comfortLevel,
        dressCode,
        timeOfDay,
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/suggestions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to curate outfits. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-luxury-950 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-luxury-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white to-luxury-300 text-black flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                Where are you dressing for?
              </h2>
              <p className="text-xs text-luxury-400">
                AI curates 3 outfits from your wardrobe tailored to your occasion.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-luxury-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Occasion Grid */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-luxury-400 mb-2.5">
              1. Select Occasion (Required)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_OCCASIONS.map((occ) => {
                const isSelected = selectedOccasion === occ;
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => {
                      setSelectedOccasion(occ);
                      setError(null);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-md shadow-white/10 border-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] text-luxury-300 border border-white/[0.06]'
                    }`}
                  >
                    <span>{occ}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />}
                  </button>
                );
              })}
            </div>

            {selectedOccasion === 'Other' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  placeholder="Specify occasion (e.g. Art Gallery Opening, Rooftop Dinner)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Optional Preferences Section */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-luxury-400">
                2. Fine-tune Preferences (Optional)
              </span>
              <span className="text-[11px] text-luxury-500 font-light">Custom tailoring</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weather & Time */}
              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5 flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-luxury-400" />
                  <span>Weather Condition</span>
                </label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Mild & Clear (22°C)">Mild & Clear (22°C)</option>
                  <option value="Warm & Sunny (28°C+)">Warm & Sunny (28°C+)</option>
                  <option value="Cool & Breezy (15°C)">Cool & Breezy (15°C)</option>
                  <option value="Chilly / Cold (<10°C)">Chilly / Cold (&lt;10°C)</option>
                  <option value="Rainy / Humid">Rainy / Humid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-luxury-400" />
                  <span>Time of Day</span>
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Daytime">Daytime</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              {/* Comfort & Color */}
              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-luxury-400" />
                  <span>Comfort Priority</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Balanced', 'High', 'Structured'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setComfortLevel(lvl)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        comfortLevel === lvl
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/[0.04] text-luxury-400 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-luxury-400" />
                  <span>Preferred Accent / Color</span>
                </label>
                <input
                  type="text"
                  value={preferredColor}
                  onChange={(e) => setPreferredColor(e.target.value)}
                  placeholder="e.g. Navy, Black, Earth tones, Any"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-luxury-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedOccasion}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-white/10"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Styling Your Wardrobe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curate 3 Outfits</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
