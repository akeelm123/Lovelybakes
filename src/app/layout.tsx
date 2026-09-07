import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_APP_URL ?? "https://lovelybakestore.com"),
  title: "Lovelybakes | Baked with heart in Singapore",
  description: "Small-batch cakes, tarts and celebration bakes, handcrafted in Singapore.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_SG",
    url: "/",
    siteName: "Lovelybakes by Nash",
    title: "Lovelybakes | Baked with heart in Singapore",
    description: "Small-batch cakes, tarts and celebration bakes, handcrafted in Singapore.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
