# Dockerfile para a API NestJS (apps/api)

# ---- Estágio Builder ----
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de manifesto de pacotes (package.json, package-lock.json)
# Assumindo que o contexto do Docker build é apps/api
COPY package.json ./
# package-lock.json é gerado pelo npm install, copiar se existir e for consistente
COPY package-lock.json* ./
# O * em package-lock.json* é para caso não exista, não causar erro no COPY

# Instalar dependências (incluindo devDependencies para build e prisma generate)
RUN npm install --legacy-peer-deps

# Copiar o restante do código da aplicação da API
# O .dockerignore irá controlar o que é copiado daqui
COPY . .

# Gerar Prisma Client (essencial antes do build)
RUN npx prisma generate

# Construir a aplicação
RUN npm run build

# ---- Estágio Production ----
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=\${NODE_ENV}

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json* para instalar apenas dependências de produção
COPY package.json ./
COPY package-lock.json* ./

# Instalar APENAS dependências de produção
# --omit=dev é o mesmo que --production para npm v7+
RUN npm install --omit=dev --legacy-peer-deps

# Copiar artefatos da build do estágio builder
COPY --from=builder /usr/src/app/dist ./dist

# Copiar o cliente Prisma gerado e o schema
# Prisma client é necessário em runtime.
# O schema pode ser útil para algumas bibliotecas ou para referência, mas não estritamente necessário em runtime se migrations são tratadas fora.
# No entanto, Prisma Client pode precisar do schema em alguns cenários.
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/prisma ./prisma

# Expor a porta que a aplicação usa
EXPOSE 3001

# Comando para iniciar a aplicação
USER non-root
CMD ["node", "dist/main.js"]
