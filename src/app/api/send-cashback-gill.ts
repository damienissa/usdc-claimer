import { address, createKeypairSignerFromBase58, createSolanaClient, getExplorerLink, getSignatureFromTransaction, signature, signTransactionMessageWithSigners, SolanaClusterMoniker } from "gill";
import { buildTransferTokensTransaction } from "gill/programs/token";


export const sendCashbackWithGill = async (to: string, amount: number, chargeSignature: string) => {
  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: process.env.NEXT_PUBLIC_MAINNET_ENDPOINT ?? 'mainnet',
  });

  // Check if the transaction is confirme
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
    latestBlockhash: latestBlockhash, // required for blockhash lifetime constraint
    amount: amount,
    authority: signer,
    destination: destination,
    mint: mint,
  });

  try {
    console.log('Transaction:', transaction);
    const signedTransaction = await signTransactionMessageWithSigners(transaction);

    console.log(
      "Explorer:",
      getExplorerLink({
        cluster: (process.env.CLUSTER ?? 'devnet') as SolanaClusterMoniker,
        transaction: getSignatureFromTransaction(signedTransaction),
      }),
    );
    console.log('Prepared transaction:', signedTransaction);
    const result = await sendAndConfirmTransaction(signedTransaction);
    console.log('Transaction sent:', result);
    return result;
  } catch (e) {
    console.log('Failed to send cashback transaction:', e);
    throw e;
  }
};
