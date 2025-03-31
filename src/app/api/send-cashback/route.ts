import { sendCashbackWithGill } from '@/app/api/send-cashback-gill'; // adjust path as needed
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { to, amount } = await req.json();

        if (!to) {
            return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
        }

        const signature = await sendCashbackWithGill(to, amount * 1e6);

        return NextResponse.json({ success: true, signature });
    } catch (error) {
        console.error('send-cashback route error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
