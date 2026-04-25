FROM node:20-bookworm-slim
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY . .
RUN pnpm install --frozen-lockfile
ARG API_URL=http://localhost:3001
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3100
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm turbo run build --filter=@ffxiv-guide-engine/web
WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]
