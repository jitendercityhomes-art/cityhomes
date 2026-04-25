
import React from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const SuperAdminNotifications = () => {
  const { empNotifs } = useAppContext();
  const t = THEME.superadmin;

  const allNotifs = Object.entries(empNotifs).flatMap(([name, notifs]) => notifs.map(n => ({ ...n, empName: name })));

  return (
    <SuperAdminLayout title="Notifications">
      <div className="ph">
        <div>
          <div className="pt">Notifications</div>
          <div className="ps">System-wide alerts and updates</div>
        </div>
      </div>

      {allNotifs.length === 0 ? (
        <div className="cd" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', marginLeft: 6, marginRight: 6 }}>
          <Icon n="bell" size={48} color="var(--br2)" style={{ marginBottom: 15 }}/>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No notifications found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginLeft: 6, marginRight: 6 }}>
          {allNotifs.sort((a, b) => b.id - a.id).map(n => (
            <div key={n.id} className="cd" style={{ padding: 15 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${n.color || t.acc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon n={n.type === 'salary' ? 'dollar' : 'bell'} size={16} color={n.color || t.acc}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{n.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{n.time}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 5 }}>{n.body}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: t.acc }}>Employee: {n.empName}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default SuperAdminNotifications;
