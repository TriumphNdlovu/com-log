/**
 * Post-build static generation.
 *
 * The site is a client-rendered SPA, which means Google, Bing, Slack, X,
 * LinkedIn and every RSS reader currently receive this:
 *
 *     <div id="root"></div>
 *
 * react-helmet-async writes the real <title> and og: tags only *after* JS
 * executes, which most crawlers and every link-preview bot will not wait for.
 * So every post on this blog is effectively invisible.
 *
 * This script runs after `vite build` and writes a real HTML file for each
 * route, with the article already rendered into #root and the metadata in
 * <head>. React still boots and takes over — readers get the terminal, bots
 * get readable HTML, and nobody has to run a server.
 *
 * Netlify serves a matching static file before it applies the `/* -> /index.html`
 * rewrite in public/_redirects, so these files win automatically.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import frontMatter from "front-matter";
import { marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = join(root, "src/posts");
const DIST = join(root, "dist");

const SITE = {
  url: "https://tiny-mooncake-80a739.netlify.app",
  title: "Commit Log",
  description:
    "Notes from the grind — bug postmortems, TILs and longer write-ups by Triumph Ndlovu.",
  author: "Triumph Ndlovu",
  lang: "en",
};

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const toISO = (d) => {
  const parsed = new Date(d);
  return isNaN(parsed) ? new Date().toISOString() : parsed.toISOString();
};

async function loadPosts() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(join(POSTS_DIR, file), "utf8");
      const { attributes, body } = frontMatter(raw);
      const words = body.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length;
      return {
        slug: file.replace(/\.md$/, ""),
        title: attributes.title ?? "Untitled",
        date: toISO(attributes.date),
        description: attributes.description ?? "",
        author: attributes.author ?? SITE.author,
        tags: Array.isArray(attributes.tags) ? attributes.tags : [],
        readingMinutes: Math.max(1, Math.ceil(words / 200)),
        html: marked.parse(body, { async: false }),
      };
    })
  );
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/** Injects head tags and prerendered body into the Vite-built index.html. */
function render(template, { head, body }) {
  return template
    // Drop the shell's default <title>/description so the page-specific ones
    // aren't duplicated — crawlers use the first they find.
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\n?/, "")
    .replace(/[ \t]*<meta\s+name="description"[\s\S]*?\/>\n?/, "")
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const pageHead = ({ title, description, url, type = "website", published, tags = [] }) =>
  [
    `    <title>${esc(title)}</title>`,
    `    <meta name="description" content="${esc(description)}" />`,
    `    <link rel="canonical" href="${url}" />`,
    `    <link rel="alternate" type="application/rss+xml" title="${esc(SITE.title)}" href="${SITE.url}/rss.xml" />`,
    `    <meta property="og:type" content="${type}" />`,
    `    <meta property="og:title" content="${esc(title)}" />`,
    `    <meta property="og:description" content="${esc(description)}" />`,
    `    <meta property="og:url" content="${url}" />`,
    `    <meta property="og:site_name" content="${esc(SITE.title)}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${esc(title)}" />`,
    `    <meta name="twitter:description" content="${esc(description)}" />`,
    published ? `    <meta property="article:published_time" content="${published}" />` : "",
    tags.map((t) => `    <meta property="article:tag" content="${esc(t)}" />`).join("\n"),
  ]
    .filter(Boolean)
    .join("\n");

const articleJsonLd = (post) =>
  `    <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: post.author },
    keywords: post.tags.join(", "),
    wordCount: post.readingMinutes * 200,
    mainEntityOfPage: `${SITE.url}/posts/${post.slug}`,
  })}</script>`;

/**
 * Prerendered markup is styled inline rather than with Tailwind classes: the
 * CSS file is hashed per build, and a bot that ignores stylesheets should
 * still get something legible.
 */
