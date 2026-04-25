
import React, { useState } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import AddBranchModal from '../../components/shared/AddBranchModal';
import AlertModal from '../../components/shared/AlertModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

import { useRouter } from 'next/router';

const SuperAdminBranches = () => {
  const router = useRouter();
  const { globalBranches, setGlobalBranches, addActivity, setSelectedBranch } = useAppContext();
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: null });
  const t = THEME.superadmin;

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  const handleAddBranch = async (data) => {
    try {
      const isEdit = !!editingBranch;
      const url = isEdit ? `${API_BASE}/branches/${editingBranch.id}` : `${API_BASE}/branches`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedBranch = await response.json();
        if (isEdit) {
          setGlobalBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
          addActivity('Super Admin', 'Super Admin', `updated branch ${updatedBranch.name}`, `${updatedBranch.address}`, 'branch', 'var(--teal)');
        } else {
          setGlobalBranches(b => [...b, updatedBranch]);
          addActivity('Super Admin', 'Super Admin', `added new branch ${updatedBranch.name}`, `${updatedBranch.address}`, 'branch', 'var(--teal)');
        }
        setEditingBranch(null);
        return { success: true };
      }
      return { success: false, message: `Failed to ${isEdit ? 'update' : 'add'} branch` };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  };

  const handleDeleteBranch = async (id, name) => {
    showAlert('confirm', 'Delete Branch', `Are you sure you want to delete branch "${name}"?`, async () => {
      closeAlert();
      try {
        const res = await fetch(`${API_BASE}/branches/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) {
          setGlobalBranches(prev => prev.filter(b => b.id !== id));
          addActivity('Super Admin', 'Super Admin', `deleted branch ${name}`, '', 'branch', 'var(--red)');
          showAlert('success', 'Deleted!', `Branch "${name}" has been deleted successfully.`);
        } else {
          const errorData = await res.json();
          showAlert('error', 'Action Failed', errorData.message || 'Failed to delete branch.');
        }
      } catch (err) {
        console.error(err);
        showAlert('error', 'Network Error', 'Something went wrong. Please try again.');
      }
    });
  };

  const handleSeeStaff = (branchId) => {
    setSelectedBranch(String(branchId));
    router.push('/superadmin/employees');
  };

  return (
    <SuperAdminLayout title="Branch Management">
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        accentColor={t.acc}
      />
      {(showAddBranch || editingBranch) && (
        <AddBranchModal 
          onClose={() => { setShowAddBranch(false); setEditingBranch(null); }} 
          onAdd={handleAddBranch} 
          accentColor={t.acc} 
          editData={editingBranch}
        />
      )}
      
      <div className="ph">
        <div>
          <div className="pt">Branches</div>
          <div className="ps">{globalBranches.length} office locations</div>
        </div>
        <div className="pa">
          <button className="btn btn-sm" style={{ background: t.acc, color: '#fff', padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700 }} onClick={() => setShowAddBranch(true)}>
            <Icon n="plus" size={13} color="#fff"/> Add Branch
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginLeft: 6, marginRight: 6 }}>
        {globalBranches.map(b => (
          <div key={b.id} className="cd" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${b.color || t.acc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon n="building" size={22} color={b.color || t.acc}/>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="ib" style={{ color: 'var(--t2)' }} onClick={() => setEditingBranch(b)}>
                  <Icon n="edit" size={14}/>
                </button>
                <button className="ib" style={{ color: 'var(--red)' }} onClick={() => handleDeleteBranch(b.id, b.name)}>
                  <Icon n="trash" size={14}/>
                </button>
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 2 }}>{b.name}</div>
            <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, marginBottom: 8 }}>{b.city || 'N/A'}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 16, minHeight: 40 }}>{b.address}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Icon n="shield" size={10} color="var(--teal)" />
                Radius: {b.radius || 200}m
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--br)' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>Lat: {b.lat || b.latitude || 'N/A'}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>Lng: {b.lng || b.longitude || 'N/A'}</div>
              </div>
              <button 
                className="btn bs btn-sm" 
                style={{ fontSize: 10, padding: '4px 12px', borderRadius: 6, fontWeight: 700 }}
                onClick={() => handleSeeStaff(b.id)}
              >
                See Staff
              </button>
            </div>
          </div>
        ))}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBranches;
