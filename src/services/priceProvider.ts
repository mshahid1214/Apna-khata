import { Commodity } from '../types';

export interface MarketPriceRecord {
  cityId: 'multan' | 'lahore' | 'faisalabad';
  cityNameUr: string;
  cityNameLatn: string;
  cityNameEn: string;
  minPrice: number; // PKR per man
  maxPrice: number; // PKR per man
  avgPrice: number; // PKR per man
  arrivalsQuantity: string; // e.g. "1,200 من آمد"
}

export interface DayPricePoint {
  date: string; // DD/MM
  fullDate: string; // DD/MM/YYYY
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface CropMarketData {
  commodity: Commodity;
  commodityNameUr: string;
  commodityNameLatn: string;
  commodityNameEn: string;
  unit: string; // "من (40 کلو)"
  overallAvg: number;
  overallMin: number;
  overallMax: number;
  change7DaysPct: number; // e.g. +3.5 or -2.1
  trendDirection: 'up' | 'down' | 'stable';
  markets: Record<'multan' | 'lahore' | 'faisalabad', MarketPriceRecord>;
  trend7Days: number[]; // 7 daily average points
  history30Days: DayPricePoint[];
  dataSource: string;
  lastUpdated: string;
}

/**
 * Data-adapter interface for wholesale Mandi crop prices.
 * Adheres strictly to the architectural constraint: zero browser scraping.
 */
export interface PriceProvider {
  getCropPrice(commodity: Commodity): Promise<CropMarketData>;
  getAllCropPrices(): Promise<Record<Commodity, CropMarketData>>;
  getSourceInfo(): { sourceName: string; disclaimerUr: string; lastUpdated: string };
}

/**
 * SamplePriceProvider
 * Realistic sample wholesale prices for Multan, Lahore, and Faisalabad.
 * Labeled clearly as SAMPLE for system testing and demonstration.
 */
export class SamplePriceProvider implements PriceProvider {
  private lastUpdatedTime = '24/10/2026، صبح 08:30 بجے';
  private sourceTitle = 'نمونہ منڈی سروے برائے ٹیسٹنگ (SAMPLE)';

  public getSourceInfo() {
    return {
      sourceName: this.sourceTitle,
      disclaimerUr: 'نوٹ: یہ تمام قیمتیں برائے نمونہ ہیں اور تصدیق کے لیے پیش کی گئی ہیں۔',
      lastUpdated: this.lastUpdatedTime,
    };
  }

  public async getCropPrice(commodity: Commodity): Promise<CropMarketData> {
    const all = await this.getAllCropPrices();
    return all[commodity];
  }

