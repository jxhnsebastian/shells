import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Achappam",
  description: "thinking about it",
  applicationName: "Achappam",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Achappam",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon512.png", sizes: "512x512", type: "image/png" }],
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
