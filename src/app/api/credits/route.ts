import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user credits from Supabase
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('clerk_id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'User credits not found.' }, { status: 404 });
    }

    return NextResponse.json({ credits: data.credits });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 