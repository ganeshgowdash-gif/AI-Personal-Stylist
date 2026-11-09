import { NextRequest, NextResponse } from 'next/server';
import { generateOutfitRecommendations } from '@/lib/ai/styling-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, wardrobe, occasion, weather, season, preferredColor, comfortLevel, dressCode, timeOfDay } = body;

    // Non-negotiable rule: Must ask occasion first if not specified
    if (!occasion || typeof occasion !== 'string' || occasion.trim() === '') {
      return NextResponse.json(
        { error: 'Please specify the occasion before requesting an outfit recommendation.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(wardrobe) || wardrobe.length === 0) {
      return NextResponse.json(
        {
          outfits: [],
          missingEssentials: ['Tops, Bottoms, and Footwear in your wardrobe'],
          stylingSummary: 'Your wardrobe is currently empty. Please upload clothing items first.',
        },
        { status: 200 }
      );
    }

    const result = await generateOutfitRecommendations({
      userId: userId || 'user',
      wardrobe,
      occasion,
      weather,
      season,
      preferredColor,
      comfortLevel,
      dressCode,
      timeOfDay,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Stylist Suggestion API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate outfit combinations' },
      { status: 500 }
    );
  }
}

