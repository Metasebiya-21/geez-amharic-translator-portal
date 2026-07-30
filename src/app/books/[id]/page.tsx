'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { BookCard, ChapterCard } from '@/lib/types';

function ChaptersContent() {
  const params = useParams();
  const bookId = Number(params.id);

  const { data: book } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => api<BookCard>(`/api/oracle/books/${bookId}`),
  });

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ['chapters', bookId],
    queryFn: () => api<ChapterCard[]>(`/api/oracle/books/${bookId}/chapters`),
  });

  return (
    <>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/books" className="hover:underline">Books</Link> / {book?.name ?? '…'}
      </div>
      <h1 className="mb-6 text-xl font-semibold">{book?.name ?? 'Chapters'}</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading chapters…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {chapters.map((ch) => (
            <Card key={ch.id}>
              <CardHeader className="pb-2">
                <CardTitle>Chapter {ch.chapter_number}</CardTitle>
                <p className="text-xs capitalize text-muted-foreground">{ch.status.replace('_', ' ')}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div>{ch.total_verses} verses · {ch.verified} verified</div>
                <Link href={`/books/${bookId}/chapters/${ch.id}`}>
                  <Button size="sm" className="w-full">Open</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function BookChaptersPage() {
  return (
    <AuthGuard roles={['oracle']}>
      <AppShell>
        <ChaptersContent />
      </AppShell>
    </AuthGuard>
  );
}
