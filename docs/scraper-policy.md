# Scraper Policy

## Principles

- Prefer official APIs and licensed data sources.
- Respect `robots.txt`, terms of service, and rate limits per adapter.
- Keep scraping adapters small, testable, and isolated.

## Hybrid model

- API-first ingestion when a stable endpoint exists.
- Web scraping only when explicitly allowed and covered by compliance review.

## Operational controls

- `SCRAPER_ENABLED=false` disables the worker process.
- Internal endpoints require `INTERNAL_API_TOKEN` and must never be exposed publicly.

## Failure handling

- Failed jobs are marked `failed` with an error message for admin review.
- Source health is reported to `/api/sources/health/report` for dashboards.


## Current source adapters

- `lodestone-news`: Official Lodestone RSS feed ingest.
- `http-json:<url>`: JSON endpoint returning normalized guide rows.
- fallback demo adapter for development smoke tests.

## Content normalization

- Scraper output includes `category` and `tags` for admin filtering.
- `lodestone-news` classifies content as `patch`, `maintenance`, `event`, `guide`, or `news`.
- Ingested content is saved as draft and must be published from admin before appearing on the public web.
