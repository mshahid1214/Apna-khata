import { SaleSlip, Role, Commodity, SlipVersionRecord } from '../types';
import { storageAdapter } from './storageAdapter';
import { SAMPLE_SALE_SLIPS } from './sampleSaleSlips';
import { khataRepository } from './khataRepository';

const KEY = 'sale_slips_v2';

export class SaleSlipRepository {
  public async getAll(): Promise<SaleSlip[]> {
    const list = await storageAdapter.getItem<SaleSlip[]>(KEY, []);
    if (!list || list.length === 0) {
      await storageAdapter.setItem(KEY, SAMPLE_SALE_SLIPS);
      return SAMPLE_SALE_SLIPS;
    }
    return list;
  }

  public async getById(id: string): Promise<SaleSlip | undefined> {
    const all = await this.getAll();
    return all.find((s) => s.id === id);
  }

  public async save(
    data: Omit<SaleSlip, 'id' | 'createdAt' | 'history'> & {
      id?: string;
      history?: SlipVersionRecord[];
    },
    editorRole: Role,
    editorName: string
  ): Promise<SaleSlip> {
    const all = await this.getAll();
    const isEdit = Boolean(data.id);

    let targetSlip: SaleSlip;

    if (isEdit && data.id) {
      const idx = all.findIndex((s) => s.id === data.id);
      if (idx >= 0) {
        const old = all[idx];
        const newHistory = [...(old.history || [])];

        // Audit check
        if (old.grossAmount !== data.grossAmount || old.ratePerUnit !== data.ratePerUnit || old.netWeight !== data.netWeight) {
          const audit: SlipVersionRecord = {
            id: `ver-${Date.now()}`,
            timestamp: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            editedByRole: editorRole,
            editedByName: editorName,
            changeSummary: `ریٹ یا وزن میں ترمیم از طرف ${editorName}: کل مالیت Rs. ${old.grossAmount.toLocaleString('en-US')} ➔ Rs. ${data.grossAmount.toLocaleString('en-US')}`,
            previousGross: old.grossAmount,
            previousNet: old.netPayable,
          };
          newHistory.unshift(audit);
        }

        targetSlip = {
          ...old,
          ...data,
          id: data.id,
          history: newHistory,
        };
        all[idx] = targetSlip;
      } else {
        targetSlip = this.createNewSlip(data);
        all.unshift(targetSlip);
      }
    } else {
      targetSlip = this.createNewSlip(data);
      all.unshift(targetSlip);
    }

    await storageAdapter.setItem(KEY, all);
    return targetSlip;
  }

  private createNewSlip(data: any): SaleSlip {
    const now = new Date();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const serial = data.serialNumber || `SLP-${now.getFullYear()}-${randomSeq}`;

    return {
      ...data,
      id: `sale-${Date.now()}-${randomSeq}`,
      serialNumber: serial,
      status: 'active',
      isLinkedToKhata: false,
      history: [],
      isSample: false,
      createdAt: now.toISOString(),
    };
  }

  public async cancelSlip(
    id: string,
    reason: string,
    cancelledByRole: Role,
    cancelledByName: string
  ): Promise<SaleSlip | undefined> {
    const all = await this.getAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx < 0) return undefined;

