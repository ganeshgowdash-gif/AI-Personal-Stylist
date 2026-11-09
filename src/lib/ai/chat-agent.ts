import Anthropic from '@anthropic-ai/sdk';
import { WardrobeItem } from '@/types/database';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  referencedItems?: WardrobeItem[];
  created_at: string;
}

export async function processFashionChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  wardrobe: WardrobeItem[]
): Promise<{ reply: string; referencedItems: WardrobeItem[] }> {
  const latestMessage = messages[messages.length - 1]?.content || '';
  const apiKey = process.env.ANTHROPIC_API_KEY;

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

  if (apiKey && !apiKey.includes('your-anthropic-api-key') && apiKey.startsWith('sk-ant')) {
    try {
      const anthropic = new Anthropic({ apiKey });

      const systemPrompt = `You are the "AI Personal Stylist" Fashion Concierge.
You possess complete access to the user's personal digital wardrobe.
MANDATORY RULES:
1. ONLY refer to items that actually exist in the user's wardrobe manifest.
2. NEVER fabricate clothes or assume the user owns something not listed.
3. If an item or accessory is missing to complete the request, state clearly: "You don't currently have X in your wardrobe, but you can pair Y with Z."
4. Whenever you recommend or discuss specific items, include their exact IDs in this format: [ITEM:uuid] so the frontend can display their visual cards.
5. Provide sophisticated, articulate, and encouraging advice on silhouettes, proportions, color temperature, and occasion etiquette.

Available Wardrobe:
${JSON.stringify(wardrobeManifest, null, 2)}`;

      const formattedMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        system: systemPrompt,
        messages: formattedMessages,
      });

      const textBlock = response.content.find((c) => c.type === 'text');
      if (textBlock && 'text' in textBlock) {
        const reply = textBlock.text;
        // Extract referenced IDs
        const itemMatches = reply.match(/\[ITEM:([a-zA-Z0-9_-]+)\]/g) || [];
        const extractedIds = new Set(
          itemMatches.map((m) => m.replace('[ITEM:', '').replace(']', '').trim())
        );
        const referencedItems = wardrobe.filter((w) => extractedIds.has(w.id));
        const cleanReply = reply.replace(/\[ITEM:[a-zA-Z0-9_-]+\]/g, '').trim();

        return {
          reply: cleanReply,
          referencedItems,
        };
      }
    } catch (err) {
      console.warn('Claude chat error, falling back to local styling logic:', err);
    }
  }

  // Local Intelligent Fashion Engine
  return generateLocalChatResponse(latestMessage, wardrobe);
}

