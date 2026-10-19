/** Old CMS content and QR links may still point at the retired camera route. */
export function productAction(link: string) {
  const legacyCamera = /^\/ar(?:[/?#]|$)/.test(link);
  const href = legacyCamera ? '/custom-made' : link;
  return { href, chooseDesign: legacyCamera || /^\/custom-made(?:[/?#]|$)/.test(href) };
}
