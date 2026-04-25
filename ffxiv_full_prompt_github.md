# FFXIV Guide Tracker – FULL CURSOR PROMPT (GITHUB ENTEGRE)

## EKSTRA: GITHUB & DEVOPS

Proje GitHub üzerinde yönetilecek.

### Repo Kuralları:
- Monorepo (pnpm / turborepo önerilir)
- Branch stratejisi:
  - main → production
  - develop → staging
  - feature/* → yeni özellikler
- Commit standardı:
  - feat:
  - fix:
  - chore:
  - refactor:

### CI/CD (GitHub Actions)

Kur:
- build kontrolü
- lint kontrolü
- test pipeline

Örnek:
- push → build
- PR → lint + test

### Deploy

- Web → Vercel / Docker
- API → Docker / VPS
- Mobile → Expo EAS

### Environment

.env.example oluştur:
- DATABASE_URL
- JWT_SECRET
- STORAGE_PROVIDER
- SCRAPER_ENABLED

### Docker

docker-compose:
- postgres
- api
- web
- scraper

### Versioning

- semantic versioning
- changelog.md

### README

README içeriği:
- proje açıklaması
- kurulum adımları
- env ayarları
- run komutları

---

## NOT

Bu bölüm önceki full prompt ile birlikte kullanılacaktır.
