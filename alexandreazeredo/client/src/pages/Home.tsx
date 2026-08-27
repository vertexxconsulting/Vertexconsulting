import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  Mic2,
  Network,
  Play,
  Presentation,
  Quote,
  Sparkles,
  Target,
  X,
} from "lucide-react";

const logoSrc = "/manus-storage/Gemini_Generated_Image_v49e0jv49e0jv49e_1922c604.jpg";
const profileSrc = "/manus-storage/alexandre-profile-instagram_22971f2c.jpg";
const heroTextureSrc = "/manus-storage/alexandre-hero-texture_d02dac37.jpg";

const navItems = [
  { label: "Sobre", href: "#sobre" },
  { label: "Atuação", href: "#atuacao" },
  { label: "Resultados", href: "#resultados" },
  { label: "FAQ", href: "#faq" },
];

const credentials = [
  {
    icon: GraduationCap,
    eyebrow: "Formação executiva",
    title: "Estratégia antes da ferramenta",
    text: "Harvard Business School e NOVA FCT Executive Education, com foco em liderança, estratégia e transformação.",
  },
  {
    icon: Mic2,
    eyebrow: "Papo de Valor",
    title: "Conversas que ampliam repertório",
    text: "Host de um podcast que aproxima líderes de tecnologia dos desafios reais de quem decide.",
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: "Experiência C-Level",
    title: "Visão dos dois lados da mesa",
    text: "Vivência como IT Manager, CIO, CTO e líder de transformação digital em ambientes complexos.",
  },
  {
    icon: Network,
    eyebrow: "Comunidade e rede",
    title: "Capital relacional que abre caminhos",
    text: "8.800+ profissionais no LinkedIn e uma rede construída com intenção, generosidade e consistência.",
  },
];

const services = [
  {
    number: "01",
    icon: Target,
    title: "Mentoria Executiva 1:1",
    audience: "Para gerentes e diretores de TI que almejam a cadeira de CIO ou CTO.",
    bullets: [
      "Plano de carreira personalizado",
      "Preparação para entrevistas e promoções",
      "Networking estratégico e visibilidade",
      "Acesso direto via WhatsApp entre sessões",
    ],
    format: "Sessões quinzenais de 60min · 3 a 6 meses",
    action: "Quero avançar na carreira",
  },
  {
    number: "02",
    icon: Building2,
    title: "Advisory para CIOs",
    audience: "Para CIOs em exercício ou em transição que precisam de clareza para decidir.",
    bullets: [
      "Estratégia de TI alinhada ao negócio",
      "Governança e gestão de portfólio",
      "Transformação digital e IA aplicada",
      "Relacionamento com board e stakeholders",
    ],
    format: "Acompanhamento mensal · workshops sob demanda",
    action: "Conversar sobre advisory",
  },
  {
    number: "03",
    icon: Presentation,
    title: "Palestras e Treinamentos",
    audience: "Para empresas que querem elevar o nível da liderança em tecnologia.",
    bullets: [
      "Liderança em TI para o século 21",
      "Transformação digital na prática",
      "IA aplicada a operações corporativas",
      "Do técnico ao estratégico: a jornada do CIO",
    ],
    format: "In-company ou online · 60–90min + Q&A",
    action: "Solicitar uma proposta",
  },
];

const testimonials = [
  {
    quote: "O Alexandre me ajudou a estruturar minha jornada rumo ao CIO. Em 6 meses, consegui uma promoção para Diretoria de TI.",
    role: "Diretor de TI · depoimento de mentorado",
  },
  {
    quote: "O advisory do Alexandre transformou nossa governança de TI. Hoje temos clareza estratégica e alinhamento com o board.",
    role: "CIO · depoimento de cliente",
  },
  {
    quote: "As palestras do Alexandre são práticas, diretas e inspiradoras. Nosso time saiu com ações concretas.",
    role: "HR Director · depoimento corporativo",
  },
];

