/** Lightweight route fallback: no timers, fake percentages, or extra network requests. */
export function BrandLoading({ preview = false }: { preview?: boolean }) {
  return <section role="status" aria-live="polite" aria-label="Loading Valley's Darling" className={`${preview ? 'min-h-[100svh]' : 'fixed inset-0 z-[100] min-h-[100svh]'} editorial-page flex flex-col items-center justify-center bg-[#f1e9eb] px-6 text-[#272425]`}>
    <img src="/images/figma/brand-hd.png" width={1291} height={259} alt="Valley's Darling" className="h-auto w-[min(72vw,580px)] mix-blend-multiply" />
    <div aria-hidden="true" className="brand-loading-track mt-12 h-px w-32 overflow-hidden bg-black/15"><span className="brand-loading-line block h-full w-1/2 bg-black/70" /></div>
    <p className="mt-6 text-xs tracking-[.24em]">A LITTLE MOMENT…</p>
    <span className="sr-only">Loading. Your page will appear when ready.</span>
  </section>;
}
