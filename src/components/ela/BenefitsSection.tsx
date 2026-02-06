import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Users, 
  Heart, 
  Compass,
  Star,
  Rocket,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Lightbulb,
    title: "Clareza absoluta",
    description: "Entenda exatamente onde você está e o que precisa fazer primeiro",
  },
  {
    icon: TrendingUp,
    title: "Estratégia personalizada",
    description: "Um plano de ação criado para a realidade do seu negócio",
  },
  {
    icon: Clock,
    title: "Economia de tempo",
    description: "Pare de girar em círculos e foque no que realmente importa",
  },
  {
    icon: Users,
    title: "Networking qualificado",
    description: "Conexões com mulheres que estão no mesmo nível de comprometimento",
  },
  {
    icon: Heart,
    title: "Confiança renovada",
    description: "Saia do evento com certeza sobre suas próximas decisões",
  },
  {
    icon: Compass,
    title: "Direção clara",
    description: "Chega de dúvidas sobre qual caminho seguir no seu negócio",
  },
];

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
              Benefícios reais
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              O que você vai conquistar
              <br />
              <span className="text-primary italic">nesses dois dias</span>
            </h2>
          </div>
          
          {/* Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-accent transition-all duration-300">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Extra highlight */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-accent/50 border border-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Ambiente exclusivo</h4>
                <p className="text-sm text-muted-foreground">Grupo limitado para máximo aproveitamento</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-accent/50 border border-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Suporte contínuo</h4>
                <p className="text-sm text-muted-foreground">Acompanhamento mesmo após o evento</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300 group"
              asChild
            >
              <a href="#formulario" className="flex items-center gap-2">
                Não quero ficar de fora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
