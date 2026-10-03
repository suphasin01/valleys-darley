# Customer registration

`/register` accepts native email/password registration or completes the recipient profile after LINE, Google, or Facebook authentication. All customers must provide a recipient name, contact email, telephone, street address, subdistrict, district, province and five-digit Thailand postal code before checkout. `/account` allows profile editing; `/admin/customers` is restricted to administrator sessions.

Required production environment variables: `AUTH_SECRET` (at least 32 characters) and `BLOB_READ_WRITE_TOKEN`. Social providers additionally require their client ID and secret as defined in `app/lib/auth.ts`. Callback URLs are `/api/auth/{google,facebook,line}/callback` on the public site origin. Provider console review/publication is separate from enabling the code.

Customer records on the existing public Blob store are AES-256-GCM encrypted. Do not rotate or remove `AUTH_SECRET` without a migration: it derives both the encryption key and opaque record paths. Back up secrets securely; do not commit them. Passwords use salted scrypt and account lockout after five failed attempts. No password hashes are exposed in the admin customer listing. Native registration does not yet verify ownership of the contact email or provide password recovery. Social identities are not automatically merged by email.

Stripe uses saved contact and shipping details when creating/updating a customer; order payment is confirmed only by the existing signed webhook, not by registration. Configure product prices in the CMS before placing orders.

Run `node scripts/test-customer-profile.cjs` and `npm run build` to verify the registration storage and routes. The storage tests use an in-memory Blob mock and synthetic data only.
