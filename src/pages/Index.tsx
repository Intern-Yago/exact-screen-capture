import HeroSection from "@/components/ela/HeroSection";
import AboutSection from "@/components/ela/AboutSection";
import DifferentialsSection from "@/components/ela/DifferentialsSection";
import ScheduleSection from "@/components/ela/ScheduleSection";
import BenefitsSection from "@/components/ela/BenefitsSection";
import CountdownForm from "@/components/ela/CountdownForm";
import PricingSection from "@/components/ela/PricingSection";
import ConversionSection from "@/components/ela/ConversionSection";
import FAQSection from "@/components/ela/FAQSection";
import Footer from "@/components/ela/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <DifferentialsSection />
      <ScheduleSection />
      <BenefitsSection />
      <CountdownForm />
      <PricingSection />
      <ConversionSection />
      <FAQSection />
      <Footer />
    </main>
  );
};

export default Index;
