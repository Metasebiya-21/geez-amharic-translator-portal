import type { Metadata } from 'next';
import { Inter, Noto_Serif_Ethiopic } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const noto = Noto_Serif_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['400', '600'],
  variable: '--font-noto',
});

export const metadata: Metadata = {
  title: 'Corpus Oracle — Ge\'ez ↔ Amharic validation',
  description: 'Workspace for Oracles (expert corpus validators) to verify scripture verse pairs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${noto.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
