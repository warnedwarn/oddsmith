'use client';

import { useState } from 'react';
import { Crosshair, ChevronDown, ExternalLink, LogOut, Wallet } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER } from '@/lib/contract';
import { shortAddr } from '@/lib/format';
import { CopyButton } from './CopyButton';
import type { WalletState } from '@/hooks/useWallet';

interface Props {
  wallet: WalletState & { connect: () => void; disconnect: () => void };
  onOpen: () => void;
}

export function Header({ wallet, onOpen }: Props) {
  const [menu, setMenu] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-cyan/20 bg-navy/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="focus-ring flex items-center gap-2.5">
          <span className="schematic flex h-9 w-9 items-center justify-center border border-cyan/50 bg-cyan/5">
            <Crosshair size={18} className="text-cyan" />
          </span>
          <span className="font-display text-xl font-700 tracking-wide text-ink">ODDSMITH</span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 border border-cyan/20 px-3 py-1.5 font-mono text-xs text-slatey sm:flex">
            <span className={`h-2 w-2 ${wallet.address && wallet.chainOk ? 'bg-cyan' : 'bg-faint'}`} />
            Bradbury
          </span>

          {!wallet.address ? (
            <button
              type="button"
              onClick={wallet.connect}
              disabled={wallet.connecting}
              className="focus-ring flex items-center gap-2 border border-cyan bg-cyan/10 px-4 py-2 font-mono text-xs font-600 uppercase tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-60"
            >
              <Wallet size={15} />
              {wallet.connecting ? 'Connecting' : 'Connect'}
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                className="focus-ring flex items-center gap-2 border border-cyan/50 bg-cyan/5 px-3 py-2 font-mono text-xs text-ink"
              >
                <span className="h-2 w-2 rounded-full bg-cyan" />
                {shortAddr(wallet.address)}
                <ChevronDown size={14} />
              </button>
              {menu && (
                <div className="schematic absolute right-0 top-12 w-72 border border-cyan/30 bg-navy-800 p-4">
                  <p className="uplabel text-faint">Connected wallet</p>
                  <div className="mt-2 flex items-center justify-between gap-2 break-all font-mono text-xs text-slatey">
                    <span>{wallet.address}</span>
                    <CopyButton value={wallet.address} label="Copy address" />
                  </div>
                  {!wallet.chainOk && (
                    <p className="mt-3 border border-invalid/40 bg-invalid/10 p-2 font-mono text-[11px] text-invalid">
                      Wrong network. Switch to Bradbury (4221).
                    </p>
                  )}
                  <a
                    href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring mt-3 flex items-center gap-1 font-mono text-xs text-cyan hover:underline"
                  >
                    View contract <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      wallet.disconnect();
                      setMenu(false);
                    }}
                    className="focus-ring mt-4 flex w-full items-center justify-center gap-2 border border-cyan/20 py-2 font-mono text-xs uppercase tracking-wider text-slatey transition-colors hover:border-no hover:text-no"
                  >
                    <LogOut size={14} /> Disconnect
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onOpen}
            className="focus-ring hidden items-center gap-2 border border-cyan bg-cyan px-4 py-2 font-mono text-xs font-700 uppercase tracking-wider text-navy transition-transform hover:-translate-y-0.5 md:flex"
          >
            <Crosshair size={15} /> New forecast
          </button>
        </div>
      </div>
    </header>
  );
}
