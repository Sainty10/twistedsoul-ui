import React, { useMemo, useState } from "react";
import "./App.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { API_BASE } from "./config";

type NetworkMode = "devnet" | "mainnet-preview";

interface SoulManifest {
  token: {
    name: string;
    symbol: string;
    supply: string;
    description?: string;
    twitter?: string;
    telegram?: string;
    website?: string;
  };
  bindings: {
    lockLiquidity: boolean;
    renounceMint: boolean;
    noGodWallet: boolean;
    openSource: boolean;
  };
}

function App() {
  const { publicKey, connected } = useWallet();

  const [networkMode, setNetworkMode] = useState<NetworkMode>("devnet");

  const [name, setName] = useState("Test Soul");
  const [symbol, setSymbol] = useState("SOUL");
  const [supply, setSupply] = useState("1000000000");

  const [description, setDescription] = useState(
    "A twisted token forged in the ritual circle."
  );
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const [lockLiquidity, setLockLiquidity] = useState(true);
  const [renounceMint, setRenounceMint] = useState(true);
  const [noGodWallet, setNoGodWallet] = useState(true);
  const [openSource, setOpenSource] = useState(true);

  const [launchStatus, setLaunchStatus] = useState<null | {
    phase: "idle" | "pending" | "success" | "error";
    message: string;
    mint?: string;
    ata?: string;
    tx?: string;
  }>(null);

  const manifest: SoulManifest = useMemo(
    () => ({
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
        lockLiquidity,
        renounceMint,
        noGodWallet,
        openSource,
      },
    }),
    [
      name,
      symbol,
      supply,
      description,
      twitter,
      telegram,
      website,
      lockLiquidity,
      renounceMint,
      noGodWallet,
      openSource,
    ]
  );

  const manifestJson = useMemo(
    () => JSON.stringify(manifest, null, 2),
    [manifest]
  );

  async function handleLaunch() {
    if (!connected || !publicKey) {
      setLaunchStatus({
        phase: "error",
        message:
          "Connect your wallet first. The platform wallet pays fees, but we still need you connected.",
      });
      return;
    }

    try {
      setLaunchStatus({
        phase: "pending",
        message:
          networkMode === "devnet"
            ? "Summoning devnet mint through the factory..."
            : "Summoning mainnet mint through the factory...",
      });

      const resp = await fetch(`${API_BASE}/api/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: manifestJson,
      });

      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        throw new Error(data.error || "Unknown error from factory API");
      }

      const { result } = data;

      setLaunchStatus({
        phase: "success",
        message: `Mint complete on ${result.network}.`,
        mint: result.mint,
        ata: result.ata,
        tx: result.mintTx,
      });
    } catch (err: any) {
      setLaunchStatus({
        phase: "error",
        message: err.message || String(err),
      });
    }
  }

  return (
    <div className="ts-app">
      <div className="ts-bg-orbit" />
      <div className="ts-bg-noise" />

      <header className="ts-nav">
        <div className="ts-nav-left">
          <div className="ts-logo-orb" />
          <div className="ts-logo-text">
            <div className="ts-logo-title">Twisted Soul</div>
            <div className="ts-logo-sub">Solana Token Ritual Engine</div>
          </div>
        </div>
        <div className="ts-nav-right">
          <div className="ts-network-toggle">
            <button
              className={
                networkMode === "devnet"
                  ? "ts-net-pill ts-net-pill-active"
                  : "ts-net-pill"
              }
              onClick={() => setNetworkMode("devnet")}
            >
              Devnet Sandbox
            </button>
            <button
              className={
                networkMode === "mainnet-preview"
                  ? "ts-net-pill ts-net-pill-active"
                  : "ts-net-pill"
              }
              onClick={() => setNetworkMode("mainnet-preview")}
            >
              Mainnet Preview
            </button>
          </div>
          <div style={{ minWidth: "190px" }}>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="ts-main">
        <section className="ts-hero">
          <div className="ts-hero-left">
            <div className="ts-badge-row">
              <span className="ts-badge ts-badge-live">
                LIVE
              </span>
              <span className="ts-badge ts-badge-anti-rug">
                Anti-Rug Ritual
              </span>
            </div>
            <h1 className="ts-hero-title">
              Forge <span className="ts-accent">SOUL</span> tokens
              without touching code.
            </h1>
            <p className="ts-hero-sub">
              Twisted Soul is a Solana token factory. Hook your wallet, set the
              bindings, and let the engine mint your degen experiment on-chain.
            </p>

            <div className="ts-hero-actions">
              <button className="ts-primary-btn" onClick={handleLaunch}>
                Launch on Chain
              </button>
              <div className="ts-hero-note">
                First 200 wallets counted as Founding Souls.
              </div>
            </div>

            <div className="ts-hero-metadata">
              <div>
                <div className="ts-label">Wallet Connected</div>
                <div className="ts-value">
                  {connected && publicKey
                    ? `${publicKey.toBase58().slice(0, 4)}…${publicKey
                        .toBase58()
                        .slice(-4)}`
                    : "Not connected"}
                </div>
              </div>
              <div>
                <div className="ts-label">Network</div>
                <div className="ts-value">
                  {networkMode === "devnet"
                    ? "Devnet (free) — good for testing"
                    : "Mainnet preview — backend controls real network"}
                </div>
              </div>
            </div>
          </div>

          <div className="ts-hero-right">
            <div className="ts-orbital-card">
              <div className="ts-orbital-header">
                <span className="ts-label">Ritual Status</span>
                <span className="ts-chip">
                  {launchStatus?.phase === "pending"
                    ? "Casting"
                    : launchStatus?.phase === "success"
                    ? "Complete"
                    : launchStatus?.phase === "error"
                    ? "Error"
                    : "Idle"}
                </span>
              </div>
              <div className="ts-orbital-body">
                {launchStatus?.phase === "success" && (
                  <>
                    <p>{launchStatus.message}</p>
                    <p className="ts-orbital-field">
                      Mint:{" "}
                      <span className="ts-mono">
                        {launchStatus.mint}
                      </span>
                    </p>
                    <p className="ts-orbital-field">
                      Token Account:{" "}
                      <span className="ts-mono">
                        {launchStatus.ata}
                      </span>
                    </p>
                    <p className="ts-orbital-field">
                      Tx:{" "}
                      <span className="ts-mono">
                        {launchStatus.tx}
                      </span>
                    </p>
                  </>
                )}
                {launchStatus?.phase === "pending" && (
                  <p>{launchStatus.message}</p>
                )}
                {launchStatus?.phase === "error" && (
                  <p className="ts-error">{launchStatus.message}</p>
                )}
                {!launchStatus && (
                  <p>Connect wallet, fill the ritual, then launch.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="ts-grid">
          <div className="ts-card">
            <h2>Step 1 — Name your Soul</h2>
            <div className="ts-field">
              <label>Token Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Twisted Soul"
              />
            </div>
            <div className="ts-field">
              <label>Symbol</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="SOUL"
              />
            </div>
            <div className="ts-field">
              <label>Supply (human units)</label>
              <input
                value={supply}
                onChange={(e) => setSupply(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="1000000000"
              />
            </div>
            <div className="ts-field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="ts-card">
            <h2>Step 2 — Bindings</h2>
            <div className="ts-toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={lockLiquidity}
                  onChange={(e) => setLockLiquidity(e.target.checked)}
                />
                Lock Liquidity (planned)
              </label>
              <p className="ts-help">
                Reserved for future AMM integration. Logged in manifest.
              </p>
            </div>
            <div className="ts-toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={renounceMint}
                  onChange={(e) => setRenounceMint(e.target.checked)}
                />
                Renounce Mint Authority
              </label>
              <p className="ts-help">
                Attempts to drop mint authority after creation. Older SPL libs
                may ignore silently.
              </p>
            </div>
            <div className="ts-toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={noGodWallet}
                  onChange={(e) => setNoGodWallet(e.target.checked)}
                />
                No God Wallet
              </label>
              <p className="ts-help">
                No oversized dev wallet. Supply sits in factory ATA initially.
              </p>
            </div>
            <div className="ts-toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={openSource}
                  onChange={(e) => setOpenSource(e.target.checked)}
                />
                Open Source Ritual
              </label>
              <p className="ts-help">
                Signals that your manifest and launch details will be published.
              </p>
            </div>
          </div>

          <div className="ts-card ts-card-wide">
            <h2>Step 3 — Manifest</h2>
            <p className="ts-help">
              This is what the backend sees when you hit{" "}
              <span className="ts-mono">/api/mint</span>.
            </p>
            <pre className="ts-code-block">
              <code>{manifestJson}</code>
            </pre>
            <button className="ts-secondary-btn" onClick={handleLaunch}>
              Launch with This Manifest
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
