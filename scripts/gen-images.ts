import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT = path.resolve(process.cwd(), 'public/images');

type Job = { name: string; prompt: string; size: string; sub?: string };

const jobs: Job[] = [
  {
    name: 'hero-kids.png',
    size: '1344x768',
    prompt:
      'Three joyful children (a toddler girl, a young boy, a baby) wearing colorful playful clothing — sunny yellow t-shirt, orange overalls, soft pink dress — laughing and jumping, bright studio lighting, clean creamy off-white background, lifestyle children fashion photography, vibrant cheerful mood, high quality, professional',
  },
  {
    name: 'kid-girl.png',
    size: '768x1344',
    prompt:
      'A happy young girl around 4 years old wearing a soft pink floral dress, smiling, standing pose, full body, isolated on clean light pink studio background, professional children fashion photography, bright cheerful lighting, high quality',
  },
  {
    name: 'kid-boy.png',
    size: '768x1344',
    prompt:
      'A cheerful young boy around 5 years old wearing a sunny yellow t-shirt and blue denim shorts, smiling, standing pose, full body, isolated on clean light yellow studio background, professional children fashion photography, bright cheerful lighting, high quality',
  },
  {
    name: 'kid-baby.png',
    size: '768x1344',
    prompt:
      'A happy baby around 1 year old wearing a soft mint green romper, smiling, sitting pose, isolated on clean light mint green studio background, professional baby fashion photography, bright cheerful lighting, high quality',
  },
  {
    name: 'why-choose.png',
    size: '864x1152',
    prompt:
      'A smiling mother hugging her happy young daughter who wears a colorful yellow dress, warm lifestyle photography, sunny yellow gradient background, joyful tender mood, professional, high quality',
  },
  // Products (square 1024)
  {
    name: 'products/camiseta-estampada.png',
    size: '1024x1024',
    prompt:
      'Children folded yellow cotton t-shirt with a cute smiling sun printed on chest, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/vestido-floral.png',
    size: '1024x1024',
    prompt:
      'A pretty children floral dress in pink and orange flowers, on a small mannequin, flat lay style product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/conjunto-verao.png',
    size: '1024x1024',
    prompt:
      'A children summer outfit set: orange tank top and blue shorts folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/shorts-colorido.png',
    size: '1024x1024',
    prompt:
      'A pair of colorful children shorts in purple with yellow stripes, folded, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/jaqueta-jeans.png',
    size: '1024x1024',
    prompt:
      'A small children denim jacket, light blue, folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/conjunto-moletom.png',
    size: '1024x1024',
    prompt:
      'A cozy children sweatshirt and pants set in mint green, folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/vestido-arcoiris.png',
    size: '1024x1024',
    prompt:
      'A cheerful children rainbow striped t-shirt dress, on small mannequin, flat lay style product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/pijama-animais.png',
    size: '1024x1024',
    prompt:
      'A cute children pajama set with little animal prints in soft yellow, folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/camiseta-dino.png',
    size: '1024x1024',
    prompt:
      'A children green cotton t-shirt with a cute dinosaur printed on chest, folded, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/calca-leg.png',
    size: '1024x1024',
    prompt:
      'A pair of children purple leggings with small stars pattern, folded, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/bone-colorido.png',
    size: '1024x1024',
    prompt:
      'A colorful children bucket hat in orange and yellow, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
  {
    name: 'products/sapato-canvas.png',
    size: '1024x1024',
    prompt:
      'A pair of small children canvas shoes in sky blue with white soles, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality',
  },
];

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const zai = await ZAI.create();
  let ok = 0;
  let fail = 0;
  for (const job of jobs) {
    const outPath = path.join(OUT, job.name);
    if (fs.existsSync(outPath)) {
      console.log(`[skip] ${job.name} already exists`);
      ok++;
      continue;
    }
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    try {
      console.log(`[gen] ${job.name} (${job.size}) ...`);
      const res = await zai.images.generations.create({
        prompt: job.prompt,
        size: job.size as any,
      });
      const b64 = res.data[0].base64;
      fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
      console.log(`[ok]   ${job.name}`);
      ok++;
    } catch (e: any) {
      console.error(`[fail] ${job.name}: ${e?.message || e}`);
      fail++;
    }
  }
  console.log(`Done. ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
