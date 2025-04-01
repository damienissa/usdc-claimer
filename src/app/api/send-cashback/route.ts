import { prepareCashbackTransaction, sendCashbackTransaction } from '@/app/api/send-cashback-gill';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { to, amount, transaction } = await req.json();

        if (!to || !amount || !transaction) {
            return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
        }

        const { signedTransaction, txSignature, explorerUrl } = await prepareCashbackTransaction(to, amount * 1e6, transaction);

        console.log('Prepared transaction:', txSignature);
        console.log('Explorer link:', explorerUrl);

        // Fire-and-forget send (asynchronous background task)
        sendCashbackTransaction(signedTransaction).then((result) => {
            console.log('Transaction confirmed:', result);
        }).catch((err) => {
            console.error('Failed to send transaction:', err);
        });

        // Respond immediately with the tx signature & explorer
        return NextResponse.json({
            success: true,
            signature: txSignature,
            explorer: explorerUrl,
        });

    } catch (error) {
        console.error('send-cashback route error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
