import { cookies } from 'next/headers';
import { unseal } from './auth';
export const privacyVersion = '2026-10-03';
export const privacyCookie = 'vd_privacy_start';
export async function privacyStartAllowed(provider: string) {
  const receipt = unseal<{ provider: string; version: string; exp: number }>((await cookies()).get(privacyCookie)?.value);
  return receipt?.provider === provider && receipt.version === privacyVersion;
}
