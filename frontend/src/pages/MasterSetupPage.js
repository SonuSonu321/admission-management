import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import Table from '../components/Table';

const TABS = ['Institutions', 'Campuses', 'Departments', 'Programs', 'Academic Years'];
const ENDPOINTS = {
  Institutions: '/institutions',
  Campuses: '/campuses',
  Departments: '/departments',
  Programs: '/programs',
  'Academic Years': '/academic-years',
};

const FIELDS = {
  Institutions: [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
    { name: 'address', label: 'Address' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', type: 'email' },
  ],
  Campuses: [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
    { name: 'address', label: 'Address' },
  ],
  Departments: [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
  ],
  Programs: [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
    { name: 'courseType', label: 'Course Type', type: 'select', options: ['UG', 'PG'], required: true },
    { name: 'entryType', label: 'Entry Type', type: 'select', options: ['Regular', 'Lateral'], required: true },
    { name: 'admissionMode', label: 'Admission Mode', type: 'select', options: ['Government', 'Management'], required: true },
    { name: 'totalIntake', label: 'Total Intake', type: 'number', required: true },
  ],
  'Academic Years': [
    { name: 'year', label: 'Year (e.g. 2025-26)', required: true },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'isCurrent', label: 'Is Current', type: 'checkbox' },
  ],
};

export default function MasterSetupPage() {
  const [activeTab, setActiveTab] = useState('Institutions');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    api.get(ENDPOINTS[activeTab], { params: { search } })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [activeTab, search]);

  const openCreate = () => { setEditItem(null); setForm({}); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm(item); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`${ENDPOINTS[activeTab]}/${editItem._id}`, form);
        toast.success('Updated successfully');
      } else {
        await api.post(ENDPOINTS[activeTab], form);
        toast.success('Created successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`${ENDPOINTS[activeTab]}/${id}`);
      toast.success('Deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting');
    }
  };

  const fields = FIELDS[activeTab];
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
          <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:underline text-xs">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Master Setup</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <input
          className="input-field max-w-xs"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={openCreate} className="btn-primary">+ Add {activeTab.slice(0, -1)}</button>
      </div>

      <Table columns={columns} data={data} loading={loading} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? `Edit ${activeTab.slice(0, -1)}` : `New ${activeTab.slice(0, -1)}`}>
        <form onSubmit={handleSave} className="space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}{f.required && ' *'}</label>
              {f.type === 'select' ? (
                <select
                  className="input-field"
                  value={form[f.name] || ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  required={f.required}
                >
                  <option value="">Select...</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={form[f.name] || false}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  className="input-field"
                  value={form[f.name] || ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  required={f.required}
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
