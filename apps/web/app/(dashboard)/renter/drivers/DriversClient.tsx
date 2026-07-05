'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { RenterDriver } from '@/lib/api';

interface DriversClientProps {
  drivers: RenterDriver[];
  token: string;
}

export function DriversClient({ drivers: initial, token }: DriversClientProps) {
  const [drivers, setDrivers] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', name: '' });

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

  async function addDriver() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to add driver');
      setDrivers((prev) => [json.data, ...prev]);
      setForm({ email: '', name: '' });
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function removeDriver(id: string) {
    if (!confirm('Remove this driver from your fleet?')) return;
    try {
      const res = await fetch(`${API}/api/v1/drivers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to remove driver');
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  }

  const kycColor: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
    VERIFIED: 'green',
    UNDER_REVIEW: 'yellow',
    REJECTED: 'red',
    PENDING: 'gray',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Add Driver
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Register new driver</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Juan dela Cruz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="driver@example.com"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button
              onClick={addDriver}
              disabled={loading || !form.email || !form.name}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
            >
              {loading ? 'Adding…' : 'Add driver'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {drivers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No drivers registered yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Add your first driver to assign them to bookings.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Driver</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">KYC Status</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Trips</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                        {d.user.name.charAt(0).toUpperCase()}
                      </div>
                      {d.user.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{d.user.email}</td>
                  <td className="px-5 py-4">
                    <Badge
                      label={d.kycStatus.replace('_', ' ')}
                      variant={kycColor[d.kycStatus] ?? 'gray'}
                    />
                  </td>
                  <td className="px-5 py-4 text-gray-600">{d._count.bookings}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => removeDriver(d.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
