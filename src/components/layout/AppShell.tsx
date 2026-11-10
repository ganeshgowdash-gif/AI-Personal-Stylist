'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { WardrobeProvider, useWardrobe } from '@/context/WardrobeContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { UploadClothingModal } from '../modals/UploadClothingModal';
import { ItemDetailModal } from '../modals/ItemDetailModal';
import { BodyShapeModal } from '../modals/BodyShapeModal';
import { WardrobeItem, WardrobeCategory } from '@/types/database';
import AuthPage from '@/app/auth/page';

function InnerAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, hasSelectedBodyShape, setBodyShape } = useWardrobe();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<WardrobeCategory>('shirt');
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [showBodyShapeModal, setShowBodyShapeModal] = useState(false);

  const handleOpenUpload = (cat: WardrobeCategory = 'shirt') => {
    setUploadCategory(cat);
    setIsUploadOpen(true);
  };

  // 1. Initial Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-luxury-400">
          Loading Personal Wardrobe...
        </span>
      </div>
    );
  }

  // 2. Auth Requirement: The first page is ALWAYS login/signup
  if (!isAuthenticated && pathname !== '/auth') {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-luxury-950 text-foreground flex flex-col antialiased selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={handleOpenUpload}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <UploadClothingModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultCategory={uploadCategory}
      />

      <ItemDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      {/* Body Shape Modal displayed before first 3D use if not yet selected */}
      <BodyShapeModal
        isOpen={showBodyShapeModal}
        onClose={() => setShowBodyShapeModal(false)}
      />
    </div>
  );
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WardrobeProvider>
      <InnerAppShell>{children}</InnerAppShell>
    </WardrobeProvider>
  );
};
