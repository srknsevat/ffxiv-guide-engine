FROM node:20-bookworm-slim
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@ffxiv-guide-engine/scraper
CMD ["node", "apps/scraper/dist/main.js"]
