FROM node:20-bookworm-slim
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@ffxiv-guide-engine/web
WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]
