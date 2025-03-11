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
  description: "Your local Shells",
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
      { url: "/icons/shell_icon.svg", sizes: "32x32", type: "image/svg" },
      { url: "/icons/shell_icon.svg", sizes: "16x16", type: "image/svg" },
    ],
    apple: "/icons/shell_icon.svg",
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
