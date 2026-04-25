import React, { useState } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import AddStaffModal from '../../components/shared/AddStaffModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';

const SuperAdminDashboard = () => {
  const router = useRouter();
  const { globalStaff = [], liveAttendance = [], globalLeaves = [], globalReimb = [], globalBranches = [], selectedBranch, setGlobalStaff, addActivity, fetchInitialData } = useAppContext();
  const t = THEME.superadmin;
  const [showAddStaff, setShowAddStaff] = useState(false);

  const liveAttendanceData = liveAttendance?.employees || [];
  
  const filteredLiveAttendance = selectedBranch === 'all' || !selectedBranch
     ? liveAttendanceData
     : liveAttendanceData.filter(s => {
         const branchName = globalBranches.find(b => String(b.id) === String(selectedBranch))?.name;
         return s.branch === branchName;
       });
 
   const latestAttendance = filteredLiveAttendance
     .filter(s => s.status === 'present' || s.status === 'pending')
     .sort((a, b) => {
       if (!a.punchInTime) return 1;
       if (!b.punchInTime) return -1;
       return new Date(b.punchInTime) - new Date(a.punchInTime);
     })
     .slice(0, 6);

  const selectedBranchId = String(selectedBranch);
  const branchName = selectedBranch === 'all'
    ? 'All Branches'
    : globalBranches.find(b => String(b.id) === selectedBranchId)?.name || 'All Branches';
  
  const branchStaff = selectedBranch === 'all' || !selectedBranch
    ? globalStaff
    : globalStaff.filter(s => {
        const branchValue = s.branch_id || s.branchId || (s.branch?.id) || s.branch;
        return String(branchValue) === selectedBranchId;
      });

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
        await fetchInitialData();
        addActivity('Super Admin', 'Super Admin', `added staff ${newStaff.name}`, `${newStaff.designation || newStaff.role || 'Employee'}`, 'staff', 'var(--pur)');
        return { success: true, email: newStaff.email, employee_id: newStaff.employee_id, password: newStaff.password };
      }
      const errorText = await response.text();
      return { success: false, message: errorText || 'Failed to add staff' };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  };

  const stats = [
    { l: 'Staff In', v: filteredLiveAttendance.filter(s => s.status === 'present' || s.status === 'pending').length, ic: 'users', c: 'var(--grn)', up: true, t: 'Present today' },
    { l: 'No Punch In', v: filteredLiveAttendance.filter(s => s.status === 'not_punched' || s.status === 'absent').length, ic: 'clock', c: 'var(--red)', up: false, t: 'Yet to mark' },
    { l: 'Pending Requests', v: globalLeaves.filter(l => l.status === 'pending').length + globalReimb.filter(r => r.status === 'pending').length, ic: 'clipboard', c: 'var(--ora)', up: true, t: 'Needs review' },
    { l: 'Total Staff', v: branchStaff.length, ic: 'building', c: 'var(--pur)', up: true, t: 'Active employees' }
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const liveDateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <SuperAdminLayout title="Dashboard">
      <div style={{ 
        padding: '10px 5px 20px', 
        width: '100%', 
        boxSizing: 'border-box', 
        borderLeft: '1px solid #eef2f6', 
        borderRight: '1px solid #eef2f6', 
        minHeight: '100vh'
      }}>
        <div className="ph" style={{ marginTop: 2, marginLeft: 0 }}>
          <div>
            <div className="pt" style={{ fontSize: 24, fontWeight: 800 }}>Overview</div>
            <div className="ps">{dateStr} · {branchName}</div>
          </div>
          <div className="pa">
            <button className="btn bs btn-sm" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon n="download" size={14} /> Export
            </button>
            <button className="btn btn-sm" style={{ background: t.acc, color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowAddStaff(true)}>
              <Icon n="plus" size={14} color="#fff" /> Add Staff
            </button>
          </div>
        </div>
        {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} branches={globalBranches} accentColor={t.acc} />}

        <div className="sg stats-grid" style={{ marginBottom: 25 }}>
          {stats.map(s => (
            <div key={s.l} className="sc" style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                <div className="si" style={{ background: `${s.c}12`, width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon n={s.ic} size={20} color={s.c} />
                </div>
              </div>
              <div className="sn" style={{ fontSize: 28, fontWeight: 900, color: 'var(--t1)', marginBottom: 4 }}>{s.v}</div>
              <div className="sl" style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>{s.l}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.up ? 'var(--grn)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{s.up ? '↑' : '↓'}</span>
                <span>{s.t}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-content-grid">
          <div className="cd live-attendance-card" style={{ padding: 0, borderRadius: 16, border: '1px solid var(--br)', overflow: 'hidden' }}>
            <div className="cd-h" style={{ padding: '18px 24px', borderBottom: '1px solid var(--br)', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="cd-t" style={{ fontSize: 14, fontWeight: 800 }}>Live Attendance · {liveDateStr}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--grn)', background: 'var(--grnDim)', padding: '2px 8px', borderRadius: 6 }}>{branchStaff.filter(s => s.ls === 'in' || s.ls === 'present').length} In</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', background: 'var(--rd)', padding: '2px 8px', borderRadius: 6 }}>{branchStaff.filter(s => s.ls !== 'in' && s.ls !== 'present').length} No Punch</span>
              </div>
            </div>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--s1)', borderBottom: '1px solid var(--br)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 10, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Staff</th>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 10, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Branch</th>
                    <th className="desktop-only" style={{ textAlign: 'left', padding: '12px 24px', fontSize: 10, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Punch</th>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 10, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {latestAttendance.map(s => {
                    return (
                      <tr 
                        key={s.id} 
                        style={{ borderBottom: '1px solid var(--s2)', cursor: 'pointer' }}
                        onClick={() => router.push(`/superadmin/employees/${s.id}`)}
                        className="hover-row"
                      >
                        <td style={{ padding: '12px 24px' }}>
                          <div className="av-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Av name={s.name} size={28} r={8} />
                            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--t1)' }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 24px' }}><span style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 600 }}>{s.branch || '—'}</span></td>
                        <td className="desktop-only" style={{ padding: '12px 24px' }}><span style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 700 }}>{s.punchInTime ? new Date(s.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span></td>
                        <td style={{ padding: '12px 24px' }}>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 6, color: s.status === 'present' || s.status === 'pending' ? 'var(--grn)' : 'var(--red)', background: s.status === 'present' || s.status === 'pending' ? 'var(--grnDim)' : 'var(--rd)' }}>
                            {s.status === 'present' || s.status === 'pending' ? 'In' : 'No Punch'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 24px', textAlign: 'center', borderTop: '1px solid var(--br)' }}>
              <button 
                className="btn bs btn-sm" 
                style={{ fontSize: 11, fontWeight: 800, color: t.acc }}
                onClick={() => router.push('/superadmin/employees')}
              >
                See All Employees
              </button>
            </div>
          </div>

          <div className="dashboard-right-col" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="quick-access-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {[
                { l: 'Pending', ic: 'clipboard', c: 'var(--t2)', path: '/superadmin/pending' },
                { l: 'Branches', ic: 'building', c: 'var(--t2)', path: '/superadmin/branches' },
                { l: 'Activity', ic: 'clock', c: 'var(--t2)', path: '/superadmin/activity' }
              ].map(a => (
                <div key={a.l} className="qa-card" onClick={() => router.push(a.path)} style={{ background: '#fff', border: '1px solid var(--br)', borderRadius: 12, padding: '15px 10px', textAlign: 'center', cursor: 'pointer' }}>
                  <Icon n={a.ic} size={18} color={a.c} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t1)' }}>{a.l}</div>
                </div>
              ))}
            </div>

            <div className="cd" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--br)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 15 }}>Weekly Trend</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, padding: '0 5px' }}>
                {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                  <div key={i} style={{ width: 25, height: `${h}%`, background: h > 70 ? 'var(--grn)' : 'var(--grnDim)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: 'var(--t3)' }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
