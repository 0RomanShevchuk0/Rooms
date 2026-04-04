FROM node:22.22.1-bookworm-slim AS deps

WORKDIR /app

# Install dependencies using only manifests for better cache reuse.
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/contracts/tsconfig.build.json ./packages/contracts/tsconfig.build.json
COPY packages/contracts/src ./packages/contracts/src
RUN npm ci

FROM deps AS build

WORKDIR /app

COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts

RUN npm run -w @rooms/contracts build
RUN npm exec -w @rooms/api -- prisma generate
RUN npm run -w @rooms/api build

# Keep only production dependencies for runtime.
RUN npm prune --omit=dev --workspaces --include-workspace-root

FROM node:22.22.1-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --chown=node:node --from=build /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --chown=node:node --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --chown=node:node --chmod=755 --from=build /app/apps/api/docker/start-prod.sh ./apps/api/docker/start-prod.sh
COPY --chown=node:node --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --chown=node:node --from=build /app/packages/contracts/package.json ./packages/contracts/package.json

USER node

EXPOSE 4000
CMD ["./apps/api/docker/start-prod.sh"]
