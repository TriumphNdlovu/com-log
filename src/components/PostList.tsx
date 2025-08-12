import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { posts } from '../lib/posts'

export interface PostMeta {
  title: string
  date: string
  description?: string
  author?: string
  slug: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const PostList: React.FC = () => {
  return (
    <div className="space-y-8">
      {posts.map((post: PostMeta) => (
        <article 
          key={post.slug} 
          className="group relative overflow-hidden rounded-2xl border border-[#d2c2b0]/50 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#8b6b4a]/5 to-[#8b6b4a]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <Link to={`/post/${post.slug}`} className="block">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-[#8b6b4a]">
                  <Calendar className="w-5 h-5" />
                  <time dateTime={post.date} className="font-medium">
                    {formatDate(post.date)}
                  </time>
                  {post.author && (
                    <div className="text-sm text-[#6b5644] font-medium">
                      <span>by {post.author}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5">
                <h2 className="text-2xl md:text-3xl font-bold text-[#5e4431] group-hover:text-[#8b6b4a] transition-colors duration-300 tracking-tight">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="mt-3 text-[#6b5644] text-base md:text-lg line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-[#8b6b4a] font-semibold">
                  <span className="text-sm md:text-base">Read post</span>
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}

export default PostList