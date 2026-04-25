
import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { API_BASE } from '../../lib/constants';

const AddStaffModal = ({ onClose, onAdd, branches, accentColor }) => {
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState({
    fullName: '',
    phone: '',
    dateOfJoining: '',
    designation: '',
    gender: 'Male',
    branch: branches[0]?.id || '',
    systemRole: 'Employee',
    email: '',
    dateOfBirth: '',
    address: '',
    basicSalary: '',
    departmentId: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetch('http://localhost:3004/api/v1/departments', { credentials: 'include' });
        if (res.ok) {
          const list = await res.json();
          setDepartments(list);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    if (!data.branch && branches?.length) {
      setData(prev => ({ ...prev, branch: branches[0].id }));
    }
  }, [branches, data.branch]);

  const isSuperAdmin = data.systemRole.toLowerCase().includes('super');
  const selectedDepartment = departments.find(dept => String(dept.id) === String(data.departmentId));
  const weekOffNames = selectedDepartment?.week_off_days?.map(i => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]).filter(Boolean).join(', ') || 'None';
  const invalidStyle = (field) => errors[field] ? { border: '1px solid red' } : {};

  const validate = () => {
    const nextErrors = {};
    if (!data.fullName) nextErrors.fullName = true;
    if (!data.phone) nextErrors.phone = true;
    if (!data.dateOfJoining) nextErrors.dateOfJoining = true;
    if (!data.designation) nextErrors.designation = true;
    if (!data.gender) nextErrors.gender = true;
    if (!data.branch) nextErrors.branch = true;
    if (!data.systemRole) nextErrors.systemRole = true;
    if (!data.email) nextErrors.email = true;
    if (!data.dateOfBirth) nextErrors.dateOfBirth = true;
    if (!data.address) nextErrors.address = true;
    if (!data.password) nextErrors.password = true;
    if (!data.confirmPassword) nextErrors.confirmPassword = true;
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) nextErrors.confirmPassword = true;
    if (!isSuperAdmin) {
      if (!data.basicSalary) nextErrors.basicSalary = true;
      if (!data.departmentId) nextErrors.departmentId = true;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormMessage('Please fill all required fields correctly.');
      return false;
    }
    setFormMessage('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    setLoading(true);
    const payload = {
      name: data.fullName,
      phone: data.phone,
      dateOfJoining: data.dateOfJoining,
      designation: data.designation,
      gender: data.gender,
      branch: data.branch,
      systemRole: data.systemRole,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      address: data.address?.trim() || undefined,
      basicSalary: isSuperAdmin ? undefined : data.basicSalary,
      department_id: isSuperAdmin ? undefined : data.departmentId,
      password: data.password,
    };
    const res = await onAdd(payload);
    setLoading(false);
    if (res.success) {
      setSuccessData({
        employeeId: res.employee_id,
        email: res.email,
        password: res.password,
      });
      setFormMessage('');
    } else {
      setFormMessage(res.message || 'Unable to create employee.');
    }
  };

  const updateField = (key, value) => {
    if (formMessage) {
      setFormMessage('');
    }
    setData(prev => ({ ...prev, [key]: value }));
  };

  if (successData) {
    return (
      <div className="modal-ov" onClick={e => e.target === e.currentTarget && false}>
        <div className="modal-box" style={{ maxWidth: 400, textAlign: 'center' }}>
          <div style={{ padding: '40px 20px' }}>
            <div style={{ fontSize: 48, color: 'var(--acc)', marginBottom: 20 }}>✓</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: 'var(--t1)' }}>Successfully Created!</div>
            <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 24, lineHeight: 1.6 }}>
              Employee has been added to the system.
            </div>
            
            <div style={{ background: 'var(--s2)', padding: 16, borderRadius: 8, marginBottom: 20, textAlign: 'left' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>Employee ID</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{successData.employeeId}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>Email</div>
                <div style={{ fontSize: 13, color: 'var(--t1)', wordBreak: 'break-all' }}>{successData.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>Password</div>
                <div style={{ fontSize: 13, color: 'var(--t1)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{successData.password}</div>
              </div>
            </div>

            <button 
              className="btn btn-full" 
              style={{ background: accentColor, color: '#fff' }} 
              onClick={() => {
                setSuccessData(null);
                onClose();
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-ov">
      <div className="modal-box" style={{ maxWidth: 620 }}>
        <div className="modal-head">
          <span className="modal-title">Add Staff</span>
          <button className="ib" onClick={onClose}><Icon n="x" size={14} /></button>
        </div>
        <div className="modal-body">
          {formMessage && (
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: 'rgba(255, 82, 82, 0.1)', color: '#a50000', fontSize: 12 }}>
              {formMessage}
            </div>
          )}
          <div className="fr">
            <div className="fg">
              <label className="fl">Full Name</label>
              <input className="f-in" placeholder="eg. John Doe" value={data.fullName} onChange={e => updateField('fullName', e.target.value)} style={invalidStyle('fullName')} />
            </div>
            <div className="fg">
              <label className="fl">Phone Number</label>
              <input className="f-in" placeholder="91-XXXXX XXXXX" value={data.phone} onChange={e => updateField('phone', e.target.value)} style={invalidStyle('phone')} />
            </div>
          </div>

          <div className="fr">
            <div className="fg">
              <label className="fl">Date of Joining</label>
              <input className="f-in" type="date" value={data.dateOfJoining} onChange={e => updateField('dateOfJoining', e.target.value)} style={invalidStyle('dateOfJoining')} />
            </div>
            <div className="fg">
              <label className="fl">Designation</label>
              <input className="f-in" placeholder="eg. Sales Executive" value={data.designation} onChange={e => updateField('designation', e.target.value)} style={invalidStyle('designation')} />
            </div>
          </div>

          <div className="fr">
            <div className="fg">
              <label className="fl">Gender</label>
              <select className="f-in f-sel" value={data.gender} onChange={e => updateField('gender', e.target.value)} style={invalidStyle('gender')}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Branch</label>
              <select className="f-in f-sel" value={data.branch} onChange={e => updateField('branch', e.target.value)} style={invalidStyle('branch')}>
                {(branches || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="fr">
            <div className="fg">
              <label className="fl">System Role</label>
              <select className="f-in f-sel" value={data.systemRole} onChange={e => updateField('systemRole', e.target.value)} style={invalidStyle('systemRole')}>
                <option>Super admin</option>
                <option>HR</option>
                <option>Employee</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Email Address</label>
              <input className="f-in" type="email" placeholder="john@cityhomes.com" value={data.email} onChange={e => updateField('email', e.target.value)} style={invalidStyle('email')} />
            </div>
          </div>

          <div className="fr">
            <div className="fg">
              <label className="fl">Address</label>
              <input
                className="f-in"
                placeholder="Enter full address"
                value={data.address}
                onChange={e => updateField('address', e.target.value)}
                style={invalidStyle('address')}
              />
            </div>
            <div className="fg">
              <label className="fl">Date of Birth</label>
              <input className="f-in" type="date" value={data.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} style={invalidStyle('dateOfBirth')} />
            </div>
          </div>

          {!isSuperAdmin && (
            <div className="fr">
              <div className="fg">
                <label className="fl">Basic Salary</label>
                <input className="f-in" type="number" placeholder="0" value={data.basicSalary} onChange={e => updateField('basicSalary', e.target.value)} style={invalidStyle('basicSalary')} />
              </div>
              <div className="fg">
                <label className="fl">Department</label>
                <select className="f-in f-sel" value={data.departmentId} onChange={e => updateField('departmentId', e.target.value)} style={invalidStyle('departmentId')}>
                  <option value="">Select Department</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
                {data.departmentId && selectedDepartment && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--t3)', background: 'var(--s2)', padding: '10px 12px', borderRadius: 10 }}>
                    <div style={{ marginBottom: 4, fontWeight: 600 }}>Selected: {selectedDepartment.name}</div>
                    <div>Week Off: {weekOffNames}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="fr">
            <div className="fg">
              <label className="fl">Password</label>
              <input className="f-in" type="password" placeholder="Enter password" value={data.password} onChange={e => updateField('password', e.target.value)} style={invalidStyle('password')} />
            </div>
            <div className="fg">
              <label className="fl">Confirm Password</label>
              <input className="f-in" type="password" placeholder="Confirm password" value={data.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} style={invalidStyle('confirmPassword')} />
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn bs btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-full" style={{ background: accentColor, color: '#fff' }} onClick={handleSave} disabled={loading}>
            {loading ? 'Adding...' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
