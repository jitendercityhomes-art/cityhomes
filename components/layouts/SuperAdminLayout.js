
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Icon from '../shared/Icon';
import Av from '../shared/Avatar';
import { THEME } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const SuperAdminLayout = ({ children, title }) => {
  const router = useRouter();
  const { 
    user, setUser, authLoading, globalBranches, selectedBranch, 
    setSelectedBranch, globalActivity, globalLeaves, globalReimb 
  } = useAppContext();
  const [sideOpen, setSideOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const t = THEME.superadmin;

  const notifications = globalActivity.slice(0, 10);
  
  // Dynamic counts
  const pendingCount = (globalLeaves?.filter(l => l.status === 'pending')?.length || 0) + 
                       (globalReimb?.filter(r => r.status === 'pending')?.length || 0);
  const notificationsCount = globalActivity?.length || 0;
  const unreadCount = notificationsCount > 0 ? 4 : 0; // Keeping 4 as mock if needed, or make it dynamic

  useEffect(() => {
    if (authLoading || hasRedirected) return;
    
    const role = user?.role;
    if (!user || role !== 'superadmin') {
      console.log('SuperAdminLayout: Unauthorized, redirecting to login. Role:', role);
      setHasRedirected(true);
      router.push('/');
    }
  }, [user, authLoading, router, hasRedirected]);

  if (authLoading || !user || user.role !== 'superadmin') return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loader" style={{ marginBottom: 10 }}>Loading...</div>
        <div style={{ fontSize: 12, color: '#666' }}>Verifying Super Admin session...</div>
      </div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    setUser(null);
    router.push('/');
  };

  const navItems = [
    { id: 'dashboard', ic: 'home', l: 'Dashboard', path: '/superadmin' },
    { id: 'attendance', ic: 'calendar', l: 'Attendance', path: '/superadmin/attendance' },
    { id: 'employees', ic: 'users', l: 'Employees', path: '/superadmin/employees' },
    { id: 'payroll', ic: 'dollar', l: 'Payroll', path: '/superadmin/payroll' },
    { id: 'branches', ic: 'building', l: 'Branches', path: '/superadmin/branches' },
    { id: 'departments', ic: 'doc', l: 'Departments', path: '/superadmin/departments' },
    { id: 'activity', ic: 'clock', l: 'Activity Log', path: '/superadmin/activity' },
    { id: 'notifications', ic: 'bell', l: 'Notifications', path: '/superadmin/notifications', count: notificationsCount },
    { id: 'pending', ic: 'clipboard', l: 'Pending', path: '/superadmin/pending', count: pendingCount },
    { id: 'reports', ic: 'chart', l: 'Reports', path: '/superadmin/reports' },
    { id: 'settings', ic: 'settings', l: 'Settings', path: '/superadmin/settings' },
  ];

  const quickAccess = [
    { id: 'crm', ic: 'monitor', l: 'CRM', count: 'Soon' },
  ];

  const selectedBranchId = String(selectedBranch);

  return (
    <div className="layout">
      {sideOpen && <div className="mob-overlay on" onClick={() => setSideOpen(false)} />}
      
      <aside className={`sb ${sideOpen ? 'open' : ''}`}>
        <div className="sb-logo" style={{ padding: '16px 24px', borderBottom: '1px solid var(--br)' }}>
          <div className="logo-m" style={{ background: t.logoGrad, boxShadow: t.logoShadow, width: 36, height: 36, borderRadius: 10 }}>
            <Icon n="users" size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-n" style={{ fontSize: 15, fontWeight: 800 }}>City Homes</div>
            <div className="logo-s" style={{ fontSize: 10, color: t.acc, fontWeight: 700 }}>Super Admin</div>
          </div>
        </div>

        <div className="nav" style={{ padding: '14px 12px' }}>
          <div className="nl" style={{ padding: '0 12px 10px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--t3)', letterSpacing: 0.5 }}>Main</div>
          {navItems.map(n => (
            <Link key={n.id} href={n.path} legacyBehavior>
              <div 
                className={`ni ${router.pathname === n.path ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 2,
                  background: router.pathname === n.path ? t.accDim : 'transparent',
                  color: router.pathname === n.path ? t.acc : 'var(--t2)',
                  fontWeight: router.pathname === n.path ? 700 : 500,
                  fontSize: 13
                }}
                onClick={() => setSideOpen(false)}
              >
                <Icon n={n.ic} size={16} color={router.pathname === n.path ? t.acc : 'var(--t2)'} />
                <span style={{ flex: 1 }}>{n.l}</span>
                {n.count && <span style={{ background: n.id === 'pending' ? 'var(--red)' : t.acc, color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>{n.count}</span>}
              </div>
            </Link>
          ))}

          <div className="nl" style={{ padding: '20px 12px 10px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--t3)', letterSpacing: 0.5 }}>Quick Access</div>
          {quickAccess.map(n => (
            <div key={n.id} className="ni" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'var(--t2)', fontSize: 13, fontWeight: 500 }}>
              <Icon n={n.ic} size={16} color="var(--t2)" />
              <span style={{ flex: 1 }}>{n.l}</span>
              <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>{n.count}</span>
            </div>
          ))}
        </div>

        <div className="sb-bot" style={{ padding: '15px', borderTop: '1px solid var(--br)', background: 'var(--s1)' }}>
          <div className="uc" style={{ display: 'flex', gap: 10, padding: '10px', background: 'var(--s2)', borderRadius: 12, border: '1px solid var(--br)', marginBottom: 10 }}>
            <div className="ua" style={{ background: t.logoGrad, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>SA</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="un" style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || 'Super Admin'}</div>
              <div className="ur" style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600 }}>{user?.company || 'City Homes'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: '1px solid var(--rd)', background: 'var(--rd)', color: 'var(--red)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Icon n="logout" size={14} color="var(--red)" />
            Logout
          </button>
        </div>
      </aside>

      <div className="tb">
        <div className="hamb" onClick={() => setSideOpen(!sideOpen)}>
          <span /><span /><span />
        </div>
        <div className="tb-t" style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{title || 'Dashboard'}</div>
        
        {/* Desktop Branch Selector */}
        <div className="branch-sel desktop-only" style={{ marginLeft: 8 }}>
          <button 
            className="branch-btn" 
            type="button" 
            onClick={() => setBranchOpen(open => !open)}
            style={{ 
              height: 35, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '0 14px', 
              borderRadius: 10,
              background: '#fff',
              border: '1px solid var(--br)'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--grn)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
              {selectedBranch === 'all' ? 'All Branches' : (globalBranches?.find(b => String(b.id) === selectedBranchId)?.name || 'All Branches')}
            </span>
            <Icon n="chevron_down" size={11} color="var(--t3)" />
          </button>
          {branchOpen && (
            <div className="branch-dropdown" style={{ width: 190, padding: '6px 0', right: 0, left: 'auto', marginTop: 6 }}>
              <div className={`branch-opt ${selectedBranch === 'all' ? 'sel' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px' }} onClick={() => { setSelectedBranch('all'); setBranchOpen(false); }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--grnDim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon n="building" size={14} color="var(--grn)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)' }}>All Branches</div>
                  <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>All Locations</div>
                </div>
                {selectedBranch === 'all' && <Icon n="check" size={12} color="var(--teal)" />}
              </div>
              {globalBranches?.map(branch => (
                <div key={branch.id} className={`branch-opt ${selectedBranchId === String(branch.id) ? 'sel' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px' }} onClick={() => { setSelectedBranch(String(branch.id)); setBranchOpen(false); }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${branch.color || 'var(--pur)'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon n="building" size={14} color={branch.color || 'var(--pur)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)' }}>{branch.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 100 }}>{branch.city || branch.address || 'Location'}</div>
                  </div>
                  {selectedBranchId === String(branch.id) && <Icon n="check" size={12} color="var(--teal)" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tb-r" style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div className="ib" style={{ position: 'relative' }} onClick={() => setNotifOpen(!notifOpen)}>
            <Icon n="bell" size={18} color="var(--t2)" />
            {unreadCount > 0 && (
              <div className="nd" style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--red)', border: '2px solid #fff', borderRadius: '50%' }} />
            )}
            {notifOpen && (
              <div className="branch-dropdown" style={{ width: 280, padding: '10px 0', right: 0, left: 'auto', marginTop: 10, maxHeight: 400, overflowY: 'auto' }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>Notifications</span>
                  <span style={{ fontSize: 10, color: t.acc, fontWeight: 700, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setNotifOpen(false); }}>Close</span>
                </div>
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={`${n.id || 'notif'}-${i}`} className="branch-opt" style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: i === notifications.length - 1 ? 'none' : '1px solid var(--s2)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color || t.acc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon n={n.type === 'punch' ? 'clock' : n.type === 'leave' ? 'leave' : 'info'} size={14} color={n.color || t.acc} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.who}</div>
                      <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.action}</div>
                      <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 4 }}>{n.when}</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--t3)', fontSize: 11 }}>No new notifications</div>
                )}
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--br)', textAlign: 'center' }}>
                  <Link href="/superadmin/activity" legacyBehavior>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.acc, cursor: 'pointer' }}>View All Activity</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Av name={user?.name || 'SA'} size={32} r={10} />
        </div>
      </div>

      <div className="main">
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;
