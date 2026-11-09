'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Shirt, 
  Sparkles, 
  Eye, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Wardrobe', href: '/wardrobe', icon: Shirt, badgeKey: 'wardrobeCount' },
  { name: 'AI Outfit Suggestions', href: '/suggestions', icon: Sparkles },
  { name: 'Virtual Try-On', href: '/try-on', icon: Eye },
  { name: 'Smart Shopping', href: '/shopping', icon: ShoppingBag, badgeKey: 'shoppingCount' },
  { name: 'Outfit Planner', href: '/planner', icon: Calendar },
  { name: 'AI Fashion Assistant', href: '/chat', icon: MessageSquare },
  { name: 'Profile & Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const pathname = usePathname();
  const { wardrobe, shoppingRecommendations } = useWardrobe();

  const getBadgeValue = (key?: string) => {
    if (key === 'wardrobeCount') return wardrobe.length;
    if (key === 'shoppingCount') return shoppingRecommendations.length;
    return null;
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between py-6">
      <div className="space-y-1.5 px-3">
        <div className="px-3 mb-4">
          <p className="text-[11px] font-mono uppercase tracking-widest text-luxury-500">
            Styling Studio
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-white text-black shadow-md shadow-white/5 font-semibold'
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
                {badgeValue !== null && badgeValue > 0 && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
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

      {/* Wardrobe Quick Summary Box in Sidebar bottom */}
      <div className="px-4">
        <div className="p-3.5 rounded-2xl glass-card border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-luxury-400 font-medium">Digital Wardrobe</span>
            <span className="text-xs font-mono font-bold text-white">{wardrobe.length} Pieces</span>
          </div>
          <div className="w-full bg-luxury-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-luxury-400 to-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((wardrobe.length / 25) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-luxury-500 mt-2 font-light">
            {wardrobe.length < 5
              ? 'Upload 5+ items for optimal multi-occasion combinations.'
              : 'Wardrobe well-calibrated for AI outfit generation.'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-61px)] sticky top-[61px] border-r border-white/[0.08] bg-luxury-950/40 backdrop-blur-md">
        {navContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
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
