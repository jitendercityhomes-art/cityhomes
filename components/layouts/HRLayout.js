
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Icon from '../shared/Icon';
import Av from '../shared/Avatar';
import AttendanceModal from '../shared/AttendanceModal';
import { THEME, DEFAULT_GEO } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const HRLayout = ({ children, title }) => {
  const router = useRouter();
  const { user, setUser, authLoading, geoSettings, addActivity, globalBranches } = useAppContext();
  const [sideOpen, setSideOpen] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);
  const [punchStatus, setPunchStatus] = useState('out');
  const t = THEME.hr;

  // Get effective geo settings based on user's assigned branch
  const userBranchId = user?.branch_id || user?.branchId || (user?.branch?.id) || (typeof user?.branch === 'string' ? user.branch : null);
  const userBranch = globalBranches.find(b => String(b.id) === String(userBranchId) || b.name === userBranchId);

  const effectiveGeo = userBranch ? {
    lat: parseFloat(userBranch.lat || userBranch.latitude || DEFAULT_GEO.lat),
    lng: parseFloat(userBranch.lng || userBranch.longitude || DEFAULT_GEO.lng),
    radius: parseInt(userBranch.radius) || 200,
    address: userBranch.name || userBranch.address || 'Site'
  } : geoSettings;

  const effectiveBranchId = userBranch?.id || userBranchId || 1;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'hr')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'hr') return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader">Loading...</div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    setUser(null);
    router.push('/');
  };

  const navItems = [
    { id: 'home', ic: 'home', l: 'Dashboard', path: '/hr' },
    { id: 'employees', ic: 'users', l: 'Employees', path: '/hr/employees' },
    { id: 'attendance', ic: 'calendar', l: 'My Attendance', path: '/hr/attendance' },
    { id: 'branches', ic: 'building', l: 'Branches', path: '/hr/branches' },
    { id: 'departments', ic: 'doc', l: 'Departments', path: '/hr/departments' },
    { id: 'pending', ic: 'clipboard', l: 'Leave Requests', path: '/hr/pending' },
    { id: 'payroll', ic: 'dollar', l: 'Payroll', path: '/hr/payroll' },
    { id: 'reports', ic: 'chart', l: 'Reports', path: '/hr/reports' },
    { id: 'settings', ic: 'settings', l: 'Settings', path: '/hr/settings' },
  ];

  return (
    <div className="layout">
      {showAttModal && (
        <AttendanceModal 
          onClose={() => setShowAttModal(false)}
          userName={user.name}
          geoSettings={effectiveGeo}
          currentStatus={punchStatus}
          branchId={effectiveBranchId}
          onSuccess={(type, time, addr) => {
            setPunchStatus(type);
            addActivity(user.name, 'HR Manager', `marked ${type === 'in' ? 'Punch In' : 'Punch Out'}`, `${time} \u00b7 ${addr}`, 'punch', type === 'in' ? 'var(--grn)' : 'var(--red)');
          }}
        />
      )}
      
      {sideOpen && <div className="mob-overlay on" onClick={() => setSideOpen(false)} />}
      
      <aside className="sb" style={sideOpen ? { transform: 'translateX(0)' } : {}}>
        <div className="sb-logo">
          <div className="logo-m" style={{ background: t.logoGrad, boxShadow: t.logoShadow }}>
            <Icon n="users" size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-n">City Homes</div>
            <div className="logo-s">
              <span className="role-tag" style={{ background: t.tagBg, color: t.tagColor }}>HR Panel</span>
            </div>
          </div>
        </div>

        <div className="nav">
          <div className="nl">Main</div>
          {navItems.map(n => (
            <Link key={n.id} href={n.path} legacyBehavior>
              <div 
                className={`ni ${router.pathname === n.path ? 'active' : ''}`}
                style={router.pathname === n.path ? { background: t.accDim, color: t.acc } : {}}
                onClick={() => setSideOpen(false)}
              >
                <Icon n={n.ic} size={15} color={router.pathname === n.path ? t.acc : 'var(--t2)'} />
                <span>{n.l}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="sb-bot">
          <div className="uc">
            <div className="ua" style={{ background: t.logoGrad }}>HR</div>
            <div>
              <div className="un">{user.name}</div>
              <div className="ur">{user.company}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <Icon n="logout" size={14} color="var(--red)" />
            Logout
          </button>
        </div>
      </aside>

      <div className="tb">
        <div className="hamb" onClick={() => setSideOpen(!sideOpen)}>
          <span /><span /><span />
        </div>
        <div className="tb-t">{title || 'HR Dashboard'}</div>
        <div className="tb-s">
          <Icon n="search" size={13} color="var(--t3)" />
          <input placeholder="Search..." />
        </div>
        <div className="tb-r">
          <button 
            className="btn" 
            style={{ background: t.acc, color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px', marginRight: 10 }}
            onClick={() => setShowAttModal(true)}
          >
            <Icon n="clock" size={14} color="#fff" /> Mark Attendance
          </button>
          <div className="ib">
            <Icon n="bell" size={16} color="var(--t2)" />
            <div className="nd" />
          </div>
          <Av name={user.name} size={30} r={8} />
        </div>
      </div>

      <div className="main">
        {children}
      </div>
    </div>
  );
};

export default HRLayout;
