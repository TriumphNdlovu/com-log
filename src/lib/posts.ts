import frontMatter from 'front-matter'

const postFiles = import.meta.glob('../posts/*.md', { eager: true, as: 'raw' })

export interface PostMeta {
  title: string
  date: string
  description?: string
  slug: string
}

interface PostAttributes {
  title?: string
  date?: string
  description?: string
}

export const posts: PostMeta[] = Object.entries(postFiles).map(([path, content]) => {
  const raw = content as string
  const { attributes } = frontMatter<PostAttributes>(raw)
  const slug = path.split('/').pop()!.replace('.md', '')
  return {
    slug,
    title: attributes.title ?? 'No title',
    date: attributes.date ?? '',
    description: attributes.description ?? '',
  }
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())