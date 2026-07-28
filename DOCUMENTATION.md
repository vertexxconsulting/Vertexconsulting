# Vertex Consulting — Sistema CRM e Landing Page

Este documento serve como **Registro Técnico Oficial** do sistema construído para a Vertex Consulting. Ele documenta a arquitetura, as integrações e as tecnologias usadas, devendo ser consultado por desenvolvedores ou assistentes de IA (LLMs) em manutenções futuras.

## 1. Visão Geral do Sistema

O sistema é um monorepo que engloba duas partes principais unificadas na mesma aplicação React (Vite):
1. **Landing Page:** Site institucional de alta performance (focado em conversão e SEO).
2. **Painel CRM (`/crm`):** Sistema de gestão de Leads e disparo automático/manual de mensagens via WhatsApp usando a Evolution API.

## 2. Tecnologias e Stack (Frontend)

- **Framework:** React 18
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

### Regras de Negócio do Supabase
Toda vez que o usuário preenche o formulário na Landing Page, o serviço `createContact` (em `src/services/contactService.ts`) insere a linha com o status inicial `"Novo"`.

---

## 4. Integração 2: Mensageria (Evolution API)

O disparo de mensagens via WhatsApp não utiliza APIs fechadas comerciais. Ele utiliza o servidor open-source da **Evolution API**, conectado via Baileys (QR Code).

- **Arquivo de configuração:** `src/services/evolutionApi.ts`
- **Como a configuração é armazenada:** Atualmente via `localStorage` na máquina de quem usa o CRM (aba *Configurações*). Assim, o dono da agência cadastra:
  - `apiUrl` (Ex: `https://api.seudominio.com`)
  - `apiKey` (Chave configurada no servidor Evolution)
  - `instanceName` (Ex: `vertex-consulting`)
  - `messageTemplate` (A mensagem enviada aos leads, permitindo a tag dinâmica `{nome}`)

### Fluxo de Disparo Automático (Landing Page)
1. Visitante preenche o form (com número X).
2. Supabase grava o lead.
3. Se houver telefone, o frontend dispara a API: `POST {apiUrl}/message/sendText/{instanceName}`.
4. Payload envia para o número do visitante (X) o texto de confirmação.
5. Em caso de sucesso, `whatsapp_sent` muda para `true` no banco.

### Fluxo de Conexão WhatsApp (CRM)
Na rota `/crm`, aba **WhatsApp**, a aplicação permite:
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
      - Settings.tsx      (Form de setup da Evolution API)
      - Sidebar.tsx       (Menu lateral customizado)
      - WhatsAppPanel.tsx (Controle do QR Code / Instância)
  /pages
    - LandingPage.tsx / .css (Apresentação, Form)
    - CRMApp.tsx / .css      (Controlador do layout do CRM)
  /services
    - contactService.ts  (CRUD do Supabase)
    - evolutionApi.ts    (EndPoints da mensageria)
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
- **Requisições:** A *Evolution API* é severa quanto à formatação do número de telefone. A função `sendTextMessage` já faz um parse removendo não numéricos e garantindo que comece com `55` (Brasil).
- **Tratamento de Chaves:** Nunca faça hardcode de chaves e URLS sensíveis diretamente no componente. Utilize o sistema de `.env` para Supabase, e `localStorage` (como feito no módulo Settings) para a URL dinâmica da API de WhatsApp.
