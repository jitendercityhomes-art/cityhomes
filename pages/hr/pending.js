
import React, { useState } from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const HRPending = () => {
  const { globalLeaves, setGlobalLeaves, addActivity, addEmpNotif } = useAppContext();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [leaveType, setLeaveType] = useState('paid');
  const [statusFilter, setStatusFilter] = useState('pending');
  const t = THEME.hr;

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

  const handleApprove = async (l) => {
    try {
      const res = await fetch(`http://localhost:3004/api/v1/leaves/${l.id}/approve`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ leave_type: leaveType })
      });
      if (res.ok) {
        setGlobalLeaves(ls => ls.map(x => x.id === l.id ? { ...x, status: 'approved', type: leaveType } : x));
        addActivity('HR Manager', 'HR', `approved ${leaveType} leave for ${l.name}`, l.type, 'leave', t.acc);
        addEmpNotif(l.name, { type: 'leave_appr', title: 'Leave Approved', body: `Your ${l.type} request has been approved as ${leaveType} leave.`, time: 'Just now', color: 'var(--grn)' });
        setApprovingId(null);
      } else {
        alert('Failed to approve leave');
      }
    } catch (e) { alert('Approval failed'); }
  };

  const handleReject = async (l) => {
    if (!rejectReason) { alert('Enter reason'); return; }
    try {
      const res = await fetch(`http://localhost:3004/api/v1/leaves/${l.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setGlobalLeaves(ls => ls.map(x => x.id === l.id ? { ...x, status: 'rejected', rejected_reason: rejectReason } : x));
        addActivity('HR Manager', 'HR', `rejected leave for ${l.name}`, l.type, 'leave', 'var(--red)');
        addEmpNotif(l.name, { type: 'leave_rej', title: 'Leave Rejected', body: `Your ${l.type} was rejected. Reason: ${rejectReason}`, time: 'Just now', color: 'var(--red)' });
        setRejectingId(null); setRejectReason('');
      } else {
        alert('Failed to reject leave');
      }
    } catch (e) { alert('Rejection failed'); }
  };

  const filteredLeaves = globalLeaves.filter(l => {
    return statusFilter === 'all' || l.status === statusFilter;
  });

  return (
    <HRLayout title="Leave Requests">
      <div className="ph">
        <div>
          <div className="pt">Leave Approvals</div>
          <div className="ps">Manage staff leave applications</div>
        </div>
        <div className="pa">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--br)', fontSize: 12, fontWeight: 700, outline: 'none' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
        {filteredLeaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)', fontSize: 13, background: '#fff', borderRadius: 12, border: '1px dashed var(--br)' }}>
            No {statusFilter} leave requests found
          </div>
        ) : (
          filteredLeaves.map(l => (
            <div key={l.id} className="lrc" style={{ padding: 16 }}>
              <div className="lrc-top" style={{ marginBottom: 12 }}>
                <div className="av-row">
                  <Av name={l.name} size={32} r={8} />
                  <div>
                    <div className="lrc-nm" style={{ fontWeight: 700 }}>{l.name}</div>
                    <div className="lrc-ty" style={{ fontSize: 11 }}>
                      {l.type} \u00b7 {l.days || calculateDays(l.from_date, l.to_date)} days \u00b7 {formatDate(l.from_date || l.from)} \u2013 {formatDate(l.to_date || l.to)}
                    </div>
                  </div>
                </div>
                <span className={`bg bg-${l.status === 'pending' ? 'pend' : l.status === 'approved' ? 'appr' : 'rej'}`} style={{ fontSize: 9 }}>
                  {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                </span>
              </div>
              <div className="lrc-rs" style={{ background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{l.reason}</div>
              
              {l.status === 'rejected' && (l.rejected_reason || l.rejReason) && (
                <div style={{ fontSize: 11, color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: 8, borderLeft: '3px solid #ef4444', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 9, marginBottom: 2 }}>Rejection Reason:</div>
                  {l.rejected_reason || l.rejReason}
                </div>
              )}

              {l.status === 'pending' && (
                <div className="lrc-acts">
                  {rejectingId === l.id ? (
                    <div style={{ width: '100%' }}>
                      <textarea 
                        className="f-in" 
                        placeholder="Reason for rejection..." 
                        value={rejectReason} 
                        onChange={e => setRejectReason(e.target.value)}
                        style={{ marginBottom: 8, fontSize: 12, height: 60 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" style={{ background: '#ef4444', color: '#fff', flex: 1 }} onClick={() => handleReject(l)}>Confirm Reject</button>
                        <button className="btn bs btn-sm" style={{ flex: 1 }} onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                      </div>
                    </div>
                  ) : approvingId === l.id ? (
                    <div style={{ width: '100%' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--t2)' }}>Select Leave Type:</div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        {['paid', 'half day', 'unpaid'].map(type => (
                          <button 
                            key={type}
                            onClick={() => setLeaveType(type)}
                            style={{ 
                              flex: 1, 
                              padding: '8px', 
                              borderRadius: 8, 
                              fontSize: 10, 
                              fontWeight: 700, 
                              textTransform: 'uppercase',
                              border: `1px solid ${leaveType === type ? t.acc : 'var(--br)'}`,
                              background: leaveType === type ? `${t.acc}10` : '#fff',
                              color: leaveType === type ? t.acc : 'var(--t3)',
                              cursor: 'pointer'
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" style={{ background: t.acc, color: '#fff', flex: 1 }} onClick={() => handleApprove(l)}>Confirm Approve</button>
                        <button className="btn bs btn-sm" style={{ flex: 1 }} onClick={() => setApprovingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-sm" style={{ background: t.acc, color: '#fff', flex: 1 }} onClick={() => setApprovingId(l.id)}>
                        <Icon n="check" size={12} color="#fff"/> Approve
                      </button>
                      <button className="btn bs btn-sm" style={{ flex: 1, color: '#ef4444' }} onClick={() => setRejectingId(l.id)}>
                        <Icon n="x" size={12} color="#ef4444"/> Reject
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </HRLayout>
  );
};

export default HRPending;
