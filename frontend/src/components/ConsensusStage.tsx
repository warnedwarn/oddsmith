'use client';

import { motion } from 'framer-motion';
import { Crosshair, Loader2, CircleCheck, CircleX, CircleSlash } from 'lucide-react';
import type { TxState } from '@/hooks/useTransaction';
import { rulingColor, rulingLabel } from '@/lib/format';

const STAGE_ORDER = ['SUBMITTED', 'PROPOSING', 'COMMITTING', 'REVEALING', 'ACCEPTED'];

function stageIndex(status: string): number {
  if (status === 'PENDING' || status === '') return 0;
  if (status === 'LEADER_TIMEOUT' || status === 'VALIDATORS_TIMEOUT') return 1;
  const i = STAGE_ORDER.indexOf(status);
  return i < 0 ? 1 : i;
}

const STAGES = [
  { key: 'SUBMITTED', label: 'Submitted', note: 'Transaction broadcast to Bradbury' },
  { key: 'PROPOSING', label: 'Oracle drafting', note: 'Leader runs the resolution prompt' },
  { key: 'COMMITTING', label: 'Validators re-running', note: 'Each re-derives the ruling' },
  { key: 'REVEALING', label: 'Revealing votes', note: 'Independent rulings compared' },
  { key: 'ACCEPTED', label: 'Etched on-chain', note: 'Ruling written under consensus' },
];

const ICON: Record<string, typeof CircleCheck> = {
  YES: CircleCheck,
  NO: CircleX,
  INVALID: CircleSlash,
};

export function ConsensusStage({ tx }: { tx: TxState }) {
  const idx = stageIndex(tx.liveStatus);
  const rotating = tx.liveStatus === 'LEADER_TIMEOUT' || tx.liveStatus === 'VALIDATORS_TIMEOUT';
  const draft = tx.draft;
  const DraftIcon = draft ? ICON[draft.ruling] ?? CircleSlash : CircleSlash;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <motion.span
          className="absolute inset-0 border border-cyan/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-6 border border-cyan/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <Crosshair size={52} className="text-cyan" />
      </div>

      <p className="uplabel mt-6 font-mono text-cyan">
        {rotating ? 'Rotating leader, still working' : 'Consensus in progress'}
      </p>
      <h3 className="mt-2 font-display text-2xl font-600 tracking-tight text-ink">The oracle deliberates</h3>
      <p className="mt-2 max-w-md font-body text-sm text-slatey">
        An AI write on Bradbury takes one to five minutes. Validators are re-deriving the ruling
        independently. This panel updates live.
      </p>

      <div className="mt-8 w-full max-w-md space-y-px border border-cyan/15 bg-cyan/10">
        {STAGES.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div
              key={s.key}
              className={`flex items-center gap-3 bg-navy-900 p-3 text-left ${active ? 'bg-cyan/5' : ''}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-xs ${
                  done
                    ? 'border-yes text-yes'
                    : active
                      ? 'border-cyan text-cyan'
                      : 'border-cyan/20 text-faint'
                }`}
              >
                {active ? <Loader2 size={13} className="animate-spin" /> : done ? '\u2713' : i + 1}
              </span>
              <div className="min-w-0">
                <p className={`font-mono text-xs uppercase tracking-wider ${done || active ? 'text-ink' : 'text-faint'}`}>
                  {s.label}
                </p>
                <p className="font-body text-xs text-faint">{s.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="schematic mt-6 w-full max-w-md border border-dashed border-cyan/40 bg-navy-800 p-4 text-left"
        >
          <p className="uplabel text-faint">Leader draft, sealing under consensus</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`flex items-center gap-2 font-mono text-sm font-600 uppercase ${rulingColor[draft.ruling] ?? 'text-ink'}`}>
              <DraftIcon size={16} />
              {rulingLabel[draft.ruling] ?? draft.ruling}
            </span>
            {typeof draft.confidence === 'number' && (
              <span className={`tabular font-display text-3xl font-700 ${rulingColor[draft.ruling] ?? 'text-ink'}`}>
                {draft.confidence}
              </span>
            )}
          </div>
          {draft.rationale && <p className="mt-2 font-body text-sm italic text-ink/80">{draft.rationale}</p>}
        </motion.div>
      )}

      <p className="mt-6 font-mono text-xs text-faint">
        Status: <span className="text-ink">{tx.liveStatus || 'PENDING'}</span>
      </p>
    </div>
  );
}
