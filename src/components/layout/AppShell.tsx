'use client';

import React, { useState } from 'react';
import { WardrobeProvider } from '@/context/WardrobeContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { UploadClothingModal } from '../modals/UploadClothingModal';
import { OccasionSelectorModal } from '../modals/OccasionSelectorModal';
import { VirtualPreviewModal } from '../modals/VirtualPreviewModal';
import { ItemDetailModal } from '../modals/ItemDetailModal';
import { CheckBeforeBuyingModal } from '../modals/CheckBeforeBuyingModal';
import { OutfitCombination, WardrobeItem } from '@/types/database';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isItemDetailOpen, setIsItemDetailOpen] = useState(false);
  const [isCheckBuyingOpen, setIsCheckBuyingOpen] = useState(false);

  const [selectedOutfit, setSelectedOutfit] = useState<OutfitCombination | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const handleOpenPreview = (outfit: OutfitCombination) => {
    setSelectedOutfit(outfit);
    setIsPreviewOpen(true);
  };

  const handleOpenItemDetail = (item: WardrobeItem) => {
    setSelectedItem(item);
    setIsItemDetailOpen(true);
  };

  return (
    <WardrobeProvider>
      <div className="min-h-screen bg-luxury-950 text-foreground flex flex-col antialiased selection:bg-white selection:text-black">
        {/* Top Navbar */}
        <Navbar
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenSuggest={() => setIsSuggestOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Left Sidebar */}
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Global Modal Suite */}
        <UploadClothingModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
        />

        <OccasionSelectorModal
          isOpen={isSuggestOpen}
          onClose={() => setIsSuggestOpen(false)}
        />

        <VirtualPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          outfit={selectedOutfit}
        />

        <ItemDetailModal
          isOpen={isItemDetailOpen}
          onClose={() => setIsItemDetailOpen(false)}
          item={selectedItem}
        />

        <CheckBeforeBuyingModal
          isOpen={isCheckBuyingOpen}
          onClose={() => setIsCheckBuyingOpen(false)}
        />
      </div>
    </WardrobeProvider>
  );
};
