import { Commodity } from '../types';
import { storageAdapter } from './storageAdapter';

export interface PriceAlert {
  id: string;
  commodity: Commodity;
  targetPrice: number; // PKR per man
  condition: 'above' | 'below'; // above = جب قیمت بڑھ کر X ہو جائے; below = جب قیمت گر کر X ہو جائے
  isTriggered: boolean;
  createdAt: string;
}

const KEY = 'price_alerts_v1';

export class PriceAlertRepository {
  public async getAll(): Promise<PriceAlert[]> {
    return storageAdapter.getItem<PriceAlert[]>(KEY, [
      {
        id: 'alert-sample-1',
        commodity: 'mango',
        targetPrice: 4800,
        condition: 'above',
        isTriggered: false,
        createdAt: '24/10/2026',
      },
      {
        id: 'alert-sample-2',
        commodity: 'cotton',
        targetPrice: 8400,
        condition: 'below',
        isTriggered: false,
        createdAt: '24/10/2026',
      },
    ]);
  }

  public async save(commodity: Commodity, targetPrice: number, condition: 'above' | 'below'): Promise<PriceAlert> {
    const list = await this.getAll();
    const newAlert: PriceAlert = {
      id: `alt-${Date.now()}`,
      commodity,
      targetPrice,
      condition,
      isTriggered: false,
      createdAt: new Date().toLocaleDateString('en-GB'),
    };
    list.unshift(newAlert);
    await storageAdapter.setItem(KEY, list);
    return newAlert;
  }

  public async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter((a) => a.id !== id);
    await storageAdapter.setItem(KEY, filtered);
  }

  public async checkAlerts(currentAverages: Record<Commodity, number>): Promise<PriceAlert[]> {
    const list = await this.getAll();
    let changed = false;

    list.forEach((alert) => {
      const current = currentAverages[alert.commodity];
      if (current) {
        if (alert.condition === 'above' && current >= alert.targetPrice) {
          alert.isTriggered = true;
          changed = true;
        } else if (alert.condition === 'below' && current <= alert.targetPrice) {
          alert.isTriggered = true;
          changed = true;
        }
      }
    });

    if (changed) {
      await storageAdapter.setItem(KEY, list);
    }
    return list;
  }
}

export const priceAlertRepository = new PriceAlertRepository();
