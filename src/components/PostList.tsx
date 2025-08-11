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
    <div className="space-y-6">
      {posts.map((post: PostMeta) => (
        <article 
          key={post.slug} 
          className="group relative overflow-hidden rounded-xl border border-[#d2c2b0] bg-gradient-to-br from-white/50 to-[#f7f3eb]/50 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#8b6b4a]/0 to-[#8b6b4a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <Link to={`/post/${post.slug}`}>
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-[#8b6b4a]">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  <div className="text-sm text-[#6b5644]">
                    
                    <span>{post.author}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {/* Post title and description */}

                <h2 className="text-2xl font-bold text-[#5e4431] group-hover:text-[#8b6b4a] transition-colors duration-300">
                  {post.title}
                </h2>

                {post.description && (
                  <p className="text-[#6b5644] line-clamp-2">
                    {post.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[#8b6b4a] font-medium pt-2">
                  <span className="text-sm">Read post</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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