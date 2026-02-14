## IPL Website

A Next.js App Router project themed in dark red with Tailwind CSS v4 and a simple translation context. This repo contains the marketing/landing pages and components for the IPL Website.

### Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS v4 (utility-first, custom primary palette)
- React Context for translations

### Requirements
- Node.js 18+
- npm 9+ (or pnpm/yarn/bun)

### Local Setup
```powershell
# install dependencies
npm install

# run dev server
npm run dev

# build for production
npm run build

# start production build
npm run start
```

App runs at `http://localhost:3000`.

### Project Structure
- `src/app/` — App Router pages (e.g., `about`, `our-team`, `news-events`, `friends-day`, `friendship-meet`, `humanitarian-services`)
- `src/components/` — UI components (`Header`, `Footer`, etc.)
- `src/contexts/` — `TranslationContext`
- `src/i18n/` — translations (`js` and `ts`)
- `public/Images/` — static assets

### Theming
Tailwind tokens map the primary color to red variants. Update `src/app/globals.css` if you want to adjust the palette.

### Scripts
- `dev`: start dev server
- `build`: production build
- `start`: run built server
- `lint`: run ESLint (if configured)

### Deployment
You can deploy to any Node hosting or to Vercel. Build with `npm run build` and serve with `npm run start`.

### License
Private project. All rights reserved.
