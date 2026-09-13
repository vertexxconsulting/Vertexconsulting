import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './Diagnostico.css';

const WHATSAPP_NUMBER = "5542998250506";

const PILLARS = [
  {
    key: "posicionamento", label: "Posicionamento",
    recommendation: "Seu posicionamento precisa de atenção. Uma mensagem clara ajuda as pessoas certas a entenderem o que você faz e por que escolher você.",
    questions: [
      { text: "Quando alguém pergunta o que sua empresa faz, você consegue responder em uma frase?", options: [ { text: "Sim, sempre", score: 3 }, { text: "Às vezes, depende de quem pergunta", score: 2 }, { text: "Não, é difícil resumir", score: 1 } ] },
      { text: "Seus clientes ideais sabem por que escolher você?", options: [ { text: "Sim, temos um diferencial claro", score: 3 }, { text: "Mais ou menos, não é tão evidente", score: 2 }, { text: "Não sabemos dizer", score: 1 } ] },
      { text: "Sua marca fala da mesma forma nos canais onde aparece?", options: [ { text: "Sim, é consistente", score: 3 }, { text: "Parcialmente", score: 2 }, { text: "Cada canal fala uma coisa diferente", score: 1 } ] }
    ]
  },
  {
    key: "marketing", label: "Marketing",
    recommendation: "A geração de demanda está segurando o crescimento. Um processo de marketing ajuda a empresa a receber contatos sem depender apenas de indicação.",
    questions: [
      { text: "Sua empresa recebe novos contatos toda semana?", options: [ { text: "Sim, temos um processo ativo", score: 3 }, { text: "De vez em quando", score: 2 }, { text: "Não, dependemos de indicação", score: 1 } ] },
      { text: "Você sabe quanto custa, em média, conquistar um novo cliente?", options: [ { text: "Sim, acompanhamos esse número", score: 3 }, { text: "Tenho uma ideia aproximada", score: 2 }, { text: "Não faço ideia", score: 1 } ] },
      { text: "Seu site e suas redes geram conversas com potenciais clientes?", options: [ { text: "Sim, regularmente", score: 3 }, { text: "Raramente", score: 2 }, { text: "Praticamente nunca", score: 1 } ] }
    ]
  },
  {
    key: "ia", label: "Inteligência Artificial",
    recommendation: "A rotina tem espaço para ganhar tempo. IA pode reduzir trabalho manual em atendimento, conteúdo e análise de dados.",
    questions: [
      { text: "Sua empresa usa IA para ganhar tempo em alguma tarefa?", options: [ { text: "Sim, já faz parte da rotina", score: 3 }, { text: "Usamos pontualmente", score: 2 }, { text: "Nunca usamos", score: 1 } ] },
      { text: "Se você tirasse uma semana de férias, os processos que dependem de IA ou automação continuariam rodando sozinhos?", options: [ { text: "Sim, está tudo automatizado", score: 3 }, { text: "Uma parte sim", score: 2 }, { text: "Não, tudo depende de mim ou da equipe", score: 1 } ] },
      { text: "Você sabe onde a IA poderia ajudar no seu negócio hoje?", options: [ { text: "Sim, me atualizo com frequência", score: 3 }, { text: "Sei o básico", score: 2 }, { text: "Não tenho tempo pra isso", score: 1 } ] }
    ]
  },
  {
    key: "gestao", label: "Gestão",
    recommendation: "A operação ainda depende muito de você. Processos simples e indicadores claros ajudam a equipe a trabalhar sem pedir uma decisão a cada etapa.",
    questions: [
      { text: "Você consegue ver os principais números do negócio em poucos minutos?", options: [ { text: "Sim, tenho isso organizado", score: 3 }, { text: "Consigo, mas com esforço", score: 2 }, { text: "Não, fica tudo espalhado", score: 1 } ] },
      { text: "Sua equipe sabe o que precisa entregar e até quando?", options: [ { text: "Sim, os processos são claros", score: 3 }, { text: "Parcialmente", score: 2 }, { text: "Não, tudo passa por mim", score: 1 } ] },
      { text: "Se você se afastasse por um mês, a empresa manteria o ritmo?", options: [ { text: "Sim, tranquilamente", score: 3 }, { text: "Com dificuldade", score: 2 }, { text: "Não, tudo pararia", score: 1 } ] }
    ]
  },
  {
    key: "vendas", label: "Vendas",
    recommendation: "O processo comercial precisa de etapas claras e bons argumentos para as conversas sobre preço. Isso ajuda a equipe a vender sem transformar todo atendimento em desconto.",
    questions: [
      { text: "Sua empresa tem etapas claras de venda, do primeiro contato ao fechamento?", options: [ { text: "Sim, bem definido", score: 3 }, { text: "Existe, mas informal", score: 2 }, { text: "Cada venda acontece do seu jeito", score: 1 } ] },
      { text: "Você sabe, hoje, quantos contatos viram cliente (sua taxa de conversão)?", options: [ { text: "Sim, acompanho esse número", score: 3 }, { text: "Tenho uma noção", score: 2 }, { text: "Não sei dizer", score: 1 } ] },
      { text: "Sua equipe (ou você) sabe lidar com objeções de preço sem precisar dar desconto?", options: [ { text: "Sim, temos argumentos sólidos", score: 3 }, { text: "Às vezes funciona", score: 2 }, { text: "Geralmente cedemos no preço", score: 1 } ] }
    ]
  }
];

