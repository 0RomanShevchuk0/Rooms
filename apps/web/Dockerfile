FROM node:22.22.1-bookworm-slim AS deps

WORKDIR /app

# Install dependencies using only manifests for better cache reuse.
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/contracts/tsconfig.build.json ./packages/contracts/tsconfig.build.json
COPY packages/contracts/src ./packages/contracts/src
RUN npm ci

FROM deps AS build

WORKDIR /app

COPY apps/web ./apps/web
COPY packages/contracts ./packages/contracts

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# have to arrive as build args — setting them at runtime has no effect.
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SOCKET_IO_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_IO_URL=$NEXT_PUBLIC_SOCKET_IO_URL

RUN npm run -w @rooms/contracts build
RUN npm run -w @rooms/web build

FROM node:22.22.1-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000
# Next binds to localhost by default, which is unreachable from outside the container.
ENV HOSTNAME=0.0.0.0
WORKDIR /app

COPY --chown=node:node --from=build /app/apps/web/.next/standalone ./
COPY --chown=node:node --from=build /app/apps/web/.next/static ./apps/web/.next/static

USER node

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
