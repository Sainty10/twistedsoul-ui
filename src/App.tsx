import "./App.css";
import { FormEvent, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type MintResponse = {
  ok: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function App() {
  const { connected, publicKey } = useWallet();

  const [name, setName] = useState("Test Soul");
  const [symbol, setSymbol] = useState("SOUL");
  const [supply, setSupply] = useState("1000000000");
  const [description, setDescription] = useState(
    "Born from the Twisted Soul launchpad."
  );
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLaunch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMintAddress(null);
    setSignature(null);

    if (!connected || !publicKey) {
      setError("Connect your wallet on mainnet first.");
      return;
    }

    setLoading(true);

    try {
      const body = {
        token: {
          name,
          symbol,
          supply,
          description,
          twitter,
          telegram,
          website,
        },
        bindings: {
          lockLiquidity: true,
          renounceMint: true,
          noGodWallet: true,
          openSource: true,
        },
      };

      const res = await fetch(`${API_BASE}/api/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: MintResponse = await res.json();

      if (!data.ok) {
        setError(data.error || "Mint failed.");
      } else {
        if (data.mintAddress) setMintAddress(data.mintAddress);
        if (data.signature) setSignature(data.signature);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unknown error during mint.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const launchDisabled = loading || !connected;

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

          <form onSubmit={handleLaunch}>
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
              <label className="form-label">Total Supply</label>
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
                Human-readable supply. Factory converts to raw units on-chain.
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
              type="submit"
              className={
                "launch-button" + (launchDisabled ? " disabled" : "")
              }
              disabled={launchDisabled}
            >
              {loading ? "Casting ritual..." : "Launch on Chain"}
            </button>

            {!connected && (
              <p className="error-text">
                Connect your wallet on mainnet before launching.
              </p>
            )}
            {error && <p className="error-text">Error: {error}</p>}
          </form>
        </section>

        {/* Right: status + anti-rug */}
        <section className="app-panel app-panel--status">
          <div className="app-panel">
            <h3 className="panel-title">Ritual Status</h3>
            <p className="panel-subtitle">
              Live feed of what the factory is doing with your token.
            </p>

            {loading && (
              <div className="status-block">
                • Sending manifest to Twisted Soul factory…
                <br />
                • Binding rules (lock liquidity, renounce mint)…
                <br />
                • Waiting for final confirmation…
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

            {mintAddress && (
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
            <div className="rules-title">Binding Rules (Anti-Rug)</div>
            <div className="rules-body">
              <ul>
                <li>Liquidity must be locked on creation.</li>
                <li>Mint authority is renounced after launch.</li>
                <li>No oversized dev wallet (“no god wallet”).</li>
                <li>Factory logic is open-source and auditable.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
