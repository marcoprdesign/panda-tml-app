import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pandas Of Tomorrowland",
  description: "Private Festival Hub - Consciencia Edition",
  formatDetection: {
    telephone: false,
  },
  // Déclaration des icônes pour le bookmarking
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png", // Pour Android/Navigateurs
    apple: "/apple-touch-icon.png", // Pour l'écran d'accueil iPhone
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pandas Of Tomorrowland",
  },
};

// Mise à jour du viewport avec la couleur Saphir Consciencia
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#131F3B", // La barre d'état matchera ton nouveau bleu
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="bg-[#0A1121]"> 
      <body className={`${inter.className} antialiased selection:bg-[#E7C66E] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}