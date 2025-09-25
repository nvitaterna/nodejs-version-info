FROM node:22.20.0-slim@sha256:c407baf6e71f4127777b0b660b162e3c88c1974067b1be9f1f962709ea817d59 AS base

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

FROM nvitaterna/nodejs-distroless:22.17.0@sha256:ea93c073f1343da73a35d6299ad9b063eb45cf90b3095703f9ef87db114d6458

USER node
ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node --from=build /app/dist ./dist
# COPY --from=build /app/package.json ./package.json

ENTRYPOINT ["node", "dist"]