function generateLocalChatResponse(
  query: string,
  wardrobe: WardrobeItem[]
): { reply: string; referencedItems: WardrobeItem[] } {
  const q = query.toLowerCase();
  const tops = wardrobe.filter((i) => i.category === 'tops');
  const bottoms = wardrobe.filter((i) => i.category === 'bottoms');
  const shoes = wardrobe.filter((i) => i.category === 'footwear');
  const accessories = wardrobe.filter((i) => i.category === 'accessories');

  // Check matching questions e.g. "Does my X match my Y"
  if (q.includes('match') && (q.includes('shirt') || q.includes('pant') || q.includes('jeans') || q.includes('trouser') || q.includes('chino'))) {
    const foundTop = tops.find((t) => q.includes(t.primary_color.toLowerCase()) || q.includes(t.subcategory)) || tops[0];
    const foundBottom = bottoms.find((b) => q.includes(b.primary_color.toLowerCase()) || q.includes(b.subcategory)) || bottoms[0];

    if (foundTop && foundBottom) {
      const isHarmonious = 
        foundTop.primary_color.toLowerCase() !== foundBottom.primary_color.toLowerCase() ||
        foundTop.primary_color.toLowerCase() === 'black';

      const reply = isHarmonious
        ? `Yes, absolutely! Your **${foundTop.name}** in ${foundTop.primary_color} pairs excellently with your **${foundBottom.name}** in ${foundBottom.primary_color}. The balance between ${foundTop.primary_color} on top and ${foundBottom.primary_color} on bottom provides a flattering, structured contrast that avoids visual monotony.`
        : `While you can wear your **${foundTop.name}** with **${foundBottom.name}**, both are ${foundTop.primary_color}. For higher visual depth, try breaking the monochrome with a contrasting belt or lighter footwear.`;

      const suggestedShoes = shoes[0];
      const refs = [foundTop, foundBottom, suggestedShoes].filter((i): i is WardrobeItem => Boolean(i));

      return {
        reply: `${reply}\n\nHere are the exact pieces from your wardrobe:`,
        referencedItems: refs,
      };
    }
  }

  // College / Casual recommendations
  if (q.includes('college') || q.includes('school') || q.includes('tomorrow') || q.includes('wear')) {
    const top = tops.find((t) => t.subcategory === 't-shirt' || t.subcategory === 'shirt') || tops[0];
    const bottom = bottoms.find((b) => b.subcategory === 'jeans' || b.subcategory === 'chinos') || bottoms[0];
    const footwear = shoes[0];

    const refs = [top, bottom, footwear].filter((i): i is WardrobeItem => Boolean(i));
    return {
      reply: `For college or a daytime outing, I recommend an effortless smart-casual pairing from your collection:\n\n- **Top:** ${top?.name || 'Casual top'} (${top?.primary_color})\n- **Bottom:** ${bottom?.name || 'Clean pants'} (${bottom?.primary_color})\n- **Footwear:** ${footwear?.name || 'Sneakers'}\n\nThis look gives you breathable mobility for walking between lectures while keeping a sharp, intentional silhouette.`,
      referencedItems: refs,
    };
  }

  // Formal outfit recommendation
  if (q.includes('formal') || q.includes('office') || q.includes('meeting')) {
    const top = tops.find((t) => t.subcategory === 'shirt' || t.style === 'formal') || tops[0];
    const bottom = bottoms.find((b) => b.subcategory === 'chinos' || b.subcategory === 'formal pants') || bottoms[0];
    const footwear = shoes.find((s) => s.subcategory === 'formal shoes') || shoes[0];

    const refs = [top, bottom, footwear].filter((i): i is WardrobeItem => Boolean(i));
    return {
      reply: `Here is a refined business ensemble curated directly from your items:\n\n- **Shirt:** ${top?.name || 'Dress shirt'} in crisp ${top?.primary_color}\n- **Trousers:** ${bottom?.name || 'Formal trousers'} in ${bottom?.primary_color}\n- **Shoes:** ${footwear?.name || 'Dress shoes'}\n\nEnsure your shirt is cleanly tucked and sleeve cuffs sit right at the wrist bone for optimal proportions.`,
      referencedItems: refs,
    };
  }

  // "What should I buy next"
  if (q.includes('buy') || q.includes('shopping') || q.includes('missing')) {
    return {
      reply: `Based on an audit of your wardrobe, the top versatile essentials to expand your options are:\n\n1. **Tailored Beige Chinos:** Unlocks light-neutral contrast for dark shirts.\n2. **Minimalist White Low-Top Leather Sneakers:** Matches virtually every casual and smart-casual outfit.\n3. **Brushed Silver Minimalist Watch:** Adds subtle polish without loud branding.\n\nYou can view the full versatility ratings and matching counts in the **Smart Shopping** tab!`,
      referencedItems: wardrobe.slice(0, 3),
    };
  }

  // Specific item query (e.g. "shoes", "sneakers", "blue jeans")
  const matchedItems = wardrobe.filter((item) =>
    q.includes(item.primary_color.toLowerCase()) ||
    q.includes(item.subcategory.toLowerCase()) ||
    q.includes(item.category.toLowerCase())
  );

  if (matchedItems.length > 0) {
    const topMatches = matchedItems.slice(0, 4);
    return {
      reply: `I found ${topMatches.length} matching pieces in your wardrobe for "${query}". You can style them as highlighted below:`,
      referencedItems: topMatches,
    };
  }

  // Default helpful response
  const featured = wardrobe.slice(0, 3);
  return {
    reply: `I am styling your wardrobe of **${wardrobe.length} cataloged pieces**. You can ask me:\n\n- *"What should I wear to college or office tomorrow?"*\n- *"Does my blue shirt match my beige chinos?"*\n- *"Suggest three outfits using my white sneakers"*\n- *"What essential pieces am I missing?"*\n\nHere are some of your staple pieces ready to style:`,
    referencedItems: featured,
  };
}

