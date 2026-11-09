import { NextRequest, NextResponse } from 'next/server';
import { recognizeClothingImage } from '@/lib/ai/claude-vision';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const recognized = await recognizeClothingImage(imageBase64, mimeType || 'image/jpeg');
    return NextResponse.json(recognized);
  } catch (error: any) {
    console.error('Vision Recognition API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze clothing image' },
      { status: 500 }
    );
  }
}
