// ============================================================================
// FILE: lib/utils/currency.ts
// ============================================================================
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseCurrency(value: string): number {
  return parseInt(value.replace(/\D/g, ""), 10) || 0;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("id-ID").format(value);
}