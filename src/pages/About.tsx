import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";

export default function About() {
  const links = [
    ["GitHub", "https://github.com/TriumphNdlovu", <FaGithub />],
    ["LinkedIn", "https://www.linkedin.com/in/triumph-ndlovu-425b73274/", <FaLinkedin />],
    ["Email", "mailto:realtriumphndlovu@gmail.com", <FaEnvelope />],
    ["Portfolio", "https://triumph-portfolio-seven.vercel.app", <FaGlobe />],
    ["WhatsApp", "https://api.whatsapp.com/send/?phone=%2B27827793863&text=Hello&type=phone_number&app_absent=0", <FaWhatsapp />],
  ] as const;

  return (
    <section className="my-2 grid gap-6 border-y border-[var(--line)] py-7 md:grid-cols-[180px_minmax(0,1fr)]">
      <div>
        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-1">
          <img
            src="/me.png"
            alt="Triumph Ndlovu"
            className="aspect-[4/5] w-full rounded-lg object-cover object-top grayscale-[15%]"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> available for good problems
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--accent)]">Author profile</p>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">Triumph Ndlovu</h2>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">Software engineer · systems thinker · coffee enthusiast</p>
        <p className="mt-5 max-w-2xl leading-7 text-[var(--fg-dim)]">
          This is a public notebook for the things I learn while building software: useful failures,
          small explanations, strange debugging sessions, and notes worth keeping beyond the next sprint.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {links.map(([label, url, icon]) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-xs text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
