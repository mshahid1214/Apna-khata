import {
  ColdStorageFacility,
  ColdStorageInventoryItem,
  ColdStorageGatePass,
  ColdStorageBookingRequest,
  BookingStatus,
} from '../types';
import { storageAdapter } from './storageAdapter';
import { lotRepository } from './lotRepository';

const FACILITIES_KEY = 'apna_khata_cold_facilities_v1';
const INVENTORY_KEY = 'apna_khata_cold_inventory_v1';
const GATE_PASSES_KEY = 'apna_khata_cold_gatepasses_v1';
const BOOKINGS_KEY = 'apna_khata_cold_bookings_v1';

export const INITIAL_SAMPLE_FACILITIES: ColdStorageFacility[] = [
  {
    id: 'facility-1',
    name: 'الحمد کولڈ اسٹوریج و پری کولنگ سینٹر، خانیوال',
    location: 'خانیوال بائی پاس، نزد فروٹ منڈی، پنجاب',
    operatorName: 'حاجی بشیر احمد',
    operatorPhone: '0300-7654321',
    totalCapacityTons: 500,
    currentUsedTons: 320,
    tempRange: '0°C تا +12°C',
    ratePerTonPerDayPKR: 180,
    notes: 'جدید امپورٹڈ کمپریسرز، 24 گھنٹے جنریٹر بیک اپ، پھلوں کی مٹھاس اور تازگی برقرار رکھنے کا بااعتماد ادارہ۔',
    isSample: true,
    chambers: [
      {
        id: 'ch-1',
        name: 'چیمبر 1 - آم و موسمی پھل',
        capacityTons: 200,
        usedTons: 140,
        tempCelsius: '+10°C تا +12°C',
      },
      {
        id: 'ch-2',
        name: 'چیمبر 2 - ترشاوہ و مالٹا',
        capacityTons: 150,
        usedTons: 100,
        tempCelsius: '+4°C تا +6°C',
      },
      {
        id: 'ch-3',
        name: 'چیمبر 3 - آلو و سبزیاں',
        capacityTons: 150,
        usedTons: 80,
        tempCelsius: '+2°C تا +4°C',
      },
    ],
  },
  {
    id: 'facility-2',
    name: 'رحیم یار خان سٹرس و کھجور کولڈ اسٹوریج',
    location: 'نیشنل ہائی وے بائی پاس، رحیم یار خان',
    operatorName: 'چوہدری اکرم گجر',
    operatorPhone: '0302-9876543',
    totalCapacityTons: 800,
    currentUsedTons: 460,
    tempRange: '-2°C تا +10°C',
    ratePerTonPerDayPKR: 165,
    notes: 'سٹرس ایکسپورٹ پروسیسنگ اور کنٹرولڈ اٹموسفیئر کی اعلیٰ سہولت۔',
    isSample: true,
    chambers: [
      {
        id: 'ch-21',
        name: 'چیمبر A - کھجور و خشک میوہ',
        capacityTons: 300,
        usedTons: 190,
        tempCelsius: '-2°C تا 0°C',
      },
      {
        id: 'ch-22',
        name: 'چیمبر B - کینو و لیموں',
        capacityTons: 300,
        usedTons: 180,
        tempCelsius: '+4°C تا +6°C',
      },
      {
        id: 'ch-23',
        name: 'چیمبر C - جنرل اسٹوریج',
        capacityTons: 200,
        usedTons: 90,
        tempCelsius: '+6°C تا +10°C',
      },
    ],
  },
  {
    id: 'facility-3',
    name: 'ملتان ماڈرن ایگری کولڈ چین، پرانا شجاع آباد روڈ',
    location: 'شجاع آباد روڈ، ملتان، پنجاب',
    operatorName: 'ملک نوید حیات',
    operatorPhone: '0301-4455667',
    totalCapacityTons: 600,
    currentUsedTons: 240,
    tempRange: '+1°C تا +14°C',
    ratePerTonPerDayPKR: 175,
    notes: 'پری کولنگ چیمبر اور ایئر ٹائٹ لاگنگ کی جدید سہولت۔',
    isSample: true,
    chambers: [
      {
        id: 'ch-31',
        name: 'چیمبر 1 - پریمیم مینگو ہب',
        capacityTons: 250,
        usedTons: 110,
        tempCelsius: '+10°C تا +13°C',
      },
      {
        id: 'ch-32',
        name: 'چیمبر 2 - ترکاریاں و بیر',
        capacityTons: 200,
        usedTons: 80,
        tempCelsius: '+3°C تا +5°C',
      },
      {
        id: 'ch-33',
        name: 'چیمبر 3 - بفر اسٹاک',
        capacityTons: 150,
        usedTons: 50,
        tempCelsius: '+5°C تا +8°C',
      },
    ],
  },
];

