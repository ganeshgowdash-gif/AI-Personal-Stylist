import Anthropic from '@anthropic-ai/sdk';
import { WardrobeItem, OutfitCombination } from '@/types/database';

export interface OutfitSuggestionRequest {
  userId: string;
  wardrobe: WardrobeItem[];
  occasion: string;
  weather?: string;
  season?: string;
  preferredColor?: string;
  comfortLevel?: string;
  dressCode?: string;
  timeOfDay?: string;
}

export interface StylingEngineResult {
  outfits: OutfitCombination[];
  missingEssentials: string[];
  stylingSummary: string;
}

const NEUTRALS = new Set(['black', 'white', 'gray', 'grey', 'navy blue', 'navy', 'beige', 'cream', 'charcoal', 'khaki']);

function isNeutral(color: string): boolean {
  return NEUTRALS.has(color.toLowerCase().trim());
}

export async function generateOutfitRecommendations(
  request: OutfitSuggestionRequest
): Promise<StylingEngineResult> {
  const { wardrobe, occasion, weather, preferredColor, userId } = request;

  if (!occasion) {
    throw new Error('Occasion is required to generate outfit suggestions.');
  }

  const shirts = wardrobe.filter((i) => i.category === 'shirt');
  const pants = wardrobe.filter((i) => i.category === 'pants');
  const shoes = wardrobe.filter((i) => i.category === 'shoes');

  const missingEssentials: string[] = [];
  if (shirts.length === 0) missingEssentials.push('At least one Shirt (e.g. Oxford Shirt or T-Shirt)');
  if (pants.length === 0) missingEssentials.push('At least one pair of Pants (e.g. Chinos or Jeans)');
  if (shoes.length === 0) missingEssentials.push('At least one pair of Shoes (e.g. Sneakers or Formal Shoes)');

  if (shirts.length === 0 || pants.length === 0 || shoes.length === 0) {
    return {
      outfits: [],
      missingEssentials,
      stylingSummary: `Your wardrobe needs at least one shirt, one pair of pants, and one pair of shoes to curate outfits for ${occasion}. Please add your ${missingEssentials.join(', ')}.`,
    };
  }

  // Check Claude API if key configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && !apiKey.includes('your-anthropic-api-key') && apiKey.startsWith('sk-ant')) {
    try {
      const claudeResult = await callClaudeStylist(request, shirts, pants, shoes);
      if (claudeResult && claudeResult.outfits.length > 0) {
        // Validate returned IDs exist in user's wardrobe
        const validWardrobeMap = new Map(wardrobe.map((item) => [item.id, item]));

        const verifiedOutfits: OutfitCombination[] = [];
        for (const out of claudeResult.outfits) {
          const shirt = validWardrobeMap.get(out.shirt_id);
          const p = validWardrobeMap.get(out.pants_id);
          const sh = validWardrobeMap.get(out.shoes_id);

          if (shirt && p && sh) {
            verifiedOutfits.push({
              ...out,
              user_id: userId,
              shirt_id: shirt.id,
              pants_id: p.id,
              shoes_id: sh.id,
              shirt,
              pants: p,
              shoes: sh,
            });
          }
        }

        if (verifiedOutfits.length > 0) {
          return {
            outfits: verifiedOutfits.slice(0, 3),
            missingEssentials: claudeResult.missingEssentials || [],
            stylingSummary: claudeResult.stylingSummary,
          };
        }
      }
    } catch (err) {
      console.warn('Claude styling error, using deterministic rules engine:', err);
    }
  }

  return runRulesBasedStylist(request, shirts, pants, shoes);
}

