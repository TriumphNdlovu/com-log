import { useState, useEffect, useRef } from "react";
import { posts } from "../lib/posts";
import About from "../pages/About";
import PostList from "../components/PostList";
import Post from "../pages/Post";
import Animal from "./Animal";

interface CommandOutput {
  content: string | React.ReactNode;
  isError?: boolean;
}

export default function Terminal() {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [input, setInput] = useState("");
  const [path, setPath] = useState("~");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const commands = ["help", "posts", "open", "about", "clear", "cd"];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(" ");
    const main = args[0].toLowerCase();
    let newOutput: CommandOutput[] = [];

    // Save to command history
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(null);

    switch (main) {
      case "help":
        newOutput.push({
          content: (
            <pre className="text-[#00ff90] whitespace-pre-wrap">
{`Available commands:
- help: Show this message
- posts: List all posts
- about: Show about info
- cd <dir>: Change directory (for fun)
- clear: Clear terminal`}
            </pre>
          ),
        });
        break;

      case "posts":
        newOutput.push({
          content: (
            <PostList
              onOpenPost={(slug) =>
                setHistory((prev) => [
                  ...prev,
                  { content: `> open ${slug}` },
                  { content: <Post slug={slug} /> },
                ])
              }
            />
          ),
        });
        break;

      case "open":
        if (args[1]) {
          const slug = args[1];
          const exists = posts.find((p) => p.slug === slug);
          if (exists) newOutput.push({ content: <Post slug={slug} /> });
          else
            newOutput.push({
              content: `Post '${slug}' not found.`,
              isError: true,
            });
        } else {
          newOutput.push({ content: "Usage: open <slug>", isError: true });
        }
        break;

      case "about":
        newOutput.push({ content: <About /> });
        break;

      case "cd":
        if (args[1]) {
          setPath(args[1]);
          newOutput.push({ content: `Changed directory to ${args[1]}` });
        } else {
          setPath("~");
          newOutput.push({ content: "Returned to home directory" });
        }
        break;

      case "clear":
      case "cls":
        setHistory([]);
        return;

      default:
        newOutput.push({
          content: `'${cmd}' is not recognized. Type 'help' for available commands.`,
          isError: true,
        });
        break;
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
      const suggestion = commands.find((cmd) => cmd.startsWith(input));
      if (suggestion) setInput(suggestion);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      const newIndex =
        historyIndex === null ? commandHistory.length - 1 : historyIndex - 1;
      if (newIndex >= 0) {
        setInput(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length === 0 || historyIndex === null) return;

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
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] font-mono p-4">
      <div className="absolute top-6 text-center w-full px-4 select-none">
        <h1 className="text-3xl font-bold text-[#00ff90] mb-2">'Come blog with me'</h1>
        <p className="text-sm text-[#00ff90]">Type 'help' to get started</p>
        <div className="text-xs text-gray-500 mt-1">v24.9 - © 2025 Triumph Ndlovu</div>
        <Animal />
      </div>

      

      {/* Terminal Window */}
      <div className="relative w-full max-w-4xl max-h-[80vh] rounded-xl shadow-[0_15px_40px_rgba(0,255,128,0.2)] overflow-hidden border border-[#222] opacity-95">
        {/* Title Bar */}
        <div className="flex items-center px-4 py-2 bg-[#2a2a2a] border-b border-[#333]">
          <span className="w-3 h-3 bg-[#ff5f56] rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-[#ffbd2e] rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-[#27c93f] rounded-full mr-4"></span>
          <span className="text-[#ccc] text-sm select-none">Com-log</span>
        </div>

        {/* Terminal Content */}
        <div className="px-6 py-6 bg-[#0d0d0d] min-h-[60vh] max-h-[60vh] overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className={h.isError ? "text-[#ff5f56]" : ""}>
              {h.content}
            </div>
          ))}
          <div ref={terminalEndRef}></div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex mt-2 items-center">
            <span className="mr-2 text-[#00ff90] select-none">
              triumph@blog:{path}$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-[#00ff90] flex-1"
              autoFocus
            />
          </form>
      
      </div>


      </div>
    </div>
  );
}
