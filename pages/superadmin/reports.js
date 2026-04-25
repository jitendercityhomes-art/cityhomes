
import React from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';

const SuperAdminReports = () => {
  const t = THEME.superadmin;

  return (
    <SuperAdminLayout title="Reports">
      <div className="ph">
        <div>
          <div className="pt">System Reports</div>
          <div className="ps">Download and analyze organizational data</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, marginLeft: 6, marginRight: 6 }}>
        {[
          { ic: 'chart', l: 'Attendance Report', s: 'Monthly summary' },
          { ic: 'dollar', l: 'Payroll Summary', s: 'Salary disbursements' },
          { ic: 'users', l: 'Employee Directory', s: 'Complete staff list' },
          { ic: 'clipboard', l: 'Leave Analysis', s: 'Patterns and balances' },
          { ic: 'receipt', l: 'Expense Claims', s: 'Reimbursement history' },
          { ic: 'clock', l: 'Late Comings', s: 'Punctuality records' }
        ].map(r => (
          <div key={r.l} className="cd" style={{ padding: 20, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${t.acc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon n={r.ic} size={20} color={t.acc}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{r.l}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 15 }}>{r.s}</div>
            <button className="btn bs btn-sm btn-full"><Icon n="download" size={13}/> Generate Report</button>
          </div>
        ))}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminReports;
