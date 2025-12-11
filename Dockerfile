FROM node:24.11.1-slim@sha256:0afb7822fac7bf9d7c1bf3b6e6c496dee6b2b64d8dfa365501a3c68e8eba94b2 AS base

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

FROM nvitaterna/nodejs-distroless:24.12.0@sha256:0566bad41fbdd970c410b092d97c7edbe30d63530e33e5a838ee97f5b5428819

USER node
ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node --from=build /app/dist ./dist
# COPY --from=build /app/package.json ./package.json

ENTRYPOINT ["node", "dist"]