import "./App.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function App() {
  const { connected, publicKey } = useWallet();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: 700 }}>
        Twisted Soul – Wallet Test
      </h1>

      <div style={{ minWidth: 220 }}>
        <WalletMultiButton />
      </div>

      <div
        style={{
          padding: "16px 20px",
          background: "#020617",
          borderRadius: "12px",
          border: "1px solid #1e293b",
          maxWidth: 480,
          textAlign: "center",
        }}
      >
        {connected && publicKey ? (
          <>
            <div style={{ marginBottom: 8, fontSize: 14, color: "#9ca3af" }}>
              Connected wallet:
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                wordBreak: "break-all",
                color: "#a855f7",
              }}
            >
              {publicKey.toBase58()}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 14, color: "#9ca3af" }}>
            Not connected. Click the button above and approve in Phantom.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
