import { Button } from "@/components/ui/button";
import { Calendar, MapPin, MessageCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/50 via-background to-secondary/30" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tag do evento */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-8">
            <span className="text-sm font-medium text-primary">Treinamento Presencial Exclusivo</span>
          </div>
          
          {/* Headline principal */}
          <h1 className="animate-fade-up delay-100 font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight text-foreground mb-6">
            Empreendedorismo,{" "}
            <span className="text-primary italic">Liderança</span>{" "}
            <br className="hidden md:block" />
            e Autenticidade
          </h1>
          
          {/* Subheadline */}
          <p className="animate-fade-up delay-200 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Dois dias intensos de imersão prática para mulheres empreendedoras que querem 
            <span className="text-foreground font-medium"> sair com clareza, estratégia e decisões</span> para o seu negócio digital.
          </p>
          
          {/* Info do evento */}
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10">
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">6 e 7 de Março de 2026</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">Brasília, DF</span>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="animate-fade-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25"
              asChild
            >
              <a href="#ingressos">
                Garanta sua vaga no ELA
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-8 py-6 text-lg font-medium border-2 border-primary/30 hover:bg-accent hover:border-primary/50 transition-all duration-300"
              asChild
            >
              <a href="#whatsapp" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Fale com nossa equipe
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
