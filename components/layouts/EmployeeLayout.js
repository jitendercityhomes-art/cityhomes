
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Icon from '../shared/Icon';
import Av from '../shared/Avatar';
import AttendanceModal from '../shared/AttendanceModal';
import { THEME, DEFAULT_GEO } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const EmployeeLayout = ({ children, title }) => {
  const router = useRouter();
  const { user, setUser, authLoading, geoSettings, addActivity, globalBranches, API_BASE } = useAppContext();
  const [sideOpen, setSideOpen] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);
  const [punchStatus, setPunchStatus] = useState('out'); // 'in' means currently punched in, 'out' means not in
  const [hasCompletedDay, setHasCompletedDay] = useState(false); // true if both punch in and out are done
  const t = THEME.employee;

  // Fetch current attendance status
  const fetchStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/attendance/today?_t=${Date.now()}`, { credentials: 'include' });
      if (res.ok) {
        const status = await res.json();
        console.log('ATTENDANCE_DEBUG:', status);
        if (status.hasPunchedIn && status.hasPunchedOut) {
          setHasCompletedDay(true);
          setPunchStatus('out');
        } else if (status.hasPunchedIn) {
          setPunchStatus('in');
          setHasCompletedDay(false);
        } else {
          setPunchStatus('out');
          setHasCompletedDay(false);
        }
      }
    } catch (e) {
      console.error('Error fetching today status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user?.id, API_BASE]);

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
    if (!authLoading && (!user || user.role !== 'employee')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'employee') return (
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
    { id: 'home', ic: 'home', l: 'My Dashboard', path: '/employee' },
    { id: 'attendance', ic: 'calendar', l: 'My Attendance', path: '/employee/attendance' },
    { id: 'salary', ic: 'dollar', l: 'My Salary', path: '/employee/salary' },
    { id: 'leaves', ic: 'leave', l: 'Leave Requests', path: '/employee/leaves' },
    { id: 'reimburse', ic: 'receipt', l: 'Reimbursement', path: '/employee/reimbursement' },
    { id: 'notif', ic: 'bell', l: 'Notifications', path: '/employee/notifications' },
    { id: 'profile', ic: 'user', l: 'My Profile', path: '/employee/profile' },
    { id: 'docs', ic: 'doc', l: 'Documents', path: '/employee/documents' },
  ];

  return (
    <div className="layout">
      {showAttModal && (
        <AttendanceModal 
          onClose={() => setShowAttModal(false)} 
          userName={user?.name || 'User'}
          geoSettings={effectiveGeo}
          currentStatus={punchStatus}
          branchId={user?.branch_id}
          onSuccess={(type, time, addr) => {
            fetchStatus(); // Re-fetch status from backend to be sure
            addActivity(user.name, 'Employee', `marked ${type === 'in' ? 'Punch In' : 'Punch Out'}`, `${time} \u00b7 ${addr}`, 'punch', type === 'in' ? 'var(--grn)' : 'var(--red)');
          }}
        />
      )}
      
      {sideOpen && <div className="mob-overlay on" onClick={() => setSideOpen(false)} />}
      
      <aside className="sb" style={sideOpen ? { transform: 'translateX(0)' } : {}}>
        <div className="sb-logo">
          <div className="logo-m" style={{ background: t.logoGrad, boxShadow: t.logoShadow }}>
            <Icon n="user" size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-n">City Homes</div>
            <div className="logo-s">
              <span className="role-tag" style={{ background: t.tagBg, color: t.tagColor }}>Employee</span>
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
            <div className="ua" style={{ background: t.logoGrad }}>EMP</div>
            <div>
              <div className="un">{user?.name?.split(' ')[0] || 'User'}</div>
              <div className="ur">{user.role}</div>
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
        <div className="tb-t">{title || 'My Dashboard'}</div>
        <div className="tb-r">
          <button 
            className="btn attendance-btn" 
            style={{ 
              background: hasCompletedDay ? 'var(--s2)' : t.acc, 
              color: hasCompletedDay ? 'var(--t3)' : '#fff', 
              fontSize: 12, 
              fontWeight: 700, 
              padding: '8px 14px',
              opacity: hasCompletedDay ? 0.7 : 1,
              cursor: hasCompletedDay ? 'not-allowed' : 'pointer'
            }}
            onClick={() => !hasCompletedDay && setShowAttModal(true)}
            disabled={hasCompletedDay}
          >
            <Icon n="camera" size={14} color={hasCompletedDay ? 'var(--t3)' : '#fff'} /> 
            {hasCompletedDay ? 'Attendance Done' : 'Mark Attendance'}
          </button>
          <div className="ib" onClick={() => router.push('/employee/notifications')}>
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

export default EmployeeLayout;
