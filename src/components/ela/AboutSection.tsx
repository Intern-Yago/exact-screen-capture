import { Sparkles, Users, Target, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Imersão Prática",
    description: "Dois dias focados em ação, não em teoria",
  },
  {
    icon: Users,
    title: "Para Mulheres",
    description: "Ambiente acolhedor e colaborativo",
  },
  {
    icon: Target,
    title: "Aplicado ao Digital",
    description: "Estratégias específicas para o online",
  },
  {
    icon: Zap,
    title: "Resultados Reais",
    description: "Você sai com um plano concreto",
  },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-20 md:py-32 bg-card">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
              O que é o ELA?
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              Um treinamento que vai além
              <br />
              <span className="text-primary italic">do convencional</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              O ELA é um treinamento presencial de dois dias criado para mulheres empreendedoras que 
              atuam no digital e querem transformar não só seus negócios, mas a forma como lideram 
              suas vidas e carreiras.
            </p>
          </div>
          
          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Quote */}
          <div className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-accent/50 to-secondary/30 border border-primary/10 text-center">
            <blockquote className="font-serif text-xl md:text-2xl text-foreground italic leading-relaxed">
              "Não é sobre motivação. É sobre <span className="text-primary font-semibold not-italic">clareza</span>, 
              <span className="text-primary font-semibold not-italic"> estratégia</span> e 
              <span className="text-primary font-semibold not-italic"> ação</span>."
            </blockquote>
            <p className="mt-4 text-muted-foreground font-medium">
              — Isabela Lobato
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
