import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook Body : ', body);
    
    if (body.type !== 'user.created') {
      return NextResponse.json({ message: 'Ignored' });
    }
    const clerkId = body.data.id;
    // Insert user with 3 credits
    const { error } = await supabase
      .from('user_credits')
      .insert([{ clerk_id: clerkId, credits: 3 }]);
    if (error) {
      return NextResponse.json({ error: 'Failed to initialize credits.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'User credits initialized.' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 