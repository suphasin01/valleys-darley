# Valley's Darley

Handmade sterling silver jewelry crafted with passion in Bangkok.

## Tech Stack

- **Next.js 16** — React Framework
- **Tailwind CSS v3** — Utility-first Styling
- **TypeScript** — Type Safety

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin CMS login

The admin login at `/admin/login` is independent of LINE member login. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET` in Vercel's Production environment. Run `node scripts/generate-admin-credentials.mjs` locally to generate the hash and session secret; it prompts for a password and never stores the plaintext password. Redeploy after setting the variables. To save CMS changes in production, connect Vercel Blob to the project as well.

The CMS lets an administrator add or edit products, upload a JPG/PNG/WebP image (up to 4 MB), set English and Thai names and descriptions, and publish or unpublish each product. Product cards open `/products/[id]`; the product's action leads to contact or AR try-on. Image uploads and content updates require a valid admin session. Blob must be a public store connected to this Vercel project with a `BLOB_READ_WRITE_TOKEN` environment variable.

## Stripe Checkout

The admin sets each product's price in whole Thai baht. Products without a price remain enquiry-only. Checkout is enabled only when `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_SHIPPING_FEE_THB` are all configured. Set these as server-only Vercel Production variables; do not use `NEXT_PUBLIC_` or share them in chat. Set the shipping fee to `0` explicitly if shipping is free. Checkout charges one product at a time, collects a Thailand shipping address and phone number, and shows the product and fixed shipping amount before payment. Prices are loaded from CMS on the server, never trusted from the browser.

In Stripe Dashboard, add a webhook endpoint at `https://valleys-darley.vercel.app/api/stripe/webhook` subscribed to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Copy that endpoint's signing secret to `STRIPE_WEBHOOK_SECRET`. Redeploy after changing Vercel environment variables. Start with Stripe test keys and test payments; change to live keys and the live webhook secret only after verifying the test flow. A successful return page retrieves the Checkout Session directly from Stripe and says paid only when `payment_status` is `paid`. The signed webhook verifies and logs payment events without customer personal data. Stripe stores the order and shipping data; this site does not yet provide inventory deduction.

Customers must sign in with LINE before starting Checkout. The server uses the verified LINE user ID from the signed member session to link a Stripe Customer and the Checkout Session; a browser-supplied customer ID is never accepted. `/account` displays that LINE member's completed orders. `/admin/orders` displays completed Checkout Sessions, their payment and shipping details, and allows an admin to mark paid orders as preparing, shipped, or completed and enter a tracking number. These fulfillment states are stored in Stripe Checkout Session metadata; inventory deduction, automated LINE messages, and a separate order database are not included. Configure `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, and `AUTH_SECRET` and register the website callback URL in the LINE Developers Console before enabling customer ordering.

## Languages

Use the EN/TH switch in the site header (or the AR overlay) to choose a language. The choice is saved in a one-year cookie and applies across pages. English CMS fields and their Thai translations are edited separately in the admin studio.

## Project Structure

```
app/
├── components/
│   ├── Header.tsx          # Navigation bar
│   ├── Hero.tsx            # Hero section
│   ├── ProductGrid.tsx     # Product showcase
│   ├── FeaturedCollections.tsx  # Collection carousel
│   ├── AboutSection.tsx    # About the brand
│   └── Footer.tsx          # Footer
├── layout.tsx              # Root layout
├── page.tsx                # Home page
└── globals.css             # Global styles
```

## Instagram

[@valleydarley](https://www.instagram.com/valleydarley)

## License

All rights reserved.
