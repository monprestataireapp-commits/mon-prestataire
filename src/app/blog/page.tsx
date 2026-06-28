import { BLOG_POSTS } from '@/lib/blog'
import Link from 'next/link'
import { Clock, Tag } from 'lucide-react'

export const metadata = {
  title: 'Blog — Conseils prestataires & événements — MonPrestataire',
  description: 'Conseils pour choisir vos prestataires, tendances événementiel, guides mariage et astuces pour les professionnels indépendants.',
}

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-white mb-3">
          Le <span className="text-gradient-rose-gold">Blog</span>
        </h1>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Conseils, tendances et guides pour organiser vos événements et développer votre activité.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`group bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-rose/30 transition-all ${i === 0 ? 'md:col-span-2' : ''}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 text-xs text-rose bg-rose/10 px-2 py-1 rounded-full">
                <Tag size={10} /> {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/30">
                <Clock size={10} /> {post.readTime} min de lecture
              </span>
              <span className="text-xs text-white/20">{new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h2 className={`font-cormorant font-bold text-white group-hover:text-rose transition-colors mb-2 ${i === 0 ? 'text-3xl' : 'text-xl'}`}>
              {post.title}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">{post.description}</p>
            <p className="text-rose text-sm mt-4 font-medium group-hover:underline">Lire l&apos;article →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

