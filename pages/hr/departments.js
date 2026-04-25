import React, { useState, useEffect } from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const HRDepartments = () => {
  const { addActivity } = useAppContext();
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [newDept, setNewDept] = useState({ name: '', description: '', week_off_days: [] });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successNotification, setSuccessNotification] = useState(null);

  useEffect(() => {
    if (!successNotification) return;
    const timer = setTimeout(() => setSuccessNotification(null), 2500);
    return () => clearTimeout(timer);
  }, [successNotification]);
  const t = THEME.hr;
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekOffLabel = (days = []) => days.map(i => weekDays[i]).join(', ') || 'None';

  const resetForm = () => setNewDept({ name: '', description: '', week_off_days: [] });

  const toggleWeekDay = (dayIndex) => {
    setNewDept(prev => {
      const hasDay = prev.week_off_days.includes(dayIndex);
      return {
        ...prev,
        week_off_days: hasDay
          ? prev.week_off_days.filter(d => d !== dayIndex)
          : [...prev.week_off_days, dayIndex],
      };
    });
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/departments`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setDepts(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newDept.name) return;
    const url = editingDept ? `${API_BASE}/departments/${editingDept.id}` : `${API_BASE}/departments`;
    const method = editingDept ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newDept),
      });
      if (res.ok) {
        const data = await res.json();
        if (editingDept) {
          setDepts(prev => prev.map(d => d.id === data.id ? data : d));
          addActivity('HR Manager', 'HR', `updated department ${data.name}`, `${data.description || 'No description'}`, 'staff', 'var(--teal)');
          setSuccessNotification({ title: 'Department Updated', message: `${data.name} has been updated successfully.` });
        } else {
          setDepts(d => [...d, data]);
          addActivity('HR Manager', 'HR', `added new department ${data.name}`, `${data.description || 'No description'}`, 'staff', 'var(--teal)');
          setSuccessNotification({ title: 'Department Created', message: `${data.name} has been created successfully.` });
        }
        setShowAdd(false);
        resetForm();
        setEditingDept(null);
      } else {
        const err = await res.text();
        alert(err || 'Failed to save department');
      }
    } catch (e) {
      alert('Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setNewDept({ name: dept.name, description: dept.description || '', week_off_days: dept.week_off_days || [] });
    setShowAdd(true);
  };

  const handleDelete = (dept) => {
    setDeleteTarget(dept);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/departments/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setDepts(prev => prev.filter(d => d.id !== deleteTarget.id));
        addActivity('HR Manager', 'HR', `deleted department ${deleteTarget.name}`, '', 'staff', 'var(--red)');
        setSuccessNotification({ title: 'Department Deleted', message: `${deleteTarget.name} has been deleted successfully.` });
      } else {
        const err = await res.text();
        setSuccessNotification({ title: 'Delete Failed', message: err || 'Could not delete department.' });
      }
    } catch (e) {
      setSuccessNotification({ title: 'Delete Failed', message: 'Failed to delete department.' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  return (
    <HRLayout title="Department Management">
      {successNotification && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setSuccessNotification(null)}>
          <div className="modal-box" style={{ maxWidth: 380, width: '100%', textAlign: 'center', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.18)' }}>
            <div className="modal-head" style={{ borderBottom: '1px solid var(--br)', background: 'var(--s1)' }}>
              <span className="modal-title">{successNotification.title}</span>
            </div>
            <div className="modal-body" style={{ padding: '28px 24px' }}>
              <div style={{ padding: '14px 0' }}>
                <Icon n="check" size={42} color={t.acc} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--t1)', marginBottom: 24, lineHeight: 1.6 }}>{successNotification.message}</div>
              <button className="btn btn-full" style={{ background: t.acc, color: '#fff', borderRadius: 10, minHeight: 44 }} onClick={() => setSuccessNotification(null)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && cancelDelete()}>
          <div className="modal-box" style={{ maxWidth: 380, width: '100%', textAlign: 'center', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.18)' }}>
            <div className="modal-head" style={{ borderBottom: '1px solid var(--br)', background: 'var(--s1)' }}>
              <span className="modal-title">Confirm Delete</span>
            </div>
            <div className="modal-body" style={{ padding: '24px 24px 28px' }}>
              <div style={{ padding: '16px 0' }}>
                <Icon n="alert" size={40} color="var(--red)" />
              </div>
              <div style={{ fontSize: 14, color: 'var(--t1)', marginBottom: 24, lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn bs" style={{ minWidth: 120, borderRadius: 10, padding: '12px 0' }} onClick={cancelDelete}>Cancel</button>
                <button className="btn btn-full" style={{ background: 'var(--red)', color: '#fff', minWidth: 120, borderRadius: 10, padding: '12px 0' }} onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <span className="modal-title">{editingDept ? 'Edit Department' : 'Create Department'}</span>
              <button className="ib" onClick={() => { setShowAdd(false); setEditingDept(null); resetForm(); }}><Icon n="x" size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label className="fl">Department Name</label>
                <input className="f-in" placeholder="eg. Marketing" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} />
              </div>
              <div className="fg">
                <label className="fl">Description</label>
                <input className="f-in" placeholder="Optional" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} />
              </div>
              <div className="fg" style={{ marginTop: 12 }}>
                <label className="fl">Week Off Days</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {weekDays.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekDay(index)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: newDept.week_off_days.includes(index) ? `1px solid ${t.acc}` : '1px solid var(--br)',
                        background: newDept.week_off_days.includes(index) ? t.acc : 'transparent',
                        color: newDept.week_off_days.includes(index) ? '#fff' : 'var(--t2)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn bs btn-full" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-full" style={{ background: t.acc, color: '#fff' }} onClick={handleAdd}>{editingDept ? 'Save Changes' : 'Create Dept'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="ph">
        <div>
          <div className="pt">Departments</div>
          <div className="ps">{depts.length} active departments</div>
        </div>
        <div className="pa">
          <button className="btn btn-sm" style={{ background: t.acc, color: '#fff' }} onClick={() => { resetForm(); setEditingDept(null); setShowAdd(true); }}>
            <Icon n="plus" size={13} color="#fff" /> Add Dept
          </button>
        </div>
      </div>

      <div className="cd">
        <table>
          <thead>
            <tr><th>Department Name</th><th>Description</th><th>Week Off</th><th>Action</th></tr>
          </thead>
          <tbody>
            {depts.map(d => (
              <tr key={d.id}>
                <td><div style={{ fontWeight: 600, fontSize: 12 }}>{d.name}</div></td>
                <td><div style={{ fontSize: 11, color: 'var(--t3)' }}>{d.description || 'No description'}</div></td>
                <td><div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.4 }}>{getWeekOffLabel(d.week_off_days)}</div></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn bs btn-sm" onClick={() => handleEdit(d)}>Edit</button>
                  <button className="btn btn-sm" style={{ background: 'var(--red)', color: '#fff' }} onClick={() => handleDelete(d)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HRLayout>
  );
};

export default HRDepartments;
