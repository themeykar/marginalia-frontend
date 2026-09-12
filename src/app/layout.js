import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL("https://marginalia-online.vercel.app"),
  title: {
    default: "Marginalia — A Quiet Reading Journal",
    template: "%s | Marginalia",
  },
  description:
    "A quiet sanctuary for your reading life. Track books unhurried, and hold onto the passages that stopped you mid-page.",
  openGraph: {
    title: "Marginalia — A Quiet Reading Journal",
    description:
      "A quiet sanctuary for your reading life. Track books unhurried, and hold onto the passages that stopped you mid-page.",
    url: "https://marginalia-online.vercel.app",
    siteName: "Marginalia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Marginalia — A Quiet Reading Journal",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marginalia — A Quiet Reading Journal",
    description:
      "A quiet sanctuary for your reading life. Track books unhurried, and hold onto the passages that stopped you mid-page.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}