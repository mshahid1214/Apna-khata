/**
 * Core Domain Types for Apna Khata | اپنا کھاتہ
 */

export type Language = 'ur' | 'ur-Latn' | 'en';

export type Role = 'farmer' | 'arhti' | 'cold_storage' | 'transporter' | 'buyer';

export interface UserProfile {
  id: string; // Auth UID
  name: string; // Name (نام)
  phone: string; // Phone (فون نمبر)
  role: Role; // Role (کردار)
  district: string; // District (ضلع) e.g. Multan, Khanewal, Bahawalpur
  consentAccepted: boolean; // Explicit Privacy consent agreement
  consentDate: string; // Date of consent
  isVerified?: boolean; // Verified badge for cold storage operators / arhtis
  email?: string; // Optional if signed in via Google
  createdAt: string;
  updatedAt?: string;
}

export interface PublicVerificationRecord {
  id: string; // Unique public lookup key (e.g. slip-{id} or lot-{id})
  type: 'slip' | 'lot';
  identifier: string; // e.g. SLP-2026-0482 or LOT-2026-0842
  title: string;
  date: string;
  commodity: Commodity | string;
  variety: string;
  grade?: string;
  quantity: number;
  unit: WeightUnit | string;
  status: string;
  netPayable?: number;
  isVerified: boolean;
  createdAt: string;
}

export type Commodity = 'mango' | 'citrus' | 'dates' | 'cotton';

export type WeightUnit = 'kg' | 'man' | 'ton' | 'peti';

export type SlipType = 'boli' | 'kanta' | 'challan' | 'transport';

export interface Party {
  id: string;
  name: string;
  nameUr?: string;
  role: Role;
  village: string;
  phone: string;
  currentBalance: number; // Positive = Payable (ہم نے دینے ہیں), Negative = Receivable (ہم نے لینے ہیں)
  createdAt: string;
  isSample: boolean;
  ownerUid?: string;
}

export interface SlipDeductions {
  commissionPercent: number;
  commissionPKR: number;
  kantaFeePKR: number;
  laborFeePKR: number;
  freightPKR: number;
  advanceAdjustedPKR: number;
}

