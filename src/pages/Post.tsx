import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import frontMatter from 'front-matter'

interface PostMeta {
  title: string
  date: string
  description?: string
  author?: string
}

interface PostProps {
  slug: string
}

export default function Post({ slug }: PostProps) {
  const [meta, setMeta] = useState<PostMeta | null>(null)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPost() {
      if (!slug) return
      try {
        setIsLoading(true)
        const module = await import(`../posts/${slug}.md?raw`)
        const raw = module.default || module
        const { attributes, body } = frontMatter(raw)
        const attrs = attributes as PostMeta

        setMeta({
          title: attrs.title ?? 'Untitled',
          date: attrs.date ?? new Date().toISOString(),
          description: attrs.description,
          author: attrs.author,
        })
        setContent(body)
      } catch (error) {
        console.error('Failed to load post:', error)
        setMeta(null)
        setContent('Post not found.')
      } finally {
        setIsLoading(false)
      }
    }
    loadPost()
  }, [slug])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-UK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const estimateReadTime = (text: string) => {
    const wordsPerMinute = 200
    const wordCount = text.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#050505] text-[#00FF80] flex items-center justify-center font-mono text-lg">
        <p>
          triumph@tlt-media:~$ <span className="animate-pulse">loading_post.sh ...</span>
        </p>
      </div>
    )

  if (!meta)
    return (
      <div className="min-h-screen bg-[#050505] text-[#FF5F56] flex items-center justify-center font-mono">
        <p>error: post not found</p>
      </div>
    )

  return (
    <div className="min-h-screen  text-[#00FF80] font-mono flex flex-col items-center px-4 py-12 relative">
      {/* Scanline overlay */}

      
      {/* Post Body */}
      <article className="border border-[#00FF80]/20 bg-[#0b0b0b]/50 rounded-md p-6 leading-relaxed text-[#9affc2] shadow-[0_0_8px_#00FF80]/10">
        
            <h1 className="text-3xl font-bold mb-2 text-[#00FF80]">{meta.title}</h1>
            {meta.description && (
              <p className="text-[#9affc2]/80 italic mb-2">{meta.description}</p>
            )}
            <div className="text-xs text-[#55dd99] tracking-wide">
              {formatDate(meta.date)} — {meta.author || 'Anonymous'} — {estimateReadTime(content)} min read
            </div>
          

          
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 text-[#00FF80]" {...props} />,
                h2: ({ ...props }) => <h2 className="text-2xl font-semibold mt-5 mb-3 text-[#00FF80]" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-medium mt-4 mb-2 text-[#00FF80]" {...props} />,
                p: ({ ...props }) => <p className="mb-4" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-[#00FF80]/60 pl-4 italic text-[#55dd99] my-4" {...props} />
                ),
                ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                li: ({ ...props }) => <li className="mb-2" {...props} />,
                a: ({ ...props }) => (
                  <a className="text-[#00FF80] underline hover:text-[#9affc2] transition-colors" {...props} />
                ),
                img: ({ src, alt, ...props }) => (
                  <img src={src} alt={alt} className="max-w-full h-auto rounded border border-[#00FF80]/30 my-4" {...props} />
                ),
                code: ({ className, children, ...props }) => (
                  <pre className="bg-[#000] rounded p-4 overflow-x-auto text-[#55dd99] border border-[#00FF80]/20 my-4">
                    <code className={className} {...props}>{children}</code>
                  </pre>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Footer */}
          <div className="mt-8 text-xs text-[#00FF80]/70">
              <span>type "clear" to clear screen</span>
          </div>
        </div>

  )
}
