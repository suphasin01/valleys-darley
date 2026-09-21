# Membership activation

The login UI is available at /login. /account requires a signed session; /admin also checks ADMIN_LINE_USER_IDS server-side. No administrator is granted automatically. This is the authentication foundation; there is no persistent member database or member-management API yet.

1. Create a LINE Login web channel and publish it when ready. Set LINE_CHANNEL_ID and LINE_CHANNEL_SECRET in Vercel's server environment variables.
2. Generate AUTH_SECRET with `openssl rand -hex 32` and store it only in Vercel environment variables. Never use a NEXT_PUBLIC prefix for secrets.
3. Register `https://valleys-darley.vercel.app/api/auth/line/callback` as a LINE callback. Set NEXT_PUBLIC_SITE_URL if the storefront domain changes, and register its callback too.
4. Set ADMIN_LINE_USER_IDS to explicitly approved LINE user IDs. Empty denies all admin access. A channel ID is not a user ID.
5. After choosing and registering the actual domain, add its admin subdomain to the existing Vercel project's Domains settings. Use the DNS record Vercel provides, wait for verification and TLS, then set ADMIN_ORIGIN to the full HTTPS origin and register its /api/auth/line/callback with LINE.
6. Redeploy. Test login, cancellation, logout, member access denied to /admin, and administrator access on both hosts. Cookies are host-only: each host logs in independently.

The flow uses authorization code + PKCE, state, nonce, LINE server verification, signed HttpOnly cookies (24-hour session), and an origin check for logout. No access token is saved in the browser. Removing a user from ADMIN_LINE_USER_IDS and redeploying revokes their admin access even while their member session remains valid.

Until credentials exist the login button remains disabled. Do not claim live LINE login or a custom domain is active until configured and verified.
