import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000"),
);

export const metadata: Metadata = {
  metadataBase,
  alternates: { canonical: "/" },
  title: "Omugwo: The Season Mother Came | Buy the Novella",
  description:
    "A warm, funny, emotionally rich novella about mothers, daughters, new life, and the stories families carry across generations.",
  keywords: [
    "Omugwo",
    "African literary fiction",
    "motherhood novella",
    "Igbo culture",
    "family fiction",
  ],
  authors: [{ name: "Ifeoma Clark" }, { name: "Henry Loveday" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Omugwo: The Season Mother Came",
    description:
      "A mother comes to care. A family secret comes with her. Discover a warm novella about family, new life, and inherited stories.",
    type: "book",
    locale: "en_NG",
    images: [
      {
        url: "/books/Omugwo_KDP_Kindle_Cover.jpg",
        width: 1600,
        height: 2400,
        alt: "Omugwo book cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omugwo: The Season Mother Came",
    description:
      "A mother comes to care. A family secret comes with her.",
    images: ["/books/Omugwo_KDP_Kindle_Cover.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f3eadb",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${cormorant.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
