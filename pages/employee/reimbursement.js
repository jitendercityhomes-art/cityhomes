
import React, { useState } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout';
import Icon from '../../components/shared/Icon';
import ReceiptModal from '../../components/shared/ReceiptModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const EmployeeReimbursement = () => {
  const { user, globalReimb, setGlobalReimb, addActivity } = useAppContext();
  const [showApply, setShowApply] = useState(false);
  const [newReimb, setNewReimb] = useState({ title: '', amount: '', category: 'Travel', date: new Date().toISOString().split('T')[0], receipt_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [viewReceipt, setViewReceipt] = useState(null);
  const t = THEME.employee;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewReimb({ ...newReimb, receipt_url: reader.result });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    if (!newReimb.title || !newReimb.amount || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reimbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          ...newReimb, 
          name: user.name, 
          employee_email: user.email,
          employee_id: user.employee_id || user.id,
          submitted_date: new Date().toISOString().split('T')[0],
          status: 'pending' 
        })
      });
      if (res.ok) {
        const reimb = await res.json();
        const fullReimb = {
          ...reimb,
          name: reimb.name || user.name,
          employee_email: reimb.employee_email || user.email,
          employee_id: reimb.employee_id || user.employee_id || user.id,
          title: reimb.description || reimb.category,
          date: reimb.date || (reimb.created_at ? new Date(reimb.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          submitted_date: reimb.submitted_date || new Date().toISOString().split('T')[0],
          receipt: reimb.receipt_url
        };
        setGlobalReimb(rs => [fullReimb, ...rs]);
        addActivity(user.name, 'Employee', `submitted expense claim`, `₹${fullReimb.amount.toLocaleString()}`, 'reimb', 'var(--blu)');
        setShowApply(false);
        setNewReimb({ title: '', amount: '', category: 'Travel', date: new Date().toISOString().split('T')[0], receipt_url: '' });
        setShowSuccess(true);
      } else {
        setErrorModal({ show: true, message: 'Failed to submit your claim. Please try again.' });
      }
    } catch (e) { 
      setErrorModal({ show: true, message: 'A connection error occurred. Please check your internet.' }); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    const id = showDeleteConfirm;
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/reimbursements/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setGlobalReimb(rs => rs.filter(r => r.id !== id));
        setShowDeleteConfirm(null);
        setShowDeleteSuccess(true);
      } else {
        setErrorModal({ show: true, message: 'Failed to delete the claim.' });
      }
    } catch (e) { 
      setErrorModal({ show: true, message: 'An error occurred while deleting.' }); 
    }
  };

  const myReimb = (globalReimb || []).filter(r => {
    if (!user) return false;
    
    // Support matching by employee_id/id first (most reliable)
    const userId = String(user.id || '');
    const userEmpId = String(user.employee_id || '');
    const reimbEmpId = String(r.employee_id || r.employeeId || '');
    
    if (reimbEmpId && (reimbEmpId === userId || reimbEmpId === userEmpId)) return true;

    // Fallback to email/name matching
    const userEmail = (user.email || '').trim().toLowerCase();
    const userName = (user.name || '').trim().toLowerCase();
    
    const rEmail = (r.employee_email || r.employeeEmail || '').trim().toLowerCase();
    const rName = (r.name || '').trim().toLowerCase();
    
    const matchesEmail = userEmail && rEmail && rEmail === userEmail;
    const matchesName = userName && rName && rName === userName;
    
    return matchesEmail || matchesName;
  });

  return (
    <EmployeeLayout title="Expense Claims">
      {viewReceipt && <ReceiptModal url={viewReceipt.url} title={viewReceipt.title} onClose={() => setViewReceipt(null)} />}
      
      {showSuccess && (
        <div className="modal-ov" onClick={() => setShowSuccess(false)}>
          <div className="modal-box" style={{ maxWidth: 300, textAlign: 'center', borderRadius: '24px', padding: '30px' }}>
            <div style={{ background: '#ecfdf5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon n="check" size={30} color="#10b981" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Success!</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Your reimbursement claim has been submitted successfully.</div>
            <button className="btn btn-full" style={{ background: t.acc, color: '#fff', borderRadius: '12px' }} onClick={() => setShowSuccess(false)}>Great!</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-ov" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 320, textAlign: 'center', borderRadius: '24px', padding: '30px' }}>
            <div style={{ background: '#fff1f2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon n="trash" size={30} color="#ef4444" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Delete Claim?</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Are you sure you want to delete this reimbursement request? This action cannot be undone.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn bs" style={{ borderRadius: '12px' }} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: '#ef4444', color: '#fff', borderRadius: '12px' }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="modal-ov" onClick={() => setShowDeleteSuccess(false)}>
          <div className="modal-box" style={{ maxWidth: 300, textAlign: 'center', borderRadius: '24px', padding: '30px' }}>
            <div style={{ background: '#ecfdf5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon n="check" size={30} color="#10b981" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Deleted!</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>The reimbursement claim has been deleted successfully.</div>
            <button className="btn btn-full" style={{ background: t.acc, color: '#fff', borderRadius: '12px' }} onClick={() => setShowDeleteSuccess(false)}>OK</button>
          </div>
        </div>
      )}

      {errorModal.show && (
        <div className="modal-ov" onClick={() => setErrorModal({ show: false, message: '' })}>
          <div className="modal-box" style={{ maxWidth: 300, textAlign: 'center', borderRadius: '24px', padding: '30px' }}>
            <div style={{ background: '#fee2e2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon n="alert-circle" size={30} color="#ef4444" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Oops!</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>{errorModal.message}</div>
            <button className="btn btn-full" style={{ background: '#ef4444', color: '#fff', borderRadius: '12px' }} onClick={() => setErrorModal({ show: false, message: '' })}>Close</button>
          </div>
        </div>
      )}

      {showApply && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setShowApply(false)}>
          <div className="modal-box" style={{ maxWidth: 450, borderRadius: '24px', padding: '24px' }}>
            <div className="modal-head" style={{ marginBottom: '20px' }}>
              <span className="modal-title" style={{ fontSize: '20px', fontWeight: '800' }}>Submit Expense Claim</span>
              <button className="ib" onClick={() => setShowApply(false)} style={{ background: '#f1f5f9', borderRadius: '50%', padding: '8px' }}>
                <Icon n="x" size={16}/>
              </button>
            </div>
            <div className="modal-body" style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>
              <div className="fg">
                <label className="fl" style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>Expense Title</label>
                <input className="f-in" style={{ borderRadius: '12px', padding: '12px' }} placeholder="eg. Client Meeting Travel" value={newReimb.title} onChange={e => setNewReimb({...newReimb, title: e.target.value})} />
              </div>
              <div className="fr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fg">
                  <label className="fl" style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>Amount</label>
                  <input className="f-in" style={{ borderRadius: '12px', padding: '12px' }} type="number" placeholder="0.00" value={newReimb.amount} onChange={e => setNewReimb({...newReimb, amount: Number(e.target.value)})} />
                </div>
              <div className="fr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fg">
                  <label className="fl" style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>Expense Date</label>
                  <input className="f-in" style={{ borderRadius: '12px', padding: '12px' }} type="date" value={newReimb.date} onChange={e => setNewReimb({...newReimb, date: e.target.value})} />
                </div>
                <div className="fg">
                  <label className="fl" style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>Submit Date</label>
                  <input className="f-in" style={{ borderRadius: '12px', padding: '12px', background: '#f8fafc', color: '#94a3b8' }} type="text" value={new Date().toISOString().split('T')[0]} readOnly />
                </div>
              </div>
              </div>
              <div className="fg">
                <label className="fl" style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>Category</label>
                <select className="f-in f-sel" style={{ borderRadius: '12px', padding: '12px' }} value={newReimb.category} onChange={e => setNewReimb({...newReimb, category: e.target.value})}>
                  <option>Travel</option>
                  <option>Food</option>
                  <option>Mobile</option>
                  <option>Software</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl" style={{ fontWeight: '700', fontSize: '13px', color: '#64748b' }}>Attachment (Receipt)</label>
                <div 
                  onClick={() => document.getElementById('receipt-upload').click()}
                  style={{ 
                    border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '20px', 
                    textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = t.acc}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <input 
                    id="receipt-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                  />
                  <Icon n="upload" size={24} color={newReimb.receipt_url ? '#10b981' : '#94a3b8'} style={{ marginBottom: '8px' }}/>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                    {newReimb.receipt_url ? 'Image Attached Successfully' : 'Click to upload receipt image'}
                  </div>
                  {isUploading && <div style={{ fontSize: '10px', color: t.acc, marginTop: '4px' }}>Processing...</div>}
                </div>
              </div>
            </div>
            <div className="modal-foot" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn bs" style={{ borderRadius: '12px', padding: '12px', fontWeight: '700' }} onClick={() => setShowApply(false)}>Cancel</button>
              <button className="btn" 
                style={{ background: t.acc, color: '#fff', borderRadius: '12px', padding: '12px', fontWeight: '700', opacity: (isSubmitting || isUploading) ? 0.7 : 1 }} 
                onClick={handleApply}
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? 'Submitting...' : isUploading ? 'Processing...' : 'Submit Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="ph">
        <div>
          <div className="pt">Reimbursement History</div>
          <div className="ps">Track your expense claims</div>
        </div>
        <div className="pa">
          <button className="btn btn-sm" style={{ background: t.acc, color: '#fff', padding: '6px 12px', fontSize: 12, fontWeight: 700 }} onClick={() => setShowApply(true)}>
            <Icon n="plus" size={13} color="#fff"/> Submit Expense
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {myReimb.length === 0 ? (
          <div className="cd" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>No expense history found.</div>
        ) : (
          myReimb.map(r => (
            <div key={r.id} className="cd" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.acc 
                  }}>
                    <Icon n={r.category === 'Travel' ? 'truck' : r.category === 'Food' ? 'coffee' : 'file-text'} size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>{r.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '800', color: t.acc, background: `${t.acc}10`, padding: '2px 8px', borderRadius: '6px', fontSize: '10px', textTransform: 'uppercase' }}>{r.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }} title="Expense Date">
                          <Icon n="calendar" size={12} />
                          {r.date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', color: '#64748b', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }} title="Submitted Date">
                          <Icon n="clock" size={10} />
                          {r.submitted_date || (r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '—')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981', marginBottom: '4px' }}>₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span className={`bg ${r.status === 'approved' ? 'bg-appr' : r.status === 'rejected' ? 'bg-rej' : 'bg-pend'}`} style={{ 
                        fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px' 
                      }}>
                        {r.status}
                      </span>
                      {r.status === 'pending' && (
                        <button 
                          onClick={() => setShowDeleteConfirm(r.id)}
                          style={{ 
                            background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', 
                            width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                          title="Delete Request"
                        >
                          <Icon n="trash" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {r.receipt && (
                    <button 
                      className="btn bs" 
                      style={{ 
                        borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '700', 
                        display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0' 
                      }} 
                      onClick={() => setViewReceipt({ url: r.receipt, title: r.title })}
                    >
                      <Icon n="eye" size={14}/> View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeReimbursement;
