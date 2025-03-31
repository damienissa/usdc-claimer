'use client';

import { SendTransactionOptions } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
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
import { useState } from 'react';
import Confetti from 'react-confetti';
import { AppHero } from '../ui/ui-layout';

export default function DashboardFeature() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [chargeTx, setChargeTx] = useState<string | null>(null);
  const [cashbackTx, setCashbackTx] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setSuccess(false);
    setChargeTx(null);
    setCashbackTx(null);
    setStatus('Sending 0.5 SOL to the vault...');
    try {
      const { chargeSignature, cashbackSignature } = await CreateChargeTransaction(
        connection,
        publicKey,
        sendTransaction,
        setStatus
      );
      setChargeTx(chargeSignature);
      setCashbackTx(cashbackSignature);
      setSuccess(true);
      setStatus('✅ Claimed 2000 USDC successfully!');
    } catch (e) {
      console.error(e);
      setStatus('❌ Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d0e] text-white">
      {success && <Confetti numberOfPieces={300} recycle={false} />}
      <AppHero
        title="USDC Claimer"
        subtitle="Do you want to get 2000 USDC? It will cost you only 0.5 SOL"
      />

      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center space-y-6">
        <button
          className={`wallet-adapter-button wallet-adapter-button-trigger mx-auto ${loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          type="button"
          onClick={handleClaim}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="animate-spin w-4 h-4" /> Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <Sparkles className="w-4 h-4" />
              Claim 2000 USDC
            </span>
          )}
        </button>

        {/* Explorer-style status card */}
        {(status || chargeTx || cashbackTx) && (
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-5 space-y-4 text-left shadow-inner mt-6">
            <div className="flex items-center gap-2 text-base font-medium">
              {status?.includes('✅') && <CheckCircle className="text-green-400 w-5 h-5" />}
              {status?.includes('❌') && <XCircle className="text-red-400 w-5 h-5" />}
              <span className="text-white">{status}</span>
            </div>

            {chargeTx && (
              <div>
                <p className="text-sm text-gray-400 mb-1">🔁 Outgoing SOL Tx</p>
                <a
                  href={`https://explorer.solana.com/tx/${chargeTx}?cluster=devnet`}
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
                <p className="text-sm text-gray-400 mt-4 mb-1">🎁 Incoming Cashback Tx</p>
                <a
                  href={`https://explorer.solana.com/tx/${cashbackTx}?cluster=devnet`}
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
      </div>
    </div>
  );
}

const chargeAmount = 0.5;
const cashbackAmount = 2000e6;

const CreateChargeTransaction = async (
  connection: Connection,
  publicKey: PublicKey | null,
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
    toPubkey: new PublicKey('CVkzbsnwATBDDbGke7o1KzprgDsaKhdET7zioE9ssFXp'),
    lamports: chargeAmount * LAMPORTS_PER_SOL,
  });

  const transaction = new Transaction().add(solTransferIx);
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  const chargeSignature = await sendTransaction(transaction, connection);
  setStatus(`Transaction sent. Waiting for confirmation...`);

  const confirmation = await connection.confirmTransaction(chargeSignature, 'confirmed');
  if (confirmation.value.err !== null) throw new Error('Transaction failed');

  setStatus('Confirmed! Sending cashback...');

  const res = await fetch('/api/send-cashback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: publicKey.toBase58(), amount: cashbackAmount }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error);

  return {
    chargeSignature,
    cashbackSignature: data.signature,
  };
};
