'use client';

import { motion } from 'framer-motion';
import { CircleCheck, CircleX, CircleSlash, Clock, Gavel } from 'lucide-react';
import type { Forecast } from '@/lib/contract';
import { shortAddr, rulingColor, rulingBorder, rulingLabel } from '@/lib/format';

const ICON: Record<string, typeof CircleCheck> = {
  YES: CircleCheck,
  NO: CircleX,
  INVALID: CircleSlash,
};

export function ForecastCard({
  forecast,
  fresh,
  pending,
  onResolve,
}: {
  forecast: Forecast;
  fresh?: boolean;
  pending?: boolean;
  onResolve?: (f: Forecast) => void;
}) {
  const resolved = forecast.status === 'RESOLVED';
  const Icon = resolved ? ICON[forecast.ruling] ?? CircleSlash : Clock;
  const accent = resolved ? rulingColor[forecast.ruling] ?? 'text-slatey' : 'text-cyan';
  const frame = resolved ? rulingBorder[forecast.ruling] ?? 'border-cyan/20' : 'border-cyan/20';

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`schematic group relative flex flex-col border bg-navy-800 p-6 transition-transform hover:-translate-y-1 ${
        fresh ? 'animate-flashframe' : frame
      } ${pending ? 'border-dashed opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-10 w-10 items-center justify-center border ${frame} bg-navy`}>
            <Icon size={18} className={accent} />
          </span>
          <span className={`font-mono text-xs font-600 uppercase tracking-wider ${accent}`}>
            {resolved ? rulingLabel[forecast.ruling] : 'Open'}
          </span>
        </div>
        {resolved ? (
          <div className="text-right">
            <div className={`tabular font-display text-3xl font-700 ${accent}`}>{forecast.confidence}</div>
            <div className="uplabel text-faint">confidence</div>
          </div>
        ) : (
          <span className="font-mono text-xs text-faint">{forecast.id}</span>
        )}
      </div>

      <h3 className="mt-5 font-display text-lg font-600 leading-snug tracking-tight text-ink">
        {forecast.claim}
      </h3>

      <div className="mt-4 border-l border-cyan/30 pl-3">
        <p className="uplabel text-faint">Resolution criteria</p>
        <p className="mt-1 line-clamp-4 font-body text-sm leading-relaxed text-slatey">
          {forecast.criteria}
        </p>
      </div>

      {resolved && forecast.rationale && (
        <div className="mt-4 border-l border-cyan/30 pl-3">
          <p className="uplabel text-faint">Oracle rationale</p>
          <p className="mt-1 font-body text-sm italic text-ink/80">{forecast.rationale}</p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-cyan/10 pt-3 font-mono text-xs text-faint">
        <span>by {shortAddr(forecast.creator)}</span>
        {resolved ? (
          <span>via {shortAddr(forecast.resolver)}</span>
        ) : (
          onResolve && (
            <button
              type="button"
              onClick={() => onResolve(forecast)}
              className="focus-ring flex items-center gap-1.5 border border-cyan bg-cyan/10 px-3 py-1.5 font-600 uppercase tracking-wider text-cyan transition-colors hover:bg-cyan/20"
            >
              <Gavel size={13} /> Resolve
            </button>
          )
        )}
      </div>

      {pending && (
        <span className="absolute -top-3 left-4 animate-pulsechip border border-invalid bg-navy px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-invalid">
          Pending
        </span>
      )}
    </motion.article>
  );
}
