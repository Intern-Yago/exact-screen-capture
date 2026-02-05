import { Search, Wrench, ArrowRight } from "lucide-react";

const days = [
  {
    day: "Dia 1",
    date: "6 de Março",
    time: "14h às 20h",
    title: "Diagnóstico",
    subtitle: "Auditoria completa do seu negócio",
    icon: Search,
    items: [
      "Mapeamento da situação atual",
      "Identificação de problemas e oportunidades",
      "Análise de posicionamento e oferta",
      "Clareza sobre onde você está",
    ],
    color: "from-primary/20 to-accent",
  },
  {
    day: "Dia 2",
    date: "7 de Março",
    time: "10h às 20h",
    title: "Estratégia",
    subtitle: "Correção e direcionamento",
    icon: Wrench,
    items: [
      "Definição de prioridades imediatas",
      "Montagem do plano de ação",
      "Ajustes práticos em tempo real",
      "Clareza sobre para onde ir",
    ],
    color: "from-accent to-secondary",
  },
];

const ScheduleSection = () => {
  return (
    <section id="cronograma" className="py-20 md:py-32 bg-card">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
              O que você vai fazer
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              Dois dias de{" "}
              <span className="text-primary italic">transformação real</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma jornada estruturada do diagnóstico à ação, para que você saia com decisões tomadas.
            </p>
          </div>
          
          {/* Days cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {days.map((dayInfo, index) => (
              <div 
                key={index}
                className={`relative p-8 md:p-10 rounded-3xl bg-gradient-to-br ${dayInfo.color} border border-border/30 overflow-hidden`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-background/20 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  {/* Day badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm mb-6">
                    <dayInfo.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{dayInfo.day}</span>
                    <span className="text-sm text-muted-foreground">• {dayInfo.date}</span>
                    <span className="text-sm text-muted-foreground">• {dayInfo.time}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
                    {dayInfo.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {dayInfo.subtitle}
                  </p>
                  
                  {/* Items list */}
                  <ul className="space-y-3">
                    {dayInfo.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          {/* Result highlight */}
          <div className="mt-12 text-center">
            <div className="inline-block px-8 py-4 rounded-2xl bg-primary/10 border border-primary/20">
              <p className="font-serif text-lg md:text-xl text-foreground">
                ✨ Você sai com <span className="text-primary font-semibold">decisões</span>, 
                <span className="text-primary font-semibold"> estrutura</span> e 
                <span className="text-primary font-semibold"> clareza</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
