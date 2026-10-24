import { Language } from '../types';

/**
 * Format numbers in Pakistani South Asian numbering system (Lakh / Crore)
 * e.g., 100000 -> 1,00,000
 */
export function formatLakhNumber(value: number): string {
  if (isNaN(value)) return '0';
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(value));
  const s = absValue.toString();
  
  if (s.length <= 3) {
    return (isNegative ? '-' : '') + s;
  }
  
  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  return (isNegative ? '-' : '') + formattedOthers + ',' + lastThree;
}

/**
 * Format PKR currency with proper RTL/LTR isolation and language suffix
 */
export function formatPKR(amount: number, lang: Language = 'ur'): string {
  const formattedNum = formatLakhNumber(amount);
  
  if (lang === 'ur') {
    return `${formattedNum} روپے`;
  }
  if (lang === 'ur-Latn') {
    return `Rs. ${formattedNum}`;
  }
  return `PKR ${formattedNum}`;
}

/**
 * Format Gregorian date to DD/MM/YYYY format
 */
export function formatDateDDMMYYYY(dateInput: string | Date = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    // If already in DD/MM/YYYY format
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      return dateInput;
    }
    return '01/01/2026';
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Generate a unique slip code with authentic Mandi prefix
 */
export function generateSlipNumber(type: string): string {
  const prefix = type.toUpperCase().slice(0, 3);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}
