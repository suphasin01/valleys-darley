# Membership activation

The member login UI is available at /login. /account requires a signed LINE session. Admin CMS login is separate at /admin/login and requires ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET. No administrator is granted automatically. This is the authentication foundation; there is no persistent member database or member-management API yet.

1. Create a LINE Login web channel and publish it when ready. Set LINE_CHANNEL_ID and LINE_CHANNEL_SECRET in Vercel's server environment variables.
2. Generate AUTH_SECRET with `openssl rand -hex 32` and store it only in Vercel environment variables. Never use a NEXT_PUBLIC prefix for secrets.
3. Register `https://valleys-darley.vercel.app/api/auth/line/callback` as a LINE callback. Set NEXT_PUBLIC_SITE_URL if the storefront domain changes, and register its callback too.
4. For admin CMS access, run `node scripts/generate-admin-credentials.mjs` and set ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET in Vercel. LINE user IDs do not grant admin access.
5. After choosing and registering the actual domain, add its admin subdomain to the existing Vercel project's Domains settings. Use the DNS record Vercel provides, wait for verification and TLS, then set ADMIN_ORIGIN to the full HTTPS origin. The admin domain does not need a LINE callback.
6. Redeploy. Test member login, cancellation, and logout separately from admin login and logout. Member access alone must not grant /admin access. Cookies are host-only: each host logs in independently.

The member flow uses authorization code + PKCE, state, nonce, LINE server verification, signed HttpOnly cookies (24-hour session), and an origin check for logout. No access token is saved in the browser. Admin login uses a separate scrypt password hash and signed HttpOnly cookie (12-hour session). Changing the admin password hash or session secret revokes existing admin sessions.

Until LINE credentials exist the member login button remains disabled. Until admin credentials exist the admin login button remains disabled. Do not claim live LINE login or a custom domain is active until configured and verified.
