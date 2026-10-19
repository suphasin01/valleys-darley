export const heartGemstones = ['Aquamarine', 'Pink Tourmaline'] as const;
type Selection = { plating: string; gemstone: string; finish: string; star: string };

/** Names match the 16 labelled Open=None variants in the native Figma export. */
export function heartArtwork({ plating, gemstone, finish, star }: Selection) {
  if (!['18K gold plated', 'Rhodium'].includes(plating) || !(heartGemstones as readonly string[]).includes(gemstone) || !['High polish', 'Matte'].includes(finish) || !['Sapphire', 'Yellow sapphire'].includes(star)) return null;
  const metal = plating === 'Rhodium' ? 'rhodium' : 'gold';
  const slug = (value: string) => value.toLowerCase().replaceAll(' ', '-');
  return {
    front: `/images/figma/heart-${metal}-${slug(gemstone)}-${slug(finish)}-${slug(star)}.webp`,
    inside: `/images/figma/heart-${metal}-${slug(finish)}-inside.webp`,
    engraving: `/images/figma/heart-${metal}-engraving.webp`,
    description: `${plating} ${gemstone} ${finish.toLowerCase()} locket with ${star} stars`,
    insideDescription: `${plating} ${finish.toLowerCase()} locket inside the lid`,
  };
}
