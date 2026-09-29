# Mr Chai Wala — Cafe POS & Daily Hisaab

A simple, fast, offline-first Point of Sale and daily hisaab (accounts) app built
specifically for **Mr Chai Wala**, a small tea/cafe counter. It is designed for an
owner/staff member with very little computer experience — big buttons, clear
labels, instant feedback, and zero technical setup.

## What this app does

- Record sales in one or two taps (Cash or Udhaar/credit)
- Track daily expenses (Milk, Gas, Ice, Water, Tea, Sugar, Masala, Other + custom)
- Show a live daily "hisaab" (sales, expenses, net profit, order count)
- Generate a professional daily Excel report and PDF report
- Detect and back-fill any day that wasn't closed before the app was last used
- Manage products/categories (add, edit, price change, enable/disable, delete)
- Track customer udhaar (credit) and mark it paid
- Full local backup & restore (single JSON file)
- Works 100% offline. No internet, no external database, no login.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- `xlsx` for Excel export, `jspdf` + `jspdf-autotable` for PDF export
- `lucide-react` for icons, `date-fns` for date handling
- Data is persisted locally using the browser's `localStorage` — there is **no**
  server, **no** cloud database (no Supabase/Firebase/Postgres/Mongo) and the app
  never requires an internet connection.

## Project structure

```
src/
  components/
    ui/          Reusable building blocks (Button, Card, Modal, Toast, ...)
    layout/      Sidebar, mobile bottom nav, top bar
    PendingDaysModal.tsx   Detects unfinished daily reports on start-up
  pages/         One file per screen (Dashboard, NewSale, Expenses, ...)
  context/       AppContext.tsx — the single source of truth (state + actions)
  lib/
    storage.ts       Local persistence + backup/restore
    aggregate.ts      All the "hisaab" math (totals, breakdowns)
    money.ts          Safe currency math helpers
    date.ts           Date formatting helpers
    seed.ts           Default products/categories on first run
    export/excel.ts   Daily Excel report generator
    export/pdf.ts     Daily PDF report generator
  types/         All shared TypeScript types
```

## Running the project

```bash
npm install
npm run dev      # start the local dev server
npm run build    # production build (outputs to dist/)
npm run preview  # preview the production build
```

## Where is my data stored?

All cafe data (products, sales, expenses, udhaar, settings) is stored locally in
the browser's storage for this app — it never leaves the computer and never
touches the internet. Use **Settings → Export Backup** regularly to save a copy
of everything as a `.json` file you can keep on a USB drive or another computer.

## Daily reports

From **Today's Hisaab**, press **Close Day** to generate that day's Excel and
PDF report (they are downloaded as `Mr-Chai-Wala-YYYY-MM-DD.xlsx`/`.pdf`). You
can also generate Excel/PDF for any past day from the **Reports** screen at any
time — closing a day is optional and never deletes data.

If the app is opened on a new day and a previous day was never closed, a popup
will offer to generate the missing report(s) automatically.

## Packaging as a Windows desktop app (optional, advanced)

This project is a standard Vite web app, which is exactly what a tool like
**Tauri** expects as its frontend. A starter `src-tauri/` folder is included
with the minimum configuration needed to wrap this app into a real `.exe`.
See `GUIDE.md` for full, simple instructions written for a non-developer.

## Support / Notes for developers

- Code is organized by feature and fully typed with TypeScript.
- Money values are always calculated through `lib/money.ts` to avoid floating
  point rounding issues.
- No placeholder features — every button on every screen performs a real,
  working action.
