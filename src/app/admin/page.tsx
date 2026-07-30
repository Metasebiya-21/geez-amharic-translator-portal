'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { AdminDashboard } from '@/lib/types';

function AdminDashboardContent() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api<AdminDashboard>('/api/oracle/admin/dashboard'),
  });

  const sync = async () => {
    await api('/api/oracle/admin/sync', { method: 'POST' });
    refetch();
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  const s = data?.stats;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Admin overview</h1>
          <p className="text-sm text-muted-foreground">
            {data?.active_oracle_count} active Oracles · {data?.oracle_count} total
          </p>
        </div>
        <Button variant="outline" onClick={sync}>Sync corpus from USFM</Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-muted-foreground">Verified verses</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{s?.verified_verses ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-muted-foreground">Rejected</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{s?.rejected_verses ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-muted-foreground">Pending</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{s?.pending_verses ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-muted-foreground">Verse pairs</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{s?.total_verse_pairs ?? 0}</CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oracle workload (for compensation)</CardTitle>
          <p className="text-xs text-muted-foreground">Verses verified, rejected, and edited per Oracle</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="p-2">Oracle</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Verified</th>
                <th className="p-2 text-right">Rejected</th>
                <th className="p-2 text-right">Edited</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.oracle_workload.map((o) => (
                <tr key={o.id} className="border-b border-border">
                  <td className="p-2">
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted-foreground">{o.email}</div>
                  </td>
                  <td className="p-2">{o.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="p-2 text-right tabular-nums">{o.verses_verified}</td>
                  <td className="p-2 text-right tabular-nums">{o.verses_rejected}</td>
                  <td className="p-2 text-right tabular-nums">{o.verses_edited}</td>
                  <td className="p-2 text-right tabular-nums">{o.total_actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard roles={['admin']}>
      <AdminShell>
        <AdminDashboardContent />
      </AdminShell>
    </AuthGuard>
  );
}
