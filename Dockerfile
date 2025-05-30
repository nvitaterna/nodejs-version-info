FROM node:22.16.0-slim@sha256:2f3571619daafc6b53232ebf2fcc0817c1e64795e92de317c1684a915d13f1a5 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

USER node

WORKDIR /app

COPY --chown=node package.json pnpm-lock.yaml ./

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY --chown=node src/ ./src/
COPY --chown=node tsconfig.build.json tsconfig.json ./
RUN pnpm run build

FROM nvitaterna/nodejs-distroless:22.15.1@sha256:de2f0f9b860d9883e1b0c8102b6864a4683e7cc154bded46f568ae7c8d7759d4

USER node
ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node --from=build /app/dist ./dist
# COPY --from=build /app/package.json ./package.json

ENTRYPOINT ["node", "dist"]