export const INITIAL_SAMPLE_INVENTORY: ColdStorageInventoryItem[] = [
  {
    id: 'inv-sample-1',
    facilityId: 'facility-1',
    inwardReceiptNumber: 'CSR-2026-0104',
    farmerId: 'p-farmer-1',
    farmerName: 'حاجی غلام فرید',
    farmerPhone: '0300-1234567',
    lotId: 'lot-sample-1',
    lotNumber: 'LOT-2026-0412',
    commodity: 'mango',
    variety: 'چونسا سفید خاص',
    initialQuantityTons: 15,
    currentRemainingTons: 10,
    dateIn: '15/10/2026',
    chamberRack: 'چیمبر 1، ریک B-3',
    conditionNotes: 'پھل بہترین حالت میں ہے، برآمدی گریڈ، رطوبت 85%، کوئی بیماری یا داغ نہیں۔',
    ratePerTonPerDayPKR: 180,
    status: 'active',
    createdAt: '15/10/2026',
    isSample: true,
  },
  {
    id: 'inv-sample-2',
    facilityId: 'facility-1',
    inwardReceiptNumber: 'CSR-2026-0098',
    farmerId: 'p-farmer-2',
    farmerName: 'میاں اختر علی',
    farmerPhone: '0301-5551234',
    commodity: 'citrus',
    variety: 'کینو سپیشل فینسی',
    initialQuantityTons: 25,
    currentRemainingTons: 25,
    dateIn: '18/10/2026',
    chamberRack: 'چیمبر 2، ریک A-1',
    conditionNotes: 'تازہ اترا ہوا کینو، واشنگ اور ویکسنگ مکمل، نمی کا تناسب متوازن۔',
    ratePerTonPerDayPKR: 180,
    status: 'active',
    createdAt: '18/10/2026',
    isSample: true,
  },
  {
    id: 'inv-sample-3',
    facilityId: 'facility-1',
    inwardReceiptNumber: 'CSR-2026-0085',
    farmerId: 'p-farmer-3',
    farmerName: 'ملک غلام سرور',
    farmerPhone: '0304-9988776',
    commodity: 'dates',
    variety: 'اصیل اصیل پریمیم',
    initialQuantityTons: 12,
    currentRemainingTons: 12,
    dateIn: '10/10/2026',
    chamberRack: 'چیمبر 3، ریک C-2',
    conditionNotes: 'خشک کھجور، نمی سے پاک اور مناسب پیکنگ۔',
    ratePerTonPerDayPKR: 180,
    status: 'active',
    createdAt: '10/10/2026',
    isSample: true,
  },
];

