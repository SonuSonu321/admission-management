import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function SeatAllocationPage() {
  const [applicants, setApplicants] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ applicantId: '', quotaId: '', allotmentNumber: '' });
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/applicants', { params: { seatAllocated: false } }).then((r) =>
      setApplicants(r.data.filter((a) => !a.seatAllocated))
    );
    api.get('/programs').then((r) => setPrograms(r.data));
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      api.get(`/quotas/${selectedProgram}`).then((r) => setQuotas(r.data));
    }
  }, [selectedProgram]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/allocate-seat', form);
      toast.success('Seat allocated successfully');
      setForm({ applicantId: '', quotaId: '', allotmentNumber: '' });
      // Refresh applicants
      const updated = await api.get('/applicants');
      setApplicants(updated.data.filter((a) => !a.seatAllocated));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Seat Allocation</h1>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Program</label>
          <select
            className="input-field"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">Select Program to load quotas</option>
            {programs.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.courseType})</option>)}
          </select>
        </div>

        {quotas.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {quotas.map((q) => (
              <div key={q._id} className={`p-3 rounded-lg border text-sm ${q.remainingSeats <= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="font-semibold">{q.quotaType}</div>
                <div className="text-xs mt-1">
                  {q.allocatedSeats}/{q.totalSeats} filled — <span className={q.remainingSeats <= 0 ? 'text-red-600 font-bold' : 'text-green-700'}>{q.remainingSeats} remaining</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applicant *</label>
            <select
              className="input-field"
              value={form.applicantId}
              onChange={(e) => setForm({ ...form, applicantId: e.target.value })}
              required
            >
              <option value="">Select Applicant</option>
              {applicants.map((a) => (
                <option key={a._id} value={a._id}>{a.fullName} — {a.quotaType} — {a.programApplied?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quota *</label>
            <select
              className="input-field"
              value={form.quotaId}
              onChange={(e) => setForm({ ...form, quotaId: e.target.value })}
              required
            >
              <option value="">Select Quota</option>
              {quotas.map((q) => (
                <option key={q._id} value={q._id} disabled={q.remainingSeats <= 0}>
                  {q.quotaType} ({q.remainingSeats} seats left)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allotment Number (Government flow)</label>
            <input
              type="text"
              className="input-field"
              value={form.allotmentNumber}
              onChange={(e) => setForm({ ...form, allotmentNumber: e.target.value })}
              placeholder="Optional for government quota"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Allocating...' : 'Allocate Seat'}
          </button>
        </form>
      </div>
    </div>
  );
}
