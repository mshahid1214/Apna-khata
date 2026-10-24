# Apna Khata | اپنا کھاتہ - Implementation Plan

A mobile-first, offline-capable Progressive Web App purpose-built for low-literacy farmers, commission agents (arhtis), cold storage operators, transporters, and buyers in South Punjab's agricultural belt (mango, citrus, dates, and cotton), digitalising paper slips and bahi-khata registers.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following key design and functional choices were confirmed in Phase 1 clarification:

- **Confirmed Decision 1 (Visual Style)**: Traditional Mandi ledger with warm kraft parchment paper styling, authentic red-ruled columns, vintage receipt headers, and green/violet circular stamped seal (مہر) motifs, engineered with high contrast for outdoor sunlight legibility.
- **Confirmed Decision 2 (Priority Slip Types)**: Dashboard quick-actions and quick-entry workflows prioritize **Mandi Auction (Boli / بولی)**, **Weighbridge (Kanta / کانٹا)**, and **Cold-Storage Challan (چلان)**, alongside full ledger accounts (Khata) and freight transit receipts.
- **Confirmed Decision 3 (Audio Narration Fallback)**: Multi-tier voice assistance that uses native Urdu Web Speech API (`ur-PK` / `ur`) when available, falling back smoothly to Roman Urdu speech phonetics paired with an on-screen animated voice caption banner highlighting spoken figures and totals in real-time.

---

## 1. Overview & Core Concept

**Apna Khata (اپنا کھاتہ)** replaces vulnerable paper slip receipts (*boli parchi*, *kanta ticket*, *arhat bahi*, *godown rasid*) with an intuitive digital counterpart tailored to the unique economic workflows of Multan, Khanewal, Rahim Yar Khan, and Bahawalpur mandi hubs.

- **Primary Commodity Belt**:
  - Mango (آم - Chaunsa, Sindhri, Anwar Ratol, Dusehri)
  - Citrus / Kinnow (کنو / مالٹا)
  - Dates / Aseel Khajoor (کھجور)
  - Cotton / Phutti (کپاس / پھٹی)
- **Target Audience**: Low-literacy rural farmers, mandi arhtis (commission brokers), weighbridge operators, cold-storage ledger keepers, and long-haul truck dispatchers.
- **Core Value Proposition**:
  - Zero computational friction: Automatic unit conversions between **Man (من - 40 kg default, configurable)**, **Kg (کلو)**, **Ton (ٹن)**, and **Peti/Crate (پیٹی - custom weight per crop)**.
  - Transparent commission and market fee calculations (all rates fully user-editable, clearly labeled as SAMPLE seeds).
  - Voice-guided readout in Urdu with one-tap audio recitation for every slip and ledger entry.
  - Complete offline resilience and home-screen installability.

---

## 2. User Experience & Visual Design

### A. Low-Literacy, High-Sunlight Mobile-First Ergonomics
- **Touch Target Standard**: Minimum **56px** tap hitboxes for all interactive buttons, thumb-accessible in outdoor field conditions with single-handed thumb reach.
- **Typography & Script Handling**:
  - Urdu font stack (`Noto Nastaliq Urdu`, `Gulzar`, system Arabic fonts) in full Right-to-Left (RTL) mode by default.
  - Roman Urdu and English toggles with strict bidirectional isolation (`<bdi>` and `dir="ltr"` wrappers for phone numbers, weights, and PKR numerals to prevent number reversal bugs).
  - Large body text (**18px+** base scale) with high contrast text colors (`#111827` on warm parchment `#FBF9F1` / `#FFFDF5`).
- **One Dominant Action Per Screen**: Clear tactile primary action button (e.g. "نئی پرچی بنائیں" / "Create New Slip") pinned in the thumb comfort zone.
- **Persistent 5-Tab Navigation Bar**:
  1. **Home (شروع / ہوم)**: Daily mandi summary, role switcher, rapid slip generation buttons, audio briefing.
  2. **Khata (کھاتہ)**: Traditional Bahi-Khata ledger (Debit/Credit, Naam/Jamma) filterable by party.
  3. **Slips (پرچیاں)**: Filterable list of paper receipts (Boli, Kanta, Storage, Transport) with stamp views.
  4. **Rates (ریٹس و منڈی)**: Today's mandi rate board, configurable commission %, kanta fee, and man weight.
  5. **More (مزید)**: Language toggle, audio speech tester, backup/export data, PWA install prompt, help guide.

### B. Paper Form Replica Aesthetics
- **Physical Ledger Styling**: Render digital forms and slips to replicate authentic South Punjab mandi stationery:
  - Textured parchment background with delicate red/blue margin rules (`border-red-300`, `border-amber-200`).
  - Perforated top receipt tear-lines (`border-dashed border-t-2`).
  - Traditional Urdu Mandi Stamp / Seal ("مہر تصدیق - منظور شدہ") in deep indigo/crimson with date and signature area.
  - Two-column Pakistani debit/credit table ("بنام" / "جمع").

### C. Voice Accessibility & Multimodal Readout
- Floating / inline tactile speaker icon on every screen (`🔊 سنیں`).
- Speaks the screen summary: Party name, commodity, net weight in man/kg, total PKR amount, and balance due.
- Real-time animated audio wave bar with high-contrast text caption transcript.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Storage Layer Architecture**:
  - *Chosen Approach*: Repository Pattern with independent entity modules (`PartyRepository`, `SlipRepository`, `LedgerRepository`, `SettingsRepository`) backed by a robust `LocalStorageAdapter` with synchronous schema validation and sample seed data.
  - *Why*: Allows instantaneous zero-latency offline performance and lets the app be swapped effortlessly for PostgreSQL / Cloud SQL or Firestore without touching UI components.
  - *Alternatives Considered*: Direct in-memory state (lost on reload) or immediate remote DB (inoperable when offline in rural fields).
