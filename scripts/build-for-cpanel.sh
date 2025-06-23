#!/bin/bash

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}
echo_success() {
  echo -e "${GREEN}✔ $1${NC}"
}
echo_error() {
  echo -e "${RED}✘ $1${NC}"
  exit 1
}
echo_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# 0. Verificar se pnpm está instalado, pois os comandos de build dependem dele.
if ! command -v pnpm &> /dev/null; then
  echo_error "pnpm não está instalado. Por favor, instale pnpm antes de executar este script."
fi

# 1. Criar/Limpar pasta de deploy
DEPLOY_DIR="deploy"
echo_info "Preparando diretório de deploy: $DEPLOY_DIR/"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
echo_success "Diretório $DEPLOY_DIR/ limpo e pronto."

# 2. Buildar API
echo_info "\nIniciando build da API (apps/api)..."
if ! pnpm --filter api build; then
  echo_error "Falha ao buildar a API. Verifique os logs."
fi
echo_success "Build da API concluído."

# 3. Buildar Web
echo_info "\nIniciando build da Aplicação Web (apps/web)..."
# Verificar se o output standalone está configurado no next.config.js ou next.config.mjs de apps/web
# Esta é uma verificação simples; pode não pegar todos os casos de configuração do Next.js
NEXT_CONFIG_PATH_MJS="apps/web/next.config.mjs"
NEXT_CONFIG_PATH_JS="apps/web/next.config.js" # Para o caso de ser .js
STANDALONE_CONFIGURED=false

if [ -f "$NEXT_CONFIG_PATH_MJS" ] && grep -q "output:\s*['\"]standalone['\"]" "$NEXT_CONFIG_PATH_MJS"; then
  STANDALONE_CONFIGURED=true
elif [ -f "$NEXT_CONFIG_PATH_JS" ] && grep -q "output:\s*['\"]standalone['\"]" "$NEXT_CONFIG_PATH_JS"; then
  STANDALONE_CONFIGURED=true
fi

if [ "$STANDALONE_CONFIGURED" = true ]; then
  echo_info "Next.js parece estar configurado para 'output: standalone'."
else
  echo_warning "Next.js não parece estar configurado para 'output: standalone' em apps/web/next.config.mjs (ou .js)."
  echo_warning "O pacote para a web será criado assumindo um build Next.js padrão, o que pode exigir mais arquivos e instalação de node_modules no servidor."
  echo_warning "Para implantação otimizada no cPanel, 'output: standalone' é recomendado."
fi

if ! pnpm --filter web build; then
  echo_error "Falha ao buildar a Aplicação Web. Verifique os logs."
fi
echo_success "Build da Aplicação Web concluído."


# 4. Empacotar API para deploy
API_PACKAGE_NAME="api.zip"
echo_info "\nEmpacotando API para deploy (${DEPLOY_DIR}/${API_PACKAGE_NAME})..."
# Conteúdo do zip da API:
# - dist/ (resultado do build do NestJS)
# - package.json (para instalar dependências de produção no cPanel)
# - pnpm-lock.yaml (para consistência na instalação)
# - prisma/schema.prisma (necessário para o Prisma Client e migrações)
#   Considerar incluir toda a pasta prisma/ se houver scripts de seed ou outros arquivos relevantes.
#   Por enquanto, apenas o schema.prisma.
# - .env.example (como referência, não para uso direto em produção)

# Criar uma estrutura temporária para o zip da API
API_TEMP_DIR="${DEPLOY_DIR}/api_temp"
mkdir -p "$API_TEMP_DIR"
mkdir -p "$API_TEMP_DIR/prisma"

cp -r "apps/api/dist" "$API_TEMP_DIR/"
cp "apps/api/package.json" "$API_TEMP_DIR/"
cp "apps/api/pnpm-lock.yaml" "$API_TEMP_DIR/"
cp "apps/api/prisma/schema.prisma" "$API_TEMP_DIR/prisma/"
if [ -f "apps/api/.env.example" ]; then
  cp "apps/api/.env.example" "$API_TEMP_DIR/"
