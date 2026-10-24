# Apna Khata Security Specification (ABAC & Zero-Trust)

## 1. Data Invariants
1. **User Identity Invariant**: A user profile document `/users/{userId}` can only be created or modified if `request.auth.uid == userId`.
2. **Privacy & No ID Harvesting**: CNIC, national ID cards, and financial credentials are strictly forbidden. Only `name`, `phone`, `role`, and `district` are collected with explicit consent.
3. **Role Segregation & Multi-Party Visibility**:
   - `sale_slips` can only be read or written by participating parties (`participantUids` contains `request.auth.uid`, or `createdBy == request.auth.uid`, or Admin).
   - `khata_entries` can only be accessed by the involved farmer and arhti.
   - `cold_storage_items` & `cold_storage_bookings` are restricted to the operator and the depositor farmer.
   - `bilties` are restricted to the transporter, sender, and receiver.
4. **Public QR Non-Sensitive Isolation**:
   - Public scan verification documents `/public_verifications/{id}` expose exclusively non-sensitive trade metrics (serial number, commodity, variety, grade, weight, active status).
   - Unauthenticated visitors can execute single `get` queries by ID to verify a paper slip QR code, but blanket `list` enumeration is strictly forbidden.
5. **Admin Access Invariant**: Admin role is reserved for operators management and basic counts, bootstrapped with verified developer email `zubairdev0@gmail.com`.

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Identity Spoofing in User Profile**
   - Attempt: Auth user `uid_farmer_1` attempts to write to `/users/uid_arhti_9`.
   - Result: `PERMISSION_DENIED`.
2. **Payload 2: Self-Admin Privilege Escalation**
   - Attempt: User attempts to create profile with `isAdmin: true` or update `isVerified: true` without admin credentials.
   - Result: `PERMISSION_DENIED`.
3. **Payload 3: Uninvolved Third Party Spying on Private Khata**
   - Attempt: User `uid_stranger` queries `/khata_entries/entry_123` where `participantUids` is `['uid_farmer', 'uid_arhti']`.
   - Result: `PERMISSION_DENIED`.
4. **Payload 4: Shadow Field Injection in Sale Slip**
   - Attempt: Attendant submits unauthorized ghost fields or deletes deductions unilaterally.
   - Result: `PERMISSION_DENIED`.
5. **Payload 5: ID Poisoning Attack**
   - Attempt: Attacker passes 2KB junk character string for `{slipId}` or `{userId}`.
   - Result: `PERMISSION_DENIED` via `isValidId()`.
6. **Payload 6: Public List Scraping**
   - Attempt: Unauthenticated bot tries `list` on `/public_verifications` to harvest all mandi sales.
   - Result: `PERMISSION_DENIED` (`allow list: if false`).
7. **Payload 7: Unauthenticated Read of User Profiles**
   - Attempt: Reading `/users/{userId}` without valid authenticated session.
   - Result: `PERMISSION_DENIED`.
8. **Payload 8: Altering Created Slip Originator**
   - Attempt: Updating `createdBy` or `serialNumber` on an active slip.
   - Result: `PERMISSION_DENIED`.
9. **Payload 9: Modifying Closed/Cancelled Slip Balances**
   - Attempt: Modifying ledger values on an already locked/cancelled transaction.
   - Result: `PERMISSION_DENIED`.
10. **Payload 10: Denial of Wallet Oversized String Injection**
    - Attempt: Submitting 5MB string for `notes` or `description`.
    - Result: `PERMISSION_DENIED` (all text fields guarded by `.size() <= MAX`).
11. **Payload 11: Non-Operator Approving Cold Storage Booking**
    - Attempt: A farmer attempts to accept their own booking status as `accepted`.
    - Result: `PERMISSION_DENIED`.
12. **Payload 12: Deleting Other User's Khata Record**
    - Attempt: Stranger attempts `delete` on another person's ledger.
    - Result: `PERMISSION_DENIED`.
