import { Helmet } from "react-helmet-async";
import { adjacentPosts, getPost } from "../lib/posts";
import Markdown from "../components/Markdown";

interface PostProps {
  slug: string;
  /** Called when a reader clicks prev/next, so the terminal can run `cat`. */
  onOpenPost?: (slug: string) => void;
}

/** No path separators or traversal — the slug indexes an in-memory list. */
const isValidSlug = (slug: string) => /^[a-zA-Z0-9_-]+$/.test(slug);

export const SITE_URL = "https://tiny-mooncake-80a739.netlify.app";

const formatDate = (value: string) => {
  const d = new Date(value);
  // "en-UK" is not a real locale tag — it silently fell back to the browser
  // default. The correct tag for UK English is "en-GB".
  return isNaN(d.getTime())
    ? "Unknown date"
    : d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
};

export default function Post({ slug, onOpenPost }: PostProps) {
  const post = isValidSlug(slug) ? getPost(slug) : undefined;

  if (!post) {
    return (
      <p role="alert" className="text-[var(--err)]">
        cat: {slug}.md: No such file or directory
      </p>
    );
  }

  const canonicalUrl = `${SITE_URL}/posts/${post.slug}`;
  const { newer, older } = adjacentPosts(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    keywords: post.tags.join(", "),
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  return (
    <article className="mx-auto max-w-3xl text-[var(--fg-dim)]">
      <Helmet>
        <title>{post.title} — Commit Log</title>
        <meta name="description" content={post.description} />
        <meta name="author" content={post.author} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Commit Log" />
        <meta property="article:published_time" content={post.date} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="mb-8 border-b border-[var(--line)] pb-6">
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
          Field note / {post.slug}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-[var(--fg)] sm:text-4xl md:text-5xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-2 italic text-[var(--fg-dim)]/80">{post.description}</p>
        )}
        <p className="mt-3 text-xs tracking-wide text-[var(--fg-muted)]">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.author} ·{" "}
          {post.readingMinutes} min read
        </p>
        {post.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <li
                key={t}
                className="rounded border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--fg-muted)]"
              >
                #{t}
              </li>
            ))}
          </ul>
        )}
      </header>

      <Markdown>{post.body}</Markdown>

      <footer className="mt-10 border-t border-[var(--line)] pt-4 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {older ? (
            <button
              type="button"
              onClick={() => onOpenPost?.(older.slug)}
              className="text-left text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
            >
              ← {older.title}
            </button>
          ) : (
            <span />
          )}
          {newer && (
            <button
              type="button"
              onClick={() => onOpenPost?.(newer.slug)}
              className="text-right text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
            >
              {newer.title} →
            </button>
          )}
        </div>
        <p className="mt-4 text-xs text-[var(--fg-muted)]">
          <code>clear</code> to wipe the screen · <code>cd ..</code> to go back ·{" "}
          <code>ls</code> to list posts
        </p>
      </footer>
    </article>
  );
}
