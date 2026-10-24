# Apna Khata | اپنا کھاتہ

**A mobile-first mandi ledger and shared cloud database for the South Punjab fruit and cotton supply chain.**

Apna Khata digitises the paper slips (*parchi*) and handwritten ledgers (*bahi-khata*) used in Pakistani mandis. Farmers, arhtis (commission agents), cold storage operators, transporters and buyers work from one shared record instead of keeping separate paper books.

Target region: Multan, Khanewal, Bahawalpur, Rahim Yar Khan, Vehari, Lodhran, Muzaffargarh.
Commodities: mango, citrus, dates, cotton.

---

## Table of Contents

1. [What problem it solves](#1-what-problem-it-solves)
2. [Features](#2-features)
3. [User roles](#3-user-roles)
4. [Everything we use](#4-everything-we-use)
5. [Open source vs. managed services](#5-open-source-vs-managed-services)
6. [A note on Gemini, Gemma and open-source AI](#6-a-note-on-gemini-gemma-and-open-source-ai)
7. [Architecture](#7-architecture)
8. [Data model](#8-data-model)
9. [API reference](#9-api-reference)
10. [Security and privacy](#10-security-and-privacy)
11. [Getting started](#11-getting-started)
12. [Environment variables](#12-environment-variables)
13. [Project structure](#13-project-structure)
14. [Scripts](#14-scripts)
15. [Deployment](#15-deployment)
16. [Known issues and roadmap](#16-known-issues-and-roadmap)
17. [License and attribution](#17-license-and-attribution)

---

## 1. What problem it solves

| Problem in the mandi | How Apna Khata helps |
|---|---|
| Each party keeps a separate paper bahi, so balances are disputed at settlement | One shared record visible to both farmer and arhti, with confirm/dispute flags |
| Farmers cannot see what the arhti recorded until the season ends | Real-time sync through Firestore |
| Paper slips fade, tear and get lost | Digital slips, exportable to CSV |
| Buyers and inspectors cannot verify a lot's origin | Public QR verification with non-sensitive data only |
| Software is usually English-only | Urdu-first right-to-left interface, Urdu/Roman Urdu/Punjabi voice entry |

---

## 2. Features

- **Digital sale slips**: serial number, parties, commodity, variety, grade, crates, gross/tare/net weight, rate (kg, man, ton, peti), deductions, net payable.
- **Bahi-khata ledger**: debit/credit entries with running balance, season, and confirmation flags for both farmer and arhti.
- **Cold storage**: bookings, inward inventory, outward gate passes, rent per ton per day.
- **Bilty (transport notes)**: vehicle, driver, route, freight, advance, balance, status (loaded / in transit / delivered).
- **Lot passports and QR verification**: public, non-sensitive certificate records.
- **AI document scanning**: photograph a slip or ledger page, review extracted fields on a confirm-and-edit screen.
- **Voice entry**: speak amounts such as *paanch hazaar*, *dhai lakh*, *sawa lakh*.
- **Privacy tools**: export all your data as CSV (UTF-8 BOM, opens correctly in Excel) and delete your account and data.
- **Installable PWA**: works like a phone app, with offline caching.

---

## 3. User roles

| Role | Urdu | Purpose |
|---|---|---|
| `farmer` | کسان | Reviews and confirms slips and entries, books cold storage, registers lots |
| `arhti` | آڑھتی | Issues slips and advances, maintains the farmer ledger |
| `cold_storage` | کولڈ اسٹوریج آپریٹر | Handles bookings, inventory and gate passes |
| `transporter` | ٹرانسپورٹر | Creates bilties |
| `buyer` | خریدار | Appears on slips, verifies lots |
| admin | n/a | Verifies operators and arhtis, views platform counts |

---

## 4. Everything we use

### Front end

| Technology | Version (package.json) | What it does here | License |
|---|---|---|---|
| React | ^19 | UI components | MIT |
| React DOM | ^19 | Renders React in the browser | MIT |
| Vite | ^8 | Dev server and bundler | MIT |
| @vitejs/plugin-react | ^6 | React support in Vite | MIT |
| Tailwind CSS | ^4 | Utility-first styling | MIT |
| @tailwindcss/vite | ^4 | Tailwind integration for Vite | MIT |
| lucide-react | ^0.546 | Icon set | ISC |
| motion | ^12 | Animations | MIT |
| qrcode | ^1.5 | Generates QR codes for public verification | MIT |
| vite-plugin-pwa | ^2 | Service worker (Workbox), manifest, auto-update | MIT |
| TypeScript | ^7 | Type checking (`npm run lint` runs `tsc --noEmit`) | Apache-2.0 |

Fonts (Google Fonts, open licenses): **Gulzar** and **Noto Nastaliq Urdu** for Urdu text, **Plus Jakarta Sans** for Latin text.

### Back end

| Technology | Version | What it does here | License |
|---|---|---|---|
| Node.js | recent LTS | Runtime | MIT-style |
| Express | ^4.21 | HTTP server and API routes | MIT |
| tsx | ^4 | Runs TypeScript (`server.ts`) directly | MIT |
| dotenv | ^17 | Loads `.env` into `process.env` | BSD-2-Clause |
| esbuild | ^0.25 | Fast bundling (used by tooling) | MIT |
| sharp | ^0.35 | Image processing (icons / PWA assets) | Apache-2.0 |
| autoprefixer | ^10 | CSS vendor prefixes | MIT |
| @types/* | various | TypeScript type definitions | MIT |

### Cloud and AI services

| Service | Package | What it does here |
|---|---|---|
| Firebase Authentication | `firebase` ^13 | Phone-number OTP sign-in and Google sign-in |
| Cloud Firestore | `firebase` ^13 | Shared real-time database, secured by `firestore.rules` |
| Gemini API | `@google/genai` ^2.4 | Reads photographed documents and parses spoken entries (server-side only) |

The `firebase` JS SDK and `@google/genai` SDK are Apache-2.0 open-source *client libraries*, but the services they connect to are managed, closed services (see next section).

### Tooling

- **Bun** (`bun.lock`) or **npm** for installing packages.
- **Workbox** (through vite-plugin-pwa) for caching and offline support.
- **Firebase Emulator Suite** is recommended for testing the security rules (not yet set up in this repo).

---

## 5. Open source vs. managed services

| Category | Components |
|---|---|
| **Open source (you can read, modify and self-host the code)** | React, Vite, Tailwind CSS, Express, lucide-react, motion, qrcode, dotenv, tsx, esbuild, sharp, Workbox, vite-plugin-pwa, TypeScript, the Firebase and Google GenAI *client SDKs*, and the Urdu fonts |
| **Managed / proprietary services (not open source)** | Cloud Firestore, Firebase Authentication, the Gemini API |
| **Our own code** | `server.ts`, `firestore.rules`, the React app, the schema and the documentation |

Licenses above are listed from general knowledge of these projects. Before you publish or sell the app, check each package's own `LICENSE` file (for example with `npx license-checker`) and keep the required notices.

---

## 6. A note on Gemini, Gemma and open-source AI

This project uses **Gemini** (a Google cloud API), **not** an open-source model. Gemini is called only from `server.ts`, so the API key never reaches the browser.

**Gemma** is Google's separate family of *open-weight* models, which you can download and run yourself. It is not used anywhere in this code. Note that Gemma is released under its own Gemma Terms of Use, which is not an OSI-approved open-source license, so "open weights" is the accurate description.

If you want a fully open or self-hosted AI option later, you could:

- Replace the two Gemini calls in `server.ts` with a locally hosted model (for example Gemma served through an inference server) behind the same JSON response format.
- Use an open OCR engine such as **Tesseract** for printed text. Handwritten Urdu is harder, so test accuracy before switching.

The two AI endpoints are isolated in `server.ts`, so changing the provider only affects that file.

---

## 7. Architecture

```
 ┌──────────────────────────┐
 │  PWA (React + Tailwind)  │  Urdu RTL UI, offline cache, service worker
 └────────┬─────────┬───────┘
          │         │
   Firebase SDK     │  fetch /api/*
          │         │
          ▼         ▼
 ┌─────────────┐  ┌──────────────────────┐
 │  Firestore  │  │  Express (server.ts) │
 │  + Auth     │  │  /api/scan-document  │
 │  + Rules    │  │  /api/parse-voice    │
 └─────────────┘  └──────────┬───────────┘
                             │
                             ▼
                       Gemini API
```

**Typical flow (farmer and arhti):**

1. The arhti creates a sale slip. It is written to `sale_slips` with `participantUids = [farmerId, arhtiId]`.
2. Firestore pushes the change in real time to the farmer's phone.
3. The farmer reviews the deductions and confirms or flags a dispute.
4. A `public_verifications` record can be created so the slip has a QR code.

In development, Express mounts the Vite dev server as middleware (`npm run dev`). In production, Express serves the built `dist/` folder.

---

## 8. Data model

| Collection | Purpose | Intended access |
|---|---|---|
| `users` | Name, phone, role, district, consent, verification flag | Owner and admin |
| `sale_slips` | Auction slips with weights, rate, deductions | Participants and admin |
| `khata_entries` | Ledger entries between farmer and arhti | The two parties and admin |
| `cold_storage_items` | Stored inventory | Operator and depositing farmer |
| `cold_storage_gate_passes` | Outward passes and rent bills | Operator, farmer, admin |
| `cold_storage_bookings` | Space reservation requests | Operator and farmer |
| `bilties` | Transport consignment notes | Transporter, sender, receiver |
| `lots` | Harvest lot passports | Farmer and participants |
| `parties` | Personal address book | Owning user only |
| `public_verifications` | Non-sensitive QR certificate records | Public single `get` by ID; no `list` |
| `admins` | Existence check for admin privilege | Single `get` by signed-in users |

Full field definitions are in `firebase-blueprint.json`. (`parties` and `admins` are described in this README but not yet in the blueprint file.)

Every transaction document carries a `participantUids` array. The security rules use it to decide who can read or write.

---

## 9. API reference

Base URL: the same origin as the app (default `http://localhost:3000`).

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Status, version and whether `GEMINI_API_KEY` is configured |
| GET | `/api/mandi-status` | Supported markets, currency (PKR), standard man weight (40 kg) |
| POST | `/api/scan-document` | OCR of a handwritten or printed slip or ledger page |
| POST | `/api/parse-voice` | Turns a spoken or typed Urdu/Roman Urdu/Punjabi phrase into structured fields |

### POST `/api/scan-document`

```json
{
  "imageBase64": "<base64 or data URI>",
  "documentType": "slip",
  "mimeType": "image/jpeg"
}
```

- `documentType` is `"slip"` (returns one `slipData` object) or `"khata"` (returns an `extractedRows` list).
- Every response includes a warning that AI can misread handwriting. **Always review before saving.**
- Body limit: 25 MB.

### POST `/api/parse-voice`

```json
{
  "transcript": "haji sahib ko pachas hazaar diya",
  "context": "khata"
}
```

Returns `parsed`: `amount`, `partyName`, `flowType` (`given`/`received`), `entryType`, optional `commodity`, `itemName`, `notes`, `confidence`.

If the Gemini key is missing, both endpoints return **simulated sample data** so the screens can be demonstrated. Do not rely on this in production.

---

## 10. Security and privacy

**Privacy by design**

- Only name, phone, role and district are collected.
- No CNIC or national ID numbers, ever.
- Explicit consent is required at registration (`consentAccepted == true`).
- Users can export or delete all their data.

**Firestore rules (`firestore.rules`)**

- Global default-deny.
- `isParticipant()` checks `participantUids`, `createdBy`, `operatorUid`, `farmerId`, `transporterUid` and the verified phone number.
- `public_verifications` allows `get` by exact ID only, never `list`, to prevent scraping.
- Users cannot change their own `role` or `isVerified`.
- `isValidId()` limits document IDs to 128 safe characters.

**Security test scenarios** are listed in `security_spec.md` (the "Dirty Dozen").

> **Important:** the current rules and API do not yet fully enforce everything the spec promises. Before onboarding real users, fix at least these:
>
> 1. Restrict who can create/update `public_verifications`.
> 2. Add ownership checks, immutable fields and size limits to cold storage, bilty and lot rules.
> 3. Allow only the operator to change a booking's status.
> 4. Verify a Firebase ID token and add rate limiting on `/api/*`.
> 5. Remove any client-side admin PIN; use the `admins` collection or custom claims.
> 6. Keep `VITE_ENABLE_DEV_TEST_LOGINS="false"` in production.

Never commit real secrets. `.gitignore` already excludes `.env*` (except `.env.example`).

---

## 11. Getting started

**Prerequisites:** Node.js (recent LTS) and either Bun or npm. A Firebase project (Firestore and Authentication enabled) and a Gemini API key from Google AI Studio.

```bash
# 1. Install dependencies
bun install        # or: npm install

# 2. Configure environment
cp .env.example .env
# edit .env and set GEMINI_API_KEY and APP_URL

# 3. Make sure firebase-applet-config.json points to your Firebase project

# 4. Start development (Express + Vite on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000/api/health` to confirm the server is up and the Gemini key is detected.

---

## 12. Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | For AI features | Gemini API key. Server-side only. Without it, endpoints return simulated data. |
| `APP_URL` | Recommended | Public URL of the deployed app (callbacks, self-links). |
| `VITE_ENABLE_DEV_TEST_LOGINS` | No | `"true"` shows one-tap dev logins. Keep `"false"` in production. |
| `PORT` | No | Server port (default `3000`). |
| `NODE_ENV` | No | Set to `production` to serve the built `dist/` folder. |
| `DISABLE_HMR` | No | Set to `true` to turn off hot reload. |

---

## 13. Project structure

```
.
├── index.html                 # App shell (Urdu, RTL), fonts, PWA meta tags
├── server.ts                  # Express API + Gemini calls + Vite middleware
├── vite.config.ts             # React, Tailwind, PWA manifest and Workbox
├── tsconfig.json
├── package.json
├── bun.lock
├── firestore.rules            # Database security rules
├── firebase-blueprint.json    # Entity schemas and collection map
├── firebase-applet-config.json# Firebase web app configuration
├── security_spec.md           # Security invariants and attack scenarios
├── metadata.json              # App name/description and capabilities
├── .env.example               # Environment variable template
├── .gitignore
└── src/                       # React application (main.tsx entry)
```

---

## 14. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs `server.ts` with tsx; Vite runs as middleware |
| `npm run build` | Builds the front end into `dist/` |
| `npm run preview` | Previews the built front end with Vite |
| `npm run start` | Runs `server.ts` with Node (use `tsx server.ts` if your Node version cannot run `.ts` files) |
| `npm run lint` | Type-checks with `tsc --noEmit` |
| `npm run clean` | Removes `dist` and `server.js` |

---

## 15. Deployment

1. Build the front end: `npm run build`.
2. Set `NODE_ENV=production` and your environment variables on the host (for example Google Cloud Run).
3. Start the server so Express serves `dist/` and the `/api` routes.
4. Deploy `firestore.rules` to the Firebase project.
5. Restrict the Firebase web API key by HTTP referrer and enable App Check.
6. Test installation as a PWA on a real phone, including offline behaviour.

---

## 16. Known issues and roadmap

**Known issues**

- Firestore rules and `/api` endpoints need the hardening described in section 10.
- Offline number parsing (`parseUrduNumberWords`) uses substring matching and can misread short words; always confirm amounts.
- The voice fallback defaults an amount of 5000 when none is found, which should be removed.
- The Gemini model name is hard-coded in two places in `server.ts`; confirm it is valid for your account and move it to an environment variable.
- `README`, blueprint and rules should be kept in sync (`parties`, `admins`).

**Roadmap**

- Automated Firestore rules tests with the Firebase Emulator.
- Dispute workflow on slips and ledger entries.
- Season summaries, outstanding balance reports and settlement statements.
- Optional self-hosted or open-weight AI provider.
- Pilot with one arhti and a few farmers in one district.

---

## 17. License and attribution

Add a `LICENSE` file for this project before sharing it publicly. Open-source dependencies keep their own licenses (see section 4); retain their notices when you distribute the app. Gemini, Firebase and Firestore are governed by Google's own terms of service.

Built for the farmers, arhtis, cold storage operators and transporters of South Punjab.
