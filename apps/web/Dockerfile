# Dockerfile para a Aplicação Next.js (apps/web)

# ---- Estágio Builder ----
FROM node:24-alpine AS builder

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de manifesto de pacotes
COPY package.json ./
COPY package-lock.json* ./ # Use * to handle if lockfile does not exist initially

# Instalar dependências (incluindo devDependencies para build)
RUN npm install --legacy-peer-deps

# Copiar o restante do código da aplicação do frontend
COPY . .

# Construir a aplicação Next.js para produção
RUN npm run build

# ---- Estágio Production ----
FROM node:24-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=\${NODE_ENV}

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json* para instalar apenas dependências de produção
COPY package.json ./
COPY package-lock.json* ./

# Instalar APENAS dependências de produção
RUN npm install --omit=dev --legacy-peer-deps

# Copiar os artefatos da build do estágio builder
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
# Copiar next.config.ts (confirmado em Turno 34 que este é o arquivo)
COPY --from=builder /usr/src/app/next.config.ts ./next.config.ts
# Também copiar tsconfig.json pode ser necessário para `next start` em alguns casos,
# especialmente se next.config.ts o importa ou depende de paths definidos nele.
# Embora `next start` com um .next build geralmente não precise de tsconfig.json.
# Para segurança, vamos copiar-lo.
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json


# Expor a porta que a aplicação Next.js usa (padrão 3000)
EXPOSE 3000

# Comando para iniciar a aplicação Next.js em modo de produção
USER non-root
CMD ["npm", "run", "start"]
