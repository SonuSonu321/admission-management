import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import Table from '../components/Table';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admission_officer' });

  const loadUsers = () => {
    setLoading(true);
    api.get('/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('User created');
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'admission_officer' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deactivated');
      loadUsers();
    } catch (err) {
      toast.error('Error deactivating user');
    }
  };

  const roleBadge = (role) => {
    const map = { admin: 'badge-blue', admission_officer: 'badge-green', management: 'badge-yellow' };
    return <span className={map[role]}>{role.replace('_', ' ')}</span>;
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => roleBadge(r.role) },
    { key: 'isActive', label: 'Status', render: (r) => r.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => r.isActive ? (
        <button onClick={() => handleDeactivate(r._id)} className="text-red-500 hover:underline text-xs">Deactivate</button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary">+ Add User</button>
      </div>

      <Table columns={columns} data={users} loading={loading} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-3">
          {[
            { name: 'name', label: 'Full Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} *</label>
              <input
                type={f.type}
                className="input-field"
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                required
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admission_officer">Admission Officer</option>
              <option value="admin">Admin</option>
              <option value="management">Management</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Create User</button>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
