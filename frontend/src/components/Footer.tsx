'use client';

import { Crosshair, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS, DEPLOY_TX, EXPLORER, FAUCET } from '@/lib/contract';
import { shortAddr, shortHash } from '@/lib/format';
import { CopyButton } from './CopyButton';

export function Footer() {
  return (
    <footer className="border-t border-cyan/20 bg-navy-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <span className="flex items-center gap-2 font-display text-xl font-700 tracking-wide text-ink">
            <Crosshair size={20} className="text-cyan" /> ODDSMITH
          </span>
          <p className="mt-3 max-w-xs font-body text-sm text-slatey">
            An on-chain prediction oracle. Forecasts resolved by AI under GenLayer validator
            consensus. No stake, no custody, no backend.
          </p>
        </div>

        <div>
          <p className="uplabel font-mono text-faint">Resources</p>
          <ul className="mt-4 space-y-2 font-mono text-sm">
            <li>
              <a href={FAUCET} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slatey hover:text-cyan">
                Bradbury faucet <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slatey hover:text-cyan">
                GenLayer docs <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href={EXPLORER} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slatey hover:text-cyan">
                Block explorer <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="uplabel font-mono text-faint">On-chain</p>
          <ul className="mt-4 space-y-3 font-mono text-sm">
            <li className="flex items-center justify-between gap-2 text-slatey">
              <a href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="hover:text-cyan">
                Contract {shortAddr(CONTRACT_ADDRESS)}
              </a>
              <CopyButton value={CONTRACT_ADDRESS} label="Copy contract" />
            </li>
            <li className="flex items-center justify-between gap-2 text-slatey">
              <a href={`${EXPLORER}/tx/${DEPLOY_TX}`} target="_blank" rel="noopener noreferrer" className="hover:text-cyan">
                Deploy {shortHash(DEPLOY_TX)}
              </a>
              <CopyButton value={DEPLOY_TX} label="Copy deploy tx" />
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cyan/10 px-4 py-5 text-center font-mono text-xs text-faint sm:px-6">
        Built on GenLayer Bradbury Testnet. The oracle is an AI ruling under validator consensus, not
        financial advice.
      </div>
    </footer>
  );
}
