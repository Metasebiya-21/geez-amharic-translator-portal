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
  book_code: string;
  chapter: number;
  verse: string;
  geez: string;
  amharic: string;
  rejection_reason: string;
  comment: string | null;
  rejected_by: string;
  rejected_at: string;
}

function RejectedContent() {
  const [book, setBook] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rejected', book],
    queryFn: () => {
      const p = new URLSearchParams();
      if (book) p.set('book', book);
      return api<{ items: Row[]; total: number }>(`/api/oracle/rejected?${p}`);
    },
  });

  const reopen = async (id: number) => {
    await api(`/api/oracle/verses/${id}/reopen`, { method: 'POST' });
    qc.invalidateQueries({ queryKey: ['rejected'] });
  };

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Rejected verses</h1>
      <Input
        placeholder="Filter by book code"
        value={book}
        onChange={(e) => setBook(e.target.value)}
        className="mb-4 max-w-xs"
      />
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
                <th className="p-3">By</th>
                <th className="p-3">Date</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="p-3">{r.book_code}</td>
                  <td className="p-3">{r.chapter}</td>
                  <td className="p-3">{r.verse}</td>
                  <td className="p-3">{r.rejection_reason}</td>
                  <td className="p-3">{r.rejected_by}</td>
                  <td className="p-3 text-muted-foreground">{new Date(r.rejected_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => reopen(r.id)}>Reopen</Button>
                  </td>
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

export default function RejectedPage() {
  return (
    <AuthGuard roles={['oracle']}>
      <AppShell>
        <RejectedContent />
      </AppShell>
    </AuthGuard>
  );
}
