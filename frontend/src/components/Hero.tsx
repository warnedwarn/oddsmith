'use client';

import { motion } from 'framer-motion';
import { Crosshair, ArrowDown } from 'lucide-react';
import { BlueprintCanvas } from './BlueprintCanvas';
import { CONTRACT_ADDRESS, EXPLORER, FAUCET } from '@/lib/contract';
import { shortAddr } from '@/lib/format';
import { CopyButton } from './CopyButton';

interface Props {
  onOpen: () => void;
  stats: { total: number; resolved: number; yes: number } | null;
}

export function Hero({ onOpen, stats }: Props) {
  const yesRate = stats && stats.resolved ? Math.round((stats.yes / stats.resolved) * 100) : null;
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <BlueprintCanvas />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/30 via-transparent to-navy" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 font-mono text-xs text-cyan"
        >
          <span className="uplabel border border-cyan/40 bg-cyan/5 px-3 py-1">On-chain prediction oracle</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 font-display text-[clamp(2.8rem,8vw,7rem)] font-700 leading-[0.95] tracking-tight text-ink"
        >
          MEASURE THE
          <br />
          <span className="text-cyan">FUTURE</span> ON-CHAIN
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mt-6 max-w-2xl font-body text-lg text-slatey sm:text-xl"
        >
          Draft a forecast with precise resolution criteria. When the evidence is in, an AI oracle
          rules YES, NO, or INVALID with a confidence reading, and every validator re-runs the call
          before it is etched on-chain. No stake, no custody, just a verifiable verdict.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button
            type="button"
            onClick={onOpen}
            className="focus-ring flex items-center gap-2 border border-cyan bg-cyan px-7 py-4 font-mono text-sm font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5"
          >
            <Crosshair size={18} /> Draft a forecast
          </button>
          <a
            href="#board"
            className="focus-ring flex items-center gap-2 border border-cyan/30 px-7 py-4 font-mono text-sm font-600 uppercase tracking-wider text-ink transition-colors hover:border-cyan/60"
          >
            View the board <ArrowDown size={16} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-14 grid max-w-3xl grid-cols-2 gap-px border border-cyan/20 bg-cyan/10 sm:grid-cols-4"
        >
          {[
            { k: 'Forecasts', v: stats ? stats.total : '\u2014' },
            { k: 'Resolved', v: stats ? stats.resolved : '\u2014' },
            { k: 'YES rate', v: yesRate === null ? '\u2014' : `${yesRate}%` },
            { k: 'Stake', v: 'None' },
          ].map((s) => (
            <div key={s.k} className="bg-navy-900 p-4">
              <div className="tabular font-display text-3xl font-700 text-cyan">{s.v}</div>
              <div className="uplabel mt-1 text-faint">{s.k}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-faint"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan" /> Live on Bradbury
          </span>
          <span className="flex items-center gap-2">
            Contract {shortAddr(CONTRACT_ADDRESS)}
            <CopyButton value={CONTRACT_ADDRESS} label="Copy contract address" />
          </span>
          <a href={FAUCET} target="_blank" rel="noopener noreferrer" className="focus-ring text-cyan hover:underline">
            Claim test GEN
          </a>
          <a
            href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring hover:text-ink"
          >
            Explorer
          </a>
        </motion.div>
      </div>
    </section>
  );
}
