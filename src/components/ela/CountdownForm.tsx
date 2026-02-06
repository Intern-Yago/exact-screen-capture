import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CountdownForm = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-02-15T00:00:00");

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tenta salvar via Edge Function (que salva no MySQL)
      const { data, error } = await supabase.functions.invoke("save-lead-to-mysql", {
        body: { email, phone },
      });

      if (error) {
        console.error("Edge Function error:", error);
        throw new Error("Falha ao salvar lead: " + error.message);
      }

      toast({
        title: "Sucesso!",
        description: "Seus dados foram salvos. Entraremos em contato em breve.",
      });
      setEmail("");
      setPhone("");
    } catch (error: any) {
      console.error("Error saving lead:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar seus dados. Certifique-se de que a tabela 'leads' existe no seu banco de dados.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="timer-section" className="py-20 md:py-32 bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
            Em breve
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
            Prepare-se para o
            <span className="text-primary italic"> ELA</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            As inscrições abrirão em breve. Deixe seu contato para ser avisada em primeira mão.
          </p>
        </div>

        {/* Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-16">
          {[
            { label: "Dias", value: timeLeft.days },
            { label: "Horas", value: timeLeft.hours },
            { label: "Minutos", value: timeLeft.minutes },
            { label: "Segundos", value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="bg-background border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{item.value}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto bg-background border border-border/50 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Quero ser avisada"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CountdownForm;
