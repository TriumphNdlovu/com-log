import frontMatter from "front-matter";

/**
 * Every post is read once, eagerly, at build time. The previous version did
 * this here *and* again via a dynamic `import('../posts/${slug}.md?raw')` in
 * Post.tsx, so each article was bundled twice: once in the main chunk and
 * once as its own lazy chunk. One source of truth now.
 *
 * If the archive ever grows past ~100 posts, split this: keep frontmatter
 * eager for the index/search and move bodies to a lazy glob.
 */
const postFiles = import.meta.glob("../posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
  readingMinutes: number;
}

export interface Post extends PostMeta {
  body: string;
}

interface PostAttributes {
  title?: string;
  date?: string | Date;
  description?: string;
  author?: string;
  tags?: string[] | string;
}

const normaliseTags = (raw: PostAttributes["tags"]): string[] => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  return [...new Set(list.map((t) => String(t).trim().toLowerCase()).filter(Boolean))];
};

/** Strips code fences and markdown punctuation so the count reflects prose. */
export const readingMinutes = (text: string): number => {
  const words = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const allPosts: Post[] = Object.entries(postFiles)
  .map(([path, raw]) => {
    const { attributes, body } = frontMatter<PostAttributes>(raw);
    // A YAML date without quotes parses to a Date; with quotes it stays a
    // string. Normalising here stops the sort from silently producing NaN.
    const date =
      attributes.date instanceof Date
        ? attributes.date.toISOString().slice(0, 10)
        : String(attributes.date ?? "");

    return {
      slug: path.split("/").pop()!.replace(/\.md$/, ""),
      title: attributes.title ?? "Untitled",
      date,
      description: attributes.description ?? "",
      author: attributes.author ?? "Triumph Ndlovu",
      tags: normaliseTags(attributes.tags),
      readingMinutes: readingMinutes(body),
      body,
    };
  })
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

/** Metadata only — what the terminal listing and feeds need. */
export const posts: PostMeta[] = allPosts.map((p) => ({
  slug: p.slug,
  title: p.title,
  date: p.date,
  description: p.description,
  author: p.author,
  tags: p.tags,
  readingMinutes: p.readingMinutes,
}));

export const getPost = (slug: string): Post | undefined =>
  allPosts.find((p) => p.slug === slug);

export const allTags: { tag: string; count: number }[] = Object.entries(
  allPosts.reduce<Record<string, number>>((acc, p) => {
    p.tags.forEach((t) => (acc[t] = (acc[t] ?? 0) + 1));
    return acc;
  }, {})
)
  .map(([tag, count]) => ({ tag, count }))
  .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

export const postsByTag = (tag: string): PostMeta[] =>
  posts.filter((p) => p.tags.includes(tag.toLowerCase()));

export interface SearchHit {
  post: PostMeta;
  /** Matching line from the body, trimmed — shown like `grep` output. */
  excerpt: string;
  line: number;
}

/**
 * Full-text search across title, description, tags and body. Deliberately
 * dumb and synchronous: the whole corpus is already in memory and this is a
 * personal blog, not an index that needs Lucene.
 */
export const searchPosts = (query: string): SearchHit[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchHit[] = [];
  for (const post of allPosts) {
    const haystack = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
    const lines = post.body.split("\n");
    const bodyIndex = lines.findIndex((l) => l.toLowerCase().includes(q));

    if (bodyIndex === -1 && !haystack.includes(q)) continue;

    const raw = bodyIndex >= 0 ? lines[bodyIndex] : post.description || post.title;
    const excerpt = raw.replace(/^[#>\s*-]+/, "").trim().slice(0, 120);
    hits.push({ post, excerpt, line: bodyIndex >= 0 ? bodyIndex + 1 : 0 });
  }
  return hits;
};

/** Previous/next in reverse-chronological order, for post footers. */
export const adjacentPosts = (slug: string) => {
  const i = posts.findIndex((p) => p.slug === slug);
  return {
    newer: i > 0 ? posts[i - 1] : undefined,
    older: i >= 0 && i < posts.length - 1 ? posts[i + 1] : undefined,
  };
};
