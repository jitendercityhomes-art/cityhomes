
import React, { useState } from 'react';
import Icon from '../shared/Icon';
import Av from '../shared/Avatar';
import { calcSalary } from '../../lib/salary';
import { DEFAULT_SALARY_SETTINGS } from '../../lib/constants';

const EmpDetail = ({ emp, onBack, accentColor, userRole, salaryData, salarySettings, globalReimb, yearlyHolidays, setSalaryData, setGlobalActivity }) => {
  const [subTab, setSubTab] = useState('personal');
  const [editingSal, setEditingSal] = useState(false);
  const t = accentColor || 'var(--teal)';

  const sd = (salaryData || {})[emp.id] || { basic: 0, presentDays: 0, month: 3, year: 2026 };
  const reimbAmt = (globalReimb || []).filter(r => r.name === emp.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
  const deptWeekOffs = emp.department?.week_off_days || [];
  const sal = calcSalary(sd, reimbAmt, salarySettings || DEFAULT_SALARY_SETTINGS, deptWeekOffs);

  const getStatus = dayNum => {
    // Basic status logic for the simple calendar in EmpDetail
    // In a real scenario, this should use fetched attendance data
    return 'f';
  };

  return (
    <div className="emp-det">
      <div className="ph" style={{ marginBottom: 15 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="ib" onClick={onBack}><Icon n="chevron_right" size={16} color="var(--t2)" style={{ transform: 'rotate(180deg)' }}/></button>
          <div>
            <div className="pt">{emp.name}</div>
            <div className="ps">{emp.designation || emp.role} \u00b7 {emp.department?.name || emp.dept}</div>
          </div>
        </div>
        {userRole !== 'employee' && (
          <div className="pa">
            <button className="btn bs btn-sm"><Icon n="edit" size={13}/> Edit Profile</button>
          </div>
        )}
      </div>

      <div className="cd" style={{ marginBottom: 15 }}>
        <div style={{ display: 'flex', gap: 15, padding: 20, borderBottom: '1px solid var(--br)' }}>
          <Av name={emp.name} size={64} r={16} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{emp.email} \u00b7 {emp.phone}</div>
              </div>
              <span className={`bg ${emp.status === 'present' ? 'bg-p' : 'bg-a'}`} style={{ fontSize: 10 }}>
                {emp.status === 'present' ? 'Currently In' : 'Currently Out'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <div style={{ background: 'var(--s2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>{emp.employee_id || `EMP${emp.id?.toString().padStart(3, '0') || '000'}`}</div>
              <div style={{ background: 'var(--s2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>{emp.branch_name || (typeof emp.branch === 'object' ? emp.branch?.name : emp.branch) || 'Main Branch'}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', padding: '0 10px' }}>
          {[
            { id: 'personal', l: 'Personal', ic: 'user' },
            { id: 'attendance', l: 'Attendance', ic: 'calendar' },
            { id: 'salary', l: 'Salary', ic: 'dollar' },
            { id: 'docs', l: 'Documents', ic: 'doc' }
          ].map(tab => (
            <div 
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              style={{
                padding: '12px 15px',
                fontSize: 12,
                fontWeight: 600,
                color: subTab === tab.id ? t : 'var(--t2)',
                cursor: 'pointer',
                borderBottom: `2px solid ${subTab === tab.id ? t : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <Icon n={tab.ic} size={14} color={subTab === tab.id ? t : 'var(--t2)'}/>
              {tab.l}
            </div>
          ))}
        </div>
      </div>

      {subTab === 'personal' && (
        <div className="cd" style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px 40px' }}>
            {[
              ['Gender', emp.gender || 'Male'],
              ['Date of Birth', emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString('en-IN') : emp.dob || 'Not set'],
              ['Marital Status', emp.marital || emp.marital_status || 'Single'],
              ['Blood Group', emp.blood_group || emp.blood || 'Not set'],
              ['Emergency Contact', emp.emergency_contact_name || emp.emName || 'Not set'],
              ['Emergency Phone', emp.emergency_contact_phone || emp.emPhone || 'Not set'],
              ['Address', emp.address || emp.loc || 'Not set'],
              ['Joining Date', emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-IN') : emp.dateOfJoining || emp.joiningDate || emp.doj || 'Not set']
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'attendance' && (
        <div className="cd" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>March 2026 Attendance</div>
            <button className="btn bs btn-sm"><Icon n="download" size={13}/> Export</button>
          </div>
          <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
            {Array.from({ length: 31 }, (_, i) => {
              const d = i + 1;
              const s = getStatus(d);
              return (
                <div key={d} style={{ 
                  aspectRatio: '1', 
                  borderRadius: 8, 
                  background: s === 'p' ? 'var(--gd)' : s === 'f' ? 'var(--s2)' : 'var(--rd)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: s === 'p' ? 'var(--grn)' : s === 'f' ? 'var(--t3)' : 'var(--red)',
                  border: '1px solid var(--br)'
                }}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'salary' && (
        <div className="cd" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Salary Structure</div>
            {userRole !== 'employee' && (
              <button className="btn bs btn-sm" onClick={() => setEditingSal(!editingSal)}>
                <Icon n="edit" size={13}/> {editingSal ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--s2)', borderRadius: 10, padding: 15 }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 10 }}>EARNINGS</div>
              {[
                ['Basic Salary', sal.earnedBasic],
                ['HRA', sd.hra || 0],
                ['DA', sd.da || 0],
                ['Bonus', sd.bonus || 0],
                ['Reimbursement', reimbAmt]
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--t2)' }}>{l}</span>
                  <span style={{ fontWeight: 700 }}>\u20b9{v.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--s2)', borderRadius: 10, padding: 15 }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, marginBottom: 10 }}>DEDUCTIONS</div>
              {[
                ['LOP Deduction', sal.lopAmt],
                ['Professional Tax', 200]
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--t2)' }}>{l}</span>
                  <span style={{ fontWeight: 700, color: 'var(--red)' }}>-\u20b9{v.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, paddingTop: 10, borderTop: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>Net Payable</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--grn)' }}>\u20b9{sal.payable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'docs' && (
        <div className="cd" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Employee Documents</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[].map(doc => (
              <div key={doc.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--s1)', border: '1px solid var(--br)', borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon n="doc" size={18} color="var(--t2)"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{doc.l}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>{doc.s}</div>
                </div>
                <button className="ib"><Icon n="download" size={14}/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpDetail;
