'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Palette, 
  Tag, 
  SlidersHorizontal,
  Camera
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { 
  ClothingCategory, 
  Subcategory, 
  ClothingPattern, 
  ClothingStyle, 
  ClothingFit, 
  Season 
} from '@/types/database';
import { POPULAR_COLORS } from '@/lib/utils';
import { uploadWardrobeImage } from '@/lib/supabase/storage';

interface UploadClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBCATEGORIES: { id: Subcategory; label: string; category: ClothingCategory }[] = [
  { id: 'shirt', label: 'Shirt (Casual/Formal)', category: 'tops' },
  { id: 't-shirt', label: 'T-Shirt', category: 'tops' },
  { id: 'polo', label: 'Polo Shirt', category: 'tops' },
  { id: 'hoodie', label: 'Hoodie', category: 'tops' },
  { id: 'sweater', label: 'Sweater / Knit', category: 'tops' },
  { id: 'jeans', label: 'Jeans / Denim', category: 'bottoms' },
  { id: 'chinos', label: 'Chinos / Trousers', category: 'bottoms' },
  { id: 'formal pants', label: 'Formal Pants', category: 'bottoms' },
  { id: 'shorts', label: 'Shorts', category: 'bottoms' },
  { id: 'joggers', label: 'Joggers / Sweatpants', category: 'bottoms' },
  { id: 'jacket', label: 'Jacket / Coat / Blazer', category: 'outerwear' },
  { id: 'sneakers', label: 'Sneakers', category: 'footwear' },
  { id: 'formal shoes', label: 'Formal Shoes / Loafers', category: 'footwear' },
  { id: 'sandals', label: 'Sandals / Slides', category: 'footwear' },
  { id: 'watch', label: 'Watch', category: 'accessories' },
  { id: 'belt', label: 'Belt', category: 'accessories' },
  { id: 'sunglasses', label: 'Sunglasses', category: 'accessories' },
  { id: 'other', label: 'Other Accessory', category: 'accessories' },
];

const STYLES: ClothingStyle[] = ['formal', 'casual', 'sporty', 'traditional', 'party', 'smart-casual', 'streetwear'];
const PATTERNS: ClothingPattern[] = ['solid', 'striped', 'checked', 'graphic', 'floral', 'printed', 'textured', 'other'];
const FITS: ClothingFit[] = ['slim', 'regular', 'oversized', 'relaxed', 'tailored'];
const SEASONS: Season[] = ['all-season', 'summer', 'winter', 'spring', 'autumn', 'monsoon'];

