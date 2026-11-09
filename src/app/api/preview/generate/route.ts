import { NextRequest, NextResponse } from 'next/server';
import { generateOutfitPreviewImage } from '@/lib/ai/image-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { outfit, options } = body;

    if (!outfit) {
      return NextResponse.json({ error: 'Outfit combination is required' }, { status: 400 });
    }

    const imageUrl = await generateOutfitPreviewImage(outfit, options);

    return NextResponse.json({
      imageUrl,
      perspective: options?.perspective || 'front',
      modelSettings: options?.modelAppearance,
      colorVariant: options?.colorVariant || 'original',
      isVirtualTryon: Boolean(options?.isVirtualTryon),
    });
  } catch (error: any) {
    console.error('Preview Generation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate model preview image' },
      { status: 500 }
    );
  }
}

