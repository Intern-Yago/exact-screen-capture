import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const differentials = [
  {
    wrong: "Não é palestra",
    right: "É treinamento",
    description: "Você não vai apenas ouvir. Vai fazer, aplicar e sair com resultados concretos.",
  },
  {
    wrong: "Não é motivacional",
    right: "É técnico",
    description: "Menos emoção, mais método. Ferramentas práticas que funcionam no dia a dia.",
  },
  {
    wrong: "Não é genérico",
    right: "É aplicado ao seu negócio",
    description: "Cada exercício é voltado para a realidade do seu empreendimento digital.",
  },
  {
    wrong: "Não é passivo",
    right: "Exige ação durante o evento",
    description: "Você sai com decisões tomadas, não com uma lista de 'deveres' para depois.",
  },
];

const DifferentialsSection = () => {
  return (
    <section id="diferenciais" className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
              Por que é diferente?
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
              Este evento não é
              <br />
              <span className="text-primary italic">mais do mesmo</span>
            </h2>
          </div>
          
          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {differentials.map((item, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Badge number */}
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <span className="font-serif text-sm font-semibold text-primary">{index + 1}</span>
                </div>
                
                {/* Wrong vs Right */}
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground line-through">{item.wrong}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-serif text-xl font-semibold text-foreground">{item.right}</span>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300 group"
              asChild
            >
              <a href="#formulario" className="flex items-center gap-2">
                Garanta sua vaga
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentialsSection;
