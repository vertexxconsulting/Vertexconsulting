import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './Diagnostico.css';

const WHATSAPP_NUMBER = "5542900000000";

const PILLARS = [
  {
    key: "posicionamento", label: "Posicionamento",
    recommendation: "Seu diagnóstico aponta o posicionamento como prioridade: construir uma mensagem clara sobre quem você atende e por que escolheriam você muda a forma como sua empresa é percebida antes mesmo da comparação de preço.",
    questions: [
      { text: "Quando alguém pergunta o que sua empresa faz, você consegue responder em uma frase clara, sem enrolação?", options: [ { text: "Sim, sempre", score: 3 }, { text: "Às vezes, depende de quem pergunta", score: 2 }, { text: "Não, é difícil resumir", score: 1 } ] },
      { text: "Seus clientes ideais conseguem dizer por que escolheriam você e não um concorrente?", options: [ { text: "Sim, temos um diferencial claro", score: 3 }, { text: "Mais ou menos, não é tão evidente", score: 2 }, { text: "Não sabemos dizer", score: 1 } ] },
      { text: "Sua marca (visual, tom de voz, mensagem) é a mesma em todos os canais onde você aparece?", options: [ { text: "Sim, é consistente", score: 3 }, { text: "Parcialmente", score: 2 }, { text: "Cada canal fala uma coisa diferente", score: 1 } ] }
    ]
  },
  {
    key: "marketing", label: "Marketing",
    recommendation: "O gargalo está na geração de demanda. Uma estratégia de marketing recorrente evita que o crescimento da empresa dependa só de indicação — e traz previsibilidade para o caixa.",
    questions: [
      { text: "Sua empresa gera novos contatos de clientes em potencial toda semana, sem depender só de indicação?", options: [ { text: "Sim, temos um processo ativo", score: 3 }, { text: "De vez em quando", score: 2 }, { text: "Não, dependemos de indicação", score: 1 } ] },
      { text: "Você sabe quanto custa, em média, conquistar um novo cliente?", options: [ { text: "Sim, acompanhamos esse número", score: 3 }, { text: "Tenho uma ideia aproximada", score: 2 }, { text: "Não faço ideia", score: 1 } ] },
      { text: "Suas redes sociais e site geram alguma conversa ou contato real com potenciais clientes?", options: [ { text: "Sim, regularmente", score: 3 }, { text: "Raramente", score: 2 }, { text: "Praticamente nunca", score: 1 } ] }
    ]
  },
  {
    key: "ia", label: "Inteligência Artificial",
    recommendation: "Há uma oportunidade grande de ganhar tempo e reduzir custo operacional aplicando IA nos processos do dia a dia — atendimento, conteúdo e análise de dados podem rodar com muito menos esforço manual.",
    questions: [
      { text: "Sua empresa usa alguma ferramenta de IA para ganhar tempo (atendimento, conteúdo, análise de dados)?", options: [ { text: "Sim, já faz parte da rotina", score: 3 }, { text: "Usamos pontualmente", score: 2 }, { text: "Nunca usamos", score: 1 } ] },
      { text: "Se você tirasse uma semana de férias, os processos que dependem de IA ou automação continuariam rodando sozinhos?", options: [ { text: "Sim, está tudo automatizado", score: 3 }, { text: "Uma parte sim", score: 2 }, { text: "Não, tudo depende de mim ou da equipe", score: 1 } ] },
      { text: "Você sente que está atualizado sobre como a IA pode ser aplicada no seu tipo de negócio?", options: [ { text: "Sim, me atualizo com frequência", score: 3 }, { text: "Sei o básico", score: 2 }, { text: "Não tenho tempo pra isso", score: 1 } ] }
    ]
  },
  {
    key: "gestao", label: "Gestão",
    recommendation: "Sua operação ainda depende demais de você. Estruturar processos e indicadores simples libera seu tempo — e sua cabeça — para pensar em crescimento, não só em apagar incêndio.",
    questions: [
      { text: "Você consegue ver, em poucos minutos, os principais números do seu negócio (faturamento, custos, margem)?", options: [ { text: "Sim, tenho isso organizado", score: 3 }, { text: "Consigo, mas com esforço", score: 2 }, { text: "Não, fica tudo espalhado", score: 1 } ] },
      { text: "Sua equipe sabe exatamente o que precisa entregar e até quando, sem precisar te perguntar toda hora?", options: [ { text: "Sim, os processos são claros", score: 3 }, { text: "Parcialmente", score: 2 }, { text: "Não, tudo passa por mim", score: 1 } ] },
      { text: "Se você se afastasse por um mês, a empresa manteria o ritmo?", options: [ { text: "Sim, tranquilamente", score: 3 }, { text: "Com dificuldade", score: 2 }, { text: "Não, tudo pararia", score: 1 } ] }
    ]
  },
  {
    key: "vendas", label: "Vendas",
    recommendation: "Formalizar um processo comercial — com etapas e argumentos claros para lidar com objeção de preço — tende a aumentar sua taxa de fechamento sem precisar recorrer a desconto.",
    questions: [
      { text: "Sua empresa tem um processo definido de vendas, com etapas claras do primeiro contato até o fechamento?", options: [ { text: "Sim, bem definido", score: 3 }, { text: "Existe, mas informal", score: 2 }, { text: "Cada venda acontece do seu jeito", score: 1 } ] },
      { text: "Você sabe, hoje, quantos contatos viram cliente (sua taxa de conversão)?", options: [ { text: "Sim, acompanho esse número", score: 3 }, { text: "Tenho uma noção", score: 2 }, { text: "Não sei dizer", score: 1 } ] },
      { text: "Sua equipe (ou você) sabe lidar com objeções de preço sem precisar dar desconto?", options: [ { text: "Sim, temos argumentos sólidos", score: 3 }, { text: "Às vezes funciona", score: 2 }, { text: "Geralmente cedemos no preço", score: 1 } ] }
    ]
  }
];

