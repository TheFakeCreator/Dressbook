import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/ToastContainer";
import KeyboardShortcutsProvider from "@/components/KeyboardShortcutsProvider";
import QuickActionButton from "@/components/QuickActionButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wardrobe Chronicle - Clothing Database for World-Building",
  description: "Manage clothing items, outfits, and character wardrobes for story writing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <KeyboardShortcutsProvider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ToastContainer />
            <QuickActionButton />
          </KeyboardShortcutsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
