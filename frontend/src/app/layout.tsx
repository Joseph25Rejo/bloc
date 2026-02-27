import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadCommand — Real-time Lead Dashboard",
  description:
    "Real-time lead management dashboard with live updates, caller management, and smart lead assignment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable} style={{ margin: 0 }}>
        <Sidebar />
        <main
          style={{
            marginLeft: 240,
            minHeight: "100vh",
            padding: "32px 36px",
            background: "var(--bg-primary)",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
