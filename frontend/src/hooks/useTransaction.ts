'use client';

import { useCallback, useRef, useState } from 'react';
import {
  makeWalletClient,
  openForecast,
  resolveForecast,
  fetchForecasts,
  fetchStats,
  type Forecast,
} from '@/lib/contract';
import { pollUntilDecided, type LeaderDraft } from '@/lib/tx';

export type TxPhase = 'idle' | 'wallet' | 'submitted' | 'consensus' | 'confirmed' | 'error';
export type TxKind = 'open' | 'resolve';

export interface TxState {
  phase: TxPhase;
  kind: TxKind | null;
  hash: `0x${string}` | null;
  liveStatus: string;
  draft: LeaderDraft | null;
  result: Forecast | null;
  error: string | null;
}

const INITIAL: TxState = {
  phase: 'idle',
  kind: null,
  hash: null,
  liveStatus: '',
  draft: null,
  result: null,
  error: null,
};

function friendlyError(e: unknown): string {
  const m = String(e);
  if (/LackOfFundForMaxFee/i.test(m))
    return 'Your wallet is below the fee reserve for AI transactions (mostly refunded). Top up at testnet-faucet.genlayer.foundation';
  if (/reject|denied|4001/i.test(m)) return 'You cancelled the signature';
  if (/rate limit|429|-32/i.test(m)) return 'The network is congested. Your transaction may still be processing';
  if (/fetch|network|timeout/i.test(m)) return 'Network error. Check your connection';
  return 'The transaction failed. Please try again';
}

export function useTransaction(onConfirmed?: () => void) {
  const [state, setState] = useState<TxState>(INITIAL);
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState(INITIAL);
  }, []);

  const run = useCallback(
    async (
      kind: TxKind,
      address: `0x${string}`,
      send: (client: ReturnType<typeof makeWalletClient>) => Promise<`0x${string}`>,
      targetId: string | null,
      onFlight?: (v: boolean) => void,
    ) => {
      if (busy.current) return;
      busy.current = true;
      onFlight?.(true);
      setState({ ...INITIAL, phase: 'wallet', kind });
      try {
        const client = makeWalletClient(address);
        const hash = await send(client);
        setState((s) => ({ ...s, phase: 'submitted', hash }));
        setState((s) => ({ ...s, phase: 'consensus', liveStatus: 'PENDING' }));

        const { status, draft } = await pollUntilDecided(client, hash, (st, dr) => {
          setState((s) => ({ ...s, liveStatus: st, draft: dr }));
        });

        if (status === 'UNDETERMINED' || status === 'CANCELED' || status === 'TIMEOUT') {
          setState((s) => ({
            ...s,
            phase: 'error',
            error:
              status === 'TIMEOUT'
                ? 'The network is congested. Your transaction is still being processed'
                : 'Validators could not reach consensus on this submission',
          }));
          busy.current = false;
          onFlight?.(false);
          return;
        }

        // Read authoritative state back from the contract.
        let result: Forecast | null = null;
        for (let i = 0; i < 5; i++) {
          try {
            const stats = await fetchStats();
            const page = await fetchForecasts(Math.max(0, Math.floor(Math.max(0, stats.forecasts - 1) / 20) * 20));
            if (targetId) {
              result = page.find((f) => f.id === targetId) ?? null;
            } else {
              result = page.length ? page[page.length - 1] : null;
            }
            if (result) break;
          } catch {
            /* retry */
          }
          await new Promise((r) => setTimeout(r, 6000));
        }

        setState((s) => ({ ...s, phase: 'confirmed', result }));
        busy.current = false;
        onFlight?.(false);
        onConfirmed?.();
      } catch (e) {
        setState((s) => ({ ...s, phase: 'error', error: friendlyError(e) }));
        busy.current = false;
        onFlight?.(false);
      }
    },
    [onConfirmed],
  );

  const submitOpen = useCallback(
    (address: `0x${string}`, claim: string, criteria: string, resolveAfter: number, onFlight?: (v: boolean) => void) =>
      run('open', address, (c) => openForecast(c, claim, criteria, resolveAfter), null, onFlight),
    [run],
  );

  const submitResolve = useCallback(
    (address: `0x${string}`, forecastId: string, evidence: string, onFlight?: (v: boolean) => void) =>
      run('resolve', address, (c) => resolveForecast(c, forecastId, evidence), forecastId, onFlight),
    [run],
  );

  return { state, submitOpen, submitResolve, reset };
}
