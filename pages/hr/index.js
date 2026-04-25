
import React from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import { THEME } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const HRDashboard = () => {
  const { globalStaff, globalLeaves } = useAppContext();
  const t = THEME.hr;

  const stats = [
    { l: 'Total Staff', v: globalStaff.length, c: t.acc, ic: 'users', t: 'Active' },
    { l: 'Present Today', v: globalStaff.filter(s => s.ls === 'in').length, c: 'var(--grn)', ic: 'check', t: 'Marked In' },
    { l: 'Leaves Pending', v: globalLeaves.filter(l => l.status === 'pending').length, c: 'var(--amb)', ic: 'clipboard', t: 'Awaiting' },
    { l: 'New Joinees', v: 0, c: 'var(--blu)', ic: 'plus', t: 'This month' }
  ];

  return (
    <HRLayout title="HR Dashboard">
      <div className="ph">
        <div>
          <div className="pt">HR Overview</div>
          <div className="ps">Saturday, 21 Mar 2026</div>
        </div>
      </div>

      <div className="sg">
        {stats.map(s => (
          <div key={s.l} className="sc">
            <div className="si" style={{ background: `${s.c}18` }}><Icon n={s.ic} size={18} color={s.c}/></div>
            <div className="sn" style={{ color: s.c }}>{s.v}</div>
            <div className="sl">{s.l}</div>
            <div className="st su">↑ {s.t}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="cd">
          <div className="cd-h">
            <span className="cd-t">Staff List</span>
            <button className="btn bs btn-sm">Manage</button>
          </div>
          <table>
            <thead>
              <tr><th>Employee</th><th>Dept</th><th>Status</th></tr>
            </thead>
            <tbody>
              {globalStaff.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="av-row">
                      <Av name={s.name} size={26} r={7} />
                      <span style={{ fontWeight: 500, fontSize: 11 }}>{s.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 11 }}>{s.dept}</span></td>
                  <td><span className={`bg ${s.ls === 'in' ? 'bg-p' : 'bg-a'}`} style={{ fontSize: 9 }}>{s.ls === 'in' ? 'Present' : 'Absent'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cd">
          <div className="cd-h">
            <span className="cd-t">Upcoming Birthdays</span>
          </div>
          <div style={{ padding: 15 }}>
            {[].map(b => (
              <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--br)' }}>
                <div className="av-row">
                  <Av name={b.name} size={24} r={6}/>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>{b.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default HRDashboard;
