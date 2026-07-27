import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Truck, ShieldCheck, RefreshCcw, CreditCard, HelpCircle, MessageCircle, Music2, ArrowUp } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ZigZag } from './doodles'
import { NewsletterForm } from './newsletter-form'

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-plum text-cream">
      {/* Wave decoration */}
      <div className="relative h-12 overflow-hidden">
        <svg viewBox="0 0 1200 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0 25C200 45 400 5 600 25C800 45 1000 5 1200 25V50H0V25Z" fill="#3B2A4A" />
          <path d="M0 30C200 50 400 10 600 30C800 50 1000 10 1200 30V50H0V30Z" className="fill-cream/5" />
        </svg>
      </div>

      {/* benefits strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
          {[
            { icon: Truck, title: 'Entrega rápida', desc: 'Em todo o Brasil', color: 'bg-tangerine' },
            { icon: RefreshCcw, title: 'Troca fácil', desc: 'Até 30 dias', color: 'bg-mint' },
            { icon: ShieldCheck, title: 'Pagamento seguro', desc: 'Pix, cartão, boleto', color: 'bg-grape' },
            { icon: CreditCard, title: 'Parcele em até 6x', desc: 'Sem juros no cartão', color: 'bg-sun' },
          ].map((b) => (
            <div key={b.title} className="group flex items-center gap-3 transition-transform hover:scale-105">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${b.color} text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <b.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-base font-bold">{b.title}</p>
                <p className="text-xs text-cream/70">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-5">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-tangerine text-white text-2xl shadow-md -rotate-3">
              🦊
            </span>
            <span className="font-display text-2xl font-bold">
              Piju<span className="text-sun">linho</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-cream/70 leading-relaxed">
            Roupas infantis confortáveis, estilosas e cheias de alegria. Vista seus pequenos com confiança e estilo colorido!
          </p>
          <div className="mt-4 text-sun">
            <ZigZag className="w-32" />
          </div>
          <div className="mt-4 flex gap-2">
            {[
              { Icon: Instagram, label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500' },
              { Icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
              { Icon: MessageCircle, label: 'WhatsApp', color: 'hover:bg-green-500' },
              { Icon: Youtube, label: 'YouTube', color: 'hover:bg-red-600' },
              { Icon: Music2, label: 'TikTok', color: 'hover:bg-gray-800' },
            ].map(({ Icon, label, color }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className={`grid h-9 w-9 place-items-center rounded-full bg-white/10 ${color} transition-all duration-300 hover:scale-110 hover:shadow-md`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-sun">Loja</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li><Link href="/produtos" className="animated-underline hover:text-sun transition-colors">Todos os produtos</Link></li>
            <li><Link href="/produtos?destaque=true" className="animated-underline hover:text-sun transition-colors">Destaques</Link></li>
            <li><Link href="/produtos?categoria=vestidos" className="animated-underline hover:text-sun transition-colors">Vestidos</Link></li>
            <li><Link href="/produtos?categoria=conjuntos" className="animated-underline hover:text-sun transition-colors">Conjuntos</Link></li>
            <li><Link href="/produtos?categoria=pijamas" className="animated-underline hover:text-sun transition-colors">Pijamas</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-sun">Ajuda</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li><Link href="/minha-conta" className="hover:text-sun transition-colors">Minha conta</Link></li>
            <li><Link href="/minha-conta" className="hover:text-sun transition-colors">Meus pedidos</Link></li>
            <li><Link href="/carrinho" className="hover:text-sun transition-colors">Carrinho</Link></li>
            <li><Link href="/rastrear-pedido" className="hover:text-sun transition-colors">Rastrear pedido</Link></li>
            <li><a href="#" className="hover:text-sun transition-colors">Política de troca</a></li>
            <li><a href="#" className="hover:text-sun transition-colors">Perguntas frequentes</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-sun">Contato</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-tangerine" /> (11) 99999-0000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-tangerine" /> oi@pijulinho.com.br</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-tangerine mt-0.5" /> São Paulo, Brasil</li>
          </ul>

          <NewsletterForm />
        </div>

        <div>
          <h4 className="flex items-center gap-2 font-display text-lg font-bold text-sun">
            <HelpCircle className="h-5 w-5" />
            Perguntas Frequentes
          </h4>
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="item-1" className="border-white/15">
              <AccordionTrigger className="text-sm font-semibold text-cream/90 hover:text-cream hover:no-underline">Como funciona a troca?</AccordionTrigger>
              <AccordionContent className="text-sm text-cream/70 leading-relaxed">Você pode trocar qualquer produto em até 30 dias após o recebimento, desde que esteja com etiqueta e sem uso. A troca é gratuita!</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/15">
              <AccordionTrigger className="text-sm font-semibold text-cream/90 hover:text-cream hover:no-underline">Quais as formas de pagamento?</AccordionTrigger>
              <AccordionContent className="text-sm text-cream/70 leading-relaxed">Aceitamos Pix (5% de desconto), cartão de crédito em até 6x sem juros, e boleto bancário.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/15">
              <AccordionTrigger className="text-sm font-semibold text-cream/90 hover:text-cream hover:no-underline">Qual o prazo de entrega?</AccordionTrigger>
              <AccordionContent className="text-sm text-cream/70 leading-relaxed">O prazo médio é de 3 a 7 dias úteis para todo o Brasil. Frete grátis para compras acima de R$199.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-white/15">
              <AccordionTrigger className="text-sm font-semibold text-cream/90 hover:text-cream hover:no-underline">Como escolher o tamanho?</AccordionTrigger>
              <AccordionContent className="text-sm text-cream/70 leading-relaxed">Cada produto possui uma tabela de tamanhos detalhada. Recomendamos medir a criança e comparar com nossa guia.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border-white/15">
              <AccordionTrigger className="text-sm font-semibold text-cream/90 hover:text-cream hover:no-underline">Vocês fazem promoções frequentes?</AccordionTrigger>
              <AccordionContent className="text-sm text-cream/70 leading-relaxed">Sim! Cadastre-se em nossa newsletter e receba 20% de desconto na primeira compra. Acompanhe também nossas redes sociais!</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-cream/60 md:flex-row">
          <p>© {new Date().getFullYear()} Pijulinho. Feito com 💛 para a criançada. {' '}Criado por <a href="https://lipe.host" target="_blank" rel="noopener noreferrer" className="inline-block text-tangerine font-semibold hover:underline transition-colors">Lipe.Host</a></p>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-tangerine/30">PIX</span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-tangerine/30">VISA</span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-tangerine/30">MASTER</span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-tangerine/30">ELO</span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-tangerine/30">BOLETO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-mint/20 px-2.5 py-1 text-mint font-bold">
              🔒 Seguro
            </span>
            <Link
              href="/"
              className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-tangerine/30"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Topo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