export const INITIAL_SAMPLE_GATE_PASSES: ColdStorageGatePass[] = [
  {
    id: 'gp-sample-1',
    gatePassNumber: 'CSG-2026-0038',
    inventoryItemId: 'inv-sample-1',
    facilityId: 'facility-1',
    farmerName: 'حاجی غلام فرید',
    lotId: 'lot-sample-1',
    lotNumber: 'LOT-2026-0412',
    commodity: 'mango',
    variety: 'چونسا سفید خاص',
    quantityOutTons: 5,
    remainingStockTons: 10,
    dateIn: '15/10/2026',
    dateOut: '22/10/2026',
    daysStored: 7,
    ratePerTonPerDayPKR: 180,
    totalRentPKR: 6300, // 5 tons * 7 days * 180 PKR
    receiverOrDriver: 'محمد بوٹا (ڈرائیور)',
    vehicleNumber: 'FSD-7812 (شاہ زور)',
    notes: 'لاہور منڈی ترسیل کے لیے 5 ٹن نکلوایا گیا، بقایا 10 ٹن چیمبر 1 میں تاحال محفوظ۔',
    createdAt: '22/10/2026',
    isSample: true,
  },
];

export const INITIAL_SAMPLE_BOOKINGS: ColdStorageBookingRequest[] = [
  {
    id: 'bkg-sample-1',
    bookingNumber: 'BKG-2026-0012',
    facilityId: 'facility-1',
    facilityName: 'الحمد کولڈ اسٹوریج و پری کولنگ سینٹر، خانیوال',
    farmerId: 'p-farmer-1',
    farmerName: 'حاجی غلام فرید',
    farmerPhone: '0300-1234567',
    commodity: 'mango',
    variety: 'انور رٹول پریمیم',
    requestedTons: 20,
    requestedStartDate: '28/10/2026',
    estimatedDurationDays: 14,
    notes: 'نئی چنائی آنے والی ہے، کیا چیمبر 1 میں 20 ٹن کی جگہ مل سکے گی؟ درجہ حرارت 11°C درکار ہے۔',
    status: 'pending',
    createdAt: '24/10/2026',
    isSample: true,
  },
  {
    id: 'bkg-sample-2',
    bookingNumber: 'BKG-2026-0009',
    facilityId: 'facility-1',
    facilityName: 'الحمد کولڈ اسٹوریج و پری کولنگ سینٹر، خانیوال',
    farmerId: 'p-farmer-2',
    farmerName: 'چوہدری انور حامد',
    farmerPhone: '0300-5558899',
    commodity: 'citrus',
    variety: 'مسمی مالٹا',
    requestedTons: 35,
    requestedStartDate: '24/10/2026',
    estimatedDurationDays: 30,
    notes: 'براہ کرم چیمبر 2 میں درجہ حرارت 5°C سیٹ رکھیں۔',
    status: 'accepted',
    responseNotes: 'جگہ منظور شدہ ہے۔ چیمبر 2 کا ریک C آپ کے لیے مخصوص ہے۔',
    respondedAt: '23/10/2026',
    createdAt: '22/10/2026',
    isSample: true,
  },
];