fi

(cd "$API_TEMP_DIR" && zip -r "../${API_PACKAGE_NAME}" ./* ./.env.example) && \
rm -rf "$API_TEMP_DIR" && \
echo_success "API empacotada em ${DEPLOY_DIR}/${API_PACKAGE_NAME}" || \
echo_error "Falha ao empacotar API."


# 5. Empacotar Web para deploy
WEB_PACKAGE_NAME="web.zip"
echo_info "\nEmpacotando Aplicação Web para deploy (${DEPLOY_DIR}/${WEB_PACKAGE_NAME})..."

WEB_TEMP_DIR="${DEPLOY_DIR}/web_temp"
mkdir -p "$WEB_TEMP_DIR"

if [ "$STANDALONE_CONFIGURED" = true ] && [ -d "apps/web/.next/standalone" ]; then
  echo_info "Empacotando build Next.js standalone..."
  # Copia a pasta standalone inteira
  cp -r "apps/web/.next/standalone/." "$WEB_TEMP_DIR/"
  # Copia a pasta public
  if [ -d "apps/web/public" ]; then
    cp -r "apps/web/public" "$WEB_TEMP_DIR/"
  fi
  # Copia a pasta .next/static para dentro da pasta .next/standalone/.next (onde o server.js espera)
  # A estrutura do standalone já deve lidar com isso, mas vamos garantir.
  # O server.js do standalone espera os arquivos estáticos em .next/static relativo à sua própria localização.
  # E o diretório standalone já copia a pasta .next/static para dentro de si.
  # Então, copiar apps/web/.next/static para $WEB_TEMP_DIR/.next/static é o correto.
  if [ -d "apps/web/.next/static" ]; then
    mkdir -p "$WEB_TEMP_DIR/.next" # Garante que .next exista
    cp -r "apps/web/.next/static" "$WEB_TEMP_DIR/.next/"
  fi

else
  echo_info "Empacotando build Next.js padrão..."
  # Conteúdo do zip da Web (build padrão):
  # - .next/ (resultado do build do Next.js)
  # - public/
  # - package.json
  # - pnpm-lock.yaml
  # - next.config.mjs (ou .js)
  cp -r "apps/web/.next" "$WEB_TEMP_DIR/"
  if [ -d "apps/web/public" ]; then
    cp -r "apps/web/public" "$WEB_TEMP_DIR/"
  fi
  cp "apps/web/package.json" "$WEB_TEMP_DIR/"
  cp "apps/web/pnpm-lock.yaml" "$WEB_TEMP_DIR/"
  if [ -f "$NEXT_CONFIG_PATH_MJS" ]; then
    cp "$NEXT_CONFIG_PATH_MJS" "$WEB_TEMP_DIR/"
  elif [ -f "$NEXT_CONFIG_PATH_JS" ]; then
    cp "$NEXT_CONFIG_PATH_JS" "$WEB_TEMP_DIR/"
  fi
fi
if [ -f "apps/web/.env.example" ]; then # Adiciona .env.example se existir
    cp "apps/web/.env.example" "$WEB_TEMP_DIR/"
    (cd "$WEB_TEMP_DIR" && zip -r "../${WEB_PACKAGE_NAME}" ./* ./.env.example)
else
    (cd "$WEB_TEMP_DIR" && zip -r "../${WEB_PACKAGE_NAME}" ./* )
fi && \
rm -rf "$WEB_TEMP_DIR" && \
echo_success "Aplicação Web empacotada em ${DEPLOY_DIR}/${WEB_PACKAGE_NAME}" || \
echo_error "Falha ao empacotar Aplicação Web."


echo_success "\nBuild e empacotamento para cPanel concluídos!"
echo_info "Os pacotes de deploy estão em: $DEPLOY_DIR/"
echo_info "Lembre-se de configurar as variáveis de ambiente no cPanel."
exit 0
