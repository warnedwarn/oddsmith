'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchForecasts, fetchStats, type Forecast, type Stats } from '@/lib/contract';

const POLL_MS = 95000;

export interface ContractData {
  forecasts: Forecast[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  derived: { total: number; open: number; resolved: number; yes: number; no: number; invalid: number };
  refresh: () => Promise<void>;
  setTxInFlight: (v: boolean) => void;
}

export function useContractData(): ContractData {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const txInFlight = useRef(false);
  const alive = useRef(true);

  const loadAll = useCallback(async () => {
    try {
      const all: Forecast[] = [];
      let start = 0;
      for (let guard = 0; guard < 50; guard++) {
        const page = await fetchForecasts(start);
        all.push(...page);
        if (page.length < 20) break;
        start += 20;
      }
      const s = await fetchStats();
      if (!alive.current) return;
      setForecasts(all);
      setStats(s);
      setError(null);
    } catch (e) {
      if (!alive.current) return;
      const msg = String(e);
      if (/contract not found|execution reverted/i.test(msg)) {
        setError(
          'No contract responded at the configured address on Bradbury. The deployment may need repair.',
        );
      } else {
        setError('Could not reach the contract.');
      }
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const setTxInFlight = useCallback((v: boolean) => {
    txInFlight.current = v;
  }, []);

  useEffect(() => {
    alive.current = true;
    loadAll();
    const id = setInterval(() => {
      if (!txInFlight.current) loadAll();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [loadAll]);

  const derived = useMemo(() => {
    const total = forecasts.length;
    const resolved = forecasts.filter((f) => f.status === 'RESOLVED');
    return {
      total,
      open: forecasts.filter((f) => f.status === 'OPEN').length,
      resolved: resolved.length,
      yes: resolved.filter((f) => f.ruling === 'YES').length,
      no: resolved.filter((f) => f.ruling === 'NO').length,
      invalid: resolved.filter((f) => f.ruling === 'INVALID').length,
    };
  }, [forecasts]);

  return { forecasts, stats, loading, error, derived, refresh, setTxInFlight };
}
