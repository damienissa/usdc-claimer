import { address, createKeypairSignerFromBase58, createSolanaClient, getExplorerLink, getSignatureFromTransaction, signTransactionMessageWithSigners, SolanaClusterMoniker } from "gill";
import { buildTransferTokensTransaction } from "gill/programs/token";


export const sendCashbackWithGill = async (to: string, amount: number) => {
  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: (process.env.CLUSTER ?? 'devnet') as SolanaClusterMoniker,
  });
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
    const signedTransaction = await signTransactionMessageWithSigners(transaction);

    console.log(
      "Explorer:",
      getExplorerLink({
        cluster: (process.env.CLUSTER ?? 'devnet') as SolanaClusterMoniker,
        transaction: getSignatureFromTransaction(signedTransaction),
      }),
    );

    return await sendAndConfirmTransaction(signedTransaction);
  } catch (e) {
    console.error('Failed to send cashback transaction:', e);
  }
};
