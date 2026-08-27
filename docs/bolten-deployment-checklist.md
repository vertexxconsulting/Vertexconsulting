# Checklist de ativação do espelho Bolten

As migrações [20260827000000_bolten_sync_reliability.sql](../supabase/migrations/20260827000000_bolten_sync_reliability.sql), `20260827010000_bolten_webhook_claim.sql`, `20260827020000_harden_rpc_permissions.sql` e `20260827030000_revoke_public_rpc_execute.sql` já foram aplicadas no projeto Supabase `VertexConsulting`. Em outro ambiente, aplique-as na ordem apresentada antes do deploy.

Na Vercel, configure as variáveis privadas `BOLTEN_API_KEY`, `BOLTEN_CONTACT_COMPONENT_ID`, `BOLTEN_KANBAN_COMPONENT_ID`, `BOLTEN_WEBHOOK_SECRET` e `SUPABASE_SERVICE_ROLE_KEY`. Para o botão do site abrir o atendimento correto, configure também a variável pública `VITE_BOLTEN_WHATSAPP_NUMBER` com o número conectado ao Bolten. Mantenha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` como variáveis públicas do navegador relacionadas ao banco. Não publique a chave de API do Bolten com prefixo `VITE_`.

No projeto Bolten, crie um webhook para `https://SEU_DOMINIO/api/bolten-webhook`, use autenticação por API Key com o mesmo valor de `BOLTEN_WEBHOOK_SECRET` e selecione os eventos `opportunity.created`, `opportunity.transitioned`, `opportunity.won` e `opportunity.lost`. Depois, valide no log do webhook uma mudança de estágio e confirme que o contato local atualiza `status`, `bolten_status` e `bolten_last_synced_at`.

No primeiro lead real, confirme que o registro local inicia com `bolten_sync_status = pending`, passa para `synced` após a criação do contato/oportunidade e fica com os IDs `bolten_contact_id` e `bolten_opportunity_id`. Em caso de falha, o painel de contatos deve mostrar `Pendente` e permitir **Tentar novamente**.

A mensagem padrão enviada para ativar o chatbot é:

> Olá! Vim pelo site da Vertex e gostaria de entender como a consultoria pode ajudar o meu negócio.

Templates personalizados já salvos no navegador continuam preservados. O template legado conhecido é migrado automaticamente para o novo texto na primeira leitura.
