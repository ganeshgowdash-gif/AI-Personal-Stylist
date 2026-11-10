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
  Camera,
  Info,
  Layers
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { 
  WardrobeCategory, 
  ClothingPattern, 
  ClothingStyle,
  ShirtType,
  PantsType,
  ShoeType
} from '@/types/database';
import { POPULAR_COLORS } from '@/lib/utils';
import { uploadWardrobeImage } from '@/lib/supabase/storage';

interface UploadClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: WardrobeCategory;
}

const SHIRT_TYPES: ShirtType[] = [
  'formal shirt',
  'casual shirt',
  't-shirt',
  'polo t-shirt',
  'oversized shirt',
  'printed shirt',
  'other',
];

const PANTS_TYPES: PantsType[] = [
  'jeans',
  'chinos',
  'formal trousers',
  'joggers',
  'shorts',
  'cargo pants',
  'other',
];

const SHOE_TYPES: ShoeType[] = [
  'sneakers',
  'formal shoes',
  'loafers',
  'boots',
  'sandals',
  'running shoes',
  'other',
];

const PATTERNS: ClothingPattern[] = ['solid', 'striped', 'checked', 'graphic', 'floral', 'printed', 'textured', 'other'];
const STYLES: ClothingStyle[] = ['casual', 'smart-casual', 'formal', 'sporty', 'party', 'traditional'];

