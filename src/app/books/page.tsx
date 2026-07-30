'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { BookCard } from '@/lib/types';
import { cn } from '@/lib/utils';

const FILTERS = ['', 'pending', 'in_progress', 'verified', 'rejected'] as const;

function statusColor(status: string) {
  if (status === 'verified') return 'text-green-600';
  if (status === 'rejected') return 'text-destructive';
  if (status === 'in_progress') return 'text-amber-600';
  return 'text-muted-foreground';
}

function BooksContent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', filter, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      if (search) params.set('q', search);
      return api<BookCard[]>(`/api/oracle/books?${params}`);
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Books</h1>
        <p className="text-sm text-muted-foreground">Assigned verification books</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search books…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f || 'all'}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f || 'All'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading books…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id}>
              <CardHeader>
                <CardTitle className="text-base">{book.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {book.book_code} · {book.testament} · {book.chapters} ch
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="font-semibold">{book.pending}</div><div className="text-muted-foreground">Pending</div></div>
                  <div><div className="font-semibold">{book.verified}</div><div className="text-muted-foreground">Verified</div></div>
                  <div><div className="font-semibold">{book.rejected}</div><div className="text-muted-foreground">Rejected</div></div>
                </div>
                <div className={cn('text-xs font-medium capitalize', statusColor(book.status))}>{book.status.replace('_', ' ')}</div>
                <Link href={`/books/${book.id}`}>
                  <Button className="w-full" size="sm">Continue</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function BooksPage() {
  return (
    <AuthGuard roles={['oracle']}>
      <AppShell>
        <BooksContent />
      </AppShell>
    </AuthGuard>
  );
}
