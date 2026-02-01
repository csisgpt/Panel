export function maskIban(iban: string) {
  if (!iban) return "";
  const normalized = iban.replace(/\s+/g, "");
  return `${normalized.slice(0, 4)} ${"*".repeat(Math.max(0, normalized.length - 8))}${normalized.slice(-4)}`;
}

export function maskCard(card: string) {
  if (!card) return "";
  const normalized = card.replace(/\s+/g, "");
  return `${normalized.slice(0, 6)}${"*".repeat(Math.max(0, normalized.length - 10))}${normalized.slice(-4)}`;
}
