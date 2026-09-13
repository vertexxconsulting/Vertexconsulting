import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDown, ArrowUpRight, Check, ChevronDown, ChevronRight, CircleAlert,
  Clock3, Layers3, Menu, MessageCircle, Target, Users, X, Zap,
} from 'lucide-react';
import { createContact } from '../services/contactService';
import './LandingPage.css';

const navItems = [
  { id: 'identificacao', label: 'O gargalo' },
  { id: 'solucoes', label: 'Soluções' },
  { id: 'metodo', label: 'Método Vertex' },
  { id: 'projetos', label: 'Projetos' },
];

const painPoints = [
  'responde clientes manualmente?',
  'perde oportunidades no WhatsApp?',
  'depende de indicação para vender?',
  'publica nas redes sem estratégia clara?',
  'controla clientes em planilhas ou na memória?',
  'perde horas com tarefas que poderiam ser automatizadas?',
  'tem um site que não gera oportunidades?',
  'sente que, se você parar, a empresa para junto?',
];

const solutions = [
  { icon: Target, title: 'Atrair mais clientes', items: ['Posicionamento', 'Gestão de mídias', 'Conteúdo estratégico', 'Landing pages e sites'], accent: 'atrair' },
  { icon: MessageCircle, title: 'Vender e atender melhor', items: ['CRM', 'WhatsApp automatizado', 'Funis', 'Agendamento e automação comercial'], accent: 'vender' },
  { icon: Zap, title: 'Ganhar tempo na operação', items: ['Inteligência Artificial', 'Agentes de IA', 'Automação de processos', 'Integrações'], accent: 'produzir' },
  { icon: Users, title: 'Dar mais autonomia à equipe', items: ['Liderança', 'Vendas', 'Comunicação', 'Desenvolvimento de equipes'], accent: 'equipe' },
];

const method = [
  { number: '01', title: 'Diagnóstico', text: 'Mapeamos o negócio, os objetivos e o gargalo que mais custa tempo ou oportunidade.' },
  { number: '02', title: 'Estratégia', text: 'Escolhemos a próxima decisão e deixamos o restante para depois.' },
  { number: '03', title: 'Implementação', text: 'Colocamos a solução em funcionamento e mostramos como ela entra na rotina.' },
  { number: '04', title: 'Acompanhamento', text: 'Acompanhamos o uso, corrigimos o que travar e registramos o próximo avanço.' },
];

const beforeAfter = [
  ['Atendimento manual', 'Atendimento automatizado'],
  ['Leads espalhados', 'CRM organizado'],
  ['Marketing improvisado', 'Estratégia clara'],
  ['Tarefas repetitivas', 'Automação + IA'],
  ['Dependência do dono', 'Processos estruturados'],
  ['Oportunidades perdidas', 'Melhor acompanhamento'],
];

const faqs = [
  ['Minha empresa é pequena. Isso serve para mim?', 'Sim. As soluções são dimensionadas de acordo com a realidade e o momento de cada negócio.'],
  ['IA vai substituir minha equipe?', 'O objetivo é reduzir tarefas repetitivas e permitir que as pessoas se concentrem em atividades de maior valor.'],
  ['Vou precisar contratar várias soluções?', 'Não necessariamente. O diagnóstico existe justamente para identificar o que faz sentido agora.'],
  ['Quanto custa?', 'Cada projeto depende da necessidade e da complexidade da implementação. Depois do diagnóstico, apresentamos as alternativas adequadas.'],
  ['Não entendo nada de tecnologia.', 'Você não precisa entender. Nosso papel é traduzir tecnologia em soluções aplicáveis ao seu negócio.'],
];

type FormData = { name: string; email: string; phone: string; company: string; service: string; has_site: string; instagram: string; message: string };
type FormStatus = 'idle' | 'sending' | 'success' | 'error';
const initialForm: FormData = { name: '', email: '', phone: '', company: '', service: '', has_site: '', instagram: '', message: '' };

function InstagramIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>; }

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [activeMethod, setActiveMethod] = useState('01');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState(initialForm);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(window.scrollY / maxScroll, 1);
        document.documentElement.style.setProperty('--scroll-progress', `${progress * 100}%`);
        document.documentElement.style.setProperty('--hero-shift', `${Math.min(window.scrollY * 0.12, 90)}px`);
        setScrolled(window.scrollY > 48);
        frame = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;
    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.35;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;
    const moveOrb = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };
    const animateOrb = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      document.documentElement.style.setProperty('--cursor-x', `${currentX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${currentY}px`);
      frame = window.requestAnimationFrame(animateOrb);
    };
    window.addEventListener('pointermove', moveOrb, { passive: true });
    frame = window.requestAnimationFrame(animateOrb);
    return () => { window.removeEventListener('pointermove', moveOrb); window.cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    const sections = navItems.map((item) => document.getElementById(item.id)).filter((item): item is HTMLElement => Boolean(item));
    const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible?.target instanceof HTMLElement) setActive(visible.target.id); }, { rootMargin: '-30% 0px -58% 0px', threshold: [0.1, 0.4, 0.7] });
    sections.forEach((section) => observer.observe(section)); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: '0px 0px -32px' });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element)); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('.method-item[data-method]'));
    if (!items.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) setActiveMethod(visible.target.dataset.method ?? '01');
    }, { rootMargin: '-38% 0px -42% 0px', threshold: [0.2, 0.55, 0.8] });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    document.body.style.overflow = formOpen || mobileMenu ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && (setFormOpen(false), setMobileMenu(false));
    document.addEventListener('keydown', onKey); return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [formOpen, mobileMenu]);

  const scrollTo = (id: string) => { setMobileMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const openForm = () => { setMobileMenu(false); setFormStatus('idle'); setFormOpen(true); };
  const setField = (key: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const value = key === 'phone' ? event.target.value.replace(/\D/g, '').slice(0, 11) : event.target.value; setFormData((current) => ({ ...current, [key]: value })); if (formStatus !== 'idle') setFormStatus('idle'); };
  const canSubmit = Object.values(formData).every((value) => value.trim()) && formData.phone.replace(/\D/g, '').length >= 10;
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); 
    if (!formRef.current?.reportValidity() || !canSubmit) return; 
    setFormStatus('sending'); 
    try {
      await createContact(formData);
      setFormStatus('success');
    } catch {
      setFormStatus('error');
    }
  };

  return <div className="vertex-site">
    <div className="scroll-progress" aria-hidden="true" />
    <div className="cursor-orb" aria-hidden="true" />
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <nav className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`} aria-label="Navegação principal"><div className="site-nav__inner"><button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao início"><img src="/logo.jpeg" alt="Vertex Consulting" /></button><div className="site-nav__links">{navItems.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => scrollTo(item.id)}>{item.label}</button>)}<button className="site-nav__cta" onClick={openForm}>Solicitar diagnóstico <ArrowUpRight size={15} /></button></div><button className="menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={23} /></button></div></nav>
    {mobileMenu && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu"><button className="mobile-menu__close" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></button><div>{navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}<ArrowUpRight size={17} /></button>)}<button className="btn btn--gold" onClick={openForm}>Solicitar diagnóstico <ArrowUpRight size={17} /></button></div></div>}

    <main id="main-content">
      <section className="hero-new"><div className="hero-new__backdrop" aria-hidden="true" /><div className="hero-new__grid" aria-hidden="true" /><div className="hero-new__inner"><div className="hero-new__copy reveal"><p className="eyebrow"><span /> Vertex Consulting</p><h1>Sua empresa pode crescer. <em>Sem depender de você para tudo.</em></h1><p className="hero-new__lead">A Vertex conecta estratégia, posicionamento, marketing, tecnologia e Inteligência Artificial para construir negócios mais eficientes, profissionais e preparados para crescer.</p><div className="hero-new__actions"><button className="btn btn--gold" onClick={openForm}>Solicitar diagnóstico estratégico <ArrowUpRight size={17} /></button><span className="quiet-link quiet-link--muted"><Clock3 size={16} /> O diagnóstico chega depois do primeiro contato</span></div><div className="hero-new__strip"><span>Estratégia</span><i /> <span>Sites</span><i /> <span>Marketing</span><i /> <span>CRM</span><i /> <span>Automação</span><i /> <span>IA</span></div></div><div className="hero-new__visual reveal reveal--delay"><div className="hero-new__orb" /><div className="hero-new__frame"><img src="/logo-hero.png" alt="Marca Vertex Consulting" /><div><small>VERTEX CONSULTING</small><strong>Mais resultados para a empresa.<br />Mais tempo para você.</strong></div></div><div className="hero-new__note"><Clock3 size={16} /> eficiência que libera espaço</div></div></div><div className="hero-new__scroll"><span>desça para reconhecer o gargalo</span><ArrowDown size={16} /></div></section>

      <section className="proof-bar" aria-label="Indicadores da Vertex"><div><strong>+30</strong><span>projetos entregues</span></div><div><strong>+15</strong><span>empresas atendidas</span></div><div><strong>98%</strong><span>de satisfação</span></div><div><strong>+5</strong><span>anos de experiência</span></div></section>

      <section id="identificacao" className="recognition section-new"><div className="container-new recognition__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> Reconhecimento</p><h2>Sua empresa cresceu.<br /><em>Mas a estrutura acompanhou?</em></h2><p>O crescimento começa a pesar quando a operação ainda depende de improviso, memória e disponibilidade total do dono.</p></div><div className="checklist reveal reveal--delay">{painPoints.map((point) => <div key={point}><Check size={16} /><span>Você ainda {point}</span></div>)}</div></div><div className="container-new recognition__closing reveal"><span className="line" /><p>O esforço existe.<br /><strong>A estrutura precisa acompanhar.</strong></p></div></section>

      <section className="cost-section section-new"><div className="container-new cost-section__layout"><div className="cost-section__copy reveal"><p className="eyebrow"><span /> O custo de continuar igual</p><h2>A ineficiência também toma tempo.</h2><p className="big-line">Muitas vezes aparece como <em>oportunidade perdida.</em></p></div><div className="cost-columns reveal reveal--delay"><div><p className="column-label">Na empresa</p><span>Retrabalho</span><span>Leads perdidos</span><span>Baixa produtividade</span><span>Marketing sem direção</span><span>Crescimento limitado</span></div><div><p className="column-label">Na sua vida</p><span>Celular durante o jantar</span><span>Trabalho no final de semana</span><span>Preocupação constante</span><span>Pouco tempo para descansar</span><span>Dependência para decidir</span></div></div></div><div className="container-new cost-section__footer reveal"><p>Você abriu uma empresa para construir liberdade.<br /><strong>Não para criar um negócio do qual não consegue se afastar.</strong></p></div></section>

      <section className="belief section-new"><div className="container-new belief__inner reveal"><p className="eyebrow"><span /> Como escolher</p><h2>As ferramentas precisam servir ao negócio.</h2><p>A ordem das decisões define o que vale a pena implementar.</p><div className="belief__grid"><div><span>Ter ChatGPT</span><b>pede uma estratégia de uso.</b></div><div><span>Ter Instagram</span><b>pede uma mensagem clara.</b></div><div><span>Ter CRM</span><b>pede um processo comercial.</b></div><div><span>Ter automação</span><b>pede uma rotina bem definida.</b></div></div><div className="belief__last">Tecnologia sem estratégia pode virar mais uma despesa.<strong>A Vertex começa pela rotina e escolhe a ferramenta depois.</strong></div></div></section>

      <section className="vertex-intro section-new"><div className="container-new vertex-intro__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> A parceira estratégica</p><h2>Primeiro entendemos.<br /><em>Depois recomendamos.<br />Então implementamos.</em></h2></div><div className="vertex-intro__copy reveal reveal--delay"><p>A Vertex trabalha com sites, marketing, IA e organização da operação.</p><p>O trabalho começa pelo gargalo e conecta estratégia, tecnologia e pessoas à rotina da empresa.</p><div className="values"><span>Relacionamento próximo</span><span>Recomendações claras</span><span>Compromisso com prazos</span><span>Foco no que foi combinado</span></div></div></div></section>

      <section id="solucoes" className="solutions section-new"><div className="container-new"><div className="section-heading section-heading--center reveal"><p className="eyebrow"><span /> Onde está o peso?</p><h2>O que precisa mudar na sua empresa <em>hoje?</em></h2></div><div className="solutions-grid">{solutions.map(({ icon: Icon, title, items, accent }, index) => <article className={`solution-card solution-card--${accent} reveal`} key={title}><div className="solution-card__top"><span>0{index + 1}</span><Icon size={21} /></div><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><button onClick={openForm}>Conversar sobre isso <ArrowUpRight size={16} /></button></article>)}</div></div></section>

      <section id="metodo" className="method section-new"><div className="container-new method__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> O método Vertex</p><h2>Primeiro entendemos.<br /><em>Depois colocamos de pé.</em></h2><p>O diagnóstico mostra onde a empresa está perdendo tempo ou oportunidade. A partir daí, cada decisão entra na ordem certa.</p><nav className="method-progress" aria-label="Etapas do método Vertex">{method.map((item) => <a key={item.number} className={activeMethod === item.number ? 'is-active' : ''} aria-current={activeMethod === item.number ? 'step' : undefined} href={`#metodo-${item.number}`}><span>{item.number}</span>{item.title}</a>)}</nav></div><div className="method-list">{method.map((item) => <article id={`metodo-${item.number}`} data-method={item.number} className={`method-item reveal ${activeMethod === item.number ? 'is-active' : ''}`} key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><ArrowUpRight size={17} /></article>)}</div></div></section>

      <section className="transformation section-new"><div className="container-new"><div className="section-heading section-heading--center reveal"><p className="eyebrow"><span /> O que muda na rotina</p><h2>Como fica a empresa <em>depois?</em></h2></div><div className="comparison reveal"><div className="comparison__head"><span>Antes</span><span>Depois</span></div>{beforeAfter.map(([before, after]) => <div className="comparison__row" key={before}><span>{before}</span><ChevronRight size={16} /><strong>{after}</strong></div>)}</div><p className="transformation__closing reveal">O objetivo não é tirar você da sua empresa.<br /><strong>É permitir que você escolha onde seu tempo realmente gera valor.</strong></p></div></section>

      <section id="projetos" className="projects-new section-new"><div className="container-new"><div className="projects-new__heading reveal"><div className="section-heading"><p className="eyebrow"><span /> Projetos da Vertex</p><h2>A estratégia aparece no que foi construído. <em>Veja alguns exemplos.</em></h2></div><div className="projects-new__intro"><p>Sites, experiências digitais e sistemas feitos para problemas concretos. Cada projeto começa pela decisão que precisa ser tomada.</p><span className="projects-new__count">03 <small>frentes apresentadas</small></span></div></div><div className="projects-new__grid"><article className="project-showcase project-showcase--wide reveal"><div className="project-showcase__image"><img src="/usebasemidia.webp" alt="Projeto Base Mídia" loading="lazy" /><span className="project-showcase__number">01 / 03</span></div><div className="project-showcase__body"><div><small>Presença digital</small><h3>Base Mídia</h3><p>Uma experiência digital construída para apresentar uma marca com mais clareza, presença e autoridade.</p></div><span className="project-showcase__arrow"><ArrowUpRight size={18} /></span></div></article><article className="project-showcase reveal"><div className="project-showcase__image"><img src="/resultgestaopro.webp" alt="Projeto Result Gestão Pro" loading="lazy" /><span className="project-showcase__number">02 / 03</span></div><div className="project-showcase__body"><div><small>Sistema de gestão</small><h3>Result Gestão Pro</h3><p>Interface orientada à organização, acompanhamento e tomada de decisão.</p></div><span className="project-showcase__arrow"><ArrowUpRight size={18} /></span></div></article><article className="project-showcase project-showcase--dark reveal"><div className="project-showcase__mark"><Layers3 size={28} /><span>VERTEX CRM</span></div><div className="project-showcase__body"><div><small>Produto interno</small><h3>CRM Vertex</h3><p>Pipeline, contatos, tarefas e histórico para transformar atendimento em processo.</p></div><span className="project-showcase__arrow"><ArrowUpRight size={18} /></span></div></article></div><div className="projects-new__footer reveal"><span>Da primeira decisão ao trabalho diário.</span><button onClick={openForm}>Quero falar sobre meu projeto <ArrowUpRight size={16} /></button></div></div></section>

      <section className="final-proof section-new"><div className="container-new final-proof__inner reveal"><p className="eyebrow"><span /> O que fica na rotina</p><h2>Uma empresa mais organizada.<br /><em>Mais tempo para decidir.</em></h2><div className="final-proof__list"><span>mais autoridade</span><span>mais eficiência</span><span>mais produtividade</span><span>melhor experiência para o cliente</span><span>processos mais estruturados</span><span>mais capacidade de crescimento</span></div><p>Para que você tenha tempo para pensar, acompanhar e viver fora da operação.</p></div></section>

      <section className="faq section-new"><div className="container-new faq__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> Ainda com dúvidas?</p><h2>Clareza antes<br /><em>da decisão.</em></h2></div><div className="faq-list reveal reveal--delay">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'is-open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{question}<ChevronDown size={18} /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></div></section>

      <section id="contato" className="final-cta"><div className="final-cta__texture" /><div className="container-new final-cta__inner reveal"><div className="final-cta__eyebrow"><p className="eyebrow"><span /> Próximo passo</p><span className="final-cta__index">VERTEX / 01</span></div><h2>Você está trabalhando <em>para a empresa.</em><br />E quanto sobra para decidir o próximo passo?</h2><p className="final-cta__lead">A conversa começa pelo que está acontecendo.<br /><strong>Depois, decidimos o que vale a pena mudar primeiro.</strong></p><div className="final-cta__action"><button className="btn btn--gold" onClick={openForm}>Quero solicitar meu diagnóstico <ArrowUpRight size={17} /></button><small>Você recebe os próximos passos depois de uma conversa sobre o seu contexto.</small></div><div className="final-cta__signature"><strong>VERTEX CONSULTING</strong><span>Uma empresa mais organizada. Mais tempo para decidir.</span></div></div></section>
    </main>

    <footer className="site-footer"><div className="container-new site-footer__inner"><div><button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><img src="/logo.jpeg" alt="Vertex Consulting" /></button><p>Estratégia, marketing, tecnologia e IA para organizar o crescimento do seu negócio.</p></div><div className="site-footer__links"><button onClick={() => scrollTo('solucoes')}>Soluções</button><button onClick={() => scrollTo('metodo')}>Método Vertex</button><button onClick={() => scrollTo('projetos')}>Projetos</button><a href="https://www.instagram.com/vertexxconsulting" target="_blank" rel="noreferrer"><InstagramIcon /> Instagram</a></div><div className="site-footer__bottom"><span>Telêmaco Borba, PR</span><span>© 2026 Vertex Consulting</span></div></div></footer>

    {formOpen && <div className="form-backdrop" onClick={() => setFormOpen(false)}><div className="form-modal-new" role="dialog" aria-modal="true" aria-labelledby="form-title" onClick={(event) => event.stopPropagation()}><button className="form-close" onClick={() => setFormOpen(false)} aria-label="Fechar formulário"><X size={19} /></button>{formStatus === 'success' ? <div className="form-success"><div className="form-success__icon"><Check /></div><p className="eyebrow"><span /> Contexto recebido</p><h3>Agora temos um ponto de partida.</h3><p>Recebemos suas informações. Vamos preparar a leitura do seu contexto. Em alguns minutos, você receberá no WhatsApp as instruções e o link do diagnóstico.</p><button className="quiet-link" onClick={() => setFormOpen(false)}>Fechar</button></div> : <><div className="form-head"><p className="eyebrow"><span /> Diagnóstico estratégico</p><h3 id="form-title">Onde sua empresa está perdendo tempo ou oportunidades?</h3><p>Conte o que está acontecendo. Assim, a primeira conversa parte de um contexto real.</p></div><form ref={formRef} className="contact-form-new" onSubmit={handleSubmit}><label>Nome<input required value={formData.name} onChange={setField('name')} placeholder="Seu nome" /></label><label>E-mail<input required type="email" value={formData.email} onChange={setField('email')} placeholder="voce@empresa.com.br" /></label><label>WhatsApp<input required value={formData.phone} onChange={setField('phone')} placeholder="(42) 99999-9999" /></label><label>Empresa<input required value={formData.company} onChange={setField('company')} placeholder="Nome da empresa" /></label><label>O que precisa mudar primeiro?<select required value={formData.service} onChange={setField('service')}><option value="">Selecione</option><option>Mais clientes e posicionamento</option><option>Vendas e atendimento</option><option>Produtividade e automação</option><option>Desenvolvimento da equipe</option></select></label><label>Você já tem um site?<select required value={formData.has_site} onChange={setField('has_site')}><option value="">Selecione</option><option>Sim, mas não gera oportunidades</option><option>Sim, funciona bem</option><option>Ainda não</option></select></label><label>Instagram da empresa<input required value={formData.instagram} onChange={setField('instagram')} placeholder="@suaempresa" /></label><label className="form-full">Qual é o problema hoje?<textarea required rows={4} value={formData.message} onChange={setField('message')} placeholder="Descreva o problema que mais ocupa seu tempo." /></label>{formStatus === 'error' && <p className="form-error form-full"><CircleAlert size={16} /> Não conseguimos enviar agora. Tente novamente.</p>}<button className="btn btn--gold form-full" type="submit" disabled={!canSubmit || formStatus === 'sending'}>{formStatus === 'sending' ? 'Enviando contexto…' : 'Enviar meu contexto'} <ArrowUpRight size={16} /></button><small className="form-full">Seus dados são usados apenas para esta conversa.</small></form></>}</div></div>}
  </div>;
}