- **Decision 2: Multilingual Script Isolation**:
  - *Chosen Approach*: Comprehensive `LanguageContext` supporting `ur` (Urdu RTL), `ur-Latn` (Roman Urdu LTR), and `en` (English LTR). Numerical strings, units, and dates are wrapped in `<bdi>` elements with locale-aware Pakistani rupee formatting (`Rs. 1,50,000` lakh grouping).
  - *Why*: Solves the notorious Arabic/Urdu RTL cursor jumping and reversed punctuation/bracket errors in mixed text.
- **Decision 3: Unit Conversion Engine**:
  - *Chosen Approach*: Centralized `unitConverter.ts` helper that treats base weight in kilograms, allowing instant on-the-fly toggling between Kg, Man (default 40kg or custom 40.85kg Multan standard), Metric Tons, and Fruit Crates (e.g. 10kg Chaunsa wooden peti).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   APNA KHATA CLIENT APP (Vite + React)                │
│                                                                        │
│  ┌─────────────────────── App State & Contexts ─────────────────────┐  │
│  │ • LanguageContext (Urdu RTL / Roman / English)                    │  │
│  │ • RoleContext (Farmer, Arhti, Cold Storage, Transporter, Buyer)   │  │
│  │ • AudioSpeechContext (Web Speech synthesis + visual captions)     │  │
│  │ • OnlineStatusContext & PWA Install Manager                       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌───────────────────────── Screen Views ────────────────────────────┐  │
│  │ 1. HomeView       : Mandi briefing, quick slip buttons, KPIs      │  │
│  │ 2. KhataView      : Party debit/credit ledgers, statement stamps  │  │
│  │ 3. SlipsView      : Boli, Kanta, Storage, Freight digital parchis │  │
│  │ 4. RatesView      : Crop market rates, commission & weight config │  │
│  │ 5. MoreView       : Settings, data backup/reset, PWA installer    │  │
│  │ 6. IntroModal     : 3-step illustrated first-run onboarding       │  │
│  │ 7. SlipCreateModal: Authentic paper slip form with live math      │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌─────────────────────── Repository Layer ─────────────────────────┐  │
│  │ • PartyRepository    (Farmers, Arhtis, Traders, Transporters)     │  │
│  │ • SlipRepository     (Boli, Kanta, Challan, Transport receipts)   │  │
│  │ • LedgerRepository   (Debit/Credit transaction entries)           │  │
│  │ • SettingsRepository (Crop rates, commission %, unit man config)  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌────────────────────── Storage & Offline PWA ──────────────────────┐  │
│  │ • LocalStorage Engine with Schema Migration & SAMPLE Seed Data    │  │
│  │ • Service Worker (vite-plugin-pwa) + Web App Manifest             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Node.js Express Server (server.ts)                     │
│  • Static asset serving & health routes                                │
│  • Clean proxy boundary ready for future remote database/sync hooks    │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & Repositories

1. **Party**:
   - `id`: string, `name`: string, `role`: `farmer` | `arhti` | `cold_storage` | `transporter` | `buyer`
   - `village`: string, `phone`: string (fake sample e.g. 0300-5550192)
   - `currentBalance`: number (positive = payable, negative = receivable)
2. **Slip (پرچی)**:
   - `id`: string, `slipNumber`: string, `type`: `boli` (Auction) | `kanta` (Scale) | `challan` (Storage) | `transport` (Freight)
   - `date`: string (DD/MM/YYYY)
   - `partyId`: string, `partyName`: string
   - `commodity`: `mango` | `citrus` | `dates` | `cotton`
   - `grossWeight`: number, `tareWeight`: number, `netWeight`: number, `unit`: `kg` | `man` | `ton` | `peti`
   - `unitPricePKR`: number, `grossAmountPKR`: number
   - `deductions`: { commissionPKR: number; kantaFeePKR: number; laborFeePKR: number; freightPKR: number }
   - `netPayablePKR`: number
   - `notes`: string, `stampVerified`: boolean
3. **LedgerEntry (کھاتہ اندراج)**:
   - `id`: string, `date`: string, `partyId`: string, `description`: string, `debitPKR`: number, `creditPKR`: number, `balancePKR`: number
4. **Settings & Rates**:
   - `manKgWeight`: default `40`, `commissionPercent`: default `4.0`
   - `kantaFeeDefaultPKR`: `300`
   - `cropRates`: { mango: 4500, citrus: 2200, dates: 6800, cotton: 8500 } per man

---

## 5. Implementation Sequence & Next Steps

1. Configure PWA manifest, service worker (`vite-plugin-pwa`), icons, and HTML metadata for "Apna Khata | اپنا کھاتہ".
2. Set up constant app branding, localization dictionaries (`ur`, `ur-Latn`, `en`), and speech synthesis engine with visual narration pill.
3. Construct the repository data layer (`storageAdapter.ts`, `partyRepository.ts`, `slipRepository.ts`, `ledgerRepository.ts`, `settingsRepository.ts`, `sampleData.ts`).
4. Build the core UI components:
   - Role switcher badge & header bar with 5 supply-chain roles.
   - Mandi ledger paper slip simulator (red-line parchment, stamps, tear headers).
   - High-contrast 56px touch target forms with auto weight-to-PKR computation.
   - Five interactive tab views: Home, Khata, Slips, Rates, More.
   - Illustrated 3-step first-run onboarding walkthrough modal.
   - Offline detection banner and PWA install button.
   - Fixed legal footer note: *"Records here are for personal bookkeeping and are not official receipts."*
5. Set up the Express server (`server.ts`) for clean full-stack deployment.
6. Verify build compilation (`compile_applet`) and run test validation.
