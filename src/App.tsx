import React, { useState } from "react";
import "./App.css";

type SoulTokenForm = {
  name: string;
  symbol: string;
  supply: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
};

type SoulBindings = {
  lockLiquidity: boolean;
  renounceMint: boolean;
  noGodWallet: boolean;
  openSource: boolean;
};

const defaultForm: SoulTokenForm = {
  name: "",
  symbol: "SOUL",
  supply: "",
  description: "",
  twitter: "",
  telegram: "",
  website: "",
};

const defaultBindings: SoulBindings = {
  lockLiquidity: true,
  renounceMint: true,
  noGodWallet: true,
  openSource: true,
};

const App: React.FC = () => {
  const [networkMode, setNetworkMode] = useState<"devnet" | "mainnet-preview">(
    "devnet"
  );

  const [rewardInfo] = useState({
    totalSlots: 200,
    rewardPerUser: 500,
    claimed: 0,
  });

  const [protocolSoul] = useState({
    name: "Twisted Soul Protocol",
    symbol: "SOUL",
    tagline: "Anti-rug launch altar for Solana.",
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<SoulTokenForm>(defaultForm);
  const [bindings, setBindings] = useState<SoulBindings>(defaultBindings);
  const [manifestJson, setManifestJson] = useState<string>("");
  const [soulStream, setSoulStream] = useState<string[]>([
    "SOUL intercepted a fake launch with unlocked LP and flagged it.",
    "Twisted Soul rejected a contract with hidden mint authority.",
    "New ritual pattern deployed: open-source or no launch.",
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleBinding = (field: keyof SoulBindings) => {
    setBindings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const allCoreBindings =
    bindings.lockLiquidity &&
    bindings.renounceMint &&
    bindings.noGodWallet &&
    bindings.openSource;

  const buildWarnings = (b: SoulBindings): string[] => {
    const warnings: string[] = [];
    if (!b.lockLiquidity) warnings.push("Liquidity is not locked. Instant rug vector.");
    if (!b.renounceMint) warnings.push("Mint authority still active. Infinite print risk.");
    if (!b.noGodWallet)
      warnings.push("Team wallet holds god-mode rights. Centralized kill switch.");
    if (!b.openSource)
      warnings.push("Contract not open-source. Nobody can audit the ritual.");
    return warnings.length ? warnings : ["No warnings. This ritual passes the circle."];
  };

  const handleManifest = () => {
    const config = {
      protocol: {
        name: protocolSoul.name,
        symbol: protocolSoul.symbol,
        tagline: protocolSoul.tagline,
      },
      token: {
        ...form,
      },
      bindings,
      meta: {
        rugRisk: allCoreBindings ? "0 / 100 (soul-locked)" : "Unclean — fix bindings.",
        warnings: buildWarnings(bindings),
        generatedAt: new Date().toISOString(),
        networkMode,
      },
    };

    const json = JSON.stringify(config, null, 2);
    setManifestJson(json);

    const label = form.name || "Unnamed Soul";
    const sym = form.symbol || "???";
    setSoulStream((prev) => [
      `Manifest drafted for ${label} (${sym}) on ${networkMode}.`,
      ...prev.slice(0, 5),
    ]);
  };

  const canNextFromStep1 =
    form.name.trim().length > 0 &&
    form.symbol.trim().length > 0 &&
    form.supply.trim().length > 0;

  const stepClass = (n: number) =>
    step === n ? "ts-step ts-step-active" : "ts-step";

  const handleCopyManifest = () => {
    if (!manifestJson) return;
    void navigator.clipboard.writeText(manifestJson);
  };

  const claimedPercent = Math.min(
    100,
    Math.round((rewardInfo.claimed / rewardInfo.totalSlots) * 100) || 0
  );

  return (
    <div className="ts-root">
      <div className="ts-noise" />
      <div className="ts-ritual-ring" />
      <div className="ts-sigil-grid" />

      {/* Top nav */}
      <header className="ts-nav">
        <div className="ts-nav-left">
          <div className="ts-logo-orb" />
          <div className="ts-logo-text">
            <span className="ts-logo-main">Twisted Soul</span>
            <span className="ts-logo-sub">
              Launchpad for tokens that can&apos;t rug their own soul.
            </span>
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
          <button className="ts-pill ts-pill-ghost">
            Connect Wallet (visual, CP1)
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="ts-hero ts-card">
        <div className="ts-hero-content">
          <div>
            <h1 className="ts-hero-title">
              Spin up a{" "}
              <span className="ts-text-ritual">Soul-bound token</span> in one
              ritual.
            </h1>
            <p className="ts-hero-body">
              This is what mainnet will feel like. Name your token, lock the
              rules, and let the protocol handle the ugly parts: mint authority,
              liquidity safety, and transparency. You bring the idea, SOUL
              brings the bindings.
            </p>
            <div className="ts-hero-buttons">
              <a href="#launch" className="ts-btn ts-btn-primary">
                Create Your Soul Token
              </a>
              <span className="ts-hero-note">
                First 200 creators on mainnet claim{" "}
                <strong>{rewardInfo.rewardPerUser} SOUL</strong> each.
              </span>
            </div>
            <div className="ts-hero-stats">
              <div className="ts-hero-stat">
                <span className="ts-hero-stat-label">House Token</span>
                <span className="ts-hero-stat-value">
                  {protocolSoul.name} ({protocolSoul.symbol})
                </span>
              </div>
              <div className="ts-hero-stat">
                <span className="ts-hero-stat-label">Launch Mode</span>
                <span className="ts-hero-stat-value ts-hero-stat-degen">
                  {networkMode === "devnet"
                    ? "Devnet // Free-fire rehearsal"
                    : "Mainnet Preview // Real ritual UX"}
                </span>
              </div>
            </div>
          </div>

          <div className="ts-hero-reward">
            <h3>Early Ritual Reward</h3>
            <p>
              First <strong>{rewardInfo.totalSlots}</strong> wallets to launch a
              token through Twisted Soul on mainnet receive{" "}
              <strong>{rewardInfo.rewardPerUser} SOUL</strong> as protocol
              tribute.
            </p>
            <div className="ts-reward-bar">
              <div
                className="ts-reward-fill"
                style={{ width: `${claimedPercent}%` }}
              />
            </div>
            <div className="ts-reward-meta">
              <span>
                Claimed: {rewardInfo.claimed} / {rewardInfo.totalSlots}
              </span>
              <span>{claimedPercent}%</span>
            </div>
            <p className="ts-reward-foot">
              Current numbers are visual only in this build. Mainnet wiring
              connects later.
            </p>
          </div>
        </div>
      </section>

      {/* Main body */}
      <main className="ts-main" id="launch">
        {/* Wizard */}
        <section className="ts-card ts-wizard">
          <div className="ts-wizard-steps">
            <span className={stepClass(1)}>1. Soul Naming</span>
            <span className={stepClass(2)}>2. Soul Bindings</span>
            <span className={stepClass(3)}>3. Soul Manifest</span>
          </div>

          {step === 1 && (
            <div className="ts-wizard-body">
              <h2>Step 1 · Name the Soul</h2>
              <p className="ts-wizard-text">
                This is what traders and explorers will see. Keep it clean, keep
                it violent, but keep it real.
              </p>

              <div className="ts-form-grid">
                <div className="ts-field">
                  <label>Token Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Example: Soul Furnace Index"
                  />
                </div>
                <div className="ts-field">
                  <label>Symbol</label>
                  <input
                    name="symbol"
                    value={form.symbol}
                    onChange={handleInputChange}
                    placeholder="Example: SOUL"
                  />
                </div>
                <div className="ts-field">
                  <label>Total Supply</label>
                  <input
                    name="supply"
                    value={form.supply}
                    onChange={handleInputChange}
                    placeholder="1000000000"
                  />
                </div>
                <div className="ts-field ts-field-full">
                  <label>Ritual Statement</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="One brutal sentence explaining why this token exists."
                    rows={3}
                  />
                </div>
                <div className="ts-field">
                  <label>Twitter</label>
                  <input
                    name="twitter"
                    value={form.twitter}
                    onChange={handleInputChange}
                    placeholder="@yourhandle or https://twitter.com/you"
                  />
                </div>
                <div className="ts-field">
                  <label>Telegram</label>
                  <input
                    name="telegram"
                    value={form.telegram}
                    onChange={handleInputChange}
                    placeholder="t.me/yourchannel"
                  />
                </div>
                <div className="ts-field">
                  <label>Website</label>
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleInputChange}
                    placeholder="https://yourproject.xyz"
                  />
                </div>
              </div>

              <div className="ts-wizard-actions">
                <button
                  className="ts-btn ts-btn-primary"
                  disabled={!canNextFromStep1}
                  onClick={() => setStep(2)}
                >
                  Next: Bind the Soul
                </button>
                {!canNextFromStep1 && (
                  <span className="ts-hint">
                    Name, symbol, and supply are mandatory.
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ts-wizard-body">
              <h2>Step 2 · Bind the Rules</h2>
              <p className="ts-wizard-text">
                These switches separate a mainnet-worthy launch from an instant
                rug. Turn them off and the protocol will treat you as hostile.
              </p>

              <div className="ts-bind-grid">
                <BindingToggle
                  label="Lock the liquidity, chain the exit."
                  explanation="LP tokens go into a lock. No 'emergency' midnight drain."
                  checked={bindings.lockLiquidity}
                  onToggle={() => toggleBinding("lockLiquidity")}
                />
                <BindingToggle
                  label="Kill the printer after launch."
                  explanation="Renounced mint authority means nobody prints more later."
                  checked={bindings.renounceMint}
                  onToggle={() => toggleBinding("renounceMint")}
                />
                <BindingToggle
                  label="Erase god wallets from the design."
                  explanation="No secret admin wallet with global override access."
                  checked={bindings.noGodWallet}
                  onToggle={() => toggleBinding("noGodWallet")}
                />
                <BindingToggle
                  label="Expose the spellbook."
                  explanation="Open-source contracts so anyone can inspect the ritual."
                  checked={bindings.openSource}
                  onToggle={() => toggleBinding("openSource")}
                />
              </div>

              <div className="ts-wizard-actions">
                <button
                  className="ts-btn ts-btn-secondary"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="ts-btn ts-btn-primary"
                  onClick={() => {
                    handleManifest();
                    setStep(3);
                  }}
                >
                  Generate Manifest
                </button>
              </div>

              <div className="ts-warning-box">
                <h3>Rug Risk Snapshot</h3>
                <ul>
                  {buildWarnings(bindings).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="ts-wizard-body">
              <h2>Step 3 · Soul Manifest Output</h2>
              <p className="ts-wizard-text">
                This JSON is what drives the backend and, later, mainnet. On
                devnet it&apos;s your test ritual; on mainnet it&apos;s the real
                thing.
              </p>

              <pre className="ts-json">
                {manifestJson || "// Click “Generate Manifest” to produce output."}
              </pre>

              <div className="ts-wizard-actions">
                <button
                  className="ts-btn ts-btn-secondary"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  className="ts-btn ts-btn-outline"
                  onClick={handleCopyManifest}
                  disabled={!manifestJson}
                >
                  Copy Manifest JSON
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Side panel */}
        <aside className="ts-card ts-side">
          <h2 className="ts-side-title">Soul Stream</h2>
          <p className="ts-side-text">
            On mainnet, this becomes a live stream of launches, blocked rugs,
            and locked liquidity events. In this build it reacts to your
            manifests.
          </p>

          <div className="ts-stream-list">
            {soulStream.map((item, idx) => (
              <div key={idx} className="ts-stream-item">
                <div className="ts-stream-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="ts-side-divider" />

          <div className="ts-philosophy">
            <h3>Twisted Soul Code</h3>
            <ul>
              <li>SOUL is the house token at the center of every ritual.</li>
              <li>
                First 200 mainnet creators receive 500 SOUL as protocol tribute.
              </li>
              <li>
                Launches that break core bindings never clear through the altar.
              </li>
              <li>
                Liquidity and authority rules are enforced so the chart doesn&apos;t
                become a crime scene.
              </li>
            </ul>
          </div>

          <div className="ts-side-divider" />

          <div className="ts-ambient">
            <h3 className="ts-ambient-title">Soul Pulse</h3>
            <p className="ts-ambient-text">
              Ambient ritual load based on how strict your bindings are. The
              cleaner the launch, the calmer the pulse.
            </p>
            <div className="ts-ambient-bar">
              <div className="ts-ambient-fill" />
            </div>
            <div className="ts-ambient-meta">
              <span className="ts-ambient-label">Ritual Stability</span>
              <span className="ts-ambient-value">
                {allCoreBindings ? "92%" : "47%"}
              </span>
            </div>
          </div>
        </aside>
      </main>

      <footer className="ts-footer">
        <span>Twisted Soul CP2 — Frontend + devnet pipeline wired.</span>
        <span>
          Next: DEX pool creation, LP lock vault, and mainnet activation once
          your wallet holds real SOL.
        </span>
      </footer>
    </div>
  );
};

type BindingToggleProps = {
  label: string;
  explanation: string;
  checked: boolean;
  onToggle: () => void;
};

const BindingToggle: React.FC<BindingToggleProps> = ({
  label,
  explanation,
  checked,
  onToggle,
}) => {
  return (
    <div className="ts-bind-toggle" onClick={onToggle}>
      <div className={`ts-toggle-shell ${checked ? "ts-toggle-on" : "ts-toggle-off"}`}>
        <div className="ts-toggle-thumb" />
      </div>
      <div className="ts-toggle-text">
        <div className="ts-toggle-label">{label}</div>
        <div className="ts-toggle-expl">{explanation}</div>
      </div>
    </div>
  );
};

export default App;
