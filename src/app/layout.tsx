import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import ThemeProvider from "./ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioAthlete",
  description: "Plateforme d'analyse de performance pour athlètes",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/PhotoRoom-20260504_162240.png" />
        <link rel="apple-touch-icon" href="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/PhotoRoom-20260504_162240.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          id="theme-strategy"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('bioathlete-theme');
                if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', t);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
        {/* Prevent flash of wrong theme is now handled in head */}
        <Script
          id="sw-reg"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        <ThemeProvider>
          <div className="flex-grow">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