const STAGES = [
  { max: 40, name: "Fase de Sobrevivência", sub: "O foco agora é parar de apagar incêndio e criar uma base mínima que sustente o crescimento." },
  { max: 65, name: "Fase de Estruturação", sub: "A base existe, mas ainda depende demais de esforço manual e de uma pessoa só." },
  { max: 85, name: "Fase de Escala", sub: "Sua empresa já cresce — o desafio agora é crescer sem perder margem nem qualidade." },
  { max: 100, name: "Fase de Expansão", sub: "Sua empresa está pronta para mirar em novos mercados, produtos ou operações." }
];

const FLAT = PILLARS.flatMap(p => p.questions.map(q => ({ pillarKey: p.key, pillarLabel: p.label, ...q })));

export default function Diagnostico() {
  const location = useLocation();
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
      <div id="app">
        <div className="brand">
          <div className="brand-mark"></div>
          <div className="brand-name">VERTEX <span>CONSULTING</span></div>
        </div>

        <section id="screen-intro" className={`screen ${screen === 'intro' ? 'active' : ''}`}>
          <h1>O que está travando o crescimento da sua empresa?</h1>
          <p className="lead">Responda 15 perguntas rápidas sobre posicionamento, marketing, IA, gestão e vendas e descubra em que fase seu negócio está — e o que fazer primeiro.</p>
          <ul className="feature-list">
            <li><span className="dot"></span> Sua pontuação em 5 pilares de crescimento</li>
            <li><span className="dot"></span> A fase atual da sua empresa: Sobrevivência, Estruturação, Escala ou Expansão</li>
            <li><span className="dot"></span> A prioridade número 1 para destravar o próximo nível</li>
          </ul>
          <button className="btn btn-primary btn-block" onClick={startQuiz}>Começar diagnóstico</button>
          <p className="meta-line">Leva cerca de 5 minutos. Sem cadastro até o final.</p>
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
          <div id="loading-text">Calculando seu diagnóstico…</div>
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
                    <p>Seu raio-x completo por pilar — e a prioridade número 1 para sua empresa — está pronto.</p>
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
                  <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '6px' }}>Ver meu diagnóstico completo</button>
                </form>
              ) : (
                <div id="unlocked-content">
                  <div id="recommendation-block">
                    <h3>Prioridade número 1: {scoreData.weakest.label}</h3>
                    <p>{PILLARS.find(p => p.key === scoreData.weakest.key)?.recommendation}</p>
                  </div>
                  <div id="final-cta">
                    <p className="confirm">Prontinho — seu diagnóstico completo também foi enviado para o seu WhatsApp.</p>
                    <a href={getWhatsappLink()} className="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Agendar minha Sessão Estratégica</a>
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
