import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const editorial = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_APP_URL ?? "https://lovelybakestore.com"),
  title: "Lovely Bakes | Celebration Cakes, Beautifully Made",
  description: "Thoughtfully designed celebration cakes and treats, handcrafted for memorable celebrations.",
  alternates: { canonical: "/" },
  twitter: { card: "summary_large_image", images: ["/brand/social-card.png"] },
  openGraph: {
    images: [{ url: "/brand/social-card.png", width: 1200, height: 630, alt: "Lovely Bakes — Celebration Cakes" }],
    type: "website",
    locale: "en_SG",
    url: "/",
    siteName: "Lovely Bakes",
    title: "Lovely Bakes | Celebration Cakes, Beautifully Made",
    description: "Thoughtfully designed celebration cakes and treats, handcrafted for memorable celebrations.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${editorial.variable}`}>
      <body>{children}</body>
    </html>
  );
}
