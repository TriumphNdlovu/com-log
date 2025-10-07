import React from "react"
import { Calendar } from "lucide-react"
import { posts } from "../lib/posts"

export interface PostMeta {
  title: string
  date: string
  slug: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface PostListProps {
  onOpenPost: (slug: string) => void
}

const PostList: React.FC<PostListProps> = ({ onOpenPost }) => {
  return (
    <div className="space-y-4 font-mono text-[#00FF80]">
      {posts.map((post: PostMeta) => (
        <div
          key={post.slug}
          onClick={() => onOpenPost(post.slug)}
          className="flex items-center justify-between  hover:text-[#9affc2] hover:border-[#00FF80]/70 transition-all duration-300 coursor-pointer border-b border-transparent pb-1"
        >
          <span className="text-base md:text-md">&gt; {post.title}</span>
          <div className="flex items-center gap-1 text-sm text-[#00FF80]/70">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PostList
