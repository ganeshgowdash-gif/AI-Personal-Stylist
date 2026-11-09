'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  WardrobeItem, 
  OutfitCombination, 
  SavedOutfit, 
  OutfitHistory, 
  PlannerEntry, 
  ShoppingRecommendation, 
  UserProfile,
  Occasion
} from '@/types/database';
import { INITIAL_DEMO_WARDROBE } from '@/lib/seed-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { analyzeWardrobeForShopping } from '@/lib/ai/shopping-analyzer';

interface WardrobeContextType {
  user: { id: string; email: string; full_name?: string } | null;
  profile: UserProfile | null;
  wardrobe: WardrobeItem[];
  outfitHistory: OutfitHistory[];
  savedOutfits: SavedOutfit[];
  plannerEntries: PlannerEntry[];
  shoppingRecommendations: ShoppingRecommendation[];
  recentSuggestions: OutfitCombination[];
  isLoading: boolean;
  isConfigured: boolean;

  // Actions
  addItem: (item: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<WardrobeItem>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  recordItemWorn: (itemId: string) => Promise<void>;
  
  // Styling
  generateOutfits: (params: {
    occasion: Occasion | string;
    weather?: string;
    season?: string;
    preferredColor?: string;
    comfortLevel?: string;
    dressCode?: string;
    timeOfDay?: string;
  }) => Promise<{ outfits: OutfitCombination[]; missingEssentials: string[]; stylingSummary: string }>;
  saveOutfit: (outfit: OutfitCombination, customName?: string) => Promise<void>;
  unsaveOutfit: (outfitId: string) => Promise<void>;
  markOutfitWorn: (outfit: OutfitCombination, date?: string) => Promise<void>;

  // Planner
  addPlannerEntry: (entry: { planned_date: string; occasion: string; outfit_id?: string; notes?: string }) => Promise<void>;
  removePlannerEntry: (id: string) => Promise<void>;
  togglePlannerWorn: (id: string) => Promise<void>;

  // Profile & Try-On
  updateModelAppearance: (appearance: UserProfile['default_model_appearance']) => Promise<void>;
  setTryonConsent: (consent: boolean) => Promise<void>;
  setTryonPhoto: (url: string | null, path?: string | null) => Promise<void>;
  deleteTryonPhoto: () => Promise<void>;

  // Helpers
  seedDemoWardrobe: () => Promise<void>;
  refreshShoppingRecommendations: () => void;
  signOut: () => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'ai_stylist_';

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [outfitHistory, setOutfitHistory] = useState<OutfitHistory[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [plannerEntries, setPlannerEntries] = useState<PlannerEntry[]>([]);
  const [shoppingRecommendations, setShoppingRecommendations] = useState<ShoppingRecommendation[]>([]);
  const [recentSuggestions, setRecentSuggestions] = useState<OutfitCombination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // Initialize Auth & Data
  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsLoading(true);
      const configured = isSupabaseConfigured();
      setIsConfigured(configured);

      let currentUserId = 'guest-stylist-user';
      let currentUserEmail = 'guest@aistylist.fashion';
      let currentFullName = 'Haute Couture Member';

      if (configured) {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            currentUserId = authUser.id;
            currentUserEmail = authUser.email || '';
            currentFullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '';
          }
        } catch (err) {
          console.warn('Supabase auth check failed:', err);
        }
      }

      if (!mounted) return;

      const activeUser = {
        id: currentUserId,
        email: currentUserEmail,
        full_name: currentFullName,
      };
      setUser(activeUser);

