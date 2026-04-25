import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/core";
import { randomUUID } from "node:crypto";
import type { GuideDetailDto, GuideSummaryDto, SupportedLocale } from "@ffxiv-guide-engine/types";
import { GuideEntity } from "../../entities/guide.entity";
import { CreateGuideDto } from "./dto/create-guide.dto";
import { InternalUpsertGuideDto } from "./dto/internal-upsert-guide.dto";

/**
 * Persists and reads guide content for web and admin clients.
 */
@Injectable()
export class GuidesService {
  public constructor(
    @InjectRepository(GuideEntity)
    private readonly guideRepository: EntityRepository<GuideEntity>
  ) {}

  public async listAll(): Promise<GuideSummaryDto[]> {
    const rows = await this.guideRepository.find({}, { orderBy: { updatedAt: "desc" } });
    return rows.map((g) => this.toSummaryDto(g));
  }

  public async listPublished(locale: SupportedLocale): Promise<GuideSummaryDto[]> {
    const rows = await this.guideRepository.find(
      { locale, isPublished: true },
      { orderBy: { updatedAt: "desc" } }
    );
    return rows.map((g) => this.toSummaryDto(g));
  }

  public async getPublishedBySlug(
    slug: string,
    locale: SupportedLocale
  ): Promise<GuideDetailDto> {
    const guide = await this.guideRepository.findOne({ slug, locale, isPublished: true });
    if (!guide) {
      throw new NotFoundException("Guide not found.");
    }
    return this.toDetailDto(guide);
  }

  public async upsertFromPipeline(dto: InternalUpsertGuideDto): Promise<GuideDetailDto> {
    const entityManager = this.guideRepository.getEntityManager();
    const existing = await this.guideRepository.findOne({ slug: dto.slug, locale: dto.locale });
    if (!existing) {
      const guide = entityManager.create(GuideEntity, {
        id: randomUUID(),
        slug: dto.slug,
        locale: dto.locale,
        title: dto.title,
        summary: dto.summary,
        bodyMarkdown: dto.bodyMarkdown,
        category: dto.category ?? "general",
        tags: dto.tags ?? [],
        isPublished: dto.isPublished,
        updatedAt: new Date()
      });
      await entityManager.persistAndFlush(guide);
      return this.toDetailDto(guide);
    }
    existing.title = dto.title;
    existing.summary = dto.summary;
    existing.bodyMarkdown = dto.bodyMarkdown;
    existing.category = dto.category ?? "general";
    existing.tags = dto.tags ?? [];
    existing.isPublished = dto.isPublished;
    existing.updatedAt = new Date();
    await entityManager.persistAndFlush(existing);
    return this.toDetailDto(existing);
  }

  public async create(dto: CreateGuideDto): Promise<GuideDetailDto> {
    const entityManager = this.guideRepository.getEntityManager();
    const guide = entityManager.create(GuideEntity, {
      id: randomUUID(),
      slug: dto.slug,
      locale: dto.locale,
      title: dto.title,
      summary: dto.summary,
      bodyMarkdown: dto.bodyMarkdown,
      category: dto.category ?? "general",
      tags: dto.tags ?? [],
      isPublished: dto.isPublished,
      updatedAt: new Date()
    });
    await entityManager.persistAndFlush(guide);
    return this.toDetailDto(guide);
  }

  public async publishById(guideId: string): Promise<GuideDetailDto> {
    const entityManager = this.guideRepository.getEntityManager();
    const guide = await this.guideRepository.findOne({ id: guideId });
    if (!guide) {
      throw new NotFoundException("Guide not found.");
    }
    guide.isPublished = true;
    guide.updatedAt = new Date();
    await entityManager.persistAndFlush(guide);
    return this.toDetailDto(guide);
  }

  private toSummaryDto(guide: GuideEntity): GuideSummaryDto {
    return {
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      summary: guide.summary,
      locale: guide.locale,
      category: guide.category ?? "general",
      tags: guide.tags ?? [],
      updatedAt: guide.updatedAt.toISOString(),
      isPublished: guide.isPublished
    };
  }

  private toDetailDto(guide: GuideEntity): GuideDetailDto {
    return { ...this.toSummaryDto(guide), bodyMarkdown: guide.bodyMarkdown };
  }
}
