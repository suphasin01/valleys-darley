export type TrackingEvent = {
  status: string;
  description: string;
  detail: string;
  date: string;
  location: string;
};

export function normalizeTrackingNumber(value: string) {
  const barcode = value.trim().toUpperCase();
  return /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(barcode) ? barcode : null;
}

let cachedToken: { value: string; until: number } | null = null;
let tokenRequest: Promise<string> | null = null;
const apiBase = 'https://trackapi.thailandpost.co.th/post/api/v1';

async function refreshToken() {
  const tokenKey = process.env.THAILAND_POST_TOKEN_KEY;
  if (!tokenKey) throw new Error('TRACKING_NOT_CONFIGURED');
  if (cachedToken && cachedToken.until > Date.now()) return cachedToken.value;
  const response = await fetch(`${apiBase}/authenticate/token`, {
    method: 'POST',
    headers: { Authorization: `Token ${tokenKey}`, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('TRACKING_AUTH_FAILED');
  const data: unknown = await response.json();
  const token = typeof data === 'object' && data !== null && 'token' in data ? data.token : null;
  if (typeof token !== 'string' || token.length < 16) throw new Error('TRACKING_AUTH_FAILED');
  cachedToken = { value: token, until: Date.now() + 6 * 60 * 60 * 1000 };
  return token;
}

async function accessToken() {
  if (cachedToken && cachedToken.until > Date.now()) return cachedToken.value;
  if (!tokenRequest) tokenRequest = refreshToken().finally(() => { tokenRequest = null; });
  return tokenRequest;
}

export async function trackThailandPostBatch(barcodes: string[], language: 'TH' | 'EN'): Promise<Record<string, TrackingEvent[]>> {
  const safeBarcodes = [...new Set(barcodes.map(normalizeTrackingNumber))];
  if (!safeBarcodes.length || safeBarcodes.length > 1000 || safeBarcodes.some(value => !value)) throw new Error('INVALID_TRACKING_NUMBER');
  async function request(token: string) {
    return fetch(`${apiBase}/track`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'all', language, barcode: safeBarcodes }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  }
  let response = await request(await accessToken());
  if (response.status === 401) {
    cachedToken = null;
    response = await request(await accessToken());
  }
  if (!response.ok) throw new Error('TRACKING_UNAVAILABLE');
  const data = await response.json() as { status?: boolean; response?: { items?: Record<string, unknown> } };
  if (data.status === false) throw new Error('TRACKING_UNAVAILABLE');
  const result: Record<string, TrackingEvent[]> = {};
  for (const safeBarcode of safeBarcodes) {
  const raw = data.response?.items?.[safeBarcode!];
  if (!Array.isArray(raw)) { result[safeBarcode!] = []; continue; }
  result[safeBarcode!] = raw.slice(0, 100).filter(item => item && typeof item === 'object').map(item => ({
    status: typeof item.status === 'string' ? item.status : '',
    description: typeof item.status_description === 'string' ? item.status_description : '',
    detail: typeof item.statusDetail === 'string' ? item.statusDetail : '',
    date: typeof item.status_date === 'string' ? item.status_date : '',
    location: typeof item.location === 'string' ? item.location : '',
  }));
  }
  return result;
}

export async function trackThailandPost(barcode: string, language: 'TH' | 'EN'): Promise<TrackingEvent[]> {
  const normalized = normalizeTrackingNumber(barcode);
  if (!normalized) throw new Error('INVALID_TRACKING_NUMBER');
  return (await trackThailandPostBatch([normalized], language))[normalized];
}
