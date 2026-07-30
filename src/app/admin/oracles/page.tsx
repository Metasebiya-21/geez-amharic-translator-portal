'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin-shell';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { UserWithStats } from '@/lib/types';

function OraclesContent() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<UserWithStats | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'oracle' as 'oracle' | 'admin',
    is_active: true,
  });
  const [error, setError] = useState('');

  const { data: oracles, isLoading } = useQuery({
    queryKey: ['admin-oracles'],
    queryFn: () => api<UserWithStats[]>('/api/oracle/admin/users?role=oracle'),
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'oracle', is_active: true });
    setError('');
  };

  const startEdit = (u: UserWithStats) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      is_active: u.is_active,
    });
  };

  const submit = async () => {
    setError('');
    try {
      if (editing) {
        const body: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          is_active: form.is_active,
        };
        if (form.password) body.password = form.password;
        await api(`/api/oracle/admin/users/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        await api('/api/oracle/admin/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      resetForm();
      qc.invalidateQueries({ queryKey: ['admin-oracles'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Oracles</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editing ? `Edit ${editing.name}` : 'Create Oracle'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            placeholder={editing ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active account
          </label>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={submit}>{editing ? 'Save changes' : 'Create Oracle'}</Button>
            {editing && (
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Verified</th>
                <th className="p-3 text-right">Rejected</th>
                <th className="p-3 text-right">Edited</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {oracles?.map((o) => (
                <tr key={o.id} className="border-b border-border">
                  <td className="p-3 font-medium">{o.name}</td>
                  <td className="p-3 text-muted-foreground">{o.email}</td>
                  <td className="p-3">{o.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="p-3 text-right tabular-nums">{o.stats?.verses_verified ?? 0}</td>
                  <td className="p-3 text-right tabular-nums">{o.stats?.verses_rejected ?? 0}</td>
                  <td className="p-3 text-right tabular-nums">{o.stats?.verses_edited ?? 0}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(o)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminOraclesPage() {
  return (
    <AuthGuard roles={['admin']}>
      <AdminShell>
        <OraclesContent />
      </AdminShell>
    </AuthGuard>
  );
}
