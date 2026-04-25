
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import AddStaffModal from '../../components/shared/AddStaffModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const HREmployees = () => {
  const router = useRouter();
  const { globalStaff, globalBranches, setGlobalStaff, addActivity } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const t = THEME.hr;

  const handleAdd = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const staff = await res.json();
        try {
          const employeesRes = await fetch(`${API_BASE}/employees`, { credentials: 'include' });
          if (employeesRes.ok) {
            const allStaff = await employeesRes.json();
            setGlobalStaff(allStaff);
          } else {
            setGlobalStaff(s => [...s, { ...staff, dept: staff.department?.name || '—', branch: staff.branch?.id || 'b1', role: staff.designation || staff.role }]);
          }
        } catch {
          setGlobalStaff(s => [...s, { ...staff, dept: staff.department?.name || '—', branch: staff.branch?.id || 'b1', role: staff.designation || staff.role }]);
        }
        addActivity('HR Manager', 'HR', `added staff ${staff.name}`, `${staff.role}`, 'staff', 'var(--pur)');
        return { success: true, email: staff.email };
      }
      return { success: false, message: 'Failed' };
    } catch (e) { return { success: false, message: 'Error' }; }
  };

  return (
    <HRLayout title="Staff Directory">
      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} onAdd={handleAdd} branches={globalBranches} accentColor={t.acc} />}
      
      <div className="ph">
        <div>
          <div className="pt">Employees</div>
          <div className="ps">{globalStaff.length} members in the team</div>
        </div>
        <div className="pa">
          <button className="btn btn-sm" style={{ background: t.acc, color: '#fff' }} onClick={() => setShowAdd(true)}>
            <Icon n="plus" size={13} color="#fff"/> Add Employee
          </button>
        </div>
      </div>

      <div className="srch" style={{ marginBottom: 15 }}>
        <Icon n="search" size={14} color="var(--t3)"/>
        <input placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="cd">
        <table>
          <thead>
            <tr><th>Staff Name</th><th>Designation</th><th>Department</th><th>Branch</th><th>Status</th></tr>
          </thead>
          <tbody>
            {globalStaff.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
              <tr
                key={s.id}
                onClick={() => router.push(`/hr/employees/${s.id}`)}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td>
                  <div className="av-row">
                    <Av name={s.name} size={26} r={7} />
                    <span style={{ fontWeight: 600, fontSize: 11 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 10, color: 'var(--t2)' }}>{s.role}</td>
                <td style={{ fontSize: 10, color: 'var(--t3)' }}>{s.dept}</td>
                <td style={{ fontSize: 10, color: 'var(--t3)' }}>{s.branch || 'Palava'}</td>
                <td><span className={`bg ${s.ls === 'in' ? 'bg-p' : 'bg-a'}`} style={{ fontSize: 9 }}>{s.ls === 'in' ? 'P' : 'A'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HRLayout>
  );
};

export default HREmployees;
