# CampusCashMap

Mobile-first, login-free web app for students to plan monthly budgets and track expenses.

## Features

- Set a budget for each month.
- Add expense records with title, amount, category, date, and optional note.
- See total spent, remaining amount, and over-budget amount in real time.
- Visual usage ring that shows monthly budget utilization.
- Switch between months and keep each month's data separate.
- Category-wise spending chart for quick analysis.
- One-click reset for the current month (budget + expenses), with confirmation dialog.
- In-app action feedback banner for save/add/remove/validation actions.
- Installable PWA with offline support (service worker + web app manifest).
- Mobile install button appears when browser install prompt is available.
- Data persists in browser `localStorage` (no backend, no account).

## PWA Install Notes

- Install prompt is available in supported browsers (for example, Chrome/Edge) when app install criteria are met.
- PWA install requires a secure context (`https://`), except `localhost` on the same device.
- If testing from another device using a local IP over plain `http://`, install prompt may not appear.
- On iOS Safari, install manually with `Share -> Add to Home Screen`.

## Tech Stack

- React
- Vite
- Plain CSS (custom mobile-first UI)

## Run Locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

## Notes

- Currency is displayed in Ethiopian Birr (ETB) by default.
- Because this app is login-free, data is stored only on the current browser/device.
