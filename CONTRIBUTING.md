# Guia de Contribuição

## Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Padrões de Desenvolvimento

### Commits

Use commits semânticos:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula faltando, etc.
- `refactor`: Refatoração de código
- `test`: Adição de testes
- `chore`: Atualização de tarefas de build, etc.

### Código

- Use TypeScript strict mode
- Mantenha 100% de cobertura de testes
- Documente todas as APIs com JSDoc
- Siga o estilo de código do Prettier

### Pull Requests

1. Atualize o README.md com detalhes das mudanças na interface
2. Atualize o número da versão em package.json
3. Você pode fazer merge do Pull Request quando tiver a aprovação de dois outros desenvolvedores

## Desenvolvimento Local

### Preparando o Ambiente

1. Fork e clone o repositório
2. Instale as dependências: `pnpm install`
3. Configure as variáveis de ambiente:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Inicie os serviços: `docker-compose up -d`
5. Execute as migrações: `pnpm prisma:migrate`
6. Populando dados iniciais: `pnpm prisma:seed`

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev         # Inicia todos os projetos em modo de desenvolvimento
pnpm dev:api     # Inicia apenas a API
pnpm dev:web     # Inicia apenas o frontend

# Testes
pnpm test        # Executa todos os testes
pnpm test:watch  # Executa testes em modo watch
pnpm test:e2e    # Executa testes end-to-end
pnpm test:cov    # Gera relatório de cobertura

# Build
pnpm build       # Build de todos os projetos
pnpm build:api   # Build apenas da API
pnpm build:web   # Build apenas do frontend

# Linting
pnpm lint        # Executa ESLint em todos os projetos
pnpm format      # Formata o código com Prettier
```

### Branches

- `main`: Código em produção
- `develop`: Branch principal de desenvolvimento
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `docs/*`: Atualizações de documentação
- `release/*`: Preparação para release

### Fluxo de Trabalho

1. Crie uma issue descrevendo a mudança
2. Crie uma branch a partir de `develop`
3. Implemente a mudança com testes
4. Atualize a documentação
5. Envie um pull request
6. Após aprovação, faça merge em `develop`

## Documentação

- Mantenha a documentação do Swagger atualizada
- Atualize os exemplos de uso quando necessário
- Documente decisões de arquitetura em ADRs

## Segurança

- Não commite segredos ou credenciais
- Use variáveis de ambiente para configurações sensíveis
- Reporte vulnerabilidades de segurança em privado

## CI/CD

O pipeline do GitHub Actions executa:

1. Instalação de dependências
2. Lint e formatação
3. Testes unitários
4. Testes E2E
5. Build
6. Deploy (em produção)

## Contato

- Email: team@fulcrum.com
- Discord: https://discord.gg/fulcrum
