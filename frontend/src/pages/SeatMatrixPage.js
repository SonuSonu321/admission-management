import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const QUOTA_TYPES = ['KCET', 'COMEDK', 'Management', 'Supernumerary'];

export default function SeatMatrixPage() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programDetail, setProgramDetail] = useState(null);
  const [quotas, setQuotas] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/programs').then((r) => setPrograms(r.data));
  }, []);

  useEffect(() => {
    if (!selectedProgram) { setQuotas([]); setProgramDetail(null); return; }

    const prog = programs.find((p) => p._id === selectedProgram);
    setProgramDetail(prog);

    api.get(`/quotas/${selectedProgram}`).then((r) => {
      // Pre-fill existing quotas, default others to 0
      const existing = r.data;
      const filled = QUOTA_TYPES.map((qt) => {
        const found = existing.find((q) => q.quotaType === qt);
        return { quotaType: qt, totalSeats: found ? found.totalSeats : 0, allocatedSeats: found ? found.allocatedSeats : 0 };
      });
      setQuotas(filled);
    });
  }, [selectedProgram, programs]);

  const totalQuotaSeats = quotas.reduce((sum, q) => sum + Number(q.totalSeats), 0);
  const intake = programDetail?.totalIntake || 0;
  const isOverLimit = totalQuotaSeats > intake;

  const handleChange = (index, value) => {
    const updated = [...quotas];
    updated[index].totalSeats = Number(value) || 0;
    setQuotas(updated);
  };

  const handleSave = async () => {
    if (isOverLimit) {
      toast.error(`Total quota seats (${totalQuotaSeats}) exceed program intake (${intake})`);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        programId: selectedProgram,
        quotas: quotas.filter((q) => q.totalSeats > 0).map((q) => ({
          quotaType: q.quotaType,
          totalSeats: q.totalSeats,
        })),
      };
      await api.post('/quotas', payload);
      toast.success('Seat matrix saved successfully');
      // Refresh
      const r = await api.get(`/quotas/${selectedProgram}`);
      const filled = QUOTA_TYPES.map((qt) => {
        const found = r.data.find((q) => q.quotaType === qt);
        return { quotaType: qt, totalSeats: found ? found.totalSeats : 0, allocatedSeats: found ? found.allocatedSeats : 0 };
      });
      setQuotas(filled);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Seat Matrix</h1>
      <p className="text-sm text-gray-500">Set quota-wise seat distribution for each program. Total quota seats must not exceed program intake.</p>

      {/* Program selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Program *</label>
        <select
          className="input-field"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="">-- Select a Program --</option>
          {programs.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.courseType}) — Intake: {p.totalIntake}
            </option>
          ))}
        </select>
      </div>

      {/* Quota matrix */}
      {selectedProgram && programDetail && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">{programDetail.name}</h2>
            <span className="text-sm text-gray-500">Total Intake: <strong>{intake}</strong></span>
          </div>

          <div className="space-y-3">
            {quotas.map((q, i) => (
              <div key={q.quotaType} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-36 font-medium text-gray-700">{q.quotaType}</div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max={intake}
                    className="input-field"
                    value={q.totalSeats}
                    onChange={(e) => handleChange(i, e.target.value)}
                  />
                </div>
                {q.allocatedSeats > 0 && (
                  <div className="text-xs text-gray-500 w-32 text-right">
                    {q.allocatedSeats} already allocated
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary bar */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${isOverLimit ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <span className="text-sm font-medium">
              Total Quota Seats: <strong>{totalQuotaSeats}</strong> / {intake}
            </span>
            {isOverLimit
              ? <span className="text-red-600 text-sm font-medium">⚠ Exceeds intake by {totalQuotaSeats - intake}</span>
              : <span className="text-green-600 text-sm font-medium">✓ {intake - totalQuotaSeats} unassigned</span>
            }
          </div>

          <button
            onClick={handleSave}
            className="btn-primary w-full"
            disabled={saving || isOverLimit}
          >
            {saving ? 'Saving...' : 'Save Seat Matrix'}
          </button>
        </div>
      )}
    </div>
  );
}
