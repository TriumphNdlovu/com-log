import Navbar from "../components/Navbar";
import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";

export default function About() {
  return (
    <>
      {/* Background */}
      <div className="min-h-screen bg-[#0b0b0b] text-[#00FF80] font-mono relative overflow-hidden">
        {/* Faint grid lines for terminal feel */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(0deg, #00ff8055 1px, transparent 1px),
              linear-gradient(90deg, #00ff8055 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fadeIn">
            
            {/* Profile Image */}
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-[#00FF80]/40 blur-lg rounded-full animate-pulse"></div>
              <img
                src="/me.png"
                alt="Triumph Ndlovu"
                className="relative w-32 h-32 rounded-full mx-auto mb-6 border-2 border-[#00FF80]/70 shadow-[0_0_15px_#00FF80]"
              />
            </div>

            {/* Terminal header */}
            <div className="bg-[#0f0f0f] border border-[#00FF80]/30 p-4 rounded-lg shadow-lg max-w-2xl mx-auto text-left">
              <p className="text-[#9affc2] text-sm mb-3">
                triumph@portfolio:~$ <span className="text-[#00FF80]">cat about.txt</span>
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mb-2">Hi, I’m Triumph 👋</h1>
              <p className="text-[#9affc2] text-sm mb-6">
                Software Engineer • Tech Enthusiast • Coffee Lover
              </p>

              <p className="text-[#c4ffde] leading-relaxed mb-6">
                Welcome to my corner of the internet! When I'm not coding, you’ll find me exploring the latest tech trends
                or diving deep into random research rabbit holes. I believe in using technology to transform lives —
                and I enjoy sharing the stories behind how it all works.
              </p>

              <p className="text-[#00FF80] mb-4 font-semibold tracking-wider">
                 echo "Let's connect!"
                <span className="animate-blink">█</span>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-5 mt-10 flex-wrap">
              {[
                {
                  icon: <FaGithub />,
                  url: "https://github.com/TriumphNdlovu",
                  color: "hover:text-[#00FF80]",
                },
                {
                  icon: <FaLinkedin />,
                  url: "https://www.linkedin.com/in/triumph-ndlovu-425b73274/",
                  color: "hover:text-[#00FF80]",
                },
                {
                  icon: <FaEnvelope />,
                  url: "mailto:realtriumphndlovu@gmail.com",
                  color: "hover:text-[#00FF80]",
                },
                {
                  icon: <FaGlobe />,
                  url: "https://triumph-portfolio-seven.vercel.app",
                  color: "hover:text-[#00FF80]",
                },
                {
                  icon: <FaWhatsapp />,
                  url: "https://wa.me/+27827793863",
                  color: "hover:text-[#00FF80]",
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl text-[#9affc2]/80 transition-all duration-300 ${item.color}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>

            {/* GitHub Stats */}
            <div className="mt-14 text-left bg-[#0f0f0f] border border-[#00FF80]/30 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
              <p className="text-[#9affc2] text-sm mb-3">
                triumph@portfolio:~$ <span className="text-[#00FF80]">cat github_stats.log</span>
              </p>
              <h2 className="text-2xl font-bold mb-6 text-[#00FF80]">GitHub Activity</h2>
              <div className="flex flex-col items-center gap-6">
                <a
                  href="https://ghchart.rshah.org/00FF80/TriumphNdlovu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://ghchart.rshah.org/00FF80/TriumphNdlovu"
                    alt="GitHub Calendar"
                    className="rounded-lg border border-[#00FF80]/40 shadow-[0_0_10px_#00FF80]"
                  />
                </a>
                <img
                  src="https://github-readme-stats.vercel.app/api?username=TriumphNdlovu&show_icons=true&theme=dark&title_color=00FF80&icon_color=00FF80&text_color=9affc2&bg_color=0b0b0b"
                  alt="GitHub Stats"
                  className="rounded-lg border border-[#00FF80]/40 shadow-[0_0_10px_#00FF80]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
