import type { Metadata, Viewport } from "next";
// Шрифты хранятся в проекте (fontsource), сборка не зависит от Google Fonts.
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/manrope";
import "./globals.css";
import "@/styles/hero.css";
import "@/styles/container.css";
import "@/styles/container-mobile.css";
import "@/styles/sections.css";
import "@/styles/pages.css";
import "@/styles/track.css";
import "@/styles/mobile.css";
import SmoothScroll from "@/components/SmoothScroll";
import SiteReady from "@/components/SiteReady";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CalcModal from "@/components/CalcModal";
import FontPreview from "@/components/FontPreview";
import AwFlow from "@/components/AwFlow";

export const metadata: Metadata = {
  title: "Flux Cargo — доставка грузов из Китая в Казахстан от 1 коробки",
  description:
    "Выкупим, проверим, объединим и довезём товары из Китая в любой город Казахстана. Авиа, авто, Ж/Д и море. Работаем от 1 товара, расчёт за 15 минут.",
};

export const viewport: Viewport = { themeColor: "#0f172a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {process.env.NODE_ENV === "development" && (
          // dev: ?noraf — rAF на таймерах для превью-окон, где requestAnimationFrame не тикает
          <script
            dangerouslySetInnerHTML={{
              __html:
                "if(location.search.indexOf('noraf')>-1){window.requestAnimationFrame=function(c){return setTimeout(function(){c(performance.now())},16)};window.cancelAnimationFrame=clearTimeout}",
            }}
          />
        )}
      </head>
      <body>
        <SmoothScroll />
        <SiteReady />
        <FontPreview />
        <Header />
        {children}
        <Footer />
        <CalcModal />
        <AwFlow />
      </body>
    </html>
  );
}
