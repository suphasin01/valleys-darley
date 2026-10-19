import type { ReactNode } from 'react';

/** Privacy Preview 155:6: centered editorial copy, with no coloured card. */
export function LegalDocument({ title, children }: { title: string; children: ReactNode }) {
  return <main className="editorial-page legal-document mx-auto max-w-[1440px] bg-white px-6 pb-28 pt-14 text-center text-black md:px-[7.1%] md:pb-44 md:pt-[84px]">
    <h1 className="mb-14 text-[32px] font-bold uppercase leading-tight md:mb-20 md:text-[44px]">{title}</h1>
    <article className="mx-auto max-w-[1120px] space-y-9 text-sm leading-[1.9] md:space-y-10 md:text-base">{children}</article>
  </main>;
}
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2 className="font-semibold uppercase underline underline-offset-2">{title}</h2><div className="underline decoration-black/60 underline-offset-2">{children}</div></section>;
}
