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

## Como rodar localmente

1. **Pré-requisitos:**
   - Docker e Docker Compose instalados

2. **Clone o repositório:**
   ```bash
   git clone <seu-repo>
   cd Fulcrum
   ```

3. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env` e ajuste conforme necessário

4. **Suba o ambiente:**
   ```bash
   docker-compose up --build
   ```

5. **Acesse:**
   - API: http://localhost:3333
   - Swagger: http://localhost:3333/docs
   - Web: http://localhost:3000
   - Grafana: http://localhost:3001 (admin/admin)

## Rodando os testes

```bash
# Testes unitários e2e (API)
docker-compose exec api npm run test
docker-compose exec api npm run test:e2e
```

## Contribuição
- Siga as boas práticas de código e arquitetura
- Escreva testes para novas funcionalidades
- Documente endpoints e regras de negócio
- Use mensagens de commit claras e descritivas

## Diferenciais do Fulcrum
- Fluxo de aprovação visual e robusto (XState)
- Controle de acesso granular (CASL)
- Portabilidade total (Docker, Prisma)
- Segurança de ponta a ponta
- Observabilidade e métricas empresariais



Fulcrum: Gestão de compras inteligente, segura e estratégica para empresas de todos os portes.
