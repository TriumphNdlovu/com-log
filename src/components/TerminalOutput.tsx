import type { ReactNode } from "react";

/** Monospaced block used for command output that is already formatted. */
export const Pre = ({ children }: { children: ReactNode }) => (
  <pre className="whitespace-pre-wrap leading-relaxed text-[var(--fg-dim)]">{children}</pre>
);

/** One row in a post listing — `ls posts`, `tag`, `recent`. */
export const PostRow = ({
  slug,
  title,
  date,
  minutes,
}: {
  slug: string;
  title: string;
  date: string;
  minutes: number;
}) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-[var(--line)]/40 py-1">
    <span className="text-[var(--fg)]">
      <span className="text-[var(--fg-muted)]">&gt;</span> {title}
    </span>
    <span className="text-xs text-[var(--fg-muted)]">
      {date} · {minutes} min · {slug}.md
    </span>
  </div>
);
