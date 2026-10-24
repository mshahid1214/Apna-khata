/**
 * User Data Privacy Export Service
 * Compliant with privacy regulations: exports user records in CSV format with UTF-8 BOM
 * for perfect rendering in Excel and mobile spreadsheets.
 */

import { saleSlipRepository } from '../repositories/saleSlipRepository';
import { khataRepository } from '../repositories/khataRepository';
import { lotRepository } from '../repositories/lotRepository';
import { biltyRepository } from '../repositories/biltyRepository';
import { coldStorageRepository } from '../repositories/coldStorageRepository';
import { UserProfile } from '../types';

export async function exportUserDataToCSV(profile: UserProfile | null) {
  const [slips, khataEntries, lots, bilties, bookings] = await Promise.all([
    saleSlipRepository.getAll(),
    khataRepository.getAll(),
    lotRepository.getAll(),
    biltyRepository.getAll(),
    coldStorageRepository.getBookings(),
  ]);

  const userName = profile?.name || 'User';
  const userPhone = profile?.phone || '';
  const userDistrict = profile?.district || '';
  const userRole = profile?.role || 'user';

  const rows: string[] = [];

  // UTF-8 BOM
  const BOM = '\uFEFF';

  // Section 1: User Profile Header
  rows.push('--- اپنـا کھاتـہ کسٹمر ڈیٹا پورٹ فولیو (APNA KHATA USER DATA EXPORT) ---');
  rows.push(`صارف کا نام (Name),${escapeCSV(userName)}`);
  rows.push(`فون نمبر (Phone),${escapeCSV(userPhone)}`);
  rows.push(`کردار (Role),${escapeCSV(userRole)}`);
  rows.push(`ضلع (District),${escapeCSV(userDistrict)}`);
  rows.push(`تاریخ برآمد (Export Date),${escapeCSV(new Date().toLocaleString('en-GB'))}`);
  rows.push('');

  // Section 2: Mandi Sale Slips
  rows.push('--- منڈی بولی و فروخت پرچیاں (SALE SLIPS) ---');
  rows.push('سریل نمبر,تاریخ,کسان,آڑھتی,خریدار,فصل,قسم,وزن (کلو),خالص رقم (روپے),حیثیت');
  slips.forEach((s) => {
    rows.push(
      [
        escapeCSV(s.serialNumber),
        escapeCSV(s.date),
        escapeCSV(s.farmerName),
        escapeCSV(s.arhtiName),
        escapeCSV(s.buyerName),
        escapeCSV(s.commodity),
        escapeCSV(s.variety),
        s.netWeight,
        s.netPayable,
        escapeCSV(s.status),
      ].join(',')
    );
  });
  rows.push('');

  // Section 3: Khata Ledger Entries
  rows.push('--- بہی کھاتہ اندراجات (KHATA LEDGER RECORDS) ---');
  rows.push('تاریخ,تفصیل,کسان,آڑھتی,بنام / دیا (روپے),جمع / لیا (روپے),سیزن,تصدیق کسان,تصدیق آڑھتی');
  khataEntries.forEach((k) => {
    rows.push(
      [
        escapeCSV(k.date),
        escapeCSV(k.description),
        escapeCSV(k.farmerName),
        escapeCSV(k.arhtiName),
        k.debitPKR,
        k.creditPKR,
        escapeCSV(k.season),
        k.farmerConfirmed ? 'ہاں (Yes)' : 'نہیں (No)',
        k.arhtiConfirmed ? 'ہاں (Yes)' : 'نہیں (No)',
      ].join(',')
    );
  });
  rows.push('');

  // Section 4: Lots & Traceability
  rows.push('--- زرعی لاٹس و ٹریس ایبلٹی (CROP LOTS) ---');
  rows.push('لاٹ نمبر,فصل,قسم,درجہ,مقدار,یونٹ,تاریخ چنائی,باغ کا مقام');
  lots.forEach((l) => {
    rows.push(
      [
        escapeCSV(l.lotNumber),
        escapeCSV(l.crop),
        escapeCSV(l.variety),
        escapeCSV(l.grade),
        l.quantity,
        escapeCSV(l.unit),
        escapeCSV(l.harvestDate),
        escapeCSV(l.farmName),
      ].join(',')
    );
  });
  rows.push('');

  // Section 5: Consignment Bilties
  rows.push('--- بلٹی ٹرانسپورٹ ریکارڈ (BILTIES) ---');
  rows.push('بلٹی نمبر,تاریخ,بھیجنے والا,وصول کنندہ,گاڑی نمبر,روٹ,کل کرایہ (روپے),حیثیت');
  bilties.forEach((b) => {
    rows.push(
      [
        escapeCSV(b.biltyNumber),
        escapeCSV(b.date),
        escapeCSV(b.senderName),
        escapeCSV(b.receiverName),
        escapeCSV(b.vehicleNumber),
        escapeCSV(`${b.origin} تا ${b.destination}`),
        b.freightPKR,
        escapeCSV(b.status),
      ].join(',')
    );
  });
  rows.push('');

  // Section 6: Cold Storage Bookings
  rows.push('--- کولڈ اسٹوریج بکنگز (COLD STORAGE BOOKINGS) ---');
  rows.push('بکنگ نمبر,اسٹوریج کا نام,کسان,فصل,مطلوبہ ٹن,شروع تاریخ,حیثیت');
  bookings.forEach((bk) => {
    rows.push(
      [
        escapeCSV(bk.bookingNumber),
        escapeCSV(bk.facilityName),
        escapeCSV(bk.farmerName),
        escapeCSV(bk.commodity),
        bk.requestedTons,
        escapeCSV(bk.requestedStartDate),
        escapeCSV(bk.status),
      ].join(',')
    );
  });

  const csvContent = BOM + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `ApnaKhata_UserData_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
