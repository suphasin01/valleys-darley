"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FigmaImage } from "./FigmaImage";
import { CustomLocketGallery } from './CustomLocketGallery';
import { ProductGuide } from './ProductGuide';
import { heartGemstones } from '../lib/heart-artwork';
import { swirlGemstones } from '../lib/swirl-artwork';
import { SwirlBowGallery } from './SwirlBowGallery';
import { SavedDesignDialog } from './SavedDesignDialog';
import { heartArtwork } from '../lib/heart-artwork';
import { swirlArtwork } from '../lib/swirl-artwork';
import { customChainLengths, restoredChainLength } from '../lib/custom-chain-lengths';

type Choices = { plating: string; gemstone: string; finish: string; star: string; engraving: string; font: string; size: string; note: string };
const initial: Choices = { plating: "18K gold plated", gemstone: "Aquamarine", finish: "High polish", star: "Sapphire", engraving: "", font: "La Graziela", size: "", note: "" };
const baseOptions = {
  plating: ["18K gold plated", "Rhodium"], gemstone: ["Aquamarine", "Pink Tourmaline", "Green Amethyst"],
  finish: ["High polish", "Matte"], star: ["Sapphire", "Yellow sapphire"], font: ["La Graziela"],
};

export function CustomDesignForm({ id, design }: { id: string; design: { name: string; left: string; top: string } }) {
  const isSwirl = id === 'swirl-bow';
  const hasPreviewSizes = isSwirl || id === 'heart-locket';
  const options = { ...baseOptions, gemstone: id === 'heart-locket' ? [...heartGemstones] : isSwirl ? [...swirlGemstones] : baseOptions.gemstone };
  const selectionFields = isSwirl ? [['plating', 'Plating'], ['gemstone', 'Gemstone'], ['finish', 'Finish']] as const : [['plating', 'Plating'], ['gemstone', 'Gemstone'], ['finish', 'Finish'], ['star', 'Star gemstone']] as const;
  const [choices, setChoices] = useState<Choices>(initial);
  const [status, setStatus] = useState("");
  const [restored, setRestored] = useState(false);
  const savedDialog = useRef<HTMLDialogElement>(null);
  function set(field: keyof Choices, value: string) { setChoices(previous => ({ ...previous, [field]: value })); setStatus(""); }
  function save() {
    try { localStorage.setItem(`valleys-custom-${id}`, JSON.stringify(choices)); setStatus("Your design has been saved on this device."); savedDialog.current?.showModal(); }
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
        next[key] = key === 'size' && hasPreviewSizes ? restoredChainLength(value) : value.slice(0, key === "note" ? 300 : key === "engraving" ? 40 : 60);
      }
      setChoices(next); setRestored(true); setStatus("Saved design restored.");
    } catch { setStatus("The saved design could not be read."); }
  }
  const specifications = [['Product', design.name], ['Plating', choices.plating], [isSwirl ? 'Gemstone' : 'Centre stone', choices.gemstone], ['Finish', choices.finish], ...(!isSwirl ? [['Star stones', choices.star], ['Engraving', choices.engraving || 'None'], ['Font', choices.font]] : []), [hasPreviewSizes ? 'Chain length' : 'Size', choices.size || 'Not chosen yet']];
  const summary = [...specifications.map(([label, value]) => `${label}: ${value}`), choices.note ? `Note: ${choices.note}` : ''].filter(Boolean).join('\n');
  const heart = id === 'heart-locket' ? heartArtwork(choices) : null;
  const swirl = isSwirl ? swirlArtwork(choices) : null;
  const savedArtwork = heart ? { front: heart.front, reverse: heart.inside, reverseLabel: 'Inside the lid' } : swirl ? { front: swirl.front, reverse: swirl.underneath, reverseLabel: 'Underneath' } : null;
  return <section className="mx-auto mt-10 max-w-[1263px]">
    {id === 'heart-locket' ? <CustomLocketGallery plating={choices.plating} gemstone={choices.gemstone} finish={choices.finish} star={choices.star} engraving={choices.engraving} /> : isSwirl ? <SwirlBowGallery plating={choices.plating} gemstone={choices.gemstone} finish={choices.finish} /> : <>
    <FigmaImage src="/images/figma/preview-0.webp" alt={design.name} className="mx-auto aspect-[384/379] w-[min(80%,420px)]" crop={{ left: design.left, top: design.top, width: "419.08%", height: "238.69%" }} />
    <p className="mt-8 text-center text-xs uppercase">Custom-made jewelry, crafted around your imagination.</p>
    <p className="mt-3 text-center text-xs text-black/50">Design reference shown. Selected specifications are listed below.</p></>}
    <div className={`mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 ${isSwirl ? 'mx-auto max-w-[960px] lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
      {selectionFields.map(([field, label]) => <label key={field} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 text-xs uppercase"><span className="whitespace-nowrap bg-[#f1e9eb] px-3 py-2">{label}</span><select value={choices[field]} onChange={e => set(field, e.target.value)} className="min-h-11 w-full border-b border-black/25 bg-white px-2 text-xs">{options[field].map(value => <option key={value}>{value}</option>)}</select></label>)}
    </div>
    {!isSwirl && <div className="mt-12 grid items-end gap-6 sm:grid-cols-[auto_1fr_2fr]">
      <span className="w-fit bg-[#f1e9eb] px-3 py-2 text-sm uppercase">Engraving</span>
      <label className="text-xs">Font<select value={choices.font} onChange={e => set('font', e.target.value)} className="mt-2 min-h-11 w-full border-b border-black/25 bg-white">{options.font.map(font => <option key={font}>{font}</option>)}</select></label>
      <label className="text-xs">Up to 40 characters<input value={choices.engraving} onChange={e => set('engraving', e.target.value)} maxLength={40} placeholder="Your engraving" className="mt-2 min-h-11 w-full border-b border-black/25 px-2" /></label>
    </div>}
    <div className="mt-12 flex flex-col items-end gap-2">
      {hasPreviewSizes ? <label className="grid w-[230px] max-w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 text-xs uppercase"><span className="bg-[#f1e9eb] px-5 py-2">Size</span><select aria-label="Chain length" value={choices.size} onChange={event => set('size', event.target.value)} className="min-h-11 min-w-0 border-b border-black/25 bg-white px-2 text-xs">
        <option value="">Not chosen yet</option>
        {customChainLengths.map(length => <option key={length} value={length}>{length}</option>)}
        {choices.size && !(customChainLengths as readonly string[]).includes(choices.size) && <option value={choices.size}>Previously saved: {choices.size}</option>}
      </select></label> : <label className="text-sm">Size<input value={choices.size} onChange={e => set('size', e.target.value)} maxLength={60} placeholder="Chain length" className="ml-3 min-h-11 w-40 border-b border-black/25 px-2" /></label>}
      <div className="flex flex-wrap justify-end gap-3"><ProductGuide kind="necklace" label="Size guide" /><span className="self-center text-xs uppercase">and</span><ProductGuide kind="care" label="Care instruction" /></div>
    </div>
    <section className="mx-auto mt-12 max-w-[1000px]"><h3 className="text-sm uppercase">Details describe</h3><dl className="mt-8 text-xs uppercase sm:text-sm">{[...specifications, ['Production', 'Made to order. Timing and price confirmed by our team.']].map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(90px,1fr)_3fr] gap-4 border-b border-black/10 py-2"><dt className="text-black/50">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl></section>
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
    <SavedDesignDialog ref={savedDialog} name={design.name} specifications={[...specifications, ['Production', 'Made to order. Timing and price confirmed by our team.']]} note={choices.note} artwork={savedArtwork} />
  </section>;
}
