import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomMadeTitle } from "../../components/CustomMadeTitle";
import { CustomDesignForm } from "../../components/CustomDesignForm";

const designs: Record<string, { name: string; left: string; top: string }> = {
  "heart-locket": { name: "The Ruffle Heart Locket Necklace", left: "-64.69%", top: "-112.81%" },
  "swirl-bow": { name: "The Swirl Bow Locket Necklace", left: "-122.35%", top: "-19.43%" },
  "gemstone-locket": { name: "The Gemstone Locket Necklace", left: "-194.85%", top: "-104.46%" },
};

export default async function CustomDesignPage({ params }: { params: Promise<{ design: string }> }) {
  const { design } = await params;
  const selected = designs[design];
  if (!selected) notFound();
  return <main className="editorial-page mx-auto max-w-[1440px] bg-white px-5 pb-20 pt-5 text-black md:px-[7%]">
    <Link href="/custom-made" className="text-xs underline underline-offset-4">‹ Back to custom made</Link>
    <div className="mt-8"><CustomMadeTitle /></div>
    <h2 className="brand-script mt-10 text-center text-[clamp(36px,5.5vw,80px)] leading-tight">{selected.name}</h2>
    <CustomDesignForm id={design} design={selected} />
  </main>;
}
