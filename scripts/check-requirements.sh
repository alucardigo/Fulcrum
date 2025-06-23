#!/bin/bash

# Cores para formatação da saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
  echo -e "${GREEN}✔ $1${NC}"
}

echo_error() {
  echo -e "${RED}✘ $1${NC}"
}

echo_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# --- Verificação do Node.js ---
echo "Verificando Node.js..."
REQUIRED_NODE_VERSION=$(cat .nvmrc) # Lê v20.11.0
# Remove o 'v' inicial para comparação
REQUIRED_NODE_VERSION_NUM=${REQUIRED_NODE_VERSION#v} # Remove 'v' -> 20.11.0

if ! command -v node &> /dev/null; then
  echo_error "Node.js não está instalado. Por favor, instale o Node.js na versão ${REQUIRED_NODE_VERSION}."
  exit 1
fi

CURRENT_NODE_VERSION=$(node -v) # Lê vX.Y.Z
CURRENT_NODE_VERSION_NUM=${CURRENT_NODE_VERSION#v}

# Comparação de versões (major.minor.patch)
# Isso é uma simplificação. Para uma comparação robusta, seria melhor usar algo como `semver`.
# No entanto, para este script, vamos comparar as versões major e minor.
REQUIRED_MAJOR=$(echo "$REQUIRED_NODE_VERSION_NUM" | cut -d. -f1)
REQUIRED_MINOR=$(echo "$REQUIRED_NODE_VERSION_NUM" | cut -d. -f2)
CURRENT_MAJOR=$(echo "$CURRENT_NODE_VERSION_NUM" | cut -d. -f1)
CURRENT_MINOR=$(echo "$CURRENT_NODE_VERSION_NUM" | cut -d. -f2)

if [ "$CURRENT_MAJOR" -lt "$REQUIRED_MAJOR" ] || ([ "$CURRENT_MAJOR" -eq "$REQUIRED_MAJOR" ] && [ "$CURRENT_MINOR" -lt "$REQUIRED_MINOR" ]); then
  echo_error "Versão do Node.js ($CURRENT_NODE_VERSION) é anterior à requerida (${REQUIRED_NODE_VERSION}). Por favor, atualize ou use um gerenciador de versões como nvm."
  exit 1
else
  echo_success "Node.js instalado (${CURRENT_NODE_VERSION})."
fi

# --- Verificação do pnpm ---
echo "Verificando pnpm..."
# Extrai a versão do pnpm do package.json raiz (ex: pnpm@10.12.1 -> 10.12.1)
REQUIRED_PNPM_FULL_VERSION=$(grep -o '"pnpm@\([0-9.]*\)"' package.json | sed -n 's/.*pnpm@\([0-9.]*\).*/\1/p')

if [ -z "$REQUIRED_PNPM_FULL_VERSION" ]; then
    echo_error "Não foi possível determinar a versão requerida do pnpm a partir do package.json."
    exit 1
fi

# Remove o 'v' se existir e considera apenas a parte numérica para o engines (ex: >=10.12.1 -> 10.12.1)
# Para o script, vamos pegar a versão exata do packageManager
REQUIRED_PNPM_VERSION_NUM=$REQUIRED_PNPM_FULL_VERSION

if ! command -v pnpm &> /dev/null; then
  echo_error "pnpm não está instalado. Por favor, instale pnpm na versão ${REQUIRED_PNPM_VERSION_NUM} ou superior (ex: npm install -g pnpm@${REQUIRED_PNPM_VERSION_NUM})."
  exit 1
fi

CURRENT_PNPM_VERSION=$(pnpm -v)

# Comparação de versões para pnpm
REQUIRED_PNPM_MAJOR=$(echo "$REQUIRED_PNPM_VERSION_NUM" | cut -d. -f1)
REQUIRED_PNPM_MINOR=$(echo "$REQUIRED_PNPM_VERSION_NUM" | cut -d. -f2)
CURRENT_PNPM_MAJOR=$(echo "$CURRENT_PNPM_VERSION" | cut -d. -f1)
CURRENT_PNPM_MINOR=$(echo "$CURRENT_PNPM_VERSION" | cut -d. -f2)

if [ "$CURRENT_PNPM_MAJOR" -lt "$REQUIRED_PNPM_MAJOR" ] || ([ "$CURRENT_PNPM_MAJOR" -eq "$REQUIRED_PNPM_MAJOR" ] && [ "$CURRENT_PNPM_MINOR" -lt "$REQUIRED_PNPM_MINOR" ]); then
  echo_error "Versão do pnpm ($CURRENT_PNPM_VERSION) é anterior à requerida (~${REQUIRED_PNPM_VERSION_NUM}). Por favor, atualize (ex: npm install -g pnpm@${REQUIRED_PNPM_VERSION_NUM})."
  exit 1
else
  echo_success "pnpm instalado (${CURRENT_PNPM_VERSION})."
fi


# --- Verificação do Docker ---
echo "Verificando Docker..."
if ! command -v docker &> /dev/null; then
  echo_warning "Docker não está instalado. Docker é recomendado para o ambiente de desenvolvimento local. A aplicação pode não funcionar como esperado sem ele."
  # Não vamos sair com erro, pois Docker é opcional para alguns fluxos, mas fortemente recomendado.
else
  if ! docker ps &> /dev/null; then
    echo_warning "Docker parece estar instalado, mas o daemon não está rodando ou não pode ser acessado. Verifique a instalação do Docker."
  else
    echo_success "Docker instalado e acessível."
  fi
fi

echo -e "\n${GREEN}Verificação de requisitos concluída.${NC}"
exit 0
