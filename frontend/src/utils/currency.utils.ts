export function formatCurrency(amount: number): string {
  return `RS ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}
