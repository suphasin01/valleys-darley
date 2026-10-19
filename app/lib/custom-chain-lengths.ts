/** Visible Size menu in Figma Preview 449:966 and 652:132249. */
export const customChainLengths = ['37–42 cm', '40–45 cm', '45–50 cm'] as const;

/** Retain old free-text requests, but normalize known ranges to the Preview labels. */
export function restoredChainLength(value: unknown) {
  if (typeof value !== 'string') return '';
  const candidate = value.trim().slice(0, 60);
  const normalized = candidate.toLowerCase().replace(/\s/g, '').replace(/[–—]/g, '-');
  return customChainLengths.find(length => length.replace(/\s/g, '').replace('–', '-') === normalized) ?? candidate;
}
