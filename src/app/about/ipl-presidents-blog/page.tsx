'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/contexts/TranslationContext'
import { FileText, Calendar, X } from 'lucide-react'

interface PresidentBlogPost {
  id: string
  title_en: string
  title_ta: string
  description_en: string
  description_ta: string
  image_url: string
}

export default function PresidentBlogPage() {
  const { t, lang } = useTranslation()
  const [posts, setPosts] = useState<PresidentBlogPost[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<PresidentBlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 8

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/president-blog?limit=500')
        const data = await res.json()
        if (data.success) setPosts(data.data || [])
      } catch (error) {
        console.error('Failed to load president blog posts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  const totalPages = Math.ceil(posts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPosts = posts.slice(startIndex, startIndex + itemsPerPage)

  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/Images/iplbanner.png"
            alt="President Blog background"
            fill
            className="opacity-40 object-contain"
            style={{ objectPosition: 'center' }}
            priority
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-red-100 shadow-sm mb-8">
              <FileText className="w-4 h-4 text-red-700" />
              <span className="text-xs font-semibold tracking-wider uppercase text-red-800">
                {t('blog.hero.badge', lang === 'ta' ? 'தலைவரின் குரல்' : "President's Voice")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">
              {t('blog.hero.title', "IPL President's Blog")}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-8 h-8 text-neutral-900" />
            <h2 className="text-3xl font-bold text-neutral-900">
              {t('blog.allPosts.title', "President's Updates")}
            </h2>
          </div>

          {loading ? (
            <p className="text-gray-500">{t('blog.loading', lang === 'ta' ? 'பதிவுகள் ஏற்றப்படுகிறது...' : 'Loading blog posts...')}</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPosts.map((post) => {
                  const title = lang === 'ta' && post.title_ta ? post.title_ta : post.title_en
                  const description = lang === 'ta' && post.description_ta ? post.description_ta : post.description_en
                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-neutral-100 cursor-pointer"
                    >
                      <div className="relative h-64 overflow-hidden bg-neutral-200">
                        <Image
                          src={post.image_url}
                          alt={title}
                          fill
                          className="object-contain bg-neutral-100"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors" dangerouslySetInnerHTML={{ __html: title }} />
                        <p className="text-xs text-neutral-600 mb-3 line-clamp-2">
                          {description?.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-full text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('blog.pagination.previous', 'Previous')}
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-red-700 text-white shadow-md'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-full text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('blog.pagination.next', 'Next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex justify-end p-4 bg-white border-b border-neutral-200 z-10">
              <button
                onClick={() => setSelectedPost(null)}
                className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 flex items-center justify-center transition-colors"
                aria-label={t('common.close', lang === 'ta' ? 'மூடு' : 'Close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-neutral-200">
                <Image
                  src={selectedPost.image_url}
                  alt={lang === 'ta' && selectedPost.title_ta ? selectedPost.title_ta : selectedPost.title_en}
                  fill
                  className="object-contain bg-neutral-100"
                />
              </div>

              <div className="p-6 md:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6" dangerouslySetInnerHTML={{ __html: lang === 'ta' && selectedPost.title_ta ? selectedPost.title_ta : selectedPost.title_en }} />

                <div
                  className="prose prose-lg max-w-none text-neutral-700 mb-8"
                  dangerouslySetInnerHTML={{
                    __html: lang === 'ta' && selectedPost.description_ta
                      ? selectedPost.description_ta
                      : selectedPost.description_en
                  }}
                />

                <button
                  onClick={() => setSelectedPost(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-700 text-white rounded-full font-semibold hover:bg-red-800 transition-colors"
                >
                  {t('blog.closeReading', lang === 'ta' ? 'மூடு' : 'Close Reading')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
