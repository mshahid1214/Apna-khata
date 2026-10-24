import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, PublicVerificationRecord } from '../types';

// 1. Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 2. Strict Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Please check your Firebase configuration: client is offline.');
    } else {
      console.info('[Firestore] Initial connection probe completed.');
    }
    return false;
  }
}

// 4. Authentication Methods
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<User> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (err) {
    console.error('[Auth] Google sign-in failed:', err);
    throw err;
  }
}

export async function logOut(): Promise<void> {
  await fbSignOut(auth);
}

// Phone Auth Support with Test Numbers for development
export interface DevTestPhoneUser {
  phone: string;
  name: string;
  role: 'farmer' | 'arhti' | 'cold_storage' | 'transporter' | 'buyer';
  district: string;
  otp: string;
}

export const DEV_TEST_USERS: DevTestPhoneUser[] = [
  {
    phone: '+92 300 1234567',
    name: 'حاجی غلام رسول (کسان)',
    role: 'farmer',
    district: 'ملتان (Multan)',
    otp: '123456',
  },
  {
    phone: '+92 301 7654321',
    name: 'ملک فاروق آڑھتی (کمیشن شاپ)',
    role: 'arhti',
    district: 'خانیوال (Khanewal)',
    otp: '123456',
  },
  {
    phone: '+92 302 9876543',
    name: 'بشیر احمد (کولڈ اسٹوریج آپریٹر)',
    role: 'cold_storage',
    district: 'وہاڑی (Vehari)',
    otp: '123456',
  },
];

// Profile Retrieval & Persistence
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    await setDoc(doc(db, 'users', profile.id), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Admin verification check
export async function checkIsAdmin(currentUser?: User | null): Promise<boolean> {
  const u = currentUser || auth.currentUser;
  if (!u) return false;
  if (u.email === 'zubairdev0@gmail.com') return true;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', u.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

// Delete user account & personal details while ANONYMIZING shared records (preserving ledger integrity)
export async function deleteUserData(uid: string): Promise<void> {
  try {
    // 1. Anonymize shared sale slips instead of deleting them (preserves counterpart's accounting)
    try {
      const slipsSnap = await getDocs(
        query(collection(db, 'sale_slips'), where('participantUids', 'array-contains', uid))
      );
      for (const d of slipsSnap.docs) {
        const data = d.data();
        const updates: any = {};
        if (data.farmerId === uid) {
          updates.farmerName = 'سابقہ کسان (اکاؤنٹ حذف شدہ)';
        }
        if (data.buyerId === uid) {
          updates.buyerName = 'سابقہ خریدار (اکاؤنٹ حذف شدہ)';
        }
        if (data.arhtiId === uid) {
          updates.arhtiName = 'سابقہ آڑھتی (اکاؤنٹ حذف شدہ)';
        }
        updates.participantUids = (data.participantUids || []).filter((id: string) => id !== uid);
        await updateDoc(d.ref, updates);
      }
    } catch (e) {
      console.warn('[deleteUserData] Slips anonymization note:', e);
    }

    // 2. Anonymize shared Khata bahi entries
    try {
      const khataSnap = await getDocs(
        query(collection(db, 'khata_entries'), where('participantUids', 'array-contains', uid))
      );
      for (const d of khataSnap.docs) {
        const data = d.data();
        const updates: any = {};
        if (data.farmerId === uid) {
          updates.farmerName = 'سابقہ کسان (اکاؤنٹ حذف شدہ)';
        }
        if (data.arhtiId === uid) {
          updates.arhtiName = 'سابقہ آڑھتی (اکاؤنٹ حذف شدہ)';
        }
        updates.participantUids = (data.participantUids || []).filter((id: string) => id !== uid);
        await updateDoc(d.ref, updates);
      }
    } catch (e) {
      console.warn('[deleteUserData] Khata anonymization note:', e);
    }

    // 3. Anonymize shared Lots
    try {
      const lotsSnap = await getDocs(
        query(collection(db, 'lots'), where('participantUids', 'array-contains', uid))
      );
      for (const d of lotsSnap.docs) {
        await updateDoc(d.ref, {
          farmerName: 'سابقہ کسان (اکاؤنٹ حذف شدہ)',
          participantUids: (d.data().participantUids || []).filter((id: string) => id !== uid),
        });
      }
    } catch (e) {
      console.warn('[deleteUserData] Lots anonymization note:', e);
    }

    // 4. Remove user's private address book parties
    try {
      const partiesSnap = await getDocs(
        query(collection(db, 'parties'), where('ownerUid', '==', uid))
      );
      for (const d of partiesSnap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn('[deleteUserData] Parties removal note:', e);
    }

    // 5. Remove user profile document
    await deleteDoc(doc(db, 'users', uid));

    // 6. Clean up local browser storage caches
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('apna_khata_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }

    // 7. Remove Auth account or Sign out
    const cur = auth.currentUser;
    if (cur && cur.uid === uid) {
      try {
        await cur.delete();
      } catch {
        await fbSignOut(auth);
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
  }
}

// Operator Verification (Admin feature)
export async function setOperatorVerification(userId: string, isVerified: boolean): Promise<void> {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      isVerified,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Fetch Admin System Counts
export async function getAdminSystemCounts(): Promise<{
  totalUsers: number;
  farmers: number;
  arhtis: number;
  operators: number;
  transporters: number;
  buyers: number;
  unverifiedOperators: number;
  usersList: UserProfile[];
}> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    usersSnap.forEach((d) => list.push(d.data() as UserProfile));

    const counts = {
      totalUsers: list.length,
      farmers: list.filter((u) => u.role === 'farmer').length,
      arhtis: list.filter((u) => u.role === 'arhti').length,
      operators: list.filter((u) => u.role === 'cold_storage').length,
      transporters: list.filter((u) => u.role === 'transporter').length,
      buyers: list.filter((u) => u.role === 'buyer').length,
      unverifiedOperators: list.filter((u) => (u.role === 'cold_storage' || u.role === 'arhti') && !u.isVerified).length,
      usersList: list,
    };
    return counts;
  } catch (err) {
    console.warn('[Admin] Falling back to default counts:', err);
    return {
      totalUsers: 0,
      farmers: 0,
      arhtis: 0,
      operators: 0,
      transporters: 0,
      buyers: 0,
      unverifiedOperators: 0,
      usersList: [],
    };
  }
}

// Public Non-Sensitive Verification (QR Scanner)
export async function getPublicVerification(id: string): Promise<PublicVerificationRecord | null> {
  const path = `public_verifications/${id}`;
  try {
    const snap = await getDoc(doc(db, 'public_verifications', id));
    if (snap.exists()) {
      return snap.data() as PublicVerificationRecord;
    }
    return null;
  } catch (err) {
    console.warn('[PublicVerification] Could not fetch public record:', err);
    return null;
  }
}

export async function savePublicVerification(record: PublicVerificationRecord): Promise<void> {
  const path = `public_verifications/${record.id}`;
  try {
    await setDoc(doc(db, 'public_verifications', record.id), record, { merge: true });
  } catch (err) {
    console.warn('[PublicVerification] Could not save public record:', err);
  }
}

// Initial connection check on script load
testFirestoreConnection();
