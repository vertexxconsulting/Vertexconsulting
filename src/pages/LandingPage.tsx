import { useState, useEffect, useRef, type FormEvent } from 'react';
import { createContact } from '../services/contactService';
import './LandingPage.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
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
    if (!formRef.current) return;

    setFormStatus('sending');
    const fd = new FormData(formRef.current);

    try {
      await createContact({
        name: fd.get('name') as string,
        email: fd.get('email') as string,
        phone: fd.get('phone') as string,
        company: fd.get('company') as string,
        service: fd.get('service') as string,
        message: fd.get('message') as string,
      });
      setFormStatus('success');
      formRef.current.reset();
      setTimeout(() => setFormStatus('idle'), 6000);
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 6000);
    }
  };

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">
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
            <li><button onClick={() => scrollTo('contact')} className="nav__cta">Fale Conosco</button></li>
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
            <button onClick={() => scrollTo('contact')}>Fale Conosco</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="hero">
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
              <button className="btn btn--primary" onClick={() => scrollTo('contact')}>
                Solicitar Consultoria
              </button>
              <button className="btn btn--secondary" onClick={() => scrollTo('services')}>
                Nossos Serviços
              </button>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__logo-ring">
              <img src="/logo-hero.jpeg" alt="Vertex Consulting" />
            </div>
          </div>
        </div>
      </section>



      {/* Services */}
      <section id="services" className="section">
        <div className="section__inner">
          <div className="section__header anim">
            <span className="section__eyebrow">Nossos Serviços</span>
            <h2>Soluções completas para o seu crescimento</h2>
            <p className="section__sub">
              Oferecemos um ecossistema de serviços integrados para acelerar
              resultados e posicionar sua marca no mercado.
            </p>
          </div>
          <div className="services-grid">
            {[
              { title: 'Estratégia', desc: 'Planejamento estratégico sob medida para alavancar seus resultados e definir o caminho para o sucesso.' },
              { title: 'Marca', desc: 'Construção e fortalecimento de marca com identidade visual impactante e posicionamento assertivo.' },
              { title: 'Inteligência Artificial', desc: 'Implementação de soluções de IA para automatizar processos e gerar insights estratégicos.' },
              { title: 'Treinamentos', desc: 'Capacitação personalizada para equipes com foco em resultados práticos e mensuráveis.' },
              { title: 'Resultados', desc: 'Acompanhamento contínuo de métricas e KPIs para garantir o retorno sobre o investimento.' },
              { title: 'Presença Digital', desc: 'Desenvolvimento de sites, landing pages e estratégias digitais que convertem visitantes em clientes.' },
            ].map((s) => (
              <div key={s.title} className="service-card anim">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="section section--alt">
        <div className="section__inner about-grid">
          <div className="about-visual anim">
            <div className="about-img-wrap">
              <img src="/logo.jpeg" alt="Vertex Consulting" />
            </div>
            <div className="about-float">
              <div className="about-float__num">5+</div>
              <div className="about-float__label">Anos de Mercado</div>
            </div>
          </div>
          <div className="about-content anim">
            <span className="section__eyebrow">Sobre Nós</span>
            <h2>Consultoria que entrega resultados reais</h2>
            <p>
              A Vertex Consulting nasceu da paixão por transformar negócios
              através de estratégias inteligentes. Combinamos experiência prática
              com as tecnologias mais avançadas do mercado.
            </p>
            <p>
              Nosso diferencial está na abordagem personalizada: cada projeto
              é único e merece uma solução sob medida.
            </p>
            <ul className="about-features">
              <li><span className="check">✓</span> Metodologia comprovada com foco em resultados</li>
              <li><span className="check">✓</span> Equipe multidisciplinar e especializada</li>
              <li><span className="check">✓</span> Integração de IA em todos os processos</li>
              <li><span className="check">✓</span> Acompanhamento contínuo pós-projeto</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="section">
        <div className="section__inner">
          <div className="section__header anim">
            <span className="section__eyebrow">Nosso Processo</span>
            <h2>Como trabalhamos</h2>
            <p className="section__sub">
              Um processo estruturado e transparente para garantir os melhores
              resultados em cada etapa.
            </p>
          </div>
          <div className="process-steps">
            {[
              { n: '01', title: 'Diagnóstico', desc: 'Análise profunda do seu negócio, mercado e oportunidades de crescimento.' },
              { n: '02', title: 'Estratégia', desc: 'Definição de um plano de ação personalizado com metas claras e mensuráveis.' },
              { n: '03', title: 'Execução', desc: 'Implementação das soluções com agilidade e acompanhamento em tempo real.' },
              { n: '04', title: 'Resultados', desc: 'Mensuração de resultados e otimização contínua para maximizar o ROI.' },
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
      <section id="contact" className="section section--alt">
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
            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-detail__label">Localização</div>
                <div className="contact-detail__value">Telêmaco Borba, PR</div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail__label">Horário</div>
                <div className="contact-detail__value">Seg - Sex, 8h às 18h</div>
              </div>
            </div>
          </div>
          <div className="contact-form-wrap anim">
            <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input type="text" id="name" name="name" placeholder="Seu nome completo" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input type="email" id="email" name="email" placeholder="seu@email.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Telefone</label>
                  <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000" />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Empresa</label>
                  <input type="text" id="company" name="company" placeholder="Nome da empresa" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="service">Serviço de Interesse</label>
                <select id="service" name="service" required defaultValue="">
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
                <textarea id="message" name="message" placeholder="Conte-nos sobre seu projeto ou necessidade..." required />
              </div>
              {formStatus === 'success' && (
                <div className="form-msg form-msg--success">
                  Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}
              {formStatus === 'error' && (
                <div className="form-msg form-msg--error">
                  Erro ao enviar mensagem. Tente novamente.
                </div>
              )}
              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </section>

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
              <li><button onClick={() => scrollTo('contact')}>Contato</button></li>
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
