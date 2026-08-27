# Notas de integração com o Bolten

## Fontes oficiais consultadas

- [API do Bolten](https://bolten.gitbook.io/bolten-docs/en/advanced-settings/api)
- [Webhooks do Bolten](https://bolten.gitbook.io/bolten-docs/configuracoes-avancadas/webhooks.md)
- [Oportunidades](https://bolten.gitbook.io/bolten-docs/configuracoes-avancadas/api/opportunities.md)
- [Contatos](https://bolten.gitbook.io/bolten-docs/configuracoes-avancadas/api/contacts.md)

## Fatos relevantes

A API do Bolten usa uma chave no header `Authorization: Bearer ...`, trabalha com componentes identificados por `component_id` e possui estrutura dinâmica de atributos. Os endpoints oficiais documentados para contatos e oportunidades usam `POST` para criação e `PATCH` para atualização, com o corpo no formato `{ "attributes": { "Nome do campo": "valor" } }`. A documentação recomenda consultar o endpoint `/schema` porque campos inexistentes podem ser ignorados silenciosamente.

Os webhooks do Bolten estão em beta e enviam `POST` para uma URL configurada no projeto. A autenticação por API Key usa o header `X-API-KEY`. Os eventos de oportunidade documentados incluem `opportunity.created`, `opportunity.transitioned`, `opportunity.won` e `opportunity.lost`. A entrega é considerada bem-sucedida com qualquer status 2xx e o Bolten tenta reenviar até cinco vezes com backoff exponencial quando recebe erro. A própria documentação recomenda resposta rápida e tratamento idempotente de duplicatas.

O payload documentado coloca os atributos configurados diretamente em `data.opportunity` e os dados do contato vinculado em `data.opportunity.Contato`. O identificador do evento fica no campo raiz `id`; o identificador da oportunidade fica em `data.opportunity.id`.

## Decisões aplicadas

A chave Bolten não é mais lida pelo bundle do navegador: o frontend chama apenas `/api/bolten`, e o endpoint server-side usa as variáveis privadas `BOLTEN_API_KEY`, `BOLTEN_CONTACT_COMPONENT_ID` e `BOLTEN_KANBAN_COMPONENT_ID`. O webhook usa comparação em tempo constante para o `X-API-KEY`, registra o `event_id` em `bolten_webhook_events` e retorna erro 502 quando a sincronização falha, permitindo o retry do Bolten. Os registros locais passaram a guardar `bolten_sync_status`, `bolten_sync_error` e `bolten_last_synced_at`.
