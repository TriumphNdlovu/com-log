import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";

export default function About() {
  return (
    <div className="text-left text-[var(--fg)] font-mono space-y-6">
      {/* Profile Image */}
      <div className="flex justify-center mb-4">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-[var(--fg)]/40 blur-lg rounded-full animate-pulse"></div>
          <img
            src="/me.png"
            alt="Triumph Ndlovu"
            className="relative w-28 h-28 rounded-full border-2 border-[var(--fg)]/70 shadow-[0_0_15px_#00FF80]"
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-2 text-center">
        <div className="text-[var(--fg)] font-bold text-xl md:text-2xl">Hi, I’m Triumph 👋</div>
        <div className="text-[var(--fg-dim)] text-sm md:text-base">
          Software Engineer • Tech Enthusiast • Coffee Lover
        </div>
        <div className="text-[var(--fg-dim)] text-sm md:text-base leading-relaxed max-w-lg mx-auto">
          Welcome to my digital terminal! When I'm not building software, I'm exploring new tech,
          automating processes, or diving into research rabbit holes. I love sharing the
          “how and why” behind technology to help others learn.
        </div>
        <div className="text-[var(--fg)] font-semibold tracking-wider mt-2">
          echo "Let's connect!" <span className="animate-blink">█</span>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        {[
          { icon: <FaGithub />, url: "https://github.com/TriumphNdlovu" },
          { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/triumph-ndlovu-425b73274/" },
          { icon: <FaEnvelope />, url: "mailto:realtriumphndlovu@gmail.com" },
          { icon: <FaGlobe />, url: "https://triumph-portfolio-seven.vercel.app" },
          { icon: <FaWhatsapp />, url: "https://api.whatsapp.com/send/?phone=%2B27827793863&text=Hello&type=phone_number&app_absent=0" },
        ].map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--fg-dim)]/80 hover:text-[var(--fg)] transition-all duration-300 text-2xl"
          >
            {item.icon}
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--fg)]/40 my-4 mx-auto max-w-xs animate-pulse"></div>

      {/* Footer Message */}
      <div className="text-center text-[var(--fg-dim)] text-xs md:text-sm">
        <span className="text-[var(--fg)]">help</span> to see more commands
      </div>
    </div>
  );
}
