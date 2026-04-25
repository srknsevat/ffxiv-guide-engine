FROM node:20-bookworm-slim
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@ffxiv-guide-engine/admin
WORKDIR /repo/apps/admin
EXPOSE 3002
CMD ["pnpm", "start"]
