import { WardrobeItem, ShoppingRecommendation, CheckBeforeBuyingResult, ClothingCategory, Subcategory } from '@/types/database';

export function analyzeWardrobeForShopping(
  wardrobe: WardrobeItem[],
  userId: string
): ShoppingRecommendation[] {
  const recommendations: ShoppingRecommendation[] = [];

  const tops = wardrobe.filter((i) => i.category === 'tops');
  const bottoms = wardrobe.filter((i) => i.category === 'bottoms');
  const footwear = wardrobe.filter((i) => i.category === 'footwear');
  const outerwear = wardrobe.filter((i) => i.category === 'outerwear');
  const accessories = wardrobe.filter((i) => i.category === 'accessories');

  const ownedColors = new Set(wardrobe.map((i) => i.primary_color.toLowerCase()));
  const ownedSubcategories = new Set(wardrobe.map((i) => i.subcategory));

  // Check 1: Missing crisp white shirt / top
  const hasWhiteTop = tops.some(
    (t) => t.primary_color.toLowerCase() === 'white' && (t.subcategory === 'shirt' || t.subcategory === 't-shirt')
  );
  if (!hasWhiteTop) {
    const matchingBottoms = bottoms;
    recommendations.push({
      id: `rec-${Date.now()}-1`,
      user_id: userId,
      item_name: 'Crisp White Oxford Cotton Shirt',
      category: 'tops',
      subcategory: 'shirt',
      color: 'White',
      color_hex: '#FFFFFF',
      matching_item_ids: matchingBottoms.map((b) => b.id),
      enabled_outfits_count: Math.max(matchingBottoms.length * 2, 4),
      color_compatibility: ['Navy Blue', 'Black', 'Charcoal', 'Beige', 'Olive Green', 'Denim'],
      supported_occasions: ['Office', 'Formal meetings', 'Casual outings', 'Dates', 'College'],
      versatility_rating: 'Very High',
      verdict: 'Must Buy',
      reasoning: 'A foundational white Oxford shirt anchors every wardrobe. It instantly pairs with 100% of your pants, transitioning from college to boardroom seamlessly.',
      status: 'suggested',
      created_at: new Date().toISOString(),
      matching_items: matchingBottoms,
    });
  }

  // Check 2: Missing versatile neutral chinos (Beige or Olive)
  const hasBeigeChinos = bottoms.some(
    (b) => b.subcategory === 'chinos' && (b.primary_color.toLowerCase() === 'beige' || b.primary_color.toLowerCase() === 'khaki')
  );
  if (!hasBeigeChinos) {
    const matchingTops = tops;
    recommendations.push({
      id: `rec-${Date.now()}-2`,
      user_id: userId,
      item_name: 'Tailored Beige Chino Trousers',
      category: 'bottoms',
      subcategory: 'chinos',
      color: 'Beige',
      color_hex: '#F5F5DC',
      matching_item_ids: matchingTops.map((t) => t.id),
      enabled_outfits_count: Math.max(matchingTops.length * 2, 5),
      color_compatibility: ['Navy Blue', 'Black', 'White', 'Olive Green', 'Burgundy', 'Brown'],
      supported_occasions: ['College', 'Office', 'Casual outings', 'Friends meetups', 'Travel'],
      versatility_rating: 'Very High',
      verdict: 'Must Buy',
      reasoning: 'Beige chinos break the monotony of blue denim and black pants. They provide warmth, bridge formal and casual styles, and harmonize with dark or pastel tops.',
      status: 'suggested',
      created_at: new Date().toISOString(),
      matching_items: matchingTops,
    });
  }

  // Check 3: Minimalist White Leather Sneakers
  const hasWhiteSneakers = footwear.some(
    (f) => f.subcategory === 'sneakers' && f.primary_color.toLowerCase() === 'white'
  );
  if (!hasWhiteSneakers) {
    const allPants = bottoms;
    recommendations.push({
      id: `rec-${Date.now()}-3`,
      user_id: userId,
      item_name: 'Minimalist White Leather Low-Top Sneakers',
      category: 'footwear',
      subcategory: 'sneakers',
      color: 'White',
      color_hex: '#FFFFFF',
      matching_item_ids: allPants.map((p) => p.id),
      enabled_outfits_count: Math.max(allPants.length * 3, 6),
      color_compatibility: ['All Colors', 'Denim', 'Charcoal', 'Khaki', 'Navy Blue'],
      supported_occasions: ['College', 'Casual outings', 'Travel', 'Friends meetups', 'Dates'],
      versatility_rating: 'Very High',
      verdict: 'Must Buy',
      reasoning: 'The modern footwear hero. Uncluttered white leather sneakers instantly modernize jeans, chinos, and even casual blazers without visual clutter.',
      status: 'suggested',
      created_at: new Date().toISOString(),
      matching_items: allPants,
    });
  }

  // Check 4: Versatile Outerwear layer (Navy or Charcoal Jacket)
  if (outerwear.length === 0) {
    const matchingTops = tops.slice(0, 4);
    recommendations.push({
      id: `rec-${Date.now()}-4`,
      user_id: userId,
      item_name: 'Unstructured Navy Overshirt or Blazer',
      category: 'outerwear',
      subcategory: 'jacket',
      color: 'Navy Blue',
      color_hex: '#000080',
      matching_item_ids: matchingTops.map((t) => t.id),
      enabled_outfits_count: Math.max(matchingTops.length * 2, 4),
      color_compatibility: ['White', 'Gray', 'Beige', 'Black', 'Light Blue'],
      supported_occasions: ['Office', 'Dates', 'Evenings', 'Travel', 'Parties'],
      versatility_rating: 'High',
      verdict: 'Strongly Recommended',
      reasoning: 'Layering adds dimension to any silhouette. A navy overshirt dresses up a plain t-shirt and sharpens casual pants effortlessly.',
      status: 'suggested',
      created_at: new Date().toISOString(),
      matching_items: matchingTops,
    });
  }

  // Check 5: Minimalist Watch or Leather Belt
  const hasWatch = accessories.some((a) => a.subcategory === 'watch');
  if (!hasWatch) {
    recommendations.push({
      id: `rec-${Date.now()}-5`,
      user_id: userId,
      item_name: 'Brushed Silver Minimalist Watch',
      category: 'accessories',
      subcategory: 'watch',
      color: 'Silver',
      color_hex: '#C0C0C0',
      matching_item_ids: wardrobe.slice(0, 6).map((w) => w.id),
      enabled_outfits_count: 8,
      color_compatibility: ['Universal'],
      supported_occasions: ['All Occasions', 'Office', 'College', 'Formal meetings', 'Dates'],
      versatility_rating: 'Very High',
      verdict: 'Strongly Recommended',
      reasoning: 'A clean wrist accessory acts as a subtle punctuation mark, signalling intentionality and attention to detail without looking loud.',
      status: 'suggested',
      created_at: new Date().toISOString(),
      matching_items: wardrobe.slice(0, 4),
    });
  }

  return recommendations;
}

