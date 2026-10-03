import { privacyVersion } from '../lib/privacy';
export function PrivacyCheckbox({ th }: { th: boolean }) {
  return <div className="mt-4"><input type="hidden" name="privacyVersion" value={privacyVersion}/><label className="flex cursor-pointer items-start gap-2 text-[11px] leading-5 text-black/60"><input type="checkbox" name="privacyAcknowledged" value="yes" required className="mt-1 h-3.5 w-3.5 shrink-0 accent-[#2c2221]"/><span>{th ? 'ฉันได้อ่านและรับทราบ' : 'I have read and acknowledge the '}<a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{th ? 'นโยบายความเป็นส่วนตัว (PDPA)' : 'Privacy Policy (PDPA)'}</a></span></label></div>;
}
