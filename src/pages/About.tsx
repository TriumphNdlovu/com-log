import React from "react";
import Navbar from "../components/Navbar";
import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe } from "react-icons/fa";

export default function About() {
  return (
    <>
      {/* Background */}
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3eb] to-[#eae1d5] text-[#3a2f2f] relative">
        {/* Paper-like pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(90, 60, 30, 0.12) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fadeIn">
            {/* Profile Image */}
            <img
              src="/me.png"
              alt="Triumph Ndlovu"
              className="w-32 h-32 rounded-full mx-auto mb-6 shadow-lg border-4 border-white transform transition duration-300 hover:scale-105"
            />

            {/* Name */}
            <h1 className="text-3xl font-bold mb-2">Hi, I’m Triumph 👋</h1>
            <p className="text-gray-500 mb-6 text-sm">Developer • Tech Enthusiast • Coffee Lover</p>

            {/* Bio */}
            <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
              Welcome to my personal corner of the internet! I love building
              projects that mix creativity with clean code — from Vue & Tailwind
              tips to full-stack experiments. When I’m not coding, you’ll find
              me exploring new tech trends or perfecting my coffee brewing game.
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-5 mb-12">
              {[
                {
                  icon: <FaGithub />,
                  url: "https://github.com/yourusername",
                  color: "hover:bg-gray-800",
                },
                {
                  icon: <FaLinkedin />,
                  url: "https://linkedin.com/in/yourusername",
                  color: "hover:bg-blue-700",
                },
                {
                  icon: <FaEnvelope />,
                  url: "mailto:youremail@example.com",
                  color: "hover:bg-red-500",
                },
                {
                  icon: <FaGlobe />,
                  url: "https://triumph-portfolio-seven.vercel.app",
                  color: "hover:bg-green-600",
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 bg-white rounded-full shadow-md text-xl text-gray-700 transition-all duration-300 ${item.color} hover:text-white`}
                >
                  {item.icon}
                </a>
              ))}
            </div>

            {/* GitHub Stats */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-6">GitHub Activity</h2>
              <div className="gap-4">
                <a
                  href="https://ghchart.rshah.org/2DBA4E/TriumphNdlovu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://ghchart.rshah.org/2DBA4E/TriumphNdlovu"
                    alt="GitHub Calendar"
                    className="mx-auto rounded-lg shadow-lg border p-4"
                  />
                </a>
                <img
                  src="https://github-readme-stats.vercel.app/api?username=TriumphNdlovu&show_icons=true&theme=light"
                  alt="GitHub Stats"
                  className="mx-auto rounded-lg shadow-lg border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
