'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Shirt, 
  Scissors, 
  Footprints, 
  Sparkles, 
  Shuffle, 
  Eye, 
  ShoppingBag, 
  User, 
  ChevronRight
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Shirts', href: '/shirts', icon: Shirt, badgeKey: 'shirts' },
  { name: 'My Pants', href: '/pants', icon: Scissors, badgeKey: 'pants' },
  { name: 'My Shoes', href: '/shoes', icon: Footprints, badgeKey: 'shoes' },
  { name: 'AI Outfit Suggestions', href: '/suggestions', icon: Sparkles },
  { name: 'Mix & Match', href: '/mix-and-match', icon: Shuffle },
  { name: '3D Outfit Preview', href: '/preview', icon: Eye },
  { name: 'Smart Shopping', href: '/shopping', icon: ShoppingBag },
  { name: 'My Profile', href: '/settings', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const pathname = usePathname();
  const { shirts, pants, shoes, wardrobe } = useWardrobe();

  const getBadgeValue = (key?: string) => {
    if (key === 'shirts') return shirts.length;
    if (key === 'pants') return pants.length;
    if (key === 'shoes') return shoes.length;
    return null;
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between py-6">
      <div className="space-y-1 px-3">
        <div className="px-3 mb-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-luxury-500">
            Personal Digital Closet
          </p>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const badgeValue = getBadgeValue(item.badgeKey);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-luxury-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-black' : 'text-luxury-400 group-hover:text-white'
                  }`}
                />
                <span className="tracking-wide">{item.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {badgeValue !== null && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-black/10 text-black font-semibold'
                        : 'bg-white/[0.08] text-luxury-300'
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-black" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Wardrobe Summary Card */}
      <div className="px-4">
        <div className="p-3.5 rounded-2xl glass-card border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-luxury-400 font-medium">Wardrobe Capacity</span>
            <span className="text-xs font-mono font-bold text-white">{wardrobe.length} Items</span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] font-mono">
            <div className="p-1 rounded bg-white/[0.03]">
              <span className="text-white font-bold">{shirts.length}</span>
              <span className="block text-luxury-500">Shirts</span>
            </div>
            <div className="p-1 rounded bg-white/[0.03]">
              <span className="text-white font-bold">{pants.length}</span>
              <span className="block text-luxury-500">Pants</span>
            </div>
            <div className="p-1 rounded bg-white/[0.03]">
              <span className="text-white font-bold">{shoes.length}</span>
              <span className="block text-luxury-500">Shoes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 h-[calc(100vh-61px)] sticky top-[61px] border-r border-white/[0.08] bg-luxury-950/40 backdrop-blur-md">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-luxury-950 border-r border-white/[0.1] z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