export function evaluateCheckBeforeBuying(
  scannedItem: {
    name: string;
    category: ClothingCategory;
    subcategory: Subcategory;
    primary_color: string;
    primary_color_hex: string;
    secondary_colors?: any[];
    pattern?: string;
    style?: string;
    confidence_score?: number;
  },
  wardrobe: WardrobeItem[]
): CheckBeforeBuyingResult {
  const scannedColorLower = scannedItem.primary_color.toLowerCase();

  // 1. Duplicate check: Does user own an item of same subcategory and similar color?
  const duplicate = wardrobe.find(
    (w) =>
      w.subcategory === scannedItem.subcategory &&
      (w.primary_color.toLowerCase() === scannedColorLower ||
        (w.primary_color_hex && scannedItem.primary_color_hex &&
          colorDistance(w.primary_color_hex, scannedItem.primary_color_hex) < 40))
  );

  // 2. Matching items finder:
  // If scanned item is a TOP, find bottoms, shoes, and outerwear that match it.
  // If scanned item is a BOTTOM, find tops, shoes, and outerwear that match it.
  // If footwear, find tops and bottoms.
  let matchingItems: WardrobeItem[] = [];

  if (scannedItem.category === 'tops') {
    matchingItems = wardrobe.filter((item) => {
      if (item.category === 'bottoms') {
        const bottomColor = item.primary_color.toLowerCase();
        // High harmony if one is neutral or classic contrast
        return (
          isNeutralColor(scannedColorLower) ||
          isNeutralColor(bottomColor) ||
          scannedColorLower !== bottomColor
        );
      }
      if (item.category === 'footwear') return true;
      if (item.category === 'outerwear') return item.primary_color.toLowerCase() !== scannedColorLower;
      return false;
    });
  } else if (scannedItem.category === 'bottoms') {
    matchingItems = wardrobe.filter((item) => {
      if (item.category === 'tops') {
        const topColor = item.primary_color.toLowerCase();
        return isNeutralColor(scannedColorLower) || isNeutralColor(topColor) || scannedColorLower !== topColor;
      }
      if (item.category === 'footwear') return true;
      return false;
    });
  } else {
    // Outerwear, footwear, accessories
    matchingItems = wardrobe.filter((item) => item.category === 'tops' || item.category === 'bottoms');
  }

  const enabledOutfitsCount = Math.min(Math.max(matchingItems.length, 1), 8);
  const isDuplicate = Boolean(duplicate);

  let verdict: 'Buy' | 'Consider Alternative' | 'Do Not Buy' = 'Buy';
  let verdict_reasoning = '';

  if (isDuplicate && duplicate) {
    verdict = 'Do Not Buy';
    verdict_reasoning = `You already own "${duplicate.name}" (${duplicate.primary_color} ${duplicate.subcategory}). Buying another near-identical piece will not expand your wardrobe versatility and leads to redundant spending.`;
  } else if (matchingItems.length < 2) {
    verdict = 'Consider Alternative';
    verdict_reasoning = `This ${scannedItem.name} matches very few existing items in your wardrobe. Buying it will force you to purchase additional clothes just to style it. Consider a more versatile neutral shade.`;
  } else {
    verdict = 'Buy';
    verdict_reasoning = `Highly versatile addition! This ${scannedItem.name} matches ${matchingItems.length} of your current wardrobe pieces and unlocks at least ${enabledOutfitsCount} fresh outfit combinations across multiple occasions.`;
  }

  // Create 2-3 visual potential combinations
  const potentialCombinations: Array<{
    title: string;
    occasion: string;
    items: WardrobeItem[];
    why_it_works: string;
  }> = [];

  const topMatch = scannedItem.category === 'tops' 
    ? null 
    : matchingItems.find((i) => i.category === 'tops') || null;

  const bottomMatch = scannedItem.category === 'bottoms'
    ? null
    : matchingItems.find((i) => i.category === 'bottoms') || null;

  const shoesMatch = matchingItems.find((i) => i.category === 'footwear');

  if (topMatch || bottomMatch) {
    const pairedItems = [topMatch, bottomMatch, shoesMatch].filter((i): i is WardrobeItem => Boolean(i));
    potentialCombinations.push({
      title: 'Combination 1 – Daily Sharp',
      occasion: 'Casual outings & College',
      items: pairedItems,
      why_it_works: `Pairs the new ${scannedItem.name} with your existing ${pairedItems.map((p) => p.name).join(' and ')} for balanced contrast.`,
    });
  }

  return {
    recognized_item: {
      name: scannedItem.name,
      category: scannedItem.category,
      subcategory: scannedItem.subcategory,
      primary_color: scannedItem.primary_color,
      primary_color_hex: scannedItem.primary_color_hex,
      secondary_colors: scannedItem.secondary_colors || [],
      pattern: (scannedItem.pattern || 'solid') as any,
      style: (scannedItem.style || 'casual') as any,
      confidence_score: scannedItem.confidence_score || 0.94,
    },
    matches_existing_clothes: matchingItems.length > 0,
    enabled_outfits_count: enabledOutfitsCount,
    matching_items: matchingItems,
    is_duplicate: isDuplicate,
    duplicate_item: duplicate || null,
    verdict,
    verdict_reasoning,
    potential_combinations: potentialCombinations,
  };
}

function isNeutralColor(color: string): boolean {
  const neutrals = ['black', 'white', 'gray', 'grey', 'navy', 'navy blue', 'beige', 'cream', 'charcoal', 'khaki'];
  return neutrals.some((n) => color.includes(n));
}

function colorDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16) || 0;
  const g1 = parseInt(hex1.slice(3, 5), 16) || 0;
  const b1 = parseInt(hex1.slice(5, 7), 16) || 0;

  const r2 = parseInt(hex2.slice(1, 3), 16) || 0;
  const g2 = parseInt(hex2.slice(3, 5), 16) || 0;
  const b2 = parseInt(hex2.slice(5, 7), 16) || 0;

  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

