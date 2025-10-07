import PostList from '../components/PostList'
import Navbar from '../components/Navbar'

export default function Home() {
  const quotes = [
    "Code is like humor. When you have to explain it, it’s bad.",
    "Fix the cause, not the symptom.",
    "Simplicity is the soul of efficiency.",
    "Before software can be reusable it first has to be usable.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "Experience is the name everyone gives to their mistakes.",
    "Deleted code is debugged code.",
    "Walking on water and developing software from a specification are easy if both are frozen.",
    "First, solve the problem. Then, write the code.",
    "Good code is its own best documentation.",
    "It's not a bug – it's an undocumented feature.",
    "The best way to get a project done faster is to start sooner.",
    "The only way to go fast is to go well.",
    "Don't comment bad code—rewrite it.",
    "Code never lies, comments sometimes do.",
    "Debugging is like being the detective in a crime movie where you are also the murderer.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "A language that doesn't affect the way you think about programming is not worth knowing.",
    "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away"
  ]

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <>
      <div className="min-h-screen bg-[#0d0d0d] text-[#00ff90] font-mono relative flex flex-col">
        {/* Navbar (still optional if you want a top bar like macOS terminal) */}
        <Navbar />

        {/* Terminal window */}
        <div className="relative max-w-5xl mx-auto mt-24 mb-12 w-full rounded-lg border border-[#222] shadow-lg bg-[#1a1a1a] overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center justify-start space-x-2 px-4 py-2 bg-[#2a2a2a] border-b border-[#333]">
            <span className="w-3 h-3 bg-[#ff5f56] rounded-full"></span>
            <span className="w-3 h-3 bg-[#ffbd2e] rounded-full"></span>
            <span className="w-3 h-3 bg-[#27c93f] rounded-full"></span>
            <span className="ml-3 text-sm text-[#ccc]">~/Documents/Blog/home.tsx</span>
          </div>

          {/* Terminal content */}
          <div className="px-6 py-8">
            <p className="text-sm text-[#999] mb-3">
              triumph@tlt-media:~$ <span className="text-[#00ff90]">cat latest-posts.log</span>
            </p>

            <div className="border border-[#333] rounded-lg bg-[#111] p-6 mb-10 text-[#00ff90] italic">
              “{randomQuote}”
            </div>

            <div className="text-[#00ff90]">
              <p className="mb-4">
                triumph@tlt-media:~$ <span className="text-[#00ff90]">fetch posts --latest</span>
              </p>
              <div className="border border-[#333] bg-[#0a0a0a] rounded-lg p-4">
                <PostList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
