"use client";

import Link from "next/link";
import { useState } from "react";
import { FigmaImage } from "./FigmaImage";

type Choices = { plating: string; gemstone: string; finish: string; star: string; engraving: string; font: string; size: string; note: string };
const initial: Choices = { plating: "18K gold plated", gemstone: "Aquamarine", finish: "High polish", star: "Sapphire", engraving: "", font: "La Graziela", size: "", note: "" };
const options = {
  plating: ["18K gold plated", "Rhodium"], gemstone: ["Aquamarine", "Pink Tourmaline", "Green Amethyst"],
  finish: ["High polish", "Matte"], star: ["Sapphire", "Yellow sapphire"], font: ["La Graziela"],
};

export function CustomDesignForm({ id, design }: { id: string; design: { name: string; left: string; top: string } }) {
  const [choices, setChoices] = useState<Choices>(initial);
  const [status, setStatus] = useState("");
  const [restored, setRestored] = useState(false);
  function set(field: keyof Choices, value: string) { setChoices(previous => ({ ...previous, [field]: value })); setStatus(""); }
  function save() {
    try { localStorage.setItem(`valleys-custom-${id}`, JSON.stringify(choices)); setStatus("Your design has been saved on this device."); }
    catch { setStatus("Unable to save on this device. Please allow site storage."); }
  }
  function restore() {
    try {
      const raw = JSON.parse(localStorage.getItem(`valleys-custom-${id}`) || "null");
      if (!raw || typeof raw !== "object") { setStatus("No saved design on this device yet."); return; }
      const next = { ...initial };
      for (const key of Object.keys(initial) as (keyof Choices)[]) {
        const value = raw[key];
        if (typeof value !== "string") continue;
        if (key in options && !(options[key as keyof typeof options] as readonly string[]).includes(value)) continue;
        next[key] = value.slice(0, key === "note" ? 300 : key === "engraving" ? 30 : 60);
      }
      setChoices(next); setRestored(true); setStatus("Saved design restored.");
    } catch { setStatus("The saved design could not be read."); }
  }
  const summary = [design.name, `Plating: ${choices.plating}`, `Gemstone: ${choices.gemstone}`, `Finish: ${choices.finish}`, `Star gemstone: ${choices.star}`, `Engraving: ${choices.engraving || "None"}`, `Font: ${choices.font}`, `Size: ${choices.size || "Please advise"}`, choices.note ? `Note: ${choices.note}` : ""].filter(Boolean).join("\n");
  return <section className="mx-auto mt-10 max-w-[1100px]">
    <FigmaImage src="/images/figma/preview-0.webp" alt={design.name} className="mx-auto aspect-[384/379] w-[min(80%,420px)]" crop={{ left: design.left, top: design.top, width: "419.08%", height: "238.69%" }} />
    <p className="mt-8 text-center text-xs uppercase">Custom-made jewelry, crafted around your imagination.</p>
    <p className="mt-3 text-center text-xs text-black/50">Design reference shown. Selected specifications are listed below.</p>
    <div className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
      {([['plating', 'Plating'], ['gemstone', 'Gemstone'], ['finish', 'Finish'], ['star', 'Star gemstone']] as const).map(([field, label]) => <label key={field} className="block text-sm uppercase"><span className="bg-[#f1e9eb] px-3 py-2">{label}</span><select value={choices[field]} onChange={e => set(field, e.target.value)} className="mt-3 min-h-11 w-full border-b border-black/25 bg-white px-2 text-sm">{options[field].map(value => <option key={value}>{value}</option>)}</select></label>)}
    </div>
    <div className="mt-12 grid items-end gap-6 sm:grid-cols-[auto_1fr_2fr]">
      <span className="w-fit bg-[#f1e9eb] px-3 py-2 text-sm uppercase">Engraving</span>
      <label className="text-xs">Font<select value={choices.font} onChange={e => set('font', e.target.value)} className="mt-2 min-h-11 w-full border-b border-black/25 bg-white">{options.font.map(font => <option key={font}>{font}</option>)}</select></label>
      <label className="text-xs">Up to 30 characters<input value={choices.engraving} onChange={e => set('engraving', e.target.value)} maxLength={30} placeholder="Your engraving" className="mt-2 min-h-11 w-full border-b border-black/25 px-2" /></label>
    </div>
    <div className="mt-8 flex flex-wrap items-center justify-end gap-5">
      <label className="text-sm">Size<input value={choices.size} onChange={e => set('size', e.target.value)} maxLength={60} placeholder="Chain length" className="ml-3 min-h-11 w-40 border-b border-black/25 px-2" /></label>
      <Link href="/help#size-guide" className="text-xs underline">Size guide</Link><Link href="/help#care" className="text-xs underline">Care instruction</Link>
    </div>
    <section className="mt-12"><h3 className="text-sm uppercase">Details describe</h3><dl className="mt-4 text-sm">{summary.split('\n').map((line, index) => <div key={index} className="border-b border-black/10 py-2"><dd>{line}</dd></div>)}<div className="border-b border-black/10 py-2"><dt className="inline">Production: </dt><dd className="inline">Made to order. Timing and price confirmed by our team.</dd></div></dl></section>
    <label className="mt-6 block text-sm">Note<textarea maxLength={300} value={choices.note} onChange={e => set('note', e.target.value)} placeholder="Anything else you would like us to know?" className="mt-2 min-h-24 w-full border border-black/20 p-3" /></label>
    <div className="mt-6 flex flex-wrap justify-end gap-3 text-sm"><button onClick={restore} type="button" className="min-h-11 border border-black/20 px-5">{restored ? "Restore again" : "Restore saved design"}</button><button onClick={() => {
      try { localStorage.removeItem(`valleys-custom-${id}`); sessionStorage.removeItem(`valleys-quote-${id}`); setRestored(false); setStatus("Saved design cleared from this device."); }
      catch { setStatus("Unable to clear the saved design. Please check your browser storage settings."); }
    }} type="button" className="min-h-11 px-3 underline">Clear saved design</button><button onClick={save} type="button" className="min-h-11 bg-[#f1e9eb] px-7">Save design</button><Link href={`/contact?custom=${id}`} onClick={event => {
      try { sessionStorage.setItem(`valleys-quote-${id}`, summary); }
      catch { event.preventDefault(); setStatus("Unable to prepare your quote. Please copy your specifications and contact us."); }
    }} className="flex min-h-11 items-center bg-black px-8 text-white">Request a custom quote</Link></div>
    <p role="status" className="mt-4 text-sm">{status}</p>
    <p className="mt-3 text-right text-xs text-black/60">No payment is taken until your custom specifications and price are confirmed.</p>
  </section>;
}
