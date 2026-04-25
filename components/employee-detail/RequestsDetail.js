import React, { useState, useEffect } from 'react';
import Icon from '../shared/Icon';
import { useAppContext } from '../../context/AppContext';
import { API_BASE } from '../../lib/constants';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const RequestsDetail = ({ emp, onBack, accentColor, flat = false }) => {
  const { setGlobalLeaves, setGlobalReimb, addActivity, addEmpNotif } = useAppContext();
  const employee = emp || {};
  const today = new Date();
  const [activeTab, setActiveTab] = useState('leaves'); // 'leaves' or 'reimbursements'
  const [rawRequests, setRawRequests] = useState({ leaves: [], reimbursements: [] });
  const [data, setData] = useState({ leaves: [], reimbursements: [] });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');
  
  const t = accentColor || 'var(--teal)';

  const isSameMonthYear = (date, month, year) => {
    if (!date) return false;
    const d = new Date(date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  };

  const requestIntersectsMonthYear = (fromDate, toDate, month, year) => {
    const start = new Date(fromDate);
    const end = new Date(toDate || fromDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    return start <= monthEnd && end >= monthStart;
  };

  useEffect(() => {
    const loadRequests = async () => {
      if (!employee?.id) {
        setRawRequests({ leaves: [], reimbursements: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [leavesRes, reimbRes] = await Promise.all([
          fetch(`${API_BASE}/leaves?employee_id=${employee.id}`, { credentials: 'include' }),
          fetch(`${API_BASE}/reimbursements`, { credentials: 'include' })
        ]);

        let leaves = [];
        let reimbursements = [];

        if (leavesRes.ok) leaves = await leavesRes.json();
        if (reimbRes.ok) reimbursements = await reimbRes.json();

        setRawRequests({
          leaves: Array.isArray(leaves) ? leaves : [],
          reimbursements: Array.isArray(reimbursements) ? reimbursements : []
        });
      } catch (err) {
        console.error('Failed to load requests', err);
        setRawRequests({ leaves: [], reimbursements: [] });
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [employee.id]);

  useEffect(() => {
    const filteredLeaves = rawRequests.leaves.filter((l) => {
      const matchesDate = requestIntersectsMonthYear(l.from_date, l.to_date, selectedMonth, selectedYear);
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchesDate && matchesStatus;
    });

    const filteredReimbursements = rawRequests.reimbursements.filter((r) => {
      const isEmployee = (r.employee?.id && r.employee.id === employee.id) || r.employee_id === employee.id || r.employee?.name === employee.name;
      const matchesDate = isSameMonthYear(r.created_at || r.date, selectedMonth, selectedYear);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return isEmployee && matchesDate && matchesStatus;
    });

    setData({
      leaves: filteredLeaves,
      reimbursements: filteredReimbursements
    });
  }, [rawRequests, selectedMonth, selectedYear, statusFilter, employee.id]);

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return 'var(--t3)';
    }
  };

  const currentList = activeTab === 'leaves' ? data.leaves : data.reimbursements;

  const years = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 5; y--) years.push(y);

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

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [leaveType, setLeaveType] = useState('paid');

  const handleApprove = async (req) => {
    setIsProcessing(true);
    try {
      const type = activeTab === 'leaves' ? 'leaves' : 'reimbursements';
      const res = await fetch(`${API_BASE}/${type}/${req.id}/approve`, {
        method: activeTab === 'leaves' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: activeTab === 'leaves' ? JSON.stringify({ leave_type: leaveType }) : undefined
      });
      if (res.ok) {
        setRawRequests(prev => ({
          ...prev,
          [type]: prev[type].map(r => r.id === req.id ? { ...r, status: 'approved', type: type === 'leaves' ? leaveType : r.type } : r)
        }));
        
        if (activeTab === 'leaves') {
          setGlobalLeaves(ls => ls.map(x => x.id === req.id ? { ...x, status: 'approved', type: leaveType } : x));
          addActivity('Super Admin', 'Super Admin', `approved ${leaveType} leave for ${employee.name}`, req.type, 'leave', 'var(--grn)');
          addEmpNotif(employee.name, { type: 'leave_appr', title: 'Leave Approved', body: `Your ${req.type} request has been approved as ${leaveType} leave.`, time: 'Just now', color: 'var(--grn)' });
        } else {
          setGlobalReimb(rs => rs.map(x => x.id === req.id ? { ...x, status: 'approved' } : x));
          addActivity('Super Admin', 'Super Admin', `approved reimbursement for ${employee.name}`, req.title, 'reimbursement', 'var(--grn)');
        }
        
        setApprovingId(null);
      }
    } catch (err) {
      console.error('Approval failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (req) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      const type = activeTab === 'leaves' ? 'leaves' : 'reimbursements';
      const res = await fetch(`${API_BASE}/${type}/${req.id}/reject`, {
        method: activeTab === 'leaves' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setRawRequests(prev => ({
          ...prev,
          [type]: prev[type].map(r => r.id === req.id ? { ...r, status: 'rejected', rejection_reason: rejectReason, rejected_reason: rejectReason } : r)
        }));

        if (activeTab === 'leaves') {
          setGlobalLeaves(ls => ls.map(x => x.id === req.id ? { ...x, status: 'rejected', rejected_reason: rejectReason } : x));
          addActivity('Super Admin', 'Super Admin', `rejected leave for ${employee.name}`, req.type, 'leave', 'var(--red)');
          addEmpNotif(employee.name, { type: 'leave_rej', title: 'Leave Rejected', body: `Your ${req.type} was rejected. Reason: ${rejectReason}`, time: 'Just now', color: 'var(--red)' });
        } else {
          setGlobalReimb(rs => rs.map(x => x.id === req.id ? { ...x, status: 'rejected', rejected_reason: rejectReason } : x));
          addActivity('Super Admin', 'Super Admin', `rejected reimbursement for ${employee.name}`, req.title, 'reimbursement', 'var(--red)');
        }

        setRejectingId(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error('Rejection failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={flat ? '' : 'cd'} style={{ padding: '24px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: 4 }}>Employee Requests</div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Manage and review all applications for {employee.name}</div>
        </div>
        
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
              <Icon n="filter" size={13} color="#94a3b8" />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, outline: 'none', background: '#fff', cursor: 'pointer' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
              <Icon n="calendar" size={13} color="#94a3b8" />
            </div>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{ height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, outline: 'none', background: '#fff', cursor: 'pointer' }}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ height: 40, padding: '0 12px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, outline: 'none', background: '#fff', cursor: 'pointer' }}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', background: '#f1f5f9', padding: 6, borderRadius: 20, border: '1px solid #e2e8f0', marginBottom: 24 }}>
        <button 
          onClick={() => setActiveTab('leaves')}
          style={{ 
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800,
            background: activeTab === 'leaves' ? '#fff' : 'transparent',
            color: activeTab === 'leaves' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'leaves' ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          <Icon n="calendar" size={16} color={activeTab === 'leaves' ? '#3b82f6' : '#94a3b8'} />
          Leaves <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 11, fontWeight: 700 }}>{data.leaves.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('reimbursements')}
          style={{ 
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800,
            background: activeTab === 'reimbursements' ? '#fff' : 'transparent',
            color: activeTab === 'reimbursements' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'reimbursements' ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          <Icon n="file-text" size={16} color={activeTab === 'reimbursements' ? '#10b981' : '#94a3b8'} />
          Reimbursements <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 11, fontWeight: 700 }}>{data.reimbursements.length}</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', fontSize: 15, border: '2px dashed #e2e8f0', borderRadius: 30, background: '#f8fafc' }}>
          Loading requests...
        </div>
      ) : currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', fontSize: 15, border: '2px dashed #e2e8f0', borderRadius: 30, background: '#f8fafc' }}>
          <Icon n={activeTab === 'leaves' ? 'calendar' : 'file-text'} size={40} color="#cbd5e1" style={{ marginBottom: 15, display: 'block', margin: '0 auto' }} />
          No {statusFilter} {activeTab} found for {MONTH_NAMES[selectedMonth-1]} {selectedYear}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {currentList.map((req, idx) => (
            <div key={idx} style={{ 
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
                  background: req.status === 'approved' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                  color: req.status === 'approved' ? '#16a34a' : req.status === 'rejected' ? '#dc2626' : '#d97706',
                  letterSpacing: '1px'
                }}>
                  {req.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <Icon n={activeTab === 'leaves' ? 'calendar' : 'file-text'} size={16} color={activeTab === 'leaves' ? '#3b82f6' : '#10b981'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      {activeTab === 'leaves' 
                        ? `${formatDate(req.from_date || req.from)} — ${formatDate(req.to_date || req.to)}`
                        : formatDate(req.created_at || req.date)
                      }
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {activeTab === 'leaves' 
                        ? <>Duration: <span style={{ color: '#3b82f6' }}>{req.days || calculateDays(req.from_date, req.to_date)} DAYS</span></>
                        : 'Expense Claim'
                      }
                    </div>
                  </div>
                </div>

                {/* Employee Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{employee.name}</div>
                      <div style={{ 
                        fontSize: 10, fontWeight: 800, color: activeTab === 'leaves' ? '#3b82f6' : '#10b981', 
                        background: activeTab === 'leaves' ? '#eff6ff' : '#ecfdf5', padding: '2px 8px', 
                        borderRadius: 6, textTransform: 'uppercase', border: `1px solid ${activeTab === 'leaves' ? '#dbeafe' : '#d1fae5'}`
                      }}>
                        {employee.employee_id || employee.id || 'N/A'}
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
                          {employee.department?.name || employee.dept || employee.department_name || '—'}
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', 
                        padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' 
                      }}>
                        <Icon n="users" size={10} color="#64748b" />
                        <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>ROLE:</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                          {employee.designation || employee.role || employee.perm || '—'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeTab === 'leaves' ? '#3b82f6' : '#10b981', boxShadow: `0 0 0 2px ${activeTab === 'leaves' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)'}` }}></div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{req.type || req.title || (activeTab === 'leaves' ? 'Leave Request' : 'Expense')}</div>
                    </div>
                  </div>
                  
                  {activeTab === 'reimbursements' && req.amount && (
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981', letterSpacing: '-1px', background: '#f0fdf4', padding: '6px 12px', borderRadius: 12, marginLeft: 15 }}>
                      ₹{Number(req.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
                
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
                  {activeTab === 'reimbursements' && (
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
                    }}>
                      <Icon n={req.category === 'Travel' ? 'truck' : req.category === 'Food' ? 'coffee' : 'file-text'} size={18} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, marginBottom: 2, letterSpacing: '1px' }}>
                      {activeTab === 'leaves' ? 'DESCRIPTION / REASON:' : 'CATEGORY:'}
                    </div>
                    <div style={{ fontSize: 13, color: '#334155', fontWeight: 800 }}>
                      {activeTab === 'leaves' ? (req.reason || 'No reason provided') : (req.category || req.title || 'Expense')}
                    </div>
                    {activeTab === 'reimbursements' && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <div style={{ 
                          fontSize: 10, color: '#16a34a', background: '#f0fdf4', 
                          padding: '4px 10px', borderRadius: '8px', border: '1px solid #dcfce7',
                          display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700
                        }}>
                          <Icon n="calendar" size={12} /> 
                          <span style={{ opacity: 0.7, fontSize: 8 }}>EXPENSE:</span> {req.date || (req.created_at ? new Date(req.created_at).toISOString().split('T')[0] : '—')}
                        </div>
                        {(req.submitted_date || req.created_at) && (
                          <div style={{ 
                            fontSize: 10, color: '#64748b', background: '#f8fafc', 
                            padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700
                          }}>
                            <Icon n="clock" size={10} /> 
                            <span style={{ opacity: 0.7, fontSize: 8 }}>SUBMITTED:</span> {req.submitted_date || (req.created_at ? new Date(req.created_at).toISOString().split('T')[0] : '—')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {activeTab === 'reimbursements' && (req.receipt_url || req.receipt) && (
                    <button 
                      onClick={() => onBack && typeof onBack === 'function' ? {/* pass up */} : window.open(req.receipt_url || req.receipt)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: 10, fontSize: 11, fontWeight: 800, color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <Icon n="image" size={14} color="#94a3b8" /> View Receipt
                    </button>
                  )}
                </div>

                {/* Rejection Reason if any */}
                {req.status === 'rejected' && (req.rejected_reason || req.rejection_reason) && (
                  <div style={{ background: '#fff1f2', padding: 15, borderRadius: 16, border: '1px solid #fee2e2' }}>
                    <div style={{ fontSize: 8, fontWeight: 900, color: '#e11d48', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>REJECTION REASON:</div>
                    <div style={{ fontSize: 13, color: '#e11d48', fontWeight: 600 }}>{req.rejected_reason || req.rejection_reason}</div>
                  </div>
                )}
                
                {/* Actions */}
                {req.status === 'pending' && (
                  rejectingId === (req.id || idx) ? (
                    <div style={{ background: '#fff1f2', padding: 15, borderRadius: 16, border: '1px solid #fecdd3', marginTop: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: '#e11d48', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Rejection (Compulsory)</div>
                      <textarea className="f-in" rows={2} placeholder="Provide a clear reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', marginBottom: 10, borderRadius: 10, fontSize: 12, border: '1px solid #fda4af', padding: 10, background: '#fff', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn" style={{ background: '#e11d48', color: '#fff', flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, boxShadow: '0 4px 10px rgba(225,29,72,0.15)' }} onClick={() => handleReject(req)} disabled={!rejectReason.trim()}>Confirm Reject</button>
                        <button className="btn" style={{ flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                      </div>
                    </div>
                  ) : approvingId === (req.id || idx) ? (
                    <div style={{ background: '#f0fdf4', padding: 15, borderRadius: 16, border: '1px solid #bbf7d0', marginTop: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: '#15803d', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Leave Category</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                        {[
                          { id: 'paid', label: 'Paid Leave' },
                          { id: 'half day', label: 'Half Day' },
                          { id: 'unpaid', label: 'Unpaid Leave' }
                        ].map(opt => (
                          <button 
                            key={opt.id} 
                            onClick={() => setLeaveType(opt.id)} 
                            style={{ 
                              padding: '10px 0', 
                              borderRadius: 10, 
                              border: '2px solid', 
                              borderColor: leaveType === opt.id ? '#15803d' : '#dcfce7', 
                              background: leaveType === opt.id ? '#15803d' : '#fff', 
                              color: leaveType === opt.id ? '#fff' : '#15803d', 
                              fontSize: 10, 
                              fontWeight: 900, 
                              textTransform: 'uppercase', 
                              cursor: 'pointer', 
                              transition: 'all 0.2s' 
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn" style={{ background: '#15803d', color: '#fff', flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, boxShadow: '0 4px 10px rgba(21,128,61,0.15)' }} onClick={() => handleApprove(req)}>Confirm Approve</button>
                        <button className="btn" style={{ flex: 1, height: 40, borderRadius: 10, fontWeight: 800, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => { setApprovingId(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <button 
                        className="btn" 
                        style={{ background: activeTab === 'leaves' ? '#10b981' : '#10b981', color: '#fff', flex: 1, height: 44, fontSize: 13, fontWeight: 800, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }} 
                        onClick={() => activeTab === 'leaves' ? setApprovingId(req.id || idx) : handleApprove(req)}
                        disabled={isProcessing}
                      >
                        <Icon n="check" size={16} /> {activeTab === 'leaves' ? 'Approve Request' : 'Approve Claim'}
                      </button>
                      <button 
                        className="btn" 
                        style={{ flex: 1, height: 44, fontSize: 13, fontWeight: 800, color: '#ef4444', border: '2px solid #fee2e2', borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s ease' }} 
                        onClick={() => setRejectingId(req.id || idx)}
                        disabled={isProcessing}
                      >
                        <Icon n="x" size={16} /> Reject
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsDetail;
