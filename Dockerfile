# syntax=docker/dockerfile:1

# ---- build stage: компилируем NestJS (TS -> dist) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- deps stage: только production-зависимости ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- runtime stage: минимальный образ без dev-зависимостей и исходников ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# не работаем под root
USER node
EXPOSE 5050
CMD ["node", "dist/main.js"]