// Helper to parse DD/MM/YYYY into a Date
export function parseDateDMY(dmy: string): Date {
  const parts = dmy.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

// Calculate days between two dates (inclusive or minimum 1 day)
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = parseDateDMY(startDateStr);
  const end = parseDateDMY(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

class ColdStorageRepository {
  public async getFacilities(): Promise<ColdStorageFacility[]> {
    const list = await storageAdapter.getItem<ColdStorageFacility[]>(
      FACILITIES_KEY,
      INITIAL_SAMPLE_FACILITIES
    );
    if (!list || list.length === 0) {
      await storageAdapter.setItem(FACILITIES_KEY, INITIAL_SAMPLE_FACILITIES);
      return INITIAL_SAMPLE_FACILITIES;
    }
    return list;
  }

  public async getPrimaryFacility(): Promise<ColdStorageFacility> {
    const facilities = await this.getFacilities();
    return facilities[0] || INITIAL_SAMPLE_FACILITIES[0];
  }

  public async updateFacilityProfile(
    id: string,
    updates: Partial<ColdStorageFacility>
  ): Promise<ColdStorageFacility> {
    const facilities = await this.getFacilities();
    const index = facilities.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new Error(`Facility not found: ${id}`);
    }

    const updated = {
      ...facilities[index],
      ...updates,
    };
    facilities[index] = updated;
    await storageAdapter.setItem(FACILITIES_KEY, facilities);
    return updated;
  }

  public async getInventory(facilityId?: string): Promise<ColdStorageInventoryItem[]> {
    const items = await storageAdapter.getItem<ColdStorageInventoryItem[]>(
      INVENTORY_KEY,
      INITIAL_SAMPLE_INVENTORY
    );
    const list = !items || items.length === 0 ? INITIAL_SAMPLE_INVENTORY : items;
    if (!items || items.length === 0) {
      await storageAdapter.setItem(INVENTORY_KEY, INITIAL_SAMPLE_INVENTORY);
    }
    if (facilityId) {
      return list.filter((i) => i.facilityId === facilityId);
    }
    return list;
  }

  public async getGatePasses(facilityId?: string): Promise<ColdStorageGatePass[]> {
    const passes = await storageAdapter.getItem<ColdStorageGatePass[]>(
      GATE_PASSES_KEY,
      INITIAL_SAMPLE_GATE_PASSES
    );
    const list = !passes || passes.length === 0 ? INITIAL_SAMPLE_GATE_PASSES : passes;
    if (!passes || passes.length === 0) {
      await storageAdapter.setItem(GATE_PASSES_KEY, INITIAL_SAMPLE_GATE_PASSES);
    }
    if (facilityId) {
      return list.filter((p) => p.facilityId === facilityId);
    }
    return list;
  }

  public async getBookings(facilityId?: string): Promise<ColdStorageBookingRequest[]> {
    const bookings = await storageAdapter.getItem<ColdStorageBookingRequest[]>(
      BOOKINGS_KEY,
      INITIAL_SAMPLE_BOOKINGS
    );
    const list = !bookings || bookings.length === 0 ? INITIAL_SAMPLE_BOOKINGS : bookings;
    if (!bookings || bookings.length === 0) {
      await storageAdapter.setItem(BOOKINGS_KEY, INITIAL_SAMPLE_BOOKINGS);
    }
    if (facilityId) {
      return list.filter((b) => b.facilityId === facilityId);
    }
    return list;
  }

  /**
   * Create Inward Receipt (مال وصولی چالان)
   * Automatically updates facility capacity and appends inward event to lot timeline if lotId is given.
   */
  public async createInwardReceipt(
    data: Omit<
      ColdStorageInventoryItem,
      'id' | 'inwardReceiptNumber' | 'status' | 'currentRemainingTons' | 'createdAt' | 'isSample'
    > & { inwardReceiptNumber?: string }
  ): Promise<ColdStorageInventoryItem> {
    const inventory = await this.getInventory();
    const newId = `inv-${Date.now()}`;
    const newReceiptNumber =
      data.inwardReceiptNumber ||
      `CSR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newItem: ColdStorageInventoryItem = {
      ...data,
      id: newId,
      inwardReceiptNumber: newReceiptNumber,
      currentRemainingTons: data.initialQuantityTons,
      status: 'active',
      createdAt: new Date().toLocaleDateString('en-GB'),
      isSample: false,
    };

    inventory.unshift(newItem);
    await storageAdapter.setItem(INVENTORY_KEY, inventory);

    // Update facility used capacity
    const facilities = await this.getFacilities();
    const facilityIndex = facilities.findIndex((f) => f.id === data.facilityId);
    if (facilityIndex !== -1) {
      facilities[facilityIndex].currentUsedTons = Math.min(
        facilities[facilityIndex].totalCapacityTons,
        facilities[facilityIndex].currentUsedTons + data.initialQuantityTons
      );
      await storageAdapter.setItem(FACILITIES_KEY, facilities);
    }

    // Automatically append timeline event to lot if lotId is provided
    if (data.lotId) {
      try {
        const facility = facilities[facilityIndex] || facilities[0];
        await lotRepository.addTimelineEvent(data.lotId, {
          stage: 'stored',
          stageTitleUr: 'کولڈ اسٹوریج آمد و انورڈ رسید (Cold Stored)',
          stageTitleEn: 'Cold Storage Inward',
          timestamp: `${data.dateIn}، ${new Date().toLocaleTimeString('ur-PK', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          location: facility?.name || 'کولڈ اسٹوریج چیمبر',
          recordedBy: `${facility?.operatorName || 'آپریٹر'} (کولڈ اسٹوریج)`,
          recordedByRole: 'cold_storage',
          notes: `انورڈ رسید #${newReceiptNumber}۔ مقدار: ${data.initialQuantityTons} ٹن۔ چیمبر/ریک: ${data.chamberRack}۔ کیفیت: ${data.conditionNotes}۔ ریٹ: Rs. ${data.ratePerTonPerDayPKR}/ٹن/روزانہ۔`,
        });
      } catch (timelineErr) {
        console.warn('Could not auto-append inward event to lot:', timelineErr);
      }
    }

    return newItem;
  }

  /**
   * Create Outward Gate Pass (اخراج چالان / گیٹ پاس)
   * Decrements stock, calculates total rent, updates facility capacity,
   * and appends outward event to lot timeline.
   */
  public async createGatePass(
    data: {
      inventoryItemId: string;
      facilityId: string;
      quantityOutTons: number;
      dateOut: string;
      receiverOrDriver: string;
      vehicleNumber?: string;
      notes?: string;
      ratePerTonPerDayPKR?: number;
    }
  ): Promise<ColdStorageGatePass> {
    const inventory = await this.getInventory();
    const itemIndex = inventory.findIndex((i) => i.id === data.inventoryItemId);
    if (itemIndex === -1) {
      throw new Error(`Inventory item not found: ${data.inventoryItemId}`);
    }

    const item = inventory[itemIndex];
    if (data.quantityOutTons > item.currentRemainingTons) {
      throw new Error(
        `نکالی گئی مقدار (${data.quantityOutTons} ٹن) بقایا اسٹاک (${item.currentRemainingTons} ٹن) سے زیادہ نہیں ہو سکتی۔`
      );
    }

    const daysStored = calculateDaysBetween(item.dateIn, data.dateOut);
    const effectiveRate = data.ratePerTonPerDayPKR || item.ratePerTonPerDayPKR;
    const totalRentPKR = Math.round(data.quantityOutTons * daysStored * effectiveRate);
    const remainingStock = item.currentRemainingTons - data.quantityOutTons;

    // Update inventory item
    item.currentRemainingTons = remainingStock;
    if (remainingStock <= 0) {
      item.status = 'cleared';
    }
    await storageAdapter.setItem(INVENTORY_KEY, inventory);

    // Create gate pass
    const gatePasses = await this.getGatePasses();
    const newPassNumber = `CSG-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;

    const newGatePass: ColdStorageGatePass = {
      id: `gp-${Date.now()}`,
      gatePassNumber: newPassNumber,
      inventoryItemId: item.id,
      facilityId: item.facilityId,
      farmerName: item.farmerName,
      lotId: item.lotId,
      lotNumber: item.lotNumber,
      commodity: item.commodity,
      variety: item.variety,
      quantityOutTons: data.quantityOutTons,
      remainingStockTons: remainingStock,
      dateIn: item.dateIn,
      dateOut: data.dateOut,
      daysStored,
      ratePerTonPerDayPKR: effectiveRate,
      totalRentPKR,
      receiverOrDriver: data.receiverOrDriver,
      vehicleNumber: data.vehicleNumber,
      notes: data.notes,
      createdAt: new Date().toLocaleDateString('en-GB'),
      isSample: false,
    };

    gatePasses.unshift(newGatePass);
    await storageAdapter.setItem(GATE_PASSES_KEY, gatePasses);

    // Update facility used capacity (release space)
    const facilities = await this.getFacilities();
    const facilityIndex = facilities.findIndex((f) => f.id === item.facilityId);
    if (facilityIndex !== -1) {
      facilities[facilityIndex].currentUsedTons = Math.max(
        0,
        facilities[facilityIndex].currentUsedTons - data.quantityOutTons
      );
      await storageAdapter.setItem(FACILITIES_KEY, facilities);
    }

    // Automatically append outward event to lot timeline if lotId exists
    if (item.lotId) {
      try {
        const facility = facilities[facilityIndex] || facilities[0];
        await lotRepository.addTimelineEvent(item.lotId, {
          stage: 'stored',
          stageTitleUr: 'کولڈ اسٹوریج سے اخراج / گیٹ پاس (Released)',
          stageTitleEn: 'Cold Storage Released',
          timestamp: `${data.dateOut}، ${new Date().toLocaleTimeString('ur-PK', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          location: facility?.name || 'کولڈ اسٹوریج چیمبر',
          recordedBy: `${facility?.operatorName || 'آپریٹر'} (کولڈ اسٹوریج)`,
          recordedByRole: 'cold_storage',
          notes: `گیٹ پاس #${newPassNumber}۔ نکالی گئی مقدار: ${data.quantityOutTons} ٹن۔ بقایا اسٹاک: ${remainingStock} ٹن۔ ذخیرہ مدت: ${daysStored} دن۔ کل کرایہ: Rs. ${totalRentPKR.toLocaleString()}۔ وصول کنندہ: ${data.receiverOrDriver} (گاڑی: ${data.vehicleNumber || 'نامعلوم'})۔`,
        });
      } catch (timelineErr) {
        console.warn('Could not auto-append outward event to lot:', timelineErr);
      }
    }

    return newGatePass;
  }

  /**
   * Submit Farmer Booking Request
   */
  public async createBookingRequest(
    data: Omit<ColdStorageBookingRequest, 'id' | 'bookingNumber' | 'status' | 'createdAt' | 'isSample'>
  ): Promise<ColdStorageBookingRequest> {
    const bookings = await this.getBookings();
    const newNumber = `BKG-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;

    const newBooking: ColdStorageBookingRequest = {
      ...data,
      id: `bkg-${Date.now()}`,
      bookingNumber: newNumber,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('en-GB'),
      isSample: false,
    };

    bookings.unshift(newBooking);
    await storageAdapter.setItem(BOOKINGS_KEY, bookings);
    return newBooking;
  }

  /**
   * Operator Accept or Decline Booking
   */
  public async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    responseNotes?: string
  ): Promise<ColdStorageBookingRequest> {
    const bookings = await this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    bookings[index].status = status;
    bookings[index].responseNotes = responseNotes;
    bookings[index].respondedAt = new Date().toLocaleDateString('en-GB');

    await storageAdapter.setItem(BOOKINGS_KEY, bookings);
    return bookings[index];
  }

  /**
   * Calculate accrued rent for an active or past inventory item
   */
  public calculateRent(
    item: ColdStorageInventoryItem,
    toDate?: string,
    customRate?: number
  ): {
    daysStored: number;
    effectiveRate: number;
    tonDays: number;
    totalRentPKR: number;
  } {
    const targetDate = toDate || new Date().toLocaleDateString('en-GB');
    const daysStored = calculateDaysBetween(item.dateIn, targetDate);
    const effectiveRate = customRate !== undefined ? customRate : item.ratePerTonPerDayPKR;
    const tonDays = item.currentRemainingTons * daysStored;
    const totalRentPKR = Math.round(tonDays * effectiveRate);

    return {
      daysStored,
      effectiveRate,
      tonDays,
      totalRentPKR,
    };
  }
}

export const coldStorageRepository = new ColdStorageRepository();
