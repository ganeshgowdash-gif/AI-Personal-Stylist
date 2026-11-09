import Anthropic from '@anthropic-ai/sdk';
import { WardrobeItem, OutfitCombination, Occasion } from '@/types/database';

export interface OutfitSuggestionRequest {
  userId: string;
  wardrobe: WardrobeItem[];
  occasion: Occasion | string;
  weather?: string;
  season?: string;
  preferredColor?: string;
  comfortLevel?: string; // 'High', 'Medium', 'Balanced'
  dressCode?: string;    // 'Casual', 'Smart Casual', 'Business Formal', 'Party'
  timeOfDay?: string;    // 'Morning', 'Afternoon', 'Evening', 'Night'
}

export interface StylingEngineResult {
  outfits: OutfitCombination[];
  missingEssentials: string[];
  stylingSummary: string;
}

// Color compatibility matrix & rules
const NEUTRALS = new Set(['black', 'white', 'gray', 'grey', 'navy blue', 'navy', 'beige', 'cream', 'charcoal', 'khaki']);

function isNeutral(color: string): boolean {
  return NEUTRALS.has(color.toLowerCase().trim());
}

function evaluateColorScore(top?: WardrobeItem, bottom?: WardrobeItem, footwear?: WardrobeItem): number {
  if (!top || !bottom) return 5;
  const topColor = top.primary_color.toLowerCase();
  const bottomColor = bottom.primary_color.toLowerCase();

  // Rule 1: Neutral + Accent or Neutral + Neutral is always harmonious
  if (isNeutral(topColor) && isNeutral(bottomColor)) {
    // Avoid monochrome beige-on-beige or black-on-black without contrast
    if (topColor === bottomColor && topColor !== 'black') return 8;
    return 9.5;
  }
  if (isNeutral(topColor) || isNeutral(bottomColor)) {
    return 9.0;
  }

  // Classic complementary pairs
  const classicPairs: Record<string, string[]> = {
    'blue': ['brown', 'tan', 'beige', 'white', 'gray', 'burgundy'],
    'olive green': ['white', 'black', 'navy', 'beige', 'cream', 'gray'],
    'burgundy': ['navy', 'gray', 'black', 'white', 'charcoal'],
    'brown': ['blue', 'navy blue', 'cream', 'white', 'forest green'],
  };

  for (const [key, matches] of Object.entries(classicPairs)) {
    if (topColor.includes(key) && matches.some(m => bottomColor.includes(m))) return 9.2;
    if (bottomColor.includes(key) && matches.some(m => topColor.includes(m))) return 9.2;
  }

  return 7.5;
}

