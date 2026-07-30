'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { Verse, VerseHistory } from '@/lib/types';
import { cn } from '@/lib/utils';

function VerseEditor({
  verse,
  bookId,
  onUpdate,
}: {
  verse: Verse;
  bookId: number;
  onUpdate: () => void;
}) {
  const [geez, setGeez] = useState(verse.geez_text);
  const [am, setAm] = useState(verse.amharic_text);
  const [dirty, setDirty] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const geezRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setGeez(verse.geez_text);
    setAm(verse.amharic_text);
    setDirty(false);
  }, [verse]);

  const { data: history = [] } = useQuery({
    queryKey: ['history', verse.id],
    queryFn: () => api<VerseHistory[]>(`/api/oracle/verses/${verse.id}/history`),
    enabled: showHistory,
  });

  const save = useCallback(async () => {
    setSaving(true);
    setMessage('');
    try {
      await api(`/api/oracle/verses/${verse.id}`, {
        method: 'PUT',
        body: JSON.stringify({ geez_text: geez, amharic_text: am }),
      });
      setDirty(false);
      setMessage('Saved');
      onUpdate();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [verse.id, geez, am, onUpdate]);

  const verify = async () => {
    setSaving(true);
    try {
      await api(`/api/oracle/verses/${verse.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ geez_text: geez, amharic_text: am }),
      });
      setDirty(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      await api(`/api/oracle/verses/${verse.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason, comment: comment || null }),
      });
      setShowReject(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setGeez(verse.geez_text);
    setAm(verse.amharic_text);
    setDirty(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.target instanceof HTMLTextAreaElement)) return;
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        save();
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        verify();
      }
      if (e.key === 'Escape') {
        reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => save(), 30000);
    return () => clearTimeout(t);
  }, [dirty, geez, am, save]);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const statusClass =
    verse.status === 'verified'
      ? 'border-green-500/40 bg-green-500/5'
      : verse.status === 'rejected'
        ? 'border-destructive/40 bg-destructive/5'
        : '';

  return (
    <Card className={cn('mb-4', statusClass)} id={`verse-${verse.id}`}>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Verse {verse.verse_number}</CardTitle>
        <span className="text-xs capitalize text-muted-foreground">{verse.status}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Ge&apos;ez</label>
            <textarea
              ref={geezRef}
              className="min-h-[100px] w-full rounded-md border border-border bg-card p-3 font-serif text-sm leading-relaxed"
              value={geez}
              onChange={(e) => { setGeez(e.target.value); setDirty(true); }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amharic</label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-border bg-card p-3 font-serif text-sm leading-relaxed"
              value={am}
              onChange={(e) => { setAm(e.target.value); setDirty(true); }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={save} disabled={saving || !dirty}>Save</Button>
          <Button size="sm" onClick={verify} disabled={saving}>Verify</Button>
          <Button size="sm" variant="destructive" onClick={() => setShowReject(true)} disabled={saving}>Reject</Button>
          <Button size="sm" variant="ghost" onClick={reset} disabled={!dirty}>Reset</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowHistory(true)}>History</Button>
        </div>

        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <p className="text-xs text-muted-foreground">Ctrl+S save · Ctrl+Enter verify · Esc reset</p>

        {showReject && (
          <div className="rounded-md border border-border bg-muted/30 p-4">
            <p className="mb-2 text-sm font-medium">Rejection reason</p>
            <input
              className="mb-2 w-full rounded border border-border bg-card px-3 py-2 text-sm"
              placeholder="Reason (required)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <textarea
              className="mb-3 w-full rounded border border-border bg-card px-3 py-2 text-sm"
              placeholder="Comment (optional)"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={reject}>Reject</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="rounded-md border border-border p-4 text-sm">
            <div className="mb-2 flex justify-between">
              <span className="font-medium">Edit history</span>
              <button type="button" className="text-xs text-muted-foreground" onClick={() => setShowHistory(false)}>Close</button>
            </div>
            {!history.length ? (
              <p className="text-muted-foreground">No edits yet.</p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-auto text-xs">
                {history.map((h) => (
                  <li key={h.id} className="border-b border-border pb-2">
                    <div className="text-muted-foreground">{h.edited_by} · {h.action} · {new Date(h.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChapterVerifyContent() {
  const params = useParams();
  const bookId = Number(params.id);
  const chapterId = Number(params.chapterId);
  const qc = useQueryClient();

  const { data: verses = [], isLoading, refetch } = useQuery({
    queryKey: ['verses', chapterId],
    queryFn: () => api<Verse[]>(`/api/oracle/chapters/${chapterId}/verses`),
  });

  const refresh = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ['chapters', bookId] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/books" className="hover:underline">Books</Link>
        {' / '}
        <Link href={`/books/${bookId}`} className="hover:underline">Chapters</Link>
        {' / Verify'}
      </div>
      <h1 className="mb-6 text-xl font-semibold">Verify chapter</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading verses…</p>
      ) : !verses.length ? (
        <p className="text-muted-foreground">No verses. Sync from corpus on the dashboard first.</p>
      ) : (
        verses.map((v) => (
          <VerseEditor key={v.id} verse={v} bookId={bookId} onUpdate={refresh} />
        ))
      )}
    </>
  );
}

export default function ChapterVerifyPage() {
  return (
    <AuthGuard roles={['oracle']}>
      <AppShell>
        <ChapterVerifyContent />
      </AppShell>
    </AuthGuard>
  );
}
