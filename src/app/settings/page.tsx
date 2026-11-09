'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Database, 
  Key, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Camera, 
  RefreshCw, 
  Sparkles,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';

export default function SettingsPage() {
  const { 
    user, 
    profile, 
    wardrobe, 
    isConfigured, 
    updateModelAppearance, 
    setTryonConsent, 
    setTryonPhoto, 
    deleteTryonPhoto, 
    seedDemoWardrobe, 
    signOut 
  } = useWardrobe();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Model settings
  const [gender, setGender] = useState<'male' | 'female' | 'androgynous'>(
    profile?.default_model_appearance?.gender || 'male'
  );
  const [ethnicity, setEthnicity] = useState<'diverse' | 'asian' | 'black' | 'caucasian' | 'hispanic'>(
    profile?.default_model_appearance?.ethnicity || 'diverse'
  );
  const [bodyType, setBodyType] = useState<'regular' | 'athletic' | 'slim' | 'plus'>(
    profile?.default_model_appearance?.bodyType || 'regular'
  );

  const handleSaveModelPreferences = async () => {
    await updateModelAppearance({ gender, ethnicity, bodyType });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTryonPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      await setTryonPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          My Profile &amp; Styling Settings
        </h1>
        <p className="text-xs text-luxury-400 mt-1">
          Configure model defaults, database synchronization, and private try-on security.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Model Appearance Defaults */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Default Neural Model Appearance
              </h3>
              <p className="text-xs text-luxury-400">
                Applied to all virtual outfit previews and lookbook simulations.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Gender */}
          <div>
            <label className="block text-luxury-400 mb-1.5 font-medium">Gender Representation</label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'androgynous'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-xl capitalize font-medium transition-all ${
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
            <label className="block text-luxury-400 mb-1.5 font-medium">Model Ethnicity / Feature Aesthetics</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['diverse', 'asian', 'black', 'caucasian', 'hispanic'] as const).map((eth) => (
                <button
                  key={eth}
                  type="button"
                  onClick={() => setEthnicity(eth)}
                  className={`py-2 px-3 rounded-xl capitalize font-medium transition-all ${
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
            <label className="block text-luxury-400 mb-1.5 font-medium">Body Silhouette Build</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['regular', 'athletic', 'slim', 'plus'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBodyType(b)}
                  className={`py-2 px-3 rounded-xl capitalize font-medium transition-all ${
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

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveModelPreferences}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-opacity"
            >
              Save Appearance Settings
            </button>
          </div>
        </div>
      </div>

      {/* Personal Try-On Photo & Consent */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-white/10 text-white">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Private Virtual Try-On Photo
            </h3>
            <p className="text-xs text-luxury-400">
              Strictly stored in the private &apos;user-tryon&apos; storage bucket with zero public access.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-luxury-300 select-none">
            <input
              type="checkbox"
              checked={profile?.tryon_consent || false}
              onChange={(e) => setTryonConsent(e.target.checked)}
              className="mt-0.5 rounded bg-luxury-800 border-white/20 text-white focus:ring-0"
            />
            <span>
              I grant explicit consent to store my full-body photo solely for private outfit preview generations.
            </span>
          </label>

          {profile?.tryon_photo_path ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <img
                  src={profile.tryon_photo_path}
                  alt="Saved Try-on Reference"
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <p className="text-xs font-medium text-white">Full-Body Reference Saved</p>
                  <p className="text-[10px] text-luxury-500">Ready for studio preview</p>
                </div>
              </div>

              <button
                onClick={deleteTryonPhoto}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Photo</span>
              </button>
            </div>
          ) : (
            <label className="block w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-white/40 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all">
              <span className="text-xs font-medium text-white">Upload Full-Body Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleTryonPhotoUpload}
                className="hidden"
                disabled={!profile?.tryon_consent}
              />
            </label>
          )}
        </div>
      </div>

      {/* Supabase & Database Architecture Diagnostics */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Database &amp; Storage Architecture
              </h3>
              <p className="text-xs text-luxury-400">
                PostgreSQL with Row Level Security (RLS) &amp; Supabase Storage Buckets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {isConfigured ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Local Vault Active
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 text-xs text-luxury-300 leading-relaxed">
          <p>
            The project includes complete, production-ready SQL migrations in{' '}
            <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">
              supabase/schema.sql
            </code>{' '}
            configuring:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-luxury-400">
            <li>Tables: profiles, wardrobe_items, clothing_categories, outfit_combinations, saved_outfits, outfit_history, planner_entries, shopping_recommendations, generated_previews.</li>
            <li>Row Level Security (RLS) isolating each user&apos;s data strictly via auth.uid().</li>
            <li>Separate storage buckets: <strong className="text-white">wardrobe-originals</strong>, <strong className="text-white">outfit-previews</strong>, and <strong className="text-white">user-tryon</strong>.</li>
          </ul>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Sample Wardrobe Re-seed</p>
              <p className="text-[11px] text-luxury-400">
                Restore the default curated 10-piece collection for testing.
              </p>
            </div>
            <button
              onClick={seedDemoWardrobe}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white text-white hover:text-black transition-colors"
            >
              Reset / Seed Wardrobe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

