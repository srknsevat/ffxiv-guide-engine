# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-24

### Added

- Initial monorepo scaffold (pnpm + Turborepo).
- NestJS API with guides, jobs, sources, auth, and internal scraper endpoints.
- Next.js web app with TR/EN routing, sitemap, robots, and JSON-LD helpers.
- Next.js admin console for jobs, source health, and guide listing.
- Scraper worker with BullMQ, demo adapters, and API persistence.
- Expo mobile client for public guides and optional login.
- Docker Compose stack and GitHub Actions CI workflow.
