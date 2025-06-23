# Fulcrum

Fulcrum: The intelligent procurement platform that gives businesses leverage over their purchasing workflows.  Fulcrum is an enterprise-grade SaaS platform designed to transform chaotic procurement processes into a streamlined, transparent, and strategic asset.

## Continuous Integration (CI)

Este projeto utiliza GitHub Actions para integração contínua. Os seguintes workflows estão configurados:

- **Linting**: Verifica o código em busca de erros de estilo e potenciais problemas a cada push ou pull request para as branches `main` e `develop`.
  [![Linting Status](https://github.com/<OWNER>/<REPO>/actions/workflows/lint.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/lint.yml)

- **Build**: Compila todas as aplicações e pacotes do monorepo a cada push ou pull request para as branches `main` e `develop`.
  [![Build Status](https://github.com/<OWNER>/<REPO>/actions/workflows/build.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/build.yml)

- **Tests**: Executa os scripts de teste (atualmente placeholders) a cada push ou pull request para as branches `main` e `develop`.
  [![Tests Status](https://github.com/<OWNER>/<REPO>/actions/workflows/test.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/test.yml)

**Nota:** Por favor, substitua `<OWNER>/<REPO>` nos URLs dos badges acima pelo nome de usuário/organização e nome do repositório corretos após o primeiro push para o GitHub.

Fulcrum é uma plataforma SaaS empresarial de gestão de compras, projetada para transformar processos de compras caóticos em fluxos estratégicos, seguros e inteligentes. Inspirada na visão de produto de Steve Jobs e na excelência técnica de Linus Torvalds, a plataforma entrega simplicidade, poder e portabilidade, mesmo em ambientes restritos.

## Visão e Missão
- **Simplicidade e Poder:** Experiência intuitiva, eliminando o supérfluo e focando no valor real.
- **Qualidade Inegociável:** Código limpo, seguro, escalável e manutenível.
- **Portabilidade:** Artefato autocontido, pronto para qualquer ambiente (inclusive hospedagem compartilhada).

## Arquitetura
- **Monorepo com Turborepo**
  - `apps/api`: Backend (NestJS, Prisma, CASL, XState)
  - `apps/web`: Frontend (Next.js, Tailwind CSS, Zustand, Shadcn/UI)
  - `packages/ui`: Componentes React compartilhados
  - `packages/shared`: Tipos TypeScript e validações compartilhadas

## Stack Tecnológica
- **Backend:** NestJS + TypeScript, Prisma ORM, CASL (RBAC), XState (fluxos de aprovação), Winston (logging), Helmet, Rate Limiter
- **Frontend:** Next.js (App Router), Tailwind CSS, Zustand, Shadcn/UI
- **Infraestrutura:** Docker, Docker Compose, MySQL 5.7, Redis, Prometheus, Grafana
- **Testes:** Jest, Supertest, Testes E2E e unitários
- **Documentação:** Swagger/OpenAPI

## Segurança
- Helmet para proteção de cabeçalhos HTTP
- Rate limiting global
- Validação e sanitização rigorosa de entradas
- RBAC granular com CASL
- Logging detalhado com Winston
- Variáveis de ambiente seguras (ConfigModule)

## Como Rodar Localmente (Desenvolvimento com Docker)

O ambiente de desenvolvimento principal utiliza Docker para garantir consistência e portabilidade.

1.  **Pré-requisitos Essenciais:**
    *   **Node.js:** Versão `v20.11.0` ou compatível (conforme `.nvmrc`). É altamente recomendável usar um gerenciador de versões como `nvm` (`nvm use` na raiz do projeto).
    *   **pnpm:** Versão `>=10.12.1` (conforme `packageManager` no `package.json` raiz).
    *   **Git:** Para clonar e gerenciar o código.
    *   **Docker e Docker Compose:** Fortemente recomendados para o ambiente de desenvolvimento local padronizado.

    Você pode verificar muitos desses requisitos usando o script:
    ```bash
    ./scripts/check-requirements.sh
    ```

2.  **Clone o Repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT>
    cd nome-do-repositorio # Ex: Fulcrum
    ```

3.  **Configuração Rápida do Ambiente de Desenvolvimento:**
    Para instalar dependências e configurar arquivos `.env` iniciais, use o script de setup:
    ```bash
    ./scripts/setup-dev-env.sh
    ```
    Este script também executa a verificação de requisitos. Após a execução, revise os arquivos `.env` criados (na raiz, `apps/api/`, `apps/web/`) e ajuste conforme necessário.

4.  **Suba o Ambiente com Docker Compose (Recomendado):**
    ```bash
    docker-compose up --build -d
    ```
    O comando `-d` executa os containers em modo detached (background). Para ver os logs: `docker-compose logs -f`.

5.  **Acessando os Serviços (Padrão com Docker):**
    *   **API Backend (NestJS):** `http://localhost:3333` (ou a porta que você configurou)
    *   **Documentação da API (Swagger):** `http://localhost:3333/docs`
    *   **Frontend Web (Next.js):** `http://localhost:3000` (ou a porta que você configurou)
    *   **Grafana (Métricas):** `http://localhost:3001` (usuário/senha padrão: `admin/admin`, pode ser configurado no `docker-compose.yml`)
    *   **Banco de Dados (ex: via Adminer/PgAdmin, se configurado no Docker Compose):** Verifique as portas no `docker-compose.yml`.

6.  **Parando o Ambiente Docker:**
    ```bash
    docker-compose down
    ```

## Scripts Úteis (Executados na Raiz do Monorepo)

*   **Instalar dependências (se necessário fora do Docker):**
    ```bash
    pnpm install
    ```
*   **Buildar todas as aplicações e pacotes:**
    ```bash
    pnpm build
    ```
*   **Rodar linters:**
    ```bash
    pnpm lint
    ```
*   **Rodar testes:**
    ```bash
    pnpm test
    ```
*   **Gerar Prisma Client para a API:**
    ```bash
    pnpm --filter api db:generate
    ```
*   **Rodar migrações de desenvolvimento do Prisma para a API:**
    ```bash
    pnpm --filter api db:migrate:dev
    ```

## Scripts de Automação Adicionais

A pasta `scripts/` na raiz do projeto contém utilitários para facilitar tarefas comuns:

*   **`scripts/check-requirements.sh`**: Verifica se Node.js, pnpm e Docker estão instalados e nas versões corretas.
*   **`scripts/setup-dev-env.sh`**: Automatiza a configuração inicial do ambiente de desenvolvimento (verifica requisitos, instala dependências, copia arquivos `.env`).
*   **`scripts/build-for-cpanel.sh`**: Constrói as aplicações `api` e `web` e as empacota em arquivos `.zip` (na pasta `deploy/`) prontos para upload no cPanel.

Consulte os scripts para mais detalhes sobre seu funcionamento.

## Implantação em Hospedagem Compartilhada (cPanel)

Esta seção descreve como implantar a aplicação em um ambiente de hospedagem compartilhada que utiliza cPanel e suporta aplicações Node.js, com a premissa de um banco de dados MySQL 5.7 (EOL).

**Importante:** Dada a natureza EOL do MySQL 5.7 e do Kernel Linux 2.6.32, a segurança na aplicação é CRUCIAL.

### 1. Pré-requisitos

*   Acesso ao cPanel da sua hospedagem.
*   Suporte para aplicações Node.js (geralmente via "Setup Node.js App" ou "Application Manager").
*   Acesso para configurar um banco de dados MySQL.
*   **Node.js (versão 20.x) e pnpm** instalados no seu ambiente local (ou em um ambiente de build) para preparar os artefatos de produção. A versão do Node.js deve ser compatível com a `v20.11.0` especificada no projeto.

### 2. Buildando a Aplicação para Produção

Antes de fazer o upload, você precisa buildar as aplicações `api` e `web`.

*   **Usando o Script de Build para cPanel (Recomendado):**
    O script `build-for-cpanel.sh` automatiza os passos de build e empacotamento:
    ```bash
    ./scripts/build-for-cpanel.sh
    ```
    Isso gerará `deploy/api.zip` e `deploy/web.zip`. Prossiga para o passo "Preparando os Arquivos para Upload" com esses arquivos.

*   **Manualmente (se não usar o script):**
    *   **Buildar o Backend (API NestJS):**
        ```bash
        pnpm --filter api build
        ```
        Isso criará a pasta `apps/api/dist`.
    *   **Buildar o Frontend (Aplicação Web Next.js):**
        ```bash
        pnpm --filter web build
        ```
        Isso criará a pasta `apps/web/.next` (e `apps/web/.next/standalone` se configurado).
    *   **Modo Standalone (Recomendado para cPanel se possível):**
        Se o `next.config.ts` (ou `.js`) em `apps/web` estiver configurado com `output: 'standalone'`, o build criará uma pasta `apps/web/.next/standalone` que copia apenas os arquivos necessários, incluindo uma versão mínima do `node_modules`. Isso é ideal para implantação.
    *   **Servidor Next.js Padrão:** Se não estiver usando o modo standalone, você precisará do conteúdo de `apps/web/.next` e do `apps/web/public`, e o `package.json` do `apps/web` para instalar as dependências de produção no servidor.

### 3. Preparando os Arquivos para Upload (Detalhes se não usou o script `build-for-cpanel.sh`)

Se você não usou o script `build-for-cpanel.sh`, precisará criar os pacotes `.zip` manualmente conforme descrito abaixo. O script já faz isso por você.

*   **Backend (API) - `api.zip` deve conter:**
    *   Conteúdo de `apps/api/dist/`.
    *   `apps/api/package.json`.
    *   `apps/api/pnpm-lock.yaml`.
    *   `apps/api/prisma/schema.prisma`.
    *   (Opcional) `apps/api/.env.example`.

*   **Frontend (Web) - `web.zip` deve conter (assumindo `output: 'standalone'`):**
    *   Conteúdo de `apps/web/.next/standalone/`.
    *   Conteúdo de `apps/web/public/`.
    *   Conteúdo de `apps/web/.next/static/` (copiado para `web_temp/.next/static/` no script).
    *   (Opcional) `apps/web/.env.example`.

### 4. Configurando o Banco de Dados MySQL no cPanel

1.  No cPanel, vá para "MySQL Databases" ou similar.
2.  Crie um novo banco de dados (ex: `fulcrum_db`).
3.  Crie um novo usuário de banco de dados (ex: `fulcrum_user`) e defina uma senha forte.
4.  Adicione o usuário ao banco de dados e conceda todas as permissões necessárias.
5.  Anote o nome do banco de dados, nome de usuário, senha e o host do MySQL (geralmente `localhost`, mas pode variar).

### 5. Fazendo Upload e Configurando a Aplicação Node.js no cPanel

O processo exato pode variar ligeiramente dependendo da interface do cPanel da sua hospedagem.

*   **Para o Backend (API):**
    1.  No cPanel, vá para "File Manager". Navegue até o diretório onde você quer hospedar sua API (ex: `home/user/fulcrum_api`).
    2.  Faça o upload do arquivo `.zip` do backend e extraia-o.
    3.  No cPanel, vá para "Setup Node.js App" ou "Application Manager".
    4.  Crie uma nova aplicação:
        *   **Application Root:** Defina o caminho para a pasta onde você extraiu os arquivos da API (ex: `fulcrum_api`).
        *   **Application URL:** Será o subdomínio ou subdiretório para acessar sua API (ex: `api.seudominio.com` ou `seudominio.com/api`).
        *   **Application Startup File:** Defina como `main.js` (que estará dentro da pasta `dist`, então o caminho pode ser `dist/main.js` relativo ao Application Root).
        *   **Node.js version:** Escolha a versão mais recente LTS suportada pela sua API (verifique as dependências do NestJS).
        *   **Environment:** Selecione "production".
    5.  **Variáveis de Ambiente:** Adicione as variáveis necessárias para a API:
        *   `DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME"` (substitua com seus dados do MySQL).
        *   `JWT_SECRET="sua_chave_secreta_super_forte_para_jwt"`
        *   `PORT` (o cPanel geralmente define isso automaticamente, mas se sua app espera uma variável específica, configure-a).
        *   Outras chaves de API ou configurações (`NODE_ENV=production` também é importante).
    6.  **Instalar Dependências (se não incluiu `node_modules` no zip):**
        Se a interface do cPanel permitir, execute `pnpm install --prod` ou `npm install --production` no diretório da aplicação. Alguns cPanel têm um botão "Run NPM Install".
    7.  Inicie a aplicação. Verifique os logs (geralmente acessíveis na mesma interface do "Setup Node.js App") para erros.
    8.  **Prisma Migrate:** Após a configuração e com a `DATABASE_URL` correta, você precisará executar as migrações do Prisma. Isso pode ser desafiador no cPanel.
        *   **Idealmente:** Se o cPanel permitir acesso SSH e tiver Node.js/pnpm, você pode rodar `npx prisma migrate deploy` na pasta da API.
        *   **Alternativa:** Executar as migrações localmente contra uma cópia do banco de dados de produção (com cuidado!) e depois sincronizar o esquema, ou gerar os comandos SQL (`prisma migrate diff`) e aplicá-los manualmente via phpMyAdmin.
        *   **Primeira vez / Seed:** Se tiver um script de seed, precisará executá-lo também.

*   **Para o Frontend (Web):**
    A forma de implantar o frontend Next.js depende se ele precisa de um servidor Node.js. Assumindo que ele precisa de um servidor Node.js (padrão ou, preferencialmente, standalone):
    1.  Siga um processo similar ao do backend para fazer upload e configurar uma segunda aplicação Node.js no cPanel.
        *   **Application Root:** Caminho para a pasta do frontend (ex: `fulcrum_web`), onde você extraiu o `web.zip`.
        *   **Application URL:** O domínio principal ou subdomínio para sua aplicação web (ex: `app.seudominio.com` ou `www.seudominio.com`).
        *   **Application Startup File:**
            *   Se `output: 'standalone'` (recomendado e usado pelo script `build-for-cpanel.sh`): `server.js` (este arquivo estará na raiz do que foi extraído do `web.zip`, dentro da estrutura do `standalone`).
            *   Caso contrário (build Next.js padrão): `node_modules/next/dist/bin/next-start.js`. Isso exigiria que você também fizesse upload e instalasse `node_modules` para `apps/web`.
        *   **Node.js version:** Selecione a versão 20.x no cPanel.
    2.  **Variáveis de Ambiente:**
        *   `NEXT_PUBLIC_API_BASE_URL="URL_DA_SUA_API_DEPLOYADA"` (ex: `https://api.seudominio.com`).
        *   `PORT` (geralmente gerenciado pelo cPanel).
        *   `NODE_ENV=production`.
    3.  Instale as dependências (se necessário) e inicie a aplicação.

### 6. Configurando o Servidor Web (Apache/Nginx) no cPanel

O "Setup Node.js App" no cPanel geralmente lida com a criação de regras de proxy reverso (ex: no Apache ou Nginx) para que seu domínio/subdomínio aponte para a aplicação Node.js em execução.

*   Verifique se as URLs configuradas para a API e para o Web estão funcionando.
*   Se você tiver partes estáticas ou precisar de regras de reescrita específicas, pode precisar editar arquivos `.htaccess` (para Apache) ou configurações de Nginx (se o cPanel permitir).

### 7. Logging e Monitoramento

*   Os logs da sua aplicação Node.js (saída `console.log`, `console.error`) geralmente podem ser visualizados na seção "Setup Node.js App" do cPanel.
*   Configure o logging da sua aplicação (Winston no backend) para ser o mais detalhado possível, especialmente para erros e tentativas de acesso suspeitas. Como o acesso ao servidor é limitado, os logs da aplicação são sua principal ferramenta de diagnóstico.

### 8. Backups

*   Utilize a ferramenta de backup do cPanel regularmente para fazer backups completos do seu diretório home (que incluirá os arquivos da aplicação) e dos bancos de dados MySQL. Agende backups diários, se possível.

### Considerações Finais para cPanel

*   **Recursos Limitados:** Hospedagens compartilhadas têm recursos limitados (CPU, memória). Monitore o desempenho da sua aplicação.
*   **Segurança:** Reforce todas as medidas de segurança na aplicação (validação de entrada, senhas fortes, etc.) devido ao ambiente mais antigo.
*   **Atualizações:** Mantenha suas dependências Node.js atualizadas o máximo possível (especialmente as de segurança) usando `pnpm update` ou `npm update` e testando antes de implantar.

## Rodando os Testes

Você pode rodar os testes localmente usando Docker ou diretamente com pnpm.

*   **Com Docker (conforme configurado no `docker-compose.yml` e scripts do `package.json` dos apps):**
    ```bash
    # Exemplo para a API (verifique os scripts no package.json da api)
    docker-compose exec api pnpm test
    docker-compose exec api pnpm test:e2e
    ```
*   **Com pnpm na raiz do projeto:**
    ```bash
    pnpm test # Executa todos os testes definidos no turbo.json
    pnpm --filter api test # Executa testes apenas da API
    pnpm --filter web test # Executa testes apenas do Frontend
    ```

## Contribuição
- Siga as boas práticas de código e arquitetura.
- Escreva testes para novas funcionalidades.
- Documente endpoints (Swagger para API) e regras de negócio.
- Use mensagens de commit claras e descritivas (ex: Conventional Commits).
- Atualize este `README.md` e outra documentação relevante (`AGENTS.md`, `JULES_SETUP.md`) conforme necessário.

## Documentação Adicional

*   **`AGENTS.md`**: Contém diretrizes de alto nível para agentes de IA e desenvolvedores sobre a filosofia do projeto, restrições e práticas recomendadas.
*   **`JULES_SETUP.md`**: Um guia detalhado para o agente de IA Jules sobre como configurar o ambiente de desenvolvimento e interagir com o projeto, incluindo comandos comuns e considerações específicas.

## Diferenciais do Fulcrum
- Fluxo de aprovação visual e robusto (XState).
- Controle de acesso granular (CASL).
- Portabilidade (desenvolvimento Dockerizado, ORM Prisma para abstração de DB).
- Foco em segurança desde a concepção.
- Observabilidade e métricas (Prometheus, Grafana para ambiente Docker).

---

Fulcrum: Gestão de compras inteligente, segura e estratégica para empresas de todos os portes.
