import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

// Only allow simple slug characters — no path separators or traversal.
const isValidSlug = (slug: string) => /^[a-zA-Z0-9-_]+$/.test(slug)

export default function Post({ slug }: PostProps) {
  const [meta, setMeta] = useState<PostMeta | null>(null)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPost() {
      if (!slug) return
      setIsLoading(true)
      setNotFound(false)

      if (!isValidSlug(slug)) {
        if (!cancelled) {
          setMeta(null)
          setNotFound(true)
          setIsLoading(false)
        }
        return
      }

      try {
        const module = await import(`../posts/${slug}.md?raw`)
        if (cancelled) return // a newer load has already started; discard this result

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
        if (cancelled) return
        console.error('Failed to load post:', error)
        setMeta(null)
        setNotFound(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadPost()
    return () => {
      cancelled = true
    }
  }, [slug])

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return 'Unknown date'
    return d.toLocaleDateString('en-UK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const estimateReadTime = (text: string) => {
    const wordsPerMinute = 200
    const stripped = text
      .replace(/```[\s\S]*?```/g, '') // drop code blocks
      .replace(/[#>*_`-]/g, '') // drop markdown syntax chars
    const wordCount = stripped.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }

  if (isLoading)
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-[#050505] text-[#00FF80] flex items-center justify-center font-mono text-lg"
      >
        <p>
          triumph@tlt-media:~$ <span className="animate-pulse">loading_post.sh ...</span>
        </p>
      </div>
    )

  if (notFound || !meta)
    return (
      <div
        role="alert"
        className="min-h-screen bg-[#050505] text-[#FF5F56] flex items-center justify-center font-mono"
      >
        <p>error: post not found</p>
      </div>
    )

  return (
    <div className="min-h-screen text-[#00FF80] font-mono flex flex-col items-center px-4 py-12 relative">
      <article className="border border-[#00FF80]/20 bg-[#0b0b0b]/50 rounded-md p-6 leading-relaxed text-[#9affc2] shadow-[0_0_8px_#00FF80]/10">
        <h1 className="text-3xl font-bold mb-2 text-[#00FF80]">{meta.title}</h1>
        {meta.description && (
          <p className="text-[#9affc2]/80 italic mb-2">{meta.description}</p>
        )}
        <div className="text-xs text-[#55dd99] tracking-wide">
          {formatDate(meta.date)} — {meta.author || 'Anonymous'} — {estimateReadTime(content)} min read
        </div>

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
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
            table: ({ ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="border-collapse border border-[#00FF80]/30 w-full text-sm" {...props} />
              </div>
            ),
            th: ({ ...props }) => (
              <th className="border border-[#00FF80]/30 px-3 py-2 text-left text-[#00FF80]" {...props} />
            ),
            td: ({ ...props }) => (
              <td className="border border-[#00FF80]/20 px-3 py-2" {...props} />
            ),
            a: ({ ...props }) => (
              <a className="text-[#00FF80] underline hover:text-[#9affc2] transition-colors" {...props} />
            ),
            img: ({ src, alt, ...props }) => (
              <img src={src} alt={alt} className="max-w-full h-auto rounded border border-[#00FF80]/30 my-4" {...props} />
            ),
            code: ({ className, children, ...props }: any) => {
              const isInline = !className && typeof children === 'string' && !children.includes('\n')
              if (isInline) {
                return (
                  <code
                    className="bg-[#000] text-[#55dd99] px-1.5 py-0.5 rounded text-sm border border-[#00FF80]/20"
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <pre className="bg-[#000] rounded p-4 overflow-x-auto text-[#55dd99] border border-[#00FF80]/20 my-4">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      <div className="mt-8 text-xs text-[#00FF80]/70">
        <span>type "clear" to clear screen</span>
      </div>
    </div>
  )
}
