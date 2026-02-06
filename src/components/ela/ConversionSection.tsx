import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

const ConversionSection = () => {
  return (
    <section id="conversion-section" className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-accent/30 to-secondary/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main content */}
          <div className="mb-10">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
              Seja avisada
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              Pronta para transformar
              <br />
              <span className="text-primary italic">seu negócio?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Junte-se a mulheres empreendedoras determinadas a sair da teoria e entrar em ação. 
              As vagas são limitadas.
            </p>
          </div>
          
          {/* Event info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10">
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">6 e 7 de Março de 2026</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">Casa Volpi - Park Way, Brasília/DF</span>
            </div>
          </div>
          
          {/* CTA */}
          <Button 
            size="lg" 
            className="px-10 py-7 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-xl shadow-primary/30 group"
            asChild
          >
            <a href="#timer-section" className="flex items-center gap-2">
              Quero ser avisada
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          
          <p className="mt-6 text-sm text-muted-foreground">
            Vagas limitadas • Inscrições em breve
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConversionSection;
