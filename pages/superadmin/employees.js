
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import AddStaffModal from '../../components/shared/AddStaffModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const SuperAdminEmployees = () => {
  const router = useRouter();
  const { globalStaff, globalBranches, selectedBranch, setGlobalStaff, addActivity } = useAppContext();
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [search, setSearch] = useState('');
  const t = THEME.superadmin;
  const selectedBranchId = String(selectedBranch);
  const branchName = selectedBranch === 'all'
    ? 'All Branches'
    : globalBranches.find(b => String(b.id) === selectedBranchId)?.name || 'All Branches';
  const branchStaff = selectedBranch === 'all'
    ? globalStaff
    : globalStaff.filter(s => {
        const branchValue = s.branch?.id ?? s.branch_id ?? s.branch;
        return String(branchValue) === selectedBranchId;
      });

  const getBranchLabel = (branchValue) => {
    if (!branchValue) return 'Main Branch';
    const bId = typeof branchValue === 'object' ? branchValue.id : branchValue;
    const branchMatch = globalBranches.find(b => b.id === bId || b.name === bId);
    return branchMatch?.name || (typeof bId === 'object' ? 'Unknown' : bId);
  };

  const getBranchColor = (branchValue) => {
    if (!branchValue) return 'var(--t2)';
    const bId = typeof branchValue === 'object' ? branchValue.id : branchValue;
    const branchMatch = globalBranches.find(b => b.id === bId || b.name === bId);
    return branchMatch?.color || 'var(--t2)';
  };

  const handleAddStaff = async (data) => {
    try {
      const response = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newStaff = await response.json();
        try {
          const employeesRes = await fetch(`${API_BASE}/employees`, { credentials: 'include' });
          if (employeesRes.ok) {
            const allStaff = await employeesRes.json();
            setGlobalStaff(allStaff);
          } else {
            const branchValue = newStaff.branch?.id || newStaff.branch_id || newStaff.branch || 'b1';
            const deptValue = newStaff.department?.name || newStaff.department || '—';
            setGlobalStaff(s => [...s, { ...newStaff, dept: deptValue, branch: branchValue, systemRole: newStaff.systemRole || newStaff.role }]);
          }
        } catch {
          const branchValue = newStaff.branch?.id || newStaff.branch_id || newStaff.branch || 'b1';
          const deptValue = newStaff.department?.name || newStaff.department || '—';
          setGlobalStaff(s => [...s, { ...newStaff, dept: deptValue, branch: branchValue, systemRole: newStaff.systemRole || newStaff.role }]);
        }
        addActivity('Super Admin', 'Super Admin', `added staff ${newStaff.name}`, `${newStaff.designation || newStaff.role}`, 'staff', 'var(--pur)');
        return { success: true, email: newStaff.email, employee_id: newStaff.employee_id, password: newStaff.password };
      }
      return { success: false, message: 'Failed to add staff' };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  };

  const filtered = branchStaff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <SuperAdminLayout title="Employee Management">
      {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} branches={globalBranches} accentColor={t.acc} />}
      
      <div className="ph">
        <div>
          <div className="pt">Employees</div>
          <div className="ps">{branchStaff.length} staff · {branchName}</div>
        </div>
        <div className="pa">
          <button className="btn btn-sm" style={{ background: t.acc, color: '#fff', padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700 }} onClick={() => setShowAddStaff(true)}>
            <Icon n="plus" size={13} color="#fff"/> Add Staff
          </button>
        </div>
      </div>

      <div className="srch" style={{ marginBottom: 15 }}>
        <Icon n="search" size={14} color="var(--t3)"/>
        <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="cd">
        <table>
          <thead>
            <tr><th>Employee</th><th>Designation</th><th>Branch</th><th>Status</th><th>System Role</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const status = s.status || (s.ls === 'in' ? 'present' : 'absent');
              const designation = s.perm || s.designation || (s.role === 'Staff' ? 'Staff' : s.role) || 'Staff';
              
              // Map role to correct System Role labels
              const getSystemRole = (emp) => {
                const r = String(emp.systemRole || emp.role || '').toLowerCase();
                if (r.includes('super') || r === 'admin') return 'Super Admin';
                if (r.includes('hr')) return 'HR';
                return 'Employee';
              };

              return (
                <tr key={s.id} onClick={() => router.push(`/superadmin/employees/${s.id}`)} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td>
                    <div className="av-row">
                      <Av name={s.name} size={28} r={8} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 11 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--t2)' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 10, color: 'var(--t2)' }}>{designation}</td>
                  <td style={{ fontSize: 10 }}>
                    <span style={{
                      background: `${getBranchColor(s.branch)}15`,
                      color: getBranchColor(s.branch),
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 9,
                      fontWeight: 700
                    }}>
                      {getBranchLabel(s.branch)}
                    </span>
                  </td>
                  <td>
                    <span className={`bg ${status === 'present' ? 'bg-p' : 'bg-a'}`} style={{ fontSize: 9 }}>
                      {status === 'present' ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--t2)' }}>{getSystemRole(s)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminEmployees;
