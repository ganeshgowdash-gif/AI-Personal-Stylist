'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Bookmark, 
  Trash2, 
  LogOut, 
  Check, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { BodyShape } from '@/types/database';

export default function ProfileSettingsPage() {
  const { 
    user, 
    profile, 
    bodyShape, 
    setBodyShape, 
    savedOutfits, 
    deleteSavedOutfit, 
    setActiveMannequinOutfit,
    signOut, 
    deleteAccount 
  } = useWardrobe();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(profile?.mobile_number || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReopenOutfitIn3D = (saved: any) => {
    if (saved.shirt && saved.pants && saved.shoes) {
      setActiveMannequinOutfit({
        shirt: saved.shirt,
        pants: saved.pants,
        shoes: saved.shoes,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          My Profile &amp; Settings
        </h1>
        <p className="text-xs text-luxury-400 mt-1">
          Manage your account details, 3D mannequin body proportions, and saved outfit collections.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/20 text-xs text-white flex items-center gap-2">
          <Check className="w-4 h-4 text-white" />
          <span>Profile updated successfully.</span>
        </div>
      )}

      {/* 1. Account Details Form */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-semibold text-white">Account Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-luxury-400 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-luxury-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-luxury-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-luxury-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-luxury-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-luxury-400 mb-1">Mobile Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-luxury-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-luxury-400 mb-1">Update Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-luxury-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* 2. Mannequin Body Shape Selection */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Mannequin Body Shape</h2>
          <p className="text-xs text-luxury-400 mt-0.5">
            Scales the 3D faceless mannequin and adjusts garment mesh drape.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'small', label: 'SMALL (Slim)', desc: 'Slender silhouette and narrower frame' },
            { id: 'medium', label: 'MEDIUM (Average)', desc: 'Natural athletic proportions' },
            { id: 'large', label: 'LARGE (Broad)', desc: 'Broader shoulders and sturdy build' },
          ].map((shape) => {
            const isSelected = bodyShape === shape.id;
            return (
              <div
                key={shape.id}
                onClick={() => setBodyShape(shape.id as BodyShape)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md'
                    : 'glass-card border-white/[0.06] hover:border-white/20 text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{shape.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-black" />}
                </div>
                <p className={`text-[11px] mt-1 ${isSelected ? 'text-black/70' : 'text-luxury-400'}`}>
                  {shape.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Saved Outfits Collection */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">
            Saved Outfits ({savedOutfits.length})
          </h2>
          <span className="text-[10px] font-mono text-luxury-500">Per-Account Collection</span>
        </div>

        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedOutfits.map((saved) => (
              <div
                key={saved.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-white">{saved.name}</h4>
                  <p className="text-[10px] text-luxury-400">
                    {saved.shirt?.primary_color} + {saved.pants?.primary_color} + {saved.shoes?.primary_color}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/preview"
                    onClick={() => handleReopenOutfitIn3D(saved)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black transition-colors"
                    title="Open on 3D Mannequin"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => deleteSavedOutfit(saved.id)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Saved Outfit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-luxury-500 py-3 text-center">
            You haven&apos;t saved any outfit combinations yet. You can save combinations from Mix &amp; Match or AI Suggestions.
          </p>
        )}
      </div>

      {/* 4. Logout & Delete Account Actions */}
      <div className="p-6 rounded-3xl glass-card border border-white/[0.08] flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-white block">Account Security &amp; Data</span>
          <span className="text-[11px] text-luxury-500">
            Sign out or permanently purge your account and all stored photos.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white text-white hover:text-black transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Modal Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-luxury-950 border border-white/[0.1] rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-rose-300">Permanently Delete Account?</h3>
            <p className="text-xs text-luxury-300 leading-relaxed">
              This action cannot be undone. All your uploaded shirts, pants, shoes, photographs, and saved outfits will be permanently purged from the database and storage.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs text-luxury-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteAccount();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
