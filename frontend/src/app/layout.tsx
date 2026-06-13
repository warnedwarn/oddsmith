import type { Metadata } from 'next';
import { Chakra_Petch, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const chakra = Chakra_Petch({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: 'Oddsmith | On-chain AI prediction oracle',
  description:
    'Open a forecast with explicit resolution criteria. When the window opens, an AI oracle rules YES, NO, or INVALID with a confidence score under GenLayer validator consensus.',
  openGraph: {
    title: 'Oddsmith | On-chain AI prediction oracle',
    description:
      'An AI oracle resolves forecasts under GenLayer validator consensus. Evidence in, ruling on-chain.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${chakra.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-navy text-ink font-body antialiased">{children}</body>
    </html>
  );
}
