import { privacyVersion } from './privacy';

export type InquiryInput = { firstName: string; lastName: string; email: string; message: string; newsletter: boolean; privacyVersion: string };
export function validateInquiry(value: unknown): InquiryInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const field = (name: string, max: number) => typeof data[name] === 'string' && (data[name] as string).trim().length <= max ? (data[name] as string).trim() : null;
  const firstName = field('firstName', 100), lastName = field('lastName', 100), email = field('email', 254)?.toLowerCase(), message = field('message', 3000);
  if (!firstName || !lastName || !email || message === null || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n\x00]/.test(firstName + lastName + email)) return null;
  if (typeof data.newsletter !== 'boolean' || (!message && !data.newsletter) || data.privacyAcknowledged !== true || data.privacyVersion !== privacyVersion || data.website) return null;
  return { firstName, lastName, email, message, newsletter: data.newsletter, privacyVersion };
}
