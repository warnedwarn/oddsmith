export const shortAddr = (a: string): string =>
  a && a.length > 10 ? `${a.slice(0, 6)}\u2026${a.slice(-4)}` : a;

export const shortHash = (h: string): string =>
  h && h.length > 14 ? `${h.slice(0, 10)}\u2026${h.slice(-6)}` : h;

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const rulingColor: Record<string, string> = {
  YES: 'text-yes',
  NO: 'text-no',
  INVALID: 'text-invalid',
};

export const rulingBorder: Record<string, string> = {
  YES: 'border-yes',
  NO: 'border-no',
  INVALID: 'border-invalid',
};

export const rulingLabel: Record<string, string> = {
  YES: 'Resolved YES',
  NO: 'Resolved NO',
  INVALID: 'Invalid',
};
