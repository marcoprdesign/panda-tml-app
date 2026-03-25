import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pandas Archive",
  description: "Tomorrowland Legacy Journal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    // "black-translucent" permet à ton fond de s'étendre sous la barre d'état 
    // pour un look d'application native sur iOS
    statusBarStyle: "black-translucent",
    title: "Pandas Archive",
  },
};

export const viewport: Viewport = {
  // On garde le blanc glacé pour que Safari fusionne avec ton fond d'app
  themeColor: "#f6f6f9", 
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#f6f6f9" media="(prefers-color-scheme: light)" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      {/* bg-[#f6f6f9] : Couleur de fond du document (Safari/Chrome hors-app)
          text-[#313449] : Couleur de texte par défaut (Waikawa Dark)
          selection : Couleur quand on surligne du texte
      */}
      <body className="antialiased bg-[#f6f6f9] text-[#313449] selection:bg-[#adb2cc] selection:text-[#202231]">
        {/* Conteneur principal compact 
            shadow-black/5 : Ombre très légère sur les bords (plus propre que l'ancienne shadow-2xl)
        */}
        <div className="max-w-md mx-auto min-h-screen shadow-xl shadow-black/5 bg-[#f6f6f9]">
          {children}
        </div>
      </body>
    </html>
  );
}