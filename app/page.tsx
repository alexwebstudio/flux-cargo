import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Steps from "@/components/Steps";
import Services from "@/components/Services";
import Tariffs from "@/components/Tariffs";
import Calculator from "@/components/Calculator";
import Marketplaces from "@/components/Marketplaces";
import Categories from "@/components/Categories";
import About from "@/components/About";
import Faq from "@/components/Faq";
import CtaFinal from "@/components/CtaFinal";
import Contacts from "@/components/Contacts";

export default function Home() {
  return (
    <>
      <Preloader />
      <main>
        <Hero />
        <Metrics />
        <Steps />
        <Services />
        <Tariffs />
        <Calculator />
        <Marketplaces />
        <Categories />
        <About />
        <Faq />
        <CtaFinal />
        <Contacts />
      </main>
    </>
  );
}