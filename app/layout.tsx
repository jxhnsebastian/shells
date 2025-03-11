import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SearchProvider } from "@/components/context/SearchContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shells",
  description: "thinking about it",
  applicationName: "Shells",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shells",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#000000",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-[100dvw] h-[100dvh]`}
      >
        <SessionProvider>
          <SearchProvider>{children}</SearchProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
