import React from 'react'
import PostList from '../components/PostList'
import Navbar from '../components/Navbar'

export default function Home() {
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
              <h2 className="text-3xl font-semibold text-[#5e4431] mb-8">Latest Posts</h2>
              <main className="sm:p-5  rounded-xl ">
                <PostList />
              </main>
            </div>
        </div>

      </div>
    </>
  )
}
