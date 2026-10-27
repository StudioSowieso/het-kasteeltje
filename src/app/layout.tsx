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
    <html lang="nl" className={`${bricolage.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script
          // Intro maar één keer per sessie: bij een volgende keer meteen de app.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('kt-intro'))document.documentElement.classList.add('kt-seen');else sessionStorage.setItem('kt-intro','1')}catch(e){}",
          }}
        />
      </head>
      <body className="grain">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
