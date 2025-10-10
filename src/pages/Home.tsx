"use client";
import { useState, useEffect, useRef } from "react";
import { posts } from "../lib/posts";
import About from "../pages/About";
import Post from "../pages/Post";
import Animal from "./Animal";
import TextBox from "../components/SpeechBox";

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

  const commands = ["help", "ls", "cd", "cat", "pwd", "echo", "clear", "cls"];

  const fileSystem: Record<string, string[]> = {
    "~": ["about.txt", "posts/"],
    posts: posts.map((p) => `${p.slug}.md`),
  };

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(" ");
    const main = args[0]?.toLowerCase();
    const target = args[1];
    let newOutput: CommandOutput[] = [];

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(null);

    switch (main) {
      case "help":
        newOutput.push({
          content: (
            <pre className="text-[#7fffca] whitespace-pre-wrap leading-relaxed">
              {`Available commands:
              - ls               List files and directories
              - cd <dir>         Change directory
              - cat <file>       View file content
              - echo <text>      Print text
              - pwd              Show current path
              - clear / cls      Clear screen
              - help             Show this message`}
            </pre>
          ),
        });
        break;
      case "pwd":
        newOutput.push({ content: path });
        break;
      case "ls":
        const items = fileSystem[path.replace("~", "") || "~"];
        newOutput.push({
          content: (
            <pre className="text-[#00ff90] whitespace-pre-wrap">
              {items ? items.join("\n") : `No such directory: ${path}`}
            </pre>
          ),
        });
        break;
      case "cd":
        if (!target || target === "~" || target === "..") {
          setPath("~");
          newOutput.push({ content: "Returned to home directory" });
        } else if (fileSystem[target]) {
          setPath(target);
          newOutput.push({ content: `Changed directory to ${target}` });
        } else {
          newOutput.push({
            content: `No such directory: ${target}`,
            isError: true,
          });
        }
        break;
      case "cat":
        if (!target) {
          newOutput.push({ content: "Usage: cat <file>", isError: true });
          break;
        }
        if (target === "about.txt") {
          newOutput.push({ content: <About /> });
        } else if (target.endsWith(".md")) {
          const slug = target.replace(".md", "");
          const exists = posts.find((p) => p.slug === slug);
          newOutput.push({
            content: exists ? <Post slug={slug} /> : `File not found: ${target}`,
            isError: !exists,
          });
        } else {
          newOutput.push({ content: `Cannot read file: ${target}`, isError: true });
        }
        break;
      case "echo":
        newOutput.push({ content: args.slice(1).join(" ") });
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
      const newIndex =
        historyIndex === null ? commandHistory.length - 1 : historyIndex - 1;
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
    <div className="min-h-screen scrollbar-hidden flex items-center justify-center bg-gradient-to-b from-[#050505] to-[#0d0d0d] font-['JetBrains_Mono',monospace] p-4 text-base text-[#00ff90]">
      {/* retro background */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00FF80_3px,#00FF80_3px)] opacity-[0.05] pointer-events-none"></div>
      
      {/* Header */}
      <div className="absolute top-6 text-center w-full px-4 select-none">
        <h1 className="text-4xl terminal-glow">Come Blog With Me_</h1>
        <p className="text-sm text-[#7fffca]">Type <span className="text-[#00ff48] font-extrabold">'help'</span> to get started</p>
      <p className="text-xs text-[#7fffca]">
        Please note that this is meant for devs, if you are not a dev it might be confusing to you.
        <br />
        and if you want to know why there is a gopher on the screen,
        <br /> 
        <span className="text-[#00ff90] hover:underline cursor-pointer font-extrabold">hover over it</span>
      </p> 
        
          <div className="mt-4 sm:block group mx-auto flex justify-center items-center relative">
            {/* TextBox */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-50">
              <TextBox />
            </div>

            {/* Animal */}
            <div className="w-24 h-24">
              <Animal />
            </div>
          </div>


      </div>

      {/* Terminal */}
      <div className="relative w-full max-w-4xl max-h-[80vh] rounded-xl shadow-[0_0_35px_rgba(0,255,128,0.3)] overflow-hidden border border-[#1a1a1a] bg-[#0b0b0b]/95 backdrop-blur-md">
        {/* Title Bar */}
        <div className="flex items-center px-4 py-2 bg-[#1e1e1e] border-b border-[#222]">
          <span className="w-3 h-3 bg-[#ff5f56] rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-[#ffbd2e] rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-[#27c93f] rounded-full mr-4"></span>
          <span className="text-[#7fffca] text-sm select-none text-center">Com-log Terminal</span>
        </div>

        {/* Body */}
        <div className="px-6 py-6 min-h-[60vh] max-h-[60vh] overflow-y-auto leading-relaxed">
          {history.map((h, i) => (
            <div key={i} className={h.isError ? "text-[#ff7f7f]" : "text-[#00ff90]"}>
              {h.content}
            </div>
          ))}
          <div ref={terminalEndRef}></div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex mt-3 items-center">
            <span className="mr-2 text-[#00ff90] select-none font-semibold">
              triumph@blog~$
              <span className="text-green-600">/{path}:</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-[#7fffca] flex-1 placeholder-[#4a4a4a] caret-[#00ff90]"
              autoFocus
            />
          </form>
        </div>
      </div>
      <div className="absolute bottom-4 text-center w-full px-4 select-none text-xs text-[#7fffca]">
         <div className="text-xs text-[#3cffb3] mt-1 hover:underline"
         >
         <a href="https://triumph-portfolio-seven.vercel.app/" target="_blank" rel="noopener noreferrer">v24.9 - © 2025 Triumph Ndlovu</a>
        </div>
        
      </div>
      </div>
  );
}
