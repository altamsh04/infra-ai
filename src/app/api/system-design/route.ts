import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';
import { analyzeSystemRequest } from '@/lib/ai';
import systemDesignData from '@/app/system-design-components.json';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user credits in Supabase
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('clerk_id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'User credits not found.' }, { status: 404 });
    }

    if (data.credits <= 0) {
      return NextResponse.json({ error: 'You have used all your system design credits.' }, { status: 403 });
    }

    // Get user request from body
    const body = await req.json();
    const userRequest = body.request;
    const allComponents = systemDesignData.components;

    // Call AI logic
    const aiResponse = await analyzeSystemRequest(userRequest, allComponents);

    if (aiResponse.isSystemDesign) {
      // Decrement credits only if a valid system design is returned
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ credits: data.credits - 1 })
        .eq('clerk_id', userId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update credits.' }, { status: 500 });
      }
      console.log('CREDITS STATE:', data.credits - 1);
      return NextResponse.json({ ...aiResponse, credits: data.credits - 1 });
    } else {
      // Do not decrement credits
      return NextResponse.json({ ...aiResponse, credits: data.credits });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 