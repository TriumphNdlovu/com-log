import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";

export default function About() {
  return (
    <div className="text-left text-[#00FF80] font-mono space-y-6">
      {/* Profile Image */}
      <div className="flex justify-center mb-4">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-[#00FF80]/40 blur-lg rounded-full animate-pulse"></div>
          <img
            src="/me.png"
            alt="Triumph Ndlovu"
            className="relative w-28 h-28 rounded-full border-2 border-[#00FF80]/70 shadow-[0_0_15px_#00FF80]"
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-2 text-center">
        <div className="text-[#00FF80] font-bold text-xl md:text-2xl">Hi, I’m Triumph 👋</div>
        <div className="text-[#9affc2] text-sm md:text-base">
          Software Engineer • Tech Enthusiast • Coffee Lover
        </div>
        <div className="text-[#c4ffde] text-sm md:text-base leading-relaxed max-w-lg mx-auto">
          Welcome to my digital terminal! When I'm not building software, I'm exploring new tech,
          automating processes, or diving into research rabbit holes. I love sharing the
          “how and why” behind technology to help others learn.
        </div>
        <div className="text-[#00FF80] font-semibold tracking-wider mt-2">
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
            className="text-[#9affc2]/80 hover:text-[#00FF80] transition-all duration-300 text-2xl"
          >
            {item.icon}
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#00FF80]/40 my-4 mx-auto max-w-xs animate-pulse"></div>

      {/* Footer Message */}
      <div className="text-center text-[#9affc2] text-xs md:text-sm">
        <span className="text-[#00FF80]">help</span> to see more commands
      </div>
    </div>
  );
}
