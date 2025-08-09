import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook Body : ', body);
    
    if (body.type !== 'user.created') {
      return NextResponse.json({ message: 'Ignored' });
    }
    
    // User creation event received - credits will be handled by database default
    return NextResponse.json({ message: 'User creation event received.' });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 