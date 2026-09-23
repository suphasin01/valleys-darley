import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex min-h-[calc(100svh-58px)] flex-col bg-[#f3e4e8] text-[#211815] md:min-h-[calc(100vh-72px)]">
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[9px] uppercase tracking-[0.22em]">Begin here</p>
        <h1 className="brand-script mt-5 text-6xl leading-[0.72] md:text-9xl">Find your<br /><span className="font-serif not-italic text-2xl tracking-[0.18em] md:text-4xl">DARLING.</span></h1>
        <p className="mt-10 max-w-md text-xs leading-6 text-black/55">Tell us about the piece you are looking for, your size, material, and the story you want it to carry.</p>
        <a href="https://www.instagram.com/valleydarley" target="_blank" rel="noreferrer" className="mt-8 bg-black px-9 py-4 text-[10px] tracking-[0.18em] text-white">GET IN TOUCH</a>
        <Link href="/custom-made" className="mt-5 text-[9px] tracking-[0.15em] underline underline-offset-4">EXPLORE CUSTOM MADE</Link>
      </section>
    </div>
  );
}
