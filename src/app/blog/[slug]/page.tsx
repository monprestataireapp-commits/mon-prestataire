import React from 'react'
import { BLOG_POSTS, getBlogPost } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Tag, Search } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} — Blog MonPrestataire`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: 'article' },
  }
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactElement[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-cormorant text-2xl font-bold text-white mt-8 mb-3">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-white/60 text-sm mb-4 ml-2">
          {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />)}
        </ul>
      )
      continue
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} className="text-white/60 text-sm leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
      )
    }
    i++
  }
  return elements
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  const otherPosts = BLOG_POSTS.filter(p => p.slug !== params.slug).slice(0, 3)

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Retour au blog
        </Link>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-xs text-rose bg-rose/10 px-2 py-1 rounded-full">
              <Tag size={10} /> {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Clock size={10} /> {post.readTime} min
            </span>
            <span className="text-xs text-white/20">
              {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            {post.title}
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">{post.description}</p>
        </div>

        {/* Content */}
        <div className="border-t border-dark-border pt-8 mb-12">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-rose/10 to-gold/5 border border-rose/20 rounded-2xl p-6 mb-12 text-center">
          <h3 className="font-cormorant text-2xl font-bold text-white mb-2">Trouvez votre prestataire idéal</h3>
          <p className="text-white/50 text-sm mb-4">Des professionnels vérifiés près de chez vous, avec avis clients et tarifs transparents.</p>
          <Link href="/recherche" className="btn-primary inline-flex items-center gap-2">
            <Search size={15} /> Rechercher maintenant
          </Link>
        </div>

        {/* Articles connexes */}
        {otherPosts.length > 0 && (
          <div>
            <h3 className="font-cormorant text-2xl font-bold text-white mb-4">Articles connexes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherPosts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-rose/30 transition-colors group">
                  <p className="text-xs text-rose mb-2">{p.category}</p>
                  <h4 className="text-white text-sm font-medium group-hover:text-rose transition-colors line-clamp-2">{p.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