export async function generateOutfitRecommendations(
  request: OutfitSuggestionRequest
): Promise<StylingEngineResult> {
  const { wardrobe, occasion, weather, season, preferredColor, comfortLevel, dressCode, timeOfDay, userId } = request;

  if (!occasion) {
    throw new Error('Occasion is required to generate outfit suggestions.');
  }

  // Separate wardrobe by category
  const tops = wardrobe.filter((item) => item.category === 'tops');
  const bottoms = wardrobe.filter((item) => item.category === 'bottoms');
  const footwear = wardrobe.filter((item) => item.category === 'footwear');
  const outerwear = wardrobe.filter((item) => item.category === 'outerwear');
  const accessories = wardrobe.filter((item) => item.category === 'accessories');

  // Identify missing essentials if any critical category is completely empty
  const missingEssentials: string[] = [];
  if (tops.length === 0) missingEssentials.push('A versatile top (e.g. White Oxford Shirt or Essential Tee)');
  if (bottoms.length === 0) missingEssentials.push('A staple bottom (e.g. Slim Chinos or Tapered Jeans)');
  if (footwear.length === 0) missingEssentials.push('A versatile pair of footwear (e.g. Minimal White Sneakers)');

  if (tops.length === 0 || bottoms.length === 0) {
    return {
      outfits: [],
      missingEssentials,
      stylingSummary: `Your wardrobe needs at least one top and one bottom to generate outfits for ${occasion}. Please upload items to continue.`,
    };
  }

  // Check if Anthropic API is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && !apiKey.includes('your-anthropic-api-key') && apiKey.startsWith('sk-ant')) {
    try {
      const claudeResult = await callClaudeStylist(request);
      if (claudeResult && claudeResult.outfits.length > 0) {
        // STRICT SERVER-SIDE VALIDATION:
        // Ensure every item ID returned genuinely exists in the user's wardrobe!
        const validWardrobeIds = new Set(wardrobe.map((item) => item.id));

        const verifiedOutfits = claudeResult.outfits.map((outfit) => {
          const validTop = outfit.top_item_id && validWardrobeIds.has(outfit.top_item_id) ? outfit.top_item_id : null;
          const validBottom = outfit.bottom_item_id && validWardrobeIds.has(outfit.bottom_item_id) ? outfit.bottom_item_id : null;
          const validFootwear = outfit.footwear_item_id && validWardrobeIds.has(outfit.footwear_item_id) ? outfit.footwear_item_id : null;
          const validOuterwear = outfit.outerwear_item_id && validWardrobeIds.has(outfit.outerwear_item_id) ? outfit.outerwear_item_id : null;
          const validAccessories = (outfit.accessory_item_ids || []).filter((id) => validWardrobeIds.has(id));

          return {
            ...outfit,
            user_id: userId,
            top_item_id: validTop || tops[0]?.id || null,
            bottom_item_id: validBottom || bottoms[0]?.id || null,
            footwear_item_id: validFootwear || footwear[0]?.id || null,
            outerwear_item_id: validOuterwear,
            accessory_item_ids: validAccessories,
          };
        });

        return {
          outfits: hydrateOutfits(verifiedOutfits, wardrobe),
          missingEssentials: claudeResult.missingEssentials || missingEssentials,
          stylingSummary: claudeResult.stylingSummary,
        };
      }
    } catch (err) {
      console.warn('Claude stylist error, proceeding with high-precision deterministic rules engine:', err);
    }
  }

  // Deterministic Rules-Based Stylist Engine
  // Strictly uses ONLY the user's real items with zero hallucinations
  return runRulesBasedStylist(request);
}

