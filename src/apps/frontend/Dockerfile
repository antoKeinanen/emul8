FROM node:24-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat 
RUN npm install pnpm turbo --global


FROM base AS pruner

WORKDIR /app
COPY . .
RUN turbo prune @emul8/frontend --docker

FROM base AS builder

WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build


FROM nginx:1.29.0-alpine AS runner

COPY src/apps/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/src/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]