      // Load Profile
      const storedProfile = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}profile_${currentUserId}`);
      const defaultProfile: UserProfile = {
        id: currentUserId,
        full_name: currentFullName,
        gender_preference: 'unisex',
        preferred_style: ['smart-casual', 'casual', 'minimalist'],
        default_model_appearance: {
          gender: 'male',
          ethnicity: 'diverse',
          bodyType: 'regular',
        },
        tryon_consent: false,
        tryon_photo_path: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(storedProfile ? JSON.parse(storedProfile) : defaultProfile);

      // Load Wardrobe
      const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}wardrobe_${currentUserId}`;
      const localData = localStorage.getItem(storageKey);

      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setWardrobe(parsed);
        } catch {
          setWardrobe([]);
        }
      } else {
        // First-time starter wardrobe with real photos
        const seeded = INITIAL_DEMO_WARDROBE.map((item) => ({
          ...item,
          user_id: currentUserId,
        }));
        setWardrobe(seeded);
        localStorage.setItem(storageKey, JSON.stringify(seeded));
      }

      // Load Saved Outfits
      const savedKey = `${LOCAL_STORAGE_KEY_PREFIX}saved_${currentUserId}`;
      const localSaved = localStorage.getItem(savedKey);
      if (localSaved) {
        try { setSavedOutfits(JSON.parse(localSaved)); } catch {}
      }

      // Load Planner Entries
      const plannerKey = `${LOCAL_STORAGE_KEY_PREFIX}planner_${currentUserId}`;
      const localPlanner = localStorage.getItem(plannerKey);
      if (localPlanner) {
        try { setPlannerEntries(JSON.parse(localPlanner)); } catch {}
      }

      // Load History
      const historyKey = `${LOCAL_STORAGE_KEY_PREFIX}history_${currentUserId}`;
      const localHistory = localStorage.getItem(historyKey);
      if (localHistory) {
        try { setOutfitHistory(JSON.parse(localHistory)); } catch {}
      }

      setIsLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Sync wardrobe to storage whenever changed
  useEffect(() => {
    if (!user) return;
    const key = `${LOCAL_STORAGE_KEY_PREFIX}wardrobe_${user.id}`;
    localStorage.setItem(key, JSON.stringify(wardrobe));

    // Refresh shopping recommendations dynamically
    const recs = analyzeWardrobeForShopping(wardrobe, user.id);
    setShoppingRecommendations(recs);
  }, [wardrobe, user]);

  // Sync profile to storage
  useEffect(() => {
    if (!user || !profile) return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}profile_${user.id}`, JSON.stringify(profile));
  }, [profile, user]);

  // Sync planner
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}planner_${user.id}`, JSON.stringify(plannerEntries));
  }, [plannerEntries, user]);

  // Sync saved outfits
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}saved_${user.id}`, JSON.stringify(savedOutfits));
  }, [savedOutfits, user]);

  // Sync history
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}history_${user.id}`, JSON.stringify(outfitHistory));
  }, [outfitHistory, user]);

  const addItem = useCallback(
    async (itemData: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<WardrobeItem> => {
      if (!user) throw new Error('User not authenticated');

      const newItem: WardrobeItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setWardrobe((prev) => [newItem, ...prev]);
      return newItem;
    },
    [user]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<WardrobeItem>) => {
      setWardrobe((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updates, updated_at: new Date().toISOString() }
            : item
        )
      );
    },
    []
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setWardrobe((prev) => prev.filter((item) => item.id !== id));
      // Remove from planner if scheduled
      setPlannerEntries((prev) => prev.filter((p) => p.outfit?.top_item_id !== id && p.outfit?.bottom_item_id !== id));
    },
    []
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      setWardrobe((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_favorite: !item.is_favorite } : item
        )
      );
    },
    []
  );

  const recordItemWorn = useCallback(
    async (itemId: string) => {
      setWardrobe((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, times_worn: (item.times_worn || 0) + 1 }
            : item
        )
      );
    },
    []
  );

  const generateOutfits = useCallback(
    async (params: {
      occasion: Occasion | string;
      weather?: string;
      season?: string;
      preferredColor?: string;
      comfortLevel?: string;
      dressCode?: string;
      timeOfDay?: string;
    }) => {
      if (!user) throw new Error('User not logged in');

      const response = await fetch('/api/stylist/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          wardrobe,
          ...params,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate outfit recommendations');
      }

      const result = await response.json();
      setRecentSuggestions(result.outfits);
      return result;
    },
    [user, wardrobe]
  );

  const saveOutfit = useCallback(
    async (outfit: OutfitCombination, customName?: string) => {
      if (!user) return;
      const newSaved: SavedOutfit = {
        id: `saved-${Date.now()}`,
        user_id: user.id,
        outfit_id: outfit.id,
        custom_name: customName || outfit.title,
        notes: outfit.occasion_fit_explanation,
        created_at: new Date().toISOString(),
        outfit,
      };
      setSavedOutfits((prev) => [newSaved, ...prev.filter((s) => s.outfit_id !== outfit.id)]);
    },
    [user]
  );

  const unsaveOutfit = useCallback(
    async (outfitId: string) => {
      setSavedOutfits((prev) => prev.filter((s) => s.outfit_id !== outfitId));
    },
    []
  );

  const markOutfitWorn = useCallback(
    async (outfit: OutfitCombination, date?: string) => {
      if (!user) return;
      const wornDate = date || new Date().toISOString().split('T')[0];

      // Increment times_worn on each item in the outfit
      const itemIdsToIncrement = [
        outfit.top_item_id,
        outfit.bottom_item_id,
        outfit.outerwear_item_id,
        outfit.footwear_item_id,
        ...(outfit.accessory_item_ids || []),
      ].filter(Boolean) as string[];

      setWardrobe((prev) =>
        prev.map((item) =>
          itemIdsToIncrement.includes(item.id)
            ? { ...item, times_worn: (item.times_worn || 0) + 1 }
            : item
        )
      );

      // Add to history
      const historyEntry: OutfitHistory = {
        id: `hist-${Date.now()}`,
        user_id: user.id,
        outfit_id: outfit.id,
        worn_date: wornDate,
        occasion: outfit.occasion,
        feedback_rating: 5,
        created_at: new Date().toISOString(),
        outfit,
      };
      setOutfitHistory((prev) => [historyEntry, ...prev]);
    },
    [user]
  );

  const addPlannerEntry = useCallback(
    async (entry: { planned_date: string; occasion: string; outfit_id?: string; notes?: string }) => {
      if (!user) return;
      const existingOutfit = recentSuggestions.find((o) => o.id === entry.outfit_id) ||
        savedOutfits.find((s) => s.outfit_id === entry.outfit_id)?.outfit;

      const newEntry: PlannerEntry = {
        id: `plan-${Date.now()}`,
        user_id: user.id,
        planned_date: entry.planned_date,
        occasion: entry.occasion,
        outfit_id: entry.outfit_id || null,
        is_worn: false,
        notes: entry.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        outfit: existingOutfit || null,
      };

      setPlannerEntries((prev) => [
        newEntry,
        ...prev.filter((p) => p.planned_date !== entry.planned_date),
      ]);
    },
    [user, recentSuggestions, savedOutfits]
  );

  const removePlannerEntry = useCallback(
    async (id: string) => {
      setPlannerEntries((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  const togglePlannerWorn = useCallback(
    async (id: string) => {
      setPlannerEntries((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const nextWorn = !p.is_worn;
            if (nextWorn && p.outfit) {
              markOutfitWorn(p.outfit, p.planned_date);
            }
            return { ...p, is_worn: nextWorn };
          }
          return p;
        })
      );
    },
    [markOutfitWorn]
  );

  const updateModelAppearance = useCallback(
    async (appearance: UserProfile['default_model_appearance']) => {
      setProfile((prev) => (prev ? { ...prev, default_model_appearance: appearance } : null));
    },
    []
  );

  const setTryonConsent = useCallback(
    async (consent: boolean) => {
      setProfile((prev) => (prev ? { ...prev, tryon_consent: consent } : null));
    },
    []
  );

  const setTryonPhoto = useCallback(
    async (url: string | null, path?: string | null) => {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              tryon_photo_path: url,
            }
          : null
      );
    },
    []
  );

  const deleteTryonPhoto = useCallback(
    async () => {
      setProfile((prev) => (prev ? { ...prev, tryon_photo_path: null } : null));
    },
    []
  );

  const seedDemoWardrobe = useCallback(
    async () => {
      if (!user) return;
      const seeded = INITIAL_DEMO_WARDROBE.map((item) => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        user_id: user.id,
      }));
      setWardrobe(seeded);
    },
    [user]
  );

  const refreshShoppingRecommendations = useCallback(() => {
    if (!user) return;
    setShoppingRecommendations(analyzeWardrobeForShopping(wardrobe, user.id));
  }, [user, wardrobe]);

  const signOut = useCallback(async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, [isConfigured, supabase]);

  return (
    <WardrobeContext.Provider
      value={{
        user,
        profile,
        wardrobe,
        outfitHistory,
        savedOutfits,
        plannerEntries,
        shoppingRecommendations,
        recentSuggestions,
        isLoading,
        isConfigured,
        addItem,
        updateItem,
        deleteItem,
        toggleFavorite,
        recordItemWorn,
        generateOutfits,
        saveOutfit,
        unsaveOutfit,
        markOutfitWorn,
        addPlannerEntry,
        removePlannerEntry,
        togglePlannerWorn,
        updateModelAppearance,
        setTryonConsent,
        setTryonPhoto,
        deleteTryonPhoto,
        seedDemoWardrobe,
        refreshShoppingRecommendations,
        signOut,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
}
