'use client';

import { useState } from 'react';

type AddressProfile = { name: string; email: string; phone: string; address: string; subdistrict: string; district: string; province: string; postalCode: string };

export function AccountAddress({ profile }: { profile: AddressProfile }) {
  const [editing, setEditing] = useState(false);
  const input = 'mt-1 min-h-11 w-full min-w-0 border border-black/20 bg-white px-3 py-2 font-sans text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9c7674]';
  const fields = [
    ['name', 'Full name', 'name', 100],
    ['address', 'Address', 'address-line1', 250],
    ['subdistrict', 'Subdistrict', 'address-level3', 100],
    ['district', 'District', 'address-level2', 100],
    ['province', 'Province', 'address-level1', 100],
    ['postalCode', 'Postal code', 'postal-code', 5],
    ['phone', 'Phone', 'tel', 20],
  ] as const;

  return <section className="mt-12">
    <div className="flex justify-between gap-4"><h2 className="text-sm uppercase">Address</h2><button type="button" aria-expanded={editing} aria-controls="account-address-editor" onClick={() => setEditing(value => !value)} className="min-h-8 text-xs uppercase underline underline-offset-4">{editing ? 'Cancel' : 'Edit'}</button></div>
    {editing ? <form id="account-address-editor" action="/api/customer/profile" method="post" className="mt-3 space-y-3">
      <input type="hidden" name="next" value="/account" />
      <input type="hidden" name="email" value={profile.email} />
      {fields.map(([name, label, autoComplete, max]) => <label key={name} className="block text-xs uppercase">{label}<input className={input} name={name} autoComplete={autoComplete} defaultValue={profile[name]} maxLength={max} type={name === 'phone' ? 'tel' : 'text'} inputMode={name === 'postalCode' ? 'numeric' : undefined} pattern={name === 'postalCode' ? '[0-9]{5}' : undefined} required /></label>)}
      <label className="block text-xs uppercase">Country<select name="country" autoComplete="country" defaultValue="TH" className={input}><option value="TH">Thailand</option></select></label>
      <button type="submit" className="min-h-11 w-full bg-[#f1e9eb] px-5 py-2 text-sm uppercase hover:bg-[#e6d6dd]">Save</button>
    </form> : <address className="mt-4 not-italic text-sm leading-8"><p className="border-b border-black/30">{profile.name} · {profile.phone}</p><p className="border-b border-black/30">{profile.address}</p><p className="border-b border-black/30">{profile.subdistrict}, {profile.district}</p><p className="border-b border-black/30">{profile.province} {profile.postalCode}, Thailand</p></address>}
  </section>;
}
