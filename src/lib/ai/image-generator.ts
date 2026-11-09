import { OutfitCombination, WardrobeItem } from '@/types/database';

export interface ModelAppearance {
  gender: 'male' | 'female' | 'androgynous';
  ethnicity: 'diverse' | 'asian' | 'black' | 'caucasian' | 'hispanic';
  bodyType: 'regular' | 'athletic' | 'slim' | 'plus';
}

export interface PreviewOptions {
  modelAppearance?: ModelAppearance;
  perspective?: 'front' | 'side' | 'detail';
  colorVariant?: string;
  isVirtualTryon?: boolean;
  userTryonPhotoUrl?: string;
}

export function constructFashionPrompt(
  outfit: OutfitCombination,
  options?: PreviewOptions
): string {
  const model = options?.modelAppearance || {
    gender: 'male',
    ethnicity: 'diverse',
    bodyType: 'regular',
  };

  const perspectiveText =
    options?.perspective === 'side'
      ? 'full-body 3/4 side profile dynamic pose'
      : options?.perspective === 'detail'
      ? 'close-up upper body and accessories detail shot'
      : 'full-length front perspective confident fashion editorial pose';

  const ethnicityLabel =
    model.ethnicity === 'asian'
      ? 'East Asian'
      : model.ethnicity === 'black'
      ? 'Black African-descent'
      : model.ethnicity === 'hispanic'
      ? 'Hispanic Latino'
      : model.ethnicity === 'caucasian'
      ? 'Caucasian'
      : 'Charismatic modern';

  const genderLabel =
    model.gender === 'female' ? 'female fashion model' : model.gender === 'male' ? 'male fashion model' : 'androgynous model';

  const garments: string[] = [];

  if (outfit.top_item) {
    const color = options?.colorVariant && options.colorVariant !== 'original' 
      ? options.colorVariant 
      : outfit.top_item.primary_color;
    garments.push(`wearing a ${color} ${outfit.top_item.pattern} ${outfit.top_item.subcategory} (${outfit.top_item.name}) in ${outfit.top_item.fit} fit`);
  }

  if (outfit.bottom_item) {
    garments.push(`paired with ${outfit.bottom_item.primary_color} ${outfit.bottom_item.subcategory} (${outfit.bottom_item.name}) in ${outfit.bottom_item.fit} fit`);
  }

  if (outfit.outerwear_item) {
    garments.push(`layered with a ${outfit.outerwear_item.primary_color} ${outfit.outerwear_item.name}`);
  }

  if (outfit.footwear_item) {
    garments.push(`completed with clean ${outfit.footwear_item.primary_color} ${outfit.footwear_item.name}`);
  }

  if (outfit.accessory_items && outfit.accessory_items.length > 0) {
    const accNames = outfit.accessory_items.map((a) => `${a.primary_color} ${a.name}`).join(', ');
    garments.push(`accented with ${accNames}`);
  }

  const clothesDescription = garments.join(', ');

  return `High-end luxury fashion catalog photograph of a ${ethnicityLabel} ${genderLabel} with ${model.bodyType} build, ${perspectiveText}, ${clothesDescription}. Master studio lighting, architectural minimalist warm concrete backdrop, Vogue editorial aesthetic, sharp focus, 8k resolution, authentic fabric textures, realistic drapery, high-fashion styling.`;
}

export async function generateOutfitPreviewImage(
  outfit: OutfitCombination,
  options?: PreviewOptions
): Promise<string> {
  const prompt = constructFashionPrompt(outfit, options);

  // If user has OpenAI DALL-E 3 key configured
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && !openAiKey.includes('your-') && openAiKey.startsWith('sk-')) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt.slice(0, 1000),
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.[0]?.url) {
          return data.data[0].url;
        }
      }
    } catch (err) {
      console.warn('OpenAI image generation error, falling back to Pollinations:', err);
    }
  }

  // Fast, photorealistic Flux / Pollinations AI generation with seed consistency
  // Construct safe encoded prompt
  const cleanPrompt = encodeURIComponent(
    prompt.replace(/[^a-zA-Z0-9 ,.-]/g, '').slice(0, 600)
  );

  // Deterministic seed based on outfit items + perspective + model appearance
  let seed = 1234;
  const hashKey = `${outfit.id}-${options?.perspective || 'front'}-${options?.modelAppearance?.gender || 'm'}-${options?.colorVariant || 'orig'}`;
  for (let i = 0; i < hashKey.length; i++) {
    seed = (seed * 31 + hashKey.charCodeAt(i)) % 9999999;
  }

  // Pollinations Flux endpoint with seed
  const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=1000&seed=${seed}&nologo=true&model=flux`;

  return imageUrl;
}

