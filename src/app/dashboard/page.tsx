'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import Link from 'next/link';

interface DashboardData {
  stats: DashboardStats;
  recent_activity: Array<{
    id: number;
    action: string;
    detail: string | null;
    user_name: string;
    created_at: string;
  }>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<DashboardData>('/api/oracle/dashboard'),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading dashboard…</p>;

  const s = data?.stats;
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Verification progress overview</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Pending books" value={s?.pending_books ?? 0} />
        <StatCard label="Verified books" value={s?.verified_books ?? 0} />
        <StatCard label="Rejected books" value={s?.rejected_books ?? 0} />
        <StatCard label="Chapters" value={s?.total_chapters ?? 0} />
        <StatCard label="Verse pairs" value={s?.total_verse_pairs ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verse status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Pending</span><span>{s?.pending_verses ?? 0}</span></div>
            <div className="flex justify-between"><span>Verified</span><span>{s?.verified_verses ?? 0}</span></div>
            <div className="flex justify-between"><span>Rejected</span><span>{s?.rejected_verses ?? 0}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.recent_activity?.length ? (
              <p className="text-sm text-muted-foreground">No activity yet. <Link href="/books" className="underline">Start verifying</Link></p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.recent_activity.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2">
                    <span>{a.user_name} · {a.action}</span>
                    <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard roles={['oracle']}>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  );
}
