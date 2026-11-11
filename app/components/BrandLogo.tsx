/** Shared wordmark is presentation-only; receipts do not load navigation or its styles. */
export function BrandLogo({ className = '' }: { className?: string }) {
  return <span className={`brand-script supplied-brand inline-block whitespace-nowrap ${className}`}>Valley&apos;s Darling</span>;
}
