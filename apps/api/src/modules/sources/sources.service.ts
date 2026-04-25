import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/core";
import { SourceHealthEntity } from "../../entities/source-health.entity";
import { ReportSourceHealthDto } from "./dto/report-source-health.dto";

export type SourceHealthResponse = Readonly<{
  sourceKey: string;
  isHealthy: boolean;
  lastError?: string;
  checkedAt: string;
}>;

/**
 * Tracks external source availability for admin dashboards.
 */
@Injectable()
export class SourcesService {
  public constructor(
    @InjectRepository(SourceHealthEntity)
    private readonly sourceRepository: EntityRepository<SourceHealthEntity>
  ) {}

  public async list(): Promise<SourceHealthResponse[]> {
    const rows = await this.sourceRepository.find({}, { orderBy: { sourceKey: "asc" } });
    return rows.map((s) => this.toResponse(s));
  }

  public async report(dto: ReportSourceHealthDto): Promise<SourceHealthResponse> {
    const entityManager = this.sourceRepository.getEntityManager();
    let row = await this.sourceRepository.findOne({ sourceKey: dto.sourceKey });
    if (!row) {
      row = entityManager.create(SourceHealthEntity, {
        sourceKey: dto.sourceKey,
        isHealthy: dto.isHealthy,
        lastError: dto.lastError,
        checkedAt: new Date()
      });
    } else {
      row.isHealthy = dto.isHealthy;
      row.lastError = dto.lastError;
      row.checkedAt = new Date();
    }
    await entityManager.persistAndFlush(row);
    return this.toResponse(row);
  }

  private toResponse(row: SourceHealthEntity): SourceHealthResponse {
    return {
      sourceKey: row.sourceKey,
      isHealthy: row.isHealthy,
      lastError: row.lastError,
      checkedAt: row.checkedAt.toISOString()
    };
  }
}
