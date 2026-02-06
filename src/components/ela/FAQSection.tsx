import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Onde será o evento?",
    answer: "O evento ELA acontecerá em Brasília, DF. O local exato será informado aos participantes após a confirmação da inscrição. Será um espaço premium, preparado para proporcionar a melhor experiência de aprendizado.",
  },
  {
    question: "Qual o horário dos dois dias?",
    answer: "O evento acontece nos dias 6 e 7 de março de 2026. No dia 6, das 14h às 20h. No dia 7, das 10h às 20h. Intervalos para networking e coffee breaks inclusos.",
  },
  {
    question: "O evento é presencial ou online?",
    answer: "O ELA é 100% presencial. Acreditamos que a imersão presencial, as conexões pessoais e a energia do grupo são essenciais para a transformação que propomos.",
  },
  {
    question: "Preciso levar algo para o evento?",
    answer: "Leve seu notebook ou tablet para as atividades práticas, além de material para anotações. Todo o material didático será fornecido. Venha com mente aberta e pronta para agir!",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-card">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-medium text-sm uppercase tracking-wider mb-4">
              Dúvidas frequentes
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
              Perguntas e{" "}
              <span className="text-primary italic">respostas</span>
            </h2>
          </div>
          
          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border/50 rounded-2xl px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-all duration-300 bg-background"
              >
                <AccordionTrigger className="text-left font-serif text-lg font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* Additional help */}
          <div className="mt-12 text-center p-6 rounded-2xl bg-accent/50 border border-primary/10">
            <p className="text-foreground mb-2">
              Ainda tem dúvidas?
            </p>
            <p className="text-muted-foreground">
              Entre em contato pelo{" "}
              <a 
                href="https://api.whatsapp.com/send?phone=55618578600&text=Ol%C3%A1%21%20Vim%20da%20landing%20page%20e%20queria%20saber%20mais%20sobre%20o%20evento%20ELA." 
                className="text-primary font-medium hover:underline"
              >
                WhatsApp
              </a>{" "}
              e nossa equipe terá prazer em ajudar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
