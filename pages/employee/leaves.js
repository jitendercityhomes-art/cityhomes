
import React, { useState } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout';
import Icon from '../../components/shared/Icon';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const EmployeeLeaves = () => {
  const { user, globalLeaves, setGlobalLeaves, addActivity } = useAppContext();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showApply, setShowApply] = useState(false);
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [newLeave, setNewLeave] = useState({ 
    type: 'Casual Leave', 
    from_date: todayStr, 
    to_date: todayStr, 
    reason: '' 
  });
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusPopupMessage, setStatusPopupMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = THEME.employee;

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;
    try {
      const res = await fetch(`${API_BASE}/leaves/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setGlobalLeaves(ls => ls.filter(l => l.id !== id));
      } else {
        setStatusPopupMessage('Failed to delete leave request.');
        setShowStatusPopup(true);
      }
    } catch (e) {
      setStatusPopupMessage(`An error occurred: ${e.message}`);
      setShowStatusPopup(true);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateDays = (from, to) => {
    if (!from || !to) return 0;
    const f = new Date(from);
    const t = new Date(to);
    f.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);
    const diff = Math.round((t - f) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleApply = async () => {
    if (isSubmitting) return;
    if (!newLeave.from_date || !newLeave.to_date || !newLeave.reason) {
      setStatusPopupMessage('Please fill all fields.');
      setShowStatusPopup(true);
      return;
    }
    if (newLeave.reason.length < 10) {
      setStatusPopupMessage('Reason must be at least 10 characters long.');
      setShowStatusPopup(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...newLeave })
      });
      if (res.ok) {
        const leave = await res.json();
        setGlobalLeaves(ls => [leave, ...ls]);
        addActivity(user.name, 'Employee', `applied for ${leave.type}`, `${leave.from_date} - ${leave.to_date}`, 'leave', 'var(--amb)');
        setShowApply(false);
        setNewLeave({ type: 'Sick Leave', from_date: '', to_date: '', reason: '' });
        setStatusPopupMessage('Leave request submitted successfully!');
        setShowStatusPopup(true);
      } else {
        const errorData = await res.json();
        const errorMessage = Array.isArray(errorData.message) 
          ? errorData.message.join(', ') 
          : (errorData.message || 'Unknown error');
        setStatusPopupMessage(`Failed to submit leave request: ${errorMessage}`);
        setShowStatusPopup(true);
      }
    } catch (e) {
      setStatusPopupMessage(`An error occurred: ${e.message}`);
      setShowStatusPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const myLeaves = (globalLeaves || [])
    .filter(l => l && (l.employee_id === user?.id || l.name === user?.name))
    .filter(l => {
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const from = new Date(l.from_date);
      const to = new Date(l.to_date || l.from_date);
      const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
      const monthEnd = new Date(selectedYear, selectedMonth, 0);
      const matchesDate = from <= monthEnd && to >= monthStart;
      return matchesStatus && matchesDate;
    });

  return (
    <EmployeeLayout title="Leave Requests">
      {showApply && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setShowApply(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <span className="modal-title">Apply for Leave</span>
              <button className="ib" onClick={() => setShowApply(false)}><Icon n="x" size={14}/></button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label className="fl">Leave Type</label>
                <select className="f-in f-sel" value={newLeave.type} onChange={e => setNewLeave({...newLeave, type: e.target.value})}>
                  <option>Casual Leave</option>
                  <option>Planned Leave</option>
                  <option>Sick Leave</option>
                  <option>Emergency Leave</option>
                  <option>Unpaid Leave</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="fr">
                <div className="fg">
                  <label className="fl">From Date</label>
                  <input 
                    className="f-in" 
                    type="date" 
                    min={todayStr}
                    value={newLeave.from_date} 
                    onChange={e => {
                      const from = e.target.value;
                      setNewLeave(prev => ({
                        ...prev, 
                        from_date: from,
                        to_date: (prev.to_date < from) ? from : prev.to_date
                      }));
                    }} 
                  />
                </div>
                <div className="fg">
                  <label className="fl">To Date</label>
                  <input 
                    className="f-in" 
                    type="date" 
                    min={newLeave.from_date}
                    value={newLeave.to_date} 
                    onChange={e => {
                      const to = e.target.value;
                      if (to >= newLeave.from_date) {
                        setNewLeave({...newLeave, to_date: to});
                      }
                    }} 
                  />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Reason</label>
                <textarea className="f-in" style={{ height: 80 }} placeholder="Enter reason..." value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn bs btn-full" onClick={() => setShowApply(false)}>Cancel</button>
              <button 
                className="btn btn-full" 
                style={{ background: t.acc, color: '#fff', opacity: isSubmitting ? 0.7 : 1 }} 
                onClick={handleApply}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusPopup && (
        <div className="modal-ov" onClick={() => setShowStatusPopup(false)}>
          <div className="modal-box" style={{ maxWidth: 350, textAlign: 'center', borderRadius: '24px', padding: '30px' }}>
            <div style={{ background: statusPopupMessage.includes('successfully') ? '#ecfdf5' : '#fef2f2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon n={statusPopupMessage.includes('successfully') ? "check" : "alert-circle"} size={30} color={statusPopupMessage.includes('successfully') ? "#10b981" : "#ef4444"} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
              {statusPopupMessage.includes('successfully') ? 'Success!' : 'Oops!'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>{statusPopupMessage}</div>
            <button className="btn btn-full" style={{ background: t.acc, color: '#fff', borderRadius: '12px' }} onClick={() => setShowStatusPopup(false)}>Close</button>
          </div>
        </div>
      )}
      
      <div className="ph">
        <div>
          <div className="pt">Leave History</div>
          <div className="ps">Track your applications</div>
        </div>
        <div className="pa" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, background: 'var(--s1)', padding: 4, borderRadius: 10, border: '1px solid var(--br)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', height: 32, background: '#fff', borderRadius: 8, border: '1px solid var(--br2)' }}>
              <Icon n="calendar" size={12} color="var(--t2)" />
              <span style={{ fontSize: 11, fontWeight: 700 }}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][selectedMonth-1]}</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', height: 32, background: '#fff', borderRadius: 8, border: '1px solid var(--br2)' }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{selectedYear}</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              >
                {[today.getFullYear(), today.getFullYear()-1].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <select 
            className="f-in f-sel" 
            style={{ width: 110, height: 40, fontSize: 11, fontWeight: 700, borderRadius: 10 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn btn-sm" style={{ background: t.acc, color: '#fff', padding: '0 16px', height: 40, fontSize: 12, fontWeight: 700, borderRadius: 10 }} onClick={() => setShowApply(true)}>
            <Icon n="plus" size={13} color="#fff"/> Apply Leave
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {myLeaves.length === 0 ? (
          <div className="cd" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
            No {statusFilter !== 'all' ? statusFilter : ''} leave history found.
          </div>
        ) : (
          myLeaves.map(l => (
            <div key={l.id} className="cd" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.acc, marginBottom: 2 }}>{l.name || user?.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{l.type}</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon n="calendar" size={12} color="var(--t3)" />
                    <span style={{ fontWeight: 600 }}>{formatDate(l.from_date || l.from)}</span>
                    <span style={{ color: 'var(--t3)' }}>to</span>
                    <span style={{ fontWeight: 600 }}>{formatDate(l.to_date || l.to)}</span>
                    <span style={{ marginLeft: 6, padding: '2px 8px', background: 'var(--s1)', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                      {calculateDays(l.from_date || l.from, l.to_date || l.to)} days
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {l.status === 'pending' && (
                    <button 
                      onClick={() => handleDelete(l.id)}
                      style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Delete Request"
                    >
                      <Icon n="trash" size={14} color="#ef4444" />
                    </button>
                  )}
                  <span 
                    className={`bg ${l.status === 'approved' ? 'bg-appr' : l.status === 'rejected' ? 'bg-rej' : 'bg-pend'}`} 
                    style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6 }}
                  >
                    {l.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--t2)', background: 'var(--s1)', padding: '10px 14px', borderRadius: 8, borderLeft: `3px solid ${t.accDim}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>Reason:</div>
                  {l.reason}
                </div>

                {l.status === 'rejected' && (l.rejected_reason || l.rejection_reason) && (
                  <div style={{ fontSize: 12, color: 'var(--red)', background: 'rgba(239, 68, 68, 0.05)', padding: '10px 14px', borderRadius: 8, borderLeft: '3px solid var(--red)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 4, opacity: 0.8 }}>Rejection Reason:</div>
                    {l.rejected_reason || l.rejection_reason}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeLeaves;