const faqItems = [
  {
    question: "Como funciona a mentoria 1:1?",
    answer: "Sessões quinzenais de 60min via Zoom, com plano personalizado, tarefas práticas e acesso direto no WhatsApp.",
  },
  {
    question: "Qual o investimento?",
    answer: "Cada caso é único. Após a sessão gratuita, apresento uma proposta sob medida para seu objetivo e momento de carreira.",
  },
  {
    question: "Você atende empresas ou apenas indivíduos?",
    answer: "Ambos. Tenho programas de mentoria individual, advisory para CIOs e palestras/treinamentos corporativos.",
  },
  {
    question: "Como agendo uma sessão gratuita?",
    answer: "Preencha o formulário acima. Em até 48h, entro em contato para agendar.",
  },
  {
    question: "Você emite nota fiscal?",
    answer: "Sim, para indivíduos (CPF) e empresas (CNPJ).",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("nome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const linkedin = String(data.get("linkedin") || "").trim();
    const objective = String(data.get("objetivo") || "").trim();

    if (name.length < 3) {
      toast.error("Insira seu nome completo para continuar.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Insira um e-mail válido.");
      return;
    }
    if (!linkedin.includes("linkedin.com")) {
      toast.error("Insira uma URL válida do LinkedIn.");
      return;
    }
    if (!objective) {
      toast.error("Selecione o seu objetivo principal.");
      return;
    }

    setSubmitted(true);
    form.reset();
    toast.success("Pedido recebido. Em até 48h entraremos em contato.");
  };

  return (
    <div className="site-shell">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Alexandre Azeredo — início">
            <span className="brand-logo-wrap">
              <img src={logoSrc} alt="Logo Result" className="brand-logo" />
            </span>
            <span className="brand-copy">
              <strong>Alexandre Azeredo</strong>
              <span>Mentor Executivo · CIO Advisor</span>
            </span>
          </a>

          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <a className="nav-cta" href="#contato" onClick={closeMenu}>
              Agendar conversa <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </nav>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-texture" style={{ backgroundImage: `url(${heroTextureSrc})` }} aria-hidden="true" />
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy" data-reveal>
              <div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> Estratégia · Liderança · Tecnologia</div>
              <h1 id="hero-title">
                Transformo líderes de TI em <em>CIOs</em> e empresas em organizações digitais.
              </h1>
              <p className="hero-subtitle">
                Mentoria executiva 1:1 e advisory estratégico para profissionais que querem chegar — ou se consolidar — no C-Level de Tecnologia.
              </p>
              <div className="hero-actions">
                {/* INTEGRAÇÃO CALENDLY: substituir este CTA pelo widget do Calendly */}
                <a className="button button-gold" href="#contato">
                  Agendar sessão estratégica gratuita <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <a className="text-link light-link" href="#atuacao">
                  Ver como posso ajudar <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="hero-proof" aria-label="Credenciais principais">
                <span><Check size={15} aria-hidden="true" /> 8.800+ no LinkedIn</span>
                <span><Check size={15} aria-hidden="true" /> Host do Papo de Valor</span>
                <span><Check size={15} aria-hidden="true" /> Harvard · NOVA FCT</span>
              </div>
            </div>

            <div className="hero-visual" data-reveal style={{ transitionDelay: "120ms" }}>
              <div className="visual-frame">
                <div className="visual-kicker">RESULT / 01</div>
                <img src={logoSrc} alt="Logo dourado com seta ascendente e a palavra Result" className="hero-logo" />
                <div className="visual-caption">
                  <span className="caption-dot" />
                  <span>Clareza para decisões que movem a carreira.</span>
                </div>
              </div>
              <div className="portrait-chip">
                <img src={profileSrc} alt="Alexandre Azeredo, foto de perfil" />
                <span><strong>Alexandre Azeredo</strong><small>Mentor Executivo</small></span>
              </div>
              <div className="visual-index">AA <span>26</span></div>
            </div>
          </div>
          <div className="hero-bottom-line" aria-hidden="true"><span>scroll para explorar</span><span className="line" /></div>
        </section>

        <section className="trust-bar" aria-label="Resumo de autoridade">
          <div className="container trust-grid">
            <div className="trust-item"><span className="trust-number">8.8k</span><span>profissionais<br />na rede</span></div>
            <div className="trust-divider" />
            <div className="trust-item"><span className="trust-number">01</span><span>podcast para<br />líderes de TI</span></div>
            <div className="trust-divider" />
            <div className="trust-item"><span className="trust-number">C</span><span>visão de<br />C-Level</span></div>
            <div className="trust-divider" />
            <div className="trust-quote">“Carreira executiva não se improvisa.<br /><strong>Constrói-se com intenção.</strong>”</div>
          </div>
        </section>

        <section className="section credentials-section" id="credenciais" aria-labelledby="credentials-title">
          <div className="container">
            <div className="section-heading split-heading" data-reveal>
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> O que sustenta o trabalho</div>
                <h2 id="credentials-title">Mais do que experiência.<br /><em>Repertório para decidir.</em></h2>
              </div>
              <p>Uma combinação rara de vivência executiva, formação contínua e proximidade com quem está construindo o futuro da tecnologia.</p>
            </div>
            <div className="credentials-grid">
              {credentials.map((credential, index) => {
                const Icon = credential.icon;
                return (
                  <article className="credential-card" key={credential.eyebrow} data-reveal style={{ transitionDelay: `${index * 70}ms` }}>
                    <div className="card-topline"><span>0{index + 1}</span><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></div>
                    <p className="card-eyebrow">{credential.eyebrow}</p>
                    <h3>{credential.title}</h3>
                    <p>{credential.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section services-section" id="atuacao" aria-labelledby="services-title">
          <div className="container">
            <div className="section-heading services-heading" data-reveal>
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> A atuação</div>
                <h2 id="services-title">Como posso <em>te ajudar</em></h2>
              </div>
              <p>O próximo nível pede uma abordagem sob medida. Escolha o contexto que mais se aproxima do seu momento.</p>
            </div>
            <div className="services-grid">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <article className={`service-card ${index === 1 ? "service-card-featured" : ""}`} key={service.number} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
                    <div className="service-meta"><span>{service.number}</span><Icon size={27} strokeWidth={1.35} aria-hidden="true" /></div>
                    <h3>{service.title}</h3>
                    <p className="service-audience">{service.audience}</p>
                    <div className="service-rule" />
                    <p className="mini-label">Entrega</p>
                    <ul>
                      {service.bullets.map((bullet) => <li key={bullet}><Check size={15} aria-hidden="true" /> {bullet}</li>)}
                    </ul>
                    <div className="service-format"><span>Formato</span>{service.format}</div>
                    <a className="service-link" href="#contato">{service.action} <ArrowUpRight size={16} aria-hidden="true" /></a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section results-section" id="resultados" aria-labelledby="results-title">
          <div className="container">
            <div className="results-intro" data-reveal>
              <div>
                <div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> Quem já trabalhou comigo</div>
                <h2 id="results-title">Direção que se transforma<br /><em>em movimento.</em></h2>
              </div>
              <div className="results-note"><Quote size={27} strokeWidth={1.2} aria-hidden="true" /><span>Resultados consistentes começam com uma conversa honesta sobre o próximo passo.</span></div>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <figure className="testimonial-card" key={testimonial.role} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
                  <div className="quote-mark">“</div>
                  <blockquote>{testimonial.quote}</blockquote>
                  <figcaption><span className="avatar-placeholder">{index === 0 ? "D" : index === 1 ? "C" : "H"}</span><span>{testimonial.role}</span></figcaption>
                </figure>
              ))}
            </div>
            <div className="impact-strip" data-reveal>
              <div><span>01</span><strong>conversa<br />estratégica</strong></div>
              <div><span>∞</span><strong>visão de<br />longo prazo</strong></div>
              <div><span>→</span><strong>ação com<br />direção</strong></div>
              <a href="https://www.youtube.com/results?search_query=Papo+de+Valor+Alexandre+Azeredo" target="_blank" rel="noreferrer" className="podcast-link"><Play size={16} fill="currentColor" aria-hidden="true" /> Ouvir o Papo de Valor <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </section>

        <section className="section about-section" id="sobre" aria-labelledby="about-title">
          <div className="container about-grid">
            <div className="about-visual" data-reveal>
              <div className="about-image-frame">
                <img src={profileSrc} alt="Alexandre Azeredo" loading="lazy" />
                <div className="about-image-overlay">AA <span>Mentoria & Advisory</span></div>
              </div>
              <div className="about-side-note"><Sparkles size={15} aria-hidden="true" /> Sem atalhos. Com direção.</div>
            </div>
            <div className="about-copy" data-reveal style={{ transitionDelay: "120ms" }}>
              <div className="eyebrow"><span className="eyebrow-line" /> Sobre Alexandre Azeredo</div>
              <h2 id="about-title">A experiência de quem já esteve <em>nos dois lados da mesa.</em></h2>
              <p>Com mais de [X] anos em liderança de TI, já estive nos dois lados da mesa: como executivo tomando decisões estratégicas e como mentor guiando a próxima geração de CIOs.</p>
              <p>Minha trajetória inclui formação executiva na Harvard Business School e NOVA FCT, além da criação do Podcast Papo de Valor, onde entrevisto líderes de TI sobre os desafios reais da área.</p>
              <p>Meu propósito é acelerar sua jornada até o C-Level, sem atalhos, mas com direção clara, estratégia e networking.</p>
              <div className="about-actions">
                <a className="button button-dark" href="https://www.linkedin.com/in/alexandreazeredo" target="_blank" rel="noreferrer">Ver LinkedIn <Linkedin size={17} /></a>
                <a className="button button-outline" href="https://www.youtube.com/results?search_query=Papo+de+Valor+Alexandre+Azeredo" target="_blank" rel="noreferrer">Ouvir Podcast <Play size={16} fill="currentColor" /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contato" aria-labelledby="contact-title">
          <div className="contact-glow" aria-hidden="true" />
          <div className="container contact-grid">
            <div className="contact-copy" data-reveal>
              <div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> O próximo movimento</div>
              <h2 id="contact-title">Pronto para o próximo nível da sua <em>carreira?</em></h2>
              <p>Em uma sessão estratégica gratuita de 30 minutos, avaliamos se faz sentido trabalharmos juntos.</p>
              <div className="contact-guarantee"><Check size={16} aria-hidden="true" /><span>Sem compromisso. Se não houver fit, te indico outros caminhos.</span></div>
            </div>
            <div className="form-card" data-reveal style={{ transitionDelay: "120ms" }}>
              {submitted ? (
                <div className="success-state" role="status">
                  <div className="success-icon"><Check size={27} /></div>
                  <p className="mini-label">Pedido recebido</p>
                  <h3>Vamos conversar sobre o seu próximo passo.</h3>
                  <p>Em até 48h entrarei em contato para encontrarmos o melhor horário.</p>
                  <button type="button" className="text-link dark-link" onClick={() => setSubmitted(false)}>Enviar outra solicitação <ArrowUpRight size={16} /></button>
                </div>
              ) : (
                <>
                  <div className="form-heading"><span>01</span><p>Conte um pouco sobre o seu momento</p></div>
                  {/* INTEGRAÇÃO CRM: substituir este formulário pelo form do HubSpot/Pipedrive */}
                  <form id="cta-form" onSubmit={handleSubmit} noValidate>
                    <label>Nome completo<input id="nome" name="nome" type="text" placeholder="Como posso te chamar?" autoComplete="name" required /></label>
                    <label>E-mail corporativo<input id="email" name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" required /></label>
                    <label>LinkedIn (URL)<input id="linkedin" name="linkedin" type="url" placeholder="linkedin.com/in/seu-nome" autoComplete="url" required /></label>
                    <label>Seu objetivo<select id="objetivo" name="objetivo" defaultValue="" required><option value="" disabled>Selecione uma opção</option><option value="c-level">Quero me tornar CIO/CTO</option><option value="advisory">Já sou CIO e quero advisory</option><option value="palestra">Quero contratar palestra/treinamento</option><option value="outro">Outro</option></select></label>
                    <button className="button button-gold form-submit" type="submit">Solicitar sessão estratégica gratuita <ArrowUpRight size={17} /></button>
                    <small>Ao enviar, você concorda em ser contatado sobre esta solicitação.</small>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <div className="faq-intro" data-reveal>
              <div className="eyebrow"><span className="eyebrow-line" /> Antes de começar</div>
              <h2 id="faq-title">Perguntas<br /><em>frequentes.</em></h2>
              <p>A clareza que você busca começa com as perguntas certas.</p>
            </div>
            <div className="faq-list" data-reveal style={{ transitionDelay: "120ms" }}>
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.question}>
                    <button type="button" className="faq-question" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)}>
                      <span><small>0{index + 1}</small>{item.question}</span><ChevronDown size={20} aria-hidden="true" />
                    </button>
                    <div className="faq-answer" aria-hidden={!isOpen}><p>{item.answer}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand"><a className="brand footer-logo" href="#top"><span className="brand-logo-wrap"><img src={logoSrc} alt="Logo Result" className="brand-logo" /></span><span className="brand-copy"><strong>Alexandre Azeredo</strong><span>Mentor Executivo · CIO Advisor</span></span></a><p>Estratégia que posiciona.<br />Liderança que transforma.</p><div className="social-links"><a href="https://www.linkedin.com/in/alexandreazeredo" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a><a href="https://www.instagram.com/alexandreazeredo" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a><a href="https://www.youtube.com/results?search_query=Papo+de+Valor+Alexandre+Azeredo" target="_blank" rel="noreferrer" aria-label="Podcast Papo de Valor"><Mic2 size={17} /></a></div></div>
          <div className="footer-column"><p className="footer-label">Explorar</p><a href="#sobre">Sobre Alexandre</a><a href="#atuacao">Atuação</a><a href="#resultados">Resultados</a><a href="#faq">Perguntas frequentes</a></div>
          <div className="footer-column"><p className="footer-label">Contato</p><a href="mailto:contato@alexandreazeredo.com.br"><Mail size={15} /> contato@alexandreazeredo.com.br</a><a href="https://www.linkedin.com/in/alexandreazeredo" target="_blank" rel="noreferrer"><Linkedin size={15} /> linkedin.com/in/alexandreazeredo</a></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Alexandre Azeredo. Todos os direitos reservados.</span><span><a href="#top">Política de Privacidade</a><i /> <a href="#top">Termos de Uso</a></span></div>
      </footer>
    </div>
  );
}
