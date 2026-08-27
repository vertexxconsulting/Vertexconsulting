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

const logoDarkSrc = "/manus-storage/alexandre-logo-dark_7b12d2cf.jpeg";
const heroPhotoSrc = "/manus-storage/alexandre-hero_12802c54.jpeg";
const aboutPhotoSrc = "/manus-storage/alexandre-about_2a1a5b55.jpeg";
const authorityPhotoSrc = "/manus-storage/alexandre-authority_26bdd9f1.jpeg";
const whatsappNumber = "553186417690";

const navItems = [
  { label: "Mentoria", href: "#atuacao" },
  { label: "Para quem é", href: "#credenciais" },
  { label: "Alexandre", href: "#sobre" },
  { label: "Papo de Valor", href: "#resultados" },
  { label: "FAQ", href: "#faq" },
];

const credentials = [
  {
    icon: GraduationCap,
    eyebrow: "32+ anos",
    title: "Experiência profissional",
    text: "Mais de três décadas liderando projetos, equipes, operações e transformações tecnológicas no Brasil e no exterior.",
  },
  {
    icon: Network,
    eyebrow: "Experiência internacional",
    title: "Visão sem fronteiras",
    text: "Atuação em projetos e operações que conectam diferentes contextos, culturas e desafios de negócio.",
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: "Tecnologia + negócios",
    title: "A ponte que gera valor",
    text: "Experiência em Transformação Digital, Governança, ERP, PMO, Cloud, Dados e estratégia empresarial.",
  },
  {
    icon: Mic2,
    eyebrow: "Papo de Valor",
    title: "Conversas com quem decide",
    text: "Host de conversas com executivos, especialistas e empreendedores sobre tecnologia, carreira, inovação e negócios.",
  },
];

const services = [
  {
    number: "01",
    icon: Target,
    title: "Entenda onde você está",
    audience: "Um diagnóstico honesto do seu momento profissional, competências, desafios e objetivos.",
    bullets: [
      "Leitura do momento atual",
      "Clareza sobre lacunas e forças",
      "Objetivo executivo bem definido",
      "Prioridades para o próximo ciclo",
    ],
    format: "O ponto de partida para qualquer evolução consistente",
    action: "Quero entender meu momento",
  },
  {
    number: "02",
    icon: Building2,
    title: "Defina sua estratégia",
    audience: "Um direcionamento claro para reduzir a distância entre a posição atual e a posição desejada.",
    bullets: [
      "Visão de negócio aplicada à carreira",
      "Posicionamento e comunicação executiva",
      "Plano para desenvolver influência",
      "Decisões guiadas por intenção",
    ],
    format: "Estratégia para transformar experiência em posicionamento",
    action: "Quero definir minha estratégia",
  },
  {
    number: "03",
    icon: Presentation,
    title: "Prepare-se para o próximo nível",
    audience: "Competências, decisões e posicionamento para estar preparado quando a oportunidade surgir.",
    bullets: [
      "Liderança de pessoas e decisões",
      "Conexão entre tecnologia e resultado",
      "Maturidade para lidar com complexidade",
      "Preparação para Gerente, Head, CIO ou CTO",
    ],
    format: "Desenvolvimento contínuo para oportunidades maiores",
    action: "Quero acelerar minha carreira",
  },
];

const testimonials = [
  {
    quote: "De profissional técnico competente a líder capaz de conectar tecnologia, pessoas, estratégia e negócios.",
    role: "Antes → Depois · visão estratégica",
  },
  {
    quote: "De executar demandas a participar das decisões que definem o futuro do negócio.",
    role: "Antes → Depois · influência executiva",
  },
  {
    quote: "De esperar pela próxima oportunidade a preparar-se estrategicamente para ela.",
    role: "Antes → Depois · posicionamento",
  },
];

