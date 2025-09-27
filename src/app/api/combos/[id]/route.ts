import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const comboId = params.id;

  try {
    const response = await fetch(`${API_BASE_URL}/combos/${comboId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch combo: ${response.status} ${response.statusText}`);
    }

    const combo = await response.json();
    return NextResponse.json(combo);
  } catch (error) {
    console.error('Error fetching combo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch combo' },
      { status: 500 }
    );
  }
} 