export const UploadClothingModal: React.FC<UploadClothingModalProps> = ({ 
  isOpen, 
  onClose,
  defaultCategory = 'shirt'
}) => {
  const { addItem, user } = useWardrobe();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Category
  const [category, setCategory] = useState<WardrobeCategory>(defaultCategory);

  // Photos
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  // AI & Processing States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable Form Details
  const [name, setName] = useState('');
  const [itemType, setItemType] = useState('casual shirt');
  const [primaryColor, setPrimaryColor] = useState('Navy Blue');
  const [primaryColorHex, setPrimaryColorHex] = useState('#1B263B');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [pattern, setPattern] = useState<ClothingPattern>('solid');
  const [style, setStyle] = useState<ClothingStyle>('casual');
  const [notes, setNotes] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0.95);
  const [aiRecognized, setAiRecognized] = useState(false);

  if (!isOpen) return null;

  const handleFrontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFrontFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setFrontPreview(base64);
      await analyzeImageWithAi(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setBackPreview(reader.result as string);
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
        body: JSON.stringify({ 
          imageBase64: base64Image, 
          mimeType,
          categoryHint: category 
        }),
      });

      if (!res.ok) {
        throw new Error('AI analysis encountered an issue, but you can enter details manually.');
      }

      const data = await res.json();

      setName(data.name || '');
      if (data.category) setCategory(data.category);
      if (data.item_type) setItemType(data.item_type);
      if (data.primary_color) setPrimaryColor(data.primary_color);
      if (data.primary_color_hex) setPrimaryColorHex(data.primary_color_hex);
      if (data.secondary_color) setSecondaryColor(data.secondary_color);
      if (data.pattern) setPattern(data.pattern);
      if (data.style) setStyle(data.style);
      if (data.notes) setNotes(data.notes);
      setConfidenceScore(data.confidence_score || 0.95);
      setAiRecognized(true);
    } catch (err: any) {
      console.warn(err);
      setError('AI recognition failed. Please input details manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontPreview) {
      setError(category === 'shoes' ? 'Please upload a side-view photo of your shoes.' : 'Please upload a front photo of your clothing.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const tempId = `${category}-${Date.now()}`;
      let frontUrl = frontPreview;
      let frontStorage = `originals/${tempId}_front.jpg`;
      let backUrl: string | null = null;
      let backStorage: string | null = null;

      // Upload Front to Supabase Storage
      if (frontFile && user) {
        const uploadRes = await uploadWardrobeImage(frontFile, user.id, `${tempId}_front`);
        frontUrl = uploadRes.publicUrl;
        frontStorage = uploadRes.storagePath;
      }

      // Upload Back to Supabase Storage (if provided)
      if (backFile && user) {
        const backUploadRes = await uploadWardrobeImage(backFile, user.id, `${tempId}_back`);
        backUrl = backUploadRes.publicUrl;
        backStorage = backUploadRes.storagePath;
      } else if (backPreview) {
        backUrl = backPreview;
        backStorage = `originals/${tempId}_back.jpg`;
      }

      await addItem({
        category,
        name: name.trim() || undefined,
        item_type: itemType,
        primary_color: primaryColor,
        primary_color_hex: primaryColorHex,
        secondary_color: secondaryColor.trim() || null,
        pattern,
        style,
        front_photo_url: frontUrl,
        front_storage_path: frontStorage,
        back_photo_url: backUrl,
        back_storage_path: backStorage,
        side_photo_url: category === 'shoes' ? frontUrl : null,
        side_storage_path: category === 'shoes' ? frontStorage : null,
        notes: notes.trim() || null,
        is_favorite: false,
        times_worn: 0,
        confidence_score: confidenceScore,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save item to wardrobe.');
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
                Upload to Digital Wardrobe
              </h2>
              <p className="text-xs text-luxury-400">
                Upload your authentic photos to texture onto the 3D mannequin.
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

          {/* Category Tabs: Only Shirts, Pants, Shoes */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-luxury-400 mb-2">
              Select Wardrobe Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['shirt', 'pants', 'shoes'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setItemType(cat === 'shirt' ? 'casual shirt' : cat === 'pants' ? 'jeans' : 'sneakers');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    category === cat
                      ? 'bg-white text-black shadow-md shadow-white/10'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-luxury-300 border border-white/[0.06]'
                  }`}
                >
                  {cat === 'shirt' ? 'My Shirts' : cat === 'pants' ? 'My Pants' : 'My Shoes'}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload Zone (Front + Back) */}
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2 text-xs text-luxury-300">
              <Info className="w-4 h-4 text-luxury-400 shrink-0" />
              <span>
                {category === 'shoes'
                  ? 'For shoes: Upload a side-view photo (required). A 2nd angle is optional.'
                  : 'Front + Back photos give a more accurate 3D preview on the mannequin.'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Photo (Required) */}
              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                  {category === 'shoes' ? 'Side View Photo * (Required)' : 'Front View Photo * (Required)'}
                </label>
                {!frontPreview ? (
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    className="h-48 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                  >
                    <UploadCloud className="w-6 h-6 text-white group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-medium text-white mb-0.5">Click to upload</span>
                    <span className="text-[10px] text-luxury-500">Your original photo</span>
                  </div>
                ) : (
                  <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-luxury-900 group">
                    <img
                      src={frontPreview}
                      alt="Front Preview"
                      className="w-full h-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
                        <RefreshCw className="w-6 h-6 text-white animate-spin mb-2" />
                        <span className="text-xs font-mono uppercase text-white">AI Analyzing Garment...</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-[10px] bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md"
                    >
                      Change
                    </button>
                  </div>
                )}
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFrontFileChange}
                  className="hidden"
                />
              </div>

              {/* Back Photo (Optional but Recommended) */}
              <div>
                <label className="block text-xs font-medium text-luxury-300 mb-1.5">
                  {category === 'shoes' ? 'Second Angle Photo (Optional)' : 'Back View Photo (Optional, Recommended)'}
                </label>
                {!backPreview ? (
                  <div
                    onClick={() => backInputRef.current?.click()}
                    className="h-48 border-2 border-dashed border-white/10 hover:border-white/30 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                  >
                    <Camera className="w-6 h-6 text-luxury-400 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-medium text-luxury-300 mb-0.5">Add Back / 2nd Angle</span>
                    <span className="text-[10px] text-luxury-500">For accurate 360° texture mapping</span>
                  </div>
                ) : (
                  <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 bg-luxury-900 group">
                    <img
                      src={backPreview}
                      alt="Back Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-[10px] bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md"
                    >
                      Change
                    </button>
                  </div>
                )}
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* AI Recognition Result & Editable Form */}
          <div className="space-y-4 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-luxury-400">
                Garment Attributes (Verify or Edit)
              </span>
              {aiRecognized && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI Confidence: {(confidenceScore * 100).toFixed(0)}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-luxury-300 mb-1">Item Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Navy Oxford Shirt"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white"
                />
              </div>

              <div>
                <label className="block text-luxury-300 mb-1">Garment Type</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-white capitalize"
                >
                  {(category === 'shirt' ? SHIRT_TYPES : category === 'pants' ? PANTS_TYPES : SHOE_TYPES).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-luxury-300 mb-1">Primary Color &amp; Hex</label>
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: primaryColorHex }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white"
                    placeholder="Color Name"
                  />
                  <input
                    type="text"
                    value={primaryColorHex}
                    onChange={(e) => setPrimaryColorHex(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white font-mono"
                    placeholder="#HEX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-luxury-300 mb-1">Secondary Color (Optional)</label>
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="e.g. White Stripes"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white"
                />
              </div>

              {/* Pattern & Style */}
              <div>
                <label className="block text-luxury-300 mb-1">Pattern</label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value as ClothingPattern)}
                  className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-white capitalize"
                >
                  {PATTERNS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-luxury-300 mb-1">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as ClothingStyle)}
                  className="w-full px-3 py-2 rounded-xl bg-luxury-900 border border-white/[0.1] text-white capitalize"
                >
                  {STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-luxury-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isAnalyzing || !frontPreview}
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
                  <span>Save to My Wardrobe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
