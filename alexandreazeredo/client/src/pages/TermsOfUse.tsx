import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

const sections = [
  {
    title: "1. Escopo",
    body: [
      "Estes Termos de Uso regulam o acesso e a utilização do site de Alexandre Azeredo, incluindo seus conteúdos, materiais, formulários e canais de contato. Ao navegar pelo site, você declara que leu e compreendeu este documento.",
      "O site apresenta informações sobre mentoria executiva, advisory e conteúdos relacionados a carreira, tecnologia, estratégia e negócios. O conteúdo é informativo e não constitui promessa de resultado, oferta de emprego, consultoria jurídica, financeira ou qualquer garantia de promoção profissional.",
    ],
  },
  {
    title: "2. Uso adequado do site",
    body: [
      "Você se compromete a utilizar o site de forma legítima, respeitosa e compatível com a legislação brasileira. Não é permitido tentar obter acesso não autorizado, introduzir códigos maliciosos, interferir no funcionamento do site ou utilizar os canais de contato para envio de conteúdo ilícito, fraudulento ou abusivo.",
      "As informações fornecidas no formulário devem ser verdadeiras, atuais e pertencentes ao próprio usuário ou compartilhadas com autorização para essa finalidade.",
    ],
  },
  {
    title: "3. Conversas e contatos",
    body: [
      "O formulário de contato organiza as informações fornecidas por você e prepara uma mensagem para abertura do WhatsApp. A abertura do aplicativo ou do WhatsApp Web depende do dispositivo, navegador e disponibilidade do serviço de terceiros.",
      "O envio do formulário não garante o agendamento de uma reunião. Cada solicitação será analisada conforme disponibilidade, aderência ao trabalho e possibilidade de retorno. O prazo estimado de resposta informado no site é uma referência, não uma obrigação de atendimento.",
    ],
  },
  {
    title: "4. Propriedade intelectual",
    body: [
      "Textos, marcas, logotipos, fotografias, elementos visuais, estrutura e demais materiais do site são protegidos pela legislação aplicável e pertencem a Alexandre Azeredo ou a seus respectivos titulares. O acesso ao site não transfere qualquer direito de propriedade intelectual.",
      "É permitido visualizar e compartilhar links para as páginas do site para fins pessoais e informativos, desde que a autoria seja preservada. A reprodução, adaptação, distribuição comercial ou utilização da identidade visual depende de autorização prévia por escrito.",
    ],
  },
  {
    title: "5. Links e serviços de terceiros",
    body: [
      "O site pode apresentar links para plataformas externas, como LinkedIn, YouTube, Instagram, WhatsApp e ferramentas de agendamento. Esses serviços possuem seus próprios termos, políticas e práticas de privacidade. Alexandre Azeredo não controla nem se responsabiliza pelo conteúdo, disponibilidade ou tratamento de dados realizado por terceiros.",
    ],
  },
  {
    title: "6. Disponibilidade e limitações",
    body: [
      "São adotadas medidas razoáveis para manter o site disponível e atualizado, mas não é possível garantir funcionamento contínuo, ausência de erros ou compatibilidade com todos os dispositivos. O site pode ser alterado, suspenso ou descontinuado, total ou parcialmente, sem aviso prévio quando necessário.",
      "Na extensão permitida pela lei, Alexandre Azeredo não será responsável por perdas decorrentes de indisponibilidade de serviços externos, falhas de conexão, decisões tomadas exclusivamente com base em conteúdo informativo ou uso inadequado do site.",
    ],
  },
  {
    title: "7. Atualizações destes termos",
    body: [
      "Estes Termos de Uso podem ser atualizados para refletir mudanças no site, nos serviços ou na legislação. A versão vigente será sempre a publicada nesta página. A data de atualização indicada no topo ajuda a identificar a versão consultada.",
    ],
  },
  {
    title: "8. Contato e legislação",
    body: [
      "Dúvidas sobre estes Termos de Uso podem ser encaminhadas para contato@alexandreazeredo.com.br. Este documento é interpretado de acordo com a legislação brasileira, observadas as regras de competência previstas na legislação aplicável.",
    ],
  },
];

export default function TermsOfUse() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="container legal-header-inner">
          <Link className="legal-brand" href="/" aria-label="Alexandre Azeredo — voltar ao início">
            <span className="legal-brand-mark">AA</span>
            <span><strong>Alexandre Azeredo</strong><small>Mentor Executivo · CIO Advisor</small></span>
          </Link>
          <Link className="legal-back" href="/"><ArrowLeft size={15} aria-hidden="true" /> Voltar ao site</Link>
        </div>
      </header>

      <main className="legal-main">
        <div className="container legal-layout">
          <aside className="legal-aside">
            <p className="legal-kicker">Documentos do site</p>
            <nav aria-label="Documentos legais">
              <Link className="legal-nav-link legal-nav-link-active" href="/termos-de-uso">Termos de Uso <ArrowUpRight size={14} aria-hidden="true" /></Link>
              <Link className="legal-nav-link" href="/politica-de-privacidade">Política de Privacidade <ArrowUpRight size={14} aria-hidden="true" /></Link>
            </nav>
          </aside>

          <article className="legal-content">
            <p className="eyebrow"><span className="eyebrow-line" /> Termos e condições</p>
            <h1>Termos de <em>Uso.</em></h1>
            <p className="legal-lead">As regras que orientam o acesso ao site, o uso dos conteúdos e o contato com Alexandre Azeredo.</p>
            <div className="legal-meta"><span>Última atualização</span><strong>27 de agosto de 2026</strong></div>

            <div className="legal-sections">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>
              ))}
            </div>

            <div className="legal-footer-cta">
              <p>Quer voltar para a experiência principal?</p>
              <Link className="button button-dark" href="/">Voltar ao site <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

export { sections as termsSections };
