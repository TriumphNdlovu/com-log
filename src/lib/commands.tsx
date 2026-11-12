import type { ReactNode } from "react";
import { allTags, posts, postsByTag, searchPosts } from "./posts";
import { THEMES, isTheme, type Theme } from "./theme";
import { Pre, PostRow } from "../components/TerminalOutput";

export interface OutputLine {
  content: ReactNode;
  isError?: boolean;
}

export interface CommandContext {
  /** Everything after the command word, untrimmed of inner spaces. */
  rest: string;
  pathStack: string[];
  setPathStack: (next: string[]) => void;
  commandHistory: string[];
  displayPath: string;
  resolveTarget: (target: string) => string[] | null;
  listDir: (segments: string[]) => string[] | null;
  openFile: (dirSegments: string[], file: string) => CommandResult;
  clear: () => void;
  setTheme: (t: Theme) => void;
  theme: Theme;
}

export interface CommandResult {
  output: OutputLine[];
  /** Pushed to the router so the post/about page is linkable and shareable. */
  navigateTo?: string;
  title?: string;
  /** `clear` needs to wipe rather than append. */
  replaceHistory?: boolean;
}

export interface CommandDef {
  name: string;
  usage: string;
  desc: string;
  /** Hidden from `help` but still runnable — easter eggs and aliases. */
  hidden?: boolean;
  run: (ctx: CommandContext) => CommandResult;
}

const text = (content: ReactNode, isError = false): CommandResult => ({
  output: [{ content, isError }],
});

