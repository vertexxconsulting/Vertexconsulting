import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

const sections = [
  {
    title: "1. Quem trata os dados",
    body: [
      "Esta Política de Privacidade explica como Alexandre Azeredo trata dados pessoais coletados por meio deste site e de seus canais de contato. Para dúvidas ou solicitações relacionadas a dados pessoais, escreva para contato@alexandreazeredo.com.br.",
      "O tratamento observa a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) e os princípios de finalidade, adequação, necessidade, transparência, segurança e prevenção.",
    ],
  },
  {
    title: "2. Dados que podem ser coletados",
    body: [
      "Quando você preenche o formulário de contato, podem ser coletados nome completo, e-mail corporativo, endereço de perfil no LinkedIn, momento profissional, habilidade que deseja desenvolver, objetivo principal e descrição opcional do desafio atual.",
      "Também podem ser registrados dados técnicos básicos necessários à segurança e ao funcionamento do site, como endereço IP, tipo de dispositivo, navegador, data e horário de acesso. O site não solicita dados sensíveis, documentos de identificação, informações financeiras ou credenciais de acesso.",
    ],
  },
  {
    title: "3. Para que os dados são utilizados",
    body: [
      "Os dados do formulário são utilizados para compreender o contexto profissional informado, avaliar a aderência a uma conversa inicial, responder ao contato e organizar uma mensagem de atendimento no WhatsApp, conforme solicitado pelo próprio usuário.",
      "Dados técnicos podem ser utilizados para manter a segurança, prevenir abuso, corrigir falhas e compreender o funcionamento geral do site. Não realizamos decisões automatizadas que produzam efeitos jurídicos ou semelhantes sobre o usuário.",
    ],
  },
  {
    title: "4. Base legal e consentimento",
    body: [
      "A base legal aplicável pode variar conforme a finalidade. O envio do formulário depende do consentimento para o tratamento das informações fornecidas e para a preparação da mensagem de contato. O aceite dos Termos de Uso e desta Política é registrado como parte do envio.",
      "Você pode retirar o consentimento a qualquer momento, sem comprometer os tratamentos realizados anteriormente. A retirada pode limitar a capacidade de responder ou dar continuidade a uma solicitação que dependa dessas informações.",
    ],
  },
  {
    title: "5. Compartilhamento com terceiros",
    body: [
      "Ao clicar no botão de envio, os dados preenchidos são organizados em uma mensagem e encaminhados à página de compartilhamento do WhatsApp para que você decida se deseja abrir o aplicativo ou o WhatsApp Web. O WhatsApp é um serviço independente, sujeito aos próprios termos e à própria política de privacidade.",
      "Não vendemos dados pessoais. O compartilhamento pode ocorrer com fornecedores técnicos estritamente necessários à hospedagem, segurança e funcionamento do site, sempre limitado à finalidade contratada e às medidas de proteção aplicáveis.",
    ],
  },
  {
    title: "6. Retenção e segurança",
    body: [
      "Os dados são mantidos pelo tempo necessário para cumprir as finalidades informadas, atender solicitações, cumprir obrigações legais ou exercer direitos. Quando não houver mais necessidade legítima de retenção, os dados poderão ser excluídos ou anonimizados.",
      "São adotadas medidas técnicas e administrativas razoáveis para proteger os dados contra acesso não autorizado, perda, alteração ou divulgação indevida. Nenhum ambiente conectado à internet é completamente imune a riscos.",
    ],
  },
  {
    title: "7. Seus direitos",
    body: [
      "Nos termos da legislação aplicável, você pode solicitar confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade quando regulamentada, informação sobre compartilhamentos e revisão de decisões automatizadas, quando aplicável.",
      "Para exercer seus direitos, envie uma solicitação para contato@alexandreazeredo.com.br com detalhes suficientes para localizar o pedido. Poderemos solicitar informações adicionais para confirmar a identidade e proteger os dados contra solicitações indevidas.",
    ],
  },
  {
    title: "8. Cookies e tecnologias semelhantes",
    body: [
      "O site pode utilizar recursos técnicos essenciais para carregar páginas, manter preferências e proteger a navegação. Também pode utilizar ferramentas de métricas agregadas e anônimas para avaliar o desempenho do site, quando essas ferramentas estiverem habilitadas no ambiente de publicação.",
      "Você pode configurar o navegador para bloquear ou excluir cookies, mas algumas funções podem deixar de funcionar como esperado.",
    ],
  },
  {
    title: "9. Crianças e adolescentes",
    body: [
      "O site é direcionado a profissionais e líderes de tecnologia e não é destinado a crianças. Se você entender que um menor forneceu dados pessoais sem a autorização adequada, entre em contato para que possamos avaliar e tomar as medidas cabíveis.",
    ],
  },
  {
    title: "10. Atualizações desta política",
    body: [
      "Esta Política de Privacidade pode ser atualizada para refletir mudanças no site, nos serviços ou na legislação. A versão vigente será sempre a publicada nesta página, identificada pela data de atualização no topo.",
    ],
  },
];

export default function PrivacyPolicy() {
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
              <Link className="legal-nav-link" href="/termos-de-uso">Termos de Uso <ArrowUpRight size={14} aria-hidden="true" /></Link>
              <Link className="legal-nav-link legal-nav-link-active" href="/politica-de-privacidade">Política de Privacidade <ArrowUpRight size={14} aria-hidden="true" /></Link>
            </nav>
          </aside>

          <article className="legal-content">
            <p className="eyebrow"><span className="eyebrow-line" /> Proteção de dados</p>
            <h1>Política de <em>Privacidade.</em></h1>
            <p className="legal-lead">Transparência sobre os dados coletados, suas finalidades e os direitos de quem utiliza este site.</p>
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

export { sections as privacySections };
