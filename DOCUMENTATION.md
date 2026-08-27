# Vertex Consulting — Sistema CRM e Landing Page

Este documento serve como **Registro Técnico Oficial** do sistema construído para a Vertex Consulting. Ele documenta a arquitetura, as integrações e as tecnologias usadas, devendo ser consultado por desenvolvedores ou assistentes de IA (LLMs) em manutenções futuras.

## 1. Visão Geral do Sistema

O sistema é um monorepo que engloba duas partes principais unificadas na mesma aplicação React (Vite):
1. **Landing Page:** Site institucional de alta performance (focado em conversão e SEO).
2. **Painel CRM (`/crm`):** Sistema interno de acompanhamento de Leads e sincronização com o CRM externo Bolten; o chatbot e o atendimento WhatsApp ficam no Bolten.

## 2. Tecnologias e Stack (Frontend)

- **Framework:** React 19
- **Build Tool:** Vite
- **Linguagem:** TypeScript (`strict: true`)
- **Roteamento:** `react-router-dom` (Páginas independentes para `/` e `/crm`)
- **Estilização:** CSS Vanilla (`src/index.css`, `src/pages/*.css`).
  - *Padrão de Design:* "Neo Kinpaku" (Impeccable), caracterizado por tons escuros (`lacquer black`), bordas extremamente finas e acentos na cor principal da marca (Dourado - `#c9a84c`). Ausência de ícones decorativos ou emojis.

## 3. Integração 1: Banco de Dados (Supabase)