async function callClaudeStylist(
  request: OutfitSuggestionRequest,
  shirts: WardrobeItem[],
  pants: WardrobeItem[],
  shoes: WardrobeItem[]
): Promise<StylingEngineResult | null> {
  const { occasion, weather, preferredColor } = request;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const manifest = {
    shirts: shirts.map((s) => ({ id: s.id, name: s.name, type: s.item_type, color: s.primary_color, style: s.style })),
    pants: pants.map((p) => ({ id: p.id, name: p.name, type: p.item_type, color: p.primary_color, style: p.style })),
    shoes: shoes.map((sh) => ({ id: sh.id, name: sh.name, type: sh.item_type, color: sh.primary_color, style: sh.style })),
  };

  const systemPrompt = `You are the master fashion director for "AI Personal Wardrobe".
MANDATORY RULES:
1. ONLY recommend items that exist in the provided wardrobe manifest. NEVER fabricate item IDs.
2. Return exactly 3 combinations:
   - "Outfit 1 – Best Match"
   - "Outfit 2 – Stylish Alternative"
   - "Outfit 3 – Simple and Comfortable"
3. For each outfit, provide exact why_they_match, color_compatibility, occasion_suitability, style_description.
4. Output strictly valid JSON matching this schema:
{
  "stylingSummary": "Summary text",
  "missingEssentials": [],
  "outfits": [
    {
      "id": "outfit-1",
      "title": "Outfit 1 – Best Match",
      "occasion": "${occasion}",
      "shirt_id": "ID",
      "pants_id": "ID",
      "shoes_id": "ID",
      "why_they_match": "Reasoning",
      "color_compatibility": "Color harmony",
      "occasion_suitability": "Why it suits the occasion",
      "style_description": "Style description",
      "score": 9.5
    }
  ]
}

Available Wardrobe Pieces:
${JSON.stringify(manifest, null, 2)}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1400,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Suggest 3 outfits for ${occasion}. Preferred color: ${preferredColor || 'Any'}. Weather: ${weather || 'Mild'}.` }],
  });

  const textBlock = response.content.find((c) => c.type === 'text');
  if (!textBlock || !('text' in textBlock)) return null;

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  return JSON.parse(jsonMatch[0]) as StylingEngineResult;
}

function runRulesBasedStylist(
  request: OutfitSuggestionRequest,
  shirts: WardrobeItem[],
  pants: WardrobeItem[],
  shoes: WardrobeItem[]
): StylingEngineResult {
  const { occasion, preferredColor, userId } = request;

  // Rank combinations by color harmony and occasion fit
  const combos: OutfitCombination[] = [];

  for (const s of shirts) {
    for (const p of pants) {
      for (const sh of shoes) {
        let score = 8.0;

        const isTopNeutral = isNeutral(s.primary_color);
        const isBottomNeutral = isNeutral(p.primary_color);

        if (isTopNeutral && isBottomNeutral) score += 1.2;
        else if (isTopNeutral || isBottomBottomNeutral(p.primary_color)) score += 0.8;

        if (s.primary_color.toLowerCase() !== p.primary_color.toLowerCase() || s.primary_color.toLowerCase() === 'black') {
          score += 0.4;
        }

        if (preferredColor && (s.primary_color.toLowerCase().includes(preferredColor.toLowerCase()) || p.primary_color.toLowerCase().includes(preferredColor.toLowerCase()))) {
          score += 0.5;
        }

        combos.push({
          id: `curated-${s.id}-${p.id}-${sh.id}`,
          user_id: userId,
          shirt_id: s.id,
          pants_id: p.id,
          shoes_id: sh.id,
          title: 'Outfit',
          occasion,
          why_they_match: `The ${s.primary_color} ${s.item_type} balances cleanly against the ${p.primary_color} ${p.item_type}, grounded with ${sh.primary_color} ${sh.item_type}.`,
          color_compatibility: isTopNeutral && isBottomNeutral ? 'Tonal neutral balance with sophisticated contrast.' : 'Pleasing accent-and-neutral pairing.',
          occasion_suitability: `Appropriate silhouette and comfort balance for ${occasion}.`,
          style_description: `${s.style} shirt with ${p.style} bottoms`,
          score: Math.min(Number(score.toFixed(1)), 9.8),
          shirt: s,
          pants: p,
          shoes: sh,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  combos.sort((a, b) => b.score - a.score);

  const top3 = combos.slice(0, 3).map((c, idx) => ({
    ...c,
    title: idx === 0 ? 'Outfit 1 – Best Match' : idx === 1 ? 'Outfit 2 – Stylish Alternative' : 'Outfit 3 – Simple and Comfortable',
  }));

  return {
    outfits: top3,
    missingEssentials: [],
    stylingSummary: `Curated ${top3.length} tailored combinations for ${occasion} directly from your wardrobe.`,
  };
}

function isBottomBottomNeutral(c: string) {
  return isNeutral(c);
}
