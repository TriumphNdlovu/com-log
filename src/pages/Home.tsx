"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { posts } from "../lib/posts";
import About from "../pages/About";
import Post from "../pages/Post";
import Animal from "./Animal";
import TextBox from "../components/SpeechBox";

interface CommandOutput {
  content: string | React.ReactNode;
  isError?: boolean;
}

type FSNode = { type: "file" } | { type: "dir"; children: Record<string, FSNode> };

const COMMAND_DEFS: { cmd: string; desc: string }[] = [
  { cmd: "ls", desc: "List files and directories" },
  { cmd: "cd <dir>", desc: "Change directory" },
  { cmd: "cat <file>", desc: "View file content" },
  { cmd: "echo <text>", desc: "Print text" },
  { cmd: "pwd", desc: "Show current path" },
  { cmd: "history", desc: "Show command history" },
  { cmd: "clear / cls", desc: "Clear screen" },
  { cmd: "help", desc: "Show this message" },
];
const COMMAND_NAMES = ["help", "ls", "cd", "cat", "pwd", "echo", "clear", "cls", "history"];

// Built once — not user-dependent, so it lives outside the component.
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

export default function Terminal() {
  const params = useParams<{ slug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [input, setInput] = useState("");
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState("Come Blog With Me — Commit Log");

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const skipSyncRef = useRef(false); // true = the URL just changed because WE navigated, not the browser

  const displayPath = pathStack.length ? `~/${pathStack.join("/")}` : "~";

  // Produces the {output, title} for "cat"-ing a given filename in the current dir context.
  const buildCatOutput = (
    dirSegments: string[],
    filePart: string
  ): { entries: CommandOutput[]; title: string } => {
    const node = getNode(dirSegments);
    const fileNode = node?.type === "dir" ? node.children[filePart] : null;

    if (filePart === "about.txt" && fileNode) {
      return { entries: [{ content: <About /> }], title: "About — Commit Log" };
    }
    if (filePart.endsWith(".md") && fileNode) {
      const slug = filePart.replace(".md", "");
      const post = posts.find((p) => p.slug === slug);
      return {
        entries: [{ content: <Post slug={slug} /> }],
        title: post?.title ? `${post.title} — Commit Log` : "Commit Log",
      };
    }
    return {
      entries: [{ content: `File not found: ${filePart}`, isError: true }],
      title: "Commit Log",
    };
  };

  // Reconstructs full terminal state from a URL. Runs on: initial load, direct links, back/forward.
  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false; // this change was self-inflicted by handleCommand; don't rebuild
      return;
    }

    if (location.pathname === "/about") {
      const { entries, title } = buildCatOutput([], "about.txt");
      setPathStack([]);
      setHistory([{ content: "> cd ~ && cat about.txt" }, ...entries]);
      setPageTitle(title);
    } else if (params.slug) {
      const { entries, title } = buildCatOutput(["posts"], `${params.slug}.md`);
      setPathStack(["posts"]);
      setHistory([{ content: `> cd posts && cat ${params.slug}.md` }, ...entries]);
      setPageTitle(title);
    } else {
      // "/" or unmatched catch-all
      setPathStack([]);
      setHistory([]);
      setPageTitle("Come Blog With Me — Commit Log");
    }
  }, [location.pathname, params.slug]);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const resolveTarget = (target: string): string[] | null => {
    const parts = target.replace(/^~\/?/, "").split("/").filter(Boolean);
    let stack = target.startsWith("~") ? [] : [...pathStack];
    for (const part of parts) {
      if (part === ".") continue;
      else if (part === "..") stack.pop();
      else stack.push(part);
    }
    return getNode(stack) ? stack : null;
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    const spaceIdx = trimmed.indexOf(" ");
    const main = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();
    const rest = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

    let newOutput: CommandOutput[] = [];
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(null);

    switch (main) {
      case "help":
        newOutput.push({
          content: (
            <pre className="text-[#7fffca] whitespace-pre-wrap leading-relaxed">
              {"Available commands:\n" +
                COMMAND_DEFS.map((c) => `  ${c.cmd.padEnd(14)} ${c.desc}`).join("\n")}
            </pre>
          ),
        });
        break;

      case "pwd":
        newOutput.push({ content: displayPath });
        break;

      case "history":
        newOutput.push({
          content: (
            <pre className="text-[#00ff90] whitespace-pre-wrap">
              {commandHistory.length
                ? commandHistory.map((c, i) => `${i + 1}  ${c}`).join("\n")
                : "No history yet"}
            </pre>
          ),
        });
        break;

      case "ls": {
        const node = getNode(pathStack);
        const entries =
          node?.type === "dir"
            ? Object.entries(node.children).map(([n, v]) => (v.type === "dir" ? `${n}/` : n))
            : [];
        newOutput.push({
          content: (
            <pre className="text-[#00ff90] whitespace-pre-wrap">
              {entries.length ? entries.join("\n") : "(empty)"}
            </pre>
          ),
        });
        break;
      }

      case "cd": {
        if (!rest || rest === "~" || rest === "..") {
          setPathStack((prev) => (rest === ".." ? prev.slice(0, -1) : []));
          newOutput.push({ content: `Changed directory to ${rest === ".." ? displayPath : "~"}` });
          break;
        }
        const resolved = resolveTarget(rest);
        if (resolved && getNode(resolved)?.type === "dir") {
          setPathStack(resolved);
          newOutput.push({ content: `Changed directory to ~/${resolved.join("/")}` });
        } else {
          newOutput.push({ content: `No such directory: ${rest}`, isError: true });
        }
        break;
      }

      case "cat": {
        if (!rest) {
          newOutput.push({ content: "Usage: cat <file>", isError: true });
          break;
        }
        const lastSlash = rest.lastIndexOf("/");
        const dirPart = lastSlash === -1 ? "" : rest.slice(0, lastSlash);
        const filePart = lastSlash === -1 ? rest : rest.slice(lastSlash + 1);
        const dirSegments = dirPart ? resolveTarget(dirPart) : pathStack;

        if (!dirSegments) {
          newOutput.push({ content: `File not found: ${rest}`, isError: true });
          break;
        }

        const { entries, title } = buildCatOutput(dirSegments, filePart);
        newOutput = entries;

        // Only push a URL change for content that actually has a route.
        if (filePart === "about.txt" && !entries[0].isError) {
          skipSyncRef.current = true;
          setPageTitle(title);
          navigate("/about");
        } else if (filePart.endsWith(".md") && !entries[0].isError) {
          const slug = filePart.replace(".md", "");
          skipSyncRef.current = true;
          setPageTitle(title);
          navigate(`/posts/${slug}`);
        }
        break;
      }

      case "echo":
        newOutput.push({ content: rest });
        break;

      case "clear":
      case "cls":
        setHistory([]);
        return;

      default:
        newOutput.push({
          content: `'${main}' is not recognized. Type 'help' for available commands.`,
          isError: true,
        });
    }

    setHistory((prev) => [...prev, { content: `> ${cmd}` }, ...newOutput]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const spaceIdx = input.indexOf(" ");
      if (spaceIdx === -1) {
        const suggestion = COMMAND_NAMES.find((c) => c.startsWith(input));
        if (suggestion) setInput(suggestion);
      } else {
        const cmdPart = input.slice(0, spaceIdx);
        const argPart = input.slice(spaceIdx + 1);
        const node = getNode(pathStack);
        if (node?.type === "dir") {
          const names = Object.entries(node.children).map(([n, v]) => (v.type === "dir" ? `${n}/` : n));
          const match = names.find((n) => n.startsWith(argPart));
          if (match) setInput(`${cmdPart} ${match}`);
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = historyIndex === null ? commandHistory.length - 1 : historyIndex - 1;
      if (newIndex >= 0) {
        setInput(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setInput(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
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
      </Helmet>
      <div className="min-h-screen scrollbar-hidden flex items-center justify-center bg-gradient-to-b from-[#050505] to-[#0d0d0d] font-['JetBrains_Mono',monospace] p-4 text-base text-[#00ff90]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00FF80_3px,#00FF80_3px)] opacity-[0.05] pointer-events-none"></div>

        <div className="absolute top-6 text-center w-full px-4 select-none">
          <h1 className="text-4xl terminal-glow">Come Blog With Me_</h1>
          <p className="text-sm text-[#7fffca]">
            Type <span className="text-[#00ff48] font-extrabold">'help'</span> to get started
          </p>
          <p className="text-xs text-[#7fffca]">
            Please note that this is meant for devs, if you are not a dev it might be confusing to you.
            <br />
            and if you want to know why there is a gopher on the screen,
            <br />
            <span className="text-[#00ff90] hover:underline cursor-pointer font-extrabold">
              hover over it
            </span>
          </p>
          <div className="mt-4 sm:block group mx-auto flex justify-center items-center relative">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-50">
              <TextBox />
            </div>
            <div className="w-24 h-24">
              <Animal />
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-4xl max-h-[80vh] rounded-xl shadow-[0_0_35px_rgba(0,255,128,0.3)] overflow-hidden border border-[#1a1a1a] bg-[#0b0b0b]/95 backdrop-blur-md">
          <div className="flex items-center px-4 py-2 bg-[#1e1e1e] border-b border-[#222]">
            <span className="w-3 h-3 bg-[#ff5f56] rounded-full mr-2"></span>
            <span className="w-3 h-3 bg-[#ffbd2e] rounded-full mr-2"></span>
            <span className="w-3 h-3 bg-[#27c93f] rounded-full mr-4"></span>
            <span className="text-[#7fffca] text-sm select-none text-center">Com-log Terminal</span>
          </div>

          <div
            className="px-6 py-6 min-h-[60vh] max-h-[60vh] overflow-y-auto leading-relaxed"
            role="log"
            aria-live="polite"
          >
            {history.map((h, i) => (
              <div key={i} className={h.isError ? "text-[#ff7f7f]" : "text-[#00ff90]"}>
                {h.content}
              </div>
            ))}
            <div ref={terminalEndRef}></div>

            <form onSubmit={handleSubmit} className="flex mt-3 items-center">
              <span className="mr-2 text-[#00ff90] select-none font-semibold">
                triumph@blog~$<span className="text-green-600">/{displayPath}:</span>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Terminal command input"
                className="bg-transparent border-none outline-none text-[#7fffca] flex-1 placeholder-[#4a4a4a] caret-[#00ff90]"
                autoFocus
              />
            </form>
          </div>
        </div>

        <div className="absolute bottom-4 text-center w-full px-4 select-none text-xs text-[#7fffca]">
          <div className="text-xs text-[#3cffb3] mt-1 hover:underline">
            <a href="https://triumph-portfolio-seven.vercel.app/" target="_blank" rel="noopener noreferrer">
              v24.9 - © 2026 Triumph Ndlovu
            </a>
          </div>
        </div>
      </div>
    </>
  );
}