const STAGES = [
  { max: 40, name: "Fase de Sobrevivência", sub: "O foco agora é reduzir os incêndios e criar uma base para o crescimento." },
  { max: 65, name: "Fase de Estruturação", sub: "A base existe, mas ainda depende muito de trabalho manual e de uma pessoa só." },
  { max: 85, name: "Fase de Escala", sub: "Sua empresa já cresce. Agora precisa manter margem e qualidade enquanto avança." },
  { max: 100, name: "Fase de Expansão", sub: "Sua empresa pode avaliar novos mercados, produtos ou operações." }
];

const FLAT = PILLARS.flatMap(p => p.questions.map(q => ({ pillarKey: p.key, pillarLabel: p.label, ...q })));

export default function Diagnostico() {
  const location = useLocation();
  const navigate = useNavigate();
  const diagnosticToken = new URLSearchParams(location.search).get('token');
  const [screen, setScreen] = useState<'intro' | 'quiz' | 'loading' | 'results'>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(FLAT.length).fill(null));
  const [scoreData, setScoreData] = useState<{ overall: number, stageName: string, sub: string, percents: { key: string, label: string, pct: number }[], weakest: any } | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [leadForm, setLeadForm] = useState({ 
    name: '', whats: '', email: '',
    company: '', has_site: false, instagram: '', service: '', message: ''
  });

  useEffect(() => {
    if (location.state?.formData) {
      const d = location.state.formData;
      setLeadForm(prev => ({
        ...prev,
        name: d.name || '',
        whats: d.phone || '',
        email: d.email || '',
        company: d.company || '',
        has_site: d.has_site === 'Sim' || d.has_site === 'Sim, funciona bem' || d.has_site === 'Sim, mas não gera oportunidades',
        instagram: d.instagram || '',
        service: d.service || '',
        message: d.message || ''
      }));
    }
  }, [location.state]);

  const scoreRef = useRef<HTMLDivElement>(null);

  const startQuiz = () => setScreen('quiz');
  
  const goBack = () => {
    if (idx > 0) setIdx(idx - 1);
    else setScreen('intro');
  };

  const selectOption = (optIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[idx] = optIndex;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (idx < FLAT.length - 1) {
        setIdx(idx + 1);
      } else {
        finishQuiz(newAnswers);
      }
    }, 320);
  };

  const finishQuiz = (finalAnswers: (number | null)[]) => {
    setScreen('loading');
    setTimeout(() => computeResults(finalAnswers), 1100);
  };

  const computeResults = (finalAnswers: (number | null)[]) => {
    const totals: Record<string, { sum: number, max: number, label: string }> = {};
    PILLARS.forEach(p => totals[p.key] = { sum: 0, max: 0, label: p.label });

    FLAT.forEach((q, i) => {
      const chosen = finalAnswers[i];
      const score = chosen !== null ? q.options[chosen].score : 1;
      totals[q.pillarKey].sum += score;
      totals[q.pillarKey].max += 3;
    });

    const percents = Object.entries(totals).map(([key, v]) => ({
      key, label: v.label, pct: Math.round((v.sum / v.max) * 100)
    }));

    const overall = Math.round(percents.reduce((a, b) => a + b.pct, 0) / percents.length);
    const stage = STAGES.find(s => overall <= s.max)!;
    const weakest = [...percents].sort((a, b) => a.pct - b.pct)[0];

    setScoreData({ overall, stageName: stage.name, sub: stage.sub, percents, weakest });
    setScreen('results');
  };

  // Animação do score
  useEffect(() => {
    if (screen === 'results' && scoreData && scoreRef.current) {
      const el = scoreRef.current;
      el.classList.add('shown');
      let current = 0;
      const target = scoreData.overall;
      const duration = 700;
      const start = performance.now();
      
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        current = Math.round(t * target);
        el.innerHTML = current + '<span class="score-suffix">/100</span>';
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, [screen, scoreData]);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.whats.trim()) return;

    if (scoreData) {
      const scoresMap: Record<string, number> = {};
      scoreData.percents.forEach(p => {
        scoresMap[`score_${p.key}`] = p.pct;
      });

      // Grava direto no Supabase (aceita insert anônimo conforme requisitos)
      await supabase.from('leads').insert({
        name: leadForm.name.trim(),
        whatsapp: leadForm.whats.trim(),
        email: leadForm.email.trim() || null,
        empresa: leadForm.company.trim() || null,
        tem_site: leadForm.has_site,
        instagram: leadForm.instagram.trim() || null,
        servico_interesse: leadForm.service.trim() || null,
        mensagem: leadForm.message.trim() || null,
        score_overall: scoreData.overall,
        business_stage: scoreData.stageName,
        source: 'diagnostico',
        diagnostic_token: diagnosticToken,
        ...scoresMap
      });
    }

    setIsUnlocked(true);
  };

  const getWhatsappLink = () => {
    if (!scoreData) return '#';
    const msg = `Olá! Fiz o diagnóstico da Vertex e tirei ${scoreData.overall}/100 (${scoreData.stageName}). Quero agendar minha Sessão Estratégica.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="diagnostico-page">
      <header className="diagnostico-header">
        <div className="container-new header-inner">
          <button className="brand" onClick={() => navigate('/')}>
            <img src="/logo.jpeg" alt="Vertex Consulting" className="brand-mark" />
          </button>
          {screen === 'quiz' && <div className="quiz-progress-text">{idx + 1} / {FLAT.length}</div>}
        </div>
      </header>
      <div id="app">
        <section id="screen-intro" className={`screen ${screen === 'intro' ? 'active' : ''}`}>
          <h1>Onde sua empresa está perdendo força?</h1>
          <p className="lead">Responda 15 perguntas sobre posicionamento, marketing, IA, gestão e vendas. No final, você verá a fase atual do negócio e a prioridade mais urgente.</p>
          <ul className="feature-list">
            <li><span className="dot"></span> Sua pontuação em cinco áreas da operação</li>
            <li><span className="dot"></span> A fase atual da empresa: sobrevivência, estruturação, escala ou expansão</li>
            <li><span className="dot"></span> A área que merece atenção primeiro</li>
          </ul>
          <button className="btn btn-primary btn-block" onClick={startQuiz}>Começar o diagnóstico</button>
          <p className="meta-line">Leva cerca de 5 minutos. Você informa seus dados apenas no final.</p>
        </section>

        <section id="screen-quiz" className={`screen ${screen === 'quiz' ? 'active' : ''}`}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(idx / FLAT.length) * 100}%` }}></div>
          </div>
          <div className="pillar-tag">
            <span className="dot"></span>
            <span>{FLAT[idx]?.pillarLabel}</span>
            <span id="question-count">{idx + 1} / {FLAT.length}</span>
          </div>
          <h2 className="question-text">{FLAT[idx]?.text}</h2>
          <div className="options">
            {FLAT[idx]?.options.map((opt, i) => (
              <button 
                key={i} 
                className={`option ${answers[idx] === i ? 'selected' : ''}`} 
                onClick={() => selectOption(i)}
              >
                {opt.text}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" id="quiz-back" onClick={goBack}>Voltar</button>
        </section>

        <section id="screen-loading" className={`screen ${screen === 'loading' ? 'active' : ''}`}>
          <div className="spinner"></div>
          <div id="loading-text">Organizando suas respostas…</div>
        </section>

        <section id="screen-results" className={`screen ${screen === 'results' ? 'active' : ''}`}>
          {scoreData && (
            <>
              <div className="score-block">
                <div className="score-number" ref={scoreRef}>0<span className="score-suffix">/100</span></div>
                <div className="stage-badge">{scoreData.stageName}</div>
                <p className="score-sub">{scoreData.sub}</p>
              </div>

              <div className="lock-wrap">
                <div className={!isUnlocked ? "lock-blur" : ""}>
                  {scoreData.percents.map(p => (
                    <div className="pillar-row" key={p.key}>
                      <div className="pillar-name">{p.label}</div>
                      <div className="pillar-bar-track">
                        <div className="pillar-bar-fill" style={{ width: isUnlocked ? `${p.pct}%` : '0%' }}></div>
                      </div>
                      <div className="pillar-pct">{p.pct}%</div>
                    </div>
                  ))}
                </div>
                {!isUnlocked && (
                  <div className="lock-overlay">
                    <p>Suas respostas já mostram a prioridade da empresa. Informe seus dados para ver a leitura completa.</p>
                  </div>
                )}
              </div>

              {!isUnlocked ? (
                <form id="lead-form" onSubmit={submitLead}>
                  <label htmlFor="f-name">Nome</label>
                  <input id="f-name" type="text" placeholder="Seu nome" required value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} />
                  <label htmlFor="f-whats">WhatsApp</label>
                  <input id="f-whats" type="tel" placeholder="(42) 90000-0000" required value={leadForm.whats} onChange={e => setLeadForm({ ...leadForm, whats: e.target.value })} />
                  <label htmlFor="f-email">E-mail (opcional)</label>
                  <input id="f-email" type="email" placeholder="voce@empresa.com.br" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} />
                  <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '6px' }}>Ver a leitura completa</button>
                </form>
              ) : (
                <div id="unlocked-content">
                  <div id="recommendation-block">
                    <h3>Prioridade principal: {scoreData.weakest.label}</h3>
                    <p>{PILLARS.find(p => p.key === scoreData.weakest.key)?.recommendation}</p>
                  </div>
                  <div id="final-cta">
                    <p className="confirm">A leitura completa também foi enviada para o seu WhatsApp.</p>
                    <a href={getWhatsappLink()} className="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Quero conversar sobre o resultado</a>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
