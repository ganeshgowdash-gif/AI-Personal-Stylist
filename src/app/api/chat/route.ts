import { NextRequest, NextResponse } from 'next/server';
import { processFashionChat } from '@/lib/ai/chat-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, wardrobe } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Chat messages are required' }, { status: 400 });
    }

    const result = await processFashionChat(messages, Array.isArray(wardrobe) ? wardrobe : []);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Fashion Chat assistant encountered an issue' },
      { status: 500 }
    );
  }
}
