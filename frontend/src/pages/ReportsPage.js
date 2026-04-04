import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Badge = ({ value, map }) => {
  const cls = map[value] || 'badge-yellow';
  return <span className={cls}>{value}</span>;
};

const docMap = { Pending: 'badge-yellow', Submitted: 'badge-blue', Verified: 'badge-green' };
const feeMap = { Pending: 'badge-red', Paid: 'badge-green' };

export default function ReportsPage() {
  const [tab, setTab] = useState('applicants');
  const [applicants, setApplicants] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quotaFilter, setQuotaFilter] = useState('');
  const [docFilter, setDocFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/applicants'),
      api.get('/confirm-admission'),
      api.get('/quotas/all').catch(() => ({ data: [] })),
    ]).then(([a, adm]) => {
      setApplicants(a.data);
      setAdmissions(adm.data);
      setLoading(false);
    });
  }, []);

  // Filtered applicants
  const filtered = applicants.filter((a) => {
    const matchSearch = !search ||
      a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.mobile?.includes(search) ||
      a.email?.toLowerCase().includes(search.toLowerCase());
    const matchQuota = !quotaFilter || a.quotaType === quotaFilter;
    const matchDoc = !docFilter || a.documentStatus === docFilter;
    const matchFee = !feeFilter || a.feeStatus === feeFilter;
    return matchSearch && matchQuota && matchDoc && matchFee;
  });

  // Summary stats
  const stats = {
    total: applicants.length,
    allocated: applicants.filter((a) => a.seatAllocated).length,
    confirmed: applicants.filter((a) => a.admissionConfirmed).length,
    feePaid: applicants.filter((a) => a.feeStatus === 'Paid').length,
    feePending: applicants.filter((a) => a.feeStatus === 'Pending').length,
    docsVerified: applicants.filter((a) => a.documentStatus === 'Verified').length,
    docsPending: applicants.filter((a) => a.documentStatus === 'Pending').length,
  };

  // Quota-wise summary from applicants
  const quotaSummary = ['KCET', 'COMEDK', 'Management', 'Supernumerary'].map((qt) => ({
    quota: qt,
    total: applicants.filter((a) => a.quotaType === qt).length,
    allocated: applicants.filter((a) => a.quotaType === qt && a.seatAllocated).length,
    confirmed: applicants.filter((a) => a.quotaType === qt && a.admissionConfirmed).length,
  }));

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Applicants', value: stats.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Seats Allocated', value: stats.allocated, color: 'bg-purple-50 text-purple-700' },
          { label: 'Admissions Confirmed', value: stats.confirmed, color: 'bg-green-50 text-green-700' },
          { label: 'Fee Pending', value: stats.feePending, color: 'bg-red-50 text-red-700' },
          { label: 'Fee Paid', value: stats.feePaid, color: 'bg-green-50 text-green-700' },
          { label: 'Docs Verified', value: stats.docsVerified, color: 'bg-teal-50 text-teal-700' },
          { label: 'Docs Pending', value: stats.docsPending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Not Allocated', value: stats.total - stats.allocated, color: 'bg-gray-50 text-gray-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs mt-1 opacity-75">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quota-wise summary */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Quota-wise Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-2 text-left">Quota</th>
                <th className="px-4 py-2 text-center">Total Applicants</th>
                <th className="px-4 py-2 text-center">Seat Allocated</th>
                <th className="px-4 py-2 text-center">Confirmed</th>
                <th className="px-4 py-2 text-center">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotaSummary.map((q) => (
                <tr key={q.quota} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{q.quota}</td>
                  <td className="px-4 py-2 text-center">{q.total}</td>
                  <td className="px-4 py-2 text-center">{q.allocated}</td>
                  <td className="px-4 py-2 text-center text-green-600 font-medium">{q.confirmed}</td>
                  <td className="px-4 py-2 text-center text-yellow-600">{q.allocated - q.confirmed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'applicants', label: `All Applicants (${applicants.length})` },
          { key: 'confirmed', label: `Confirmed Admissions (${admissions.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Applicants tab */}
      {tab === 'applicants' && (
        <div className="card space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              className="input-field max-w-xs"
              placeholder="Search name, email, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input-field max-w-[160px]" value={quotaFilter} onChange={(e) => setQuotaFilter(e.target.value)}>
              <option value="">All Quotas</option>
              {['KCET', 'COMEDK', 'Management', 'Supernumerary'].map((q) => <option key={q}>{q}</option>)}
            </select>
            <select className="input-field max-w-[160px]" value={docFilter} onChange={(e) => setDocFilter(e.target.value)}>
              <option value="">All Doc Status</option>
              {['Pending', 'Submitted', 'Verified'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="input-field max-w-[160px]" value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)}>
              <option value="">All Fee Status</option>
              {['Pending', 'Paid'].map((s) => <option key={s}>{s}</option>)}
            </select>
            {(search || quotaFilter || docFilter || feeFilter) && (
              <button className="btn-secondary text-sm" onClick={() => { setSearch(''); setQuotaFilter(''); setDocFilter(''); setFeeFilter(''); }}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400">{filtered.length} records</div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Name', 'Mobile', 'Program', 'Quota', 'Category', 'Documents', 'Fee', 'Seat', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-400">No records found</td></tr>
                ) : filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{a.fullName}</td>
                    <td className="px-3 py-2">{a.mobile}</td>
                    <td className="px-3 py-2">{a.programApplied?.name || '—'}</td>
                    <td className="px-3 py-2">{a.quotaType}</td>
                    <td className="px-3 py-2">{a.category}</td>
                    <td className="px-3 py-2"><Badge value={a.documentStatus} map={docMap} /></td>
                    <td className="px-3 py-2"><Badge value={a.feeStatus} map={feeMap} /></td>
                    <td className="px-3 py-2">
                      {a.seatAllocated ? <span className="badge-green">Allocated</span> : <span className="badge-yellow">Pending</span>}
                    </td>
                    <td className="px-3 py-2">
                      {a.admissionConfirmed ? <span className="badge-green">Confirmed</span> : <span className="badge-yellow">In Progress</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmed admissions tab */}
      {tab === 'confirmed' && (
        <div className="card">
          {admissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>No confirmed admissions yet.</p>
              <p className="text-xs mt-1">Admissions appear here after documents are verified, fee is paid, and admission is confirmed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    {['Admission No.', 'Student Name', 'Mobile', 'Program', 'Quota', 'Fee', 'Confirmed On'].map((h) => (
                      <th key={h} className="px-3 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admissions.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-blue-700 font-medium">{a.admissionNumber}</td>
                      <td className="px-3 py-2 font-medium">{a.applicant?.fullName}</td>
                      <td className="px-3 py-2">{a.applicant?.mobile}</td>
                      <td className="px-3 py-2">{a.program?.name}</td>
                      <td className="px-3 py-2">{a.quota?.quotaType}</td>
                      <td className="px-3 py-2"><Badge value={a.applicant?.feeStatus} map={feeMap} /></td>
                      <td className="px-3 py-2">{new Date(a.confirmedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
