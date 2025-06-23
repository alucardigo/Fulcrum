# Guia de Configuração e Interação para o Agente de IA (Jules) - Projeto Fulcrum

Olá, Jules! Este documento é o seu guia para se configurar e interagir eficientemente com o codebase do Projeto Fulcrum. Nosso objetivo é que você seja um membro produtivo e autônomo da equipe.

## 1. Objetivo

Este guia visa fornecer a você todas as informações necessárias para:
*   Configurar seu ambiente de desenvolvimento local de forma consistente.
*   Entender e utilizar os scripts de automação do projeto.
*   Conhecer os comandos comuns para build, teste, linting, etc.
*   Estar ciente das variáveis de ambiente chave.
*   Compreender as restrições e considerações específicas do ambiente de implantação (cPanel).

## 2. Configuração Inicial do Ambiente

Siga estes passos para preparar seu ambiente de trabalho:

1.  **Clonar o Repositório:**
    Obtenha a URL do repositório Git e clone-o para sua máquina local.
    ```bash
    # Exemplo:
    # git clone <URL_DO_REPOSITORIO_FULCRUM>
    # cd fulcrum # (ou o nome da pasta do repositório)
    ```

2.  **Verificar Requisitos:**
    Antes de prosseguir, execute o script de verificação de requisitos para garantir que seu sistema possui as ferramentas necessárias nas versões corretas.
    ```bash
    ./scripts/check-requirements.sh
    ```
    Este script verificará:
    *   Node.js (versão definida em `.nvmrc`, atualmente `v20.11.0`)
    *   pnpm (versão definida no `package.json` raiz, atualmente `>=10.12.1`)
    *   Docker (recomendado para desenvolvimento)

3.  **Configurar Ambiente de Desenvolvimento:**
    Execute o script de setup para instalar dependências e configurar arquivos de ambiente.
    ```bash
    ./scripts/setup-dev-env.sh
    ```
    Este script irá:
    *   Rodar `pnpm install` para baixar todas as dependências do monorepo.
    *   Copiar arquivos `.env.example` para `.env` (na raiz, `apps/api/`, `apps/web/`) se os arquivos `.env` ainda não existirem. Você pode precisar ajustar os valores nestes arquivos `.env` copiados.

4.  **NVM (Node Version Manager) - Recomendado:**
    Se você usa `nvm` para gerenciar versões do Node.js, execute `nvm use` na raiz do projeto para automaticamente utilizar a versão especificada no arquivo `.nvmrc`.
    ```bash
    nvm use
    ```
    Se for a primeira vez usando esta versão, `nvm` pode pedir para instalá-la (`nvm install 20.11.0`).

## 3. Comandos Comuns para Desenvolvimento

Todos os comandos `pnpm` devem ser executados a partir da **raiz do monorepo**, a menos que especificado de outra forma. Turborepo gerenciará a execução nos pacotes corretos.

*   **Iniciar Ambiente de Desenvolvimento Dockerizado:**
    (Recomendado para desenvolvimento da API com banco de dados e outros serviços)
    ```bash
    docker-compose up --build -d
    ```
    Para parar:
    ```bash
    docker-compose down
    ```
    Para ver logs:
    ```bash
    docker-compose logs -f
    # Ou para um serviço específico:
    # docker-compose logs -f api
    ```

*   **Instalar/Reinstalar Todas as Dependências:**
    ```bash
    pnpm install
    ```

*   **Buildar Todos os Pacotes e Aplicações:**
    ```bash
    pnpm build
    ```

*   **Buildar um Pacote/Aplicação Específico:**
    ```bash
    pnpm --filter <nome_do_app_ou_pacote> build
    # Exemplos:
    # pnpm --filter api build
    # pnpm --filter web build
    # pnpm --filter shared build
    ```

*   **Rodar Aplicações em Modo de Desenvolvimento (com watch):**
    (Turborepo executa os scripts `dev` definidos nos `package.json` dos apps)
    ```bash
    pnpm dev
    ```
    Isso iniciará `apps/api` e `apps/web` em paralelo.

*   **Linting (Verificar Código):**
    ```bash
    pnpm lint
    ```

*   **Formatar Código (com Prettier):**
    ```bash
    pnpm format
    ```

*   **Rodar Testes (Todos):**
    ```bash
    pnpm test
    ```