O armazenamento dos leads (contatos) é feito exclusivamente no [Supabase](https://supabase.com).

- **Arquivo de configuração:** `src/services/supabaseClient.ts`
- **Tabela:** `contacts`
- **Variáveis de Ambiente Necessárias (`.env`):**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Estrutura da Tabela `contacts` (PostgreSQL)
- `id` (uuid, primary key)
- `name` (text)
- `email` (text)
- `phone` (text)
- `company` (text, opcional)
- `service` (text)
- `message` (text)
- `status` (text) — Ex: 'Novo', 'Em contato', 'Apresentação', 'Negociação', 'Fechado Ganho', 'Fechado Perdido'.
- `priority` (text) — 'Baixa', 'Média', 'Alta'.
- `notes` (text, para uso interno do CRM)
- `whatsapp_sent` (boolean, default: false)
- `created_at` (timestamptz)
- `bolten_contact_id` / `bolten_opportunity_id` (uuid, identificadores do espelho externo)
- `bolten_status` (text, último estágio recebido do Bolten)
- `bolten_sync_status` (text: `pending`, `synced` ou `error`)
- `bolten_sync_error` (text, diagnóstico da última falha)
- `bolten_last_synced_at` (timestamptz)

### Regras de Negócio do Supabase
Toda vez que o usuário preenche o formulário na Landing Page, o serviço `createContact` (em `src/services/contactService.ts`) insere a linha com o status inicial `"Novo"` e `bolten_sync_status = "pending"`. O endpoint server-side pode então atualizar os identificadores externos sem depender de `UPDATE` anônimo.

### Integração 2: CRM externo Bolten

O espelho do CRM externo usa a API Beta do Bolten no endpoint privado `api/bolten.js` e o webhook `api/bolten-webhook.js`.

- **Variáveis privadas do servidor/Vercel:** `BOLTEN_API_KEY`, `BOLTEN_CONTACT_COMPONENT_ID`, `BOLTEN_KANBAN_COMPONENT_ID`, `BOLTEN_WEBHOOK_SECRET` e `SUPABASE_SERVICE_ROLE_KEY`. Se o funil usar nomes diferentes dos oficiais, configure também `BOLTEN_STATUS_NEW`, `BOLTEN_STATUS_IN_PROGRESS` e `BOLTEN_STATUS_DONE`.
- **Variáveis públicas do navegador:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_BOLTEN_WHATSAPP_NUMBER` ou `VITE_BOLTEN_WHATSAPP_LINK`. A chave Bolten nunca deve começar com `VITE_`; ela é consumida somente no servidor.
- **Variável de gatilho do chatbot:** `VITE_BOLTEN_WHATSAPP_NUMBER` (número do WhatsApp conectado ao Bolten, ex: `5511999999999`) ou `VITE_BOLTEN_WHATSAPP_LINK` (link oficial copiado da área de Ações do Bolten). O link do site preenche a mensagem: `Olá! Vim pelo site da Vertex e gostaria de entender como a consultoria pode ajudar o meu negócio.`
- **Saída:** o lead é criado como contato e oportunidade, vinculado no funil e registrado localmente como `synced`; se algo falhar, o registro local fica com `error` e pode ser reenviado pelo detalhe do contato.
- **Entrada:** configure no Bolten o webhook para `POST /api/bolten-webhook` com autenticação `X-API-KEY`. Eventos `opportunity.created`, `opportunity.transitioned`, `opportunity.won` e `opportunity.lost` atualizam ou criam o lead localmente.
- **Idempotência:** cada `event_id` recebido é gravado em `bolten_webhook_events`, evitando duplicidade quando o Bolten repetir a entrega.

---

## 4. Integração 3: Mensageria Opcional (Evolution API)

O disparo de mensagens via WhatsApp não utiliza APIs fechadas comerciais. Ele utiliza o servidor open-source da **Evolution API**, conectado via Baileys (QR Code).

- **Arquivo de configuração:** `src/services/evolutionApi.ts`
- **Como a configuração é armazenada:** Atualmente via `localStorage` na máquina de quem usa o CRM (aba *Configurações*). A chave Bolten não é armazenada no navegador; o dono da agência cadastra na Vercel as variáveis privadas descritas acima. Para a Evolution, o dono cadastra:
  - `apiUrl` (Ex: `https://api.seudominio.com`)
  - `apiKey` (Chave configurada no servidor Evolution)
  - `instanceName` (Ex: `vertex-consulting`)
  - `messageTemplate` (template da mensageria Evolution legada; não é usado pelo site atual)

### Escopo atual da Evolution

O site **não dispara mensagens pela Evolution**. Quando o formulário é enviado, o site grava o lead no Supabase e cria a oportunidade no Bolten; o chatbot e as mensagens de atendimento devem ser configurados no próprio Bolten. A navegação do `/crm` também não expõe mais Evolution ou Conversas; os arquivos legados foram mantidos no repositório apenas para histórico e eventual migração.

### Fluxo legado de Conexão WhatsApp
Os arquivos antigos da aba **WhatsApp** não são expostos na navegação atual do `/crm`. Se forem reativados em uma instalação legada, eles permitem:
1. `POST /instance/create` — Cria a instância no servidor da Evolution API.
2. `GET /instance/connect/{instanceName}` — Busca o payload do QRCode Base64.
3. A imagem do QR Code é renderizada nativamente para o usuário escanear com o celular da Vertex Consulting.
4. `GET /instance/connectionState/{instanceName}` — Polling para verificar se conectou (estado `open` ou `close`).

---

## 5. Estrutura de Pastas e Componentes

```text
/src
  /assets         # Imagens estáticas locais
  /components
    /crm          # Módulos restritos ao painel do CRM
      - Contacts.tsx      (Lista de leads e modal de edição)
      - Dashboard.tsx     (Visão geral, KPIs e Leads recentes)
      - Settings.tsx      (Ponto reservado para configurações do CRM)
      - Sidebar.tsx       (Menu lateral customizado)
      - WhatsAppPanel.tsx (Legado, não exposto na navegação atual)
  /pages
    - LandingPage.tsx / .css (Apresentação, Form)
    - CRMApp.tsx / .css      (Controlador do layout do CRM)
  /services
    - contactService.ts  (CRUD do Supabase)
    - evolutionApi.ts    (Mensageria legada, não usada pelo site)
    - supabaseClient.ts  (Credenciais Supabase)
  types.ts            # Tipagens globais e Definições estritas do TS
  main.tsx            # Entry point
  App.tsx             # React Router ( / e /crm )
```

## 6. Comandos e Manutenção

**Como rodar em desenvolvimento:**
```bash
npm install
npm run dev
```

**Testes de regressão:**
```bash
npm test
```

**Como buildar para produção (Vercel/Netlify/Hostinger):**
```bash
npm run build
```

**Comandos TypeScript:**
Para checar erros de tipagem rigorosos do `erasableSyntaxOnly`:
```bash
npx tsc -b
```

## 7. Instruções Futuras para LLMs / Agentes de IA

Se você (um LLM) for realizar manutenções neste sistema no futuro, siga estas diretrizes:
- **Design:** Não introduza frameworks de CSS (Tailwind, Bootstrap). Use as variáveis já existentes em `index.css`. Mantenha a estética escura e limpa. Não use Emojis.
- **Tipagem:** O `types.ts` usa objetos literais combinados com tipos (`as const`) para simular `enums` e contornar erros de sintaxe apagável do Vite. Ao adicionar novos Status de Contato, atualize em ambos.
- **Gatilho do chatbot:** O site usa `VITE_BOLTEN_WHATSAPP_NUMBER` ou `VITE_BOLTEN_WHATSAPP_LINK` para abrir o WhatsApp do Bolten com a frase de origem já preenchida; não dispara mensagens diretamente por uma API de WhatsApp.
- **Tratamento de Chaves:** Nunca faça hardcode de chaves e URLs sensíveis diretamente no componente. Utilize `.env` para Supabase e as variáveis privadas da Vercel para o Bolten. A chave Bolten é consumida somente por `api/bolten.js` e `api/bolten-webhook.js`.
