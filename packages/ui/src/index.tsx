import type { ReactNode } from "react";

export type PageShellProps = Readonly<{
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}>;

export type HeroStat = Readonly<{
  label: string;
  value: string;
}>;

export type HeroSectionProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: readonly HeroStat[];
}>;

export type GuideCardProps = Readonly<{
  href?: string;
  title: string;
  summary: string;
  category: string;
  tags: readonly string[];
  updatedAt?: string;
  statusLabel?: string;
}>;

export type CategoryPillProps = Readonly<{
  label: string;
  isActive?: boolean;
}>;

export type StatusBadgeProps = Readonly<{
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral";
}>;

export type MetricCardProps = Readonly<{
  label: string;
  value: string;
  detail?: string;
  tone?: "gold" | "blue" | "violet";
}>;

export type SectionHeaderProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}>;

/**
 * Themed layout shell shared by web and admin apps.
 */
export function PageShell(props: PageShellProps): ReactNode {
  return (
    <div className="app-shell">
      <header className="shell-header">
        <div>
          {props.eyebrow ? <p className="eyebrow">{props.eyebrow}</p> : null}
          <h1>{props.title}</h1>
          {props.subtitle ? <p className="shell-subtitle">{props.subtitle}</p> : null}
        </div>
        {props.actions ? <div className="shell-actions">{props.actions}</div> : null}
      </header>
      <main>{props.children}</main>
    </div>
  );
}

/**
 * Large marketing section for gamer-facing landing pages.
 */
export function HeroSection(props: HeroSectionProps): ReactNode {
  return (
    <section className="hero-panel">
      <div className="hero-content">
        <p className="eyebrow">{props.eyebrow}</p>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
        {props.actions ? <div className="hero-actions">{props.actions}</div> : null}
      </div>
      {props.stats ? (
        <div className="hero-stats">
          {props.stats.map((stat) => (
            <div className="hero-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Card representation for guide and news summaries.
 */
export function GuideCard(props: GuideCardProps): ReactNode {
  const content = (
    <>
      <div className="card-topline">
        <CategoryPill label={props.category} />
        {props.statusLabel ? <StatusBadge tone="neutral">{props.statusLabel}</StatusBadge> : null}
      </div>
      <h3>{props.title}</h3>
      <p>{props.summary}</p>
      <div className="tag-row">
        {props.tags.slice(0, 4).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      {props.updatedAt ? <span className="card-date">{props.updatedAt}</span> : null}
    </>
  );
  if (!props.href) {
    return <article className="guide-card">{content}</article>;
  }
  return (
    <a className="guide-card guide-card-link" href={props.href}>
      {content}
    </a>
  );
}

/**
 * Compact category chip used for filtering and metadata.
 */
export function CategoryPill(props: CategoryPillProps): ReactNode {
  return <span className={props.isActive ? "category-pill is-active" : "category-pill"}>{props.label}</span>;
}

/**
 * Small status label for jobs, source health, and publication state.
 */
export function StatusBadge(props: StatusBadgeProps): ReactNode {
  return <span className={`status-badge status-${props.tone ?? "neutral"}`}>{props.children}</span>;
}

/**
 * Dashboard metric card.
 */
export function MetricCard(props: MetricCardProps): ReactNode {
  return (
    <article className={`metric-card metric-${props.tone ?? "blue"}`}>
      <span>{props.label}</span>
      <strong>{props.value}</strong>
      {props.detail ? <p>{props.detail}</p> : null}
    </article>
  );
}

/**
 * Consistent section heading block.
 */
export function SectionHeader(props: SectionHeaderProps): ReactNode {
  return (
    <div className="section-header">
      <div>
        {props.eyebrow ? <p className="eyebrow">{props.eyebrow}</p> : null}
        <h2>{props.title}</h2>
        {props.description ? <p>{props.description}</p> : null}
      </div>
      {props.action ? <div>{props.action}</div> : null}
    </div>
  );
}
