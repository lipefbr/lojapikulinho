import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { FavoritesProvider } from "@/components/site/favorites-provider";
import { FloatingButtons } from "@/components/site/floating-buttons";
import { CookieBanner } from "@/components/site/cookie-banner";
import { LoadingBar } from "@/components/site/loading-bar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { ProductQuickView } from "@/components/site/product-quick-view";
import { NewsletterPopup } from "@/components/site/newsletter-popup";
import { ThemeProvider, themeInitScript } from "@/components/site/theme-provider";
import { CompareModal } from "@/components/site/compare-modal";
import { ScrollProgress, BackToTopButton } from "@/components/site/scroll-progress";
import { cn } from "@/lib/utils";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pijulinho — Roupas Infantis Coloridas e Confortáveis",
  description:
    "Roupas infantis confortáveis, estilosas e cheias de alegria. Vista seus pequenos com confiança e estilo colorido! Mais de 900 famílias confiam na gente.",
  keywords: ["roupas infantis", "moda infantil", "roupas para crianças", "pijulinho", "loja infantil"],
  authors: [{ name: "Pijulinho" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Pijulinho — Roupas Infantis Coloridas",
    description: "Vista seus pequenos com confiança e estilo colorido!",
    siteName: "Pijulinho",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={cn(
          nunito.variable,
          fredoka.variable,
          "antialiased bg-background text-foreground min-h-screen flex flex-col"
        )}
      >
        <ThemeProvider>
        <FavoritesProvider>
          <LoadingBar />
          <SiteHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <ProductQuickView />
          <FloatingButtons />
          <CookieBanner />
          <MobileBottomNav />
          <NewsletterPopup />
          <CompareModal />
          <ScrollProgress />
          <BackToTopButton />
          <Toaster position="top-center" richColors />
        </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