    const slip = all[idx];
    slip.status = 'cancelled';
    slip.cancelledReason = reason;
    slip.cancelledBy = `${cancelledByName} (${cancelledByRole})`;
    slip.cancelledAt = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    all[idx] = slip;
    await storageAdapter.setItem(KEY, all);
    return slip;
  }

  /**
   * One-tap linking: posts Sale Proceeds and Deductions into farmer's Khata
   */
  public async linkToFarmerKhata(slipId: string): Promise<SaleSlip | undefined> {
    const all = await this.getAll();
    const idx = all.findIndex((s) => s.id === slipId);
    if (idx < 0) return undefined;

    const slip = all[idx];
    if (slip.isLinkedToKhata || slip.status === 'cancelled') return slip;

    // 1. Post Sale Proceed (جمع / Credit)
    const proceedEntry = await khataRepository.save(
      {
        date: slip.date,
        farmerId: slip.farmerId,
        farmerName: slip.farmerName,
        arhtiId: slip.arhtiId,
        arhtiName: slip.arhtiName,
        entryType: 'sale_proceed',
        flowType: 'received',
        description: `بولی پرچی ${slip.serialNumber}: ${slip.variety} (${slip.crateCount} پیٹی / ${slip.netWeight} ${slip.unit})`,
        amountPKR: slip.grossAmount,
        debitPKR: 0,
        creditPKR: slip.grossAmount,
        season: 'سیزن آم 2026',
        notes: `خریدار: ${slip.buyerName} | ریٹ: Rs. ${slip.ratePerUnit}`,
        farmerConfirmed: true,
        arhtiConfirmed: true,
        isSample: false,
      },
      'arhti',
      slip.arhtiName
    );

    // 2. If deductions exist, post deduction entry (بنام / Debit)
    if (slip.totalDeductions > 0) {
      await khataRepository.save(
        {
          date: slip.date,
          farmerId: slip.farmerId,
          farmerName: slip.farmerName,
          arhtiId: slip.arhtiId,
          arhtiName: slip.arhtiName,
          entryType: 'deduction',
          flowType: 'given',
          description: `منڈی کٹوتیاں پرچی ${slip.serialNumber} (کمیشن، کانٹا، مزدوری، کرایہ)`,
          amountPKR: slip.totalDeductions,
          debitPKR: slip.totalDeductions,
          creditPKR: 0,
          season: 'سیزن آم 2026',
          deductionDetails: {
            commissionPKR: slip.deductions.commissionPKR,
            laborPKR: slip.deductions.laborPKR,
            marketFeePKR: slip.deductions.marketFeePKR,
            transportPKR: slip.deductions.transportPKR,
            otherFeePKR: slip.deductions.otherDeductionPKR,
          },
          notes: `خالص واجب الادا رقم: Rs. ${slip.netPayable}`,
          farmerConfirmed: true,
          arhtiConfirmed: true,
          isSample: false,
        },
        'arhti',
        slip.arhtiName
      );
    }

    slip.isLinkedToKhata = true;
    slip.linkedKhataEntryId = proceedEntry.id;
    all[idx] = slip;

    await storageAdapter.setItem(KEY, all);
    return slip;
  }

  public async getDailySummary(dateStr?: string) {
    const all = await this.getAll();
    const targetDate = dateStr || new Date().toLocaleDateString('en-GB');

    // Filter by active slips on target date (or all active if dateStr is 'all')
    const activeSlips = all.filter(
      (s) => s.status === 'active' && (dateStr === 'all' || s.date === targetDate)
    );

    let totalWeight = 0;
    let totalGross = 0;
    let totalNet = 0;

    const byCommodity: Record<Commodity, { count: number; weight: number; gross: number; net: number; crates: number }> = {
      mango: { count: 0, weight: 0, gross: 0, net: 0, crates: 0 },
      citrus: { count: 0, weight: 0, gross: 0, net: 0, crates: 0 },
      dates: { count: 0, weight: 0, gross: 0, net: 0, crates: 0 },
      cotton: { count: 0, weight: 0, gross: 0, net: 0, crates: 0 },
    };

    activeSlips.forEach((s) => {
      totalWeight += s.netWeight;
      totalGross += s.grossAmount;
      totalNet += s.netPayable;

      if (byCommodity[s.commodity]) {
        byCommodity[s.commodity].count += 1;
        byCommodity[s.commodity].weight += s.netWeight;
        byCommodity[s.commodity].gross += s.grossAmount;
        byCommodity[s.commodity].net += s.netPayable;
        byCommodity[s.commodity].crates += s.crateCount;
      }
    });

    return {
      targetDate,
      totalSlips: activeSlips.length,
      totalWeight,
      totalGross,
      totalNet,
      byCommodity,
    };
  }

  public async resetToSample(): Promise<SaleSlip[]> {
    await storageAdapter.setItem(KEY, SAMPLE_SALE_SLIPS);
    return SAMPLE_SALE_SLIPS;
  }
}

export const saleSlipRepository = new SaleSlipRepository();
