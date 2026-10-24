import { LedgerEntry } from '../types';
import { storageAdapter } from './storageAdapter';
import { SAMPLE_LEDGER } from './sampleData';

const KEY = 'ledger_entries';

export class LedgerRepository {
  public async getAll(): Promise<LedgerEntry[]> {
    const list = await storageAdapter.getItem<LedgerEntry[]>(KEY, []);
    if (!list || list.length === 0) {
      await storageAdapter.setItem(KEY, SAMPLE_LEDGER);
      return SAMPLE_LEDGER;
    }
    return list;
  }

  public async getByPartyId(partyId: string): Promise<LedgerEntry[]> {
    const entries = await this.getAll();
    return entries.filter((e) => e.partyId === partyId);
  }

  public async save(data: Omit<LedgerEntry, 'id' | 'createdAt'> & { id?: string }): Promise<LedgerEntry> {
    const entries = await this.getAll();
    if (data.id) {
      const idx = entries.findIndex((e) => e.id === data.id);
      if (idx >= 0) {
        const updated: LedgerEntry = {
          ...entries[idx],
          ...data,
          id: data.id,
        };
        entries[idx] = updated;
        await storageAdapter.setItem(KEY, entries);
        return updated;
      }
    }

    const newEntry: LedgerEntry = {
      ...data,
      id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    entries.unshift(newEntry);
    await storageAdapter.setItem(KEY, entries);
    return newEntry;
  }

  public async delete(id: string): Promise<void> {
    const entries = await this.getAll();
    const filtered = entries.filter((e) => e.id !== id);
    await storageAdapter.setItem(KEY, filtered);
  }

  public async resetToSample(): Promise<LedgerEntry[]> {
    await storageAdapter.setItem(KEY, SAMPLE_LEDGER);
    return SAMPLE_LEDGER;
  }
}

export const ledgerRepository = new LedgerRepository();
