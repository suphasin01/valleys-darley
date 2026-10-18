"use client";
import { useEffect, useState } from "react";

export function CustomQuoteSummary({ design }: { design: string }) {
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    try { setSummary((sessionStorage.getItem(`valleys-quote-${design}`) || "").slice(0, 1500)); }
    catch { setMessage("Please return to your design to view its specifications."); }
  }, [design]);
  return <section className="mx-auto mt-8 w-full max-w-xl border border-black/20 bg-white/60 p-5 text-left">
    <h2 className="text-lg">Your custom design</h2>
    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{summary || "Choose a design and its specifications before requesting a quote."}</p>
    <button disabled={!summary} type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(summary); setMessage("Copied. Paste these details when you contact our team."); }
      catch { setMessage("Please select and copy the details above."); }
    }} className="mt-5 min-h-11 border border-black/30 px-5 text-sm">Copy design details</button>
    <p role="status" className="mt-2 text-xs">{message}</p>
  </section>;
}
