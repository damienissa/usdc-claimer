import {
  address,
  createKeypairSignerFromBase58,
  createSolanaClient,
  getExplorerLink,
  getSignatureFromTransaction,
  signature,
  signTransactionMessageWithSigners,
  SolanaClusterMoniker
} from "gill";
import { buildTransferTokensTransaction } from "gill/programs/token";

export const prepareCashbackTransaction = async (to: string, amount: number, chargeSignature: string) => {
  const { rpc } = createSolanaClient({
    urlOrMoniker: process.env.NEXT_PUBLIC_MAINNET_ENDPOINT ?? 'mainnet',
  });

  // Check if the transaction is confirmed
  const tx = await rpc.getTransaction(signature(chargeSignature));
  if (!tx) {
    throw new Error('Transaction not found');
  }

  const destination = address(to);
  const keypairBase58 = process.env.PRIVATE_KEY ?? '';
  const signer = await createKeypairSignerFromBase58(keypairBase58);
  const mint = address(process.env.MINT ?? '');
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transaction = await buildTransferTokensTransaction({
    feePayer: signer,
    latestBlockhash,
    amount,
    authority: signer,
    destination,
    mint,
  });

  const signedTransaction = await signTransactionMessageWithSigners(transaction);
  const txSignature = getSignatureFromTransaction(signedTransaction);
  const explorerUrl = getExplorerLink({
    cluster: (process.env.CLUSTER ?? 'mainnet') as SolanaClusterMoniker,
    transaction: txSignature,
  });

  return {
    signedTransaction,
    txSignature,
    explorerUrl,
  };
};

export const sendCashbackTransaction = async (signedTransaction: any) => {
  const { sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: process.env.NEXT_PUBLIC_MAINNET_ENDPOINT ?? 'mainnet',
  });

  const result = await sendAndConfirmTransaction(signedTransaction);
  return result;
};
