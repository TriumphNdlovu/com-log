import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import frontMatter from 'front-matter'

interface PostMeta {
  title: string
  date: string
  description?: string
  author?: string
}

export default function Post() {
  const { slug } = useParams<{ slug: string }>()
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
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

  const estimateReadTime = (text: string) => {
    const wordsPerMinute = 200
    const wordCount = text.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-[#00ff90] flex items-center justify-center font-mono">
        <div className="flex gap-2">
          <span className="animate-pulse">Loading</span>
          <span className="animate-pulse delay-150">.</span>
          <span className="animate-pulse delay-300">.</span>
          <span className="animate-pulse delay-500">.</span>
        </div>
      </div>
    )
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-[#ff5f56] flex items-center justify-center font-mono">
        <div>Post not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#00ff90] font-mono flex flex-col">
      {/* Terminal window container */}
      <div className="max-w-5xl mx-auto mt-24 mb-12 w-full rounded-lg border border-[#222] shadow-lg bg-[#1a1a1a] overflow-hidden">
        
        {/* Terminal header */}
        <div className="flex items-center justify-start space-x-2 px-4 py-2 bg-[#2a2a2a] border-b border-[#333]">
          <span className="w-3 h-3 bg-[#ff5f56] rounded-full"></span>
          <span className="w-3 h-3 bg-[#ffbd2e] rounded-full"></span>
          <span className="w-3 h-3 bg-[#27c93f] rounded-full"></span>
          <span className="ml-3 text-sm text-[#ccc]">
            ~/Documents/Blog/{slug}.md
          </span>
        </div>

        {/* Terminal content */}
        <div className="px-6 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#00ff90] hover:text-[#fff] mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>cd ..</span>
          </Link>

          <p className="mb-2">
            triumph@tlt-media:~$ <span className="text-[#00ff90]">cat {slug}.md</span>
          </p>

          <div className="border border-[#333] rounded-lg bg-[#0a0a0a] p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[#00ff90]">{meta.title}</h1>
            {meta.description && (
              <p className="text-[#80ffaa] mb-4 italic">{meta.description}</p>
            )}
            <div className="text-sm text-[#55dd99] mb-4">
              {formatDate(meta.date)} — {meta.author || 'Anonymous'} — {estimateReadTime(content)} min read
            </div>
          </div>

          <article className="border border-[#333] bg-[#0a0a0a] rounded-lg p-6 leading-relaxed text-[#00ff90]">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold text-[#00ff90] mt-8 mb-4" {...props} />,
                h2: ({ ...props }) => <h2 className="text-2xl font-semibold text-[#00ff90] mt-6 mb-3" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-medium text-[#00ff90] mt-4 mb-2" {...props} />,
                p: ({ ...props }) => <p className="mb-4 text-[#00ff90]" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-[#00cc77] pl-4 italic text-[#55dd99] my-4" {...props} />
                ),
                ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 text-[#00ff90]" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 text-[#00ff90]" {...props} />,
                li: ({ ...props }) => <li className="mb-2" {...props} />,
                a: ({ ...props }) => (
                  <a className="text-[#00ff90] underline hover:text-[#fff]" {...props} />
                ),
                img: ({ src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded border border-[#333] my-4"
                    {...props}
                  />
                ),
                code: ({ className, children, ...props }) => (
                  <pre className="bg-[#000] rounded p-4 overflow-x-auto text-[#55dd99] border border-[#333] my-4">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#00ff90] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all posts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
