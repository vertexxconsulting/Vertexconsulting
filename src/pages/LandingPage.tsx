import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Gauge,
  Layers3,
  Menu,
  Network,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { createContact } from '../services/contactService';
import { getBoltenWhatsAppLink } from '../services/boltenService';
import './LandingPage.css';

const navItems = [
  { id: 'dor', label: 'O gargalo' },
  { id: 'solucao', label: 'Como resolvemos' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'processo', label: 'Processo' },
];

const painPoints = [
  { icon: Target, title: 'Você é a operação inteira', text: 'Toda decisão volta para você. O negócio cresce, mas a sua agenda encolhe.' },
  { icon: Clock3, title: 'Tempo perdido no improviso', text: 'Tarefas repetidas, informações espalhadas e pessoas executando sem contexto.' },
  { icon: Network, title: 'Sua marca fala várias línguas', text: 'O cliente não entende por que escolher você — e a conversa sempre termina em preço.' },
];

const solutions = [
  { number: '01', icon: Target, title: 'Posicionamento que orienta', text: 'Clareza sobre quem você atende, o que resolve e como ser lembrado antes da comparação.' },
  { number: '02', icon: Layers3, title: 'Processos que tiram peso', text: 'Fluxos documentados e responsabilidades visíveis para o negócio não depender de uma pessoa só.' },
  { number: '03', icon: Zap, title: 'Automação com critério', text: 'Ferramentas e IA aplicadas ao que é repetitivo — sem robotizar a relação com o cliente.' },
  { number: '04', icon: Gauge, title: 'Gestão para decidir', text: 'Um sistema simples de acompanhamento para saber o que está parado, o que avança e por quê.' },
];

const projects = [
  { kind: 'Site institucional', title: 'Vertex Consulting', text: 'A própria casa da Vertex: estratégia, presença digital e conversão em uma experiência premium.', image: '/bg-hero.jpg', tag: 'Em operação', action: 'form', buttonText: 'Conhecer o processo' },
  { kind: 'Sistema interno', title: 'Vertex CRM', text: 'Pipeline de leads, tarefas, notas e histórico para transformar atendimento em processo.', image: '/bg-services.jpg', tag: 'Produto Vertex', action: 'form', buttonText: 'Conhecer o processo' },
  { kind: 'Ferramenta estratégica', title: 'Diagnóstico de maturidade', text: 'Uma jornada interativa para revelar gargalos em posicionamento, marketing, IA, gestão e vendas.', image: '/bg-process.jpg', tag: 'Experiência digital', action: 'form', buttonText: 'Conhecer o processo' },
  { kind: 'Site Institucional', title: 'Alexandre Azeredo', text: 'Desenvolvimento de posicionamento e site completo com domínio próprio, refletindo a essência da marca.', image: '/bg-hero.jpg', tag: 'Cliente', action: 'link', link: 'https://resultgestaopro.com.br', buttonText: 'Acessar site' },
  { kind: 'Site Institucional', title: 'Base Midia', text: 'Design focado em conversão e usabilidade, construído para escalar a aquisição de clientes.', image: '/bg-services.jpg', tag: 'Cliente', action: 'link', link: 'https://usebasemidia.com.br', buttonText: 'Acessar site' },
];

const processSteps = [
  { number: '01', title: 'Raio-x', text: 'Entendemos o negócio, a rotina e o que hoje trava o crescimento.' },
  { number: '02', title: 'Direção', text: 'Escolhemos uma prioridade e desenhamos a mensagem, o fluxo e as ferramentas.' },
  { number: '03', title: 'Construção', text: 'Colocamos site, CRM, automações e treinamentos para funcionar em conjunto.' },
  { number: '04', title: 'Evolução', text: 'Acompanhamos os sinais do negócio e ajustamos o sistema com dados reais.' },
];

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

type FormData = {
  name: string; email: string; phone: string; company: string; service: string;
  has_site: string; instagram: string; message: string;
};

