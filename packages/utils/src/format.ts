export function formatCurrency(
  amount: string | number,
  currency: "USD" | "THB" = "USD",
  locale: "en" | "th" = "en"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  const formatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "th-TH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  
  return formatter.format(num);
}

export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatTokenAmount(
  amount: string | number,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const adjusted = num / Math.pow(10, decimals);
  
  if (adjusted < 0.0001) {
    return adjusted.toExponential(2);
  }
  
  return adjusted.toFixed(displayDecimals);
}

export function formatAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}