import { useState, useEffect } from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Taskbar() {
  const [time, setTime] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Clock updater
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const socials = [
    {
      icon: <FaGithub />,
      url: "https://github.com/TriumphNdlovu",
      label: "GitHub",
    },
    {
      icon: <FaLinkedin />,
      url: "https://www.linkedin.com/in/triumph-ndlovu-425b73274/",
      label: "LinkedIn",
    },
    {
      icon: <FaEnvelope />,
      url: "mailto:realtriumphndlovu@gmail.com",
      label: "Email",
    },
    {
      icon: <FaGlobe />,
      url: "https://triumph-portfolio-seven.vercel.app",
      label: "Portfolio",
    },
    {
      icon: <FaWhatsapp />,
      url: "https://wa.me/+27827793863",
      label: "WhatsApp",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#2e2e2e] text-white h-10 flex items-center justify-between px-3 shadow-lg border-t border-gray-700 select-none z-50">
      {/* Start Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-sm font-semibold rounded-md transition"
        >
          <Menu size={16} />
          Start
        </button>

        {/* Open menu popup */}
        {menuOpen && (
          <div className="absolute bottom-12 left-3 bg-[#3a3a3a] text-white rounded-md shadow-lg border border-gray-700 p-3 w-48">
            <p className="text-xs text-gray-400 mb-2">Applications</p>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="hover:bg-[#505050] px-2 py-1 rounded"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="hover:bg-[#505050] px-2 py-1 rounded"
              >
                About Me
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Middle section — open apps or navigation */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link
          to="/about"
          className="px-3 py-1 rounded hover:bg-[#4a4a4a] transition"
        >
          About
        </Link>
      </div>

      {/* Right side — system tray */}
      <div className="flex items-center gap-4">
        {socials.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition text-lg"
            title={item.label}
          >
            {item.icon}
          </a>
        ))}
        <div className="text-xs font-mono bg-[#3a3a3a] px-2 py-1 rounded">
          {time}
        </div>
      </div>
    </div>
  );
}
