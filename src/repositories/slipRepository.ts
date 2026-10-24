import { Slip } from '../types';
import { storageAdapter } from './storageAdapter';
import { SAMPLE_SLIPS } from './sampleData';

const KEY = 'slips';

export class SlipRepository {
  public async getAll(): Promise<Slip[]> {
    const list = await storageAdapter.getItem<Slip[]>(KEY, []);
    if (!list || list.length === 0) {
      await storageAdapter.setItem(KEY, SAMPLE_SLIPS);
      return SAMPLE_SLIPS;
    }
    return list;
  }

  public async getById(id: string): Promise<Slip | undefined> {
    const slips = await this.getAll();
    return slips.find((s) => s.id === id);
  }

  public async save(data: Omit<Slip, 'id' | 'createdAt'> & { id?: string }): Promise<Slip> {
    const slips = await this.getAll();
    if (data.id) {
      const idx = slips.findIndex((s) => s.id === data.id);
      if (idx >= 0) {
        const updated: Slip = {
          ...slips[idx],
          ...data,
          id: data.id,
        };
        slips[idx] = updated;
        await storageAdapter.setItem(KEY, slips);
        return updated;
      }
    }

    const newSlip: Slip = {
      ...data,
      id: `slip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    slips.unshift(newSlip);
    await storageAdapter.setItem(KEY, slips);
    return newSlip;
  }

  public async delete(id: string): Promise<void> {
    const slips = await this.getAll();
    const filtered = slips.filter((s) => s.id !== id);
    await storageAdapter.setItem(KEY, filtered);
  }

  public async resetToSample(): Promise<Slip[]> {
    await storageAdapter.setItem(KEY, SAMPLE_SLIPS);
    return SAMPLE_SLIPS;
  }
}

export const slipRepository = new SlipRepository();
