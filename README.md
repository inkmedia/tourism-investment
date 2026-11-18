# Tourism Investment frontend

Next.js frontend for the Gelephu Mindfulness City tourism investment site. The first delivery contains the shared sticky header and animated hero. WordPress integration and the remaining sections will be added as their references are supplied.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Separate preview version

The updated design is maintained on `version-2.0`.
Keep `main` as the existing production version. Push preview changes to this
branch without merging them into `main`.

For a Vercel project connected to this repository, keep its Production Branch
set to `main` and enable Preview deployments for this branch. Use the preview
deployment URL to test or share the updated design independently. If the new
design needs a separate production site, import the repository as a second
Vercel project, select this branch as that project's Production Branch, and
use a different domain. Leave the original project's domain and settings in place.

## Current assets and content

- `public/img/Logo.png` is copied from the supplied `img/Logo.png`.
- `public/img/Hero-bg.png` is the supplied hero image. The frontend uses its smaller `Hero-bg.webp` derivative for faster loading.
- Hero text is currently in `app/page.tsx`; navigation and the temporary email links are in `components/Header.tsx`.
- Header links for **Why Invest** and **How to Invest** are reserved for sections still to be built. The **Opportunities** link currently points to a temporary section marker.
- Public contact and investment enquiries use `tourism@gmc.bt`. The official privacy contact remains `dpo@gmc.bt`.

## Investment enquiry delivery

The form posts every field and the selected opportunity to `/api/enquiries`. It validates the payload, formats a plain-text email and sends it to a protected Hostinger `email.php` endpoint. The visitor's email becomes Reply-To; the Hostinger sender is `noreply@gmc.bt`.

**Deployment configuration is still required; no live email has been sent.** Follow [Hostinger PHP setup](deploy/hostinger/README.md) and `.env.example`. The test recipient defaults to `ghevaram.suthar@inkmeda.in`, exactly as requested; public contact stays `tourism@gmc.bt` and privacy contact stays `dpo@gmc.bt`. Missing settings return a clear “not sent” error and retain the form entries. The secret is server-only; the PHP file belongs on Hostinger, not in Next.js's public assets.

Run `node scripts/check-enquiries.mjs` for local tests with mocked delivery; no email service is contacted. PHP server acceptance triggers confirmation, but actual inbox delivery requires a separately authorised live test.

The first-load animation uses GSAP. The logo stays centered while the hero image, logo, and fonts load, then dissolves into a small centered panel containing the hero image. That image panel expands to the full viewport while its image scales and moves independently for depth. The header and hero copy then reveal in staggered groups. After loading, mouse movement adds subtle parallax to the hero image alone. It respects `prefers-reduced-motion`.
