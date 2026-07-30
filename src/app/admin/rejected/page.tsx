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
  rejection_reason: string | null;
  comment: string | null;
  rejected_by: string;
  rejected_at: string;
}

function AdminRejectedContent() {
  const [book, setBook] = useState('');
  const [oracleId, setOracleId] = useState('');

  const { data: oracles } = useQuery({
    queryKey: ['admin-oracles-filter'],
    queryFn: () => api<UserWithStats[]>('/api/oracle/admin/users?role=oracle'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rejected', book, oracleId],
    queryFn: () => {
      const p = new URLSearchParams();
      if (book) p.set('book', book);
      if (oracleId) p.set('oracle_id', oracleId);
      return api<{ items: Row[]; total: number }>(`/api/oracle/admin/rejected?${p}`);
    },
  });

  return (
    <>
      <h1 className="mb-2 text-xl font-semibold">Rejected verses</h1>
      <p className="mb-6 text-sm text-muted-foreground">All rejected lines with reason and Oracle attribution</p>
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
                <th className="p-3">Reason</th>
                <th className="p-3">Comment</th>
                <th className="p-3">Rejected by</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="p-3">{r.book_code}</td>
                  <td className="p-3">{r.chapter}</td>
                  <td className="p-3">{r.verse}</td>
                  <td className="p-3">{r.rejection_reason ?? '—'}</td>
                  <td className="max-w-[14rem] truncate p-3 text-muted-foreground">{r.comment ?? '—'}</td>
                  <td className="p-3 font-medium">{r.rejected_by}</td>
                  <td className="p-3 text-muted-foreground">{new Date(r.rejected_at).toLocaleDateString()}</td>
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

export default function AdminRejectedPage() {
  return (
    <AuthGuard roles={['admin']}>
      <AdminShell>
        <AdminRejectedContent />
      </AdminShell>
    </AuthGuard>
  );
}
