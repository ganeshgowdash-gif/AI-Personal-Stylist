'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shirt, Database, ShieldCheck, Menu, X, PlusCircle } from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenSuggest: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onOpenSuggest,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { user, wardrobe, isConfigured } = useWardrobe();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-luxury-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white to-luxury-400 flex items-center justify-center text-black font-serif font-bold shadow-md shadow-white/5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="font-serif text-lg tracking-wider font-semibold text-white group-hover:text-luxury-200 transition-colors">
                AI PERSONAL STYLIST
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest bg-white/[0.07] text-luxury-300 rounded border border-white/[0.06]">
                Haute Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right Actions */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/[0.03] border border-white/[0.08]">
            <Database className="w-3.5 h-3.5 text-luxury-400" />
            <span className="text-luxury-400">Database:</span>
            {isConfigured ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase RLS Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Local Vault Active
              </span>
            )}
          </div>

          {/* Quick Suggest Outfit Action */}
          <button
            onClick={onOpenSuggest}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium tracking-wide bg-gradient-to-r from-white to-luxury-200 text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shadow-white/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggest My Outfit</span>
          </button>

          {/* Add Clothing Item */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium tracking-wide bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-luxury-300" />
            <span className="hidden sm:inline">Add Clothing</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* User Profile Pill */}
          <Link
            href="/settings"
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.15] transition-colors"
          >
            <span className="text-xs text-luxury-300 font-medium hidden md:inline truncate max-w-[120px]">
              {user?.full_name || 'My Wardrobe'}
            </span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-luxury-700 to-luxury-500 border border-white/20 flex items-center justify-center text-xs font-semibold text-white">
              {user?.full_name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

