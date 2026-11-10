'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Shirt, 
  Scissors, 
  Footprints, 
  Menu, 
  X, 
  PlusCircle, 
  User, 
  LogOut 
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';

interface NavbarProps {
  onOpenUpload: (category?: 'shirt' | 'pants' | 'shoes') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { user, isAuthenticated, signOut } = useWardrobe();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] px-4 lg:px-8 py-3">
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
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black font-serif font-bold shadow-sm shadow-white/5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="font-serif text-base tracking-wide font-semibold text-white group-hover:text-luxury-200 transition-colors">
                AI PERSONAL WARDROBE
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[9px] uppercase font-mono tracking-wider bg-white/[0.06] text-luxury-400 rounded border border-white/[0.06]">
                3D Outfit Stylist
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right Quick Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {/* Quick Add Button */}
              <button
                onClick={() => onOpenUpload('shirt')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Clothes</span>
              </button>

              {/* Profile Avatar */}
              <Link
                href="/settings"
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-colors"
              >
                <span className="text-xs text-luxury-300 font-medium hidden md:inline truncate max-w-[120px]">
                  {user?.full_name || 'My Wardrobe'}
                </span>
                <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-semibold">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Link>
            </>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:opacity-90 transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
