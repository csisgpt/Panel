export async function copyToClipboard(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }
  await navigator.clipboard.writeText(text);
  return true;
}
