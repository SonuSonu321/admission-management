import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api/axios';
import StatCard from '../components/StatCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div></div>;

  const quotaChartData = {
    labels: data.quotaStats.map((q) => `${q.quotaType} - ${q.program || ''}`),
    datasets: [
      { label: 'Allocated', data: data.quotaStats.map((q) => q.allocatedSeats), backgroundColor: '#3b82f6' },
      { label: 'Remaining', data: data.quotaStats.map((q) => q.remainingSeats), backgroundColor: '#e5e7eb' },
    ],
  };

  const feeChartData = {
    labels: ['Fee Pending', 'Fee Paid'],
    datasets: [{
      data: [data.pendingFees, data.totalAdmitted - data.pendingFees],
      backgroundColor: ['#f59e0b', '#10b981'],
    }],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Intake" value={data.totalIntake} icon="🏫" color="blue" />
        <StatCard title="Admitted Students" value={data.totalAdmitted} icon="🎓" color="green" />
        <StatCard title="Remaining Seats" value={data.totalRemaining} icon="🪑" color="yellow" />
        <StatCard title="Pending Fees" value={data.pendingFees} icon="💰" color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Applicants" value={data.totalApplicants} icon="👤" color="purple" />
        <StatCard title="Pending Documents" value={data.pendingDocuments} icon="📄" color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Quota-wise Seat Fill</h2>
          <Bar data={quotaChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Fee Status</h2>
          <div className="flex justify-center">
            <div style={{ maxWidth: 280 }}>
              <Doughnut data={feeChartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Program-wise admissions */}
      {data.programAdmissions.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Program-wise Admissions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.programAdmissions.map((p) => (
              <div key={p._id} className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{p.count}</div>
                <div className="text-xs text-gray-600 mt-1">{p.programName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
