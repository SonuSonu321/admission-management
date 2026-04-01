import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchApplicants, deleteApplicant } from '../store/slices/applicantSlice';
import Table from '../components/Table';
import { toast } from 'react-toastify';

const statusBadge = (status) => {
  const map = { Pending: 'badge-yellow', Submitted: 'badge-blue', Verified: 'badge-green', Paid: 'badge-green' };
  return <span className={map[status] || 'badge-yellow'}>{status}</span>;
};

export default function ApplicantsPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.applicants);
  const { user } = useSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [quotaFilter, setQuotaFilter] = useState('');

  useEffect(() => {
    dispatch(fetchApplicants({ search, quotaType: quotaFilter }));
  }, [dispatch, search, quotaFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this applicant?')) return;
    const res = await dispatch(deleteApplicant(id));
    if (deleteApplicant.fulfilled.match(res)) toast.success('Applicant deleted');
    else toast.error(res.payload);
  };

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'quotaType', label: 'Quota' },
    { key: 'programApplied', label: 'Program', render: (r) => r.programApplied?.name || '—' },
    { key: 'documentStatus', label: 'Documents', render: (r) => statusBadge(r.documentStatus) },
    { key: 'feeStatus', label: 'Fee', render: (r) => statusBadge(r.feeStatus) },
    {
      key: 'seatAllocated',
      label: 'Seat',
      render: (r) => r.seatAllocated ? <span className="badge-green">Allocated</span> : <span className="badge-yellow">Pending</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          {user?.role !== 'management' && (
            <>
              <Link to={`/applicants/${r._id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link>
              {!r.admissionConfirmed && (
                <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:underline text-xs">Delete</button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Applicants</h1>
        {user?.role !== 'management' && (
          <Link to="/applicants/new" className="btn-primary">+ New Applicant</Link>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          className="input-field max-w-xs"
          placeholder="Search by name, email, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field max-w-xs" value={quotaFilter} onChange={(e) => setQuotaFilter(e.target.value)}>
          <option value="">All Quotas</option>
          {['KCET', 'COMEDK', 'Management', 'Supernumerary'].map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <Table columns={columns} data={list} loading={loading} />
    </div>
  );
}
