import { Instagram, MessageCircle, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Brand */}
            <div>
              <h3 className="font-serif text-2xl font-semibold mb-4">ELA</h3>
              <p className="text-background/70 text-sm leading-relaxed">
                Empreendedorismo, Liderança e Autenticidade no Digital
              </p>
            </div>
            
            {/* Event info */}
            <div>
              <h4 className="font-semibold mb-4">O Evento</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li>6 e 7 de Março de 2026</li>
                <li>Casa Volpi - Park Way, Brasília/DF</li>
                <li>Treinamento Presencial</li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#whatsapp" 
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-background/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/50">
              <p className="flex items-center gap-1">
                Feito com <Heart className="w-4 h-4 text-primary fill-primary" /> por Isabela Lobato
              </p>
              <div className="flex gap-6">
                <a href="/termos" className="hover:text-background transition-colors">
                  Política de Privacidade
                </a>
                <a href="/termos" className="hover:text-background transition-colors">
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
