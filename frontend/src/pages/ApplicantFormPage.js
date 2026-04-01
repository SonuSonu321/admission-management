import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createApplicant, updateApplicant } from '../store/slices/applicantSlice';
import api from '../api/axios';
import { toast } from 'react-toastify';

const initialForm = {
  fullName: '', fatherName: '', email: '', mobile: '', dob: '',
  gender: 'Male', address: '', category: 'General', entryType: 'Regular',
  quotaType: 'KCET', marks: '', qualifyingExam: '', programApplied: '',
  documentStatus: 'Pending', feeStatus: 'Pending', allotmentNumber: '',
};

export default function ApplicantFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/programs').then((r) => setPrograms(r.data));
    if (isEdit) {
      api.get(`/applicants/${id}`).then((r) => {
        const a = r.data;
        setForm({
          ...a,
          dob: a.dob ? a.dob.split('T')[0] : '',
          programApplied: a.programApplied?._id || a.programApplied,
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const action = isEdit
      ? dispatch(updateApplicant({ id, payload: form }))
      : dispatch(createApplicant(form));

    const res = await action;
    setLoading(false);

    if ((isEdit ? updateApplicant : createApplicant).fulfilled.match(res)) {
      toast.success(isEdit ? 'Applicant updated' : 'Applicant created');
      navigate('/applicants');
    } else {
      toast.error(res.payload || 'Something went wrong');
    }
  };

  const field = (label, name, type = 'text', required = true) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <input type={type} name={name} value={form[name]} onChange={handleChange} className="input-field" required={required} />
    </div>
  );

  const select = (label, name, options, required = true) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <select name={name} value={form[name]} onChange={handleChange} className="input-field" required={required}>
        {options.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit Applicant' : 'New Applicant'}</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Full Name', 'fullName')}
          {field('Father Name', 'fatherName')}
          {field('Email', 'email', 'email')}
          {field('Mobile', 'mobile', 'tel')}
          {field('Date of Birth', 'dob', 'date')}
          {select('Gender', 'gender', ['Male', 'Female', 'Other'])}
          {select('Category', 'category', ['General', 'OBC', 'SC', 'ST', 'EWS'])}
          {select('Entry Type', 'entryType', ['Regular', 'Lateral'])}
          {select('Quota Type', 'quotaType', ['KCET', 'COMEDK', 'Management', 'Supernumerary'])}
          {field('Marks', 'marks', 'number', false)}
          {field('Qualifying Exam', 'qualifyingExam', 'text', false)}
          {field('Allotment Number', 'allotmentNumber', 'text', false)}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program Applied *</label>
            <select name="programApplied" value={form.programApplied} onChange={handleChange} className="input-field" required>
              <option value="">Select Program</option>
              {programs.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.courseType})</option>)}
            </select>
          </div>
          {select('Document Status', 'documentStatus', ['Pending', 'Submitted', 'Verified'])}
          {select('Fee Status', 'feeStatus', ['Pending', 'Paid'])}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="input-field" rows={3} required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Applicant' : 'Create Applicant'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/applicants')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
