import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Target, Diamond, Brain, GraduationCap, BarChart3, Globe,
} from 'lucide-react';
import { createContact } from '../services/contactService';
import './LandingPage.css';

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', service: '',
    has_site: '', instagram: '', message: '',
  });

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      // Parallax: desloca os backgrounds com velocidade menor que o scroll
      document.querySelectorAll<HTMLElement>('.parallax-bg').forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * 0.25}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    document.querySelectorAll('.anim').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    try {
      await createContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        service: formData.service,
        has_site: formData.has_site,
        instagram: formData.instagram,
        message: formData.message,
      });
      setFormStatus('success');
      setFormData({
        name: '', email: '', phone: '', company: '', service: '',
        has_site: '', instagram: '', message: '',
      });
    } catch {
      setFormStatus('error');
    }
  };

  const formatPhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const setField = (key: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const value = key === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formStatus !== 'idle') setFormStatus('idle');
  };

  const isFormComplete = () => {
    const required: (keyof typeof formData)[] = [
      'name', 'email', 'phone', 'company', 'service', 'has_site', 'instagram', 'message',
    ];
    return required.every((k) => formData[k].trim() !== '');
  };

  const canSubmit = isFormComplete() && formStatus !== 'sending';

  const openForm = () => {
    setMobileMenu(false);
    setFormOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeForm = () => {
    setFormOpen(false);
    document.body.style.overflow = '';
  };

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      <div 
        className="mouse-orb" 
        style={{ 
          left: mousePos.x, 
          top: mousePos.y 
        }} 
      />
      
      {/* Navbar */}
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <a href="#" className="nav__brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.jpeg" alt="Vertex Consulting" className="nav__logo" />
            <span className="nav__wordmark">VERTEX</span>
          </a>
          <ul className="nav__links">
            <li><button onClick={() => scrollTo('services')}>Serviços</button></li>
            <li><button onClick={() => scrollTo('about')}>Sobre</button></li>
            <li><button onClick={() => scrollTo('process')}>Processo</button></li>
            <li><button onClick={() => scrollTo('projetos')}>Projetos</button></li>
            <li><button onClick={openForm} className="nav__cta">Fale Conosco</button></li>
          </ul>
          <button
            className="nav__mobile-btn"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileMenu && (
        <div className="mobile-overlay" onClick={() => setMobileMenu(false)}>
          <div className="mobile-overlay__content" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-overlay__close" onClick={() => setMobileMenu(false)}>
              ✕
            </button>
            <button onClick={() => scrollTo('services')}>Serviços</button>
            <button onClick={() => scrollTo('about')}>Sobre</button>
            <button onClick={() => scrollTo('process')}>Processo</button>
            <button onClick={() => scrollTo('projetos')}>Projetos</button>
            <button onClick={openForm}>Fale Conosco</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="hero hero--photo">
        <div className="parallax-bg" style={{ backgroundImage: "url('/bg-hero.jpg')" }} />
        <div className="hero__grid" />
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__badge">Consultoria Estratégica</div>
            <h1 className="hero__title">
              Transforme seu negócio com <span className="gold-text">estratégia e inteligência</span>
            </h1>
            <p className="hero__desc">
              Na Vertex Consulting, unimos estratégia, marca, inteligência artificial
              e treinamentos para levar seu negócio ao próximo nível.
            </p>
            <div className="hero__actions">
              <button className="btn btn--primary" onClick={openForm}>
                Solicitar Consultoria
              </button>
              <button className="btn btn--secondary" onClick={() => scrollTo('services')}>
                Nossos Serviços
              </button>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__logo-float">
              <div className="hero__logo-ring">
                <img src="/logo-hero.png" alt="Vertex Consulting" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section section--photo">
        <div className="parallax-bg" style={{ backgroundImage: "url('/bg-services.jpg')" }} />
        <div className="section__inner">
          <div className="section__header anim">
            <h2>Soluções completas para o seu crescimento</h2>
          </div>
          <div className="services-grid">
            {[
              { title: 'Estratégia', desc: 'Diagnóstico de maturidade digital, plano de ação com metas claras e roadmap de tecnologia para o seu negócio.', icon: Target },
              { title: 'Marca', desc: 'Identidade visual, posicionamento e presença digital alinhados ao que sua empresa realmente vende.', icon: Diamond },
              { title: 'Inteligência Artificial', desc: 'Automação de atendimento, CRM com IA e sistemas que aprendem com seus clientes.', icon: Brain },
              { title: 'Treinamentos', desc: 'Capacitação da sua equipe para operar as ferramentas digitais do dia a dia sem dependência técnica.', icon: GraduationCap },
              { title: 'Resultados', desc: 'Acompanhamento de métricas reais: leads gerados, taxas de conversão e retorno sobre cada investimento.', icon: BarChart3 },
              { title: 'Presença Digital', desc: 'Sites, landing pages e sistemas web que convertem visitantes em clientes — não só páginas bonitas.', icon: Globe },
            ].map((s) => (
              <div key={s.title} className="service-card anim">
                <div className="service-card__icon"><s.icon size={28} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="service-card__cta">Saiba mais →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projetos Section */}
      <section id="projetos" className="section section--projects">
        <div className="container">
          <div className="section-header anim fade-up">
            <h2 className="section__title">Nossos Projetos</h2>
            <p className="section__subtitle">Alguns dos sites e soluções que desenvolvemos com alta performance e design exclusivo.</p>
          </div>

          <div className="projects-grid">
            <div className="project-card anim fade-up" style={{ animationDelay: '0.1s' }}>
              <img src="/usebasemidia.webp" alt="Projeto Base Midia" loading="lazy" />
              <div className="project-card__info">
                <h3>Base Mídia</h3>
                <p>Plataforma de presença digital</p>
              </div>
            </div>
            
            <div className="project-card anim fade-up" style={{ animationDelay: '0.2s' }}>
              <img src="/resultgestaopro.webp" alt="Projeto Result Gestão Pro" loading="lazy" />
              <div className="project-card__info">
                <h3>Result Gestão Pro</h3>
                <p>Sistema de gestão focado em resultados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="section section--photo">
        <div className="parallax-bg" style={{ backgroundImage: "url('/bg-about.jpg')" }} />
        <div className="section__inner about-grid">
          <div className="about-visual anim">
            <div className="about-img-wrap">
              <img src="/logo-about.jpeg" alt="Vertex Consulting" />
            </div>
          </div>
          <div className="about-content anim">
            <h2>Consultoria que entrega resultados reais</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: 24 }}>
              A Vertex nasceu em Telêmaco Borba com um objetivo direto: transformar pequenos negócios locais
              através de tecnologia que realmente funciona — sem promessa vazia, sem template genérico.
            </p>
            <div className="about-mini-cards">
              <div className="about-mini-card">
                <span className="about-mini-card__icon">✓</span>
                <span>Metodologia comprovada</span>
              </div>
              <div className="about-mini-card">
                <span className="about-mini-card__icon">✓</span>
                <span>Equipe multidisciplinar</span>
              </div>
              <div className="about-mini-card">
                <span className="about-mini-card__icon">✓</span>
                <span>IA integrada aos processos</span>
              </div>
              <div className="about-mini-card">
                <span className="about-mini-card__icon">✓</span>
                <span>Suporte contínuo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="section section--photo">
        <div className="parallax-bg" style={{ backgroundImage: "url('/bg-process.jpg')" }} />
        <div className="section__inner">
          <div className="section__header anim">
            <h2>Como trabalhamos</h2>
          </div>
          <div className="process-steps">
            {[
              { n: '01', title: 'Diagnóstico', desc: 'Entrevista com você, análise da concorrência local e entendimento de como seu cliente te encontra hoje.' },
              { n: '02', title: 'Estratégia', desc: 'Definição do que será construído: site, sistema, CRM ou integração. Tudo documentado antes de escrever código.' },
              { n: '03', title: 'Execução', desc: 'Desenvolvimento com tecnologia moderna (Next.js + Supabase) e entregas parciais pra você ver o resultado no meio do caminho.' },
              { n: '04', title: 'Resultados', desc: 'Site no ar, métricas sendo coletadas e ajustes finos baseados em dados reais — não em suposição.' },
            ].map((s) => (
              <div key={s.n} className="step anim">
                <div className="step__num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section section--photo">
        <div className="parallax-bg" style={{ backgroundImage: "url('/bg-contact.jpg')" }} />
        <div className="section__inner contact-grid">
          <div className="contact-info anim">
            <span className="section__eyebrow">Contato</span>
            <h2>
              Vamos conversar sobre o{' '}
              <span className="gold-text">futuro do seu negócio?</span>
            </h2>
            <p>
              Preencha o formulário e nossa equipe entrará em contato em até
              24 horas para agendar uma reunião estratégica.
            </p>
            <div className="contact-cta-row">
              <button className="btn btn--primary" onClick={openForm}>
                Abrir Formulário
              </button>
            </div>
            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-detail__label">Localização</div>
                <div className="contact-detail__value">Telêmaco Borba, PR</div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail__label">Horário</div>
                <div className="contact-detail__value">Seg - Sex, 8h às 18h</div>
              </div>
              <a
                href="https://www.instagram.com/vertexxconsulting"
                target="_blank"
                rel="noreferrer"
                className="contact-detail contact-detail--link"
              >
                <div className="contact-detail__label">Instagram</div>
                <div className="contact-detail__value contact-detail__value--social">
                  <InstagramIcon />
                  @vertexxconsulting
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Form Modal */}
      {formOpen && (
        <div className="form-modal-backdrop" onClick={closeForm}>
          <div
            className="form-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Formulário de contato"
          >
            <button className="form-modal__close" onClick={closeForm} aria-label="Fechar">
              ✕
            </button>

            {formStatus === 'success' ? (
              <div className="form-modal__success">
                <div className="form-modal__success-icon">✓</div>
                <h3>Mensagem enviada!</h3>
                <p>
                  Nossa equipe entrará em contato o mais breve possível.
                </p>
                <button className="btn btn--primary" onClick={closeForm}>
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="form-modal__header">
                  <span className="section__eyebrow">Contato</span>
                  <h3>Fale com a Vertex Consulting</h3>
                  <p>
                    Preencha seus dados e nossa equipe entrará em contato
                    em até 24 horas.
                  </p>
                </div>
                <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Nome</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={setField('name')}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">E-mail</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={setField('email')}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">WhatsApp</label>
                      <div className="form-input-icon">
                        <WhatsAppIcon />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="(00) 00000-0000"
                          value={formData.phone}
                          onChange={setField('phone')}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="company">Empresa</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        placeholder="Nome da empresa"
                        value={formData.company}
                        onChange={setField('company')}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="has_site">Já possui site?</label>
                      <select
                        id="has_site"
                        name="has_site"
                        value={formData.has_site}
                        onChange={setField('has_site')}
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="instagram">@ do Instagram</label>
                      <div className="form-input-icon">
                        <InstagramIcon />
                        <input
                          type="text"
                          id="instagram"
                          name="instagram"
                          placeholder="@seuperfil"
                          value={formData.instagram}
                          onChange={setField('instagram')}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="service">Serviço de Interesse</label>
                    <select
                      id="service"
                      name="service"
                      required
                      value={formData.service}
                      onChange={setField('service')}
                    >
                      <option value="" disabled>Selecione um serviço</option>
                      <option value="estrategia">Estratégia</option>
                      <option value="marca">Marca</option>
                      <option value="ia">Inteligência Artificial</option>
                      <option value="treinamentos">Treinamentos</option>
                      <option value="presenca-digital">Presença Digital</option>
                      <option value="consultoria-completa">Consultoria Completa</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Mensagem</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Conte-nos sobre seu projeto ou necessidade..."
                      value={formData.message}
                      onChange={setField('message')}
                      required
                    />
                  </div>
                  {formStatus === 'error' && (
                    <div className="form-msg form-msg--error">
                      Erro ao enviar mensagem. Tente novamente.
                    </div>
                  )}
                  {!isFormComplete() && (
                    <div className="form-msg form-msg--hint">
                      Preencha todos os campos para enviar.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn btn--primary btn--full"
                    disabled={!canSubmit}
                  >
                    {formStatus === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <a href="#" className="nav__brand">
              <img src="/logo.jpeg" alt="Vertex Consulting" className="nav__logo" />
              <span className="nav__wordmark">VERTEX</span>
            </a>
            <p>
              Transformando negócios com estratégia, marca, inteligência
              artificial e resultados mensuráveis.
            </p>
          </div>
          <div className="footer__col">
            <h4>Serviços</h4>
            <ul>
              <li><button onClick={() => scrollTo('services')}>Estratégia</button></li>
              <li><button onClick={() => scrollTo('services')}>Marca</button></li>
              <li><button onClick={() => scrollTo('services')}>IA</button></li>
              <li><button onClick={() => scrollTo('services')}>Treinamentos</button></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Empresa</h4>
             <ul>
              <li><button onClick={() => scrollTo('about')}>Sobre Nós</button></li>
              <li><button onClick={() => scrollTo('process')}>Processo</button></li>
              <li><button onClick={openForm}>Contato</button></li>
              <li><a href="/crm">CRM</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Contato</h4>
            <ul>
              <li><a href="https://www.instagram.com/vertexxconsulting" target="_blank" rel="noreferrer">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 Vertex Consulting. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
