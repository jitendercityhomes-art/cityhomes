import React, { useState, useEffect } from 'react';
import Icon from '../shared/Icon';
import { useAppContext } from '../../context/AppContext';
import { API_BASE } from '../../lib/constants';

const BankDetails = ({ emp, onBack, accentColor, flat = false, showClose = true, onSaved }) => {
  const { user: currentUser, setGlobalStaff } = useAppContext();
  const employee = emp || {};
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    bank_account: '',
    bank_ifsc: '',
    bank_branch: '',
    bank_account_holder: '',
    upi_id: '',
    pan_number: '',
    aadhaar_number: '',
    passbook_photo_url: ''
  });

  const t = accentColor || 'var(--teal)';
  const canEdit = currentUser?.role === 'superadmin' || currentUser?.role === 'hr';

  useEffect(() => {
    const loadBankData = async () => {
      if (!employee?.id) {
        console.log('BankDetails: No employee ID provided');
        setLoading(false);
        return;
      }

      console.log('BankDetails: Starting to fetch data for employee ID:', employee.id);
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/employees/${employee.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        console.log('BankDetails: Response status:', res.status, res.statusText);
        
        if (res.status === 401) {
          console.error('BankDetails: Unauthorized - Please login again');
          alert('Session expired. Please login again.');
          return;
        }
        
        if (res.status === 403) {
          console.error('BankDetails: Forbidden - You do not have permission');
          alert('You do not have permission to view this data.');
          return;
        }
        
        if (res.ok) {
          const empData = await res.json();
          console.log('BankDetails: Successfully loaded employee data:', empData);
          console.log('BankDetails: Bank fields -', {
            bank_name: empData.bank_name,
            bank_account: empData.bank_account,
            bank_ifsc: empData.bank_ifsc,
            bank_account_holder: empData.bank_account_holder
          });
          setFormData({
            bank_name: empData.bank_name || '',
            bank_account: empData.bank_account || '',
            bank_ifsc: empData.bank_ifsc || '',
            bank_branch: empData.bank_branch || '',
            bank_account_holder: empData.bank_account_holder || '',
            upi_id: empData.upi_id || '',
            pan_number: empData.pan_number || '',
            aadhaar_number: empData.aadhaar_number || '',
            passbook_photo_url: empData.passbook_photo_url || ''
          });
        } else {
          const errorText = await res.text();
          console.error('BankDetails: Failed to fetch employee data. Status:', res.status, 'Error:', errorText);
        }
      } catch (err) {
        console.error('BankDetails: Network error while loading bank data:', err.message);
        console.error('BankDetails: Full error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBankData();
  }, [employee.id]);

  const handleSave = async () => {
    // Validate required fields
    if (!formData.bank_account_holder?.trim()) {
      alert('Account Holder Name is required');
      return;
    }
    if (!formData.bank_name?.trim()) {
      alert('Bank Name is required');
      return;
    }
    if (!formData.bank_account?.trim()) {
      alert('Account Number is required');
      return;
    }
    if (!formData.bank_ifsc?.trim()) {
      alert('IFSC Code is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedEmp = await res.json();
        setGlobalStaff(prev => prev.map(s => s.id === updatedEmp.id ? updatedEmp : s));
        if (onSaved) onSaved(updatedEmp);
        setIsEditing(false);
        // Show success message
        alert('Bank details saved successfully!');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }
        console.error('Failed to save bank details:', errorMessage);
        alert(`Failed to save bank details: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error saving bank details:', err);
      alert(`Error saving bank details: ${err.message || 'Network error. Please check your connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  const maskAccountNumber = (acc) => {
    if (!acc) return '';
    const str = String(acc);
    if (str.length <= 4) return str;
    return '**** **** ' + str.slice(-4);
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/file-storage/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, [field]: data.url }));
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--t2)' }}>Loading...</div>;

  return (
    <div className={flat ? '' : 'cd'} style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Bank & Identity Details</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {canEdit && !isEditing && (
            <button className="btn bs" onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', borderRadius: 10 }}>
              <Icon n="edit" size={14} /> Edit
            </button>
          )}
          {showClose && (
            <button className="ib" onClick={onBack} style={{ background: 'var(--s2)', borderRadius: 10 }}><Icon n="x" size={16} color="var(--t2)"/></button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {/* Basic Bank Info */}
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--br)', paddingBottom: 8 }}>
            Bank Information
          </div>
          
          <Field label="Account Holder Name" value={formData.bank_account_holder} editing={isEditing} onChange={v => setFormData({ ...formData, bank_account_holder: v })} />
          <Field label="Bank Name" value={formData.bank_name} editing={isEditing} onChange={v => setFormData({ ...formData, bank_name: v })} />
          <Field label="Account Number" value={isEditing ? formData.bank_account : maskAccountNumber(formData.bank_account)} editing={isEditing} onChange={v => setFormData({ ...formData, bank_account: v })} />
          <Field label="IFSC Code" value={formData.bank_ifsc} editing={isEditing} onChange={v => setFormData({ ...formData, bank_ifsc: v })} />
          <Field label="Branch Name" value={formData.bank_branch} editing={isEditing} onChange={v => setFormData({ ...formData, bank_branch: v })} />
          
        </div>

        {/* Identity & Tax */}
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--br)', paddingBottom: 8 }}>
            Identity & UPI
          </div>
          
          <Field label="UPI ID" value={formData.upi_id} editing={isEditing} onChange={v => setFormData({ ...formData, upi_id: v })} placeholder="example@upi" />
          <Field label="PAN Card Number" value={formData.pan_number} editing={isEditing} onChange={v => setFormData({ ...formData, pan_number: v })} />
          <Field label="Aadhaar Number" value={formData.aadhaar_number} editing={isEditing} onChange={v => setFormData({ ...formData, aadhaar_number: v })} />
          
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--br)', paddingBottom: 8, marginBottom: 16 }}>
              Documents
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <UploadBox 
                label="Passbook Photo" 
                url={formData.passbook_photo_url} 
                editing={isEditing} 
                onUpload={e => handleFileUpload(e, 'passbook_photo_url')} 
              />
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn bs" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
          <button className="btn" onClick={handleSave} style={{ background: t, color: '#fff', minWidth: 120 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, editing, onChange, placeholder }) => (
  <div style={{ display: 'grid', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>{label}</label>
    {editing ? (
      <input 
        className="f-in" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder || `Enter ${label}`}
        style={{ borderRadius: 12, padding: '10px 14px' }}
      />
    ) : (
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', padding: '10px 14px', background: 'var(--s2)', borderRadius: 12 }}>
        {value || <span style={{ color: 'var(--t3)', fontWeight: 400 }}>Not provided</span>}
      </div>
    )}
  </div>
);

const UploadBox = ({ label, url, editing, onUpload }) => (
  <div style={{ display: 'grid', gap: 6 }}>
    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>{label}</span>
    <div style={{ 
      height: 80, border: '2px dashed var(--br)', borderRadius: 14, 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: url ? 'var(--s1)' : 'var(--s2)', overflow: 'hidden', position: 'relative'
    }}>
      {url ? (
        <>
          <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {editing && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', opacity: 0, transition: '0.2s' }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0}>
              <Icon n="camera" color="#fff" size={20} />
            </div>
          )}
        </>
      ) : (
        <Icon n="image" color="var(--t3)" size={24} />
      )}
      {editing && (
        <input 
          type="file" 
          onChange={onUpload} 
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
        />
      )}
    </div>
  </div>
);

export default BankDetails;
