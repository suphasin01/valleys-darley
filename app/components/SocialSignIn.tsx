import { providerReady } from '../lib/auth';
import { PrivacyCheckbox } from './PrivacyCheckbox';

export function SocialSignIn({ next, th }: { next: string; th: boolean }) {
  return <form action="/api/auth/consent" method="post" className="space-y-3"><input type="hidden" name="next" value={next}/><PrivacyCheckbox th={th}/>{(['google', 'line'] as const).map(provider => {
    const enabled = providerReady(provider);
    const label = `${th ? 'ดำเนินการต่อด้วย' : 'Continue with'} ${provider === 'google' ? 'Google' : 'LINE'}`;
    const style = `flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9c7674] ${provider === 'google' ? 'border-[#dadce0] bg-white text-[#3c4043] hover:bg-[#f8f9fa]' : 'border-[#06c755] bg-[#06c755] text-white hover:bg-[#05b34c]'} ${enabled ? '' : 'opacity-45'}`;
    const content = <><span aria-hidden="true" className="shrink-0">{provider === 'google' ? <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.8 6-15.1Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4.1 1.9-6.8 1.9-5.3 0-9.8-3.6-11.4-8.4H5.7v5.4A20.4 20.4 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.4a12.3 12.3 0 0 1 0-7.8v-5.4H5.7a20 20 0 0 0 0 18.6l6.9-5.4Z"/><path fill="#EA4335" d="M24 11.2c3 0 5.7 1 7.8 3.1l5.9-5.9A19.6 19.6 0 0 0 24 3 20.4 20.4 0 0 0 5.7 14.2l6.9 5.4c1.6-4.8 6.1-8.4 11.4-8.4Z"/></svg> : <svg width="24" height="24" viewBox="0 0 32 32"><path fill="white" d="M29 14c0-6-6-11-13-11S3 8 3 14c0 5.4 4.8 9.9 11.4 10.8.4.1.8.3.9.7.1.3.1.8 0 1.1l-.3 1.7c-.1.5-.4 2 1.7 1.1 2.1-.9 9.2-5.3 11.2-9.1A10.3 10.3 0 0 0 29 14Z"/><text x="16" y="17" textAnchor="middle" fill="#06c755" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="8">LINE</text></svg>}</span><span>{label}</span></>;
    return <button type="submit" key={provider} name="provider" value={provider} disabled={!enabled} className={style}>{content}</button>;
  })}</form>;
}

export function AuthDivider({ th }: { th: boolean }) {
  return <div className="my-6 flex items-center gap-4 text-xs text-black/45"><span className="h-px flex-1 bg-black/10"/><span>{th ? 'หรือ' : 'or'}</span><span className="h-px flex-1 bg-black/10"/></div>;
}
