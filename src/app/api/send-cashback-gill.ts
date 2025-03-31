import { address, createKeypairSignerFromBase58, createSolanaClient, getExplorerLink, getSignatureFromTransaction, signTransactionMessageWithSigners } from "gill";
import { buildTransferTokensTransaction } from "gill/programs/token";


export const sendCashbackWithGill = async (to: string, amount: number) => {
  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: "devnet",
  });
  const destination = address(to);
  const keypairBase58 =
    "";
  const signer = await createKeypairSignerFromBase58(keypairBase58);
  const mint = address("FDb8RsVK1Js4jLPvoCVyGQVWB6ckZ5VFZzeQe6nW4Z2k");
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
        cluster: "devnet",
        transaction: getSignatureFromTransaction(signedTransaction),
      }),
    );

    return await sendAndConfirmTransaction(signedTransaction);
  } catch (e) {
    console.error('Failed to send cashback transaction:', e);
  }
};
