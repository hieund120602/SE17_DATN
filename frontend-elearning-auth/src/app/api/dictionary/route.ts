import { NextRequest, NextResponse } from 'next/server';
import { getDictionary } from '@/app/dictionaries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lang = searchParams.get('lang') || 'vi';

  try {
    const dictionary = await getDictionary(lang);
    return NextResponse.json(dictionary);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load dictionary' }, { status: 500 });
  }
}