export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

export function validateBasketAllocations(
  allocations: Array<{ percentage: number }>
): { isValid: boolean; totalPercentage: number } {
  const totalPercentage = allocations.reduce(
    (sum, allocation) => sum + allocation.percentage,
    0
  );
  
  return {
    isValid: Math.abs(totalPercentage - 100) < 0.01, // Allow for small rounding errors
    totalPercentage,
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}