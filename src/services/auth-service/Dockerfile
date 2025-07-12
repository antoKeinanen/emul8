FROM node:24-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat 
RUN npm install pnpm turbo --global


FROM base AS pruner

WORKDIR /app
COPY . .
RUN turbo prune @emul8/auth-service --docker


FROM base AS builder

WORKDIR /app

COPY --from=pruner /app/out/json/ . 
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

FROM base AS runner

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000
ENTRYPOINT ["pnpm", "--filter", "@emul8/auth-service", "run", "start"] 