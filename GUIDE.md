# Mr Chai Wala — Simple Setup Guide

This guide is written in plain language for someone who is **not** a
professional developer. Follow the steps one by one.

---

## 1. What you need before starting

- A Windows, Mac or Linux computer
- **Node.js** installed (this lets the computer understand the app's code).
  Download it from https://nodejs.org (choose the "LTS" version) and install
  it like any normal program (Next → Next → Finish).

That's it. You do **not** need to install any database, server, or anything
else.

---

## 2. Running the app on your computer (for daily use / testing)

1. Open the project folder.
2. Open a terminal / command prompt inside that folder.
3. Type this once, and press Enter (this downloads the pieces the app needs):
   ```
   npm install
   ```
4. Then type this and press Enter to start the app:
   ```
   npm run dev
   ```
5. It will show a web address like `http://localhost:5173`. Open that address
   in your browser (Chrome/Edge). The app will open and you can start using it
   immediately — no internet connection is needed after the page has loaded.

The **first time** you open it, you'll see a short welcome screen asking for
your cafe name and currency. Fill it in and press **Start Using Mr Chai Wala**.

---

## 3. Everyday use — how it works

- **New Sale**: Tap the item buttons (like "Cut Chai — Rs. 60") to add them to
  the bill on the right. Use the **+ / −** buttons to change quantity. Press
  **Proceed to Payment**, choose **Cash** or **Udhaar**, and confirm.
- **Expenses**: Tap a category like "Milk", type the amount, and press Save.
- **Today's Hisaab**: Shows everything about today — sales, expenses, and your
  net hisaab (profit) automatically calculated.
- **Reports**: Shows every previous day. Press **Excel** or **PDF** any time
  to download that day's report again.
- **Close Day**: At the end of the day, go to **Today's Hisaab** and press
  **Close Day**. This saves the final Excel + PDF report for that day. You
  don't have to do this — if you forget, the app will notice next time you
  open it and offer to generate the missing report for you automatically.

---

## 4. Where is my data stored?

All your sales, expenses, and settings are stored safely **on this computer
only** — nothing is sent to the internet. Because a web browser is used to
display the app, the data technically lives inside the browser's local storage
for this app (similar to how a bookmark or saved password is stored).

**Important:** Because of this, please:
- Always use the **same computer and same browser** to open the app.
- Regularly go to **Settings → Export Backup** to save a `.json` backup file.
  Keep a copy of this file on a USB drive, or email it to yourself, so you
  never lose your hisaab even if something happens to the computer.

Daily Excel and PDF reports are downloaded through your browser's normal
download system — by default this is your computer's **Downloads** folder.
You can move them into a folder such as:

```
Documents/Mr Chai Wala/Daily Hisaab/
```

and keep them there for your records (create the folder once, then just drag
the downloaded files into it).

---

## 5. Creating backups

1. Go to **Settings**.
2. Press **Export Backup**.
3. A file named like `Mr-Chai-Wala-Backup-2026-09-28.json` will be downloaded.
4. Copy this file somewhere safe (USB drive, another computer, cloud drive).

Do this at least once a week, or after a busy day.

## 6. Restoring a backup

1. Go to **Settings**.
2. Press **Restore Backup**.
3. Choose the `.json` backup file you saved earlier.
4. Confirm when asked — this will replace the current data with the backup.

---

## 7. Adding or changing products and prices

1. Go to **Items**.
2. Press **+ Add Item** to create a new product (name, shortcut code, price,
   category).
3. To change a price or name, press **Edit** on any item card.
4. To temporarily hide an item from the sales screen without deleting it,
   press **Disable**.
5. To permanently remove an item, press **Delete** (old sales records are not
   affected).

You can also add new **Categories** (like "Desserts" or "Drinks") from the
same screen using the **+ Category** button.

---

## 8. Building a Windows desktop app (.exe) — optional, advanced

This project already includes a ready `src-tauri/` folder configured for
**Tauri**, a tool that wraps a web app like this one into a real Windows
desktop program. This step is optional and only needed if you want a
double-click desktop icon instead of opening the app in a browser.

1. Install the Rust programming language toolchain from https://rustup.rs
   (needed only for this one-time desktop packaging step).
2. Install the Tauri command line tool:
   ```
   npm install -D @tauri-cli
   ```
3. Build the installer:
   ```
   npm run build
   npx tauri build
   ```
4. The finished installer (`.exe` / `.msi`) will appear inside:
   ```
   src-tauri/target/release/bundle/
   ```
5. Share or run that installer on any Windows computer — the app runs fully
   offline once installed.

If any of this sounds too technical, that's completely fine — the app already
works perfectly as a browser-based program using the steps in Section 2.

---

## 9. Something went wrong?

- If a screen shows an error message, it will always be in plain language —
  for example "Something went wrong while saving the sale. Please try again."
- Try closing and reopening the app.
- If numbers ever look wrong, check **Settings → Export Backup** first to be
  safe, then check the **Reports** page for the specific day in question.
- As a last resort, use **Settings → Restore Backup** with your last saved
  backup file.

---

## 10. Quick summary (for a very first launch)

1. Install Node.js.
2. Run `npm install`, then `npm run dev`.
3. Open the link shown in your browser.
4. Fill in your cafe name → press Start.
5. Start tapping items, taking payments, and recording expenses.
6. Export a backup every few days from Settings.

That's the whole system — no logins, no internet, no complicated setup.
