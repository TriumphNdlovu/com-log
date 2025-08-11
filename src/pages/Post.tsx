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
        const { attributes } = frontMatter(raw)
        const { body } = frontMatter(raw)
        const attrs = attributes as PostMeta

        setMeta({
          title: attrs.title ?? 'Untitled',
          date: attrs.date ?? new Date().toISOString(),
          description: attrs.description,
        })
        
        // body = funcMDtoHTML(body)
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
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3eb] to-[#eae1d5] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#8b6b4a] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-[#8b6b4a] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-[#8b6b4a] animate-bounce" />
        </div>
      </div>
    )
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3eb] to-[#eae1d5] flex items-center justify-center">
        <div className="text-[#8b6b4a] text-lg bg-[#8b6b4a]/10 px-6 py-4 rounded-lg border border-[#8b6b4a]/20">
          Post not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3eb] to-[#eae1d5] relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139,107,74,0.12) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#8b6b4a] hover:text-[#5e4431] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to all posts</span>
          </Link>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#5e4431] mb-6">
            {meta.title}
          </h1>

          {meta.description && (
            <p className="text-lg text-[#6b5644] mb-8 bg-white/50 border border-[#d2c2b0] rounded-lg p-6">
              {meta.description}
            </p>
          )}

          <div className="flex flex-wrap gap-6 text-[#8b6b4a] text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            </div>
            <div className='flex items-center gap-2'>
              <User className="w-4 h-4" />
              <span>{meta.author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{estimateReadTime(content)} min read</span>
            </div>
          </div>
        </header>

        <article className="prose prose-lg max-w-none text-[#3a2f2f]">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-4xl font-bold text-[#5e4431]" {...props} />,
              h2: ({ ...props }) => <h2 className="text-3xl font-bold text-[#5e4431]" {...props} />,
              h3: ({ ...props }) => <h3 className="text-2xl font-bold text-[#5e4431]" {...props} />,
              p: ({ ...props }) => <p className="text-[#3a2f2f] mb-4" {...props} />,
              blockquote: ({ ...props }) => (
                <blockquote className="border-l-4 border-[#d2c2b0] pl-4 italic text-[#6b5644]" {...props} />
              ),
              ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
              li: ({ ...props }) => <li className="mb-2" {...props} />,
              a: ({ ...props }) => (
                <a
                  className="text-blue-500 hover:underline"
                  {...props}
                />
              ),
              img: ({ src, alt, ...props }) => (
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg border border-[#d2c2b0]"
                  {...props}
                />
              )
              ,
              code: ({ className, children, ...props }) => {
                const language = className ? className.replace('language-', '') : 'text'
                return (
                  <pre className={`bg-[#f3ece2] rounded-lg overflow-x-auto border border-[#d2c2b0] p-4`}>
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

        <footer className="mt-16 pt-8 border-t border-[#d2c2b0]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8b6b4a]/10 hover:bg-[#8b6b4a]/20 text-[#5e4431] rounded-lg transition duration-200 border border-[#d2c2b0]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to all posts
          </Link>
        </footer>
      </div>
    </div>
  )
}
