'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '@/lib/format';

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? 'Copy to clipboard'}
      className="focus-ring relative inline-flex items-center gap-1 text-faint transition-colors hover:text-cyan"
      onClick={async () => {
        const ok = await copyToClipboard(value);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }
      }}
    >
      {copied ? <Check size={14} className="text-yes" /> : <Copy size={14} />}
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap border border-cyan/30 bg-navy-700 px-2 py-0.5 font-mono text-[10px] text-ink">
          Copied
        </span>
      )}
    </button>
  );
}
