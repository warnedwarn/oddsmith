'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHAIN_ID } from '@/lib/contract';

const BRADBURY_PARAMS = {
  chainId: '0x107D', // 4221
  chainName: 'GenLayer Bradbury Testnet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://rpc-bradbury.genlayer.com'],
  blockExplorerUrls: ['https://explorer-bradbury.genlayer.com/'],
};

interface Eth {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...a: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...a: unknown[]) => void) => void;
}

function getEth(): Eth | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { ethereum?: Eth }).ethereum ?? null;
}

export interface WalletState {
  address: `0x${string}` | null;
  chainOk: boolean;
  connecting: boolean;
  hasProvider: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainOk: false,
    connecting: false,
    hasProvider: false,
    error: null,
  });

  useEffect(() => {
    setState((s) => ({ ...s, hasProvider: !!getEth() }));
  }, []);

  const refreshChain = useCallback(async () => {
    const eth = getEth();
    if (!eth) return;
    try {
      const cid = (await eth.request({ method: 'eth_chainId' })) as string;
      setState((s) => ({ ...s, chainOk: parseInt(cid, 16) === CHAIN_ID }));
    } catch {
      /* ignore */
    }
  }, []);

  const connect = useCallback(async () => {
    const eth = getEth();
    if (!eth) {
      setState((s) => ({ ...s, error: 'No wallet detected' }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      try {
        await eth.request({ method: 'wallet_addEthereumChain', params: [BRADBURY_PARAMS] });
      } catch {
        /* already added */
      }
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BRADBURY_PARAMS.chainId }],
        });
      } catch {
        /* user may decline */
      }
      const cid = (await eth.request({ method: 'eth_chainId' })) as string;
      setState({
        address: (accounts[0] as `0x${string}`) ?? null,
        chainOk: parseInt(cid, 16) === CHAIN_ID,
        connecting: false,
        hasProvider: true,
        error: null,
      });
    } catch (e) {
      const msg = /reject|denied|4001/i.test(String(e))
        ? 'You cancelled the connection'
        : 'Could not connect wallet';
      setState((s) => ({ ...s, connecting: false, error: msg }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState((s) => ({ ...s, address: null }));
  }, []);

  useEffect(() => {
    const eth = getEth();
    if (!eth?.on) return;
    const onAccounts = (...a: unknown[]) => {
      const accts = a[0] as string[];
      setState((s) => ({ ...s, address: (accts?.[0] as `0x${string}`) ?? null }));
    };
    const onChain = () => refreshChain();
    eth.on('accountsChanged', onAccounts);
    eth.on('chainChanged', onChain);
    return () => {
      eth.removeListener?.('accountsChanged', onAccounts);
      eth.removeListener?.('chainChanged', onChain);
    };
  }, [refreshChain]);

  return { ...state, connect, disconnect };
}
