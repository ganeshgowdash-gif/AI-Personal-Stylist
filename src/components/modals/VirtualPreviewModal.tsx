'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Eye, 
  RotateCw, 
  User, 
  Camera, 
  Trash2, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  Columns
} from 'lucide-react';
import { OutfitCombination } from '@/types/database';
import { useWardrobe } from '@/context/WardrobeContext';

interface VirtualPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: OutfitCombination | null;
  allOutfits?: OutfitCombination[];
}

export const VirtualPreviewModal: React.FC<VirtualPreviewModalProps> = ({
  isOpen,
  onClose,
  outfit,
  allOutfits = [],
}) => {
  const { profile, updateModelAppearance, setTryonConsent, setTryonPhoto, deleteTryonPhoto } = useWardrobe();

  // Selected Outfit
  const [activeOutfit, setActiveOutfit] = useState<OutfitCombination | null>(outfit);
  const [isComparing, setIsComparing] = useState(false);

  // Model Appearance Controls
  const [gender, setGender] = useState<'male' | 'female' | 'androgynous'>(
    profile?.default_model_appearance?.gender || 'male'
  );
  const [ethnicity, setEthnicity] = useState<'diverse' | 'asian' | 'black' | 'caucasian' | 'hispanic'>(
    profile?.default_model_appearance?.ethnicity || 'diverse'
  );
  const [bodyType, setBodyType] = useState<'regular' | 'athletic' | 'slim' | 'plus'>(
    profile?.default_model_appearance?.bodyType || 'regular'
  );

  // Perspective & Variants
  const [perspective, setPerspective] = useState<'front' | 'side' | 'detail'>('front');
  const [colorVariant, setColorVariant] = useState<string>('original');

  // Preview Generation State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [comparisonPreviews, setComparisonPreviews] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Virtual Try-on State
  const [isTryonMode, setIsTryonMode] = useState(false);
  const [consentChecked, setConsentChecked] = useState(profile?.tryon_consent || false);

  useEffect(() => {
    if (outfit) {
      setActiveOutfit(outfit);
    }
  }, [outfit]);

  // Generate Preview whenever activeOutfit or controls change
  useEffect(() => {
    if (!isOpen || !activeOutfit) return;

    let isMounted = true;
    const fetchPreview = async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/preview/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outfit: activeOutfit,
            options: {
              modelAppearance: { gender, ethnicity, bodyType },
              perspective,
              colorVariant,
              isVirtualTryon: isTryonMode,
              userTryonPhotoUrl: profile?.tryon_photo_path,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPreviewUrl(data.imageUrl);
          }
        }
      } catch (err) {
        console.warn('Failed to load preview:', err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeOutfit, gender, ethnicity, bodyType, perspective, colorVariant, isTryonMode]);

  if (!isOpen || !activeOutfit) return null;

  const handleTryonPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      await setTryonPhoto(url);
    };
    reader.readAsDataURL(file);
  };

  const handleConsentToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setConsentChecked(checked);
    await setTryonConsent(checked);
  };

  const handleDeletePhoto = async () => {
    await deleteTryonPhoto();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-6 bg-luxury-950 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-luxury-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-wide">
                  Virtual Outfit Preview &amp; Try-On
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-luxury-200">
                  {activeOutfit.tier.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-luxury-400">
                High-fashion neural model rendering reflecting your actual wardrobe items.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allOutfits.length > 1 && (
              <button
                onClick={() => setIsComparing(!isComparing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isComparing
                    ? 'bg-white text-black'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-luxury-300 border border-white/[0.08]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{isComparing ? 'Exit Comparison' : 'Compare 3 Outfits'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-luxury-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mandatory Disclaimer Banner */}
        <div className="px-6 py-2 bg-luxury-900/40 border-b border-white/[0.04] flex items-center justify-between text-[11px] text-luxury-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-luxury-300" />
            <span className="font-medium text-luxury-300">
              AI-generated preview, not an exact fit simulation.
            </span>
            <span className="hidden sm:inline text-luxury-500">
              Fabric drapery and colors closely mirror your uploaded items.
            </span>
          </div>
          <span className="font-mono text-[10px] text-luxury-500">Flux Neural Haute</span>
        </div>

        {/* Content Body */}
        {isComparing && allOutfits.length > 0 ? (
          /* Side-by-Side 3 Outfits Comparison */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allOutfits.map((out, idx) => (
                <div
                  key={out.id}
                  onClick={() => {
                    setActiveOutfit(out);
                    setIsComparing(false);
                  }}
                  className={`p-4 rounded-2xl glass-card cursor-pointer border transition-all ${
                    activeOutfit.id === out.id
                      ? 'border-white bg-white/[0.05]'
                      : 'border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">{out.title}</span>
                    <span className="text-[10px] font-mono text-luxury-400">Tier {idx + 1}</span>
                  </div>

                  <div className="h-64 rounded-xl overflow-hidden bg-luxury-900 mb-3 border border-white/10 relative">
                    <img
                      src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                        `luxury fashion model wearing ${out.top_item?.primary_color} ${out.top_item?.name} and ${out.bottom_item?.primary_color} ${out.bottom_item?.name}`
                      )}?width=400&height=600&seed=${idx + 101}&nologo=true`}
                      alt={out.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1 text-[11px] text-luxury-300">
                    <p className="truncate">Top: {out.top_item?.name || 'None'}</p>
                    <p className="truncate">Bottom: {out.bottom_item?.name || 'None'}</p>
                    <p className="truncate">Shoes: {out.footwear_item?.name || 'None'}</p>
                  </div>

                  <button className="w-full mt-3 py-1.5 text-center text-xs font-medium rounded-lg bg-white/10 hover:bg-white text-white hover:text-black transition-colors">
                    Select to Inspect
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Single Outfit Studio View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
            {/* Visual Canvas (Left) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-luxury-900 shadow-xl group">
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-10 p-6 text-center">
                    <RotateCw className="w-8 h-8 text-white animate-spin mb-3" />
                    <p className="text-xs font-mono uppercase tracking-widest text-white">
                      Synthesizing Fashion Model Preview...
                    </p>
                    <p className="text-[11px] text-luxury-400 mt-1 max-w-xs">
                      Applying garment cuts, perspective, and styling logic
                    </p>
                  </div>
                )}

                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Virtual Outfit Preview"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-luxury-500">
                    No preview generated
                  </div>
                )}

                {/* Perspective Toggles Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    {(['front', 'side', 'detail'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPerspective(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                          perspective === p
                            ? 'bg-white text-black font-semibold'
                            : 'text-luxury-300 hover:text-white'
                        }`}
                      >
                        {p} View
                      </button>
                    ))}
                  </div>

                  {/* Color Variant Pill */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    {['original', 'Cream Accent', 'Dark Tonal'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setColorVariant(v)}
                        className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                          colorVariant === v
                            ? 'bg-white text-black font-semibold'
                            : 'text-luxury-400 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Item Thumbnails Bar below image */}
              <div className="w-full grid grid-cols-4 gap-2 mt-4">
                {[
                  { label: 'Top', item: activeOutfit.top_item },
                  { label: 'Bottom', item: activeOutfit.bottom_item },
                  { label: 'Shoes', item: activeOutfit.footwear_item },
                  { label: 'Outerwear', item: activeOutfit.outerwear_item },
                ].map(({ label, item }) => (
                  <div
                    key={label}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2"
                  >
                    {item?.photo_url ? (
                      <img
                        src={item.photo_url}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-luxury-800 shrink-0 border border-white/5 flex items-center justify-center text-[10px] text-luxury-500">
                        None
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-mono text-luxury-400">{label}</p>
                      <p className="text-xs text-white truncate font-medium">
                        {item?.name || 'Optional'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization & Controls (Right) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Outfit Switcher Tabs */}
              {allOutfits.length > 1 && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-luxury-400 mb-2">
                    Select Outfit Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {allOutfits.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setActiveOutfit(o)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all text-center truncate ${
                          activeOutfit.id === o.id
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/[0.04] text-luxury-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {o.tier === 'best_match'
                          ? 'Best Match'
                          : o.tier === 'stylish_alternative'
                          ? 'Alternative'
                          : 'Comfort'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Customization */}
              <div className="space-y-3.5 p-4 rounded-2xl glass-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-luxury-300" />
                    <span>Model Appearance Switcher</span>
                  </span>
                  <span className="text-[10px] font-mono text-luxury-500">Live Render</span>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[11px] text-luxury-400 mb-1">Gender Aesthetic</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['male', 'female', 'androgynous'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setGender(g);
                          updateModelAppearance({ gender: g, ethnicity, bodyType });
                        }}
                        className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                          gender === g
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/[0.04] text-luxury-300 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ethnicity */}
                <div>
                  <label className="block text-[11px] text-luxury-400 mb-1">Model Representation</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {(['diverse', 'asian', 'black', 'caucasian', 'hispanic'] as const).map((eth) => (
                      <button
                        key={eth}
                        onClick={() => {
                          setEthnicity(eth);
                          updateModelAppearance({ gender, ethnicity: eth, bodyType });
                        }}
                        className={`py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${
                          ethnicity === eth
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/[0.04] text-luxury-300 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {eth}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Build */}
                <div>
                  <label className="block text-[11px] text-luxury-400 mb-1">Body Build Silhouette</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['regular', 'athletic', 'slim', 'plus'] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setBodyType(b);
                          updateModelAppearance({ gender, ethnicity, bodyType: b });
                        }}
                        className={`py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${
                          bodyType === b
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/[0.04] text-luxury-300 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Virtual Try-On (User Photo) with Consent */}
              <div className="p-4 rounded-2xl glass-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-luxury-300" />
                    <span>Personal Virtual Try-On</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Optional Private
                  </span>
                </div>

                <p className="text-[11px] text-luxury-400">
                  Upload your own full-body photo to preview this outfit combination on your physique.
                </p>

                {/* Explicit Consent Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-luxury-300 select-none">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={handleConsentToggle}
                    className="mt-0.5 rounded bg-luxury-800 border-white/20 text-white focus:ring-0"
                  />
                  <span>
                    I consent to using my full-body photo solely for generating private virtual outfit previews.
                  </span>
                </label>

                {consentChecked && (
                  <div className="pt-2">
                    {profile?.tryon_photo_path ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                        <div className="flex items-center gap-2">
                          <img
                            src={profile.tryon_photo_path}
                            alt="Your Try-On Reference"
                            className="w-10 h-10 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <p className="text-xs font-medium text-white">Full-Body Photo Saved</p>
                            <p className="text-[10px] text-luxury-400">Private encrypted bucket</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsTryonMode(!isTryonMode)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isTryonMode
                                ? 'bg-emerald-500 text-black font-semibold'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {isTryonMode ? 'Try-On Active' : 'Apply Try-On'}
                          </button>
                          <button
                            type="button"
                            onClick={handleDeletePhoto}
                            title="Delete My Photo"
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="block w-full py-2.5 px-3 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                        <span className="text-xs font-medium text-white">
                          Upload Full-Body Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTryonPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
