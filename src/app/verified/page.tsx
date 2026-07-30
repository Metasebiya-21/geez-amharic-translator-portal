'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Row {
  id: number;
  book: string;
  book_code: string;
  chapter: number;
  verse: string;
  geez: string;
  amharic: string;
  verified_by: string;
  verified_at: string;
}

function VerifiedContent() {
  const [book, setBook] = useState('');
  const [verifier, setVerifier] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['verified', book, verifier],
    queryFn: () => {
      const p = new URLSearchParams();
      if (book) p.set('book', book);
      if (verifier) p.set('verifier', verifier);
      return api<{ items: Row[]; total: number }>(`/api/oracle/verified?${p}`);
    },
  });

  const reopen = async (id: number) => {
    await api(`/api/oracle/verses/${id}/reopen`, { method: 'POST' });
    qc.invalidateQueries({ queryKey: ['verified'] });
  };

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Verified verses</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Book code (e.g. 1CO)" value={book} onChange={(e) => setBook(e.target.value)} className="max-w-[10rem]" />
        <Input placeholder="Verifier name" value={verifier} onChange={(e) => setVerifier(e.target.value)} className="max-w-[12rem]" />
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-3">Book</th>
                <th className="p-3">Ch</th>
                <th className="p-3">V</th>
                <th className="p-3">Ge&apos;ez</th>
                <th className="p-3">Amharic</th>
                <th className="p-3">By</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="p-3">{r.book_code}</td>
                  <td className="p-3">{r.chapter}</td>
                  <td className="p-3">{r.verse}</td>
                  <td className="max-w-[12rem] truncate p-3 font-serif">{r.geez}</td>
                  <td className="max-w-[12rem] truncate p-3 font-serif">{r.amharic}</td>
                  <td className="p-3">{r.verified_by}</td>
                  <td className="p-3 text-muted-foreground">{new Date(r.verified_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-3 text-xs text-muted-foreground">{data?.total ?? 0} total</p>
        </div>
      )}
    </>
  );
}

export default function VerifiedPage() {
  return (
    <AuthGuard roles={['oracle']}>
      <AppShell>
        <VerifiedContent />
      </AppShell>
    </AuthGuard>
  );
}
