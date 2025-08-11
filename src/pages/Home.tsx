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
      "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."
  ]

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <>
      {/* Background */}
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3eb] to-[#eae1d5] text-[#3a2f2f] relative">
        {/* Subtle paper-like background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(90, 60, 30, 0.12) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                 



            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#5e4431] mb-8">Latest Posts</h2>
              <div className="max-w-4xl mx-auto px-4 sm:px-3 lg:px-4 mb-5 text-center italic text-[#8b6b4a] border-l-4 border-[#d2c2b0] pl-4">
                “{randomQuote}”
              </div>
              <main className="sm:p-5  rounded-xl ">
                <PostList />
              </main>
            </div>
        </div>

      </div>
    </>
  )
}
