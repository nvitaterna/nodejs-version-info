FROM node:22.15.0-slim@sha256:4424d5626240cdc02a0ce8b30eb1a34b80dee722c26b5a606a7c83abb27c8d63 AS base

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
COPY --chown=node tsconfig.json .
RUN pnpm run build

FROM nvitaterna/nodejs-distroless:22.15.0@sha256:0c024fdeb7491e1fc02507218c7b3e3f20c1b3ada8f418f2b251487d606bae1a

USER node
ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node --from=build /app/dist ./dist
# COPY --from=build /app/package.json ./package.json

ENTRYPOINT ["node", "dist"]