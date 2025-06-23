# Diretrizes para Agentes de IA - Projeto Fulcrum

Bem-vindo(a) ao Projeto Fulcrum! Este documento fornece diretrizes e contexto para agentes de IA que trabalham neste codebase. Nosso objetivo é construir uma plataforma de compras empresariais de elite, e sua colaboração é fundamental.

## 1. Filosofia e Missão ("O Pensamento Jobs")

Nossa missão não é apenas criar um "sistema de compras". É desenvolver uma experiência de gestão tão **intuitiva, poderosa e esteticamente agradável** que os usuários não consigam imaginar voltar a trabalhar da forma antiga.

*   **Foco no Valor Real:** Cada funcionalidade, tela e interação deve ter um propósito claro, eliminando o supérfluo.
*   **Simplicidade Aparente, Complexidade Gerenciada:** A complexidade deve ser tratada nos bastidores, apresentando ao usuário uma interface de simplicidade e poder.
*   **Qualidade Inegociável:** Busque sempre a excelência técnica, código limpo, seguro, escalável e de fácil manutenção.

## 2. A Restrição Inabalável: O Ambiente de Hospedagem

A implantação inicial (e potencialmente por um tempo considerável) será em um **ambiente de hospedagem compartilhada com Kernel Linux 2.6.32 e MySQL 5.7 (ambos EOL)**. Esta é uma restrição crítica que molda muitas de nossas decisões técnicas.

*   **Mitigação de Riscos é Prioridade:** Dado o ambiente EOL, a segurança e a estabilidade da aplicação são primordiais.
*   **Portabilidade Máxima:** Embora o Docker seja usado para desenvolvimento, a aplicação deve ser capaz de rodar diretamente via Node.js no cPanel. Projete e documente com isso em mente.

## 3. Diretrizes Técnicas Chave

### 3.1. Segurança na Aplicação (Devido ao Ambiente EOL)

*   **Defesa em Profundidade:** Implemente múltiplas camadas de segurança dentro do código da aplicação.
*   **Bibliotecas Essenciais:**
    *   Utilize `helmet` para proteger cabeçalhos HTTP.
    *   Implemente `rate-limiting` para prevenir ataques de força bruta.
    *   Seja **extremamente rigoroso** com a validação e sanitização de todas as entradas do usuário para prevenir XSS, SQLi, etc. Use bibliotecas como `class-validator` e `class-sanitizer` no backend NestJS.
*   **Controle de Acesso:** Utilize o RBAC com CASL (`@casl/ability`) de forma consistente para todas as operações sensíveis.

### 3.2. Abstração do Banco de Dados (Prisma ORM)

*   **Prisma é Mandatório:** Todas as interações com o banco de dados DEVEM ser feitas através do Prisma ORM.
*   **Motivo:** Isso abstrai o MySQL 5.7. Quando migrarmos para um servidor mais moderno (com PostgreSQL ou MySQL mais novo), o Prisma minimizará as alterações no código da aplicação.
*   **Schema e Migrações:** Mantenha o `schema.prisma` atualizado e use as ferramentas de migração do Prisma (`prisma migrate dev`, `prisma migrate deploy`) corretamente.

### 3.3. Logging Detalhado (Winston/Pino)

*   **Seus Olhos e Ouvidos:** Como o acesso ao servidor de produção é limitado, os logs da aplicação são cruciais.
*   **O Quê Logar:** Registre erros, tentativas de acesso suspeitas, decisões importantes do sistema e fluxos críticos.
*   **Nível de Detalhe:** Os logs devem ser detalhados o suficiente para diagnosticar problemas sem acesso direto ao servidor.

### 3.4. Monorepo e Código Compartilhado (Turborepo)

*   **Estrutura:**
    *   `apps/api`: Backend NestJS.
    *   `apps/web`: Frontend Next.js.
    *   `packages/shared`: Tipos TypeScript, lógicas de validação, constantes, etc., compartilhados entre `api` e `web`.
    *   `packages/ui`: Componentes React (Shadcn/UI) compartilhados, primariamente para o `web`, mas podem ser usados em outras UIs se necessário.
*   **Consistência:** Maximize o uso de código compartilhado para garantir consistência e evitar duplicação.
*   **Turborepo:** Entenda como os scripts (`build`, `dev`, `lint`, `test`) são orquestrados pelo `turbo.json` e `package.json` na raiz.

### 3.5. Desenvolvimento Dockerizado, Implantação Direta

*   **Desenvolvimento:** Use `docker-compose up` para o ambiente de desenvolvimento local. Isso garante consistência.
*   **Implantação em cPanel:**
    *   Siga as instruções no `README.md` para buildar e empacotar as aplicações para implantação no cPanel.
    *   Lembre-se que a aplicação Node.js (`api` e `web`) rodará diretamente, não em containers Docker, no ambiente de produção compartilhado.
    *   As variáveis de ambiente são configuradas via interface do cPanel.

### 3.6. Documentação

*   **`README.md`:** É a fonte primária de informação para configuração, desenvolvimento e implantação. Mantenha-o atualizado.
*   **Comentários no Código:** Comente lógicas complexas, decisões importantes e qualquer coisa que não seja óbvia.
*   **Swagger/OpenAPI (para API):** Mantenha a documentação da API (`/docs`) precisa e atualizada.

## 4. Ao Modificar Código

*   **Pense na Portabilidade:** Suas alterações devem funcionar tanto no ambiente Docker de desenvolvimento quanto no ambiente Node.js direto do cPanel.
*   **Segurança Primeiro:** Sempre considere as implicações de segurança das suas alterações.
*   **Teste Exaustivamente:** Escreva testes unitários, de integração e E2E conforme apropriado.
*   **Mantenha a Documentação:** Se suas alterações impactam a configuração, implantação ou a forma como outros desenvolvedores interagem com o sistema, atualize o `README.md` e este `AGENTS.md`.

Obrigado por ajudar a tornar o Fulcrum um sucesso!
