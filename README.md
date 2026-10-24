<<<<<<< HEAD
# Apna Khata | اپنا کھاتہ
### Mobile-First Mandi Ledger & Shared Cloud Database for South Punjab Agricultural Supply Chain

Apna Khata digitizes traditional Pakistani Mandi paper slips, *bahi-khata* ledgers, and cold storage booking records for the South Punjab crop belt (Multan, Khanewal, Bahawalpur, Rahim Yar Khan, Vehari, Lodhran, Muzaffargarh).

---

## 1. Shared Database Architecture & Multi-Party Synchronization

The application uses Google Cloud Firestore for real-time cloud data sharing between all mandi participants while maintaining an offline-first cache via `StorageAdapter`:

1. **Farmer & Arhti Collaboration**:
   - When an **Arhti (آڑھتی)** issues an auction sale slip or records an advance input item, it writes to Firestore collection `sale_slips` and `khata_entries` with `participantUids: [farmerId, arhtiId]`.
   - When the **Farmer (کسان)** logs into their device, they instantly see the exact same transaction, can review deductions, and tap to confirm or flag disputes.
2. **Cold Storage Booking & Operator Verification**:
   - When a farmer creates a storage booking reservation (`cold_storage_bookings`), the **Cold Storage Operator (کولڈ اسٹوریج آپریٹر)** receives the booking on their dashboard in real-time, can allocate chamber rack space, and issue digitally stamped outward gate passes (`cold_storage_gate_passes`).
3. **Traceability & Public QR Verification**:
   - Slips and lots generate cryptographically linked public records in `public_verifications/{id}` containing only non-sensitive metrics for third-party cargo inspectors and retail consumers scanning physical QR codes.

---

## 2. Firestore Database Schema

The database schema is defined in `firebase-blueprint.json` and enforced in `firestore.rules`:

### Collections Overview

| Collection Path | Entity | Purpose & Access Boundary |
|---|---|---|
| `/users/{userId}` | `UserProfile` | Profile details (name, phone, role, district, consent). Accessible strictly by owner or Admin. |
| `/sale_slips/{slipId}` | `SaleSlip` | Mandi auction sale slips shared between participating farmer, arhti, and buyer. |
| `/khata_entries/{entryId}` | `KhataEntry` | Double-entry bahi ledger entries between farmer and arhti with edit audit trail. |
| `/cold_storage_items/{itemId}` | `ColdStorageInventory` | Stored inventory in cold rooms; accessible to facility operator and depositor. |
| `/cold_storage_gate_passes/{gatePassId}` | `ColdStorageGatePass` | Outward exit gate passes and storage rental charges. |
| `/cold_storage_bookings/{bookingId}` | `ColdStorageBooking` | Space booking reservations between farmers and cold storage operators. |
| `/bilties/{biltyId}` | `Bilty` | Transport consignment notes with driver, route, and digital signatures. |
| `/lots/{lotId}` | `Lot` | Crop harvest lot passports with append-only supply chain milestone events. |
| `/parties/{partyId}` | `Party` | Address book of farmers, buyers, and commission agents per user. |
| `/public_verifications/{verificationId}` | `PublicVerification` | Non-sensitive public certificate records for QR scanning. |
| `/admins/{adminId}` | `AdminRole` | Existence check for administrator privileges. |

### Data Model Definitions

#### `UserProfile` (`/users/{userId}`)
- `id` (string, required): Firebase Auth UID.
- `name` (string, required, max 100 chars): Full legal or commercial name (e.g. حاجی غلام رسول).
- `phone` (string, required, max 30 chars): Pakistani phone number (e.g. `+92 300 1234567`).
- `role` (enum, required): `'farmer' | 'arhti' | 'cold_storage' | 'transporter' | 'buyer'`.
- `district` (string, required, max 50 chars): South Punjab district (e.g. Multan, Khanewal, Bahawalpur).
- `consentAccepted` (boolean, required): Must be `true` (explicit GDPR/privacy consent).
- `consentDate` (string, required): Timestamp when consent was acknowledged.
- `isVerified` (boolean, optional): Admin verification status for operators and arhtis.
- `email` (string, optional): Email if Google sign-in was used.

#### `SaleSlip` (`/sale_slips/{slipId}`)
- `id` (string, required): Unique document ID.
- `serialNumber` (string, required): e.g. `SLP-2026-0482`.
- `date` (string, required): Trade date (DD/MM/YYYY).
- `farmerId`, `farmerName` (string): Selling farmer details.
- `arhtiId`, `arhtiName` (string): Commission agent and mandi shop details.
- `buyerId`, `buyerName` (string): Buyer / trader details.
- `commodity` (enum): `'mango' | 'citrus' | 'dates' | 'cotton'`.
- `variety` (string): e.g. چونسہ سفید (White Chaunsa), کنو (Kinnow).
- `grade` (string): e.g. درجہ اول (Grade A).
- `netWeight` (number): Tare-deducted net weight.
- `netPayable` (number): Gross sale proceed minus mandi deductions (commission, kanta, labor, freight).
- `status` (enum): `'active' | 'cancelled'`.
- `participantUids` (array of strings): Authorized UIDs and phone numbers allowed to read/write this slip.
- `createdBy` (string): UID of the creating user.

