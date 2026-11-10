export const shopMenuLinks = [
  ['SHOP ALL', '/shop'],
  ['NEW IN', '/shop/new-in'],
  ['NECKLACE', '/shop/necklace'],
  ['RING', '/shop/ring'],
  ['EARRINGS', '/shop/earrings'],
  ['BRACELET', '/shop/bracelet'],
] as const;
export type MenuSection = 'shop' | 'collection' | null;
export function toggleMenuSection(current: MenuSection, requested: Exclude<MenuSection, null>): MenuSection {
  return current === requested ? null : requested;
}
