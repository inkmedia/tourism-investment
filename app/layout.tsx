import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "../components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

const lora = localFont({
  src: [
    { path: "../public/fonts/Lora-Regular.woff2", weight: "400 700", style: "normal" },
    { path: "../public/fonts/Lora-Italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-lora",
  adjustFontFallback: "Times New Roman",
});
const roboto = localFont({
  src: [
    { path: "../public/fonts/Roboto-Regular.woff2", weight: "300 700", style: "normal" },
    { path: "../public/fonts/Roboto-Italic.woff2", weight: "300 700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-roboto",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: "Tourism Investment | Gelephu Mindfulness City",
  description:
    "Explore tourism investment opportunities in Gelephu Mindfulness City, Bhutan.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} ${roboto.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