const articleBody = (post) => `
      <article style="max-width:46rem;margin:0 auto;padding:2.5rem 1.25rem;font-family:ui-monospace,monospace;color:#9affc2;background:#050505;line-height:1.7">
        <a href="/" style="color:#55dd99;text-decoration:none;font-size:.85rem">&larr; back to the terminal</a>
        <h1 style="color:#00ff90;margin:1.5rem 0 .5rem;font-size:1.9rem">${esc(post.title)}</h1>
        ${post.description ? `<p style="font-style:italic;opacity:.8;margin:0 0 .75rem">${esc(post.description)}</p>` : ""}
        <p style="color:#55dd99;font-size:.8rem;margin:0 0 2rem">
          <time datetime="${post.date}">${post.date.slice(0, 10)}</time> &middot; ${esc(post.author)} &middot; ${post.readingMinutes} min read
        </p>
        ${post.html}
      </article>`;

const archiveBody = (posts) => `
      <main style="max-width:46rem;margin:0 auto;padding:2.5rem 1.25rem;font-family:ui-monospace,monospace;color:#9affc2;background:#050505;line-height:1.7">
        <h1 style="color:#00ff90">${esc(SITE.title)} — archive</h1>
        <p style="color:#55dd99;font-size:.9rem">Every post, plain and scriptless. The <a href="/" style="color:#00ff90">terminal</a> is the fun way in.</p>
        <ul style="list-style:none;padding:0">
          ${posts
            .map(
              (p) => `<li style="margin:1.25rem 0">
            <a href="/posts/${p.slug}" style="color:#00ff90;font-size:1.05rem;text-decoration:none">${esc(p.title)}</a>
            <div style="color:#55dd99;font-size:.8rem">${p.date.slice(0, 10)} &middot; ${p.readingMinutes} min read</div>
            ${p.description ? `<div style="opacity:.8;font-size:.9rem">${esc(p.description)}</div>` : ""}
          </li>`
            )
            .join("\n")}
        </ul>
      </main>`;

const rss = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.title)}</title>
    <link>${SITE.url}</link>
    <description>${esc(SITE.description)}</description>
    <language>${SITE.lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE.url}/posts/${p.slug}</link>
      <guid isPermaLink="true">${SITE.url}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
      ${p.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
      <content:encoded xmlns:content="http://purl.org/rss/1.0/modules/content/"><![CDATA[${p.html}]]></content:encoded>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;

const sitemap = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE.url}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE.url}/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${SITE.url}/archive</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
${posts
  .map(
    (p) =>
      `  <url><loc>${SITE.url}/posts/${p.slug}</loc><lastmod>${p.date.slice(0, 10)}</lastmod><priority>0.8</priority></url>`
  )
  .join("\n")}
</urlset>
`;

async function emit(relPath, contents) {
  const full = join(DIST, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, contents, "utf8");
}

async function main() {
  const template = await readFile(join(DIST, "index.html"), "utf8");
  const posts = await loadPosts();

  for (const post of posts) {
    await emit(
      `posts/${post.slug}/index.html`,
      render(template, {
        head:
          pageHead({
            title: `${post.title} — ${SITE.title}`,
            description: post.description || SITE.description,
            url: `${SITE.url}/posts/${post.slug}`,
            type: "article",
            published: post.date,
            tags: post.tags,
          }) +
          "\n" +
          articleJsonLd(post),
        body: articleBody(post),
      })
    );
  }

  await emit(
    "archive/index.html",
    render(template, {
      head: pageHead({
        title: `Archive — ${SITE.title}`,
        description: SITE.description,
        url: `${SITE.url}/archive`,
      }),
      body: archiveBody(posts),
    })
  );

  await emit(
    "index.html",
    render(template, {
      head: pageHead({ title: `${SITE.title} — notes from the grind`, description: SITE.description, url: `${SITE.url}/` }),
      body: archiveBody(posts),
    })
  );

  await emit("rss.xml", rss(posts));
  await emit("sitemap.xml", sitemap(posts));
  await emit(
    "robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`
  );

  console.log(
    `static: ${posts.length} post pages + archive + rss.xml + sitemap.xml + robots.txt`
  );
}

main().catch((err) => {
  console.error("static generation failed:", err);
  process.exit(1);
});
