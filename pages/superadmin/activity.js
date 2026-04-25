
import React from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const SuperAdminActivity = () => {
  const { globalActivity } = useAppContext();
  const t = THEME.superadmin;

  return (
    <SuperAdminLayout title="Activity Log">
      <div className="ph">
        <div>
          <div className="pt">Activity Log</div>
          <div className="ps">Real-time system events</div>
        </div>
      </div>

      <div className="cd" style={{ padding: 0, marginLeft: 6, marginRight: 6 }}>
        <div className="cd-h" style={{ padding: '15px 20px', borderBottom: '1px solid var(--br)' }}>
          <span className="cd-t">Recent Activities</span>
        </div>
        <div style={{ padding: '10px 0' }}>
          {globalActivity.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', gap: 15, padding: '12px 20px', borderBottom: i === globalActivity.length - 1 ? 'none' : '1px solid var(--s2)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color || t.acc}15`, border: `1px solid ${a.color || t.acc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon n={a.type === 'punch' ? 'clock' : a.type === 'leave' ? 'leave' : a.type === 'reimb' ? 'receipt' : 'info'} size={16} color={a.color || t.acc}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{a.who} <span style={{ fontWeight: 400, color: 'var(--t3)', fontSize: 11 }}>({a.role})</span></div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>{a.when}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>{a.action}</div>
                {a.detail && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4, fontStyle: 'italic' }}>{a.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminActivity;
