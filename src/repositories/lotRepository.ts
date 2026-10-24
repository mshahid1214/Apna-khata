import { Lot, LotTimelineEvent } from '../types';
import { storageAdapter } from './storageAdapter';

const LOTS_STORAGE_KEY = 'apna_khata_lots_v1';

export const INITIAL_SAMPLE_LOTS: Lot[] = [
  {
    id: 'lot-sample-1',
    lotNumber: 'LOT-2026-0412',
    farmerId: 'p-farmer-1',
    farmerName: 'حاجی غلام فرید',
    crop: 'mango',
    variety: 'چونسا سفید خاص',
    grade: 'درجہ اول (Grade A)',
    quantity: 220,
    unit: 'peti',
    harvestDate: '20/10/2026',
    farmName: 'الفرید مینگو فارم، چک 14-WB، وہاڑی',
    farmGpsPin: '30.0440° N, 72.3550° E',
    notes: 'درختوں پر پکا ہوا مال، اعلیٰ مٹھاس اور برآمدی معیار۔ نمونہ برائے ٹیسٹنگ۔',
    isSample: true,
    createdAt: '20/10/2026',
    timeline: [
      {
        id: 'evt-1',
        stage: 'harvested',
        stageTitleUr: 'فصل چنائی / کٹائی (Harvested)',
        stageTitleEn: 'Harvested',
        timestamp: '20/10/2026، صبح 06:30 بجے',
        location: 'باغ الفرید، چک 14-WB وہاڑی',
        gpsPin: '30.0440° N, 72.3550° E',
        recordedBy: 'حاجی غلام فرید (باغبان / کسان)',
        recordedByRole: 'farmer',
        notes: 'صبح کے ٹھنڈے وقت احتیاط سے کٹنگ کینچی کے ساتھ چنائی کی گئی تاکہ پھل کو رگڑ نہ لگے۔',
        isSample: true,
      },
      {
        id: 'evt-2',
        stage: 'graded',
        stageTitleUr: 'چھانٹی و درجہ بندی (Graded & Packed)',
        stageTitleEn: 'Graded & Packed',
        timestamp: '21/10/2026، صبح 11:00 بجے',
        location: 'پیکنگ شیڈ، وہاڑی فارم',
        gpsPin: '30.0442° N, 72.3555° E',
        recordedBy: 'محمد اکبر (گریڈنگ سپروائزر)',
        recordedByRole: 'farmer',
        notes: 'سائز کے مطابق چھانٹی، وزنی پھل 350-400 گرام، 10 کلو برآمدی گتہ پیٹی میں پیکنگ۔',
        isSample: true,
      },
      {
        id: 'evt-3',
        stage: 'stored',
        stageTitleUr: 'کولڈ اسٹوریج آمد و تحفظ (Cold Stored)',
        stageTitleEn: 'Cold Stored',
        timestamp: '22/10/2026، شام 04:30 بجے',
        location: 'الحمد کولڈ اسٹوریج، خانیوال بائی پاس',
        gpsPin: '30.2864° N, 71.9321° E',
        recordedBy: 'بشیر احمد (کولڈ اسٹوریج انچارج)',
        recordedByRole: 'cold_storage',
        notes: 'چیمبر نمبر 3 میں محفوظ، کنٹرولڈ درجہ حرارت 12°C اور نمی 85 فیصد۔ چالان # CHL-891',
        isSample: true,
      },
    ],
  },
  {
    id: 'lot-sample-2',
    lotNumber: 'LOT-2026-0785',
    farmerId: 'p-farmer-2',
    farmerName: 'رانا ثناء اللہ خاں',
    crop: 'citrus',
    variety: 'کنو / مالٹا سپر کوالٹی',
    grade: 'درجہ اول (سائز 72/80)',
    quantity: 350,
    unit: 'peti',
    harvestDate: '22/10/2026',
    farmName: 'رانا سٹرس آرچرڈ، کوٹ ادو، مظفر گڑھ',
    farmGpsPin: '30.4700° N, 70.9600° E',
    notes: 'پتلے چھلکے والا رس دار کنو۔ نمونہ برائے ٹیسٹنگ۔',
    isSample: true,
    createdAt: '22/10/2026',
    timeline: [
      {
        id: 'evt-4',
        stage: 'harvested',
        stageTitleUr: 'فصل چنائی / کٹائی (Harvested)',
        stageTitleEn: 'Harvested',
        timestamp: '22/10/2026، صبح 08:00 بجے',
        location: 'کوٹ ادو باغ، مظفر گڑھ',
        gpsPin: '30.4700° N, 70.9600° E',
        recordedBy: 'رانا ثناء اللہ خاں (کسان)',
        recordedByRole: 'farmer',
        notes: 'باغ میں پکے ہوئے پیلے کنو کی ہاتھ سے چنائی مکمل ہوئی۔',
        isSample: true,
      },
      {
        id: 'evt-5',
        stage: 'graded',
        stageTitleUr: 'گریڈنگ و ویکسنگ (Graded & Waxed)',
        stageTitleEn: 'Graded & Waxed',
        timestamp: '23/10/2026، دوپہر 01:00 بجے',
        location: 'مظفر گڑھ پروسیسنگ یونٹ',
        recordedBy: 'اقبال حسین (پیک ہاؤس منیجر)',
        recordedByRole: 'arhti',
        notes: 'فوڈ گریڈ ویکسنگ اور سائز 72 کی لکڑی و گتے کے ڈبوں میں پیکنگ۔',
        isSample: true,
      },
      {
        id: 'evt-6',
        stage: 'loaded',
        stageTitleUr: 'گاڑی میں لوڈنگ و روانگی (Loaded)',
        stageTitleEn: 'Loaded for Transit',
        timestamp: '24/10/2026، صبح 06:15 بجے',
        location: 'کوٹ ادو لوڈنگ پوائنٹ',
        recordedBy: 'محمد بوٹا ڈرائیور (طارق گڈز ٹرانسپورٹ)',
        recordedByRole: 'transporter',
        notes: 'ٹرک نمبر LHR-8924 پر 350 پیٹی لوڈ کی گئیں۔ بلٹی نمبر BLT-2026-0315 جاری۔ منزل: بادامی باغ منڈی لاہور۔',
        biltyId: 'blt-sample-1',
        isSample: true,
      },
    ],
  },
  {
    id: 'lot-sample-3',
    lotNumber: 'LOT-2026-0921',
    farmerId: 'p-farmer-1',
    farmerName: 'حاجی غلام فرید',
    crop: 'cotton',
    variety: 'کپاس پھٹی (بی ایس 15)',
    grade: 'سپر صاف (Super Clean)',
    quantity: 75,
    unit: 'man',
    harvestDate: '23/10/2026',
    farmName: 'چک 18-WB، وہاڑی فارم',
    farmGpsPin: '30.1250° N, 72.2810° E',
    notes: 'پہلی چنائی، نمی سے پاک، سفید پھٹی۔ نمونہ برائے ٹیسٹنگ۔',
    isSample: true,
    createdAt: '23/10/2026',
    timeline: [
      {
        id: 'evt-7',
        stage: 'harvested',
        stageTitleUr: 'کپاس چنائی (Harvested / Picked)',
        stageTitleEn: 'Picked',
        timestamp: '23/10/2026، صبح 11:30 بجے',
        location: 'کپاس فیلڈ نمبر 4، چک 18-WB وہاڑی',
        gpsPin: '30.1250° N, 72.2810° E',
        recordedBy: 'حاجی غلام فرید (کسان)',
        recordedByRole: 'farmer',
        notes: 'دھوپ کھلنے کے بعد چنائی کی گئی تاکہ نمی نہ آئے۔ توڑوں میں بھرائی مکمل۔',
        isSample: true,
      },
    ],
  },
];

