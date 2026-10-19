import { Header } from './Header';

/** Route fallback disappears as soon as the route is ready; the meter is indeterminate. */
export function BrandLoading({ preview = false, entrance = false, leaving = false }: { preview?: boolean; entrance?: boolean; leaving?: boolean }) {
  return <>
    {preview && <Header locale="en" />}
    <section role="status" aria-live="polite" aria-label="Loading Valley's Darling" className={`brand-loading editorial-page text-black${entrance || preview ? ' brand-loading-entrance' : ''}${leaving ? ' brand-loading-leaving' : ''}`}>
      <img src="/images/figma/loading-background.webp" alt="" aria-hidden="true" className="brand-loading-background" />
      <div className="brand-loading-content">
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet="/images/figma/loading-locket-still.webp" />
          <img src="/images/figma/loading-locket.gif" width={162} height={156} alt="" aria-hidden="true" className="brand-loading-jewel" />
        </picture>
        <p className="brand-loading-message">a little something is loading, darling</p>
        <div aria-hidden="true" className="brand-loading-track"><span className="brand-loading-line" /></div>
        <span className="sr-only">Your page will appear when ready.</span>
      </div>
    </section>
  </>;
}