export const UploadClothingModal: React.FC<UploadClothingModalProps> = ({ isOpen, onClose }) => {
  const { addItem, user } = useWardrobe();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form & Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable AI Recognition Form Fields
  const [name, setName] = useState('');
  const [subcategory, setSubcategory] = useState<Subcategory>('shirt');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [primaryColor, setPrimaryColor] = useState('Black');
  const [primaryColorHex, setPrimaryColorHex] = useState('#000000');
  const [pattern, setPattern] = useState<ClothingPattern>('solid');
  const [style, setStyle] = useState<ClothingStyle>('casual');
  const [fit, setFit] = useState<ClothingFit>('regular');
  const [season, setSeason] = useState<Season>('all-season');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0.95);
  const [aiRecognized, setAiRecognized] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      await analyzeImageWithAi(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImageWithAi = async (base64Image: string, mimeType: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/vision/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image, mimeType }),
      });

      if (!res.ok) {
        throw new Error('AI analysis encountered an issue, but you can fill in details below.');
      }

      const data = await res.json();

      setName(data.name || 'Wardrobe Item');
      setSubcategory(data.subcategory || 'shirt');
      setCategory(data.category || 'tops');
      setPrimaryColor(data.primary_color || 'Black');
      setPrimaryColorHex(data.primary_color_hex || '#000000');
      setPattern(data.pattern || 'solid');
      setStyle(data.style || 'casual');
      setFit(data.fit || 'regular');
      setSeason(data.season || 'all-season');
      if (data.brand) setBrand(data.brand);
      if (data.notes) setNotes(data.notes);
      setConfidenceScore(data.confidence_score || 0.95);
      setAiRecognized(true);
    } catch (err: any) {
      console.warn(err);
      setError(err.message || 'Vision classification failed. Please enter details manually.');
      setName('New Clothing Item');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubcategoryChange = (sub: Subcategory) => {
    setSubcategory(sub);
    const item = SUBCATEGORIES.find((s) => s.id === sub);
    if (item) {
      setCategory(item.category);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setError('Please upload a clothing photo.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide an item name.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const tempId = `item-${Date.now()}`;
      let finalPhotoUrl = imagePreview;
      let storagePath = `wardrobe/${tempId}.jpg`;

      // Upload to Supabase Storage bucket 'wardrobe-originals'
      if (selectedFile && user) {
        const uploadResult = await uploadWardrobeImage(selectedFile, user.id, tempId);
        finalPhotoUrl = uploadResult.publicUrl;
        storagePath = uploadResult.storagePath;
      }

      await addItem({
        name,
        category,
        subcategory,
        primary_color: primaryColor,
        primary_color_hex: primaryColorHex,
        secondary_colors: [],
        pattern,
        style,
        fit,
        season,
        brand: brand.trim() ? brand : null,
        photo_url: finalPhotoUrl,
        storage_path: storagePath,
        notes: notes.trim() ? notes : null,
        is_favorite: false,
        times_worn: 0,
        confidence_score: confidenceScore,
        ai_metadata: { source: aiRecognized ? 'claude-vision' : 'manual' },
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save wardrobe item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-luxury-950 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-luxury-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                Add Clothing to Wardrobe
              </h2>
              <p className="text-xs text-luxury-400">
                AI Vision analyzes category, colors, fit, pattern, and style.
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

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Upload Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-luxury-400 mb-2">
                Garment Photo (Original)
              </label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-64 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-luxury-300 group-hover:scale-110 transition-transform mb-3">
                    <UploadCloud className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">
                    Click to upload photo
                  </span>
                  <span className="text-xs text-luxury-500 text-center">
                    Supports high-res JPG, PNG, WEBP. Stored securely in Supabase Storage.
                  </span>
                </div>
              ) : (
                <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 group bg-luxury-900">
                  {/* Image preview */}
                  <img
                    src={imagePreview}
                    alt="Garment Preview"
                    className="w-full h-full object-cover object-center"
                  />

                  {/* AI Analysis Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                      <RefreshCw className="w-8 h-8 text-white animate-spin mb-3" />
                      <p className="text-xs font-mono uppercase tracking-widest text-white">
                        AI Vision Analyzing Garment...
                      </p>
                      <p className="text-[11px] text-luxury-400 mt-1">
                        Detecting category, primary hex, pattern & silhouette
                      </p>
                    </div>
                  )}

                  {!isAnalyzing && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      {aiRecognized && (
                        <div className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 backdrop-blur-md">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Match: {(confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-full text-xs bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-colors"
                      >
                        Change Photo
                      </button>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Editable AI Classification Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Crisp Oxford Cotton Shirt"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                  Category & Classification
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => handleSubcategoryChange(e.target.value as Subcategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-luxury-900 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30"
                >
                  {SUBCATEGORIES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-luxury-900 text-white">
                      {s.label} ({s.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Color & Hex */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-lg border border-white/20 shrink-0"
                      style={{ backgroundColor: primaryColorHex }}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="e.g. Navy Blue"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                    Hex Code
                  </label>
                  <input
                    type="text"
                    value={primaryColorHex}
                    onChange={(e) => setPrimaryColorHex(e.target.value)}
                    placeholder="#1B263B"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Quick Swatch Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {POPULAR_COLORS.slice(0, 8).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(c.name);
                      setPrimaryColorHex(c.hex);
                    }}
                    title={c.name}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      primaryColorHex === c.hex ? 'scale-125 border-white shadow-sm' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>

              {/* Style & Fit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                    Style Aesthetic
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as ClothingStyle)}
                    className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {STYLES.map((st) => (
                      <option key={st} value={st} className="capitalize">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                    Fit
                  </label>
                  <select
                    value={fit}
                    onChange={(e) => setFit(e.target.value as ClothingFit)}
                    className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {FITS.map((f) => (
                      <option key={f} value={f} className="capitalize">
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pattern & Season */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                    Pattern
                  </label>
                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value as ClothingPattern)}
                    className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {PATTERNS.map((p) => (
                      <option key={p} value={p} className="capitalize">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                    Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as Season)}
                    className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {SEASONS.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Brand & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
            <div>
              <label className="block text-xs font-medium text-luxury-400 mb-1">
                Brand / Label (Optional)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Ralph Lauren, Zara, Nike"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-luxury-400 mb-1">
                Fabric & Styling Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Breathable linen, pairs well with dark jeans"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-luxury-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isAnalyzing || !imagePreview}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Wardrobe...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Save Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
