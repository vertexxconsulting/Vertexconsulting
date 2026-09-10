# Funil Vertex: diagnóstico com expectativa e intenção de reunião

## Objetivo

Transformar o formulário institucional em uma entrada qualificada para o funil comercial. O lead não recebe o diagnóstico imediatamente. Primeiro ele deixa o contexto do negócio, entra no CRM e aguarda uma mensagem de acompanhamento. Depois recebe o link do diagnóstico oculto, entende como preenchê-lo e, ao concluir, é direcionado para chamar no WhatsApp e solicitar uma reunião estratégica.

## Fluxo proposto

| Etapa | Experiência do lead | Ação do sistema | Resultado comercial |
|---|---|---|---|
| 1. Contexto | O lead preenche o formulário da landing page | Grava o contato, cria a oportunidade e agenda o convite do diagnóstico para 20 minutos depois | A Vertex recebe contexto antes da conversa |
| 2. Expectativa | O lead vê uma confirmação informando que receberá uma próxima mensagem | O worker de mensagens busca convites vencidos e envia o texto pelo WhatsApp conectado à Evolution API | O lead aguarda uma entrega prometida, em vez de receber tudo de uma vez |
| 3. Convite | O lead recebe instrução curta e um link individual para `/diagnostico?token=...` | O link é montado com o token armazenado no contato | O diagnóstico passa a ser uma etapa guiada do relacionamento |
| 4. Diagnóstico | O lead responde às 15 perguntas sobre posicionamento, marketing, IA, gestão e vendas | O resultado é gravado em `leads`, com pontuação por pilar e estágio do negócio | A Vertex sabe qual problema deve ser priorizado |
| 5. Intenção | O lead vê a prioridade número 1 e uma chamada para agendar | O CTA abre o WhatsApp `5542998250506` com score, estágio e prioridade na mensagem | A conversa começa com contexto e intenção explícita |
| 6. Reunião | O lead informa que concluiu e quer marcar | O time consulta o contato, o diagnóstico e a recomendação antes de responder | Menos descoberta superficial e maior velocidade de qualificação |

## Mensagem de expectativa

> Recebemos seu contexto. Agora vamos preparar uma leitura mais precisa do seu negócio. Em alguns minutos você receberá no WhatsApp um diagnóstico rápido, com as instruções para responder. A ideia é que você veja onde está o gargalo antes da nossa próxima conversa.

## Mensagem do convite

> Seu diagnóstico está pronto. Responda as 15 perguntas com base na realidade de hoje — não no que você gostaria que estivesse acontecendo. No final, você verá a prioridade que mais pode destravar o próximo nível da sua empresa: [acessar diagnóstico]

## Mensagem do CTA final

> Olá! Concluí meu diagnóstico Vertex. Minha pontuação foi {score}/100, estou na {estágio} e minha prioridade apareceu como {prioridade}. Gostaria de agendar uma Sessão Estratégica.

## Regras de operação

O atraso padrão foi definido em **20 minutos** para gerar expectativa sem parecer abandono. Esse valor deve ser ajustado no backend caso a operação prefira outra janela. O disparo é idempotente: cada contato recebe no máximo um convite automático, controlado pelos campos `diagnostic_invite_sent` e `diagnostic_invite_sent_at`.

O diagnóstico continua acessível por URL direta para permitir a entrega individual, mas deixa de ser promovido como ação imediata na landing page. O CTA público “Fazer diagnóstico online” foi substituído por uma explicação de que o diagnóstico será enviado após o primeiro contato.

## Arquitetura implementada

A primeira etapa usa o cadastro existente em `contacts`, a criação de oportunidade no Bolten e um novo agendamento no próprio registro. Um endpoint serverless (`/api/diagnostic-invite`) processa convites vencidos e envia a mensagem pela Evolution API. O `vercel.json` agenda esse endpoint a cada cinco minutos.

A solução atual usa **WhatsApp**, porque é o canal já integrado ao repositório por meio da Evolution API. A ideia de Telegram pode ser adicionada depois trocando apenas o adaptador de mensageria e mantendo o mesmo estado do funil.

## Configuração necessária no deploy

O worker requer as variáveis server-side `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_EVOLUTION_API_URL`, `VITE_EVOLUTION_API_KEY` e `VITE_EVOLUTION_INSTANCE`. A chave `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no frontend.

Se o cron ainda não estiver habilitado no ambiente de deploy, o endpoint pode ser chamado por um agendador externo a cada cinco minutos. O importante é manter o processamento no servidor, e não em uma aba do navegador do usuário.

## Próximas melhorias

A próxima evolução recomendada é registrar eventos de entrega e resposta, marcar o diagnóstico como concluído no contato original por meio de um token seguro e adicionar uma visão no CRM com as colunas “Contexto recebido”, “Convite pendente”, “Diagnóstico concluído” e “Reunião solicitada”.