#### `PublicVerification` (`/public_verifications/{verificationId}`)
- Exclusively holds non-sensitive data for QR scanning:
  - `id`: e.g. `slip-SLP-2026-0482` or `lot-LOT-2026-0842`.
  - `type`: `'slip' | 'lot'`.
  - `identifier`: Serial or lot number.
  - `title`: e.g. "منڈی رسید تصدیقی سند".
  - `date`: Issuance date.
  - `commodity`, `variety`, `grade`.
  - `quantity`, `unit`.
  - `status`: `'active' | 'cancelled'`.
  - `netPayable`: Final trade value (no commission breakdown or banking details).
  - `isVerified`: `true`.
  - **No CNIC, No personal phone numbers, No internal bahi notes.**

---

## 3. Security Rules & Access Control (ABAC & Zero-Trust)

The application implements Attribute-Based Access Control in `firestore.rules`:

### 1. Default-Deny Catch-All
```javascript
match /{document=**} {
  allow read, write: if false;
}
```

### 2. Participant Boundary Check (`isParticipant`)
A user can only read or write transaction documents if their UID or verified phone number is included in `participantUids`, or if they created the record:
```javascript
function isParticipant(data) {
  return (
    request.auth.uid in data.participantUids ||
    ('createdBy' in data && data.createdBy == request.auth.uid) ||
    ('operatorUid' in data && data.operatorUid == request.auth.uid) ||
    ('farmerId' in data && data.farmerId == request.auth.uid) ||
    ('transporterUid' in data && data.transporterUid == request.auth.uid) ||
    (request.auth.token.phone_number != null && request.auth.token.phone_number in data.participantUids)
  );
}
```

### 3. Public QR Verification Rule
- Unauthenticated visitors scanning a QR code are allowed a single `get` by exact ID.
- Blanket `list` queries are strictly prohibited (`allow list: if false;`) to prevent automated scrapers from enumerating transaction data.
```javascript
match /public_verifications/{verificationId} {
  allow get: if isValidId(verificationId);
  allow list: if false;
  allow create, update: if isSignedIn() && isValidId(verificationId);
  allow delete: if isAdmin();
}
```

### 4. Admin Privileges
Admin access is secured and bootstrapped for `zubairdev0@gmail.com` and documents in `/admins/{adminId}`:
```javascript
function isAdmin() {
  return isSignedIn() && (
    request.auth.token.email == 'zubairdev0@gmail.com' ||
    exists(/databases/$(database)/documents/admins/$(request.auth.uid))
  );
}
```

---

## 4. Authentication & Privacy Safeguards

### Authentication Flow
1. **Phone Number Sign-In with OTP**:
   - Supports Pakistani numbers (`+92 3XX XXXXXXX`) with 6-digit verification code.
   - Pre-configured dev test accounts for instant role-based testing:
     - `+92 300 1234567` (OTP: `123456`) — حاجی غلام رسول (Farmer, Multan)
     - `+92 301 7654321` (OTP: `123456`) — ملک فاروق آڑھتی (Arhti, Khanewal)
     - `+92 302 9876543` (OTP: `123456`) — بشیر احمد (Cold Storage Operator, Vehari)
2. **Google Sign-In Fallback**:
   - Available as a one-tap fallback for verified Google accounts.
3. **Role Persistence**:
   - Roles (`farmer`, `arhti`, `cold_storage`, `transporter`, `buyer`) are stored in the user profile document in Firestore and synchronized with the frontend role context.

### Privacy Compliance & Data Rights
- **Data Minimization**: The application explicitly collects only **name**, **phone**, **role**, and **district**.
- **No National ID Harvesting**: Collecting CNIC, National Identity Cards, or personal identity numbers is strictly prohibited by design.
- **Explicit Consent**: A mandatory consent checkbox must be accepted before account registration or profile update.
- **Export My Data (CSV)**: Generates a comprehensive CSV export of all user slips, khata records, lots, bilties, and bookings with UTF-8 BOM encoding for seamless viewing in Excel.
- **Delete My Account & Data**: Permanently deletes the user's Firestore profile, personal records, and clears client cache.

---

## 5. PIN-Protected Admin Console

An administrative portal is accessible via the Header shield icon or the More Settings tab:
- **PIN Protection**: Protected by PIN code `7860`.
- **System Metrics**:
  - Live count of registered users, breakdown by role (Farmers, Arhtis, Operators, Transporters, Buyers).
- **Operator Verification Console**:
  - Displays registered cold storage facilities and commission agents.
  - Allows admins to verify or revoke operator status (`isVerified: true/false`), issuing a certified mandi trust badge to approved facilities.
=======
# Hackertoberfest
>>>>>>> 9334c30579413398c8b57774fbc41c9b0a9447b1
