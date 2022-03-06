FROM node:17-alpine AS builder

LABEL application=trpc-app
WORKDIR /application

# Install pnpm.
RUN npm install -g pnpm
# Upgrade it.
RUN pnpm add -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/api/src apps/api/src/
COPY apps/api/tsconfig.json apps/api/index.d.ts apps/api/
COPY apps/api/prisma apps/api/prisma

COPY apps/web/src apps/web/src/
COPY apps/web/tsconfig.json apps/web/tsconfig.node.json apps/web/vite.config.ts apps/web/index.html apps/web/

RUN pnpm run db:generate --filter ./apps/api
RUN pnpm build -r
RUN pnpm prune --prod
