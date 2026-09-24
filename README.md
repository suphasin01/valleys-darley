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
