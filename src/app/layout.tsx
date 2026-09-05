import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lovelybakes.vercel.app"),
  title: "Lovelybakes | Baked with heart in Singapore",
  description:
    "Home-baked celebration cakes, vintage piping and handmade toppers in Singapore.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lovelybakes | Baked with heart in Singapore",
    description:
      "Home-baked celebration cakes, vintage piping and handmade toppers in Singapore.",
    type: "website",
    locale: "en_SG",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
