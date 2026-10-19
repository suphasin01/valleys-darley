export const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;
export type Gender = '' | typeof genderOptions[number]['value'];

/** Optional identity fields; country stays within the currently supported delivery area. */
export function validateDemographics(form: FormData): { gender?: Gender; country?: 'TH' } | null {
  const result: { gender?: Gender; country?: 'TH' } = {};
  if (form.has('gender')) {
    const value = form.get('gender');
    if (typeof value !== 'string' || value !== '' && !genderOptions.some(option => option.value === value)) return null;
    result.gender = value as Gender;
  }
  if (form.has('country')) {
    if (form.get('country') !== 'TH') return null;
    result.country = 'TH';
  }
  return result;
}
