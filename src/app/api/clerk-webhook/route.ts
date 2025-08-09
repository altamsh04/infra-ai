import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook Body : ', body);
    
    if (body.type !== 'user.created') {
      return NextResponse.json({ message: 'Ignored' });
    }
    
    // Extract user ID from the webhook payload
    const clerkId = body.data.id;
    
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Insert user with default credits (3 as per your requirement)
    const { error } = await supabase
      .from('user_credits')
      .insert([{ clerk_id: clerkId, credits: 3 }]);
    
    if (error) {
      console.error('Failed to insert user credits:', error);
      return NextResponse.json({ error: 'Failed to initialize user credits.' }, { status: 500 });
    }
    
    console.log('User credits initialized successfully for:', clerkId);
    return NextResponse.json({ message: 'User credits initialized successfully.' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 