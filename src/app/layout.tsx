import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
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
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/PhotoRoom-20260504_162240.png" />
        <link rel="apple-touch-icon" href="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/PhotoRoom-20260504_162240.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased bg-black text-white min-h-screen flex flex-col justify-between">
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
        <div className="flex-grow">
          {children}
        </div>
        <footer className="w-full py-6 border-t border-white/5 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-[10px] text-gray-500 font-medium select-none bg-black/30 backdrop-blur-md relative z-10">
          <p>© {new Date().getFullYear()} BioAthlete. Tous droits réservés.</p>
          <div className="flex items-center gap-3">
            <Link href="/cgu" className="hover:text-emerald-400 hover:underline">
              CGU
            </Link>
            <span className="text-white/10 select-none">•</span>
            <Link href="/confidentialite" className="hover:text-emerald-400 hover:underline">
              Confidentialité
            </Link>
            <span className="text-white/10 select-none">•</span>
            <Link href="/mentions-legales" className="hover:text-emerald-400 hover:underline">
              Mentions Légales
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