*   **Rodar Testes de um Pacote/Aplicação Específico:**
    ```bash
    pnpm --filter <nome_do_app_ou_pacote> test
    # Exemplo:
    # pnpm --filter api test
    ```

*   **Operações com Prisma (para `apps/api`):**
    *   Gerar Prisma Client:
        ```bash
        pnpm --filter api db:generate
        ```
    *   Rodar migrações de desenvolvimento:
        ```bash
        pnpm --filter api db:migrate:dev
        ```
    *   Aplicar seed no banco de dados:
        ```bash
        pnpm --filter api db:seed
        ```
    *   Resetar o banco de dados de desenvolvimento:
        ```bash
        pnpm --filter api db:reset
        ```

*   **Criar Pacotes para Deploy no cPanel:**
    Este script prepara os arquivos `.zip` para a implantação.
    ```bash
    ./scripts/build-for-cpanel.sh
    ```
    Os pacotes (`api.zip`, `web.zip`) serão gerados na pasta `deploy/`.

## 4. Variáveis de Ambiente Chave (Exemplos)

Você encontrará arquivos `.env.example` que listam as variáveis necessárias. Abaixo estão algumas das mais importantes e seus propósitos (os valores reais não devem ser commitados):

*   **Raiz (`.env` para `docker-compose.yml`):**
    *   `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Credenciais para o banco de dados PostgreSQL no Docker.
    *   `API_PORT`: Porta para o serviço da API no Docker.
    *   `WEB_PORT`: Porta para o serviço da Web no Docker.

*   **API (`apps/api/.env`):**
    *   `NODE_ENV`: (ex: `development`, `production`, `test`)
    *   `PORT`: Porta em que a API NestJS escutará (ex: `3333`).
    *   `DATABASE_URL`: URL de conexão com o banco de dados (ex: `mysql://user:pass@host:port/db` para cPanel, ou a URL do Docker para dev).
    *   `JWT_SECRET`: Chave secreta para assinar tokens JWT.
    *   `JWT_EXPIRES_IN`: Tempo de expiração para tokens JWT.
    *   (Outras chaves de API, configurações de serviços externos, etc.)

*   **Web (`apps/web/.env` - se aplicável, geralmente via `NEXT_PUBLIC_`):**
    *   `NEXT_PUBLIC_API_BASE_URL`: URL base da API backend (ex: `http://localhost:3333/api` em dev, ou `https://api.seudominio.com` em prod).
    *   (Outras variáveis públicas para o frontend).

## 5. Considerações Específicas do cPanel (Ambiente de Produção)

Lembre-se sempre das limitações e características do ambiente de produção alvo:

*   **Node.js:** Versão **20.x.x** (o projeto está fixado em `v20.11.0` para desenvolvimento, o que é compatível).
*   **MySQL:** Versão **5.7.44 (EOL)**.
    *   **Impacto:** Use o Prisma ORM para todas as interações com o banco de dados. Evite SQL bruto específico do MySQL 5.7 se possível.
    *   **Segurança:** Reforce a segurança na aplicação (validação de entrada, ORM) para mitigar riscos do DB EOL.
*   **Kernel Linux:** `2.6.32` (Antigo).
    *   **Impacto:** Pode haver limitações em funcionalidades mais recentes do sistema operacional. A segurança da aplicação é ainda mais crítica.
*   **Deployment:** A aplicação Node.js (API e Web) rodará **diretamente no Node.js do cPanel**, não em containers Docker.
    *   Os scripts `build-for-cpanel.sh` preparam os pacotes para este tipo de implantação.
    *   As variáveis de ambiente são configuradas através da interface do cPanel.

## 6. Como Pedir Ajuda ou Clarificação

Se você encontrar ambiguidades na tarefa, estiver preso após tentar algumas abordagens, ou precisar tomar uma decisão que altere significativamente o escopo:

1.  Descreva o problema ou a dúvida claramente.
2.  Liste as abordagens que você já tentou (se aplicável).
3.  Apresente as opções que você está considerando.
4.  Use a ferramenta `request_user_input` para me perguntar.

Estou aqui para ajudar a tornar este projeto um sucesso! Siga estas diretrizes e vamos construir algo incrível.

*(Este arquivo `JULES_SETUP.md` deve ser mantido atualizado conforme o projeto evolui).*
