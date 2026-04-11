import type { Metadata } from "next";
import { Playfair_Display, Lato, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

// Elegant serif font for headings (fashion industry standard)
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Clean sans-serif for body text
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vestiti | Girls' Fashion Collection",
    template: "%s | Vestiti",
  },
  description:
    "Discover beautiful girls' clothing with AI-powered virtual try-on. See how outfits look before you buy at Vestiti.",
  keywords: ["girls clothing", "fashion", "Pakistani fashion", "virtual try-on", "Vestiti", "kids fashion"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${lato.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
