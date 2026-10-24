import { Party } from '../types';
import { storageAdapter } from './storageAdapter';
import { SAMPLE_PARTIES } from './sampleData';

const KEY = 'parties';

export class PartyRepository {
  public async getAll(): Promise<Party[]> {
    const list = await storageAdapter.getItem<Party[]>(KEY, []);
    if (!list || list.length === 0) {
      await storageAdapter.setItem(KEY, SAMPLE_PARTIES);
      return SAMPLE_PARTIES;
    }
    return list;
  }

  public async getById(id: string): Promise<Party | undefined> {
    const parties = await this.getAll();
    return parties.find((p) => p.id === id);
  }

  public async save(data: Omit<Party, 'id' | 'createdAt'> & { id?: string }): Promise<Party> {
    const parties = await this.getAll();
    if (data.id) {
      const idx = parties.findIndex((p) => p.id === data.id);
      if (idx >= 0) {
        const updated: Party = {
          ...parties[idx],
          ...data,
          id: data.id,
        };
        parties[idx] = updated;
        await storageAdapter.setItem(KEY, parties);
        return updated;
      }
    }

    const newParty: Party = {
      ...data,
      id: `party-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toLocaleDateString('en-GB'),
      isSample: false,
    };
    parties.unshift(newParty);
    await storageAdapter.setItem(KEY, parties);
    return newParty;
  }

  public async updateBalance(id: string, delta: number): Promise<void> {
    const parties = await this.getAll();
    const idx = parties.findIndex((p) => p.id === id);
    if (idx >= 0) {
      parties[idx].currentBalance += delta;
      await storageAdapter.setItem(KEY, parties);
    }
  }

  public async delete(id: string): Promise<void> {
    const parties = await this.getAll();
    const filtered = parties.filter((p) => p.id !== id);
    await storageAdapter.setItem(KEY, filtered);
  }

  public async resetToSample(): Promise<Party[]> {
    await storageAdapter.setItem(KEY, SAMPLE_PARTIES);
    return SAMPLE_PARTIES;
  }
}

export const partyRepository = new PartyRepository();
