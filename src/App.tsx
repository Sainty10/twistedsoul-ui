import "./App.css";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey
} from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction
} from "@solana/spl-token";

type MintState = {
  ok: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
};

function App() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();

  const [name, setName] = useState("Twisted Soul Live");
  const [symbol, setSymbol] = useState("SOUL");
  const [supply, setSupply] = useState("1000000000"); // human units
  const [description, setDescription] = useState(
    "Born from the Twisted Soul launchpad."
  );
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [mintState, setMintState] = useState<MintState>({ ok: false });

  async function handleLaunchClick() {
    setMintState({ ok: false });
    if (!connected || !publicKey || !sendTransaction) {
      setMintState({
        ok: false,
        error: "Connect your Phantom wallet on MAINNET first."
      });
      return;
    }

    // Parse supply safely
    let supplyBig: bigint;
    try {
      supplyBig = BigInt(supply);
      if (supplyBig <= 0n) {
        throw new Error("Supply must be positive.");
      }
    } catch {
      setMintState({
        ok: false,
        error: "Supply must be a valid positive integer."
      });
      return;
    }

    setLoading(true);

    try {
      // Fixed 9 decimals (standard SPL)
      const decimals = 9;
      const rawAmountBig =
        supplyBig * (BigInt(10) ** BigInt(decimals)); // convert to raw units

      if (rawAmountBig > BigInt(Number.MAX_SAFE_INTEGER)) {
        setMintState({
          ok: false,
          error:
            "Supply is too large for a single transaction. Use a smaller amount."
        });
        return;
      }

      const rawAmount = Number(rawAmountBig);

      // New mint account (keypair lives only in the user's browser)
      const mintKeypair = Keypair.generate();

      // Rent for mint account
      const rentLamports = await getMinimumBalanceForRentExemptMint(connection);

      // User's ATA for this mint
      const owner = publicKey as PublicKey;
      const ata = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        owner,
        false,
        TOKEN_PROGRAM_ID
      );

      // Build transaction
      const tx = new Transaction();

      // 1) Create mint account
      tx.add(
        SystemProgram.createAccount({
          fromPubkey: owner,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: rentLamports,
          programId: TOKEN_PROGRAM_ID
        })
      );

      // 2) Initialize mint (mint authority = user, no freeze authority)
      tx.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          owner,
          null,
          TOKEN_PROGRAM_ID
        )
      );

      // 3) Create associated token account for user
      tx.add(
        createAssociatedTokenAccountInstruction(
          owner, // payer
          ata, // ATA address
          owner, // token owner
          mintKeypair.publicKey, // mint
          TOKEN_PROGRAM_ID
        )
      );

      // 4) Mint tokens to user's ATA
      tx.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          ata,
          owner,
          rawAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Send transaction: wallet signs as fee payer, mintKeypair signs as mint account
      tx.feePayer = owner;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const sig = await sendTransaction(tx, connection, {
        signers: [mintKeypair]
      });

      // We don’t strictly need to wait for confirmation, but we can:
      await connection.confirmTransaction(sig, "confirmed");

      setMintState({
        ok: true,
        mintAddress: mintKeypair.publicKey.toBase58(),
        signature: sig
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unknown error during mint.";
      setMintState({ ok: false, error: msg });
    } finally {
      setLoading(false);
    }
  }

  const launchDisabled = loading;

  const { ok, mintAddress, signature, error } = mintState;

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-logo">SOUL</div>
          <div className="app-title-block">
            <span className="app-title">Twisted Soul</span>
            <span className="app-subtitle">Mainnet Ritual Engine</span>
          </div>
        </div>
        <div className="app-header-right">
          <div className="app-connection-indicator">
            <span
              className={
                "app-connection-dot " +
                (connected ? "connected" : "disconnected")
              }
            />
            {connected && publicKey
              ? `${publicKey.toBase58().slice(0, 4)}…${publicKey
                  .toBase58()
                  .slice(-4)}`
              : "Wallet disconnected"}
          </div>
          <div style={{ minWidth: 200 }}>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Left: form */}
        <section className="app-panel app-panel--form">
          <h2 className="panel-title">Forge a New Soul Token</h2>
          <p className="panel-subtitle">
            Name it. Bind it. Launch it. All rules on-chain, no god wallet.
          </p>

          {error && (
            <div
              style={{
                marginBottom: 10,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(127, 29, 29, 0.9)",
                border: "1px solid rgba(248, 113, 113, 0.9)",
                fontSize: 12,
                color: "#fee2e2"
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {!error && !connected && (
            <div
              style={{
                marginBottom: 10,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(30, 64, 175, 0.9)",
                border: "1px solid rgba(96, 165, 250, 0.9)",
                fontSize: 12,
                color: "#dbeafe"
              }}
            >
              Connect your Phantom wallet on <b>mainnet</b> using the button in
              the top-right, then hit <b>Launch on Chain</b>.
            </div>
          )}

          <div className="form-grid-2">
            <div>
              <label className="form-label">Token Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Twisted Soul"
                required
              />
            </div>
            <div>
              <label className="form-label">Symbol</label>
              <input
                className="form-input"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="SOUL"
                maxLength={8}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="form-label">Total Supply (human units)</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              placeholder="1000000000"
              required
            />
            <p className="helper-text">
              Tokens are minted with 9 decimals. Actual raw units =
              supply × 10^9.
            </p>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this soul bound to? Lore, rules, or pure degeneracy."
            />
          </div>

          <div style={{ marginTop: 12 }} className="form-grid-3">
            <div>
              <label className="form-label">Twitter</label>
              <input
                className="form-input"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@handle or https://"
              />
            </div>
            <div>
              <label className="form-label">Telegram</label>
              <input
                className="form-input"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/..."
              />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input
                className="form-input"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          <button
            type="button"
            className={
              "launch-button" + (launchDisabled ? " disabled" : "")
            }
            disabled={launchDisabled}
            onClick={handleLaunchClick}
          >
            {loading ? "Casting ritual..." : "Launch on Chain"}
          </button>
        </section>

        {/* Right: status + anti-rug */}
        <section className="app-panel app-panel--status">
          <div className="app-panel">
            <h3 className="panel-title">Ritual Status</h3>
            <p className="panel-subtitle">
              Live feed of what the wallet and chain are doing with your token.
            </p>

            {loading && (
              <div className="status-block">
                • Building mint + ATA transaction…
                <br />
                • Waiting for Phantom approval…
                <br />
                • Confirming on mainnet…
              </div>
            )}

            {!loading && !mintAddress && !error && (
              <div className="status-muted">
                No ritual in progress. Configure your token on the left and hit{" "}
                <span style={{ color: "#a855f7", fontWeight: 500 }}>
                  Launch on Chain
                </span>
                .
              </div>
            )}

            {ok && mintAddress && (
              <div style={{ marginTop: 10 }}>
                <div className="status-muted">Mint address:</div>
                <div className="status-mono status-mint">{mintAddress}</div>
                {signature && (
                  <>
                    <div
                      className="status-muted"
                      style={{ marginTop: 8 }}
                    >
                      Transaction:
                    </div>
                    <div className="status-mono status-tx">{signature}</div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="app-panel">
            <div className="rules-title">Binding Rules (Current)</div>
            <div className="rules-body">
              <ul>
                <li>
                  Mint authority is your connected wallet (non-custodial).
                </li>
                <li>
                  You control liquidity and future authority changes manually.
                </li>
                <li>
                  No backend wallets, no hot keys on servers.
                </li>
                <li>
                  All risk and control stays with the wallet that signs.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
