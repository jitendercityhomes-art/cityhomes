
import React, { useState, useEffect } from 'react';
import Icon from '../shared/Icon';
import { useAppContext } from '../../context/AppContext';
import { API_BASE } from '../../lib/constants';

const PersonalForm = ({ emp, onBack, onSaved, accentColor, flat = false, showClose = true }) => {
  const { globalBranches = [] } = useAppContext();
  const employee = emp || {};
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    joiningDate: '',
    designation: '',
    branch: '',
    systemRole: 'employee',
    basicSalary: '',
    department: '',
    gender: 'Male',
    marital: 'Single',
    blood: '',
    emName: '',
    emPhone: '',
    loc: ''
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const t = accentColor || 'var(--teal)';

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetch(`${API_BASE}/departments`, { credentials: 'include' });
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
    if (!employee || !employee.id) return;

    setData({
      name: employee.name || '',
      phone: employee.phone || '',
      email: employee.email || '',
      dob: employee.date_of_birth ? String(employee.date_of_birth).slice(0, 10) : employee.dob || '',
      joiningDate: employee.date_of_joining ? String(employee.date_of_joining).slice(0, 10) : employee.dateOfJoining || employee.joiningDate || employee.doj || '',
      designation: employee.designation || '',
      branch: employee.branch_id || (typeof employee.branch === 'object' ? employee.branch?.id : employee.branch) || '',
      systemRole: employee.role || 'employee',
      basicSalary: employee.basicSalary || employee.basic_salary || employee.salary || '',
      department: employee.department_id || (typeof employee.department === 'object' ? employee.department?.id : employee.department) || '',
      gender: employee.gender || 'Male',
      marital: employee.marital || employee.marital_status || 'Single',
      blood: employee.blood_group || employee.blood || '',
      emName: employee.emergency_contact_name || employee.emName || '',
      emPhone: employee.emergency_contact_phone || employee.emPhone || '',
      loc: employee.address || employee.loc || ''
    });
  }, [employee]);

  const parseIntSafe = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(String(value).trim(), 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const handleSave = async () => {
    if (!employee?.id) {
      alert('Unable to save: missing employee ID');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        designation: data.designation,
        gender: data.gender,
        role: data.systemRole,
        basic_salary: data.basicSalary ? parseFloat(data.basicSalary) : undefined,
        date_of_birth: data.dob || undefined,
        date_of_joining: data.joiningDate || undefined,
        address: data.loc,
        marital_status: data.marital,
        blood_group: data.blood || undefined,
        emergency_contact_name: data.emName,
        emergency_contact_phone: data.emPhone,
        department_id: parseIntSafe(data.department),
        branch_id: parseIntSafe(data.branch),
      };

      const response = await fetch(`${API_BASE}/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to save profile');
      }

      const updatedEmployee = await response.json();
      onSaved?.(updatedEmployee);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Failed to save profile', error);
      alert(`Save failed: ${error.message || 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={flat ? '' : 'cd'} style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{employee.employee_id || `ID-${employee.id}`}</div>
        {showClose && (
          <button className="ib" onClick={onBack}><Icon n="x" size={16} color="var(--t2)"/></button>
        )}
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        <div className="fg">
          <label className="fl">Staff Name</label>
          <input className="f-in" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
        </div>
        <div className="fg">
          <label className="fl">Mobile Number</label>
          <div className="ph-row" style={{ gap: 12 }}>
            <button type="button" className="ph-code">+91</button>
            <input className="f-in" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} style={{ flex: 1 }} />
          </div>
        </div>
        <div className="fg">
          <label className="fl">Personal Email</label>
          <input className="f-in" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
        </div>
        <div className="fg">
          <label className="fl">Date Of Birth</label>
          <input className="f-in" type="date" value={data.dob} onChange={e => setData({...data, dob: e.target.value})} />
        </div>
        <div className="fg">
          <label className="fl">Date Of Joining</label>
          <input className="f-in" type="date" value={data.joiningDate} onChange={e => setData({...data, joiningDate: e.target.value})} />
        </div>
        <div className="fg">
          <label className="fl">Designation</label>
          <input className="f-in" value={data.designation} onChange={e => setData({...data, designation: e.target.value})} />
        </div>
        <div className="fg">
          <label className="fl">Branch</label>
          <select className="f-in f-sel" value={data.branch} onChange={e => setData({...data, branch: e.target.value})}>
            <option value="">Select branch</option>
            {globalBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label className="fl">System Role</label>
          <select className="f-in f-sel" value={data.systemRole} onChange={e => setData({...data, systemRole: e.target.value})}>
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
            <option value="superadmin">Super admin</option>
          </select>
        </div>
        <div className="fg">
          <label className="fl">Department</label>
          <select className="f-in f-sel" value={data.department} onChange={e => setData({...data, department: e.target.value})}>
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label className="fl">Basic Salary</label>
          <input className="f-in" type="number" value={data.basicSalary} onChange={e => setData({...data, basicSalary: e.target.value})} />
        </div>
        <div className="fg">
          <label className="fl">Gender</label>
          <select className="f-in f-sel" value={data.gender} onChange={e => setData({...data, gender: e.target.value})}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div className="fg">
          <label className="fl">Marital Status</label>
          <select className="f-in f-sel" value={data.marital} onChange={e => setData({...data, marital: e.target.value})}>
            <option>Single</option><option>Married</option><option>Divorced</option>
          </select>
        </div>
        <div className="fg">
          <label className="fl">Blood Group</label>
          <select className="f-in f-sel" value={data.blood} onChange={e => setData({...data, blood: e.target.value})}>
            <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
          </select>
        </div>
        <div className="fg">
          <label className="fl">Full Address</label>
          <input className="f-in" value={data.loc} onChange={e => setData({...data, loc: e.target.value})} />
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, marginTop: 20, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--br)' }}>Emergency Contact</div>
      <div style={{ display: 'grid', gap: 14 }}>
        <div className="fg">
          <label className="fl">Emergency Contact Name</label>
          <input className="f-in" value={data.emName} onChange={e => setData({...data, emName: e.target.value})} />
        </div>
        <div className="fg">
          <label className="fl">Emergency Contact Mobile</label>
          <div className="ph-row" style={{ gap: 12 }}>
            <button type="button" className="ph-code">+91</button>
            <input className="f-in" value={data.emPhone} onChange={e => setData({...data, emPhone: e.target.value})} style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <button className="btn bs btn-full" onClick={onBack}>Cancel</button>
        <button className="btn btn-full" style={{ background: t, color: '#fff' }} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 420, borderRadius: 24, background: '#fff', boxShadow: '0 32px 80px rgba(15, 23, 42, 0.16)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.14)', display: 'grid', placeItems: 'center' }}>
                <Icon n="check" size={24} color="#10b981" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Profile Updated</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>Your profile has been saved successfully.</div>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: 16, borderTop: '1px solid var(--br)', background: 'var(--s2)' }}>
              <button
                type="button"
                className="btn btn-full"
                style={{ background: t, color: '#fff' }}
                onClick={() => {
                  setSaveSuccess(false);
                  onBack();
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalForm;