async function callClaudeStylist(request: OutfitSuggestionRequest): Promise<StylingEngineResult | null> {
  const { wardrobe, occasion, weather, season, preferredColor, comfortLevel, dressCode, timeOfDay, userId } = request;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const wardrobeManifest = wardrobe.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    primary_color: item.primary_color,
    pattern: item.pattern,
    style: item.style,
    fit: item.fit,
    times_worn: item.times_worn,
  }));

  const systemPrompt = `You are a world-class luxury fashion director and master personal stylist for the "AI Personal Stylist" platform.
CRITICAL MANDATORY RULES:
1. You MUST recommend ONLY clothing items from the provided user's wardrobe manifest.
2. Under NO circumstance should you invent, assume, or hallucinate item IDs or clothing.
3. Every referenced item ID MUST strictly match an "id" from the manifest.
4. If a piece (like outerwear or shoes) is missing or scarce, note it in "missing_pieces_notes" instead of fabricating.
5. Create exactly three distinct outfit tiers:
   - "Outfit 1 – Best Match": Optimal harmony of elegance, dress code, and occasion.
   - "Outfit 2 – Stylish Alternative": Fashion-forward, creative color contrast, modern layering.
   - "Outfit 3 – Simple and Comfortable": Effortless, highest comfort index, clean minimal silhouette.
6. Provide comprehensive, articulate explanations for:
   - color_harmony_explanation
   - occasion_fit_explanation
   - shoes_fit_explanation
   - accessories_explanation
   - general_styling_tips

Return ONLY valid JSON matching this schema:
{
  "stylingSummary": "Concise overview of the styling direction for this occasion",
  "missingEssentials": ["Item 1 description if any is lacking"],
  "outfits": [
    {
      "id": "outfit-1",
      "title": "Outfit 1 – Best Match",
      "tier": "best_match",
      "occasion": "${occasion}",
      "weather": "${weather || 'Standard'}",
      "season": "${season || 'All-Season'}",
      "top_item_id": "UUID from wardrobe",
      "bottom_item_id": "UUID from wardrobe",
      "outerwear_item_id": "UUID from wardrobe or null",
      "footwear_item_id": "UUID from wardrobe or null",
      "accessory_item_ids": ["UUIDs from wardrobe"],
      "color_harmony_explanation": "Detailed rationale on tone balance, contrasts, and neutral grounding",
      "occasion_fit_explanation": "Why this specific combination flatters ${occasion}",
      "shoes_fit_explanation": "Why the footwear anchors the look",
      "accessories_explanation": "How the watch/belt/sunglasses elevate the ensemble",
      "general_styling_tips": "Tucking, cuffing, or collar tips",
      "missing_pieces_notes": null,
      "score": 9.6
    }
  ]
}`;

  const userContent = `Occasion: ${occasion}
Weather: ${weather || 'Mild'}
Season: ${season || 'Current'}
Preferred Color: ${preferredColor || 'Any'}
Comfort Level: ${comfortLevel || 'Balanced'}
Dress Code: ${dressCode || 'Appropriate'}
Time of Day: ${timeOfDay || 'Daytime'}

Available Wardrobe Manifest:
${JSON.stringify(wardrobeManifest, null, 2)}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2500,
    messages: [
      { role: 'user', content: userContent }
    ],
    system: systemPrompt,
  });

  const textBlock = response.content.find((c) => c.type === 'text');
  if (textBlock && 'text' in textBlock) {
    const raw = textBlock.text.trim();
    const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  }

  return null;
}

function runRulesBasedStylist(request: OutfitSuggestionRequest): StylingEngineResult {
  const { wardrobe, occasion, weather, season, preferredColor, userId } = request;

  const tops = wardrobe.filter((item) => item.category === 'tops');
  const bottoms = wardrobe.filter((item) => item.category === 'bottoms');
  const footwear = wardrobe.filter((item) => item.category === 'footwear');
  const outerwear = wardrobe.filter((item) => item.category === 'outerwear');
  const accessories = wardrobe.filter((item) => item.category === 'accessories');

  const occasionLower = occasion.toLowerCase();
  const isFormal = occasionLower.includes('office') || occasionLower.includes('formal') || occasionLower.includes('meeting') || occasionLower.includes('wedding');
  const isParty = occasionLower.includes('party') || occasionLower.includes('birthday') || occasionLower.includes('club') || occasionLower.includes('date');
  const isSporty = occasionLower.includes('sports') || occasionLower.includes('gym') || occasionLower.includes('running');

  // Sort tops by occasion fit and least recently worn to prevent repeating
  const sortedTops = [...tops].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (preferredColor && a.primary_color.toLowerCase().includes(preferredColor.toLowerCase())) scoreA += 4;
    if (preferredColor && b.primary_color.toLowerCase().includes(preferredColor.toLowerCase())) scoreB += 4;
    if (isFormal && (a.subcategory === 'shirt' || a.style === 'formal')) scoreA += 5;
    if (isFormal && (b.subcategory === 'shirt' || b.style === 'formal')) scoreB += 5;
    if (isParty && (a.primary_color.toLowerCase() === 'black' || a.style === 'party')) scoreA += 3;
    if (isSporty && (a.subcategory === 't-shirt' || a.style === 'sporty')) scoreA += 5;
    // Prefer items worn less frequently
    scoreA -= (a.times_worn || 0) * 0.2;
    scoreB -= (b.times_worn || 0) * 0.2;
    return scoreB - scoreA;
  });

  const sortedBottoms = [...bottoms].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (isFormal && (a.subcategory === 'chinos' || a.subcategory === 'formal pants')) scoreA += 5;
    if (isFormal && (b.subcategory === 'chinos' || b.subcategory === 'formal pants')) scoreB += 5;
    if (!isFormal && (a.subcategory === 'jeans' || a.subcategory === 'chinos')) scoreA += 3;
    return scoreB - scoreA;
  });

  // Pick items for Outfit 1 – Best Match
  const top1 = sortedTops[0];
  const bottom1 = sortedBottoms[0];
  const shoes1 = footwear.find((f) => isFormal ? f.subcategory === 'formal shoes' || f.style === 'formal' : true) || footwear[0];
  const outer1 = outerwear.length > 0 && (weather?.toLowerCase().includes('cold') || isFormal) ? outerwear[0] : null;
  const acc1 = accessories.slice(0, 2).map((a) => a.id);

  // Pick items for Outfit 2 – Stylish Alternative
  const top2 = sortedTops[1] || sortedTops[0];
  const bottom2 = sortedBottoms[1] || sortedBottoms[0];
  const shoes2 = footwear[1] || footwear[0];
  const outer2 = outerwear[1] || (outerwear[0] !== outer1 ? outerwear[0] : null);
  const acc2 = accessories.slice(1, 3).map((a) => a.id);

  // Pick items for Outfit 3 – Simple and Comfortable
  // Prefer relaxed fits, t-shirts, joggers, sneakers
  const comfyTops = [...tops].sort((a, b) => (a.subcategory === 't-shirt' || a.subcategory === 'hoodie' || a.fit === 'relaxed' ? -1 : 1));
  const comfyBottoms = [...bottoms].sort((a, b) => (a.subcategory === 'joggers' || a.subcategory === 'shorts' || a.subcategory === 'jeans' ? -1 : 1));
  const comfyShoes = footwear.find((f) => f.subcategory === 'sneakers' || f.subcategory === 'sandals') || footwear[0];

  const top3 = comfyTops[0] || sortedTops[0];
  const bottom3 = comfyBottoms[0] || sortedBottoms[0];
  const shoes3 = comfyShoes || footwear[0];
  const acc3 = accessories.slice(0, 1).map((a) => a.id);

  const missingEssentials: string[] = [];
  if (footwear.length === 0) missingEssentials.push('Clean casual sneakers or versatile leather shoes');
  if (accessories.length === 0) missingEssentials.push('A minimalist watch or leather belt');
  if (isFormal && !tops.some(t => t.subcategory === 'shirt')) missingEssentials.push('A crisp formal dress shirt');

  const outfits: OutfitCombination[] = [
    {
      id: `outfit-${Date.now()}-1`,
      user_id: userId,
      title: 'Outfit 1 – Best Match',
      tier: 'best_match',
      occasion,
      weather: weather || 'Mild',
      season: season || 'All-Season',
      top_item_id: top1?.id || null,
      bottom_item_id: bottom1?.id || null,
      outerwear_item_id: outer1?.id || null,
      footwear_item_id: shoes1?.id || null,
      accessory_item_ids: acc1,
      color_harmony_explanation: top1 && bottom1
        ? `The ${top1.primary_color} of the ${top1.name} provides clean visual proportion against the ${bottom1.primary_color} ${bottom1.name}, creating balanced contrast without clashing.`
        : 'Harmonious neutral palette calibrated for balanced contrast.',
      occasion_fit_explanation: `Tailored specifically for ${occasion}. The silhouette respects the dress code while maintaining effortless sophistication.`,
      shoes_fit_explanation: shoes1
        ? `The ${shoes1.primary_color} ${shoes1.name} anchors the lower half, offering clean lines and occasion-appropriate formality.`
        : 'Clean footwear completes the proportion of the pants silhouette.',
      accessories_explanation: acc1.length > 0
        ? 'Selected accessories add tasteful detail without overpowering the outfit.'
        : 'Kept intentionally minimal for an uncluttered modern aesthetic.',
      general_styling_tips: 'Consider a clean half-tuck or cuffing the hem slightly for a contemporary silhouette.',
      missing_pieces_notes: missingEssentials.length > 0 ? `Consider adding: ${missingEssentials.join(', ')}` : null,
      score: 9.7,
      created_at: new Date().toISOString(),
    },
    {
      id: `outfit-${Date.now()}-2`,
      user_id: userId,
      title: 'Outfit 2 – Stylish Alternative',
      tier: 'stylish_alternative',
      occasion,
      weather: weather || 'Mild',
      season: season || 'All-Season',
      top_item_id: top2?.id || null,
      bottom_item_id: bottom2?.id || null,
      outerwear_item_id: outer2?.id || null,
      footwear_item_id: shoes2?.id || null,
      accessory_item_ids: acc2,
      color_harmony_explanation: top2 && bottom2
        ? `A modern tonal approach pairing ${top2.primary_color} with ${bottom2.primary_color} for understated depth and textural interest.`
        : 'Contemporary fashion-forward tonal pairing.',
      occasion_fit_explanation: `A creative alternative for ${occasion} that feels fresh, youthful, and intentionally curated.`,
      shoes_fit_explanation: shoes2
        ? `${shoes2.name} introduces an updated texture that bridges the top and bottom effortlessly.`
        : 'Complements the relaxed yet refined trouser cut.',
      accessories_explanation: 'Accent pieces introduce visual highlights and showcase personal style.',
      general_styling_tips: 'Pair with rolled sleeves or unbuttoned collar for an effortless smart-casual posture.',
      missing_pieces_notes: null,
      score: 9.2,
      created_at: new Date().toISOString(),
    },
    {
      id: `outfit-${Date.now()}-3`,
      user_id: userId,
      title: 'Outfit 3 – Simple and Comfortable',
      tier: 'comfortable',
      occasion,
      weather: weather || 'Mild',
      season: season || 'All-Season',
      top_item_id: top3?.id || null,
      bottom_item_id: bottom3?.id || null,
      outerwear_item_id: null,
      footwear_item_id: shoes3?.id || null,
      accessory_item_ids: acc3,
      color_harmony_explanation: top3 && bottom3
        ? `Relaxed neutral synergy pairing ${top3.primary_color} with ${bottom3.primary_color} for high ease of wear and zero friction.`
        : 'Subtle and soft palette focused on ease and versatility.',
      occasion_fit_explanation: `Prioritizes comfort and unrestricted mobility while maintaining a clean, well-proportioned appearance suitable for ${occasion}.`,
      shoes_fit_explanation: shoes3
        ? `Comfortable ${shoes3.name} guarantees all-day support with clean street appeal.`
        : 'Casual footwear for maximum day-long comfort.',
      accessories_explanation: 'Minimal accents kept light and practical.',
      general_styling_tips: 'Opt for relaxed drape; comfortable fabrics look best when worn naturally.',
      missing_pieces_notes: null,
      score: 8.9,
      created_at: new Date().toISOString(),
    },
  ];

  return {
    outfits: hydrateOutfits(outfits, wardrobe),
    missingEssentials,
    stylingSummary: `Curated 3 personalized combinations for ${occasion} using your verified wardrobe pieces.`,
  };
}

function hydrateOutfits(outfits: OutfitCombination[], wardrobe: WardrobeItem[]): OutfitCombination[] {
  const itemMap = new Map(wardrobe.map((i) => [i.id, i]));
  return outfits.map((outfit) => ({
    ...outfit,
    top_item: outfit.top_item_id ? itemMap.get(outfit.top_item_id) || null : null,
    bottom_item: outfit.bottom_item_id ? itemMap.get(outfit.bottom_item_id) || null : null,
    outerwear_item: outfit.outerwear_item_id ? itemMap.get(outfit.outerwear_item_id) || null : null,
    footwear_item: outfit.footwear_item_id ? itemMap.get(outfit.footwear_item_id) || null : null,
    accessory_items: (outfit.accessory_item_ids || [])
      .map((id) => itemMap.get(id))
      .filter((i): i is WardrobeItem => Boolean(i)),
  }));
}

