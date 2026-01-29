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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Check, ShieldCheck } from "lucide-react";

// Initialize Stripe with publishable key
const stripePromise = loadStripe("pk_test_51SuiyN3aMoVTeUyesMzBXDlSyxADyT18NybQGOTb7fR6RexPfT8nP5NaSGAGMGFxuFrNF0n6cC3NNRmhvnvEaHZd00lDQVCgOu");

type TierId = "individual" | "vip" | "dupla";

interface TierConfig {
  name: string;
  price: string;
  description: string;
}

const TIERS: Record<TierId, TierConfig> = {
  individual: {
    name: "Individual",
    price: "R$ 997",
    description: "Acesso completo aos 2 dias de evento",
  },
  vip: {
    name: "VIP",
    price: "R$ 1.497",
    description: "Experiência premium com benefícios exclusivos",
  },
  dupla: {
    name: "Dupla",
    price: "R$ 1.797",
    description: "2 ingressos para você e uma amiga",
  },
};

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
  const tierConfig = TIERS[tier];

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
          Seu ingresso <strong>{tierConfig.name}</strong> para o ELA foi confirmado.
        </p>
        <p className="text-muted-foreground mb-8">
          Você receberá um e-mail com os detalhes do evento.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="w-full">
          Voltar para o site
        </Button>
      </div>
    </div>
  );
};

// Main checkout page
const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const tier = (searchParams.get("tier") as TierId) || "individual";
  const isSuccess = searchParams.get("success") === "true";

  const [step, setStep] = useState<"form" | "payment" | "success">(
    isSuccess ? "success" : "form"
  );
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tierConfig = TIERS[tier] || TIERS.individual;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Preencha todos os campos",
        description: "Nome, e-mail e telefone são obrigatórios.",
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
            onClick={() => navigate("/#ingressos")}
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
                <p className="text-sm text-muted-foreground mt-1">
                  6 e 7 de Março de 2026 • Brasília, DF
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
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Maria Silva"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
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
                  <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
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
