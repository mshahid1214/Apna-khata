import { WeightUnit } from '../types';

/**
 * Standard unit converter for South Punjab mandi calculations.
 * Supports configurable Man weight (default 40kg, or local 40.85kg Multan standard).
 */
export function convertToKg(
  quantity: number,
  unit: WeightUnit,
  manKgWeight = 40,
  petiWeightKg = 10
): number {
  if (isNaN(quantity) || quantity <= 0) return 0;
  switch (unit) {
    case 'kg':
      return quantity;
    case 'man':
      return quantity * manKgWeight;
    case 'ton':
      return quantity * 1000;
    case 'peti':
      return quantity * (petiWeightKg || 10);
    default:
      return quantity;
  }
}

export function convertFromKgToMan(
  kgWeight: number,
  manKgWeight = 40
): number {
  if (isNaN(kgWeight) || kgWeight <= 0) return 0;
  return Number((kgWeight / manKgWeight).toFixed(2));
}

/**
 * Calculate net weight: Gross - Tare (weight of empty truck, tractor trolley, or crates)
 */
export function calculateNetWeight(gross: number, tare: number): number {
  const g = isNaN(gross) ? 0 : gross;
  const t = isNaN(tare) ? 0 : tare;
  return Math.max(0, g - t);
}

/**
 * Calculate total gross PKR value based on net quantity and unit rate
 */
export function calculateGrossAmount(
  netWeight: number,
  unit: WeightUnit,
  ratePerUnit: number,
  manKgWeight = 40,
  petiWeightKg = 10
): number {
  if (netWeight <= 0 || ratePerUnit <= 0) return 0;
  
  if (unit === 'man') {
    // Rate is per man, weight is in man
    return Math.round(netWeight * ratePerUnit);
  }
  if (unit === 'kg') {
    // If rate is per man, convert kg to man, or direct if per kg
    // Usually mandi quotes per man. If unit is kg, rate is per kg.
    return Math.round(netWeight * ratePerUnit);
  }
  if (unit === 'ton') {
    return Math.round(netWeight * ratePerUnit);
  }
  if (unit === 'peti') {
    return Math.round(netWeight * ratePerUnit);
  }
  return Math.round(netWeight * ratePerUnit);
}