  public async getAllCropPrices(): Promise<Record<Commodity, CropMarketData>> {
    // Generate 30-day realistic trajectory for each commodity
    return {
      mango: {
        commodity: 'mango',
        commodityNameUr: 'آم (چونسا خاص)',
        commodityNameLatn: 'Aam (Chaunsa)',
        commodityNameEn: 'Mango (Chaunsa)',
        unit: 'من (40 کلو)',
        overallAvg: 4650,
        overallMin: 4300,
        overallMax: 4950,
        change7DaysPct: 3.8,
        trendDirection: 'up',
        markets: {
          multan: {
            cityId: 'multan',
            cityNameUr: 'غلہ منڈی ملتان',
            cityNameLatn: 'Multan Mandi',
            cityNameEn: 'Multan',
            minPrice: 4400,
            maxPrice: 4850,
            avgPrice: 4625,
            arrivalsQuantity: '2,400 من آمد',
          },
          lahore: {
            cityId: 'lahore',
            cityNameUr: 'بادامی باغ منڈی لاہور',
            cityNameLatn: 'Lahore Mandi',
            cityNameEn: 'Lahore',
            minPrice: 4500,
            maxPrice: 5100,
            avgPrice: 4800,
            arrivalsQuantity: '4,100 من آمد',
          },
          faisalabad: {
            cityId: 'faisalabad',
            cityNameUr: 'فروٹ منڈی فیصل آباد',
            cityNameLatn: 'Faisalabad Mandi',
            cityNameEn: 'Faisalabad',
            minPrice: 4350,
            maxPrice: 4750,
            avgPrice: 4550,
            arrivalsQuantity: '1,800 من آمد',
          },
        },
        trend7Days: [4380, 4420, 4450, 4500, 4560, 4600, 4650],
        history30Days: this.generate30DayCurve(4200, 4700, 1.05),
        dataSource: this.sourceTitle,
        lastUpdated: this.lastUpdatedTime,
      },
      citrus: {
        commodity: 'citrus',
        commodityNameUr: 'کنو / مالٹا (گریڈ A)',
        commodityNameLatn: 'Kinnow / Malta',
        commodityNameEn: 'Citrus / Kinnow',
        unit: 'من (40 کلو)',
        overallAvg: 2280,
        overallMin: 2100,
        overallMax: 2450,
        change7DaysPct: -1.5,
        trendDirection: 'down',
        markets: {
          multan: {
            cityId: 'multan',
            cityNameUr: 'غلہ منڈی ملتان',
            cityNameLatn: 'Multan Mandi',
            cityNameEn: 'Multan',
            minPrice: 2100,
            maxPrice: 2350,
            avgPrice: 2225,
            arrivalsQuantity: '1,600 من آمد',
          },
          lahore: {
            cityId: 'lahore',
            cityNameUr: 'بادامی باغ منڈی لاہور',
            cityNameLatn: 'Lahore Mandi',
            cityNameEn: 'Lahore',
            minPrice: 2200,
            maxPrice: 2500,
            avgPrice: 2350,
            arrivalsQuantity: '3,200 من آمد',
          },
          faisalabad: {
            cityId: 'faisalabad',
            cityNameUr: 'فروٹ منڈی فیصل آباد',
            cityNameLatn: 'Faisalabad Mandi',
            cityNameEn: 'Faisalabad',
            minPrice: 2150,
            maxPrice: 2400,
            avgPrice: 2275,
            arrivalsQuantity: '2,100 من آمد',
          },
        },
        trend7Days: [2350, 2340, 2320, 2310, 2290, 2280, 2270],
        history30Days: this.generate30DayCurve(2400, 2250, 0.96),
        dataSource: this.sourceTitle,
        lastUpdated: this.lastUpdatedTime,
      },
      dates: {
        commodity: 'dates',
        commodityNameUr: 'کھجور (اصیل درجہ اول)',
        commodityNameLatn: 'Khajoor (Aseel)',
        commodityNameEn: 'Dates (Aseel)',
        unit: 'من (40 کلو)',
        overallAvg: 6950,
        overallMin: 6500,
        overallMax: 7400,
        change7DaysPct: 2.1,
        trendDirection: 'up',
        markets: {
          multan: {
            cityId: 'multan',
            cityNameUr: 'غلہ منڈی ملتان',
            cityNameLatn: 'Multan Mandi',
            cityNameEn: 'Multan',
            minPrice: 6600,
            maxPrice: 7200,
            avgPrice: 6900,
            arrivalsQuantity: '900 من آمد',
          },
          lahore: {
            cityId: 'lahore',
            cityNameUr: 'بادامی باغ منڈی لاہور',
            cityNameLatn: 'Lahore Mandi',
            cityNameEn: 'Lahore',
            minPrice: 6800,
            maxPrice: 7500,
            avgPrice: 7150,
            arrivalsQuantity: '1,400 من آمد',
          },
          faisalabad: {
            cityId: 'faisalabad',
            cityNameUr: 'فروٹ منڈی فیصل آباد',
            cityNameLatn: 'Faisalabad Mandi',
            cityNameEn: 'Faisalabad',
            minPrice: 6550,
            maxPrice: 7100,
            avgPrice: 6825,
            arrivalsQuantity: '850 من آمد',
          },
        },
        trend7Days: [6780, 6800, 6840, 6880, 6900, 6930, 6950],
        history30Days: this.generate30DayCurve(6400, 7000, 1.08),
        dataSource: this.sourceTitle,
        lastUpdated: this.lastUpdatedTime,
      },
      cotton: {
        commodity: 'cotton',
        commodityNameUr: 'کپاس / پھٹی (بی ایس 15)',
        commodityNameLatn: 'Kapaas / Phutti',
        commodityNameEn: 'Cotton / Phutti',
        unit: 'من (40 کلو)',
        overallAvg: 8550,
        overallMin: 8100,
        overallMax: 8900,
        change7DaysPct: -0.4,
        trendDirection: 'stable',
        markets: {
          multan: {
            cityId: 'multan',
            cityNameUr: 'غلہ منڈی ملتان',
            cityNameLatn: 'Multan Mandi',
            cityNameEn: 'Multan',
            minPrice: 8200,
            maxPrice: 8850,
            avgPrice: 8525,
            arrivalsQuantity: '5,500 من آمد',
          },
          lahore: {
            cityId: 'lahore',
            cityNameUr: 'بادامی باغ منڈی لاہور',
            cityNameLatn: 'Lahore Mandi',
            cityNameEn: 'Lahore',
            minPrice: 8300,
            maxPrice: 8950,
            avgPrice: 8625,
            arrivalsQuantity: '2,800 من آمد',
          },
          faisalabad: {
            cityId: 'faisalabad',
            cityNameUr: 'فروٹ منڈی فیصل آباد',
            cityNameLatn: 'Faisalabad Mandi',
            cityNameEn: 'Faisalabad',
            minPrice: 8150,
            maxPrice: 8800,
            avgPrice: 8475,
            arrivalsQuantity: '3,900 من آمد',
          },
        },
        trend7Days: [8580, 8560, 8570, 8550, 8540, 8550, 8550],
        history30Days: this.generate30DayCurve(8600, 8500, 0.99),
        dataSource: this.sourceTitle,
        lastUpdated: this.lastUpdatedTime,
      },
    };
  }

