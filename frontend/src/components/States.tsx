'use client';

import { Crosshair, RefreshCw, TriangleAlert, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER } from '@/lib/contract';

export function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="schematic border border-cyan/10 bg-navy-800 p-6">
          <div className="flex justify-between">
            <div className="h-10 w-28 animate-pulse bg-cyan/10" />
            <div className="h-12 w-12 animate-pulse bg-cyan/10" />
          </div>
          <div className="mt-5 h-6 w-3/4 animate-pulse bg-cyan/10" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse bg-cyan/10" />
            <div className="h-3 w-5/6 animate-pulse bg-cyan/10" />
            <div className="h-3 w-2/3 animate-pulse bg-cyan/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="schematic flex flex-col items-center border border-dashed border-cyan/25 bg-navy-800 px-6 py-20 text-center">
      <span className="flex h-20 w-20 items-center justify-center border border-cyan/50 bg-cyan/5">
        <Crosshair size={34} className="text-cyan" />
      </span>
      <h3 className="mt-7 font-display text-2xl font-600 tracking-tight text-ink">No forecasts on the board</h3>
      <p className="mt-3 max-w-md font-body text-slatey">
        The board is empty. Draft the first forecast, set its resolution criteria, and let the oracle
        rule once the evidence is in.
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring mt-7 flex items-center gap-2 border border-cyan bg-cyan px-6 py-3 font-mono text-sm font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5"
      >
        <Crosshair size={16} /> Draft the first forecast
      </button>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="schematic flex flex-col items-center border border-no/40 bg-no/5 px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center border border-no bg-navy">
        <TriangleAlert size={28} className="text-no" />
      </span>
      <h3 className="mt-6 font-display text-2xl font-600 tracking-tight text-ink">Could not reach the oracle</h3>
      <p className="mt-2 max-w-md font-body text-sm text-slatey">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring flex items-center gap-2 border border-cyan bg-cyan px-5 py-2.5 font-mono text-xs font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5"
        >
          <RefreshCw size={14} /> Retry
        </button>
        <a
          href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring flex items-center gap-2 border border-cyan/30 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-slatey hover:text-ink"
        >
          Explorer <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
