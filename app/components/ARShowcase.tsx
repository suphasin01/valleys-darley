"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const Sparkle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 1c.7 9.5 5.5 14.3 15 15-9.5.7-14.3 5.5-15 15C15.3 21.5 10.5 16.7 1 16 10.5 15.3 15.3 10.5 16 1Z" fill="currentColor" />
  </svg>
);

export function ARShowcase() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const arUrl = useMemo(
    () => `${origin || "https://valleys-darley.vercel.app"}/ar?product=1`,
    [origin],
  );

  return (
    <section id="ar-try-on" className="relative overflow-hidden bg-[#e8e8e6] text-[#171717]">
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_70%_40%,white_0,transparent_42%)]" />
      <div className="absolute left-[8%] top-20 h-28 w-28 rounded-full border border-black/10 md:h-56 md:w-56" />
      <div className="absolute -right-12 bottom-4 h-48 w-48 rounded-full bg-white/70 blur-3xl" />

      <div className="container relative grid min-h-[760px] items-center gap-12 py-20 lg:grid-cols-[1fr_1.05fr] lg:py-28">
        <div className="relative z-10 max-w-xl">
          <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-black/55">
            <span className="h-px w-10 bg-black/40" />
            Valley&apos;s Darley digital atelier
          </div>
          <h2 className="text-[clamp(3.4rem,8vw,7.8rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
            Try it.
            <span className="block font-serif font-normal italic text-black/55">Feel it.</span>
          </h2>
          <p className="mt-9 max-w-md text-base font-light leading-7 text-black/60 md:text-lg">
            ลองสวมเครื่องประดับผ่านกล้องมือถือ ระบบจะค้นหามือและวางชิ้นงานบนนิ้วแบบเรียลไทม์—ไม่ต้องดาวน์โหลดแอป
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/ar?product=1"
              className="inline-flex min-h-14 items-center gap-3 rounded-full bg-black px-7 text-sm font-medium text-white transition hover:scale-[1.02] hover:bg-black/80"
            >
              เปิด AR Try-On
              <span aria-hidden="true">↗</span>
            </Link>
            <span className="text-xs leading-5 text-black/45">
              รองรับ Safari และ Chrome<br />บนมือถือรุ่นใหม่
            </span>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[640px] items-center justify-center lg:min-h-[570px]">
          <div className="absolute inset-8 rounded-full border border-black/10" />
          <div className="absolute inset-[18%] rounded-full border border-dashed border-black/15 animate-[spin_28s_linear_infinite]" />

          <div className="relative h-[380px] w-[310px] sm:h-[510px] sm:w-[420px]">
            <div className="absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[48%] border-[22px] border-[#c7c8ca] shadow-[inset_10px_8px_20px_rgba(255,255,255,.95),inset_-12px_-10px_24px_rgba(0,0,0,.22),0_35px_55px_rgba(0,0,0,.18)] sm:h-56 sm:w-[350px] sm:border-[30px]" />
            <div className="absolute left-[47%] top-[22%] h-24 w-24 rotate-[32deg] bg-[linear-gradient(145deg,#fff_5%,#9b9da0_38%,#f6f6f6_63%,#777_100%)] shadow-[0_22px_35px_rgba(0,0,0,.25)] [clip-path:polygon(50%_0%,90%_20%,100%_65%,50%_100%,0_65%,10%_20%)] sm:h-32 sm:w-32">
              <div className="absolute inset-[17%] bg-[linear-gradient(145deg,#eefcff,#87949f_45%,#fcffff_70%)] opacity-90 [clip-path:polygon(50%_0%,100%_36%,82%_100%,18%_100%,0_36%)]" />
            </div>
            <Sparkle className="absolute right-[5%] top-[19%] h-12 w-12 text-white drop-shadow-lg sm:h-16 sm:w-16" />
            <Sparkle className="absolute bottom-[20%] left-[7%] h-7 w-7 text-white/80" />
          </div>

          <div className="absolute bottom-0 right-0 hidden items-center gap-4 rounded-2xl border border-white/80 bg-white/75 p-3 pr-5 shadow-2xl backdrop-blur-xl sm:flex">
            <div className="rounded-xl bg-white p-2">
              <QRCodeSVG value={arUrl} size={84} level="M" marginSize={1} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]">Scan to try</p>
              <p className="mt-1 max-w-[112px] text-[11px] leading-4 text-black/50">สแกนด้วยกล้องมือถือเพื่อเปิด AR</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
