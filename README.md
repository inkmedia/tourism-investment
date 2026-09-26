# Tourism Investment frontend

Next.js frontend for the Gelephu Mindfulness City tourism investment site. The first delivery contains the shared sticky header and animated hero. WordPress integration and the remaining sections will be added as their references are supplied.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current assets and content

- `public/img/Logo.png` is copied from the supplied `img/Logo.png`.
- `public/img/Hero-bg.png` is the supplied hero image. The frontend uses its smaller `Hero-bg.webp` derivative for faster loading.
- Hero text is currently in `app/page.tsx`; navigation and the temporary email links are in `components/Header.tsx`.
- Header links for **Why Invest** and **How to Invest** are reserved for sections still to be built. The **Opportunities** link currently points to a temporary section marker.
- The team links use `mailto:` until the contact form and WordPress settings are implemented. The future form recipient is `ghevaram.suthar@inkmedia.in`; Google Sheets integration is planned for a later phase.

The first-load animation uses GSAP. The logo stays centered while the hero image, logo, and fonts load, then dissolves into a small centered panel containing the hero image. That image panel expands to the full viewport while its image scales and moves independently for depth. The header and hero copy then reveal in staggered groups. After loading, mouse movement adds subtle parallax to the hero image alone. It respects `prefers-reduced-motion`.