const initialForm: FormData = { name: '', email: '', phone: '', company: '', service: '', has_site: '', instagram: '', message: '' };

function InstagramIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
}

function MetricCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setCount(value); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 800, 1);
        setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState<FormData>(initialForm);
  const formRef = useRef<HTMLFormElement>(null);
  const boltenLink = getBoltenWhatsAppLink();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems.map((item) => document.getElementById(item.id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) setActive(visible.target.id);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0.1, 0.35, 0.7] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px' });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = formOpen ? 'hidden' : '';
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setFormOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKeyDown); };
  }, [formOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openForm = () => { setMenuOpen(false); setFormStatus('idle'); setFormOpen(true); };
  const setField = (key: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const raw = event.target.value;
    const value = key === 'phone' ? raw.replace(/\D/g, '').slice(0, 11) : raw;
    setFormData((current) => ({ ...current, [key]: value }));
    if (formStatus !== 'idle') setFormStatus('idle');
  };
  const canSubmit = Object.values(formData).every((value) => value.trim()) && formData.phone.replace(/\D/g, '').length >= 10;

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!formRef.current?.reportValidity() || !canSubmit) return;
    setFormStatus('sending');
    try {
      await createContact(formData);
      setFormStatus('success');
      setFormData(initialForm);
    } catch { setFormStatus('error'); }
  };

  return (
    <div className="landing">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`} aria-label="Navegação principal">
        <div className="nav__inner">
          <button className="nav__brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao início">
            <img src="/logo.jpeg" alt="Vertex Consulting" className="nav__logo" />
            <span className="nav__wordmark">VERTEX<span>.</span></span>
          </button>
          <div className="nav__links">
            {navItems.map((item) => <button key={item.id} className={active === item.id ? 'nav__link nav__link--active' : 'nav__link'} onClick={() => scrollTo(item.id)}>{item.label}</button>)}
            <button className="nav__cta" onClick={openForm}>Abrir conversa <ArrowUpRight size={16} /></button>
          </div>
          <button className="nav__mobile-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={24} /></button>
        </div>
      </nav>

      {menuOpen && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu"><button className="mobile-menu__close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X /></button><div className="mobile-menu__links">{navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}<ArrowUpRight size={18} /></button>)}<button className="btn btn--primary" onClick={openForm}>Abrir conversa <ArrowUpRight size={18} /></button></div></div>}

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__image" aria-hidden="true" />
          <div className="hero__texture" aria-hidden="true" />
          <div className="hero__inner">
            <div className="hero__content reveal">
              <p className="eyebrow"><span /> Consultoria para negócios em movimento</p>
              <h1 id="hero-title">Seu negócio não precisa de mais esforço. <em>Precisa de direção.</em></h1>
              <p className="hero__lead">Quando o posicionamento é confuso e tudo depende de você, até uma boa empresa parece pequena. A Vertex organiza a estratégia, o tempo e as ferramentas para o negócio voltar a avançar.</p>
              <div className="hero__actions"><button className="btn btn--primary" onClick={openForm}>Encontrar meu gargalo <ArrowUpRight size={18} /></button><button className="text-link" onClick={() => scrollTo('dor')}>Entender a abordagem <ArrowDownRight size={17} /></button></div>
              <div className="hero__proof"><span>Feito para quem já cansou de improvisar</span><span className="hero__proof-line" /><span>Estratégia · sistemas · automação</span></div>
            </div>
            <div className="hero__visual reveal reveal--delay">
              <div className="hero__halo" aria-hidden="true" /><div className="hero__visual-card"><img src="/logo-hero.png" alt="Marca Vertex Consulting" /><div className="hero__visual-caption"><span>vertex consulting</span><strong>clareza para crescer</strong></div></div>
              <div className="hero__stamp">ESTRATÉGIA<br /><span>+ EXECUÇÃO</span></div>
            </div>
          </div>
          <div className="hero__scroll-hint"><span>Role para descobrir</span><ArrowDownRight size={17} /></div>
        </section>

        <section className="metrics" aria-label="Números da Vertex">
          <div className="metrics__inner">{[{ value: 30, prefix: '+', label: 'projetos entregues' }, { value: 15, prefix: '+', label: 'empresas atendidas' }, { value: 98, suffix: '%', label: 'de satisfação' }, { value: 5, prefix: '+', label: 'anos de experiência' }].map((metric) => <div className="metric" key={metric.label}><strong><MetricCounter {...metric} /></strong><span>{metric.label}</span></div>)}</div>
        </section>

        <section id="dor" className="section section--pain"><div className="section__inner"><div className="section__intro reveal"><p className="eyebrow"><span /> O problema não é falta de vontade</p><h2>É difícil crescer quando <em>tudo passa por você.</em></h2><p>Você não precisa de mais uma ferramenta solta ou de alguém executando tarefas sem entender o contexto. Precisa de uma estrutura que conecte posicionamento, operação e gestão.</p></div><div className="pain-grid">{painPoints.map(({ icon: Icon, title, text }, index) => <article className="pain-card reveal" key={title}><span className="pain-card__index">0{index + 1}</span><Icon size={22} /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

        <section id="solucao" className="section section--solution"><div className="section__inner"><div className="section__intro section__intro--split reveal"><div><p className="eyebrow"><span /> O que muda na prática</p><h2>Um sistema para o negócio funcionar <em>sem pedir licença à sua agenda.</em></h2></div><p>Não entregamos uma coleção de peças. Construímos uma lógica: a mensagem atrai, o processo organiza e a automação devolve tempo.</p></div><div className="solution-grid">{solutions.map(({ number, icon: Icon, title, text }) => <article className="solution-card reveal" key={number}><div className="solution-card__top"><span>{number}</span><Icon size={21} /></div><h3>{title}</h3><p>{text}</p><ArrowUpRight className="solution-card__arrow" size={18} /></article>)}</div></div></section>

        <section id="projetos" className="section section--projects"><div className="section__inner"><div className="section__intro section__intro--projects reveal"><div><p className="eyebrow"><span /> O que já colocamos de pé</p><h2>Projetos que viraram <em>estrutura.</em></h2></div><p>Uma amostra dos ecossistemas digitais construídos pela Vertex — da presença que posiciona ao sistema que mantém o ritmo.</p></div><div className="projects-grid">{projects.map((project, index) => <article className={`project-card project-card--${index + 1} reveal`} key={project.title}><div className="project-card__image" style={{ backgroundImage: `linear-gradient(180deg, transparent 20%, rgba(7,7,7,.92) 100%), url(${project.image})` }}><span>{project.tag}</span></div><div className="project-card__body"><p>{project.kind}</p><h3>{project.title}</h3><span>{project.text}</span>{project.action === 'link' ? <a href={project.link} target="_blank" rel="noreferrer" className="btn-project-link">{project.buttonText} <ArrowUpRight size={15} /></a> : <button onClick={openForm}>{project.buttonText} <ChevronRight size={15} /></button>}</div></article>)}</div></div></section>

        <section id="processo" className="section section--process"><div className="section__inner process-layout"><div className="section__intro reveal"><p className="eyebrow"><span /> Sem fórmula pronta</p><h2>Primeiro entendemos. <em>Depois construímos.</em></h2><p>O processo começa no seu contexto. Por isso, a solução é mais simples de operar e mais difícil de copiar.</p><button className="btn btn--outline" onClick={openForm}>Conversar sobre meu cenário <ArrowUpRight size={17} /></button></div><div className="process-list">{processSteps.map((step) => <article className="process-step reveal" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowUpRight size={17} /></article>)}</div></div></section>

        <section id="contact" className="closing"><div className="closing__texture" aria-hidden="true" /><div className="closing__inner reveal"><p className="eyebrow"><span /> Próximo passo</p><h2>Se você sente que o negócio poderia render mais, <em>vamos localizar o vazamento.</em></h2><p>Uma conversa objetiva para entender onde sua empresa perde clareza, tempo ou oportunidade — e qual é a primeira alavanca a mexer.</p><button className="btn btn--primary" onClick={openForm}>Abrir conversa com a Vertex <ArrowUpRight size={18} /></button></div></section>
      </main>

      <footer className="footer"><div className="footer__inner"><div><img src="/logo.jpeg" alt="Vertex Consulting" /><p>Estratégia, sistemas e automação para negócios que querem crescer com mais clareza.</p></div><div className="footer__links"><button onClick={() => scrollTo('solucao')}>Como resolvemos</button><button onClick={() => scrollTo('projetos')}>Projetos</button><a href="https://www.instagram.com/vertexxconsulting" target="_blank" rel="noreferrer"><InstagramIcon /> Instagram</a></div><div className="footer__legal"><span>Telêmaco Borba, PR</span><span>© 2026 Vertex Consulting</span></div></div></footer>

      {formOpen && <div className="form-modal-backdrop" onClick={() => setFormOpen(false)}><div className="form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title" onClick={(event) => event.stopPropagation()}><button className="form-modal__close" onClick={() => setFormOpen(false)} aria-label="Fechar formulário"><X size={19} /></button>{formStatus === 'success' ? <div className="form-modal__success"><div className="form-modal__success-icon"><Check /></div><p className="eyebrow"><span /> Recebemos sua mensagem</p><h3 id="form-title">A próxima conversa começa aqui.</h3><p>Seu contexto chegou até a Vertex. Em breve entramos em contato para entender o cenário com calma.</p>{boltenLink && <a className="btn btn--primary" href={boltenLink} target="_blank" rel="noreferrer">Continuar pelo WhatsApp <ArrowUpRight size={17} /></a>}<button className="text-link" onClick={() => setFormOpen(false)}>Fechar</button></div> : <><div className="form-modal__header"><p className="eyebrow"><span /> Conversa inicial</p><h3 id="form-title">Onde o seu negócio está travando?</h3><p>Conte o suficiente para a gente chegar na primeira conversa já entendendo o contexto.</p></div><form ref={formRef} onSubmit={submitForm} className="contact-form"><label>Seu nome<input required value={formData.name} onChange={setField('name')} placeholder="Como podemos chamar você?" /></label><label>E-mail<input required type="email" value={formData.email} onChange={setField('email')} placeholder="voce@empresa.com.br" /></label><label>WhatsApp<input required value={formData.phone} onChange={setField('phone')} placeholder="(42) 99999-9999" /></label><label>Empresa<input required value={formData.company} onChange={setField('company')} placeholder="Nome da empresa" /></label><label>O que mais precisa destravar?<select required value={formData.service} onChange={setField('service')}><option value="">Selecione uma frente</option><option>Posicionamento e marca</option><option>Site ou presença digital</option><option>Processos e gestão do tempo</option><option>Automação e IA</option><option>CRM e vendas</option></select></label><label>Você já tem um site?<select required value={formData.has_site} onChange={setField('has_site')}><option value="">Selecione uma opção</option><option>Sim, mas não traz resultado</option><option>Sim, funciona bem</option><option>Ainda não</option></select></label><label>Instagram da empresa<input required value={formData.instagram} onChange={setField('instagram')} placeholder="@suaempresa" /></label><label>O que está acontecendo hoje?<textarea required rows={4} value={formData.message} onChange={setField('message')} placeholder="Descreva o gargalo que mais ocupa sua cabeça." /></label>{formStatus === 'error' && <p className="form-error"><CircleAlert size={16} /> Não conseguimos enviar agora. Tente novamente.</p>}<button className="btn btn--primary btn--full" type="submit" disabled={!canSubmit || formStatus === 'sending'}>{formStatus === 'sending' ? 'Enviando contexto…' : 'Enviar meu contexto'} <ArrowUpRight size={17} /></button><p className="form-note">Seus dados são usados apenas para esta conversa.</p></form></>}</div></div>}
    </div>
  );
}
