import "./globals.css";
import React from "react";

export const metadata = {
  title: "Monitoring Pertanian Perkotaan",
  description: "Dashboard Logbook Agroteknologi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}