export function formatXAF(amount) {
  if (amount == null || isNaN(amount)) return "—";
  return (
    new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(amount) +
    " XAF"
  );
}
