"use client";

import type { GuideSummaryDto, ScraperJobDto } from "@ffxiv-guide-engine/types";
import { GuideCard, MetricCard, PageShell, SectionHeader, StatusBadge } from "@ffxiv-guide-engine/ui";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const stored = localStorage.getItem("accessToken");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setToken(stored);
  }, [router]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const baseUrl = getApiBaseUrl();
    const headers = { Authorization: `Bearer ${token}` };
    void (async () => {
      const jobResponse = await fetch(`${baseUrl}/api/jobs`, { headers });
      if (jobResponse.ok) {
        setJobs((await jobResponse.json()) as ScraperJobDto[]);
      }
      const sourceResponse = await fetch(`${baseUrl}/api/sources/health`, { headers });
      if (sourceResponse.ok) {
        setSources((await sourceResponse.json()) as SourceHealth[]);
      }
      const guidesResponse = await fetch(`${baseUrl}/api/guides/admin/all`, { headers });
      if (guidesResponse.ok) {
        setGuides((await guidesResponse.json()) as GuideSummaryDto[]);
      }
    })();
  }, [token]);

  const onEnqueue = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!token) {
      return;
    }
    const response = await fetch(`${getApiBaseUrl()}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sourceKey })
    });
    if (!response.ok) {
      return;
    }
    const job = (await response.json()) as ScraperJobDto;
    setJobs((previous) => [job, ...previous]);
  };

  const onRetry = async (jobId: string): Promise<void> => {
    if (!token) {
      return;
    }
    const response = await fetch(`${getApiBaseUrl()}/api/jobs/${jobId}/retry`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      return;
    }
    const retried = (await response.json()) as ScraperJobDto;
    setJobs((previous) => previous.map((item) => (item.id === retried.id ? retried : item)));
  };

  const onPublish = async (guideId: string): Promise<void> => {
    if (!token) {
      return;
    }
    const response = await fetch(`${getApiBaseUrl()}/api/guides/${guideId}/publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      return;
    }
    setGuides((previous) =>
      previous.map((item) =>
        item.id === guideId
          ? {
              ...item,
              isPublished: true
            }
          : item
      )
    );
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
    >
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
          <button type="submit">Enqueue</button>
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
                  <button onClick={() => void onRetry(job.id)} type="button">
                    Retry
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
            <article className="guide-card" key={guide.id}>
              <GuideCard
                title={guide.title}
                summary={guide.summary}
                category={guide.category}
                tags={guide.tags}
                statusLabel={guide.isPublished ? "published" : "draft"}
              />
              {!guide.isPublished ? (
                <button onClick={() => void onPublish(guide.id)} type="button">
                  Publish
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
