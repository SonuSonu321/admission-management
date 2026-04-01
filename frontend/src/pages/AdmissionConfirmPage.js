import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Table from '../components/Table';

export default function AdmissionConfirmPage() {
  const [applicants, setApplicants] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    api.get('/applicants', { params: { seatAllocated: true, admissionConfirmed: false } })
      .then((r) => setApplicants(r.data.filter((a) => a.seatAllocated && !a.admissionConfirmed)));
    api.get('/confirm-admission').then((r) => setAdmissions(r.data));
  };

  useEffect(() => { loadData(); }, []);

  const handleConfirm = async (applicantId) => {
    if (!window.confirm('Confirm admission? This action is irreversible.')) return;
    setLoading(true);
    try {
      const res = await api.post('/confirm-admission', { applicantId });
      toast.success(`Admission confirmed! Number: ${res.data.admissionNumber}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const pendingColumns = [
    { key: 'fullName', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'programApplied', label: 'Program', render: (r) => r.programApplied?.name },
    { key: 'documentStatus', label: 'Documents', render: (r) => <span className={r.documentStatus === 'Verified' ? 'badge-green' : 'badge-yellow'}>{r.documentStatus}</span> },
    { key: 'feeStatus', label: 'Fee', render: (r) => <span className={r.feeStatus === 'Paid' ? 'badge-green' : 'badge-red'}>{r.feeStatus}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => handleConfirm(r._id)}
          className="btn-primary text-xs py-1 px-3"
          disabled={loading || r.documentStatus !== 'Verified' || r.feeStatus !== 'Paid'}
        >
          Confirm
        </button>
      ),
    },
  ];

  const confirmedColumns = [
    { key: 'admissionNumber', label: 'Admission No.' },
    { key: 'applicant', label: 'Name', render: (r) => r.applicant?.fullName },
    { key: 'program', label: 'Program', render: (r) => r.program?.name },
    { key: 'quota', label: 'Quota', render: (r) => r.quota?.quotaType },
    { key: 'confirmedAt', label: 'Confirmed On', render: (r) => new Date(r.confirmedAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admission Confirmation</h1>

      <div className="card">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Pending Confirmations</h2>
        <p className="text-sm text-gray-500 mb-4">Only applicants with verified documents and paid fees can be confirmed.</p>
        <Table columns={pendingColumns} data={applicants} emptyMessage="No pending confirmations" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Confirmed Admissions</h2>
        <Table columns={confirmedColumns} data={admissions} emptyMessage="No confirmed admissions yet" />
      </div>
    </div>
  );
}
