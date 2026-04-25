
import React, { useState } from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';

const HRSettings = () => {
  const t = THEME.hr;
  const [sub, setSub] = useState('holiday');

  return (
    <HRLayout title="HR Settings">
      <div className="ph">
        <div>
          <div className="pt">Settings</div>
          <div className="ps">Manage policies and rules</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        <div className="cd" style={{ height: 'fit-content' }}>
          {[
            { id: 'holiday', ic: 'gift', l: 'Holidays' },
            { id: 'att', ic: 'calendar', l: 'Attendance Rules' },
            { id: 'leave', ic: 'leave', l: 'Leave Policy' }
          ].map(s => (
            <div 
              key={s.id} 
              className="sr" 
              onClick={() => setSub(s.id)}
              style={{ background: sub === s.id ? t.accDim : 'transparent', borderLeft: `3px solid ${sub === s.id ? t.acc : 'transparent'}` }}
            >
              <div className="sic"><Icon n={s.ic} size={15} color={sub === s.id ? t.acc : 'var(--t2)'}/></div>
              <span className="slb" style={{ color: sub === s.id ? t.acc : 'var(--t1)' }}>{s.l}</span>
            </div>
          ))}
        </div>

        <div className="cd" style={{ padding: 25 }}>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>
            <Icon n="settings" size={48} style={{ marginBottom: 15 }}/>
            <div>Configuration for <b>{sub}</b> coming soon.</div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default HRSettings;
