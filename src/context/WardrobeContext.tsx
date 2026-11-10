'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  WardrobeItem, 
  WardrobeCategory,
  OutfitCombination, 
  SavedOutfit, 
  OutfitHistory, 
  ShoppingRecommendation, 
  UserProfile,
  BodyShape
} from '@/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface WardrobeContextType {
  user: { id: string; email: string; full_name?: string } | null;
  profile: UserProfile | null;
  wardrobe: WardrobeItem[];
  
  // Three Strict Categories
  shirts: WardrobeItem[];
  pants: WardrobeItem[];
  shoes: WardrobeItem[];
  
  // Mannequin Body Shape
  bodyShape: BodyShape;
  hasSelectedBodyShape: boolean;
  setBodyShape: (shape: BodyShape) => Promise<void>;

  outfitHistory: OutfitHistory[];
  savedOutfits: SavedOutfit[];
  shoppingRecommendations: ShoppingRecommendation[];
  recentSuggestions: OutfitCombination[];
  activeMannequinOutfit: { shirt: WardrobeItem | null; pants: WardrobeItem | null; shoes: WardrobeItem | null };
  setActiveMannequinOutfit: (outfit: { shirt: WardrobeItem | null; pants: WardrobeItem | null; shoes: WardrobeItem | null }) => void;

  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;

  // CRUD Actions
  addItem: (item: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<WardrobeItem>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  recordItemWorn: (itemId: string) => Promise<void>;
  
  // 3D & Styling
  generateOutfits: (params: {
    occasion: string;
    weather?: string;
    preferredColor?: string;
    comfortLevel?: string;
    dressCode?: string;
  }) => Promise<{ outfits: OutfitCombination[]; missingNotice?: string }>;
  generateAllMixAndMatch: (filter?: string) => OutfitCombination[];
  generateSurpriseMe: () => OutfitCombination | null;
  saveOutfit: (shirt: WardrobeItem, pants: WardrobeItem, shoes: WardrobeItem, name?: string, notes?: string) => Promise<void>;
  deleteSavedOutfit: (id: string) => Promise<void>;
  markOutfitWorn: (shirtId: string, pantsId: string, shoesId: string, occasion?: string) => Promise<void>;

  // Smart Shopping (on demand only)
  loadShoppingAnalysis: () => ShoppingRecommendation[];

  // Auth Actions
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'ai_personal_wardrobe_';

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // EMPTY START: Initial items are strictly empty array [] (Zero items, no demo data, no sample photos)
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [outfitHistory, setOutfitHistory] = useState<OutfitHistory[]>([]);
  const [recentSuggestions, setRecentSuggestions] = useState<OutfitCombination[]>([]);
  const [shoppingRecommendations, setShoppingRecommendations] = useState<ShoppingRecommendation[]>([]);

  // Body shape for 3D Mannequin
  const [bodyShape, setBodyShapeState] = useState<BodyShape>('medium');
  const [hasSelectedBodyShape, setHasSelectedBodyShape] = useState<boolean>(false);

  // Active outfit loaded on 3D mannequin
  const [activeMannequinOutfit, setActiveMannequinOutfit] = useState<{
    shirt: WardrobeItem | null;
    pants: WardrobeItem | null;
    shoes: WardrobeItem | null;
  }>({ shirt: null, pants: null, shoes: null });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // Filtered 3 categories
  const shirts = useMemo(() => wardrobe.filter((i) => i.category === 'shirt'), [wardrobe]);
  const pants = useMemo(() => wardrobe.filter((i) => i.category === 'pants'), [wardrobe]);
  const shoes = useMemo(() => wardrobe.filter((i) => i.category === 'shoes'), [wardrobe]);

  // Authenticated state
  const isAuthenticated = Boolean(user && user.id !== 'unauthenticated');

  // Initialize Session
  useEffect(() => {
    let mounted = true;
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    const loadUserData = async (currentUserId: string, currentUserEmail: string, currentFullName: string) => {
      const activeUser = {
        id: currentUserId,
        email: currentUserEmail,
        full_name: currentFullName,
      };
      setUser(activeUser);

      // Load Profile
      if (configured && currentUserId !== 'unauthenticated') {
        try {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .single();

          if (dbProfile) {
            setProfile(dbProfile);
            if (dbProfile.body_shape) setBodyShapeState(dbProfile.body_shape as BodyShape);
            if (dbProfile.has_selected_body_shape) setHasSelectedBodyShape(true);
          }
        } catch {}
      }

      // Load Wardrobe from Supabase if configured
      if (configured && currentUserId !== 'unauthenticated') {
        try {
          const { data: dbItems, error: itemsError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false });

          if (!itemsError && dbItems) {
            setWardrobe(dbItems);
            // Default 3D preview with first shirt, pants, shoes if they exist
            const s = dbItems.find((i: WardrobeItem) => i.category === 'shirt') || null;
            const p = dbItems.find((i: WardrobeItem) => i.category === 'pants') || null;
            const sh = dbItems.find((i: WardrobeItem) => i.category === 'shoes') || null;
            setActiveMannequinOutfit({ shirt: s, pants: p, shoes: sh });
            return;
          }
        } catch (err) {
          console.warn('Could not query Supabase wardrobe:', err);
        }
      }

      // Local vault fallback (ALWAYS starts with 0 items for new accounts, no mock data)
      const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}wardrobe_${currentUserId}`;
      const localData = localStorage.getItem(storageKey);

      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setWardrobe(parsed);
          const s = parsed.find((i: WardrobeItem) => i.category === 'shirt') || null;
          const p = parsed.find((i: WardrobeItem) => i.category === 'pants') || null;
          const sh = parsed.find((i: WardrobeItem) => i.category === 'shoes') || null;
          setActiveMannequinOutfit({ shirt: s, pants: p, shoes: sh });
        } catch {
          setWardrobe([]);
        }
      } else {
        // STRICT EMPTY START: 0 items
        setWardrobe([]);
      }

      // Load Saved Outfits
      const savedKey = `${LOCAL_STORAGE_KEY_PREFIX}saved_${currentUserId}`;
      const localSaved = localStorage.getItem(savedKey);
      if (localSaved) {
        try { setSavedOutfits(JSON.parse(localSaved)); } catch {}
      } else {
        setSavedOutfits([]);
      }

      // Load History
      const historyKey = `${LOCAL_STORAGE_KEY_PREFIX}history_${currentUserId}`;
      const localHistory = localStorage.getItem(historyKey);
      if (localHistory) {
        try { setOutfitHistory(JSON.parse(localHistory)); } catch {}
      } else {
        setOutfitHistory([]);
      }
    };

    async function init() {
      setIsLoading(true);

      if (configured) {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Wardrobe Owner';
            await loadUserData(authUser.id, authUser.email || '', fullName);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth check error:', err);
        }
      }

      // Check local remembered session
      const remembered = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}session_user`);
      if (remembered) {
        try {
          const parsed = JSON.parse(remembered);
          await loadUserData(parsed.id, parsed.email, parsed.full_name);
          setIsLoading(false);
          return;
        } catch {}
      }

      // Unauthenticated first-time visitor
      setUser(null);
      setWardrobe([]);
      setIsLoading(false);
    }

    init();

    // Listen to Supabase auth events
    let authListener: any = null;
    if (configured) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
          await loadUserData(session.user.id, session.user.email || '', fullName);
        } else {
          setUser(null);
          setWardrobe([]);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, [supabase]);

  // Sync to local vault
  useEffect(() => {
    if (!user) return;
    const key = `${LOCAL_STORAGE_KEY_PREFIX}wardrobe_${user.id}`;
    localStorage.setItem(key, JSON.stringify(wardrobe));
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}saved_${user.id}`, JSON.stringify(savedOutfits));
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}history_${user.id}`, JSON.stringify(outfitHistory));
  }, [wardrobe, savedOutfits, outfitHistory, user]);

  // Set Mannequin Body Shape
  const setBodyShape = useCallback(
    async (shape: BodyShape) => {
      setBodyShapeState(shape);
      setHasSelectedBodyShape(true);

      if (user) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}body_shape_${user.id}`, shape);
      }

      if (isConfigured && user && user.id !== 'unauthenticated') {
        try {
          await supabase.from('profiles').update({
            body_shape: shape,
            has_selected_body_shape: true,
          }).eq('id', user.id);
        } catch {}
      }
    },
    [user, isConfigured, supabase]
  );

  // Add Item (Shirt, Pants, Shoes)
  const addItem = useCallback(
    async (itemData: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<WardrobeItem> => {
      const currentUserId = user?.id || 'local-user';

      const newItem: WardrobeItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        user_id: currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isConfigured && user && user.id !== 'unauthenticated') {
        try {
          await supabase.from('wardrobe_items').insert({
            id: newItem.id,
            user_id: user.id,
            category: newItem.category,
            name: newItem.name,
            item_type: newItem.item_type,
            primary_color: newItem.primary_color,
            primary_color_hex: newItem.primary_color_hex,
            secondary_color: newItem.secondary_color,
            pattern: newItem.pattern,
            style: newItem.style,
            front_photo_url: newItem.front_photo_url,
            front_storage_path: newItem.front_storage_path,
            back_photo_url: newItem.back_photo_url,
            back_storage_path: newItem.back_storage_path,
            side_photo_url: newItem.side_photo_url,
            side_storage_path: newItem.side_storage_path,
            notes: newItem.notes,
            is_favorite: newItem.is_favorite,
            times_worn: newItem.times_worn,
          });
        } catch (err) {
          console.warn('Could not insert item into Supabase:', err);
        }
      }

      setWardrobe((prev) => [newItem, ...prev]);

      // Automatically mount to 3D mannequin if corresponding slot is empty
      setActiveMannequinOutfit((prev) => {
        if (newItem.category === 'shirt' && !prev.shirt) return { ...prev, shirt: newItem };
        if (newItem.category === 'pants' && !prev.pants) return { ...prev, pants: newItem };
        if (newItem.category === 'shoes' && !prev.shoes) return { ...prev, shoes: newItem };
        return prev;
      });

      return newItem;
    },
    [user, isConfigured, supabase]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<WardrobeItem>) => {
      if (isConfigured && user && user.id !== 'unauthenticated') {
        try {
          await supabase.from('wardrobe_items').update(updates).eq('id', id);
        } catch {}
      }

      setWardrobe((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i))
      );

      // Update 3D mannequin preview if active
      setActiveMannequinOutfit((prev) => {
        const s = prev.shirt?.id === id ? { ...prev.shirt, ...updates } : prev.shirt;
        const p = prev.pants?.id === id ? { ...prev.pants, ...updates } : prev.pants;
        const sh = prev.shoes?.id === id ? { ...prev.shoes, ...updates } : prev.shoes;
        return { shirt: s as any, pants: p as any, shoes: sh as any };
      });
    },
    [isConfigured, user, supabase]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (isConfigured && user && user.id !== 'unauthenticated') {
        try {
          await supabase.from('wardrobe_items').delete().eq('id', id);
        } catch {}
      }

      setWardrobe((prev) => prev.filter((i) => i.id !== id));
      setActiveMannequinOutfit((prev) => ({
        shirt: prev.shirt?.id === id ? null : prev.shirt,
        pants: prev.pants?.id === id ? null : prev.pants,
        shoes: prev.shoes?.id === id ? null : prev.shoes,
      }));
    },
    [isConfigured, user, supabase]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const target = wardrobe.find((i) => i.id === id);
      if (target) {
        await updateItem(id, { is_favorite: !target.is_favorite });
      }
    },
    [wardrobe, updateItem]
  );

  const recordItemWorn = useCallback(
    async (itemId: string) => {
      const target = wardrobe.find((i) => i.id === itemId);
      if (target) {
        await updateItem(itemId, { times_worn: (target.times_worn || 0) + 1 });
      }
    },
    [wardrobe, updateItem]
  );

  // Generate All Combinations for Mix & Match: shirts × pants × shoes
  const generateAllMixAndMatch = useCallback(
    (filter: string = 'all') => {
      const combinations: OutfitCombination[] = [];

      for (const s of shirts) {
        for (const p of pants) {
          for (const sh of shoes) {
            // Compute match metrics
            const isNeutralTop = ['black', 'white', 'gray', 'navy', 'beige'].some((c) =>
              s.primary_color.toLowerCase().includes(c)
            );
            const isNeutralBottom = ['black', 'white', 'gray', 'navy', 'beige'].some((c) =>
              p.primary_color.toLowerCase().includes(c)
            );
            const isFormal = s.style === 'formal' || p.style === 'formal' || sh.style === 'formal';
            const isCasual = s.style === 'casual' && p.style === 'casual';
            const isParty = s.style === 'party' || s.primary_color.toLowerCase() === 'black';

            let score = 8.0;
            if (isNeutralTop && isNeutralBottom) score += 1.4;
            if (s.pattern === 'solid' && p.pattern === 'solid') score += 0.4;
            if (s.primary_color.toLowerCase() === p.primary_color.toLowerCase() && s.primary_color.toLowerCase() !== 'black') {
              score -= 0.8; // monotone deduction
            }

            // Filter condition
            if (filter === 'formal' && !isFormal) continue;
            if (filter === 'casual' && !isCasual) continue;
            if (filter === 'party' && !isParty) continue;
            if (filter === 'best' && score < 8.8) continue;

            combinations.push({
              id: `combo-${s.id}-${p.id}-${sh.id}`,
              user_id: user?.id || 'local-user',
              shirt_id: s.id,
              pants_id: p.id,
              shoes_id: sh.id,
              title: `${s.name || s.primary_color + ' ' + s.item_type} + ${p.name || p.primary_color + ' ' + p.item_type}`,
              occasion: isFormal ? 'Office & Formal' : isParty ? 'Parties & Evenings' : 'Casual & College',
              why_they_match: `The ${s.primary_color} ${s.item_type} balances cleanly against the ${p.primary_color} ${p.item_type}, grounded by ${sh.primary_color} ${sh.item_type}.`,
              color_compatibility: `${s.primary_color} paired with ${p.primary_color}`,
              occasion_suitability: isFormal ? 'Well suited for formal settings.' : 'Effortless for everyday wear.',
              style_description: `${s.style} / ${p.style}`,
              score: Math.min(Math.round(score * 10) / 10, 10),
              created_at: new Date().toISOString(),
              shirt: s,
              pants: p,
              shoes: sh,
            });
          }
        }
      }

      // Sort by score descending
      return combinations.sort((a, b) => b.score - a.score);
    },
    [shirts, pants, shoes, user]
  );

  // Surprise Me Generator
  const generateSurpriseMe = useCallback((): OutfitCombination | null => {
    if (shirts.length === 0 || pants.length === 0 || shoes.length === 0) {
      return null;
    }

    const randomShirt = shirts[Math.floor(Math.random() * shirts.length)];
    const randomPants = pants[Math.floor(Math.random() * pants.length)];
    const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];

    const combo: OutfitCombination = {
      id: `surprise-${Date.now()}`,
      user_id: user?.id || 'local-user',
      shirt_id: randomShirt.id,
      pants_id: randomPants.id,
      shoes_id: randomShoes.id,
      title: 'Surprise Combination',
      occasion: 'Spontaneous Day Wear',
      why_they_match: `Spontaneous pairing: ${randomShirt.primary_color} top with ${randomPants.primary_color} bottom and ${randomShoes.primary_color} footwear provides natural variety from your closet.`,
      color_compatibility: `${randomShirt.primary_color} & ${randomPants.primary_color}`,
      occasion_suitability: 'Versatile spontaneous day wear.',
      style_description: `${randomShirt.style} silhouette`,
      score: 8.8,
      created_at: new Date().toISOString(),
      shirt: randomShirt,
      pants: randomPants,
      shoes: randomShoes,
    };

    // Update 3D mannequin immediately
    setActiveMannequinOutfit({
      shirt: randomShirt,
      pants: randomPants,
      shoes: randomShoes,
    });

    return combo;
  }, [shirts, pants, shoes, user]);

  // Save Outfit
  const saveOutfit = useCallback(
    async (shirt: WardrobeItem, pants: WardrobeItem, shoes: WardrobeItem, name?: string, notes?: string) => {
      const currentUserId = user?.id || 'local-user';

      const newSaved: SavedOutfit = {
        id: `saved-${Date.now()}`,
        user_id: currentUserId,
        shirt_id: shirt.id,
        pants_id: pants.id,
        shoes_id: shoes.id,
        name: name || `${shirt.primary_color} Shirt + ${pants.primary_color} Pants`,
        notes: notes || null,
        created_at: new Date().toISOString(),
        shirt,
        pants,
        shoes,
      };

      if (isConfigured && user && user.id !== 'unauthenticated') {
        try {
          await supabase.from('saved_outfits').insert({
            id: newSaved.id,
            user_id: user.id,
            shirt_id: shirt.id,
            pants_id: pants.id,
            shoes_id: shoes.id,
            name: newSaved.name,
            notes: newSaved.notes,
          });
        } catch {}
      }

      setSavedOutfits((prev) => [newSaved, ...prev]);
    },
    [user, isConfigured, supabase]
  );

  const deleteSavedOutfit = useCallback(
    async (id: string) => {
      if (isConfigured && user && user.id !== 'unauthenticated') {
        try {
          await supabase.from('saved_outfits').delete().eq('id', id);
        } catch {}
      }
      setSavedOutfits((prev) => prev.filter((s) => s.id !== id));
    },
    [isConfigured, user, supabase]
  );

  const markOutfitWorn = useCallback(
    async (shirtId: string, pantsId: string, shoesId: string, occasion?: string) => {
      const currentUserId = user?.id || 'local-user';
      const today = new Date().toISOString().split('T')[0];

      await recordItemWorn(shirtId);
      await recordItemWorn(pantsId);
      await recordItemWorn(shoesId);

      const historyEntry: OutfitHistory = {
        id: `hist-${Date.now()}`,
        user_id: currentUserId,
        shirt_id: shirtId,
        pants_id: pantsId,
        shoes_id: shoesId,
        worn_date: today,
        occasion: occasion || 'Daily',
        created_at: new Date().toISOString(),
      };

      if (isConfigured && user && user.id !== 'unauthenticated') {
        try {
          await supabase.from('outfit_history').insert({
            id: historyEntry.id,
            user_id: user.id,
            shirt_id: shirtId,
            pants_id: pantsId,
            shoes_id: shoesId,
            worn_date: today,
            occasion: historyEntry.occasion,
          });
        } catch {}
      }

      setOutfitHistory((prev) => [historyEntry, ...prev]);
    },
    [user, isConfigured, supabase, recordItemWorn]
  );

  // Suggest My Outfit (AI Suggestions)
  const generateOutfits = useCallback(
    async (params: {
      occasion: string;
      weather?: string;
      preferredColor?: string;
      comfortLevel?: string;
      dressCode?: string;
    }) => {
      if (shirts.length === 0 || pants.length === 0 || shoes.length === 0) {
        const missing: string[] = [];
        if (shirts.length === 0) missing.push('Shirts');
        if (pants.length === 0) missing.push('Pants');
        if (shoes.length === 0) missing.push('Shoes');

        return {
          outfits: [],
          missingNotice: `You need at least one item in each category to curate outfits for ${params.occasion}. Please add your ${missing.join(', ')}.`,
        };
      }

      // Generate combinations
      const allCombos = generateAllMixAndMatch('all');
      const top3 = allCombos.slice(0, 3).map((combo, idx) => ({
        ...combo,
        title: idx === 0 ? 'Outfit 1 – Best Match' : idx === 1 ? 'Outfit 2 – Stylish Alternative' : 'Outfit 3 – Simple & Comfortable',
        occasion: params.occasion,
      }));

      setRecentSuggestions(top3);
      if (top3[0]) {
        setActiveMannequinOutfit({
          shirt: top3[0].shirt || null,
          pants: top3[0].pants || null,
          shoes: top3[0].shoes || null,
        });
      }

      return {
        outfits: top3,
      };
    },
    [shirts, pants, shoes, generateAllMixAndMatch]
  );

  // Smart Shopping (strictly on-demand only)
  const loadShoppingAnalysis = useCallback((): ShoppingRecommendation[] => {
    const recs: ShoppingRecommendation[] = [];
    const currentUserId = user?.id || 'local-user';

    // Check missing neutral shirt
    const hasWhiteShirt = shirts.some((s) => s.primary_color.toLowerCase().includes('white'));
    if (!hasWhiteShirt) {
      recs.push({
        id: `rec-shirt-white`,
        user_id: currentUserId,
        category: 'shirt',
        item_name: 'Crisp White Oxford Shirt',
        color: 'White',
        color_hex: '#FFFFFF',
        why_useful: 'A foundational white Oxford shirt pairs with 100% of your pants, instantly multiplying formal and casual outfit versatility.',
        matching_items_count: pants.length,
        new_combinations_count: Math.max(pants.length * shoes.length, 3),
        is_versatile: true,
        supported_occasions: ['College', 'Office', 'Casual outings', 'Formal meetings'],
      });
    }

    // Check missing versatile chinos
    const hasBeigePants = pants.some((p) => p.primary_color.toLowerCase().includes('beige') || p.primary_color.toLowerCase().includes('khaki'));
    if (!hasBeigePants) {
      recs.push({
        id: `rec-pants-beige`,
        user_id: currentUserId,
        category: 'pants',
        item_name: 'Tailored Beige Chino Trousers',
        color: 'Beige',
        color_hex: '#E1D9C5',
        why_useful: 'Provides an essential light-neutral anchor that breaks monotony and matches virtually all dark and colored shirts.',
        matching_items_count: shirts.length,
        new_combinations_count: Math.max(shirts.length * shoes.length, 3),
        is_versatile: true,
        supported_occasions: ['College', 'Casual outings', 'Friends meetups', 'Travel'],
      });
    }

    // Check missing clean white sneakers
    const hasWhiteSneakers = shoes.some((s) => s.primary_color.toLowerCase().includes('white'));
    if (!hasWhiteSneakers) {
      recs.push({
        id: `rec-shoes-white`,
        user_id: currentUserId,
        category: 'shoes',
        item_name: 'Minimalist White Leather Low-Top Sneakers',
        color: 'White',
        color_hex: '#FFFFFF',
        why_useful: 'The ultimate versatile shoe silhouette. Seamlessly transitions between jeans and tailored trousers.',
        matching_items_count: pants.length,
        new_combinations_count: Math.max(shirts.length * pants.length, 3),
        is_versatile: true,
        supported_occasions: ['College', 'Casual outings', 'Travel', 'Parties'],
      });
    }

    setShoppingRecommendations(recs);
    return recs;
  }, [shirts, pants, shoes, user]);

  const signOut = useCallback(async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}session_user`);
    setUser(null);
    setWardrobe([]);
    setSavedOutfits([]);
    setOutfitHistory([]);
    setActiveMannequinOutfit({ shirt: null, pants: null, shoes: null });
  }, [isConfigured, supabase]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    if (isConfigured && user.id !== 'unauthenticated') {
      try {
        await supabase.from('wardrobe_items').delete().eq('user_id', user.id);
        await supabase.from('saved_outfits').delete().eq('user_id', user.id);
        await supabase.from('outfit_history').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
      } catch {}
    }
    await signOut();
  }, [user, isConfigured, supabase, signOut]);

  return (
    <WardrobeContext.Provider
      value={{
        user,
        profile,
        wardrobe,
        shirts,
        pants,
        shoes,
        bodyShape,
        hasSelectedBodyShape,
        setBodyShape,
        outfitHistory,
        savedOutfits,
        shoppingRecommendations,
        recentSuggestions,
        activeMannequinOutfit,
        setActiveMannequinOutfit,
        isLoading,
        isAuthenticated,
        isConfigured,
        addItem,
        updateItem,
        deleteItem,
        toggleFavorite,
        recordItemWorn,
        generateOutfits,
        generateAllMixAndMatch,
        generateSurpriseMe,
        saveOutfit,
        deleteSavedOutfit,
        markOutfitWorn,
        loadShoppingAnalysis,
        signOut,
        deleteAccount,
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
