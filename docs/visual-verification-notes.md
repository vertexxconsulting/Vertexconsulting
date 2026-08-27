# Notas de verificação visual

A landing page local renderizou corretamente após o fallback do cliente Supabase. A inspeção desktop confirmou que a paleta dourada sobre superfícies escuras e os backgrounds fotográficos existentes permanecem intactos. A nova grade de resultados e a timeline aparecem com hierarquia e contraste adequados depois das animações de entrada; a linha da timeline conecta os quatro marcadores sem cobrir os textos. O primeiro carregamento sem `VITE_SUPABASE_ANON_KEY` não impede mais a renderização pública.

A página ainda exibe `+0`, `0%` brevemente enquanto os contadores aguardam a entrada no viewport, comportamento esperado do contador progressivo; quando o bloco entra na área visível, os valores são animados para os números configurados.
