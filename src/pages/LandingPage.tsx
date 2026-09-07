import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDown, ArrowUpRight, Check, ChevronDown, ChevronRight, CircleAlert,
  Clock3, Layers3, Menu, MessageCircle, Target, Users, X, Zap,
} from 'lucide-react';
import { createContact } from '../services/contactService';
import { getBoltenWhatsAppLink } from '../services/boltenService';
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
  { icon: Target, title: 'Quero atrair mais clientes', items: ['Posicionamento', 'Gestão de mídias', 'Conteúdo estratégico', 'Landing pages e sites'], accent: 'atrair' },
  { icon: MessageCircle, title: 'Quero vender e atender melhor', items: ['CRM', 'WhatsApp automatizado', 'Funis', 'Agendamento e automação comercial'], accent: 'vender' },
  { icon: Zap, title: 'Quero ganhar produtividade', items: ['Inteligência Artificial', 'Agentes de IA', 'Automação de processos', 'Integrações'], accent: 'produzir' },
  { icon: Users, title: 'Quero desenvolver minha equipe', items: ['Liderança', 'Vendas', 'Comunicação', 'Desenvolvimento de equipes'], accent: 'equipe' },
];

const method = [
  { number: '01', title: 'Diagnóstico', text: 'Entendemos o negócio, seus objetivos, gargalos e oportunidades.' },
  { number: '02', title: 'Estratégia', text: 'Definimos o que realmente precisa ser feito — e o que deve esperar.' },
  { number: '03', title: 'Implementação', text: 'Colocamos as soluções em funcionamento, com clareza e acompanhamento.' },
  { number: '04', title: 'Acompanhamento', text: 'Ajustamos a implantação e avaliamos os sinais que aparecem no negócio.' },
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
  const [mobileMenu, setMobileMenu] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState(initialForm);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const boltenLink = getBoltenWhatsAppLink();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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
    document.body.style.overflow = formOpen || mobileMenu ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && (setFormOpen(false), setMobileMenu(false));
    document.addEventListener('keydown', onKey); return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [formOpen, mobileMenu]);

  const scrollTo = (id: string) => { setMobileMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const openForm = () => { setMobileMenu(false); setFormStatus('idle'); setFormOpen(true); };
  const setField = (key: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const value = key === 'phone' ? event.target.value.replace(/\D/g, '').slice(0, 11) : event.target.value; setFormData((current) => ({ ...current, [key]: value })); if (formStatus !== 'idle') setFormStatus('idle'); };
  const canSubmit = Object.values(formData).every((value) => value.trim()) && formData.phone.replace(/\D/g, '').length >= 10;
  const handleSubmit = async (event: FormEvent) => { event.preventDefault(); if (!formRef.current?.reportValidity() || !canSubmit) return; setFormStatus('sending'); try { await createContact(formData); setFormStatus('success'); setFormData(initialForm); } catch { setFormStatus('error'); } };

  return <div className="vertex-site">
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <nav className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`} aria-label="Navegação principal"><div className="site-nav__inner"><button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao início"><img src="/logo.jpeg" alt="Vertex Consulting" /><span>VERTEX<span>.</span></span></button><div className="site-nav__links">{navItems.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => scrollTo(item.id)}>{item.label}</button>)}<button className="site-nav__cta" onClick={openForm}>Solicitar diagnóstico <ArrowUpRight size={15} /></button></div><button className="menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={23} /></button></div></nav>
    {mobileMenu && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu"><button className="mobile-menu__close" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></button><div>{navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}<ArrowUpRight size={17} /></button>)}<button className="btn btn--gold" onClick={openForm}>Solicitar diagnóstico <ArrowUpRight size={17} /></button></div></div>}

    <main id="main-content">
      <section className="hero-new"><div className="hero-new__backdrop" aria-hidden="true" /><div className="hero-new__grid" aria-hidden="true" /><div className="hero-new__inner"><div className="hero-new__copy reveal"><p className="eyebrow"><span /> Vertex Consulting</p><h1>Sua empresa precisa crescer. <em>Não depender cada vez mais de você.</em></h1><p className="hero-new__lead">A Vertex conecta estratégia, posicionamento, marketing, tecnologia e Inteligência Artificial para construir negócios mais eficientes, profissionais e preparados para crescer.</p><div className="hero-new__actions"><button className="btn btn--gold" onClick={openForm}>Solicitar diagnóstico estratégico <ArrowUpRight size={17} /></button><a className="quiet-link" href="/diagnostico">Fazer diagnóstico online <ArrowDown size={16} /></a></div><div className="hero-new__strip"><span>Estratégia</span><i /> <span>Sites</span><i /> <span>Marketing</span><i /> <span>CRM</span><i /> <span>Automação</span><i /> <span>IA</span></div></div><div className="hero-new__visual reveal reveal--delay"><div className="hero-new__orb" /><div className="hero-new__frame"><img src="/logo-hero.png" alt="Marca Vertex Consulting" /><div><small>VERTEX CONSULTING</small><strong>Mais resultados para a empresa.<br />Mais tempo para você.</strong></div></div><div className="hero-new__note"><Clock3 size={16} /> eficiência que libera espaço</div></div></div><div className="hero-new__scroll"><span>desça para reconhecer o gargalo</span><ArrowDown size={16} /></div></section>

      <section className="proof-bar" aria-label="Indicadores da Vertex"><div><strong>+30</strong><span>projetos entregues</span></div><div><strong>+15</strong><span>empresas atendidas</span></div><div><strong>98%</strong><span>de satisfação</span></div><div><strong>+5</strong><span>anos de experiência</span></div></section>

      <section id="identificacao" className="recognition section-new"><div className="container-new recognition__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> Reconhecimento</p><h2>Sua empresa cresceu.<br /><em>Mas a estrutura acompanhou?</em></h2><p>O crescimento começa a pesar quando a operação ainda depende de improviso, memória e disponibilidade total do dono.</p></div><div className="checklist reveal reveal--delay">{painPoints.map((point) => <div key={point}><Check size={16} /><span>Você ainda {point}</span></div>)}</div></div><div className="container-new recognition__closing reveal"><span className="line" /><p>Talvez seu problema não seja falta de esforço.<br /><strong>Seja falta de estrutura.</strong></p></div></section>

      <section className="cost-section section-new"><div className="container-new cost-section__layout"><div className="cost-section__copy reveal"><p className="eyebrow"><span /> O custo de continuar igual</p><h2>O custo da ineficiência nem sempre aparece como despesa.</h2><p className="big-line">Muitas vezes aparece como <em>oportunidade perdida.</em></p></div><div className="cost-columns reveal reveal--delay"><div><p className="column-label">Na empresa</p><span>Retrabalho</span><span>Leads perdidos</span><span>Baixa produtividade</span><span>Marketing sem direção</span><span>Crescimento limitado</span></div><div><p className="column-label">Na sua vida</p><span>Celular durante o jantar</span><span>Trabalho no final de semana</span><span>Preocupação constante</span><span>Pouco tempo para descansar</span><span>Dependência para decidir</span></div></div></div><div className="container-new cost-section__footer reveal"><p>Você abriu uma empresa para construir liberdade.<br /><strong>Não para criar um negócio do qual não consegue se afastar.</strong></p></div></section>

      <section className="belief section-new"><div className="container-new belief__inner reveal"><p className="eyebrow"><span /> Mudança de crença</p><h2>Você não precisa de mais ferramentas.</h2><p>Precisa das ferramentas certas trabalhando juntas para resolver os problemas certos.</p><div className="belief__grid"><div><span>Ter ChatGPT</span><b>não significa ter uma estratégia de IA.</b></div><div><span>Ter Instagram</span><b>não significa ter posicionamento.</b></div><div><span>Ter CRM</span><b>não significa ter processo comercial.</b></div><div><span>Ter automação</span><b>não significa ter eficiência.</b></div></div><div className="belief__last">Tecnologia sem estratégia pode virar apenas mais uma despesa.<strong>É por isso que a Vertex começa pelo negócio — não pela ferramenta.</strong></div></div></section>

      <section className="vertex-intro section-new"><div className="container-new vertex-intro__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> A parceira estratégica</p><h2>Primeiro entendemos.<br /><em>Depois recomendamos.<br />Então implementamos.</em></h2></div><div className="vertex-intro__copy reveal reveal--delay"><p>Não somos apenas uma empresa de sites. Não somos apenas uma agência de marketing. Não somos apenas uma consultoria de IA.</p><p>Somos uma parceira estratégica que identifica gargalos e conecta estratégia, tecnologia, marketing e pessoas para ajudar sua empresa a crescer de forma mais estruturada.</p><div className="values"><span>Relacionamento próximo</span><span>Honestidade nas recomendações</span><span>Compromisso com prazos</span><span>Foco em resultado</span></div></div></div></section>

      <section id="solucoes" className="solutions section-new"><div className="container-new"><div className="section-heading section-heading--center reveal"><p className="eyebrow"><span /> Encontre a sua frente</p><h2>O que precisa mudar na sua empresa <em>hoje?</em></h2></div><div className="solutions-grid">{solutions.map(({ icon: Icon, title, items, accent }, index) => <article className={`solution-card solution-card--${accent} reveal`} key={title}><div className="solution-card__top"><span>0{index + 1}</span><Icon size={21} /></div><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><button onClick={openForm}>Conversar sobre isso <ArrowUpRight size={16} /></button></article>)}</div></div></section>

      <section id="metodo" className="method section-new"><div className="container-new method__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> O método Vertex</p><h2>Não começamos vendendo.<br /><em>Começamos entendendo.</em></h2><p>O diagnóstico existe para separar prioridade de distração e construir uma solução que faça sentido para o momento da empresa.</p></div><div className="method-list">{method.map((item) => <article className="method-item reveal" key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><ArrowUpRight size={17} /></article>)}</div></div></section>

      <section className="transformation section-new"><div className="container-new"><div className="section-heading section-heading--center reveal"><p className="eyebrow"><span /> A mudança possível</p><h2>Como fica a empresa <em>depois?</em></h2></div><div className="comparison reveal"><div className="comparison__head"><span>Antes</span><span>Depois</span></div>{beforeAfter.map(([before, after]) => <div className="comparison__row" key={before}><span>{before}</span><ChevronRight size={16} /><strong>{after}</strong></div>)}</div><p className="transformation__closing reveal">O objetivo não é tirar você da sua empresa.<br /><strong>É permitir que você escolha onde seu tempo realmente gera valor.</strong></p></div></section>

      <section id="projetos" className="projects-new section-new"><div className="container-new"><div className="projects-new__heading reveal"><div className="section-heading"><p className="eyebrow"><span /> Prova construída na prática</p><h2>Projetos que mostram <em>o que fazemos.</em></h2></div><p>Sem métricas inventadas. Uma seleção de experiências e sistemas que já foram colocados de pé pela Vertex.</p></div><div className="projects-new__grid"><article className="project-showcase project-showcase--wide reveal"><img src="/usebasemidia.webp" alt="Projeto Base Mídia" loading="lazy" /><div><small>Presença digital</small><h3>Base Mídia</h3><p>Uma experiência digital construída para apresentar uma marca com mais clareza e autoridade.</p></div></article><article className="project-showcase reveal"><img src="/resultgestaopro.webp" alt="Projeto Result Gestão Pro" loading="lazy" /><div><small>Sistema de gestão</small><h3>Result Gestão Pro</h3><p>Interface orientada à organização e acompanhamento do negócio.</p></div></article><article className="project-showcase project-showcase--dark reveal"><div className="project-showcase__mark"><Layers3 size={28} /><span>VERTEX CRM</span></div><div><small>Produto interno</small><h3>CRM Vertex</h3><p>Pipeline, contatos, tarefas e histórico para transformar atendimento em processo.</p></div></article></div></div></section>

      <section className="final-proof section-new"><div className="container-new final-proof__inner reveal"><p className="eyebrow"><span /> O resultado final</p><h2>Negócios mais fortes.<br /><em>Pessoas mais livres.</em></h2><div className="final-proof__list"><span>mais autoridade</span><span>mais eficiência</span><span>mais produtividade</span><span>melhor experiência para o cliente</span><span>processos mais estruturados</span><span>mais capacidade de crescimento</span></div><p>Para que sobre mais tempo para estratégia, família, relacionamentos e vida.</p></div></section>

      <section className="faq section-new"><div className="container-new faq__layout"><div className="section-heading reveal"><p className="eyebrow"><span /> Ainda com dúvidas?</p><h2>Clareza antes<br /><em>da decisão.</em></h2></div><div className="faq-list reveal reveal--delay">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'is-open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{question}<ChevronDown size={18} /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></div></section>

      <section id="contato" className="final-cta"><div className="final-cta__texture" /><div className="container-new final-cta__inner reveal"><p className="eyebrow"><span /> Próximo passo</p><h2>Sua empresa está trabalhando para você — ou você está trabalhando para sustentar tudo sozinho?</h2><p>Descubra onde sua empresa está perdendo tempo, eficiência e oportunidades de crescimento.</p><button className="btn btn--gold" onClick={openForm}>Quero solicitar meu diagnóstico <ArrowUpRight size={17} /></button><small>Leva poucos minutos para solicitar.</small><strong>VERTEX CONSULTING</strong><span>Negócios mais fortes. Pessoas mais livres.</span></div></section>
    </main>

    <footer className="site-footer"><div className="container-new site-footer__inner"><div><button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><img src="/logo.jpeg" alt="Vertex Consulting" /><span>VERTEX<span>.</span></span></button><p>Estratégia, marketing, tecnologia, IA e pessoas para negócios mais fortes.</p></div><div className="site-footer__links"><button onClick={() => scrollTo('solucoes')}>Soluções</button><button onClick={() => scrollTo('metodo')}>Método Vertex</button><button onClick={() => scrollTo('projetos')}>Projetos</button><a href="/diagnostico">Diagnóstico online</a><a href="https://www.instagram.com/vertexxconsulting" target="_blank" rel="noreferrer"><InstagramIcon /> Instagram</a></div><div className="site-footer__bottom"><span>Telêmaco Borba, PR</span><span>© 2026 Vertex Consulting</span></div></div></footer>

    {formOpen && <div className="form-backdrop" onClick={() => setFormOpen(false)}><div className="form-modal-new" role="dialog" aria-modal="true" aria-labelledby="form-title" onClick={(event) => event.stopPropagation()}><button className="form-close" onClick={() => setFormOpen(false)} aria-label="Fechar formulário"><X size={19} /></button>{formStatus === 'success' ? <div className="form-success"><div className="form-success__icon"><Check /></div><p className="eyebrow"><span /> Contexto recebido</p><h3>A próxima conversa começa com clareza.</h3><p>Recebemos suas informações. Em breve, a Vertex entra em contato para entender o cenário com calma.</p>{boltenLink && <a className="btn btn--gold" href={boltenLink} target="_blank" rel="noreferrer">Continuar pelo WhatsApp <ArrowUpRight size={16} /></a>}<button className="quiet-link" onClick={() => setFormOpen(false)}>Fechar</button></div> : <><div className="form-head"><p className="eyebrow"><span /> Diagnóstico estratégico</p><h3 id="form-title">Onde sua empresa está perdendo tempo ou oportunidade?</h3><p>Conte o essencial. A primeira conversa começa mais preparada.</p></div><form ref={formRef} className="contact-form-new" onSubmit={handleSubmit}><label>Nome<input required value={formData.name} onChange={setField('name')} placeholder="Seu nome" /></label><label>E-mail<input required type="email" value={formData.email} onChange={setField('email')} placeholder="voce@empresa.com.br" /></label><label>WhatsApp<input required value={formData.phone} onChange={setField('phone')} placeholder="(42) 99999-9999" /></label><label>Empresa<input required value={formData.company} onChange={setField('company')} placeholder="Nome da empresa" /></label><label>O que precisa mudar primeiro?<select required value={formData.service} onChange={setField('service')}><option value="">Selecione</option><option>Mais clientes e posicionamento</option><option>Vendas e atendimento</option><option>Produtividade e automação</option><option>Desenvolvimento da equipe</option></select></label><label>Você já tem um site?<select required value={formData.has_site} onChange={setField('has_site')}><option value="">Selecione</option><option>Sim, mas não gera oportunidades</option><option>Sim, funciona bem</option><option>Ainda não</option></select></label><label>Instagram da empresa<input required value={formData.instagram} onChange={setField('instagram')} placeholder="@suaempresa" /></label><label className="form-full">O que está acontecendo hoje?<textarea required rows={4} value={formData.message} onChange={setField('message')} placeholder="Descreva o gargalo que mais ocupa sua cabeça." /></label>{formStatus === 'error' && <p className="form-error form-full"><CircleAlert size={16} /> Não conseguimos enviar agora. Tente novamente.</p>}<button className="btn btn--gold form-full" type="submit" disabled={!canSubmit || formStatus === 'sending'}>{formStatus === 'sending' ? 'Enviando contexto…' : 'Enviar meu contexto'} <ArrowUpRight size={16} /></button><small className="form-full">Seus dados são usados apenas para esta conversa.</small></form></>}</div></div>}
  </div>;
}
