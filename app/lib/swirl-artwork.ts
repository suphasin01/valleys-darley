export const swirlGemstones = ['Aquamarine', 'Green Amethyst'] as const;
export function swirlArtwork({ plating, gemstone, finish }: { plating: string; gemstone: string; finish: string }) {
  if (!['18K gold plated', 'Rhodium'].includes(plating) || !(swirlGemstones as readonly string[]).includes(gemstone) || !['High polish', 'Matte'].includes(finish)) return null;
  const metal = plating === 'Rhodium' ? 'rhodium' : 'gold';
  const slug = (value: string) => value.toLowerCase().replaceAll(' ', '-');
  const prefix = `/images/figma/swirl-${metal}-${slug(gemstone)}-${slug(finish)}`;
  return { front: `${prefix}-front.webp`, underneath: `${prefix}-underneath.webp`, description: `${plating} ${gemstone} ${finish.toLowerCase()} Swirl Bow necklace` };
}
