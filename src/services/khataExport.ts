import { KhataEntry, Party } from '../types';
import { formatPKR } from './formatters';

/**
 * Format and trigger WhatsApp sharing with an authentic Urdu statement
 */
export function shareKhataWhatsApp(
  entries: KhataEntry[],
  farmer: Party,
  arhti: Party,
  netBalance: number
) {
  const totalAdvances = entries
    .filter((e) => e.entryType === 'advance_cash' || e.entryType === 'input_item')
    .reduce((sum, e) => sum + e.amountPKR, 0);

  const totalProceeds = entries
    .filter((e) => e.entryType === 'sale_proceed')
    .reduce((sum, e) => sum + e.amountPKR, 0);

  const totalDeductions = entries
    .filter((e) => e.entryType === 'deduction')
    .reduce((sum, e) => sum + e.amountPKR, 0);

  const balanceText =
    netBalance > 0
      ? `آڑھتی نے کسان کو دینے ہیں: Rs. ${Math.abs(netBalance).toLocaleString('en-US')}`
      : netBalance < 0
      ? `کسان کے ذمہ واجب الادا: Rs. ${Math.abs(netBalance).toLocaleString('en-US')}`
      : 'حساب بالکل برابر (صفر)';

  let text = `📜 *اپنا کھاتہ | باہمی بہی کھاتہ اسٹیٹمنٹ*\n`;
  text += `🌾 کسان: ${farmer.nameUr || farmer.name} (${farmer.village})\n`;
  text += `⚖️ آڑھتی: ${arhti.nameUr || arhti.name} (${arhti.village})\n`;
  text += `📅 تاریخ جاری: ${new Date().toLocaleDateString('en-GB')}\n\n`;

  text += `*اعداد و شمار خلاصہ:*\n`;
  text += `• کل پیشگی و کھاد بیج ادھار: Rs. ${totalAdvances.toLocaleString('en-US')}\n`;
  text += `• کل فصل فروخت آمدن: Rs. ${totalProceeds.toLocaleString('en-US')}\n`;
  text += `• کل منڈی کٹوتیاں: Rs. ${totalDeductions.toLocaleString('en-US')}\n`;
  text += `--------------------------\n`;
  text += `📌 *موجودہ بقایا: ${balanceText}*\n\n`;

  text += `*حالیہ اندراجات (${entries.length}):*\n`;
  entries.slice(-5).forEach((e, idx) => {
    const typeLabel =
      e.entryType === 'advance_cash'
        ? 'پیشگی نقد'
        : e.entryType === 'input_item'
        ? 'کھاد / بیج'
        : e.entryType === 'sale_proceed'
        ? 'فصل فروخت'
        : e.entryType === 'deduction'
        ? 'کٹوتی'
        : 'ادائیگی';
    const flowSign = e.flowType === 'given' ? 'بنام (-)' : 'جمع (+)';
    text += `${idx + 1}. ${e.date} | ${typeLabel} | Rs. ${e.amountPKR.toLocaleString(
      'en-US'
    )} ${flowSign}\n`;
  });

  text += `\n_نوٹ: یہ ریکارڈ ذاتی حساب کتاب کے لیے ہے اور کوئی سرکاری رسید نہیں ہے۔_`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Export Khata entries to UTF-8 CSV with BOM for Excel compatibility
 */
export function exportKhataCSV(
  entries: KhataEntry[],
  farmerName: string,
  arhtiName: string
) {
  const headers = [
    'تاریخ (Date)',
    'اندراج کی قسم (Type)',
    'تفصیل (Description)',
    'سیزن (Season)',
    'رقم (Amount PKR)',
    'بنام / دیا (Debit)',
    'جمع / لیا (Credit)',
    'بقایا (Running Balance)',
    'کسان تصدیق (Farmer Verified)',
    'آڑھتی تصدیق (Arhti Verified)',
  ];

  const rows = entries.map((e) => [
    `"${e.date}"`,
    `"${e.entryType}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    `"${e.season}"`,
    e.amountPKR,
    e.debitPKR,
    e.creditPKR,
    e.runningBalancePKR,
    e.farmerConfirmed ? 'ہاں (Yes)' : 'نہیں (No)',
    e.arhtiConfirmed ? 'ہاں (Yes)' : 'نہیں (No)',
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Khata_${farmerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
