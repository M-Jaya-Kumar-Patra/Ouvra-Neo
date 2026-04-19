import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers"; // Use the wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ouvra Neo",
  description: "AI-Powered Personal Finance & Expense Split Tracking Platform",
  manifest: "/site.webmanifest", // Browser looks in /public/site.webmanifest
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" }
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`} // Added 'dark'
    >
      {/* Selection:bg-indigo-500 adds that pro touch when highlighting text */}
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-indigo-500/30">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}