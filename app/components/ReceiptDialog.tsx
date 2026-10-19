'use client';
import { useRef } from 'react';
import { BrandLogo } from './Header';

export type ReceiptData = {
  number: string; date: string; customer: string; address: string; currency: string;
  items: { name: string; description?: string; quantity: number; total: number }[];
  subtotal: number; shipping: number; discount: number; tax: number; total: number;
};
export function ReceiptDialog({ receipt }: { receipt: ReceiptData }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: receipt.currency }).format(amount / 100);
  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} className="min-h-11 w-full rounded-md bg-[#f1e9eb] px-8 py-3 text-sm uppercase">Receipt</button>
    <dialog ref={dialog} aria-labelledby="receipt-title" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }} className="receipt-print m-auto max-h-[90svh] w-[min(92vw,560px)] overflow-y-auto rounded-sm border-0 bg-white p-6 text-black shadow-xl backdrop:bg-black/25 sm:p-10 md:w-[38.8889vw] md:max-w-[560px]">
      <div className="relative"><form method="dialog" className="absolute -right-2 -top-3 print:hidden"><button aria-label="Close receipt" className="grid h-10 w-10 place-items-center text-2xl">×</button></form><div className="text-center"><BrandLogo className="text-[23px]" /></div>
        <h2 id="receipt-title" className="mt-10 text-lg uppercase">Receipt</h2><dl className="mt-5 space-y-3 text-xs"><div className="flex justify-between gap-5"><dt className="text-black/50">Order number</dt><dd className="break-all text-right">{receipt.number}</dd></div><div className="flex justify-between gap-5"><dt className="text-black/50">Order date</dt><dd>{receipt.date}</dd></div><div className="flex justify-between gap-5"><dt className="text-black/50">Payment</dt><dd>Paid via Stripe</dd></div></dl>
        <ul className="my-6 space-y-5 border-y border-black/15 py-6 text-xs">{receipt.items.map((item, index) => <li key={index}><div className="flex justify-between gap-4"><p className="uppercase">{item.name} × {item.quantity}</p><p className="shrink-0">{money(item.total)}</p></div>{item.description && <p className="mt-2 whitespace-pre-line text-black/50">{item.description}</p>}</li>)}</ul>
        <dl className="space-y-3 text-xs"><div className="flex justify-between"><dt>Subtotal</dt><dd>{money(receipt.subtotal)}</dd></div>{receipt.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{money(receipt.discount)}</dd></div>}<div className="flex justify-between"><dt>Shipping</dt><dd>{money(receipt.shipping)}</dd></div><div className="flex justify-between"><dt>Tax</dt><dd>{money(receipt.tax)}</dd></div><div className="flex justify-between border-t border-black/15 pt-5 text-base"><dt>Total</dt><dd>{money(receipt.total)}</dd></div></dl>
        <p className="mt-8 text-xs leading-6 text-black/55">Shipping to: {receipt.customer}<br />{receipt.address || 'Delivery address not available.'}</p><p className="mt-4 text-[10px] text-black/45">Payment receipt · Not a tax invoice.</p>
        <button type="button" onClick={() => window.print()} className="mt-8 min-h-11 w-full rounded-md bg-[#f1e9eb] py-3 text-sm uppercase print:hidden">Save as PDF / Print</button>
      </div>
    </dialog>
  </>;
}
