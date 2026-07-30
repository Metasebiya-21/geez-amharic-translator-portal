'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { UserWithStats } from '@/lib/types';

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

function AdminVerifiedContent() {
  const [book, setBook] = useState('');
  const [oracleId, setOracleId] = useState('');

  const { data: oracles } = useQuery({
    queryKey: ['admin-oracles-filter'],
    queryFn: () => api<UserWithStats[]>('/api/oracle/admin/users?role=oracle'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-verified', book, oracleId],
    queryFn: () => {
      const p = new URLSearchParams();
      if (book) p.set('book', book);
      if (oracleId) p.set('oracle_id', oracleId);
      return api<{ items: Row[]; total: number }>(`/api/oracle/admin/verified?${p}`);
    },
  });

  return (
    <>
      <h1 className="mb-2 text-xl font-semibold">Verified verses</h1>
      <p className="mb-6 text-sm text-muted-foreground">All verified lines with Oracle attribution</p>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Book code (e.g. 1CO)" value={book} onChange={(e) => setBook(e.target.value)} className="max-w-[10rem]" />
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={oracleId}
          onChange={(e) => setOracleId(e.target.value)}
        >
          <option value="">All Oracles</option>
          {oracles?.map((o) => (
            <option key={o.id} value={String(o.id)}>{o.name}</option>
          ))}
        </select>
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
                <th className="p-3">Verified by</th>
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
                  <td className="p-3 font-medium">{r.verified_by}</td>
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

export default function AdminVerifiedPage() {
  return (
    <AuthGuard roles={['admin']}>
      <AdminShell>
        <AdminVerifiedContent />
      </AdminShell>
    </AuthGuard>
  );
}
