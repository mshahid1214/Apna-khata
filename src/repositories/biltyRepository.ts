import { Bilty } from '../types';
import { storageAdapter } from './storageAdapter';
import { lotRepository } from './lotRepository';

const BILTY_STORAGE_KEY = 'apna_khata_bilties_v1';

export const INITIAL_SAMPLE_BILTIES: Bilty[] = [
  {
    id: 'blt-sample-1',
    biltyNumber: 'BLT-2026-0315',
    date: '24/10/2026',
    senderName: 'رانا ثناء اللہ خاں',
    senderPhone: '0300-XXXXXXX',
    receiverName: 'میاں برادرز کمیشن ایجنٹ',
    receiverPhone: '0301-XXXXXXX',
    lotIds: ['lot-sample-2'],
    lotSummary: 'کنو / مالٹا سپر کوالٹی (گریڈ A) - 350 پیٹی',
    vehicleNumber: 'LHR-8924 (شاہ زور مزدا)',
    driverName: 'محمد بوٹا ڈرائیور',
    driverPhone: '0302-XXXXXXX',
    origin: 'کوٹ ادو، ضلع مظفر گڑھ',
    destination: 'بادامی باغ غلہ و فروٹ منڈی، لاہور',
    quantity: 350,
    unit: 'peti',
    freightPKR: 42000,
    advancePaidPKR: 15000,
    balancePayablePKR: 27000,
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><path d="M10 25 Q 30 10, 60 20 T 110 15" fill="none" stroke="%2378350F" stroke-width="2.5"/></svg>',
    signedAt: '24/10/2026، صبح 06:15 بجے',
    signedByName: 'محمد بوٹا (ڈرائیور)',
    status: 'in_transit',
    notes: 'برف والی ترپال لگی ہوئی ہے، مال کی حفاظت ڈرائیور کے ذمے ہے۔ نمونہ برائے ٹیسٹنگ۔',
    isSample: true,
    createdAt: '24/10/2026',
  },
  {
    id: 'blt-sample-2',
    biltyNumber: 'BLT-2026-0294',
    date: '22/10/2026',
    senderName: 'حاجی غلام فرید',
    senderPhone: '0300-XXXXXXX',
    receiverName: 'الحمد کولڈ اسٹوریج، خانیوال',
    lotIds: ['lot-sample-1'],
    lotSummary: 'آم چونسا سفید خاص - 220 پیٹی',
    vehicleNumber: 'MN-4412 (پک اپ ڈالہ)',
    driverName: 'طارق محمود ڈرائیور',
    origin: 'چک 14-WB وہاڑی فارم',
    destination: 'الحمد کولڈ اسٹوریج، خانیوال بائی پاس',
    quantity: 220,
    unit: 'peti',
    freightPKR: 14000,
    advancePaidPKR: 14000,
    balancePayablePKR: 0,
    signedAt: '22/10/2026، دوپہر 02:00 بجے',
    signedByName: 'طارق محمود',
    status: 'delivered',
    deliveredAt: '22/10/2026، شام 04:30 بجے',
    notes: 'کولڈ اسٹوریج کے گیٹ پر باحفاظت وصول کروایا گیا۔ نمونہ برائے ٹیسٹنگ۔',
    isSample: true,
    createdAt: '22/10/2026',
  },
];

export class BiltyRepository {
  public async getAll(): Promise<Bilty[]> {
    return storageAdapter.getItem<Bilty[]>(BILTY_STORAGE_KEY, INITIAL_SAMPLE_BILTIES);
  }

  public async getById(id: string): Promise<Bilty | null> {
    const list = await this.getAll();
    return list.find((b) => b.id === id || b.biltyNumber === id) || null;
  }

  public async save(biltyData: Omit<Bilty, 'id' | 'createdAt' | 'isSample'>): Promise<Bilty> {
    const list = await this.getAll();
    const newId = `blt-${Date.now()}`;
    const newBiltyNumber = `BLT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newBilty: Bilty = {
      ...biltyData,
      id: newId,
      biltyNumber: newBiltyNumber,
      isSample: false,
      createdAt: new Date().toLocaleDateString('en-GB'),
    };

    list.unshift(newBilty);
    await storageAdapter.setItem(BILTY_STORAGE_KEY, list);

    // AUTOMATIC TIMELINE INTEGRATION:
    // Creating a Bilty automatically adds a "loaded" event to all linked Lot timelines
    if (newBilty.lotIds && newBilty.lotIds.length > 0) {
      for (const lotId of newBilty.lotIds) {
        try {
          await lotRepository.addTimelineEvent(lotId, {
            stage: 'loaded',
            stageTitleUr: 'گاڑی میں لوڈنگ و ترسیل (Loaded for Transit)',
            stageTitleEn: 'Loaded for Transit',
            timestamp: `${newBilty.date}، ${newBilty.signedAt || new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}`,
            location: newBilty.origin,
            recordedBy: `${newBilty.driverName} (ڈرائیور) / ${newBilty.vehicleNumber}`,
            recordedByRole: 'transporter',
            notes: `بلٹی نمبر ${newBiltyNumber} جاری۔ گاڑی: ${newBilty.vehicleNumber}۔ منزل: ${newBilty.destination}۔ کل کرایہ: Rs. ${newBilty.freightPKR}`,
            biltyId: newId,
          });
        } catch (err) {
          console.warn(`Could not add loaded event to lot ${lotId}:`, err);
        }
      }
    }

    return newBilty;
  }

  public async markDelivered(biltyId: string, deliveredAt: string, notes?: string): Promise<Bilty> {
    const list = await this.getAll();
    const index = list.findIndex((b) => b.id === biltyId);
    if (index === -1) {
      throw new Error(`Bilty not found: ${biltyId}`);
    }

    const b = list[index];
    b.status = 'delivered';
    b.deliveredAt = deliveredAt;
    if (notes) b.notes = (b.notes ? `${b.notes} · ` : '') + notes;

    await storageAdapter.setItem(BILTY_STORAGE_KEY, list);

    // AUTOMATIC TIMELINE INTEGRATION:
    // Marking a Bilty as delivered adds a "delivered" event to all linked Lot timelines
    if (b.lotIds && b.lotIds.length > 0) {
      for (const lotId of b.lotIds) {
        try {
          await lotRepository.addTimelineEvent(lotId, {
            stage: 'delivered',
            stageTitleUr: 'منزل پر ترسیل و سپردگی (Delivered)',
            stageTitleEn: 'Delivered',
            timestamp: deliveredAt,
            location: b.destination,
            recordedBy: `${b.driverName} (ڈرائیور / ٹرانسپورٹر)`,
            recordedByRole: 'transporter',
            notes: notes || `مال منزل مقصود (${b.destination}) پر بحفاظت پہنچا دیا گیا۔ بلٹی ${b.biltyNumber} مکمل۔`,
            biltyId: b.id,
          });
        } catch (err) {
          console.warn(`Could not add delivered event to lot ${lotId}:`, err);
        }
      }
    }

    return b;
  }
}

export const biltyRepository = new BiltyRepository();
