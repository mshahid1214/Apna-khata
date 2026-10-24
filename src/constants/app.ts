/**
 * Application Constants
 * The application name is defined in one central constant so it is easy to change.
 */

export const APP_NAME = "Apna Khata | اپنا کھاتہ";
export const APP_NAME_SHORT = "Apna Khata";
export const APP_NAME_URDU = "اپنا کھاتہ";
export const APP_TAGLINE = "جنوبی پنجاب پھل و کپاس منڈی بہی کھاتہ";

export const LEGAL_FOOTER_NOTE = "Records here are for personal bookkeeping and are not official receipts.";
export const LEGAL_FOOTER_NOTE_UR = "یہاں موجود ریکارڈ صرف ذاتی حساب کتاب کے لیے ہیں اور کوئی سرکاری رسید نہیں ہیں۔";
export const LEGAL_FOOTER_NOTE_LATN = "Ye records sirf zaati hisaab kitaab ke liye hain aur koi sarkari raseed nahi hain.";

export const MANDI_LOCATIONS = [
  { id: 'multan', nameUr: 'غلہ منڈی ملتان', nameLatn: 'Ghalla Mandi Multan', nameEn: 'Multan Mandi' },
  { id: 'khanewal', nameUr: 'فروٹ منڈی خانیوال', nameLatn: 'Fruit Mandi Khanewal', nameEn: 'Khanewal Mandi' },
  { id: 'bahawalpur', nameUr: 'اناج منڈی بہاولپور', nameLatn: 'Anaj Mandi Bahawalpur', nameEn: 'Bahawalpur Mandi' },
  { id: 'ryk', nameUr: 'منڈی رحیم یار خان', nameLatn: 'Mandi Rahim Yar Khan', nameEn: 'Rahim Yar Khan Mandi' },
];

export const COMMODITY_KEYS = ['mango', 'citrus', 'dates', 'cotton'] as const;

export const ROLE_KEYS = ['farmer', 'arhti', 'cold_storage', 'transporter', 'buyer'] as const;
