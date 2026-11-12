import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { posts } from "../lib/posts";
import { commandMap, commandNames, type CommandResult, type OutputLine } from "../lib/commands";
import { applyTheme, loadTheme, type Theme } from "../lib/theme";
import About from "./About";
// Markdown + syntax highlighting is ~60% of the JS on this site and nobody
// needs it until they open a post. Splitting it keeps first paint cheap.
const Post = lazy(() => import("./Post"));

const PostFallback = () => (
  <p className="text-[var(--fg-muted)]" role="status">
    loading post<span className="animate-blink">_</span>
  </p>
);
import Animal from "./Animal";
import SpeechBox from "../components/SpeechBox";

type FSNode = { type: "file" } | { type: "dir"; children: Record<string, FSNode> };

const fileSystem: FSNode = {
  type: "dir",
  children: {
    "about.txt": { type: "file" },
    posts: {
      type: "dir",
      children: Object.fromEntries(posts.map((p) => [`${p.slug}.md`, { type: "file" as const }])),
    },
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

const SITE_TITLE = "Commit Log — notes from the grind";
const QUICK = ["help", "ls posts", "recent", "find cloud", "whoami", "theme amber"];

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
  const [theme, setThemeState] = useState<Theme>("green");
  const [tips, setTips] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const skipSyncRef = useRef(false);
  const tabCycleRef = useRef(0);
  // `openFile` and the URL-sync effect are memoised with empty deps, so they
  // would otherwise capture the first render's `run` and its stale state.
  const runRef = useRef<(cmd: string) => void>(() => {});

  const displayPath = pathStack.length ? `~/${pathStack.join("/")}` : "~";

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

  const resolveTarget = useCallback(
    (target: string): string[] | null => {
      const parts = target.replace(/^~\/?/, "").split("/").filter(Boolean);
      const stack = target.startsWith("~") || target.startsWith("/") ? [] : [...pathStack];
      for (const part of parts) {
        if (part === ".") continue;
        else if (part === "..") stack.pop();
        else stack.push(part);
      }
      return getNode(stack) ? stack : null;
    },
    [pathStack]
  );

  /** Resolves a filename to renderable output plus the URL it should own. */
  const openFile = useCallback(
    (dirSegments: string[], file: string): CommandResult => {
      const node = getNode(dirSegments);
      const exists = node?.type === "dir" && !!node.children[file];

      if (file === "about.txt" && exists) {
        return { output: [{ content: <About /> }], navigateTo: "/about", title: "About — Commit Log" };
      }
      if (file.endsWith(".md") && exists) {
        const slug = file.replace(/\.md$/, "");
        const post = posts.find((p) => p.slug === slug);
        return {
          output: [{
            content: (
              <Suspense fallback={<PostFallback />}>
                <Post slug={slug} onOpenPost={(s) => runRef.current(`open ${s}`)} />
              </Suspense>
            ),
          }],
          navigateTo: `/posts/${slug}`,
          title: post ? `${post.title} — Commit Log` : "Commit Log",
        };
      }
      return {
        output: [{ content: `cat: ${file}: No such file or directory`, isError: true }],
      };
    },
    []
  );

  const run = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const spaceIdx = trimmed.indexOf(" ");
      const name = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();
      const rest = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

      setCommandHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(null);

      const def = commandMap.get(name);
      if (!def) {
        setHistory((prev) => [
          ...prev,
          { content: `> ${trimmed}` },
          {
            content: `comlog-sh: command not found: ${name}. Type 'help' for the list.`,
            isError: true,
          },
        ]);
        return;
      }

      const result = def.run({
        rest,
        pathStack,
        setPathStack,
        commandHistory,
        displayPath,
        resolveTarget,
        listDir,
        openFile,
        clear: () => setHistory([]),
        setTheme,
        theme,
      });

      if (result.replaceHistory) return;

      if (result.navigateTo && !result.output[0]?.isError) {
        skipSyncRef.current = true;
        if (result.title) setPageTitle(result.title);
        navigate(result.navigateTo);
      }

      setHistory((prev) => [...prev, { content: `> ${trimmed}` }, ...result.output]);
    },
    [commandHistory, displayPath, listDir, navigate, openFile, pathStack, resolveTarget, setTheme, theme]
  );

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  /** Rebuilds terminal state from the URL: deep links, refreshes, back/forward. */
  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    if (location.pathname === "/about") {
      setPathStack([]);
      setHistory([{ content: "> whoami" }, { content: <About /> }]);
      setPageTitle("About — Commit Log");
      return;
    }

    if (params.slug) {
      const post = posts.find((p) => p.slug === params.slug);
      setPathStack(["posts"]);
      setHistory([
        { content: `> cat posts/${params.slug}.md` },
        post
          ? {
              content: (
                <Suspense fallback={<PostFallback />}>
                  <Post slug={params.slug} onOpenPost={(s) => runRef.current(`open ${s}`)} />
                </Suspense>
              ),
            }
          : { content: `cat: ${params.slug}.md: No such file or directory`, isError: true },
      ]);
      setPageTitle(post ? `${post.title} — Commit Log` : "Not found — Commit Log");
      return;
    }

    if (location.pathname !== "/") {
      setPathStack([]);
      setHistory([
        { content: `> cd ${location.pathname}` },
        { content: `cd: ${location.pathname}: No such file or directory`, isError: true },
        { content: "Type 'help' to see where you can go, or 'recent' for the latest posts." },
      ]);
      setPageTitle("404 — Commit Log");
      return;
    }

    // Landing: a blank prompt gave first-time visitors nothing to act on.
    setPathStack([]);
    setPageTitle(SITE_TITLE);
    setHistory([
      { content: <span className="text-[var(--fg-muted)]">comlog-sh — {posts.length} posts loaded. Type 'help' to begin.</span> },
    ]);
  }, [location.pathname, params.slug]);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const spaceIdx = input.indexOf(" ");
      const pool =
        spaceIdx === -1
          ? commandNames
          : (listDir(pathStack) ?? []).concat(posts.map((p) => p.slug));
      const prefix = spaceIdx === -1 ? input : input.slice(spaceIdx + 1);
      const matches = pool.filter((n) => n.startsWith(prefix));
      if (!matches.length) return;
      const pick = matches[tabCycleRef.current % matches.length];
      tabCycleRef.current += 1;
      setInput(spaceIdx === -1 ? pick : `${input.slice(0, spaceIdx)} ${pick}`);
      return;
    }
    tabCycleRef.current = 0;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = historyIndex === null ? commandHistory.length - 1 : historyIndex - 1;
      if (next >= 0) {
        setInput(commandHistory[next]);
        setHistoryIndex(next);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next < commandHistory.length) {
        setInput(commandHistory[next]);
        setHistoryIndex(next);
      } else {
        setInput("");
        setHistoryIndex(null);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <html data-theme={theme} lang="en" />
      </Helmet>

      <a className="sr-only skip-link" href="#terminal">
        Skip to terminal
      </a>

      <div className="relative flex min-h-screen flex-col items-center gap-4 bg-[var(--bg)] px-3 py-5 font-['JetBrains_Mono','Fira_Code',ui-monospace,monospace] text-[var(--fg)] sm:px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgb(var(--glow))_3px,rgb(var(--glow))_3px)]"
        />

        <header className="relative w-full max-w-4xl select-none text-center">
          <h1 className="terminal-glow text-2xl sm:text-4xl">Come Blog With Me_</h1>
          <p className="mt-1 text-xs text-[var(--fg-dim)] sm:text-sm">
            A terminal you can read. Type{" "}
            <button
              onClick={() => run("help")}
              className="font-bold text-[var(--fg-bright)] underline-offset-2 hover:underline"
            >
              help
            </button>{" "}
            to get started.
          </p>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setTips((v) => !v)}
              aria-expanded={tips}
              className="h-16 w-16 sm:h-20 sm:w-20"
              title="What is this?"
            >
              <Animal />
              <span className="sr-only">Toggle help bubble</span>
            </button>
          </div>
          {tips && (
            <div className="mt-2 flex justify-center">
              <SpeechBox />
            </div>
          )}
        </header>

        <main
          id="terminal"
          className="relative flex w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-soft)]/95 shadow-[0_0_35px_rgb(var(--glow)/0.25)] backdrop-blur-md"
        >
          <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--chrome)] px-4 py-2">
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-2 select-none text-xs text-[var(--fg-dim)] sm:text-sm">
              triumph@commit-log: {displayPath}
            </span>
          </div>

          {/* Clicking anywhere in the body focuses the prompt — a terminal that
              ignores your click is the fastest way to lose a visitor. */}
          <div
            className="scrollbar-hidden min-h-[58vh] flex-1 overflow-y-auto px-4 py-5 leading-relaxed sm:px-6"
            role="log"
            aria-live="polite"
            onClick={() => {
              if (!window.getSelection()?.toString()) inputRef.current?.focus();
            }}
          >
            {history.map((h, i) => (
              <div key={i} className={h.isError ? "text-[var(--err)]" : "text-[var(--fg)]"}>
                {h.content}
              </div>
            ))}
            <div ref={endRef} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(input);
                setInput("");
              }}
              className="mt-3 flex items-center gap-2"
            >
              <label htmlFor="prompt" className="select-none whitespace-nowrap font-semibold">
                <span className="text-[var(--fg)]">triumph@blog</span>
                <span className="text-[var(--fg-muted)]">:{displayPath}$</span>
              </label>
              <input
                id="prompt"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Terminal command input"
                className="min-w-0 flex-1 border-none bg-transparent text-[var(--fg-dim)] caret-[var(--fg)] outline-none"
              />
            </form>
          </div>

          {/* Typing `cat active_noise_cancellation.md` on a phone keyboard is a
              non-starter. These chips make the whole site reachable by thumb. */}
          <div className="scrollbar-hidden flex gap-2 overflow-x-auto border-t border-[var(--line)] bg-black/30 px-3 py-2">
            {QUICK.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => run(c)}
                className="whitespace-nowrap rounded border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--fg-muted)] transition-colors hover:border-[var(--fg)] hover:text-[var(--fg)]"
              >
                {c}
              </button>
            ))}
          </div>
        </main>

        <footer className="relative w-full max-w-4xl select-none text-center text-xs text-[var(--fg-muted)]">
          <a
            href="https://triumph-portfolio-seven.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            v25.1 — © {new Date().getFullYear()} Triumph Ndlovu
          </a>
          <span aria-hidden> · </span>
          <a href="/rss.xml" className="hover:underline">
            RSS
          </a>
        </footer>
      </div>
    </>
  );
}
