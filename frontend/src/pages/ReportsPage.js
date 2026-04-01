import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Table from '../components/Table';

export default function ReportsPage() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/confirm-admission').then((r) => {
      setAdmissions(r.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { key: 'admissionNumber', label: 'Admission No.' },
    { key: 'applicant', label: 'Student Name', render: (r) => r.applicant?.fullName },
    { key: 'mobile', label: 'Mobile', render: (r) => r.applicant?.mobile },
    { key: 'program', label: 'Program', render: (r) => r.program?.name },
    { key: 'quota', label: 'Quota', render: (r) => r.quota?.quotaType },
    { key: 'feeStatus', label: 'Fee', render: (r) => <span className={r.applicant?.feeStatus === 'Paid' ? 'badge-green' : 'badge-red'}>{r.applicant?.feeStatus}</span> },
    { key: 'confirmedAt', label: 'Date', render: (r) => new Date(r.confirmedAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admission Reports</h1>
        <span className="text-sm text-gray-500">{admissions.length} total admissions</span>
      </div>
      <div className="card">
        <Table columns={columns} data={admissions} loading={loading} emptyMessage="No admissions confirmed yet" />
      </div>
    </div>
  );
}
