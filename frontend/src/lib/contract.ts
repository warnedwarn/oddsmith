import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import type { GenLayerClient } from 'genlayer-js/types';

export const CONTRACT_ADDRESS = '0xCdefeC7a47AC26A10083E626e22d5e9d49eBf471' as const;
export const DEPLOY_TX =
  '0x2eba9b8c2fae10f78834f2091dd1c49d579497980fcea29e7156c1f472a9e7ce' as const;
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';
export const CHAIN_ID = 4221;

export type Ruling = 'YES' | 'NO' | 'INVALID' | '';

export interface Forecast {
  id: string;
  claim: string;
  criteria: string;
  resolve_after: number;
  creator: string;
  status: 'OPEN' | 'RESOLVED';
  ruling: Ruling;
  confidence: number;
  rationale: string;
  resolver: string;
  index: number;
}

export interface Stats {
  forecasts: number;
  resolved: number;
  yes: number;
  owner: string;
}

export const readClient: GenLayerClient<typeof testnetBradbury> = createClient({
  chain: testnetBradbury,
});

export function makeWalletClient(account: `0x${string}`) {
  return createClient({ chain: testnetBradbury, account } as Parameters<typeof createClient>[0]);
}

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!/rate limit|429|timeout|network|fetch|-32/i.test(String(e))) throw e;
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

function pick(raw: unknown, k: string): unknown {
  if (raw instanceof Map) return raw.get(k);
  if (raw && typeof raw === 'object') return (raw as Record<string, unknown>)[k];
  return undefined;
}

function normalizeForecast(raw: unknown): Forecast {
  const r = String(pick(raw, 'ruling') ?? '').toUpperCase();
  const status = String(pick(raw, 'status') ?? 'OPEN').toUpperCase();
  return {
    id: String(pick(raw, 'id') ?? ''),
    claim: String(pick(raw, 'claim') ?? ''),
    criteria: String(pick(raw, 'criteria') ?? ''),
    resolve_after: Number(pick(raw, 'resolve_after') ?? 0),
    creator: String(pick(raw, 'creator') ?? ''),
    status: status === 'RESOLVED' ? 'RESOLVED' : 'OPEN',
    ruling: (['YES', 'NO', 'INVALID'].includes(r) ? r : '') as Ruling,
    confidence: Number(pick(raw, 'confidence') ?? 0),
    rationale: String(pick(raw, 'rationale') ?? ''),
    resolver: String(pick(raw, 'resolver') ?? ''),
    index: Number(pick(raw, 'index') ?? 0),
  };
}

function normalizeStats(raw: unknown): Stats {
  return {
    forecasts: Number(pick(raw, 'forecasts') ?? 0),
    resolved: Number(pick(raw, 'resolved') ?? 0),
    yes: Number(pick(raw, 'yes') ?? 0),
    owner: String(pick(raw, 'owner') ?? ''),
  };
}

export async function fetchForecasts(start = 0): Promise<Forecast[]> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_forecasts',
      args: [start],
    }),
  );
  return Array.isArray(res) ? res.map(normalizeForecast) : [];
}

export async function fetchStats(): Promise<Stats> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_stats',
      args: [],
    }),
  );
  return normalizeStats(res);
}

export async function openForecast(
  client: ReturnType<typeof makeWalletClient>,
  claim: string,
  criteria: string,
  resolveAfter: number,
): Promise<`0x${string}`> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'open_forecast',
    args: [claim, criteria, resolveAfter],
    value: 0n,
  }) as Promise<`0x${string}`>;
}

export async function resolveForecast(
  client: ReturnType<typeof makeWalletClient>,
  forecastId: string,
  evidence: string,
): Promise<`0x${string}`> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'resolve_forecast',
    args: [forecastId, evidence],
    value: 0n,
  }) as Promise<`0x${string}`>;
}
