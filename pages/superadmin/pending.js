import React, { useState } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import ReceiptModal from '../../components/shared/ReceiptModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const SuperAdminPending = () => {
  const { globalLeaves, setGlobalLeaves, globalReimb, setGlobalReimb, addActivity, addEmpNotif, globalStaff } = useAppContext();
  const [tab, setTab] = useState('leave');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [leaveType, setLeaveType] = useState('paid');
  const [viewReceipt, setViewReceipt] = useState(null);
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const t = THEME.superadmin;

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

  const filteredPendingLeaves = globalLeaves.filter(l => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    if (!matchesStatus) return false;
    const from = new Date(l.from_date);
    const to = new Date(l.to_date || l.from_date);
    const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const monthEnd = new Date(selectedYear, selectedMonth, 0);
    return from <= monthEnd && to >= monthStart;
  });

  const filteredPendingReimb = globalReimb.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    if (!matchesStatus) return false;
    const created = new Date(r.created_at || r.date);
    return created.getMonth() + 1 === selectedMonth && created.getFullYear() === selectedYear;
  });

  const handleApproveLeave = async (l) => {
    try {
      const res = await fetch(`${API_BASE}/leaves/${l.id}/approve`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ leave_type: leaveType })
      });
      if (res.ok) {
        setGlobalLeaves(ls => ls.map(x => x.id === l.id ? { ...x, status: 'approved', type: leaveType } : x));
        addActivity('Super Admin', 'Super Admin', `approved ${leaveType} leave for ${l.name}`, l.type, 'leave', 'var(--grn)');
        addEmpNotif(l.name, { type: 'leave_appr', title: 'Leave Approved', body: `Your ${l.type} request has been approved as ${leaveType} leave.`, time: 'Just now', color: 'var(--grn)' });
        setApprovingId(null);
      } else {
        alert('Failed to approve leave');
      }
    } catch (e) { alert('Approval failed'); }
  };

  const handleRejectLeave = async (l) => {
    if (!rejectReason) { alert('Enter reason'); return; }
    try {
      const res = await fetch(`${API_BASE}/leaves/${l.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setGlobalLeaves(ls => ls.map(x => x.id === l.id ? { ...x, status: 'rejected', rejected_reason: rejectReason } : x));
        addActivity('Super Admin', 'Super Admin', `rejected leave for ${l.name}`, l.type, 'leave', 'var(--red)');
        addEmpNotif(l.name, { type: 'leave_rej', title: 'Leave Rejected', body: `Your ${l.type} was rejected. Reason: ${rejectReason}`, time: 'Just now', color: 'var(--red)' });
        setRejectingId(null); setRejectReason('');
      } else {
        alert('Failed to reject leave');
      }
    } catch (e) { alert('Rejection failed'); }
  };

  const handleApproveReimb = async (r) => {
    try {
      const res = await fetch(`${API_BASE}/reimbursements/${r.id}/approve`, { 
        method: 'PUT', 
        credentials: 'include' 
      });
      if (res.ok) {
        setGlobalReimb(rs => rs.map(x => x.id === r.id ? { ...x, status: 'approved' } : x));
        addActivity('Super Admin', 'Super Admin', `approved reimbursement for ${r.name}`, r.title, 'reimbursement', 'var(--grn)');
      } else {
        alert('Failed to approve reimbursement');
      }
    } catch (e) { alert('Approval failed'); }
  };

  const handleRejectReimb = async (r) => {
    if (!rejectReason) { alert('Enter reason'); return; }
    try {
      const res = await fetch(`${API_BASE}/reimbursements/${r.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setGlobalReimb(rs => rs.map(x => x.id === r.id ? { ...x, status: 'rejected', rejected_reason: rejectReason } : x));
        addActivity('Super Admin', 'Super Admin', `rejected reimbursement for ${r.name}`, r.title, 'reimbursement', 'var(--red)');
        setRejectingId(null); setRejectReason('');
      } else {
        alert('Failed to reject reimbursement');
      }
    } catch (e) { alert('Rejection failed'); }
  };

  return (
    <SuperAdminLayout title="Pending Requests">
      {viewReceipt && <ReceiptModal url={viewReceipt.url} title={viewReceipt.title} onClose={() => setViewReceipt(null)} />}
      
      <div className="ph" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 24,
        marginBottom: 35,
        padding: '24px 24px 0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div className="pt" style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: 4 }}>Employee Requests</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Manage and review all employee applications</div>
          </div>
          
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
                <Icon n="filter" size={14} color="#94a3b8" />
              </div>
              <select 
                className="f-in f-sel" 
                style={{ width: 150, height: 40, fontSize: 13, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', paddingLeft: 38, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
                <Icon n="calendar" size={14} color="#94a3b8" />
              </div>
              <select 
                className="f-in f-sel" 
                style={{ width: 140, height: 40, fontSize: 13, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', paddingLeft: 38, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <select 
                className="f-in f-sel" 
                style={{ width: 100, height: 40, fontSize: 13, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', paddingLeft: 15, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 6 }, (_, idx) => today.getFullYear() - idx).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          background: '#f1f5f9', 
          padding: 6, 
          borderRadius: 20, 
          border: '1px solid #e2e8f0',
          width: '100%'
        }}>
          <button 
            onClick={() => setTab('leave')}
            style={{ 
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800,
              background: tab === 'leave' ? '#fff' : 'transparent',
              color: tab === 'leave' ? '#0f172a' : '#64748b',
              boxShadow: tab === 'leave' ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <Icon n="calendar" size={16} color={tab === 'leave' ? '#3b82f6' : '#94a3b8'} />
            Leaves <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 11, fontWeight: 700 }}>{filteredPendingLeaves.length}</span>
          </button>
          <button 
            onClick={() => setTab('reimb')}
            style={{ 
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800,
              background: tab === 'reimb' ? '#fff' : 'transparent',
              color: tab === 'reimb' ? '#0f172a' : '#64748b',
              boxShadow: tab === 'reimb' ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <Icon n="file-text" size={16} color={tab === 'reimb' ? '#10b981' : '#94a3b8'} />
            Reimbursements <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 11, fontWeight: 700 }}>{filteredPendingReimb.length}</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          {tab === 'leave' ? (
            filteredPendingLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', fontSize: 15, border: '2px dashed #e2e8f0', borderRadius: 30, background: '#f8fafc' }}>
                <Icon n="calendar" size={40} color="#cbd5e1" style={{ marginBottom: 15, display: 'block', margin: '0 auto' }} />
                No {statusFilter} leave requests found
              </div>
            ) : (
              filteredPendingLeaves.map(l => (
                <div key={l.id} style={{ 
                  padding: 20, 
                  background: '#fff',
                  border: '1px solid #e2e8f0', 
                  borderRadius: 20, 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Status Badge Top Right */}
                  <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    <span style={{ 
                      fontSize: 8, fontWeight: 900, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6,
                      background: l.status === 'approved' ? '#dcfce7' : l.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: l.status === 'approved' ? '#16a34a' : l.status === 'rejected' ? '#dc2626' : '#d97706',
                      letterSpacing: '1px'
                    }}>
                      {l.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Header Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <Icon n="calendar" size={16} color="#3b82f6" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          {formatDate(l.from_date || l.from)} — {formatDate(l.to_date || l.to)}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Duration: <span style={{ color: '#3b82f6' }}>{l.days || calculateDays(l.from_date, l.to_date)} DAYS</span>
                        </div>
                      </div>
                    </div>

                    {/* Employee Info */}
                    {(() => {
                      const emp = globalStaff?.find(s => String(s.id) === String(l.employee_id) || String(s.employee_id) === String(l.employee_id));
                      const empName = emp?.name || l.name || 'Unknown';
                      const empId = emp?.employee_id || l.employee_id || 'N/A';
                      
                      return (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{empName}</div>
                            <div style={{ 
                              fontSize: 10, fontWeight: 800, color: '#3b82f6', background: '#eff6ff', 
                              padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', 
                              border: '1px solid #dbeafe'
                            }}>
                              {empId}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', 
                              padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' 
                            }}>
                              <Icon n="building" size={10} color="#64748b" />
                              <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>DEPT:</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                                {emp?.department?.name || emp?.dept || emp?.department_name || '—'}
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', 
                              padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' 
                            }}>
                              <Icon n="users" size={10} color="#64748b" />
                              <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>ROLE:</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                                {emp?.designation || emp?.role || emp?.perm || '—'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)' }}></div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{l.type}</div>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Reason Box */}
                    <div style={{ 
                      background: '#f8fafc', 
                      padding: 15, 
                      borderRadius: 16, 
                      border: '1px solid #f1f5f9',
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, marginBottom: 6, letterSpacing: '1px' }}>DESCRIPTION / REASON:</div>
                      <div style={{ fontSize: 13, color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>{l.reason}</div>
                    </div>

                    {/* Rejection Reason if any */}
                    {l.status === 'rejected' && (l.rejected_reason || l.rejReason) && (
                      <div style={{ background: '#fff1f2', padding: 15, borderRadius: 16, border: '1px solid #fee2e2' }}>
                        <div style={{ fontSize: 8, fontWeight: 900, color: '#e11d48', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>REJECTION REASON:</div>
                        <div style={{ fontSize: 13, color: '#e11d48', fontWeight: 600 }}>{l.rejected_reason || l.rejReason}</div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    {l.status === 'pending' && (
                      rejectingId === l.id ? (
                        <div style={{ background: '#fff1f2', padding: 15, borderRadius: 16, border: '1px solid #fecdd3', marginTop: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#e11d48', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Rejection (Compulsory)</div>
                          <textarea className="f-in" rows={2} placeholder="Provide a clear reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ marginBottom: 10, borderRadius: 10, fontSize: 12, border: '1px solid #fda4af', padding: 10, background: '#fff' }} />
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn" style={{ background: '#e11d48', color: '#fff', flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, boxShadow: '0 4px 10px rgba(225,29,72,0.15)' }} onClick={() => handleRejectLeave(l)} disabled={!rejectReason.trim()}>Confirm Reject</button>
                            <button className="btn" style={{ flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                          </div>
                        </div>
                      ) : approvingId === l.id ? (
                        <div style={{ background: '#f0fdf4', padding: 15, borderRadius: 16, border: '1px solid #bbf7d0', marginTop: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#15803d', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Leave Category</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                            {['paid', 'half day', 'unpaid'].map(type => (
                              <button key={type} onClick={() => setLeaveType(type)} style={{ padding: '10px 0', borderRadius: 10, border: '2px solid', borderColor: leaveType === type ? '#15803d' : '#dcfce7', background: leaveType === type ? '#15803d' : '#fff', color: leaveType === type ? '#fff' : '#15803d', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>{type}</button>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn" style={{ background: '#15803d', color: '#fff', flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, boxShadow: '0 4px 10px rgba(21,128,61,0.15)' }} onClick={() => handleApproveLeave(l)}>Confirm Approve</button>
                            <button className="btn" style={{ flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => { setApprovingId(null); }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          <button className="btn" style={{ background: '#10b981', color: '#fff', flex: 1, height: 44, fontSize: 13, fontWeight: 800, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }} onClick={() => setApprovingId(l.id)}>
                            <Icon n="check" size={16} /> Approve Request
                          </button>
                          <button className="btn" style={{ flex: 1, height: 44, fontSize: 13, fontWeight: 800, color: '#ef4444', border: '2px solid #fee2e2', borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s ease' }} onClick={() => setRejectingId(l.id)}>
                            <Icon n="x" size={16} /> Reject
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            filteredPendingReimb.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', fontSize: 15, border: '2px dashed #e2e8f0', borderRadius: 30, background: '#f8fafc' }}>
                <Icon n="file-text" size={40} color="#cbd5e1" style={{ marginBottom: 15, display: 'block', margin: '0 auto' }} />
                No {statusFilter} reimbursement requests found
              </div>
            ) : (
              filteredPendingReimb.map(r => (
                <div key={r.id} style={{ 
                  padding: 20, 
                  background: '#fff',
                  border: '1px solid #e2e8f0', 
                  borderRadius: 20, 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Status Badge Top Right */}
                  <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    <span style={{ 
                      fontSize: 8, fontWeight: 900, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6,
                      background: r.status === 'approved' ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: r.status === 'approved' ? '#16a34a' : r.status === 'rejected' ? '#dc2626' : '#d97706',
                      letterSpacing: '1px'
                    }}>
                      {r.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Header Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <Icon n="file-text" size={16} color="#10b981" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: '#10b981' }}>{formatDate(r.date)}</span>
                          <span style={{ color: '#e2e8f0' }}>|</span>
                          <span style={{ color: '#64748b', fontSize: 12 }}>{formatDate(r.submitted_date || r.created_at)}</span>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Expense Claim
                        </div>
                      </div>
                    </div>

                    {/* Employee Info */}
                    {(() => {
                      const emp = globalStaff?.find(s => String(s.id) === String(r.employee_id) || String(s.employee_id) === String(r.employee_id));
                      const empName = emp?.name || r.name || 'Unknown';
                      const empId = emp?.employee_id || r.employee_id || 'N/A';
                      
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{empName}</div>
                              <div style={{ 
                                fontSize: 10, fontWeight: 800, color: '#10b981', background: '#ecfdf5', 
                                padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', 
                                border: '1px solid #d1fae5'
                              }}>
                                {empId}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                              <div style={{ 
                                display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', 
                                padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' 
                              }}>
                                <Icon n="building" size={10} color="#64748b" />
                                <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>DEPT:</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                                  {emp?.department?.name || emp?.dept || emp?.department_name || '—'}
                                </div>
                              </div>
                              <div style={{ 
                                display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', 
                                padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' 
                              }}>
                                <Icon n="users" size={10} color="#64748b" />
                                <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>ROLE:</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                                  {emp?.designation || emp?.role || emp?.perm || '—'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.1)' }}></div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{r.title}</div>
                            </div>
                          </div>
                          
                          <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981', letterSpacing: '-1px', background: '#f0fdf4', padding: '6px 12px', borderRadius: 12, marginLeft: 15 }}>
                            ₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Reason Box */}
                    <div style={{ 
                      background: '#f8fafc', 
                      padding: 15, 
                      borderRadius: 16, 
                      border: '1px solid #f1f5f9',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 15
                    }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
                      }}>
                        <Icon n={r.category === 'Travel' ? 'truck' : r.category === 'Food' ? 'coffee' : 'file-text'} size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, marginBottom: 2, letterSpacing: '1px' }}>CATEGORY & DATES:</div>
                        <div style={{ fontSize: 13, color: '#334155', fontWeight: 800 }}>{r.category}</div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <div style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon n="calendar" size={10} /> Expense: {r.date}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon n="clock" size={10} /> Submitted: {r.submitted_date || (r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '—')}
                          </div>
                        </div>
                      </div>
                      
                      {r.receipt && (
                        <button 
                          onClick={() => setViewReceipt({ url: r.receipt, title: r.title })}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: 10, fontSize: 11, fontWeight: 800, color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <Icon n="image" size={14} color="#94a3b8" /> View Receipt
                        </button>
                      )}
                    </div>

                    {/* Rejection Reason if any */}
                    {r.status === 'rejected' && (r.rejected_reason || r.rejReason) && (
                      <div style={{ background: '#fff1f2', padding: 15, borderRadius: 16, border: '1px solid #fee2e2' }}>
                        <div style={{ fontSize: 8, fontWeight: 900, color: '#e11d48', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>REJECTION REASON:</div>
                        <div style={{ fontSize: 13, color: '#e11d48', fontWeight: 600 }}>{r.rejected_reason || r.rejReason}</div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    {r.status === 'pending' && (
                      rejectingId === r.id ? (
                        <div style={{ background: '#fff1f2', padding: 15, borderRadius: 16, border: '1px solid #fecdd3', marginTop: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#e11d48', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Rejection (Compulsory)</div>
                          <textarea className="f-in" rows={2} placeholder="Provide a clear reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ marginBottom: 10, borderRadius: 10, fontSize: 12, border: '1px solid #fda4af', padding: 10, background: '#fff' }} />
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn" style={{ background: '#e11d48', color: '#fff', flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, boxShadow: '0 4px 10px rgba(225,29,72,0.15)' }} onClick={() => handleRejectReimb(r)} disabled={!rejectReason.trim()}>Confirm Reject</button>
                            <button className="btn" style={{ flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          <button className="btn" style={{ background: '#10b981', color: '#fff', flex: 1, height: 44, fontSize: 13, fontWeight: 800, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }} onClick={() => handleApproveReimb(r)}>
                            <Icon n="check" size={16} /> Approve Reimbursement
                          </button>
                          <button className="btn" style={{ flex: 1, height: 44, fontSize: 13, fontWeight: 800, color: '#ef4444', border: '2px solid #fee2e2', borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s ease' }} onClick={() => setRejectingId(r.id)}>
                            <Icon n="x" size={16} /> Reject
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminPending;
