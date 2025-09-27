import { NextRequest, NextResponse } from 'next/server';
import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '../../../../../i18n-config';

export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  const lang = params.lang as Locale;

  try {
    const dictionary = await getDictionary(lang);
    return NextResponse.json(dictionary);
  } catch (error) {
    console.error('Failed to load dictionary:', error);
    return NextResponse.json(
      { error: 'Failed to load dictionary' },
      { status: 500 }
    );
  }
} 