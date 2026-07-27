import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  _dbInitialized: boolean | undefined
}

async function ensureDatabase() {
  // Prevent double init in development with HMR
  if (globalForPrisma._dbInitialized) return
  globalForPrisma._dbInitialized = true

  try {
    // Check if database already has data
    const db = globalForPrisma.prisma ?? new PrismaClient()
    globalForPrisma.prisma = db

    const count = await db.product.count()
    if (count > 0) {
      console.log(`[DB] Database ready with ${count} products`)
      return
    }

    console.log('[DB] Database is empty, running seed...')

    // Inline seed data
    const categories = [
      { name: 'Camisetas', slug: 'camisetas', color: '#F5A623', icon: 'shirt', sortOrder: 1 },
      { name: 'Vestidos', slug: 'vestidos', color: '#E94B8B', icon: 'dress', sortOrder: 2 },
      { name: 'Conjuntos', slug: 'conjuntos', color: '#7C5CE0', icon: 'layers', sortOrder: 3 },
      { name: 'Calças e Shorts', slug: 'calcas-e-shorts', color: '#4FA8E0', icon: 'pants', sortOrder: 4 },
      { name: 'Pijamas', slug: 'pijamas', color: '#F5D142', icon: 'moon', sortOrder: 5 },
      { name: 'Acessórios', slug: 'acessorios', color: '#5CC9A7', icon: 'hat', sortOrder: 6 },
      { name: 'Calçados', slug: 'calcados', color: '#FF7849', icon: 'shoe', sortOrder: 7 },
    ]

    for (const c of categories) {
      await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
    }

    const products: Array<{ name: string; slug: string; description: string; price: number; compareAtPrice?: number; images: string; sizes: string; colors: string; ageRange: string; categorySlug: string; rating: number; reviewCount: number; featured: boolean; stock: number; gender?: string }> = [
      { name: 'Camiseta Infantil Estampada', slug: 'camiseta-infantil-estampada', description: 'Camiseta 100% algodão com estampa divertida de sol sorridente. Macia, respirável e perfeita para o dia a dia da criançada.', price: 49.9, compareAtPrice: 69.9, images: '/images/products/camiseta-estampada.png', sizes: '2,4,6,8,10,12', colors: 'Amarelo,Laranja,Verde', ageRange: '2-12 anos', categorySlug: 'camisetas', rating: 4.8, reviewCount: 124, featured: true, stock: 80 },
      { name: 'Vestido Floral Infantil', slug: 'vestido-floral', description: 'Vestido leve e florido, perfeito para os dias quentes. Tecido suave que não irrita a pele.', price: 79.9, compareAtPrice: 99.9, images: '/images/products/vestido-floral.png', sizes: '2,4,6,8,10', colors: 'Rosa,Laranja', ageRange: '2-10 anos', categorySlug: 'vestidos', rating: 4.9, reviewCount: 89, featured: true, stock: 45 },
      { name: 'Conjunto Infantil Verão', slug: 'conjunto-verao', description: 'Conjunto verão composto por regata e shorts. Cores vibrantes que combinam com a energia da criançada.', price: 69.9, compareAtPrice: 89.9, images: '/images/products/conjunto-verao.png', sizes: '2,4,6,8,10', colors: 'Laranja,Azul', ageRange: '2-10 anos', categorySlug: 'conjuntos', rating: 4.7, reviewCount: 56, featured: true, stock: 60 },
      { name: 'Shorts Infantil Colorido', slug: 'shorts-colorido', description: 'Shorts leve e colorido com elástico na cintura para máximo conforto.', price: 39.9, images: '/images/products/shorts-colorido.png', sizes: '2,4,6,8,10,12', colors: 'Roxo,Amarelo', ageRange: '2-12 anos', categorySlug: 'calcas-e-shorts', rating: 4.6, reviewCount: 42, featured: true, stock: 75 },
      { name: 'Jaqueta Jeans Infantil', slug: 'jaqueta-jeans', description: 'Jaqueta jeans clássica e estilosa para os dias frescos.', price: 119.9, compareAtPrice: 149.9, images: '/images/products/jaqueta-jeans.png', sizes: '4,6,8,10,12', colors: 'Azul Claro', ageRange: '4-12 anos', categorySlug: 'camisetas', rating: 4.8, reviewCount: 67, featured: true, stock: 30 },
      { name: 'Conjunto Moletom Verde', slug: 'conjunto-moletom', description: 'Conjunto de moletom macio e quentinho. Blusa com capuz e calça.', price: 109.9, compareAtPrice: 139.9, images: '/images/products/conjunto-moletom.png', sizes: '2,4,6,8,10,12', colors: 'Verde Menta', ageRange: '2-12 anos', categorySlug: 'conjuntos', rating: 4.9, reviewCount: 73, featured: true, stock: 40 },
      { name: 'Vestido Arco-Íris', slug: 'vestido-arcoiris', description: 'Vestido leve com listras coloridas em arco-íris. Alegre e divertido.', price: 74.9, images: '/images/products/vestido-arcoiris.png', sizes: '2,4,6,8', colors: 'Colorido', ageRange: '2-8 anos', categorySlug: 'vestidos', rating: 4.7, reviewCount: 38, featured: false, stock: 50 },
      { name: 'Pijama Animais', slug: 'pijama-animais', description: 'Pijama confortável com estampa de animaizinhos fofos.', price: 64.9, compareAtPrice: 79.9, images: '/images/products/pijama-animais.png', sizes: '2,4,6,8,10', colors: 'Amarelo,Rosa', ageRange: '2-10 anos', categorySlug: 'pijamas', rating: 4.9, reviewCount: 95, featured: true, stock: 55 },
      { name: 'Camiseta Dino', slug: 'camiseta-dino', description: 'Camiseta com estampa de dinossauro super divertida.', price: 52.9, images: '/images/products/camiseta-dino.png', sizes: '2,4,6,8,10,12', colors: 'Verde,Azul', ageRange: '2-12 anos', categorySlug: 'camisetas', rating: 4.8, reviewCount: 51, featured: false, stock: 70 },
      { name: 'Calça Legging Estrelas', slug: 'calca-leg', description: 'Legging super confortável com estampa de estrelinhas.', price: 45.9, images: '/images/products/calca-leg.png', sizes: '2,4,6,8,10', colors: 'Roxo', ageRange: '2-10 anos', categorySlug: 'calcas-e-shorts', rating: 4.6, reviewCount: 33, featured: false, stock: 65 },
      { name: 'Boné Colorido', slug: 'bone-colorido', description: 'Boné com aba larga para proteger do sol. Colorido e leve.', price: 34.9, compareAtPrice: 44.9, images: '/images/products/bone-colorido.png', sizes: 'Único', colors: 'Laranja,Amarelo', ageRange: '2-10 anos', categorySlug: 'acessorios', rating: 4.5, reviewCount: 28, featured: false, stock: 90 },
      { name: 'Tênis Canvas Azul', slug: 'sapato-canvas', description: 'Tênis de canvas leve e flexível. Solado antiderrapante.', price: 89.9, compareAtPrice: 109.9, images: '/images/products/sapato-canvas.png', sizes: '20,21,22,23,24,25,26,27', colors: 'Azul', ageRange: '2-6 anos', categorySlug: 'calcados', rating: 4.7, reviewCount: 44, featured: true, stock: 35 },
      { name: 'Body Bebê Estrelas', slug: 'body-bebe-estrelas', description: 'Body para bebê em algodão premium com estampa de estrelinhas douradas.', price: 34.9, compareAtPrice: 44.9, images: '/images/products/body-bebe-estrelas.png', sizes: 'RN,1,2,3,6', colors: 'Amarelo,Branco', ageRange: '0-1 ano', categorySlug: 'camisetas', rating: 4.9, reviewCount: 78, featured: true, stock: 100, gender: 'unissex' },
      { name: 'Vestido Princesa Tulipa', slug: 'vestido-princesa-tulipa', description: 'Vestido de princesa com saia em tule e detalhes florais.', price: 119.9, compareAtPrice: 149.9, images: '/images/products/vestido-princesa-tulipa.png', sizes: '2,4,6,8', colors: 'Rosa,Lilás', ageRange: '2-8 anos', categorySlug: 'vestidos', rating: 4.8, reviewCount: 63, featured: true, stock: 25, gender: 'menina' },
      { name: 'Conjunto Safari Menino', slug: 'conjunto-safari', description: 'Conjunto safari com camisa e shorts em tom cáqui.', price: 74.9, images: '/images/products/conjunto-safari.png', sizes: '2,4,6,8,10', colors: 'Cáqui,Verde', ageRange: '2-10 anos', categorySlug: 'conjuntos', rating: 4.6, reviewCount: 29, featured: false, stock: 55, gender: 'menino' },
      { name: 'Pijama Espacial', slug: 'pijama-espacial', description: 'Pijama com estampa de foguete, planetas e estrelinhas.', price: 59.9, compareAtPrice: 74.9, images: '/images/products/pijama-espacial.png', sizes: '2,4,6,8,10', colors: 'Azul escuro', ageRange: '2-10 anos', categorySlug: 'pijamas', rating: 4.7, reviewCount: 41, featured: false, stock: 60, gender: 'unissex' },
      { name: 'Shorts Jeans Infantil', slug: 'shorts-jeans', description: 'Shorts jeans clássico com barra desfiada.', price: 49.9, images: '/images/products/shorts-jeans.png', sizes: '2,4,6,8,10,12', colors: 'Azul Claro', ageRange: '2-12 anos', categorySlug: 'calcas-e-shorts', rating: 4.5, reviewCount: 35, featured: false, stock: 70, gender: 'unissex' },
      { name: 'Camiseta Selo Animal', slug: 'camiseta-selo-animal', description: 'Camiseta em algodão orgânico com selo de certificação.', price: 54.9, compareAtPrice: 64.9, images: '/images/products/camiseta-selo-animal.png', sizes: '2,4,6,8,10,12', colors: 'Branco,Cinza', ageRange: '2-12 anos', categorySlug: 'camisetas', rating: 4.8, reviewCount: 57, featured: false, stock: 65, gender: 'unissex' },
      { name: 'Vestido Listras Coloridas', slug: 'vestido-listras-coloridas', description: 'Vestido com listras horizontais em cores vibrantes.', price: 69.9, images: '/images/products/vestido-listras.png', sizes: '2,4,6,8,10', colors: 'Colorido', ageRange: '2-10 anos', categorySlug: 'vestidos', rating: 4.6, reviewCount: 32, featured: false, stock: 45, gender: 'menina' },
      { name: 'Conjunto Festa Menina', slug: 'conjunto-festa-menina', description: 'Conjunto festivo com top de renda e saia midi.', price: 139.9, compareAtPrice: 179.9, images: '/images/products/conjunto-festa.png', sizes: '2,4,6,8', colors: 'Rosa,Branco', ageRange: '2-8 anos', categorySlug: 'conjuntos', rating: 4.9, reviewCount: 48, featured: true, stock: 20, gender: 'menina' },
    ]

    for (const p of products) {
      const category = await db.category.findUnique({ where: { slug: p.categorySlug } })
      if (!category) continue
      const { categorySlug, ...data } = p
      await db.product.upsert({
        where: { slug: data.slug },
        update: {},
        create: { ...data, categoryId: category.id, gender: (data as any).gender || 'unissex' },
      })
    }

    const reviews: Array<{ productSlug: string; authorName: string; rating: number; comment: string }> = [
      { productSlug: 'camiseta-infantil-estampada', authorName: 'Mariana S.', rating: 5, comment: 'Amei a camiseta! Tecido ótimo e meu filho adorou a estampa.' },
      { productSlug: 'camiseta-infantil-estampada', authorName: 'João P.', rating: 5, comment: 'Cores vibrantes, lavou e não desbotou. Recomendo!' },
      { productSlug: 'camiseta-infantil-estampada', authorName: 'Carla M.', rating: 4, comment: 'Boa qualidade, mas o tamanho veio um pouquinho grande.' },
      { productSlug: 'vestido-floral', authorName: 'Patrícia L.', rating: 5, comment: 'Vestido lindo e leve! Minha filha ficou um amor.' },
      { productSlug: 'vestido-floral', authorName: 'Fernanda R.', rating: 5, comment: 'Qualidade maravilhosa, super recomendo!' },
      { productSlug: 'conjunto-verao', authorName: 'Roberto A.', rating: 5, comment: 'Conjunto perfeito pro verão, tecido fresquinho.' },
      { productSlug: 'pijama-animais', authorName: 'Beatriz C.', rating: 5, comment: 'Pijama super macio, meu bebê dorme feliz!' },
      { productSlug: 'pijama-animais', authorName: 'Lucas T.', rating: 5, comment: 'Estampa linda e tecido confortável.' },
      { productSlug: 'jaqueta-jeans', authorName: 'Aline F.', rating: 5, comment: 'Jaqueta linda e de ótima qualidade. Caiu bem!' },
      { productSlug: 'conjunto-moletom', authorName: 'Daniela M.', rating: 5, comment: 'Moletom quentinho e fofo, perfeito pro frio.' },
      { productSlug: 'sapato-canvas', authorName: 'Gustavo L.', rating: 4, comment: 'Tênis confortável, meu filho ama.' },
      { productSlug: 'body-bebe-estrelas', authorName: 'Ana Luiza R.', rating: 5, comment: 'Body lindo e super macio! Meu bebê ficou um anjo.' },
      { productSlug: 'body-bebe-estrelas', authorName: 'Priscila F.', rating: 5, comment: 'Qualidade excelente, o algodão é muito delicado.' },
      { productSlug: 'vestido-princesa-tulipa', authorName: 'Camila S.', rating: 5, comment: 'Minha filha chorou de felicidade! Vestido perfeito para a festa.' },
      { productSlug: 'vestido-princesa-tulipa', authorName: 'Juliana M.', rating: 5, comment: 'Muito bem feito, os detalhes são encantadores!' },
      { productSlug: 'conjunto-safari', authorName: 'Ricardo N.', rating: 4, comment: 'Meu filho amou o tema safari! Tecido bom.' },
      { productSlug: 'pijama-espacial', authorName: 'Patrícia G.', rating: 5, comment: 'Pijama lindo e quentinho! Meu filho não quer tirar.' },
      { productSlug: 'pijama-espacial', authorName: 'Marcos V.', rating: 5, comment: 'Estampa perfeita, material de qualidade.' },
      { productSlug: 'shorts-jeans', authorName: 'Letícia A.', rating: 4, comment: 'Bom shorts, caiu bem no meu filho.' },
      { productSlug: 'camiseta-selo-animal', authorName: 'Renata B.', rating: 5, comment: 'Amei o conceito sustentável! Camiseta muito bonita.' },
      { productSlug: 'vestido-listras-coloridas', authorName: 'Fernanda K.', rating: 5, comment: 'Vestido lindo e fresquinho! Perfeito pro verão.' },
      { productSlug: 'conjunto-festa-menina', authorName: 'Carolina L.', rating: 5, comment: 'Conjunto maravilhoso! Minha filha foi a mais bonita da festa.' },
      { productSlug: 'conjunto-festa-menina', authorName: 'Vanessa P.', rating: 5, comment: 'Detalhes incríveis, qualidade premium!' },
    ]

    for (const r of reviews) {
      const product = await db.product.findUnique({ where: { slug: r.productSlug } })
      if (!product) continue
      const { productSlug, ...data } = r
      await db.review.create({ data: { ...data, productId: product.id } })
    }

    const coupons = [
      { code: 'BEMVINDO20', description: '20% de desconto na primeira compra', discountPercent: 20, active: true, maxUses: 10000 },
      { code: 'PRIMAVERA10', description: '10% de desconto em todo o site', discountPercent: 10, active: true, maxUses: 5000 },
    ]

    for (const c of coupons) {
      await db.coupon.upsert({ where: { code: c.code }, update: {}, create: c })
    }

    console.log('[DB] Seed complete!')
  } catch (err) {
    console.error('[DB] Auto-seed failed:', err)
    // Don't throw - let the app start anyway
  }
}

export async function register() {
  // Next.js instrumentation runs on server startup
  // In development, this runs on every HMR reload
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Use setImmediate to not block the server start
    setImmediate(() => ensureDatabase())
  }
}
