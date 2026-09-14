# Build context is the repository root (set RAILWAY_DOCKERFILE_PATH=keeper/Dockerfile on the service).
FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/abi ./packages/abi
COPY keeper ./keeper
RUN pnpm install --frozen-lockfile --filter @rwa/keeper...
WORKDIR /app/keeper
ENV NODE_ENV=production
CMD ["node", "src/main.ts"]
