import type { ReactNode } from "react";

export type PageShellProps = Readonly<{
  title: string;
  children: ReactNode;
}>;

/**
 * Minimal layout shell shared by web and admin apps.
 */
export function PageShell(props: PageShellProps): ReactNode {
  return (
    <div style={{ fontFamily: "system-ui", padding: "1.5rem" }}>
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.25rem" }}>{props.title}</h1>
      </header>
      <main>{props.children}</main>
    </div>
  );
}
