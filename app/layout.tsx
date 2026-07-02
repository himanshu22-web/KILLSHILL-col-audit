import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "KOL Audit — Killshill",
  description: "Live leaderboard and signal audit trail for tracked financial influencers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#131417",
              border: "1px solid #24262c",
              color: "#f1f2f4",
            },
          }}
        />
      </body>
    </html>
  );
}
