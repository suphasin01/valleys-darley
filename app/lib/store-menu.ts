export const shopMenuLinks = [
  ['SHOP ALL', '/collections'],
  ['NEW IN', '/collections#new-in'],
  ['NECKLACE', '/collections'],
  ['RING', '/collections'],
  ['EARRINGS', '/collections'],
  ['BRACELET', '/collections'],
] as const;
export type MenuSection = 'shop' | 'collection' | null;
export function toggleMenuSection(current: MenuSection, requested: Exclude<MenuSection, null>): MenuSection {
  return current === requested ? null : requested;
}
