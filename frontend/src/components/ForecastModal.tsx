'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Crosshair, TriangleAlert, ExternalLink, Wallet, Gavel } from 'lucide-react';
import type { useTransaction } from '@/hooks/useTransaction';
import type { Forecast } from '@/lib/contract';
import { ConsensusStage } from './ConsensusStage';
import { ForecastCard } from './ForecastCard';
import { EXPLORER, FAUCET } from '@/lib/contract';

const MAX_CLAIM = 160;
const MAX_CRITERIA = 400;
const MAX_EVIDENCE = 600;

export type ModalMode = 'open' | 'resolve';

interface Props {
  open: boolean;
  mode: ModalMode;
  target: Forecast | null;
  onClose: () => void;
  address: `0x${string}` | null;
  chainOk: boolean;
  onConnect: () => void;
  txApi: ReturnType<typeof useTransaction>;
  setTxInFlight: (v: boolean) => void;
}

export function ForecastModal({
  open,
  mode,
  target,
  onClose,
  address,
  chainOk,
  onConnect,
  txApi,
  setTxInFlight,
}: Props) {
  const { state, submitOpen, submitResolve, reset } = txApi;
  const [claim, setClaim] = useState('');
  const [criteria, setCriteria] = useState('');
  const [evidence, setEvidence] = useState('');
  const [confirming, setConfirming] = useState(false);
  const firstRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (open && state.phase === 'idle') {
      setClaim('');
      setCriteria('');
      setEvidence('');
      setConfirming(false);
      setTimeout(() => firstRef.current?.focus(), 80);
    }
  }, [open, mode, state.phase]);

  if (!open) return null;

  const busy = state.phase === 'wallet' || state.phase === 'submitted' || state.phase === 'consensus';

  const claimErr = claim.length === 0 ? 'Required' : claim.length > MAX_CLAIM ? 'Too long' : '';
  const criteriaErr = criteria.trim().length === 0 ? 'Required' : criteria.length > MAX_CRITERIA ? 'Too long' : '';
  const evidenceErr = evidence.trim().length === 0 ? 'Required' : evidence.length > MAX_EVIDENCE ? 'Too long' : '';
  const valid = mode === 'open' ? !claimErr && !criteriaErr : !evidenceErr;

  function handleClose() {
    if (busy) return;
    setConfirming(false);
    reset();
    onClose();
  }

  function startConfirm() {
    if (!valid) return;
    if (!address) {
      onConnect();
      return;
    }
    setConfirming(true);
  }

  async function doSubmit() {
    if (!address) return;
    setConfirming(false);
    if (mode === 'open') {
      await submitOpen(address, claim.trim(), criteria.trim(), 0, setTxInFlight);
    } else if (target) {
      await submitResolve(address, target.id, evidence.trim(), setTxInFlight);
    }
  }

  const title = mode === 'open' ? 'DRAFT A FORECAST' : 'SUBMIT EVIDENCE';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/85 p-0 backdrop-blur-sm sm:p-6"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto border border-cyan/30 bg-navy-900 sm:h-auto sm:max-h-[90vh]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan/20 bg-navy-900 px-6 py-4">
            <span className="flex items-center gap-2 font-display text-xl font-700 tracking-wide text-ink">
              <Crosshair size={20} className="text-cyan" /> {title}
            </span>
            {!busy && (
              <button type="button" aria-label="Close" onClick={handleClose} className="focus-ring text-faint hover:text-ink">
                <X size={22} />
              </button>
            )}
          </div>

          <div className="p-6">
            {/* FORM */}
            {state.phase === 'idle' && !confirming && (
              <div>
                {mode === 'resolve' && target && (
                  <div className="schematic mb-5 border border-cyan/20 bg-navy-800 p-4">
                    <p className="uplabel text-faint">Resolving</p>
                    <p className="mt-1 font-display text-base text-ink">{target.claim}</p>
                    <p className="mt-2 font-body text-xs leading-relaxed text-slatey">{target.criteria}</p>
                  </div>
                )}

                {mode === 'open' ? (
                  <>
                    <label className="block">
                      <span className="uplabel font-mono text-faint">Claim</span>
                      <input
                        ref={firstRef as React.RefObject<HTMLInputElement>}
                        value={claim}
                        onChange={(e) => setClaim(e.target.value.slice(0, MAX_CLAIM + 10))}
                        placeholder="A specific, checkable claim about the future"
                        className="focus-ring mt-2 w-full border border-cyan/20 bg-navy-800 px-4 py-3 font-body text-ink placeholder:text-faint"
                      />
                      <div className="mt-1 flex justify-between font-mono text-xs">
                        <span className="text-no">{claim.length > 0 ? claimErr : ''}</span>
                        <span className={claim.length > MAX_CLAIM ? 'text-no' : 'text-faint'}>
                          {claim.length}/{MAX_CLAIM}
                        </span>
                      </div>
                    </label>

                    <label className="mt-4 block">
                      <span className="uplabel font-mono text-faint">Resolution criteria</span>
                      <textarea
                        value={criteria}
                        onChange={(e) => setCriteria(e.target.value.slice(0, MAX_CRITERIA + 30))}
                        rows={5}
                        placeholder="Spell out exactly what makes this YES, NO, or INVALID, and which sources count."
                        className="focus-ring mt-2 w-full resize-none border border-cyan/20 bg-navy-800 px-4 py-3 font-body text-ink placeholder:text-faint"
                      />
                      <div className="mt-1 flex justify-between font-mono text-xs">
                        <span className="text-no">{criteria.length > 0 ? criteriaErr : ''}</span>
                        <span className={criteria.length > MAX_CRITERIA ? 'text-no' : 'text-faint'}>
                          {criteria.length}/{MAX_CRITERIA}
                        </span>
                      </div>
                    </label>
                  </>
                ) : (
                  <label className="block">
                    <span className="uplabel font-mono text-faint">Outcome evidence</span>
                    <textarea
                      ref={firstRef as React.RefObject<HTMLTextAreaElement>}
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value.slice(0, MAX_EVIDENCE + 40))}
                      rows={6}
                      placeholder="Describe the verifiable outcome and cite the deciding sources. The oracle judges only what the criteria support."
                      className="focus-ring mt-2 w-full resize-none border border-cyan/20 bg-navy-800 px-4 py-3 font-body text-ink placeholder:text-faint"
                    />
                    <div className="mt-1 flex justify-between font-mono text-xs">
                      <span className="text-no">{evidence.length > 0 ? evidenceErr : ''}</span>
                      <span className={evidence.length > MAX_EVIDENCE ? 'text-no' : 'text-faint'}>
                        {evidence.length}/{MAX_EVIDENCE}
                      </span>
                    </div>
                  </label>
                )}

                {!address ? (
                  <button
                    type="button"
                    onClick={onConnect}
                    className="focus-ring mt-6 flex w-full items-center justify-center gap-2 border border-cyan bg-cyan py-3.5 font-mono text-sm font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5"
                  >
                    <Wallet size={16} /> Connect wallet
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!valid}
                    onClick={startConfirm}
                    className="focus-ring mt-6 flex w-full items-center justify-center gap-2 border border-cyan bg-cyan py-3.5 font-mono text-sm font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {mode === 'open' ? <Crosshair size={16} /> : <Gavel size={16} />}
                    {mode === 'open' ? 'Open the forecast' : 'Send to the oracle'}
                  </button>
                )}
                {!chainOk && address && (
                  <p className="mt-3 text-center font-mono text-xs text-invalid">
                    Switch your wallet to Bradbury (4221) before submitting.
                  </p>
                )}
              </div>
            )}

            {/* CONFIRM */}
            {state.phase === 'idle' && confirming && (
              <div className="text-center">
                <span className="schematic mx-auto flex h-16 w-16 items-center justify-center border border-cyan/50 bg-cyan/5">
                  <TriangleAlert size={28} className="text-cyan" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-600 tracking-tight text-ink">Confirm submission</h3>
                <p className="mt-3 font-body text-sm text-slatey">
                  This submits a transaction on Bradbury Testnet. Network fees apply (mostly refunded
                  after the AI write). No deposit is taken. Continue?
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="focus-ring flex-1 border border-cyan/30 py-3 font-mono text-xs font-600 uppercase tracking-wider text-slatey hover:text-ink"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={doSubmit}
                    className="focus-ring flex-1 border border-cyan bg-cyan py-3 font-mono text-xs font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* WALLET / SUBMITTED */}
            {(state.phase === 'wallet' || state.phase === 'submitted') && (
              <div className="flex flex-col items-center py-10 text-center">
                <Crosshair size={44} className="animate-pulse text-cyan" />
                <h3 className="mt-5 font-display text-2xl font-600 tracking-tight text-ink">
                  {state.phase === 'wallet' ? 'Confirm in your wallet' : 'Submitted to Bradbury'}
                </h3>
                <p className="mt-2 font-body text-sm text-slatey">
                  {state.phase === 'wallet'
                    ? 'Approve the transaction to proceed.'
                    : 'Your submission is queued. Consensus is beginning.'}
                </p>
                {state.hash && (
                  <a
                    href={`${EXPLORER}/tx/${state.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 font-mono text-xs text-cyan hover:underline"
                  >
                    View transaction <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}

            {/* CONSENSUS */}
            {state.phase === 'consensus' && (
              <div className="py-4">
                <ConsensusStage tx={state} />
              </div>
            )}

            {/* CONFIRMED */}
            {state.phase === 'confirmed' && (
              <div>
                <p className="text-center font-display text-2xl font-700 tracking-tight text-ink">
                  {state.kind === 'open' ? 'FORECAST IS ON THE BOARD' : 'THE ORACLE HAS RULED'}
                </p>
                <p className="mt-2 text-center font-body text-sm text-slatey">
                  {state.kind === 'open'
                    ? 'Anyone can now submit evidence to resolve it.'
                    : 'Sealed under validator consensus and written on-chain.'}
                </p>
                {state.result && (
                  <div className="mt-6">
                    <ForecastCard forecast={state.result} fresh />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="focus-ring mt-6 w-full border border-cyan bg-cyan py-3 font-mono text-xs font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5"
                >
                  Done
                </button>
              </div>
            )}

            {/* ERROR */}
            {state.phase === 'error' && (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center border border-no bg-navy">
                  <TriangleAlert size={28} className="text-no" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-600 tracking-tight text-ink">Submission failed</h3>
                <p className="mt-2 max-w-sm font-body text-sm text-slatey">{state.error}</p>
                {/fee reserve|LackOfFundForMaxFee/i.test(state.error ?? '') && (
                  <a href={FAUCET} target="_blank" rel="noopener noreferrer" className="mt-3 font-mono text-xs text-cyan hover:underline">
                    Claim test GEN
                  </a>
                )}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="focus-ring border border-cyan bg-cyan px-6 py-2.5 font-mono text-xs font-700 uppercase tracking-wider text-navy"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="focus-ring border border-cyan/30 px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-slatey hover:text-ink"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
