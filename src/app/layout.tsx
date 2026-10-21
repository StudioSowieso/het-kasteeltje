import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { Shell } from "@/components/Shell";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Het Kasteeltje",
  description: "Het huishouden van Het Kasteeltje: wie poetst wat, en wanneer.",
  appleWebApp: {
    capable: true,
    title: "Kasteeltje",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf3e2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${bricolage.variable} ${instrument.variable}`}>
      <body className="grain">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
