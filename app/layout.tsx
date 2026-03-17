import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TML HUB",
  description: "Private Festival Hub",
  // Empêche la détection auto des numéros de téléphone qui peuvent casser le style
  formatDetection: {
    telephone: false,
  },
};

// C'est ici que la magie opère pour bloquer le zoom
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0C", // Assure que la barre d'état du téléphone match avec ton fond noir
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="bg-[#0A0A0C]">
      <body className={`${inter.className} antialiased selection:bg-[#DFFF5E] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}