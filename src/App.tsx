import "./App.css";
import { useState } from "react";
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

  async function handleLaunch(e: React.FormEvent) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-sky-500 flex items-center justify-center text-xs font-black tracking-widest">
            SOUL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-widest uppercase text-slate-300">
              Twisted Soul
            </span>
            <span className="text-xs text-slate-500">
              Mainnet Ritual Engine
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-slate-400">
            {connected && publicKey ? (
              <>
                <span className="mr-1 text-emerald-400">●</span>
                {publicKey.toBase58().slice(0, 4)}…
                {publicKey.toBase58().slice(-4)}
              </>
            ) : (
              <>
                <span className="mr-1 text-red-500">●</span>
                Wallet disconnected
              </>
            )}
          </div>
          <div className="min-w-[200px]">
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-6 flex flex-col lg:flex-row gap-6 max-w-6xl w-full mx-auto">
        {/* Left side: form */}
        <section className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-[0_0_80px_rgba(15,23,42,0.9)]">
          <h2 className="text-lg font-semibold mb-1">
            Forge a New Soul Token
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Name it. Bind it. Launch it. All rules on-chain, no god wallet.
          </p>

          <form className="space-y-4" onSubmit={handleLaunch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Token Name
                </label>
                <input
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Twisted Soul"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Symbol
                </label>
                <input
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60 uppercase"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  maxLength={8}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Total Supply
              </label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                placeholder="1000000000"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Human-readable supply. Factory converts to raw units on-chain.
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Description
              </label>
              <textarea
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60 resize-none h-20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this soul bound to? Lore, rules, or pure degeneracy."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Twitter
                </label>
                <input
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@handle or https://"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Telegram
                </label>
                <input
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Website
                </label>
                <input
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !connected}
              className={`mt-2 w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide ${
                loading || !connected
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-sky-500 hover:from-fuchsia-400 hover:via-purple-500 hover:to-sky-400 text-slate-50 shadow-[0_0_40px_rgba(168,85,247,0.45)]"
              } transition-all`}
            >
              {loading ? "Casting ritual..." : "Launch on Chain"}
            </button>

            {!connected && (
              <p className="mt-2 text-[11px] text-red-400">
                Connect your wallet on mainnet before launching.
              </p>
            )}
          </form>
        </section>

        {/* Right side: status */}
        <section className="w-full lg:w-[320px] flex flex-col gap-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-1">Ritual Status</h3>
            <p className="text-xs text-slate-500 mb-3">
              Live feed of what the factory is doing with your token.
            </p>

            {loading && (
              <div className="text-xs text-slate-300">
                • Sending manifest to Twisted Soul factory…  
                <br />
                • Binding rules (lock liquidity, renounce mint)…  
                <br />
                • Waiting for final confirmation…
              </div>
            )}

            {!loading && !mintAddress && !error && (
              <div className="text-xs text-slate-400">
                No ritual in progress. Configure your token on the left and hit{" "}
                <span className="text-fuchsia-400 font-medium">
                  Launch on Chain
                </span>
                .
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400">
                Error: {error}
              </div>
            )}

            {mintAddress && (
              <div className="mt-2 text-xs space-y-1">
                <div className="text-slate-400">Mint address:</div>
                <div className="font-mono break-all text-[11px] text-emerald-400">
                  {mintAddress}
                </div>
                {signature && (
                  <>
                    <div className="mt-2 text-slate-400">Transaction:</div>
                    <div className="font-mono break-all text-[11px] text-sky-400">
                      {signature}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
            <div className="font-semibold text-slate-200 mb-1">
              Binding Rules (Anti-Rug)
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Liquidity must be locked on creation.</li>
              <li>Mint authority is renounced after launch.</li>
              <li>No oversized dev wallet (“no god wallet”).</li>
              <li>Factory logic is open-source and auditable.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
