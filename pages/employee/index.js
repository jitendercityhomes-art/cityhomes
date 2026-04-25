
import React from 'react';
import Link from 'next/link';
import EmployeeLayout from '../../components/layouts/EmployeeLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const EmployeeDashboard = () => {
  const { user } = useAppContext();
  const t = THEME.employee;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <EmployeeLayout title="My Dashboard">
      <div className="ph">
        <div>
          <div className="pt">Hi, {user?.name?.split(' ')[0] || 'Employee'}</div>
          <div className="ps">{dateStr}</div>
        </div>
      </div>

      <div className="cd" style={{ marginBottom: 15, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--br)', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <div style={{ background: '#f8fafc', padding: '20px 0', textAlign: 'center', borderBottom: '1px solid var(--br)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: t.logoGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 auto 10px', boxShadow: t.logoShadow }}>
            {user?.name?.split(' ').map(n => n[0]).join('') || '??'}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 700 }}>{user?.employee_id || `EMP${user?.id?.toString().padStart(3, '0') || '000'}`}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 600 }}>📱 {user?.phone || user?.mobile || '—'}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 500 }}>Designation: {user?.designation || user?.role || '—'}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>Department: {user?.department?.name || user?.dept || '—'}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '5px 0' }}>
          <div className="info-cell" style={{ padding: '10px 20px', borderRight: '1px solid var(--br)', borderBottom: '1px solid var(--br)' }}>
            <div className="info-lbl" style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Employee ID</div>
            <div className="info-val" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{user?.employee_id || `EMP${user?.id?.toString().padStart(3, '0') || '000'}`}</div>
          </div>
          <div className="info-cell" style={{ padding: '10px 20px', borderBottom: '1px solid var(--br)' }}>
            <div className="info-lbl" style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mobile Number</div>
            <div className="info-val" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{user?.phone || user?.mobile || '—'}</div>
          </div>
          <div className="info-cell" style={{ padding: '10px 20px', borderRight: '1px solid var(--br)' }}>
            <div className="info-lbl" style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Designation</div>
            <div className="info-val" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{user?.designation || user?.role || '—'}</div>
          </div>
          <div className="info-cell" style={{ padding: '10px 20px' }}>
            <div className="info-lbl" style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</div>
            <div className="info-val" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{user?.department?.name || user?.dept || '—'}</div>
          </div>
        </div>
      </div>

      <div className="qa-grid">
        {[
          { ic: 'calendar', l: 'Attendance', p: '/employee/attendance', color: '#10b981', bg: '#ecfdf5' },
          { ic: 'dollar', l: 'My Salary', p: '/employee/salary', color: '#8b5cf6', bg: '#f5f3ff' },
          { ic: 'leave', l: 'Apply Leave', p: '/employee/leaves', color: '#f59e0b', bg: '#fffbeb' },
          { ic: 'receipt', l: 'Expenses', p: '/employee/reimbursement', color: '#3b82f6', bg: '#eff6ff' },
          { ic: 'bell', l: 'Notifications', p: '/employee/notifications', color: '#ef4444', bg: '#fef2f2' },
          { ic: 'user', l: 'My Profile', p: '/employee/profile', color: '#0ea5e9', bg: '#f0f9ff' },
          { ic: 'doc', l: 'Documents', p: '/employee/documents', color: '#6366f1', bg: '#eef2ff' }
        ].map(a => (
          <Link key={a.l} href={a.p} legacyBehavior>
            <div className="qa">
              <div className="qa-ico" style={{ background: a.bg }}>
                <Icon n={a.ic} size={15} color={a.color}/>
              </div>
              <div className="qa-lbl">{a.l}</div>
            </div>
          </Link>
        ))}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
