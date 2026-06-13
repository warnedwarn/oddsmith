'use client';

import { motion } from 'framer-motion';
import { PenLine, FileSearch, Network, Stamp } from 'lucide-react';

const STEPS = [
  {
    icon: PenLine,
    code: 'A.01',
    title: 'Draft the claim',
    body: 'State a future claim and write precise resolution criteria, the exact conditions for YES, NO, and INVALID. No deposit, only network fees.',
  },
  {
    icon: FileSearch,
    code: 'A.02',
    title: 'Submit evidence',
    body: 'When the outcome is knowable, anyone attaches outcome evidence of up to 600 characters. The oracle judges only what the criteria and evidence support.',
  },
  {
    icon: Network,
    code: 'A.03',
    title: 'Validators concur',
    body: 'Every validator re-runs the oracle independently. The ruling word must match exactly; the confidence reading must agree within tolerance, or the leader rotates.',
  },
  {
    icon: Stamp,
    code: 'A.04',
    title: 'Etched on-chain',
    body: 'The ruling, confidence, and rationale are written for good. A backstop caps INVALID confidence so a low-trust call can never masquerade as certain.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-cyan/15 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="uplabel font-mono text-cyan">Schematic of a forecast</span>
            <h2 className="mt-3 font-display text-4xl font-700 leading-tight tracking-tight text-ink sm:text-5xl">
              FROM CLAIM
              <br />
              TO CONSENSUS
            </h2>
          </div>
          <p className="max-w-md font-body text-slatey">
            Oddsmith is not a poll. The oracle ruling is the settlement, reproduced independently by
            every validator before the chain records it.
          </p>
        </div>

        <div className="mt-16 grid gap-px bg-cyan/15 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="schematic relative bg-navy-900 p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center border border-cyan/50 bg-navy">
                    <Icon size={20} className="text-cyan" />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-cyan/60">{s.code}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-600 tracking-tight text-ink">{s.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-slatey">{s.body}</p>
                {i < STEPS.length - 1 && (
                  <svg
                    className="absolute -right-px top-1/2 hidden h-px w-8 lg:block"
                    viewBox="0 0 32 1"
                    aria-hidden="true"
                  >
                    <line
                      x1="0"
                      y1="0.5"
                      x2="32"
                      y2="0.5"
                      stroke="#39d3ff"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />
                  </svg>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
