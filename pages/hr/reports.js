
import React from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';

const HRReports = () => {
  const t = THEME.hr;

  return (
    <HRLayout title="Reports">
      <div className="ph">
        <div>
          <div className="pt">Reports</div>
          <div className="ps">Generate and download HR documents</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
        {[
          { ic: 'chart', l: 'Attendance Report' },
          { ic: 'dollar', l: 'Salary Report' },
          { ic: 'clipboard', l: 'Leave Report' },
          { ic: 'users', l: 'Staff Directory' }
        ].map(r => (
          <div key={r.l} className="cd" style={{ padding: 20, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${t.acc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon n={r.ic} size={20} color={t.acc}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{r.l}</div>
            <button className="btn bs btn-sm" style={{ marginTop: 15, width: '100%' }}>Download</button>
          </div>
        ))}
      </div>
    </HRLayout>
  );
};

export default HRReports;
