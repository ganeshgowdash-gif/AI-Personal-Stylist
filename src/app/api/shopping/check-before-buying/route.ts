import { NextRequest, NextResponse } from 'next/server';
import { evaluateCheckBeforeBuying } from '@/lib/ai/shopping-analyzer';
import { recognizeClothingImage } from '@/lib/ai/claude-vision';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, itemDetails, wardrobe } = body;

    let scanned = itemDetails;

    if (!scanned && imageBase64) {
      // Recognize using vision AI first
      scanned = await recognizeClothingImage(imageBase64, mimeType || 'image/jpeg');
    }

    if (!scanned) {
      return NextResponse.json(
        { error: 'Either store item image or item details must be provided.' },
        { status: 400 }
      );
    }

    const result = evaluateCheckBeforeBuying(scanned, Array.isArray(wardrobe) ? wardrobe : []);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Check Before Buying API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze store item' },
      { status: 500 }
    );
  }
}

