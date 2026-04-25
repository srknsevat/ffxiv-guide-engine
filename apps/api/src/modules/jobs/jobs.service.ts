import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/core";
import { randomUUID } from "node:crypto";
import type { ScraperJobDto } from "@ffxiv-guide-engine/types";
import { ScraperJobEntity } from "../../entities/scraper-job.entity";
import { CreateJobDto } from "./dto/create-job.dto";

/**
 * Creates and lists scraper jobs for workers and admin.
 */
@Injectable()
export class JobsService {
  public constructor(
    @InjectRepository(ScraperJobEntity)
    private readonly jobRepository: EntityRepository<ScraperJobEntity>
  ) {}

  public async enqueue(dto: CreateJobDto): Promise<ScraperJobDto> {
    const entityManager = this.jobRepository.getEntityManager();
    const job = entityManager.create(ScraperJobEntity, {
      id: randomUUID(),
      sourceKey: dto.sourceKey,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await entityManager.persistAndFlush(job);
    return this.toDto(job);
  }

  public async retry(jobId: string): Promise<ScraperJobDto> {
    const job = await this.jobRepository.findOne({ id: jobId });
    if (!job) {
      throw new NotFoundException("Job not found.");
    }
    if (job.status !== "failed") {
      return this.toDto(job);
    }
    job.status = "pending";
    job.errorMessage = undefined;
    job.updatedAt = new Date();
    await this.jobRepository.getEntityManager().persistAndFlush(job);
    return this.toDto(job);
  }

  public async listRecent(limit = 50): Promise<ScraperJobDto[]> {
    const rows = await this.jobRepository.find({}, { orderBy: { createdAt: "desc" }, limit });
    return rows.map((j) => this.toDto(j));
  }

  public async claimNextPending(): Promise<ScraperJobDto | null> {
    const entityManager = this.jobRepository.getEntityManager();
    return entityManager.transactional(async (trx) => {
      const pending = await trx.findOne(
        ScraperJobEntity,
        { status: "pending" },
        { orderBy: { createdAt: "asc" } }
      );
      if (!pending) {
        return null;
      }
      pending.status = "running";
      pending.updatedAt = new Date();
      await trx.flush();
      return this.toDto(pending);
    });
  }

  public async complete(dto: {
    jobId: string;
    status: "completed" | "failed";
    errorMessage?: string;
  }): Promise<ScraperJobDto> {
    const job = await this.jobRepository.findOne({ id: dto.jobId });
    if (!job) {
      throw new NotFoundException("Job not found.");
    }
    job.status = dto.status;
    job.errorMessage = dto.errorMessage;
    job.updatedAt = new Date();
    await this.jobRepository.getEntityManager().persistAndFlush(job);
    return this.toDto(job);
  }

  private toDto(job: ScraperJobEntity): ScraperJobDto {
    return {
      id: job.id,
      sourceKey: job.sourceKey,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      errorMessage: job.errorMessage
    };
  }
}
