import type { Metadata } from "next";
import "./globals.css";
import {LanguageProvider} from "./i18n";
export const metadata: Metadata = {
  title: "SuguWa Tournaments Information",
  description: "Find amateur, masters and open water polo events around the world with SuguWa.",
  openGraph: { title: "SuguWa Tournaments Information", description: "Find amateur, masters & open water polo events around the world.", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "SuguWa Tournaments Information", description: "Find amateur, masters & open water polo events around the world.", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><LanguageProvider>{children}</LanguageProvider></body></html>; }
