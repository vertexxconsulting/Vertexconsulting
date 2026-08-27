# Landing Page — Alexandre Azeredo

Esta pasta contém a implementação da landing page premium de **Alexandre Azeredo**, Mentor Executivo e CIO Advisor.

## Estrutura

- `client/`: front-end React, TypeScript e Tailwind CSS;
- `server/` e `shared/`: arquivos de compatibilidade do template estático;
- `assets/`: cópias dos assets de origem usados na composição visual;
- `package.json`: comandos de desenvolvimento, tipagem e build.

## Executar localmente

```bash
cd alexandreazeredo
pnpm install
pnpm dev
```

Para validar o projeto, execute `pnpm check` e `pnpm build`.

## Observações

A versão publicada no ambiente WebDev utiliza URLs `/manus-storage/` para os assets, conforme a recomendação da plataforma. As cópias originais estão na pasta `assets/` para reenvio em outro ambiente de hospedagem.

As integrações de Calendly, CRM e Google Analytics estão preparadas como pontos de extensão na interface e nos comentários do código, aguardando as credenciais e os IDs reais.
