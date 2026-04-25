
import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import AlertModal from '../../components/shared/AlertModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const SuperAdminDepartments = () => {
  const { addActivity } = useAppContext();
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [newDept, setNewDept] = useState({ 
    name: '', 
    description: '', 
    week_off_days: [],
    punch_in_time: '09:00:00',
    punch_out_time: '18:00:00',
    half_day_punch_out_before: '14:00:00',
    half_day_punch_in_after: '12:00:00'
  });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: null });

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));
  const t = THEME.superadmin;
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekOffLabel = (days = []) => days.map(i => weekDays[i]).join(', ') || 'None';

  const resetForm = () => setNewDept({ 
    name: '', 
    description: '', 
    week_off_days: [],
    punch_in_time: '09:00:00',
    punch_out_time: '18:00:00',
    half_day_punch_out_before: '14:00:00',
    half_day_punch_in_after: '12:00:00'
  });

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
        body: JSON.stringify(newDept)
      });
      if (res.ok) {
        const data = await res.json();
        if (editingDept) {
          setDepts(prev => prev.map(d => d.id === data.id ? data : d));
          addActivity('Super Admin', 'Super Admin', `updated department ${data.name}`, `${data.description || 'No description'}`, 'staff', 'var(--pur)');
          showAlert('success', 'Department Updated', `${data.name} has been updated successfully.`);
        } else {
          setDepts(d => [...d, data]);
          addActivity('Super Admin', 'Super Admin', `added new department ${data.name}`, `${data.description || 'No description'}`, 'staff', 'var(--pur)');
          showAlert('success', 'Department Created', `${data.name} has been created successfully.`);
        }
        setShowAdd(false);
        resetForm();
        setEditingDept(null);
      } else {
        const err = await res.json();
        showAlert('error', 'Action Failed', err.message || 'Failed to save department');
      }
    } catch (e) {
      showAlert('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setNewDept({ 
      name: dept.name, 
      description: dept.description || '', 
      week_off_days: dept.week_off_days || [],
      punch_in_time: dept.punch_in_time || '09:00:00',
      punch_out_time: dept.punch_out_time || '18:00:00',
      half_day_punch_out_before: dept.half_day_punch_out_before || '14:00:00',
      half_day_punch_in_after: dept.half_day_punch_in_after || '12:00:00'
    });
    setShowAdd(true);
  };

  const handleDelete = (dept) => {
    showAlert('confirm', 'Confirm Delete', `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`, async () => {
      closeAlert();
      try {
        const res = await fetch(`${API_BASE}/departments/${dept.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (res.ok) {
          setDepts(prev => prev.filter(d => d.id !== dept.id));
          addActivity('Super Admin', 'Super Admin', `deleted department ${dept.name}`, '', 'staff', 'var(--red)');
          showAlert('success', 'Department Deleted', `${dept.name} has been deleted successfully.`);
        } else {
          const err = await res.json();
          showAlert('error', 'Action Failed', err.message || 'Could not delete department.');
        }
      } catch (e) {
        showAlert('error', 'Network Error', 'Failed to delete department.');
      }
    });
  };

  return (
    <SuperAdminLayout title="Department Management">
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        accentColor={t.acc}
      />
      
      {showAdd && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box" style={{ maxWidth: 500 }}>
            <div className="modal-head">
              <span className="modal-title">{editingDept ? 'Edit Department' : 'Create Department'}</span>
              <button className="ib" onClick={() => { setShowAdd(false); setEditingDept(null); resetForm(); }}><Icon n="x" size={14}/></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="fg">
                <label className="fl">Department Name</label>
                <input className="f-in" placeholder="eg. Marketing" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} />
              </div>
              <div className="fg">
                <label className="fl">Description</label>
                <input className="f-in" placeholder="Optional" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} />
              </div>
              
              <div style={{ marginTop: 20, borderTop: '1px solid var(--br)', paddingTop: 15 }}>
                <label className="fl" style={{ marginBottom: 10, display: 'block', fontWeight: 800, fontSize: 13 }}>Attendance Timing</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="fg">
                    <label className="fl">Punch In Time</label>
                    <input type="time" className="f-in" value={newDept.punch_in_time} onChange={e => setNewDept({...newDept, punch_in_time: e.target.value})} />
                  </div>
                  <div className="fg">
                    <label className="fl">Punch Out Time</label>
                    <input type="time" className="f-in" value={newDept.punch_out_time} onChange={e => setNewDept({...newDept, punch_out_time: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 15, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div className="fg">
                  <label className="fl">Half Day if punch out before</label>
                  <input type="time" className="f-in" value={newDept.half_day_punch_out_before} onChange={e => setNewDept({...newDept, half_day_punch_out_before: e.target.value})} />
                </div>
                <div className="fg">
                  <label className="fl">Half Day if punch in after</label>
                  <input type="time" className="f-in" value={newDept.half_day_punch_in_after} onChange={e => setNewDept({...newDept, half_day_punch_in_after: e.target.value})} />
                </div>
              </div>

              <div className="fg" style={{ marginTop: 20, borderTop: '1px solid var(--br)', paddingTop: 15 }}>
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
            <Icon n="plus" size={13} color="#fff"/> Add Dept
          </button>
        </div>
      </div>

      <div className="cd">
        <table>
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Description</th>
              <th>Timings</th>
              <th>Week Off</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {depts.map(d => (
              <tr key={d.id}>
                <td><div style={{ fontWeight: 600, fontSize: 12 }}>{d.name}</div></td>
                <td><div style={{ fontSize: 11, color: 'var(--t3)' }}>{d.description || 'No description'}</div></td>
                <td>
                  <div style={{ fontSize: 10, color: 'var(--t2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon n="clock" size={10} color="var(--grn)"/> 
                      <span>{d.punch_in_time?.slice(0,5)} - {d.punch_out_time?.slice(0,5)}</span>
                    </div>
                  </div>
                </td>
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
    </SuperAdminLayout>
  );
};

export default SuperAdminDepartments;
