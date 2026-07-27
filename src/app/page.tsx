import { Suspense } from 'react'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/api'
import { Hero } from '@/components/site/home/hero'
import { Highlights, Brands, PromoBanner, Benefits, Stats, WhyChoose, Testimonials, FinalCta } from '@/components/site/home/sections'
import { FeaturedProducts } from '@/components/site/home/featured-products'
import { ScrollReveal } from '@/components/site/scroll-reveal'
import { RecentlyViewed } from '@/components/site/recently-viewed'
import { LookbookSection } from '@/components/site/lookbook'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let products: Awaited<ReturnType<typeof db.product.findMany>> = []
  let categories: Awaited<ReturnType<typeof db.category.findMany>> = []

  try {
    [products, categories] = await Promise.all([
      db.product.findMany({
        where: { active: true },
        include: { category: true },
        orderBy: [{ featured: 'desc' }, { reviewCount: 'desc' }],
        take: 12,
      }),
      db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    ])
  } catch (err) {
    console.error('[Home] DB query failed, showing fallback:', err)
  }

  const serialized = products.map((p) => ({
    ...serializeProduct(p),
    category: p.category,
  }))

  return (
    <>
      <ScrollReveal><Hero /></ScrollReveal>
      <ScrollReveal delay={100}><Highlights /></ScrollReveal>
      <ScrollReveal delay={200}><Brands /></ScrollReveal>
      <ScrollReveal delay={300}><FeaturedProducts products={serialized} categories={categories} /></ScrollReveal>
      <Suspense fallback={null}>
        <ScrollReveal delay={400}><RecentlyViewed /></ScrollReveal>
      </Suspense>
      <ScrollReveal delay={500}><LookbookSection /></ScrollReveal>
      <ScrollReveal delay={550}><PromoBanner /></ScrollReveal>
      <ScrollReveal delay={600}><Benefits /></ScrollReveal>
      <ScrollReveal delay={650}><Stats /></ScrollReveal>
      <ScrollReveal delay={700}><WhyChoose /></ScrollReveal>
      <ScrollReveal delay={800}><Testimonials /></ScrollReveal>
      <ScrollReveal delay={900}><FinalCta /></ScrollReveal>
    </>
  )
}
