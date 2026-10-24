import { KhataEntry, Role, EditAuditRecord } from '../types';
import { storageAdapter } from './storageAdapter';
import { SAMPLE_KHATA_ENTRIES } from './sampleKhataData';

const KEY = 'khata_bahi_entries';

export class KhataRepository {
  public async getAll(): Promise<KhataEntry[]> {
    const list = await storageAdapter.getItem<KhataEntry[]>(KEY, []);
    if (!list || list.length === 0) {
      await storageAdapter.setItem(KEY, SAMPLE_KHATA_ENTRIES);
      return SAMPLE_KHATA_ENTRIES;
    }
    return list;
  }

  public async getByPair(farmerId: string, arhtiId: string): Promise<KhataEntry[]> {
    const all = await this.getAll();
    return all.filter((e) => e.farmerId === farmerId && e.arhtiId === arhtiId);
  }

  public async save(
    data: Omit<KhataEntry, 'id' | 'createdAt' | 'runningBalancePKR' | 'history'> & {
      id?: string;
      history?: EditAuditRecord[];
    },
    editorRole: Role,
    editorName: string
  ): Promise<KhataEntry> {
    const all = await this.getAll();
    const isEdit = Boolean(data.id);

    // Calculate Debit and Credit based on flowType
    // flowType 'given' (بنام / دیا) => debitPKR = amount, creditPKR = 0
    // flowType 'received' (جمع / لیا) => creditPKR = amount, debitPKR = 0
    const debitPKR = data.flowType === 'given' ? data.amountPKR : 0;
    const creditPKR = data.flowType === 'received' ? data.amountPKR : 0;

    let targetEntry: KhataEntry;

    if (isEdit && data.id) {
      const idx = all.findIndex((e) => e.id === data.id);
      if (idx >= 0) {
        const old = all[idx];
        const newHistory = [...(old.history || [])];

        // If amount or description changed, append to audit trail!
        if (old.amountPKR !== data.amountPKR || old.description !== data.description) {
          const audit: EditAuditRecord = {
            id: `aud-${Date.now()}`,
            editedByRole: editorRole,
            editedByName: editorName,
            timestamp: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            previousAmount: old.amountPKR,
            newAmount: data.amountPKR,
            previousDescription: old.description,
            changeSummary: `ترمیم برائے رقم (${old.amountPKR} تا ${data.amountPKR} روپے) از طرف ${editorName}`,
          };
          newHistory.unshift(audit);
        }

        targetEntry = {
          ...old,
          ...data,
          id: data.id,
          debitPKR,
          creditPKR,
          history: newHistory,
          // If an entry is modified, the other party needs to re-confirm
          farmerConfirmed: editorRole === 'farmer' ? true : false,
          arhtiConfirmed: editorRole === 'arhti' ? true : false,
        };
        all[idx] = targetEntry;
      } else {
        targetEntry = this.createNewEntry(data, debitPKR, creditPKR, editorRole);
        all.push(targetEntry);
      }
    } else {
      targetEntry = this.createNewEntry(data, debitPKR, creditPKR, editorRole);
      all.push(targetEntry);
    }

    // Recalculate running balances in chronological order for this pair
    this.recalculateBalances(all, data.farmerId, data.arhtiId);

    await storageAdapter.setItem(KEY, all);
    return targetEntry;
  }

  private createNewEntry(
    data: any,
    debitPKR: number,
    creditPKR: number,
    editorRole: Role
  ): KhataEntry {
    const nowStr = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      ...data,
      id: `kht-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      debitPKR,
      creditPKR,
      runningBalancePKR: 0,
      farmerConfirmed: editorRole === 'farmer',
      farmerConfirmedAt: editorRole === 'farmer' ? nowStr : undefined,
      arhtiConfirmed: editorRole === 'arhti',
      arhtiConfirmedAt: editorRole === 'arhti' ? nowStr : undefined,
      history: [],
      isSample: false,
      createdAt: new Date().toISOString(),
    };
  }

  private recalculateBalances(entries: KhataEntry[], farmerId: string, arhtiId: string) {
    const pairEntries = entries.filter((e) => e.farmerId === farmerId && e.arhtiId === arhtiId);

    // Sort chronologically
    pairEntries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let balance = 0;
    pairEntries.forEach((entry) => {
      // credit (فصل / جمع) increases balance (farmer gets credit), debit (پیشگی / بنام) decreases it
      balance += entry.creditPKR - entry.debitPKR;
      entry.runningBalancePKR = balance;
    });
  }

  public async toggleConfirmation(id: string, userRole: Role): Promise<KhataEntry | undefined> {
    const all = await this.getAll();
    const entry = all.find((e) => e.id === id);
    if (!entry) return undefined;

    const nowStr = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (userRole === 'farmer') {
      entry.farmerConfirmed = !entry.farmerConfirmed;
      entry.farmerConfirmedAt = entry.farmerConfirmed ? nowStr : undefined;
    } else {
      entry.arhtiConfirmed = !entry.arhtiConfirmed;
      entry.arhtiConfirmedAt = entry.arhtiConfirmed ? nowStr : undefined;
    }

    await storageAdapter.setItem(KEY, all);
    return entry;
  }

  public async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter((e) => e.id !== id);
    await storageAdapter.setItem(KEY, filtered);
  }

  public async resetToSample(): Promise<KhataEntry[]> {
    await storageAdapter.setItem(KEY, SAMPLE_KHATA_ENTRIES);
    return SAMPLE_KHATA_ENTRIES;
  }
}

export const khataRepository = new KhataRepository();
