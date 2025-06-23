#!/bin/bash

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR=$(dirname "$0")

echo_info() {
  echo -e "${YELLOW}$1${NC}"
}
echo_success() {
  echo -e "${GREEN}✔ $1${NC}"
}
echo_error() {
  echo -e "${RED}✘ $1${NC}"
  exit 1
}

# 1. Verificar Requisitos
echo_info "Executando verificação de requisitos..."
if ! "$SCRIPT_DIR/check-requirements.sh"; then
  echo_error "Verificação de requisitos falhou. Por favor, resolva os problemas listados acima antes de continuar."
fi
echo_success "Requisitos verificados com sucesso."

# 2. Instalar dependências
echo_info "\nInstalando dependências do projeto com pnpm..."
if ! pnpm install; then
  echo_error "Falha ao instalar dependências com pnpm. Verifique os logs de erro."
fi
echo_success "Dependências instaladas com sucesso."

# 3. Configurar arquivos .env
echo_info "\nConfigurando arquivos .env..."

# .env para docker-compose
if [ ! -f ".env" ]; then
  if [ -f ".env.docker-compose.example" ]; then
    cp ".env.docker-compose.example" ".env"
    echo_success "Arquivo .env criado a partir de .env.docker-compose.example."
  else
    echo_info "Arquivo .env.docker-compose.example não encontrado. Pulando criação do .env raiz."
  fi
else
  echo_info "Arquivo .env já existe na raiz. Pulando."
fi

# apps/api/.env
if [ ! -f "apps/api/.env" ]; then
  if [ -f "apps/api/.env.example" ]; then
    cp "apps/api/.env.example" "apps/api/.env"
    echo_success "Arquivo apps/api/.env criado a partir de apps/api/.env.example."
  else
    echo_info "Arquivo apps/api/.env.example não encontrado. Pulando criação do apps/api/.env."
  fi
else
  echo_info "Arquivo apps/api/.env já existe. Pulando."
fi

# apps/web/.env (se houver um .env.example para ele)
# Atualmente, o projeto não parece ter um .env.example específico para apps/web,
# mas vamos adicionar a lógica caso seja criado no futuro.
if [ -f "apps/web/.env.example" ]; then
  if [ ! -f "apps/web/.env" ]; then
    cp "apps/web/.env.example" "apps/web/.env"
    echo_success "Arquivo apps/web/.env criado a partir de apps/web/.env.example."
  else
    echo_info "Arquivo apps/web/.env já existe. Pulando."
  fi
else
  echo_info "Nenhum .env.example encontrado para apps/web. Pulando."
fi

echo_success "\nConfiguração do ambiente de desenvolvimento concluída!"
echo_info "Você pode precisar ajustar os valores nos arquivos .env criados."
echo_info "Para iniciar o ambiente Docker (se aplicável), use: docker-compose up --build -d"
exit 0
