import { useState, useEffect, useRef } from "react";
import { posts } from "../lib/posts";
import { useNavigate } from "react-router-dom";

interface CommandOutput {
  text: string;
  isError?: boolean;
}

export default function Terminal() {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(" ");
    const main = args[0].toLowerCase();
    let newOutput: CommandOutput[] = [];

    switch (main) {
      case "help":
        newOutput.push({
          text: `Available commands:
                - help: Show this message
                - posts: List all posts
                - open <slug>: Open a post
                - about: Show about info
                - contact: Show social links
                - clear: Clear terminal`,
        });
        break;
      case "posts":
        posts.forEach((p) =>
          newOutput.push({
            text: `${p.slug}: ${p.title} (${p.date})`,
          })
        );
        break;
      case "open":
        if (args[1]) {
          const slug = args[1];
          const exists = posts.find((p) => p.slug === slug);
          if (exists) {
            navigate(`/post/${slug}`);
            return;
          } else {
            newOutput.push({ text: `Post '${slug}' not found.`, isError: true });
          }
        } else {
          newOutput.push({ text: "Usage: open <slug>", isError: true });
        }
        break;
      case "about":
        newOutput.push({
          text: `Triumph Ndlovu - Software Engineer
                Tech Enthusiast • Coffee Lover
                Type 'contact' to see links.`,
        });
        break;
      case "contact":
        newOutput.push({
          text: `GitHub: https://github.com/TriumphNdlovu
                LinkedIn: https://www.linkedin.com/in/triumph-ndlovu-425b73274/
                Email: realtriumphndlovu@gmail.com
                Portfolio: https://triumph-portfolio-seven.vercel.app`,
        });
        break;
      case "clear":
        setHistory([]);
        return;
      default:
        newOutput.push({ text: `'${cmd}' is not recognized. Type 'help'`, isError: true });
        break;
    }

    setHistory((prev) => [...prev, { text: `> ${cmd}` }, ...newOutput]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] font-mono p-4">

      <div className="absolute top-6 text-center w-full px-4">
        <div className="text-[#00ff90] mb-6 text-center select-none">
          <h1 className="text-3xl font-bold">'Come blog with me'</h1>
          <p className="text-sm">Type 'help' to get started</p>
          <div className="text-xs text-gray-500 mt-2">v24.9 - © 2025 Triumph Ndlovu
          </div>
        </div>
      </div>
      {/* Terminal Window */}
      <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(0deg, #00ff8055 1px, transparent 1px),
              linear-gradient(90deg, #00ff8055 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      <div className="w-full max-w-4xl opacity-80 rounded-lg shadow-2xl overflow-hidden border border-[#222]">
        {/* Title Bar */}
        <div className="flex items-center px-4 py-2 bg-[#2a2a2a] border-b border-[#333]">
          <span className="w-3 h-3 bg-[#ff5f56] rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-[#ffbd2e] rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-[#27c93f] rounded-full mr-4"></span>
          <span className="text-[#ccc] text-sm select-none">Com-log</span>
        </div>

        {/* Terminal Content */}
        <div className="px-6 py-6 bg-[#0d0d0d] min-h-[60vh] max-h-[80vh] overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className={h.isError ? "text-[#ff5f56]" : ""}>
              {h.text}
            </div>
          ))}

          <form onSubmit={handleSubmit} className="flex mt-2">
            <span className="mr-2 text-[#00ff90] select-none">triumph@blog:~$</span>
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none outline-none text-[#00ff90] flex-1"
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
}
