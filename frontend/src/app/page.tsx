'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, ListFilter, Activity } from 'lucide-react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { ForecastCard } from '@/components/ForecastCard';
import { Skeleton, EmptyState, ErrorState } from '@/components/States';
import { ForecastModal, type ModalMode } from '@/components/ForecastModal';
import { ToastProvider } from '@/components/Toast';
import { useWallet } from '@/hooks/useWallet';
import { useContractData } from '@/hooks/useContractData';
import { useTransaction } from '@/hooks/useTransaction';
import type { Forecast } from '@/lib/contract';

type Filter = 'ALL' | 'OPEN' | 'YES' | 'NO' | 'INVALID';

function Dashboard() {
  const wallet = useWallet();
  const data = useContractData();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('open');
  const [target, setTarget] = useState<Forecast | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const txApi = useTransaction(() => {
    void data.refresh();
  });

  const openDraft = () => {
    setMode('open');
    setTarget(null);
    setModalOpen(true);
  };
  const openResolve = (f: Forecast) => {
    setMode('resolve');
    setTarget(f);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const list = [...data.forecasts].sort((a, b) => b.index - a.index);
    if (filter === 'ALL') return list;
    if (filter === 'OPEN') return list.filter((f) => f.status === 'OPEN');
    return list.filter((f) => f.status === 'RESOLVED' && f.ruling === filter);
  }, [data.forecasts, filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'ALL', label: `All ${data.derived.total}` },
    { key: 'OPEN', label: `Open ${data.derived.open}` },
    { key: 'YES', label: `Yes ${data.derived.yes}` },
    { key: 'NO', label: `No ${data.derived.no}` },
    { key: 'INVALID', label: `Invalid ${data.derived.invalid}` },
  ];

  return (
    <>
      <Header wallet={wallet} onOpen={openDraft} />
      <main>
        <Hero onOpen={openDraft} stats={data.derived} />
        <HowItWorks />

        {/* BOARD */}
        <section id="board" className="border-t border-cyan/15 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="uplabel flex items-center gap-2 font-mono text-cyan">
                  <ListFilter size={14} /> The board
                </span>
                <h2 className="mt-3 font-display text-4xl font-700 leading-tight tracking-tight text-ink sm:text-5xl">
                  EVERY FORECAST
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`focus-ring border px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                      filter === f.key
                        ? 'border-cyan bg-cyan text-navy'
                        : 'border-cyan/20 text-slatey hover:border-cyan/50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12">
              {data.loading ? (
                <Skeleton />
              ) : data.error ? (
                <ErrorState message={data.error} onRetry={() => data.refresh()} />
              ) : data.forecasts.length === 0 ? (
                <EmptyState onOpen={openDraft} />
              ) : filtered.length === 0 ? (
                <div className="schematic border border-dashed border-cyan/20 bg-navy-800 px-6 py-14 text-center font-body text-slatey">
                  No forecasts match this filter yet.
                </div>
              ) : (
                <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((f) => (
                    <ForecastCard key={f.id} forecast={f} onResolve={openResolve} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* CTA */}
            <div className="schematic mt-16 flex flex-col items-center justify-between gap-6 border border-cyan bg-cyan/5 p-8 sm:flex-row">
              <div>
                <h3 className="flex items-center gap-2 font-display text-2xl font-700 tracking-tight text-ink">
                  <Activity size={22} className="text-cyan" /> GOT A CALL TO MAKE?
                </h3>
                <p className="mt-2 font-body text-slatey">
                  Draft a forecast with airtight criteria. When the evidence lands, the oracle rules
                  and the chain remembers.
                </p>
              </div>
              <button
                type="button"
                onClick={openDraft}
                className="focus-ring flex shrink-0 items-center gap-2 border border-cyan bg-cyan px-7 py-4 font-mono text-sm font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5"
              >
                <Crosshair size={18} /> Draft a forecast
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ForecastModal
        open={modalOpen}
        mode={mode}
        target={target}
        onClose={() => setModalOpen(false)}
        address={wallet.address}
        chainOk={wallet.chainOk}
        onConnect={wallet.connect}
        txApi={txApi}
        setTxInFlight={data.setTxInFlight}
      />
    </>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
