"use client";

import type { GuideSummaryDto, ScraperJobDto } from "@ffxiv-guide-engine/types";
import { MetricCard, PageShell, SectionHeader, StatusBadge } from "@ffxiv-guide-engine/ui";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base-url";

type SourceHealth = Readonly<{
  sourceKey: string;
  isHealthy: boolean;
  lastError?: string;
  checkedAt: string;
}>;

function getStatusTone(status: ScraperJobDto["status"]): "success" | "warning" | "danger" | "neutral" {
  if (status === "completed") {
    return "success";
  }
  if (status === "failed") {
    return "danger";
  }
  if (status === "running") {
    return "warning";
  }
  return "neutral";
}

export default function DashboardPage(): ReactElement {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ScraperJobDto[]>([]);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [guides, setGuides] = useState<GuideSummaryDto[]>([]);
  const [sourceKey, setSourceKey] = useState("lodestone-news");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [publishingGuideId, setPublishingGuideId] = useState<string | null>(null);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [isEnqueuing, setIsEnqueuing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("accessToken");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setToken(stored);
  }, [router]);

  const loadDashboardData = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }
    setErrorMessage(null);
    setIsLoadingData(true);
    const baseUrl = getApiBaseUrl();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const jobResponse = await fetch(`${baseUrl}/api/jobs`, { headers });
      if (!jobResponse.ok) {
        throw new Error("Jobs could not be loaded.");
      }
      const sourceResponse = await fetch(`${baseUrl}/api/sources/health`, { headers });
      if (!sourceResponse.ok) {
        throw new Error("Source health could not be loaded.");
      }
      const guidesResponse = await fetch(`${baseUrl}/api/guides/admin/all`, { headers });
      if (!guidesResponse.ok) {
        throw new Error("Guides could not be loaded.");
      }
      setJobs((await jobResponse.json()) as ScraperJobDto[]);
      setSources((await sourceResponse.json()) as SourceHealth[]);
      setGuides((await guidesResponse.json()) as GuideSummaryDto[]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Dashboard data could not be loaded.");
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const onEnqueue = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setIsEnqueuing(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sourceKey })
      });
      if (!response.ok) {
        throw new Error("Scraper job could not be enqueued.");
      }
      await loadDashboardData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Scraper job could not be enqueued.");
    } finally {
      setIsEnqueuing(false);
    }
  };

  const onRetry = async (jobId: string): Promise<void> => {
    if (!token) {
      return;
    }
    setRetryingJobId(jobId);
    setErrorMessage(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/jobs/${jobId}/retry`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed job could not be retried.");
      }
      await loadDashboardData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed job could not be retried.");
    } finally {
      setRetryingJobId(null);
    }
  };

  const onPublish = async (guideId: string): Promise<void> => {
    if (!token) {
      return;
    }
    setPublishingGuideId(guideId);
    setErrorMessage(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/guides/${guideId}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Guide could not be published.");
      }
      await loadDashboardData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Guide could not be published.");
    } finally {
      setPublishingGuideId(null);
    }
  };

  const categoryOptions: string[] = Array.from(new Set(guides.map((guide) => guide.category))).sort();
  const normalizedTagFilter: string = tagFilter.trim().toLowerCase();
  const filteredGuides: GuideSummaryDto[] = guides.filter((guide) => {
    const matchesCategory = categoryFilter === "all" || guide.category === categoryFilter;
    const matchesTag =
      normalizedTagFilter.length === 0 ||
      guide.tags.some((tag) => tag.toLowerCase().includes(normalizedTagFilter));
    return matchesCategory && matchesTag;
  });
  const draftGuides: GuideSummaryDto[] = filteredGuides.filter((guide) => !guide.isPublished);
  const publishedGuides: GuideSummaryDto[] = guides.filter((guide) => guide.isPublished);
  const healthySources = sources.filter((source) => source.isHealthy).length;
  const failedJobs = jobs.filter((job) => job.status === "failed").length;

  if (!token) {
    return <PageShell title="Loading">Authenticating…</PageShell>;
  }

  return (
    <PageShell
      eyebrow="Operations console"
      title="Command deck"
      subtitle="Monitor source health, run ingestion jobs, and approve draft intel before it reaches players."
      actions={
        <button disabled={isLoadingData} onClick={() => void loadDashboardData()} type="button">
          {isLoadingData ? "Refreshing..." : "Refresh data"}
        </button>
      }
    >
      {errorMessage ? (
        <p className="dashboard-message dashboard-message-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <section className="metric-grid">
        <MetricCard label="Guides" value={String(guides.length)} detail="Total content records" tone="blue" />
        <MetricCard label="Drafts" value={String(draftGuides.length)} detail="Waiting for review" tone="gold" />
        <MetricCard label="Published" value={String(publishedGuides.length)} detail="Visible on web" tone="violet" />
        <MetricCard label="Healthy sources" value={`${healthySources}/${sources.length}`} detail={`${failedJobs} failed jobs`} tone="blue" />
      </section>
      <section className="hero-panel">
        <div className="hero-content">
          <p className="eyebrow">Scraper control</p>
          <h2>Queue new intel</h2>
          <p>Run the Lodestone adapter, review the draft entries, then publish only the pieces worth showing.</p>
        </div>
        <form onSubmit={(event) => void onEnqueue(event)}>
          <label>
            Source key
            <input value={sourceKey} onChange={(event) => setSourceKey(event.target.value)} />
          </label>
          <button disabled={isEnqueuing} type="submit">
            {isEnqueuing ? "Enqueuing..." : "Enqueue"}
          </button>
        </form>
      </section>
      <div className="admin-grid">
        <section className="content-panel">
          <SectionHeader eyebrow="Job telemetry" title="Recent jobs" description="Watch source runs and retry failures." />
          <ul className="list-panel">
            {jobs.map((job) => (
              <li className="list-item" key={job.id}>
                <div className="card-topline">
                  <strong>{job.sourceKey}</strong>
                  <StatusBadge tone={getStatusTone(job.status)}>{job.status}</StatusBadge>
                </div>
                {job.errorMessage ? <p>{job.errorMessage}</p> : null}
                {job.status === "failed" ? (
                  <button
                    disabled={retryingJobId === job.id}
                    onClick={() => void onRetry(job.id)}
                    type="button"
                  >
                    {retryingJobId === job.id ? "Retrying..." : "Retry"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        <section className="content-panel">
          <SectionHeader eyebrow="Sources" title="Health board" description="Adapters report status after each run." />
          <ul className="list-panel">
            {sources.map((source) => (
              <li className="list-item" key={source.sourceKey}>
                <div className="card-topline">
                  <strong>{source.sourceKey}</strong>
                  <StatusBadge tone={source.isHealthy ? "success" : "danger"}>
                    {source.isHealthy ? "healthy" : "unhealthy"}
                  </StatusBadge>
                </div>
                {source.lastError ? <p>{source.lastError}</p> : <p>Last checked: {source.checkedAt}</p>}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section>
        <SectionHeader
          eyebrow="Editorial queue"
          title="Draft review"
          description="Filter by category or tag, then publish entries that are ready for players."
        />
        <div className="toolbar">
          <label>
            Category
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">all</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tag
            <input value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} />
          </label>
        </div>
        <div className="guide-grid">
          {filteredGuides.map((guide) => (
            <article className="guide-card editorial-card" key={guide.id}>
              <div className="card-topline">
                <StatusBadge tone={guide.isPublished ? "success" : "warning"}>
                  {guide.isPublished ? "published" : "draft"}
                </StatusBadge>
                <span className="category-pill">{guide.category}</span>
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.summary}</p>
              <div className="tag-row">
                {guide.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              {!guide.isPublished ? (
                <button
                  disabled={publishingGuideId === guide.id}
                  onClick={() => void onPublish(guide.id)}
                  type="button"
                >
                  {publishingGuideId === guide.id ? "Publishing..." : "Publish"}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
