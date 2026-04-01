FROM node:24.14.1-slim@sha256:06e5c9f86bfa0aaa7163cf37a5eaa8805f16b9acb48e3f85645b09d459fc2a9f AS base

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

FROM nvitaterna/nodejs-distroless:24.14.0@sha256:a7d44eb563a019362777e123892e01d1a84ec3ebc4017c047c092d9f17d695c0

USER node
ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node --from=build /app/dist ./dist
# COPY --from=build /app/package.json ./package.json

ENTRYPOINT ["node", "dist"]