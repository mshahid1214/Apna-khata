/**
 * Shared Storage Adapter (LocalStorage + Firestore Persistence Engine)
 * Relies on Firestore's native client-side persistence and offline synchronization engine
 * to avoid duplicate writes and replay anomalies, while providing fast localStorage hydration.
 */

import { db, auth, savePublicVerification } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

const COLLECTION_MAP: Record<string, string> = {
  sale_slips_v2: 'sale_slips',
  khata_bahi_entries: 'khata_entries',
  apna_khata_cold_inventory_v1: 'cold_storage_items',
  apna_khata_cold_gatepasses_v1: 'cold_storage_gate_passes',
  apna_khata_cold_bookings_v1: 'cold_storage_bookings',
  apna_khata_bilties_v1: 'bilties',
  apna_khata_lots_v1: 'lots',
  apna_khata_parties: 'parties',
};

export class StorageAdapter {
  private prefix = 'apna_khata_v1_';

  public async getItem<T>(key: string, defaultValue: T): Promise<T> {
    // 1. Instant local read for snappy UI
    let localValue = defaultValue;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(this.prefix + key);
        if (raw) {
          localValue = JSON.parse(raw) as T;
        }
      }
    } catch (err) {
      console.warn(`[StorageAdapter] Local cache read warning for ${key}:`, err);
    }

    // 2. Fetch shared database records from Firestore
    const collectionName = COLLECTION_MAP[key];
    const currentUser = auth.currentUser;

    if (collectionName && typeof window !== 'undefined' && currentUser) {
      try {
        const remoteItems: any[] = [];
        const colRef = collection(db, collectionName);

        const snap = await getDocs(colRef);
        snap.forEach((docSnap) => {
          remoteItems.push({ ...docSnap.data(), id: docSnap.id });
        });

        if (remoteItems.length > 0) {
          const localArray = Array.isArray(localValue) ? localValue : [];
          const mergedMap = new Map<string, any>();

          localArray.forEach((item: any) => {
            if (item && item.id) mergedMap.set(item.id, item);
          });

          remoteItems.forEach((rItem: any) => {
            if (rItem && rItem.id) mergedMap.set(rItem.id, rItem);
          });

          const mergedList = Array.from(mergedMap.values()) as unknown as T;
          localStorage.setItem(this.prefix + key, JSON.stringify(mergedList));
          return mergedList;
        }
      } catch (firestoreErr) {
        console.info(`[StorageAdapter] Shared Firestore sync note for ${key}:`, firestoreErr);
      }
    }

    return localValue;
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    // 1. Immediate local save for instantaneous offline hydration
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
      }
    } catch (err) {
      console.error(`[StorageAdapter] Failed to save key ${key} to localStorage:`, err);
    }

    // 2. Write to Firestore directly.
    // NOTE: Firestore Web SDK natively buffers writes when offline and synchronizes
    // them automatically upon reconnection. We avoid custom duplicate queues.
    const collectionName = COLLECTION_MAP[key];
    const currentUser = auth.currentUser;

    if (collectionName && Array.isArray(value)) {
      for (const item of value) {
        if (!item || !item.id) continue;

        // Ensure participant tracking and creation metadata
        const participantUids: string[] = Array.isArray(item.participantUids)
          ? [...item.participantUids]
          : [];

        if (currentUser?.uid && !participantUids.includes(currentUser.uid)) {
          participantUids.push(currentUser.uid);
        }
        if (currentUser?.phoneNumber && !participantUids.includes(currentUser.phoneNumber)) {
          participantUids.push(currentUser.phoneNumber);
        }
        if (item.farmerId && !participantUids.includes(item.farmerId)) {
          participantUids.push(item.farmerId);
        }
        if (item.arhtiId && !participantUids.includes(item.arhtiId)) {
          participantUids.push(item.arhtiId);
        }
        if (item.buyerId && !participantUids.includes(item.buyerId)) {
          participantUids.push(item.buyerId);
        }
        if (item.operatorUid && !participantUids.includes(item.operatorUid)) {
          participantUids.push(item.operatorUid);
        }

        const payload = {
          ...item,
          participantUids,
          createdBy: item.createdBy || currentUser?.uid || 'offline_user',
          updatedAt: new Date().toISOString(),
        };

        try {
          // Native Firestore setDoc handles both online and offline persistence
          await setDoc(doc(db, collectionName, item.id), payload, { merge: true });

          if (collectionName === 'sale_slips') {
            await savePublicVerification({
              id: `slip-${item.id}`,
              type: 'slip',
              identifier: item.serialNumber || item.id,
              title: `منڈی رسید: ${item.variety || 'پھل'}`,
              date: item.date || new Date().toLocaleDateString('en-GB'),
              commodity: item.commodity || 'mango',
              variety: item.variety || '',
              grade: item.grade || '',
              quantity: item.netWeight || item.crateCount || 0,
              unit: item.unit || 'kg',
              status: item.status || 'active',
              netPayable: item.netPayable,
              isVerified: item.status !== 'cancelled',
              createdAt: item.createdAt || new Date().toISOString(),
            });
          } else if (collectionName === 'lots') {
            await savePublicVerification({
              id: `lot-${item.id}`,
              type: 'lot',
              identifier: item.lotNumber || item.id,
              title: `زرعی لاٹ پاسپورٹ: ${item.variety}`,
              date: item.harvestDate || new Date().toLocaleDateString('en-GB'),
              commodity: item.crop || 'mango',
              variety: item.variety || '',
              grade: item.grade || '',
              quantity: item.quantity || 0,
              unit: item.unit || 'kg',
              status: 'active',
              isVerified: true,
              createdAt: item.createdAt || new Date().toISOString(),
            });
          }
        } catch (writeErr) {
          console.warn(`[StorageAdapter] Firestore write note for ${item.id}:`, writeErr);
        }
      }
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.prefix + key);
      }
    } catch (err) {
      console.error(`[StorageAdapter] Failed to remove key ${key}:`, err);
    }
  }

  public async clearAll(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(this.prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch (err) {
      console.error('[StorageAdapter] Failed to clear keys:', err);
    }
  }
}

export const storageAdapter = new StorageAdapter();