const faqItems = [
  {
    question: "Para quem é a mentoria?",
    answer: "Para profissionais e líderes de tecnologia que desejam acelerar seu desenvolvimento e preparar-se para posições de maior responsabilidade.",
  },
  {
    question: "Preciso já ocupar uma posição de liderança?",
    answer: "Não necessariamente. O mais importante é existir um objetivo concreto de crescimento e desenvolvimento profissional.",
  },
  {
    question: "A mentoria é individual ou em grupo?",
    answer: "O formato é definido a partir do seu momento, objetivo e aderência à proposta. A conversa inicial serve justamente para entender esse contexto.",
  },
  {
    question: "Como são realizados os encontros?",
    answer: "O primeiro passo é uma conversa para compreender seu momento profissional e verificar se existe aderência entre seus objetivos e a proposta da mentoria.",
  },
  {
    question: "Como sei se a mentoria é adequada para mim?",
    answer: "Se você percebe que a competência técnica já não é suficiente para o próximo nível, a conversa inicial ajuda a identificar os caminhos possíveis.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [metrics, setMetrics] = useState({ years: 0, linkedin: 0, connections: 0 });

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

    const metricTargets = { years: 32, linkedin: 8800, connections: 500 };
    const countStart = performance.now();
    const countDuration = 1250;
    let countFrame = 0;
    const animateMetrics = (now: number) => {
      const progress = Math.min((now - countStart) / countDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setMetrics({
        years: Math.floor(metricTargets.years * easedProgress),
        linkedin: Math.floor(metricTargets.linkedin * easedProgress),
        connections: Math.floor(metricTargets.connections * easedProgress),
      });
      if (progress < 1) countFrame = requestAnimationFrame(animateMetrics);
    };
    countFrame = requestAnimationFrame(animateMetrics);

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
      cancelAnimationFrame(countFrame);
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
    const moment = String(data.get("momento") || "").trim();
    const skill = String(data.get("habilidade") || "").trim();
    const objective = String(data.get("objetivo") || "").trim();
    const challenge = String(data.get("desafio") || "").trim();

    if (name.length < 3) {
      toast.error("Insira seu nome completo para continuar.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Insira um e-mail válido.");
      return;
    }
    if (linkedin && !linkedin.includes("linkedin.com")) {
      toast.error("Insira uma URL válida do LinkedIn ou deixe o campo em branco.");
      return;
    }
    if (!moment || !skill || !objective) {
      toast.error("Preencha seu momento, a habilidade e o objetivo principal.");
      return;
    }

    const whatsappMessage = [
      "Olá, Alexandre! Vim pelo site e quero conversar sobre meu próximo nível profissional.",
      "",
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `LinkedIn: ${linkedin || "Não informado"}`,
      `Momento profissional: ${moment}`,
      `Habilidade que quero desenvolver: ${skill}`,
      `Objetivo: ${objective}`,
      `Desafio atual: ${challenge || "Não informado"}`,
    ].join("\n");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!whatsappWindow) window.location.assign(whatsappUrl);
    setSubmitted(true);
    form.reset();
    toast.success("Mensagem preparada no WhatsApp.");
  };

  return (
    <div className="site-shell">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Alexandre Azeredo — início">
            <span className="brand-logo-wrap">
              <img src={logoDarkSrc} alt="Logo Alexandre Azeredo" className="brand-logo" />
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
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy" data-reveal>
              <div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> Tecnologia · Estratégia · Negócios</div>
              <h1 id="hero-title">
                Sua experiência em tecnologia.<br /><em>Estratégia para o próximo nível.</em>
              </h1>
              <p className="hero-subtitle">
                Mentoria executiva para líderes de tecnologia que querem avançar para Gerente, Head, CIO ou CTO.
              </p>
              <div className="hero-actions">
                {/* INTEGRAÇÃO CALENDLY: substituir este CTA pelo widget do Calendly */}
                <a className="button button-gold" href="#contato">
                  Agendar uma conversa <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <a className="text-link light-link" href="#atuacao">
                  Conhecer a mentoria <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="hero-proof" aria-label="Credenciais principais">
                <span><Check size={15} aria-hidden="true" /> 32+ anos de experiência</span>
                <span><Check size={15} aria-hidden="true" /> Brasil e exterior</span>
                <span><Check size={15} aria-hidden="true" /> Host do Papo de Valor</span>
              </div>
            </div>

            <div className="hero-visual" data-reveal style={{ transitionDelay: "120ms" }}>
              <div className="hero-image-frame">
                <img src={heroPhotoSrc} alt="Alexandre Azeredo em ambiente corporativo" className="hero-photo" />
                <div className="hero-photo-shade" aria-hidden="true" />
                <div className="visual-kicker">ALEXANDRE AZEREDO / 32+ ANOS</div>
                <div className="visual-caption">
                  <span className="caption-dot" />
                  <span>Experiência para preparar o próximo movimento.</span>
                </div>
              </div>
              <div className="hero-brand-chip">
                <img src={logoDarkSrc} alt="Logo Alexandre Azeredo" />
                <span>Mentor Executivo<br />CIO Advisor</span>
              </div>
              <div className="visual-index">AA <span>26</span></div>
            </div>
          </div>
          <div className="hero-bottom-line" aria-hidden="true"><span>scroll para explorar</span><span className="line" /></div>
        </section>

        <section className="trust-bar" aria-label="Resumo de autoridade">
          <div className="container trust-grid">
            <div className="trust-item"><span className="trust-number"><strong>{metrics.years}+</strong></span><span>anos de<br />experiência</span></div>
            <div className="trust-divider" />
            <div className="trust-item"><span className="trust-number"><strong>{new Intl.NumberFormat("pt-BR").format(metrics.linkedin)}+</strong></span><span>profissionais<br />no LinkedIn</span></div>
            <div className="trust-divider" />
            <div className="trust-item"><span className="trust-number"><strong>{new Intl.NumberFormat("pt-BR").format(metrics.connections)}+</strong></span><span>conexões<br />profissionais</span></div>
            <div className="trust-divider" />
            <div className="trust-quote">“Experiência técnica é a base.<br /><strong>Estratégia é o próximo nível.</strong>”</div>
          </div>
        </section>

        <section className="section credentials-section" id="credenciais" aria-labelledby="credentials-title">
          <div className="container">
            <div className="section-heading split-heading" data-reveal>
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> O que sustenta o trabalho</div>
                <h2 id="credentials-title">32+ anos transformando<br /><em>tecnologia em estratégia.</em></h2>
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
                <h2 id="services-title">Seu próximo nível<br /><em>começa com clareza.</em></h2>
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
                <h2 id="results-title">De especialista em tecnologia<br /><em>a líder estratégico.</em></h2>
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
                <img src={aboutPhotoSrc} alt="Alexandre Azeredo trabalhando em ambiente executivo" loading="lazy" />
                <div className="about-image-overlay">AA <span>Mentoria & Advisory</span></div>
              </div>
              <div className="about-secondary-photo"><img src={authorityPhotoSrc} alt="Alexandre Azeredo em ambiente corporativo" loading="lazy" /></div>
              <div className="about-side-note"><Sparkles size={15} aria-hidden="true" /> Sem atalhos. Com direção.</div>
            </div>
            <div className="about-copy" data-reveal style={{ transitionDelay: "120ms" }}>
              <div className="eyebrow"><span className="eyebrow-line" /> Sobre Alexandre Azeredo</div>
              <h2 id="about-title">Aprenda com quem já percorreu <em>esse caminho.</em></h2>
              <p>Sou Alexandre Azeredo. Há mais de 32 anos construo minha carreira na interseção entre Tecnologia, Estratégia e Negócios.</p>
              <p>Ao longo dessa trajetória, liderei projetos, operações e transformações no Brasil e no exterior, passando por Transformação Digital, Governança de TI, ERP, PMO, Cloud, Dados e estruturação de operações.</p>
              <p>Hoje, utilizo esse repertório para ajudar profissionais de tecnologia a acelerarem suas carreiras e se prepararem para posições de maior responsabilidade. Tecnologia só se torna estratégica quando consegue gerar valor para o negócio.</p>
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
              <h2 id="contact-title">A posição que você deseja ocupar amanhã exige <em>preparação hoje.</em></h2>
              <p>Se você construiu uma carreira sólida em tecnologia, mas percebe que precisa desenvolver visão estratégica, liderança e posicionamento para chegar ao próximo nível, vamos conversar.</p>
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
                  <div className="form-heading"><span>01</span><p>Vamos mapear seu próximo passo</p></div>
                  {/* PROSPECÇÃO WHATSAPP: os dados abaixo são organizados e enviados para o número comercial do Alexandre. */}
                  <form id="cta-form" onSubmit={handleSubmit} noValidate>
                    <label>Nome completo<input id="nome" name="nome" type="text" placeholder="Como posso te chamar?" autoComplete="name" required /></label>
                    <label>E-mail corporativo<input id="email" name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" required /></label>
                    <label>LinkedIn (opcional)<input id="linkedin" name="linkedin" type="url" placeholder="linkedin.com/in/seu-nome" autoComplete="url" /></label>
                    <label>Seu momento<select id="momento" name="momento" defaultValue="" required><option value="" disabled>Selecione uma opção</option><option value="lider-tecnico">Líder técnico ou coordenador</option><option value="gerente-head">Gerente ou Head</option><option value="cio-cto">CIO ou CTO</option><option value="transicao">Em transição para uma nova posição</option></select></label>
                    <label>Habilidade a desenvolver<select id="habilidade" name="habilidade" defaultValue="" required><option value="" disabled>O que você quer fortalecer?</option><option value="visao-negocios">Visão estratégica e negócios</option><option value="lideranca">Liderança e gestão de pessoas</option><option value="posicionamento">Posicionamento executivo e influência</option><option value="governanca">Governança de TI e operações</option><option value="transformacao">Transformação digital</option><option value="cloud-dados">Cloud, dados e IA aplicada</option></select></label>
                    <label>Objetivo principal<select id="objetivo" name="objetivo" defaultValue="" required><option value="" disabled>Selecione uma opção</option><option value="promocao">Ser promovido a Gerente ou Head</option><option value="c-level">Preparar-me para CIO/CTO</option><option value="executivo">Fortalecer minha atuação executiva</option><option value="negocio">Conectar melhor tecnologia e negócio</option></select></label>
                    <label className="form-field-wide">Desafio atual (opcional)<textarea id="desafio" name="desafio" rows={2} placeholder="Em uma frase, o que está travando seu próximo passo?" /></label>
                    <button className="button button-gold form-submit" type="submit">Agendar uma conversa <ArrowUpRight size={17} /></button>
                    <small>Ao clicar, o WhatsApp abrirá com suas informações organizadas para o Alexandre.</small>
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
          <div className="footer-brand"><a className="brand footer-logo" href="#top"><span className="brand-logo-wrap"><img src={logoDarkSrc} alt="Logo Alexandre Azeredo" className="brand-logo" /></span><span className="brand-copy"><strong>Alexandre Azeredo</strong><span>Mentor Executivo · CIO Advisor</span></span></a><p>Estratégia que posiciona.<br />Liderança que transforma.</p><div className="social-links"><a href="https://www.linkedin.com/in/alexandreazeredo" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a><a href="https://www.instagram.com/alexandreazeredo" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a><a href="https://www.youtube.com/results?search_query=Papo+de+Valor+Alexandre+Azeredo" target="_blank" rel="noreferrer" aria-label="Podcast Papo de Valor"><Mic2 size={17} /></a></div></div>
          <div className="footer-column"><p className="footer-label">Explorar</p><a href="#sobre">Sobre Alexandre</a><a href="#atuacao">Atuação</a><a href="#resultados">Resultados</a><a href="#faq">Perguntas frequentes</a></div>
          <div className="footer-column"><p className="footer-label">Contato</p><a href="mailto:contato@alexandreazeredo.com.br"><Mail size={15} /> contato@alexandreazeredo.com.br</a><a href="https://www.linkedin.com/in/alexandreazeredo" target="_blank" rel="noreferrer"><Linkedin size={15} /> linkedin.com/in/alexandreazeredo</a></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Alexandre Azeredo. Todos os direitos reservados.</span><span><a href="#top">Política de Privacidade</a><i /> <a href="#top">Termos de Uso</a></span></div>
      </footer>
    </div>
  );
}
