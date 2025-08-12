import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-[#fdfaf5] to-[#e8e0d3] flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#8b6b4a] animate-pulse [animation-delay:-0.3s]" />
          <div className="w-3 h-3 rounded-full bg-[#8b6b4a] animate-pulse [animation-delay:-0.15s]" />
          <div className="w-3 h-3 rounded-full bg-[#8b6b4a] animate-pulse" />
        </div>
      </div>
    )
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfaf5] to-[#e8e0d3] flex items-center justify-center">
        <div className="text-[#5e4431] text-lg font-medium bg-white/80 backdrop-blur-sm px-8 py-4 rounded-xl border border-[#d2c2b0] shadow-md">
          Post not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfaf5] to-[#e8e0d3] relative font-sans">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(139,107,74,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#8b6b4a] hover:text-[#5e4431] transition-colors duration-300 mb-8 group font-medium"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back to all posts</span>
          </Link>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#5e4431] mb-6 tracking-tight">
            {meta.title}
          </h1>

          {meta.description && (
            <p className="text-lg md:text-xl text-[#6b5644] mb-8 bg-white/80 backdrop-blur-sm border border-[#d2c2b0] rounded-xl p-6 shadow-sm">
              {meta.description}
            </p>
          )}

          <div className="flex flex-wrap gap-6 text-[#8b6b4a] text-sm md:text-base font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            </div>
            {meta.author && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>by {meta.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{estimateReadTime(content)} min read</span>
            </div>
          </div>
        </header>

        <article className="prose prose-lg max-w-none text-[#3a2f2f] bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-[#d2c2b0]/50">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-4xl font-bold text-[#5e4431] mt-8 mb-4" {...props} />,
              h2: ({ ...props }) => <h2 className="text-3xl font-bold text-[#5e4431] mt-6 mb-4" {...props} />,
              h3: ({ ...props }) => <h3 className="text-2xl font-semibold text-[#5e4431] mt-5 mb-3" {...props} />,
              p: ({ ...props }) => <p className="text-[#3a2f2f] mb-5 leading-relaxed" {...props} />,
              blockquote: ({ ...props }) => (
                <blockquote className="border-l-4 border-[#8b6b4a] pl-4 italic text-[#6b5644] my-4" {...props} />
              ),
              ul: ({ ...props }) => <ul className="list-disc pl-6 mb-5" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-5" {...props} />,
              li: ({ ...props }) => <li className="mb-2 text-[#3a2f2f]" {...props} />,
              a: ({ ...props }) => (
                <a
                  className="text-[#8b6b4a] hover:text-[#5e4431] hover:underline transition-colors duration-200"
                  {...props}
                />
              ),
              img: ({ src, alt, ...props }) => (
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-xl border border-[#d2c2b0] my-4"
                  {...props}
                />
              ),
              code: ({ className, children, ...props }) => {
                const language = className ? className.replace('language-', '') : 'text'
                return (
                  <pre className="bg-[#f3ece2]/80 rounded-xl overflow-x-auto border border-[#d2c2b0]/50 p-4 my-4">
                    <code className={`language-${language} text-[#5e4431]`} {...props}>
                      {children}
                    </code>
                  </pre>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        <footer className="mt-16 pt-8 border-t border-[#d2c2b0]/50">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#8b6b4a]/10 text-[#5e4431] rounded-xl transition-all duration-300 border border-[#d2c2b0] shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to all posts
          </Link>
        </footer>
      </div>
    </div>
  )
}