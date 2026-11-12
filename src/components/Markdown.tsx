import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";


/** Code fence with a copy button. Language is read off the hljs class. */
function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const lang = /language-(\w+)/.exec(className ?? "")?.[1] ?? "code";

  const copy = async () => {
    // Pull the raw text back out of the rendered tree. `children` is already
    // tokenised by rehype-highlight, so innerText off the DOM node is more
    // reliable than trying to flatten React elements by hand.
    const node = document.activeElement?.closest("[data-codeblock]");
    const text = node?.querySelector("code")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — fail quietly rather than throwing in the UI */
    }
  };

  return (
    <div data-codeblock className="relative group my-4">
      <div className="flex items-center justify-between rounded-t border border-b-0 border-[var(--line)] bg-black/60 px-3 py-1">
        <span className="text-[11px] uppercase tracking-widest text-[var(--fg-muted)]">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-b border border-[var(--line)] bg-black p-4 text-sm text-[var(--fg-dim)]">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
      components={{
        h1: (p) => <h1 className="text-2xl md:text-3xl font-bold mt-8 mb-3 text-[var(--fg)]" {...p} />,
        h2: (p) => <h2 className="text-xl md:text-2xl font-semibold mt-7 mb-3 text-[var(--fg)]" {...p} />,
        h3: (p) => <h3 className="text-lg font-medium mt-5 mb-2 text-[var(--fg)]" {...p} />,
        p: (p) => <p className="mb-4 leading-7" {...p} />,
        hr: () => <hr className="my-8 border-[var(--line)]" />,
        blockquote: (p) => (
          <blockquote
            className="border-l-2 border-[var(--fg)]/60 pl-4 italic text-[var(--fg-muted)] my-5"
            {...p}
          />
        ),
        ul: (p) => <ul className="list-disc pl-6 mb-4 space-y-1.5" {...p} />,
        ol: (p) => <ol className="list-decimal pl-6 mb-4 space-y-1.5" {...p} />,
        table: (p) => (
          <div className="overflow-x-auto my-5 rounded border border-[var(--line)]">
            <table className="w-full border-collapse text-sm" {...p} />
          </div>
        ),
        th: (p) => (
          <th className="border-b border-[var(--line)] px-3 py-2 text-left text-[var(--fg)]" {...p} />
        ),
        td: (p) => <td className="border-b border-[var(--line)]/50 px-3 py-2" {...p} />,
        a: ({ href, ...p }) => {
          const external = !!href && !href.startsWith("/") && !href.startsWith("#");
          return (
            <a
              href={href}
              className="text-[var(--fg)] underline underline-offset-2 hover:text-[var(--fg-dim)] transition-colors"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              {...p}
            />
          );
        },
        img: ({ alt, ...p }) => (
          <img
            alt={alt ?? ""}
            loading="lazy"
            decoding="async"
            className="max-w-full h-auto rounded border border-[var(--line)] my-5"
            {...p}
          />
        ),
        pre: ({ children }) => <>{children}</>,
        code: ({ className, children, ...rest }) => {
          const isBlock = /language-/.test(className ?? "") || String(children).includes("\n");
          if (!isBlock) {
            return (
              <code
                className="rounded border border-[var(--line)] bg-black/70 px-1.5 py-0.5 text-[0.9em] text-[var(--fg-dim)]"
                {...rest}
              >
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
