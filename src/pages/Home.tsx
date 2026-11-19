import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { posts } from "../lib/posts";
import { commandMap, commandNames, type CommandResult, type OutputLine } from "../lib/commands";
import { applyTheme, loadTheme, type Theme } from "../lib/theme";
import About from "./About";
const Post = lazy(() => import("./Post"));

const PostFallback = () => (
  <p className="text-[var(--fg-muted)]" role="status">loading archive<span className="animate-blink">_</span></p>
);

type FSNode = { type: "file" } | { type: "dir"; children: Record<string, FSNode> };

const fileSystem: FSNode = {
  type: "dir",
  children: {
    "about.txt": { type: "file" },
    posts: { type: "dir", children: Object.fromEntries(posts.map((p) => [`${p.slug}.md`, { type: "file" as const }])) },
  },
};

const getNode = (segments: string[]): FSNode | null => {
  let node: FSNode = fileSystem;
  for (const seg of segments) {
    if (node.type !== "dir" || !node.children[seg]) return null;
    node = node.children[seg];
  }
  return node;
};

const SITE_TITLE = "Commit Log — field notes for curious builders";
const QUICK = ["recent", "ls posts", "find cloud", "whoami", "theme paper"];

export default function Terminal() {
  const params = useParams<{ slug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [history, setHistory] = useState<OutputLine[]>([]);
  const [input, setInput] = useState("");
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState(SITE_TITLE);
  const [theme, setThemeState] = useState<Theme>("midnight");
  const [showCommandMenu, setShowCommandMenu] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const skipSyncRef = useRef(false);
  const tabCycleRef = useRef(0);
  const runRef = useRef<(cmd: string) => void>(() => {});

  const displayPath = pathStack.length ? `~/archive/${pathStack.join("/")}` : "~/commit-log";

  useEffect(() => {
    const saved = loadTheme();
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  }, []);

  const listDir = useCallback((segments: string[]): string[] | null => {
    const node = getNode(segments);
    if (node?.type !== "dir") return null;
    return Object.entries(node.children).map(([n, v]) => (v.type === "dir" ? `${n}/` : n));
  }, []);

  const resolveTarget = useCallback((target: string): string[] | null => {
    const parts = target.replace(/^~\/?/, "").split("/").filter(Boolean);
    const stack = target.startsWith("~") || target.startsWith("/") ? [] : [...pathStack];
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") stack.pop();
      else stack.push(part);
    }
    return getNode(stack) ? stack : null;
  }, [pathStack]);

  const openFile = useCallback((dirSegments: string[], file: string): CommandResult => {
    const node = getNode(dirSegments);
    const exists = node?.type === "dir" && !!node.children[file];
    if (file === "about.txt" && exists) {
      return { output: [{ content: <About /> }], navigateTo: "/about", title: "About — Commit Log" };
    }
    if (file.endsWith(".md") && exists) {
      const slug = file.replace(/\.md$/, "");
      const post = posts.find((p) => p.slug === slug);
      return {
        output: [{ content: (
          <Suspense fallback={<PostFallback />}>
            <Post slug={slug} onOpenPost={(s) => runRef.current(`open ${s}`)} />
          </Suspense>
        ) }],
        navigateTo: `/posts/${slug}`,
        title: post ? `${post.title} — Commit Log` : "Commit Log",
      };
    }
    return { output: [{ content: `cat: ${file}: No such file or directory`, isError: true }] };
  }, []);

  const run = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const spaceIdx = trimmed.indexOf(" ");
    const name = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();
    const rest = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(null);
    const def = commandMap.get(name);
    if (!def) {
      setHistory((prev) => [...prev,
        { content: `> ${trimmed}` },
        { content: `comlog: '${name}' is not a recognised command. Try 'help'.`, isError: true },
      ]);
      return;
    }

    const result = def.run({ rest, pathStack, setPathStack, commandHistory, displayPath, resolveTarget, listDir, openFile,
      clear: () => setHistory([]), setTheme, theme });
    if (result.replaceHistory) return;
    if (result.navigateTo && !result.output[0]?.isError) {
      skipSyncRef.current = true;
      if (result.title) setPageTitle(result.title);
      navigate(result.navigateTo);
    }
    setHistory((prev) => [...prev, { content: `> ${trimmed}` }, ...result.output]);
  }, [commandHistory, displayPath, listDir, navigate, openFile, pathStack, resolveTarget, setTheme, theme]);

  useEffect(() => { runRef.current = run; }, [run]);

  useEffect(() => {
    if (skipSyncRef.current) { skipSyncRef.current = false; return; }
    if (location.pathname === "/about") {
      setPathStack([]); setHistory([{ content: "> whoami" }, { content: <About /> }]); setPageTitle("About — Commit Log"); return;
    }
    if (params.slug) {
      const post = posts.find((p) => p.slug === params.slug);
      setPathStack(["posts"]);
      setHistory([{ content: `> cat posts/${params.slug}.md` }, post ? { content: (
        <Suspense fallback={<PostFallback />}><Post slug={params.slug} onOpenPost={(s) => runRef.current(`open ${s}`)} /></Suspense>
      ) } : { content: `cat: ${params.slug}.md: No such file or directory`, isError: true }]);
      setPageTitle(post ? `${post.title} — Commit Log` : "Not found — Commit Log"); return;
    }
    if (location.pathname !== "/") {
      setPathStack([]);
      setHistory([{ content: `> cd ${location.pathname}` }, { content: `cd: ${location.pathname}: No such file or directory`, isError: true }]);
      setPageTitle("404 — Commit Log"); return;
    }
    setPathStack([]); setPageTitle(SITE_TITLE);
    setHistory([{ content: (
      <div className="py-1">
        <div className="text-[var(--fg)]"><span className="text-[var(--accent)]">●</span> Archive online</div>
        <div className="mt-1 text-sm text-[var(--fg-muted)]">{posts.length} field notes · type <button onClick={() => run("help")} className="text-[var(--accent)] underline underline-offset-4">help</button> or choose a quick action below.</div>
      </div>
    ) }]);
  }, [location.pathname, params.slug]);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setHistory([]); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      const spaceIdx = input.indexOf(" ");
      const pool = spaceIdx === -1 ? commandNames : (listDir(pathStack) ?? []).concat(posts.map((p) => p.slug));
      const prefix = spaceIdx === -1 ? input : input.slice(spaceIdx + 1);
      const matches = pool.filter((n) => n.startsWith(prefix));
      if (!matches.length) return;
      const pick = matches[tabCycleRef.current % matches.length]; tabCycleRef.current += 1;
      setInput(spaceIdx === -1 ? pick : `${input.slice(0, spaceIdx)} ${pick}`); return;
    }
    tabCycleRef.current = 0;
    if (e.key === "ArrowUp") {
      e.preventDefault(); const next = historyIndex === null ? commandHistory.length - 1 : historyIndex - 1;
      if (next >= 0) { setInput(commandHistory[next]); setHistoryIndex(next); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next < commandHistory.length) { setInput(commandHistory[next]); setHistoryIndex(next); }
      else { setInput(""); setHistoryIndex(null); }
    }
  };

  return (
    <>
      <Helmet><title>{pageTitle}</title><html data-theme={theme} lang="en" /></Helmet>
      <a className="sr-only skip-link" href="#terminal">Skip to terminal</a>

      <div className="min-h-screen px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
        <header className="mx-auto mb-3 flex max-w-6xl items-end justify-between gap-4 px-1">
          <button type="button" onClick={() => navigate("/")} className="text-left" aria-label="Return to home">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_rgb(var(--glow)/0.7)]" />
              <span className="text-sm font-bold tracking-[0.18em] text-[var(--fg)]">COMMIT/LOG</span>
            </div>
            <p className="mt-1 hidden text-xs text-[var(--fg-muted)] sm:block">notes from the build log</p>
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowCommandMenu((v) => !v)} aria-expanded={showCommandMenu}
              className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--fg-dim)] hover:border-[var(--accent)]">
              commands
            </button>
            <button type="button" onClick={() => run("theme " + (theme === "paper" ? "midnight" : "paper"))}
              title="Toggle paper theme" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-[var(--accent)]">
              <span className="text-sm">◐</span><span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </header>

        {showCommandMenu && (
          <nav aria-label="Command menu" className="mx-auto mb-3 max-w-6xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2 shadow-2xl">
            <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
              {["help", "ls", "recent", "tags", "whoami"].map((command) => (
                <button key={command} type="button" onClick={() => { run(command); setShowCommandMenu(false); }}
                  className="whitespace-nowrap rounded-md px-3 py-2 text-xs text-[var(--fg-dim)] hover:bg-[var(--panel-raised)] hover:text-[var(--accent)]">{command}</button>
              ))}
            </div>
          </nav>
        )}

        <main id="terminal" className="mx-auto flex min-h-[calc(100vh-7.25rem)] max-w-6xl flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]/95 shadow-[0_24px_80px_rgb(0_0_0/0.28)] sm:min-h-[calc(100vh-8.25rem)]">
          <div className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--chrome)] px-3 sm:px-5">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--err)]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]/45" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--fg-muted)]/50" />
            </div>
            <div className="min-w-0 flex-1 text-center">
              <span className="text-xs text-[var(--fg-muted)]">triumpn@commit-log</span>
              <span className="hidden text-xs text-[var(--fg-muted)] sm:inline"> · {displayPath}</span>
            </div>
            <span className="rounded border border-[var(--line)] px-2 py-1 text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">live</span>
          </div>

          <div className="scrollbar-hidden flex-1 overflow-y-auto px-4 py-5 font-mono text-[14px] leading-relaxed sm:px-7 sm:py-7 lg:px-10"
            role="log" aria-live="polite" onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}>
            {history.map((h, i) => (
              <div key={i} className={h.isError ? "text-[var(--err)]" : "text-[var(--fg-dim)]"}>{h.content}</div>
            ))}

            <form onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }} className="mt-4 flex items-center gap-2 border-t border-[var(--line)] pt-4">
              <label htmlFor="prompt" className="hidden shrink-0 text-xs sm:block">
                <span className="text-[var(--accent)]">triumpn</span><span className="text-[var(--fg-muted)]">:{displayPath}$</span>
              </label>
              <span aria-hidden="true" className="text-[var(--accent)] sm:hidden">›</span>
              <input id="prompt" ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Terminal command input"
                className="min-w-0 flex-1 border-none bg-transparent text-[var(--fg)] caret-[var(--accent)] outline-none" />
            </form>
            <div ref={endRef} />
          </div>

          <div className="scrollbar-hidden flex shrink-0 gap-2 overflow-x-auto border-t border-[var(--line)] bg-[var(--chrome)] px-3 py-2.5">
            {QUICK.map((c) => (
              <button key={c} type="button" onClick={() => run(c)}
                className="whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">{c}</button>
            ))}
          </div>
        </main>

        <footer className="mx-auto flex max-w-6xl items-center justify-between px-1 pt-3 text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)] sm:text-xs">
          <span>© {new Date().getFullYear()} Triumph Ndlovu</span>
          <div className="flex gap-4"><a className="hover:text-[var(--accent)]" href="https://triumph-portfolio-seven.vercel.app/" target="_blank" rel="noopener noreferrer">portfolio</a><a className="hover:text-[var(--accent)]" href="/rss.xml">rss</a></div>
        </footer>
      </div>
    </>
  );
}
