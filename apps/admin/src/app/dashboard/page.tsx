"use client";

import type { GuideSummaryDto, ScraperJobDto } from "@ffxiv-guide-engine/types";
import { PageShell } from "@ffxiv-guide-engine/ui";
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

  if (!token) {
    return <PageShell title="Loading">Authenticating…</PageShell>;
  }

  return (
    <PageShell title="Operations">
      <section>
        <h2>Enqueue scraper job</h2>
        <form onSubmit={(event) => void onEnqueue(event)}>
          <input value={sourceKey} onChange={(event) => setSourceKey(event.target.value)} />
          <button type="submit">Enqueue</button>
        </form>
      </section>
      <section>
        <h2>Recent jobs</h2>
        <ul>
          {jobs.map((job) => (
            <li key={job.id}>
              {job.sourceKey} — {job.status}
              {job.status === "failed" ? (
                <button onClick={() => void onRetry(job.id)} type="button">
                  Retry
                </button>
              ) : null}
              {job.errorMessage ? <span> ({job.errorMessage})</span> : null}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Source health</h2>
        <ul>
          {sources.map((source) => (
            <li key={source.sourceKey}>
              {source.sourceKey}: {source.isHealthy ? "healthy" : "unhealthy"}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Guides (all)</h2>
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
        <ul>
          {filteredGuides.map((guide) => (
            <li key={guide.id}>
              {guide.locale}/{guide.slug} — {guide.title} [{guide.category}] ({guide.tags.join(", ")}){" "}
              ({guide.isPublished ? "published" : "draft"})
              {!guide.isPublished ? (
                <button onClick={() => void onPublish(guide.id)} type="button">
                  Publish
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
