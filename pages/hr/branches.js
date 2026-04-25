import React, { useState } from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import AddBranchModal from '../../components/shared/AddBranchModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const HRBranches = () => {
  const { globalBranches, setGlobalBranches, addActivity } = useAppContext();
  const [showAddBranch, setShowAddBranch] = useState(false);
  const t = THEME.hr;

  const handleAddBranch = async (data) => {
    try {
      const response = await fetch(`${API_BASE}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newBranch = await response.json();
        setGlobalBranches(b => [...b, newBranch]);
        addActivity('HR Manager', 'HR', `added new branch ${newBranch.name}`, `${newBranch.address}`, 'branch', 'var(--teal)');
        return { success: true };
      }
      return { success: false, message: 'Failed to add branch' };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  };

  return (
    <HRLayout title="Branch Management">
      {showAddBranch && <AddBranchModal onClose={() => setShowAddBranch(false)} onAdd={handleAddBranch} accentColor={t.acc} />}
      <div className="ph">
        <div>
          <div className="pt">Branches</div>
          <div className="ps">{globalBranches.length} office locations</div>
        </div>
        <div className="pa">
          <button className="btn btn-sm" style={{ background: t.acc, color: '#fff' }} onClick={() => setShowAddBranch(true)}>
            <Icon n="plus" size={13} color="#fff" /> Add Branch
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
        {globalBranches.map(b => (
          <div key={b.id} className="cd" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${b.color || t.acc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon n="building" size={20} color={b.color || t.acc} />
              </div>
              <button className="ib"><Icon n="edit" size={14} /></button>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>{b.name}</div>
            <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 12 }}>{b.address}</div>
            <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: '1px solid var(--br)' }}>
              <div style={{ fontSize: 10, color: 'var(--t3)' }}>Lat: {b.latitude || 'N/A'}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)' }}>Lng: {b.longitude || 'N/A'}</div>
            </div>
          </div>
        ))}
      </div>
    </HRLayout>
  );
};

export default HRBranches;
