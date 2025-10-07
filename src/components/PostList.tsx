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
    <div className="space-y-8 font-mono">
      {posts.map((post: PostMeta) => (
        <article
          key={post.slug}
          className="group relative overflow-hidden border border-[#00FF80]/30 bg-[#0b0b0b]/70 backdrop-blur-sm rounded-lg p-5 transition-all duration-300 hover:border-[#00FF80]/70 hover:shadow-[0_0_12px_#00FF80] cursor-pointer"
        >
          <Link to={`/post/${post.slug}`} className="block">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-[#00FF80]/80 text-sm">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.author && (
                  <div className="text-[#9affc2]">
                    <span>by {post.author}</span>
                  </div>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-[#00FF80] group-hover:text-[#9affc2] transition-colors duration-300 mt-3">
                {post.title}
              </h2>

              {post.description && (
                <p className="mt-2 text-[#9affc2]/80 text-sm leading-relaxed">
                  {post.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2 text-[#00FF80] text-sm font-semibold">
                <span>&gt; Read post</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}

export default PostList
