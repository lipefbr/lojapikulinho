#!/bin/bash
# Generate all images using z-ai CLI
set +e
cd /home/z/my-project

gen() {
  local name="$1"
  local size="$2"
  local prompt="$3"
  local out="public/images/$name"
  if [ -f "$out" ]; then
    echo "[skip] $name exists"
    return 0
  fi
  echo "[gen] $name ($size)..."
  if timeout 180 z-ai image -p "$prompt" -o "$out" -s "$size" >/dev/null 2>&1; then
    if [ -f "$out" ]; then
      echo "[ok]   $name ($(stat -c%s "$out") bytes)"
    else
      echo "[fail] $name (no file)"
    fi
  else
    echo "[fail] $name (exit $?)"
  fi
}

mkdir -p public/images/products

gen "hero-kids.png" "1344x768" "Three joyful children a toddler girl a young boy a baby wearing colorful playful clothing sunny yellow t-shirt orange overalls soft pink dress laughing and jumping, bright studio lighting, clean creamy off-white background, lifestyle children fashion photography, vibrant cheerful mood, high quality, professional"

gen "kid-girl.png" "768x1344" "A happy young girl around 4 years old wearing a soft pink floral dress, smiling, standing pose, full body, isolated on clean light pink studio background, professional children fashion photography, bright cheerful lighting, high quality"

gen "kid-boy.png" "768x1344" "A cheerful young boy around 5 years old wearing a sunny yellow t-shirt and blue denim shorts, smiling, standing pose, full body, isolated on clean light yellow studio background, professional children fashion photography, bright cheerful lighting, high quality"

gen "kid-baby.png" "768x1344" "A happy baby around 1 year old wearing a soft mint green romper, smiling, sitting pose, isolated on clean light mint green studio background, professional baby fashion photography, bright cheerful lighting, high quality"

gen "why-choose.png" "864x1152" "A smiling mother hugging her happy young daughter who wears a colorful yellow dress, warm lifestyle photography, sunny yellow gradient background, joyful tender mood, professional, high quality"

gen "products/camiseta-estampada.png" "1024x1024" "Children folded yellow cotton t-shirt with a cute smiling sun printed on chest, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/vestido-floral.png" "1024x1024" "A pretty children floral dress in pink and orange flowers, on a small mannequin, flat lay style product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/conjunto-verao.png" "1024x1024" "A children summer outfit set orange tank top and blue shorts folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/shorts-colorido.png" "1024x1024" "A pair of colorful children shorts in purple with yellow stripes, folded, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/jaqueta-jeans.png" "1024x1024" "A small children denim jacket light blue folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/conjunto-moletom.png" "1024x1024" "A cozy children sweatshirt and pants set in mint green folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/vestido-arcoiris.png" "1024x1024" "A cheerful children rainbow striped t-shirt dress, on small mannequin, flat lay style product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/pijama-animais.png" "1024x1024" "A cute children pajama set with little animal prints in soft yellow folded neatly, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/camiseta-dino.png" "1024x1024" "A children green cotton t-shirt with a cute dinosaur printed on chest folded, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/calca-leg.png" "1024x1024" "A pair of children purple leggings with small stars pattern folded, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/bone-colorido.png" "1024x1024" "A colorful children bucket hat in orange and yellow, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"
gen "products/sapato-canvas.png" "1024x1024" "A pair of small children canvas shoes in sky blue with white soles, flat lay product photo, clean cream background, soft shadows, e-commerce product photography, high quality"

echo "=== ALL DONE ==="