export class LotRepository {
  public async getAll(): Promise<Lot[]> {
    return storageAdapter.getItem<Lot[]>(LOTS_STORAGE_KEY, INITIAL_SAMPLE_LOTS);
  }

  public async getById(id: string): Promise<Lot | null> {
    const list = await this.getAll();
    return list.find((item) => item.id === id || item.lotNumber === id) || null;
  }

  public async getByLotNumber(lotNumber: string): Promise<Lot | null> {
    const list = await this.getAll();
    return list.find((item) => item.lotNumber.toLowerCase() === lotNumber.toLowerCase()) || null;
  }

  public async save(
    lotData: Omit<Lot, 'id' | 'createdAt' | 'timeline' | 'isSample' | 'lotNumber'> & { lotNumber?: string }
  ): Promise<Lot> {
    const list = await this.getAll();
    const newId = `lot-${Date.now()}`;
    const newLotNumber = lotData.lotNumber || `LOT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    
    // Auto-create initial 'harvested' event
    const initialEvent: LotTimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: 'harvested',
      stageTitleUr: 'فصل چنائی / کٹائی (Harvested)',
      stageTitleEn: 'Harvested',
      timestamp: `${lotData.harvestDate}، ${new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' })}`,
      location: lotData.farmName,
      gpsPin: lotData.farmGpsPin,
      recordedBy: `${lotData.farmerName} (کسان)`,
      recordedByRole: 'farmer',
      notes: lotData.notes || 'لاٹ کی پہلی اندراجی اور ابتدائی فصل چنائی ریکارڈ۔',
      isSample: false,
    };

    const newLot: Lot = {
      ...lotData,
      id: newId,
      lotNumber: newLotNumber,
      timeline: [initialEvent],
      isSample: false,
      createdAt: new Date().toLocaleDateString('en-GB'),
    };

    list.unshift(newLot);
    await storageAdapter.setItem(LOTS_STORAGE_KEY, list);
    return newLot;
  }

  /**
   * Append-only event addition. Events cannot be deleted;
   * Corrections are added as new subsequent events with an audit explanation.
   */
  public async addTimelineEvent(
    lotId: string,
    eventData: Omit<LotTimelineEvent, 'id' | 'isSample'>
  ): Promise<LotTimelineEvent> {
    const list = await this.getAll();
    const lotIndex = list.findIndex((l) => l.id === lotId || l.lotNumber === lotId);
    if (lotIndex === -1) {
      throw new Error(`Lot not found with ID: ${lotId}`);
    }

    const newEvent: LotTimelineEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isSample: false,
    };

    list[lotIndex].timeline.push(newEvent);
    await storageAdapter.setItem(LOTS_STORAGE_KEY, list);
    return newEvent;
  }
}

export const lotRepository = new LotRepository();