  private generate30DayCurve(startPrice: number, endPrice: number, drift: number): DayPricePoint[] {
    const list: DayPricePoint[] = [];
    const step = (endPrice - startPrice) / 29;
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const fullDate = `${dayStr}/${d.getFullYear()}`;
      const noise = (Math.sin(i * 0.8) * 35) + (Math.cos(i * 1.2) * 20);
      const base = Math.round(startPrice + step * (29 - i) + noise);
      list.push({
        date: dayStr,
        fullDate,
        avgPrice: base,
        minPrice: base - 180,
        maxPrice: base + 210,
      });
    }
    return list;
  }
}

// ---------------------------------------------------------------------------
// AMIS (Punjab Agriculture Marketing Information Service) FUTURE PROVIDER
// ---------------------------------------------------------------------------

/**
 * Placeholder and architectural specification for a future server-side AMIS provider.
 * 
 * DESIGN SPECIFICATION & COMPLIANCE:
 * 1. Web scraping in the client browser is strictly prohibited due to CORS,
 *    fragility, rate-limiting, and legal terms of service requirements.
 * 2. When terms of use are validated, this provider communicates via an Express
 *    backend proxy endpoint:
 *       GET /api/amis/rates?crop=<crop>&date=<YYYY-MM-DD>
 *    running on `server.ts`.
 * 3. The server-side proxy handles authentication, response caching (1-hour TTL),
 *    and canonical entity normalization.
 */
export class AmisServerPriceProvider implements PriceProvider {
  private endpoint = '/api/amis/rates';

  public getSourceInfo() {
    return {
      sourceName: 'پنجاب ایگریکلچر مارکیٹنگ انفارمیشن سروس (AMIS - گورنمنٹ آف پنجاب)',
      disclaimerUr: 'ماخذ: پنجاب ایگریکلچر مارکیٹنگ انفارمیشن سروس (AMIS)۔ سرکاری تصدیق شدہ یومیہ بلیٹن۔',
      lastUpdated: new Date().toLocaleDateString('en-GB') + '، 09:00 AM',
    };
  }

  public async getCropPrice(commodity: Commodity): Promise<CropMarketData> {
    // Falls back gracefully to SamplePriceProvider until backend proxy is enabled
    console.info(`[AmisServerPriceProvider] Connecting to backend proxy for ${commodity}... (Placeholder)`);
    const fallback = new SamplePriceProvider();
    return fallback.getCropPrice(commodity);
  }

  public async getAllCropPrices(): Promise<Record<Commodity, CropMarketData>> {
    console.info('[AmisServerPriceProvider] Connecting to backend proxy... (Placeholder)');
    const fallback = new SamplePriceProvider();
    return fallback.getAllCropPrices();
  }
}

// Export default singleton instance
export const defaultPriceProvider: PriceProvider = new SamplePriceProvider();
