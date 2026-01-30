import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";

type TierId = "basico" | "intermediario" | "premium";

interface PricingTier {
  id: TierId;
  name: string;
  price: string;
  period: string;
  badge: string;
  badgeDescription: string;
  features: string[];
  highlighted: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: "basico",
    name: "Básico",
    price: "R$ 500",
    period: "à vista",
    badge: "Acesso completo",
    badgeDescription: "2 dias de imersão",
    features: [
      "Acesso aos 2 dias de evento",
      "Material de apoio digital",
      "Certificado de participação",
      "Coffee break incluso",
    ],
    highlighted: false,
  },
  {
    id: "intermediario",
    name: "Intermediário",
    price: "R$ 550",
    period: "à vista",
    badge: "Experiência Completa",
    badgeDescription: "Benefícios adicionais",
    features: [
      "Tudo do plano Básico",
      "Assento nas primeiras filas",
      "Mentoria em grupo pós-evento",
      "Acesso ao grupo exclusivo",
      "Kit de boas-vindas especial",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 600",
    period: "à vista",
    badge: "VIP",
    badgeDescription: "Experiência exclusiva",
    features: [
      "Tudo do plano Intermediário",
      "Mentoria individual pós-evento",
      "Acesso prioritário a eventos futuros",
      "Networking exclusivo",
      "Material complementar premium",
    ],
    highlighted: false,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  const handleSelectTier = (tierId: TierId) => {
    navigate(`/checkout?tier=${tierId}`);
  };

  return (
    <section id="ingressos" className="py-20 md:py-32 bg-secondary/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
            Investimento
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
            Escolha seu
            <span className="text-primary italic"> ingresso</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Invista em você e no seu negócio. Vagas limitadas para garantir uma experiência transformadora.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
                tier.highlighted
                  ? "bg-background border-2 border-primary shadow-lg scale-[1.02]"
                  : "bg-background border border-border/50 hover:border-primary/30"
              }`}
            >
              {/* Popular Badge */}
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full shadow-md">
                    <Sparkles className="w-4 h-4" />
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="font-serif text-2xl font-semibold text-foreground text-center mb-4">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <span
                  className={`font-serif text-4xl md:text-5xl font-bold ${
                    tier.highlighted ? "text-primary" : "text-foreground"
                  }`}
                >
                  {tier.price}
                </span>
                <span className="block text-muted-foreground text-sm mt-1">
                  {tier.period}
                </span>
              </div>

              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div
                  className={`inline-block px-4 py-2 rounded-lg text-center ${
                    tier.highlighted
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-secondary border border-border/50"
                  }`}
                >
                  <span
                    className={`block font-semibold text-sm ${
                      tier.highlighted ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {tier.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tier.badgeDescription}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full py-6 text-base font-semibold mb-8 group ${
                  tier.highlighted
                    ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "bg-graphite hover:bg-graphite/90"
                }`}
                onClick={() => handleSelectTier(tier.id)}
              >
                Garantir Vaga
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Features List */}
              <ul className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        tier.highlighted ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          Pagamento seguro • Cartão de crédito ou PIX
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