export const commands: CommandDef[] = [
  {
    name: "help",
    usage: "help",
    desc: "Show this message",
    run: () => ({
      output: [
        {
          content: (
            <Pre>
              {"Available commands:\n" +
                commands
                  .filter((c) => !c.hidden)
                  .map((c) => `  ${c.usage.padEnd(16)} ${c.desc}`)
                  .join("\n") +
                "\n\nShortcuts: Tab completes · ↑/↓ history · Ctrl+L clears"}
            </Pre>
          ),
        },
      ],
    }),
  },
  {
    name: "ls",
    usage: "ls [dir]",
    desc: "List files and directories",
    run: ({ rest, pathStack, resolveTarget, listDir }) => {
      const target = rest ? resolveTarget(rest) : pathStack;
      const entries = target ? listDir(target) : null;
      if (!entries) return text(`ls: cannot access '${rest}': No such directory`, true);

      // Inside posts/, a bare filename list is useless — show the metadata.
      if ((target ?? []).join("/") === "posts") {
        return {
          output: posts.map((p) => ({
            content: <PostRow slug={p.slug} title={p.title} date={p.date} minutes={p.readingMinutes} />,
          })),
        };
      }
      return text(<Pre>{entries.length ? entries.join("\n") : "(empty)"}</Pre>);
    },
  },
  {
    name: "cd",
    usage: "cd <dir>",
    desc: "Change directory",
    run: ({ rest, pathStack, setPathStack, resolveTarget, listDir }) => {
      if (!rest || rest === "~" || rest === "/") {
        setPathStack([]);
        return text("~");
      }
      if (rest === "..") {
        const next = pathStack.slice(0, -1);
        setPathStack(next);
        return text(next.length ? `~/${next.join("/")}` : "~");
      }
      const resolved = resolveTarget(rest);
      if (!resolved || !listDir(resolved)) return text(`cd: no such directory: ${rest}`, true);
      setPathStack(resolved);
      return text(resolved.length ? `~/${resolved.join("/")}` : "~");
    },
  },
  {
    name: "cat",
    usage: "cat <file>",
    desc: "Read a file or post",
    run: ({ rest, pathStack, resolveTarget, openFile }) => {
      if (!rest) return text("usage: cat <file>", true);
      const slash = rest.lastIndexOf("/");
      const dirPart = slash === -1 ? "" : rest.slice(0, slash);
      const file = slash === -1 ? rest : rest.slice(slash + 1);
      const dir = dirPart ? resolveTarget(dirPart) : pathStack;
      if (!dir) return text(`cat: ${rest}: No such file or directory`, true);
      return openFile(dir, file);
    },
  },
  {
    name: "open",
    usage: "open <slug>",
    desc: "Open a post by slug, from anywhere",
    run: ({ rest, openFile }) => {
      if (!rest) return text("usage: open <slug>", true);
      return openFile(["posts"], rest.endsWith(".md") ? rest : `${rest}.md`);
    },
  },
  {
    name: "find",
    usage: "find <query>",
    desc: "Full-text search across every post",
    run: ({ rest }) => {
      if (!rest) return text("usage: find <query>", true);
      const hits = searchPosts(rest);
      if (!hits.length) return text(`No matches for "${rest}".`);
      return {
        output: [
          { content: <Pre>{`${hits.length} match${hits.length === 1 ? "" : "es"} for "${rest}":`}</Pre> },
          ...hits.map((h) => ({
            content: (
              <div className="py-1.5">
                <div className="text-[var(--fg)]">
                  posts/{h.post.slug}.md{h.line ? `:${h.line}` : ""}
                </div>
                <div className="pl-4 text-sm text-[var(--fg-muted)]">…{h.excerpt}…</div>
                <div className="pl-4 text-xs text-[var(--fg-muted)]/70">
                  open {h.post.slug}
                </div>
              </div>
            ),
          })),
        ],
      };
    },
  },
  { name: "grep", usage: "grep <query>", desc: "Alias for find", hidden: true, run: (ctx) => commands.find((c) => c.name === "find")!.run(ctx) },
  {
    name: "tags",
    usage: "tags",
    desc: "List every tag in the archive",
    run: () =>
      allTags.length
        ? text(<Pre>{allTags.map((t) => `  #${t.tag.padEnd(18)} ${t.count}`).join("\n")}</Pre>)
        : text("No tags yet. Add `tags: [a, b]` to a post's frontmatter."),
  },
  {
    name: "tag",
    usage: "tag <name>",
    desc: "Show posts filed under a tag",
    run: ({ rest }) => {
      if (!rest) return text("usage: tag <name>", true);
      const found = postsByTag(rest);
      if (!found.length) return text(`No posts tagged "#${rest}". Try \`tags\`.`, true);
      return {
        output: found.map((p) => ({
          content: <PostRow slug={p.slug} title={p.title} date={p.date} minutes={p.readingMinutes} />,
        })),
      };
    },
  },
  {
    name: "recent",
    usage: "recent [n]",
    desc: "Show the n most recent posts (default 5)",
    run: ({ rest }) => {
      const n = Math.max(1, Math.min(parseInt(rest, 10) || 5, posts.length));
      return {
        output: posts.slice(0, n).map((p) => ({
          content: <PostRow slug={p.slug} title={p.title} date={p.date} minutes={p.readingMinutes} />,
        })),
      };
    },
  },
  {
    name: "random",
    usage: "random",
    desc: "Open a post at random",
    run: ({ openFile }) => {
      const pick = posts[Math.floor(Math.random() * posts.length)];
      return pick ? openFile(["posts"], `${pick.slug}.md`) : text("No posts yet.", true);
    },
  },
  {
    name: "theme",
    usage: "theme [name]",
    desc: `Switch palette (${THEMES.join(" | ")})`,
    run: ({ rest, setTheme, theme }) => {
      if (!rest) return text(<Pre>{`current: ${theme}\navailable: ${THEMES.join(", ")}`}</Pre>);
      if (!isTheme(rest)) return text(`theme: unknown palette '${rest}'. Try: ${THEMES.join(", ")}`, true);
      setTheme(rest);
      return text(`theme set to ${rest}`);
    },
  },
  {
    name: "neofetch",
    usage: "neofetch",
    desc: "System info, blog edition",
    run: ({ theme }) => {
      const words = posts.reduce((n, p) => n + p.readingMinutes * 200, 0);
      const oldest = posts[posts.length - 1]?.date ?? "—";
      return text(
        <Pre>
          {[
            "  triumph@commit-log",
            "  ------------------",
            `  OS        Commit Log (React ${"19"} · Vite)`,
            `  Shell     comlog-sh`,
            `  Theme     ${theme}`,
            `  Posts     ${posts.length}`,
            `  Tags      ${allTags.length}`,
            `  Words     ~${words.toLocaleString()}`,
            `  Since     ${oldest}`,
            `  Feed      /rss.xml`,
          ].join("\n")}
        </Pre>
      );
    },
  },
  { name: "whoami", usage: "whoami", desc: "About the author", run: ({ openFile }) => openFile([], "about.txt") },
  {
    name: "feed",
    usage: "feed",
    desc: "Subscribe via RSS",
    run: () =>
      text(
        <span>
          RSS:{" "}
          <a className="underline hover:text-[var(--fg-dim)]" href="/rss.xml">
            /rss.xml
          </a>
        </span>
      ),
  },
  { name: "pwd", usage: "pwd", desc: "Print working directory", run: ({ displayPath }) => text(displayPath) },
  { name: "echo", usage: "echo <text>", desc: "Print text", run: ({ rest }) => text(rest) },
  {
    name: "history",
    usage: "history",
    desc: "Show command history",
    run: ({ commandHistory }) =>
      text(
        <Pre>
          {commandHistory.length
            ? commandHistory.map((c, i) => `${String(i + 1).padStart(3)}  ${c}`).join("\n")
            : "No history yet"}
        </Pre>
      ),
  },
  { name: "date", usage: "date", desc: "Current date and time", hidden: true, run: () => text(new Date().toString()) },
  { name: "clear", usage: "clear", desc: "Clear the screen", run: ({ clear }) => { clear(); return { output: [], replaceHistory: true }; } },
  { name: "cls", usage: "cls", desc: "Alias for clear", hidden: true, run: ({ clear }) => { clear(); return { output: [], replaceHistory: true }; } },
  {
    name: "man",
    usage: "man <cmd>",
    desc: "Show usage for one command",
    hidden: true,
    run: ({ rest }) => {
      const c = commands.find((x) => x.name === rest);
      return c ? text(<Pre>{`${c.usage}\n    ${c.desc}`}</Pre>) : text(`No manual entry for ${rest}`, true);
    },
  },
  {
    name: "sudo",
    usage: "sudo <cmd>",
    desc: "Nice try",
    hidden: true,
    run: () => text("triumph is not in the sudoers file. This incident has been reported."),
  },
  { name: "exit", usage: "exit", desc: "Close the session", hidden: true, run: () => text("There is no escape. Try `cd ~`.") },
];

export const commandMap = new Map(commands.map((c) => [c.name, c]));
export const commandNames = commands.map((c) => c.name);
