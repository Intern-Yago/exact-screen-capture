import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Check, ShieldCheck } from "lucide-react";

// Initialize Stripe with publishable key and matching API version
const stripePromise = loadStripe(
  "pk_test_51SuiyN3aMoVTeUyesMzBXDlSyxADyT18NybQGOTb7fR6RexPfT8nP5NaSGAGMGFxuFrNF0n6cC3NNRmhvnvEaHZd00lDQVCgOu",
  { apiVersion: "2024-12-18.acacia" as any }
);

type TierId = "basico" | "intermediario" | "premium" | "teste";

interface TierConfig {
  name: string;
  price: string;
  description: string;
}

const TIERS: Record<TierId, TierConfig> = {
  basico: {
    name: "Básico",
    price: "R$ 500",
    description: "Acesso ao evento com benefícios essenciais",
  },
  intermediario: {
    name: "Intermediário",
    price: "R$ 550",
    description: "Acesso completo com benefícios adicionais",
  },
  premium: {
    name: "Premium",
    price: "R$ 600",
    description: "Experiência completa com benefícios exclusivos",
  },
  teste: {
    name: "Teste",
    price: "R$ 1,00",
    description: "Ingresso de teste para validar o fluxo",
  },
};

const AREAS_ATUACAO = [
  "Tecnologia",
  "Saúde",
  "Educação",
  "Comércio",
  "Indústria",
  "Serviços",
  "Agronegócio",
  "Construção Civil",
  "Financeiro",
  "Consultoria",
  "Marketing",
  "Outros",
];

// Payment form component (inside Elements provider)
const CheckoutForm = ({
  orderId,
  onSuccess,
}: {
  orderId: string | null;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?success=true&order_id=${orderId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento.",
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    } else if (paymentIntent && paymentIntent.status === "processing") {
      toast({
        title: "Pagamento em processamento",
        description: "Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail.",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-secondary/30 rounded-lg p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processando...
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5 mr-2" />
            Finalizar Pagamento
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Pagamento seguro processado por Stripe
      </p>
    </form>
  );
};

// Success view
const SuccessView = ({ tier }: { tier: TierId }) => {
  const navigate = useNavigate();
  const tierConfig = TIERS[tier] || TIERS.basico;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
          Pagamento Confirmado!
        </h1>
        <p className="text-muted-foreground mb-2">
          Seu ingresso <strong>{tierConfig.name}</strong> foi confirmado.
        </p>
        <p className="text-muted-foreground mb-8">
          Você receberá um e-mail com os detalhes.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="w-full">
          Voltar para o site
        </Button>
      </div>
    </div>
  );
};

// Main checkout page
// Map old tier names to new ones for backwards compatibility
const TIER_MAPPING: Record<string, TierId> = {
  individual: "basico",
  vip: "intermediario",
  dupla: "premium",
  basico: "basico",
  intermediario: "intermediario",
  premium: "premium",
  teste: "teste",
};

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const rawTier = searchParams.get("tier") || "basico";
  const tier = TIER_MAPPING[rawTier] || "basico";
  const isSuccess = searchParams.get("success") === "true";

  const [step, setStep] = useState<"form" | "payment" | "success">(
    isSuccess ? "success" : "form"
  );
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    cpf: "",
    cnpj: "",
    areaAtuacao: "",
    email: "",
    phone: "",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tierConfig = TIERS[tier] || TIERS.basico;

  // Format CPF as user types
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // Format CNPJ as user types
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 14);
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  // Format phone as user types
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  // Format birth date as user types
  const formatBirthDate = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 8);
    return numbers
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName || !formData.birthDate || !formData.cpf || !formData.areaAtuacao || !formData.email || !formData.phone) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        description: "Nome, data de nascimento, CPF, área de atuação, e-mail e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validate CPF length
    if (formData.cpf.replace(/\D/g, "").length !== 11) {
      toast({
        title: "CPF inválido",
        description: "O CPF deve conter 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    // Validate CNPJ if provided
    if (formData.cnpj && formData.cnpj.replace(/\D/g, "").length !== 14) {
      toast({
        title: "CNPJ inválido",
        description: "O CNPJ deve conter 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", {
        body: {
          tier,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          birthDate: formData.birthDate,
          cpf: formData.cpf,
          cnpj: formData.cnpj || null,
          areaAtuacao: formData.areaAtuacao,
        },
      });

      if (error) throw error;

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setStep("payment");
      } else {
        throw new Error("Erro ao criar sessão de pagamento");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Confirm payment status
    if (orderId) {
      try {
        await supabase.functions.invoke("confirm-payment", {
          body: { paymentIntentId: clientSecret?.split("_secret_")[0] },
        });
      } catch (e) {
        console.error("Error confirming payment:", e);
      }
    }
    setStep("success");
  };

  if (step === "success") {
    return <SuccessView tier={tier} />;
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="bg-background border-b border-border/50">
        <div className="container px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </header>

      <main className="container px-4 py-8 md:py-16">
        <div className="max-w-xl mx-auto">
          {/* Order summary */}
          <div className="bg-background rounded-2xl border border-border/50 p-6 mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              Resumo do Pedido
            </h2>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-medium text-foreground">
                  Ingresso {tierConfig.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tierConfig.description}
                </p>
              </div>
              <p className="font-serif text-2xl font-bold text-primary">
                {tierConfig.price}
              </p>
            </div>
          </div>

          {/* Form step */}
          {step === "form" && (
            <div className="bg-background rounded-2xl border border-border/50 p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                Seus Dados
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Maria Silva Santos"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: formatBirthDate(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: formatCPF(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaAtuacao">Área de Atuação *</Label>
                  <Select
                    value={formData.areaAtuacao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, areaAtuacao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua área de atuação" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS_ATUACAO.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="maria@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: formatPhone(e.target.value) })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Carregando...
                    </>
                  ) : (
                    "Continuar para Pagamento"
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Payment step */}
          {step === "payment" && clientSecret && (
            <div className="bg-background rounded-2xl border border-border/50 p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                Pagamento
              </h2>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#b89a8a",
                      borderRadius: "8px",
                    },
                  },
                  locale: "pt-BR",
                }}
                key={clientSecret}
              >
                <CheckoutForm orderId={orderId} onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
