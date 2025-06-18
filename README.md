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