export interface Slip {
  id: string;
  slipNumber: string;
  type: SlipType;
  date: string; // DD/MM/YYYY
  partyId: string;
  partyName: string;
  partyRole: Role;
  commodity: Commodity;
  variety: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  unit: WeightUnit;
  petiWeightKg?: number;
  ratePerUnitPKR: number;
  grossAmountPKR: number;
  deductions: SlipDeductions;
  netPayablePKR: number;
  notes?: string;
  stampVerified: boolean;
  vehicleNumber?: string;
  storageChamber?: string;
  isSample: boolean;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string; // DD/MM/YYYY
  partyId: string;
  partyName: string;
  slipId?: string;
  description: string;
  debitPKR: number; // بنام (Paid out / cash advance / debit)
  creditPKR: number; // جمع (Received produce value / credit)
  balancePKR: number;
  isSample: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// KHATA MODULE TYPES (Farmer & Arhti Bahi)
// -------------------------------------------------------------

export type KhataEntryType =
  | 'advance_cash'     // پیشگی رقم / ادھار
  | 'input_item'      // زرعی ضروریات (کھاد، بیج، سپرے)
  | 'sale_proceed'    // فصل فروخت آمدن
  | 'payment_received'// نقد وصولی / واپسی ادائیگی
  | 'deduction';      // کٹوتی (کمیشن، پلائی، منڈی فیس، کرایہ)

export type KhataFlowType = 'given' | 'received'; // given = بنام (دیا), received = جمع (لیا)

export interface KhataInputDetails {
  itemCategory: 'fertilizer' | 'seed' | 'spray' | 'diesel' | 'other';
  itemName: string;
  quantity: number;
  unit: string; // مثلاً بوری، کلو، لیٹر، پیکٹ
  ratePerUnitPKR?: number;
}

export interface KhataDeductionDetails {
  commissionPKR?: number;
  laborPKR?: number;
  marketFeePKR?: number;
  transportPKR?: number;
  otherFeePKR?: number;
}

export interface EditAuditRecord {
  id: string;
  editedByRole: Role;
  editedByName: string;
  timestamp: string; // e.g. "24/10/2026, 11:30 AM"
  previousAmount: number;
  newAmount: number;
  previousDescription: string;
  changeSummary: string;
}

export interface KhataEntry {
  id: string;
  date: string; // DD/MM/YYYY
  farmerId: string;
  farmerName: string;
  arhtiId: string;
  arhtiName: string;
  entryType: KhataEntryType;
  flowType: KhataFlowType;
  description: string;
  amountPKR: number;
  debitPKR: number;  // بنام (Given / Advance / Input / Deduction)
  creditPKR: number; // جمع (Received / Crop Sale / Repayment)
  runningBalancePKR: number;
  season: string; // مثلاً "خریف 2026 (کپاس)", "سیزن آم 2026", "ربیع 2026 (گندم)"
  inputDetails?: KhataInputDetails;
  deductionDetails?: KhataDeductionDetails;
  notes?: string;
  photoUrl?: string; // اختیاری تصویر برائے کاغذی پرچی
  farmerConfirmed: boolean;
  farmerConfirmedAt?: string;
  arhtiConfirmed: boolean;
  arhtiConfirmedAt?: string;
  history: EditAuditRecord[];
  isSample: boolean;
  participantUids?: string[];
  createdBy?: string;
  createdAt: string;
}

export interface CommodityRateInfo {
  nameUr: string;
  nameLatn: string;
  nameEn: string;
  ratePerManPKR: number;
  marketTrend: 'up' | 'down' | 'stable';
  varieties: string[];
}

export interface RateSettings {
  manKgWeight: number; // Default 40 kg, configurable
  defaultCommissionPercent: number; // Default 4.0%
  defaultKantaFeePKR: number; // Default 300 PKR
  defaultLaborPerManPKR: number; // Default 25 PKR
  cropRates: Record<Commodity, CommodityRateInfo>;
}

// -------------------------------------------------------------
// SALE SLIP MODULE TYPES (Mandi Auction & Sale Parchi)
// -------------------------------------------------------------

export interface SaleSlipDeductions {
  commissionPercent: number; // User-entered (no default assumption)
  commissionPKR: number;     // Auto-calculated: grossAmount * (commissionPercent / 100)
  laborPKR: number;          // User-entered (مزدوری / پلائی)
  marketFeePKR: number;      // User-entered (منڈی فیس / ٹیکس)
  transportPKR: number;      // User-entered (کرایہ مال برداری)
  otherDeductionPKR: number; // User-entered (دیگر کٹوتی)
  otherDescription?: string;
}

export interface SlipVersionRecord {
  id: string;
  timestamp: string;
  editedByRole: Role;
  editedByName: string;
  changeSummary: string;
  previousGross: number;
  previousNet: number;
}

export interface SaleSlip {
  id: string;
  serialNumber: string; // e.g. "SLP-2026-0482"
  date: string; // DD/MM/YYYY
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  arhtiId: string;
  arhtiName: string;
  commodity: Commodity;
  variety: string;
  grade: string;
  crateCount: number; // تعداد پیٹی / بوریاں / توڑے
  unit: WeightUnit;
  grossWeight: number;
  tareWeight: number;
  netWeight: number; // Auto: grossWeight - tareWeight
  ratePerUnit: number;
  grossAmount: number; // Auto: calculated
  deductions: SaleSlipDeductions;
  totalDeductions: number; // Auto: sum of deductions
  netPayable: number; // Auto: grossAmount - totalDeductions
  notes?: string;
  status: 'active' | 'cancelled';
  cancelledReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  isLinkedToKhata: boolean;
  linkedKhataEntryId?: string;
  history: SlipVersionRecord[];
  participantUids?: string[];
  createdBy?: string;
  isSample: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// LOT & TIMELINE TRACEABILITY MODULE TYPES
// -------------------------------------------------------------

export type LotStage = 'harvested' | 'graded' | 'stored' | 'loaded' | 'delivered';

export interface LotTimelineEvent {
  id: string;
  stage: LotStage;
  stageTitleUr: string;
  stageTitleEn: string;
  timestamp: string; // e.g. "24/10/2026، 07:30 صبح"
  location: string;  // e.g. "باغ چک 18-WB، وہاڑی"
  gpsPin?: string;   // e.g. "30.1575° N, 71.5249° E"
  recordedBy: string; // e.g. "حاجی غلام رسول (کسان)"
  recordedByRole: Role;
  notes?: string;
  photoUrl?: string; // اختیاری تصویر
  biltyId?: string;  // اگر بلٹی سے لنک ہو
  isSample: boolean;
}

export interface Lot {
  id: string;
  lotNumber: string; // e.g. "LOT-2026-0842"
  farmerId: string;
  farmerName: string;
  crop: Commodity;
  variety: string;
  grade: string; // e.g. "درجہ اول (Grade A)"
  quantity: number;
  unit: WeightUnit;
  harvestDate: string; // DD/MM/YYYY
  farmName: string; // e.g. "الفرید مینگو آرچرڈ، شجاع آباد"
  farmGpsPin?: string; // اختیاری GPS پن مثلاً 29.88° N, 71.31° E
  notes?: string;
  timeline: LotTimelineEvent[];
  qrCodeUrl?: string;
  participantUids?: string[];
  isSample: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// BILTY (CONSIGNMENT NOTE) MODULE TYPES (Transporter)
// -------------------------------------------------------------

export interface Bilty {
  id: string;
  biltyNumber: string; // e.g. "BLT-2026-0315"
  date: string; // DD/MM/YYYY
  transporterUid?: string;
  senderName: string;
  senderPhone?: string;
  receiverName: string;
  receiverPhone?: string;
  lotIds: string[]; // Linked Lot IDs
  lotSummary: string; // e.g. "آم چونسا گریڈ A - 250 پیٹی"
  vehicleNumber: string; // e.g. "FSD-7812 (شاہ زور)"
  driverName: string; // e.g. "محمد بوٹا ڈرائیور"
  driverPhone?: string;
  origin: string; // e.g. "شجاع آباد، ملتان"
  destination: string; // e.g. "بادامی باغ غلہ و فروٹ منڈی، لاہور"
  quantity: number;
  unit: WeightUnit;
  freightPKR: number; // کل کرایہ
  advancePaidPKR: number; // پیشگی کرایہ
  balancePayablePKR: number; // بقایا واجب الادا عند الوصول
  signatureDataUrl?: string; // ڈیجیٹل دستخط تصویر (Canvas)
  signedAt?: string;
  signedByName?: string;
  status: 'loaded' | 'in_transit' | 'delivered';
  deliveredAt?: string;
  notes?: string;
  participantUids?: string[];
  isSample: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// COLD STORAGE MODULE TYPES (Operator & Farmer Booking)
// -------------------------------------------------------------

export interface ColdStorageChamber {
  id: string;
  name: string; // e.g. "چیمبر 1 - آم و کینو"
  capacityTons: number;
  usedTons: number;
  tempCelsius: string; // e.g. "+10°C تا +12°C"
}

export interface ColdStorageFacility {
  id: string;
  name: string; // e.g. "الحمد کولڈ اسٹوریج، خانیوال بائی پاس"
  location: string; // e.g. "خانیوال بائی پاس، پنجاب"
  operatorName: string; // e.g. "حاجی بشیر احمد"
  operatorPhone: string; // e.g. "0300-7654321"
  operatorUid?: string;
  isVerified?: boolean;
  totalCapacityTons: number; // e.g. 500
  currentUsedTons: number; // e.g. 310
  tempRange: string; // e.g. "0°C تا +12°C"
  ratePerTonPerDayPKR: number; // e.g. 180 (قابل تدوین)
  chambers: ColdStorageChamber[];
  notes?: string;
  isSample: boolean;
}

export interface ColdStorageInventoryItem {
  id: string;
  facilityId: string;
  operatorUid?: string;
  inwardReceiptNumber: string; // e.g. "CSR-2026-0104"
  farmerId?: string;
  farmerName: string; // e.g. "حاجی غلام فرید"
  farmerPhone?: string;
  lotId?: string; // اختیاری زرعی لاٹ
  lotNumber?: string;
  commodity: Commodity;
  variety: string;
  initialQuantityTons: number; // کل موصول شدہ مقدار (ٹن)
  currentRemainingTons: number; // موجودہ بقایا مقدار (ٹن)
  dateIn: string; // DD/MM/YYYY
  chamberRack: string; // e.g. "چیمبر 1، ریک B-3"
  conditionNotes: string; // e.g. "پھل تازہ، نمی 85%، کوئی بیماری نہیں"
  ratePerTonPerDayPKR: number; // یومیہ کرایہ فی ٹن
  status: 'active' | 'cleared';
  participantUids?: string[];
  createdAt: string;
  isSample: boolean;
}

export interface ColdStorageGatePass {
  id: string;
  gatePassNumber: string; // e.g. "CSG-2026-0042"
  inventoryItemId: string;
  facilityId: string;
  operatorUid?: string;
  farmerName: string;
  lotId?: string;
  lotNumber?: string;
  commodity: Commodity;
  variety: string;
  quantityOutTons: number; // نکالی گئی مقدار (ٹن)
  remainingStockTons: number; // بقایا مال (ٹن)
  dateIn: string; // DD/MM/YYYY
  dateOut: string; // DD/MM/YYYY
  daysStored: number; // ذخیرہ کے کل دن
  ratePerTonPerDayPKR: number; // یومیہ کرایہ ریٹ
  totalRentPKR: number; // کل کرایہ (quantityOut * daysStored * ratePerDay)
  receiverOrDriver: string; // وصول کنندہ یا ڈرائیور کا نام
  vehicleNumber?: string; // گاڑی کا نمبر
  notes?: string;
  participantUids?: string[];
  createdAt: string;
  isSample: boolean;
}

export type BookingStatus = 'pending' | 'accepted' | 'declined';

export interface ColdStorageBookingRequest {
  id: string;
  bookingNumber: string; // e.g. "BKG-2026-0019"
  facilityId: string;
  facilityName: string;
  operatorUid?: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  commodity: Commodity;
  variety: string;
  requestedTons: number;
  requestedStartDate: string; // DD/MM/YYYY
  estimatedDurationDays: number;
  notes?: string;
  status: BookingStatus;
  responseNotes?: string;
  respondedAt?: string;
  participantUids?: string[];
  createdAt: string;
  isSample: boolean;
}



