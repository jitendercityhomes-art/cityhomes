
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import { API_BASE } from '../lib/constants';
import { normalizeUserRole } from '../lib/auth';
import Icon from '../components/shared/Icon';

const LoginPage = () => {
  const router = useRouter();
  const { user, setUser, authLoading } = useAppContext();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  React.useEffect(() => {
    if (!authLoading && user) {
      const role = normalizeUserRole(user.role);
      console.log('LoginPage: User found, redirecting based on role:', role);
      if (role === 'superadmin') router.push('/superadmin');
      else if (role === 'hr') router.push('/hr');
      else router.push('/employee');
    }
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#00A884' }}>Loading session...</div>
    </div>
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    console.log('LoginPage: Attempting login for:', email);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password: pass }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        const token = data.access_token || data.token;
        const role = normalizeUserRole(userData.role);
        
        const userWithRole = { ...userData, role, token };
        localStorage.setItem('userAuth', JSON.stringify(userWithRole));
        setUser(userWithRole);
        
        console.log('LoginPage: Login successful, navigating to dashboard...');
        if (role === 'superadmin') router.push('/superadmin');
        else if (role === 'hr') router.push('/hr');
        else router.push('/employee');
      } else {
        const errorData = await response.json();
        setErr(errorData.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('LoginPage: Unable to reach backend:', error);
      setErr('Unable to connect to backend. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 35 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #00A884, #007A5E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', boxShadow: '0 4px 12px rgba(0,168,132,0.2)' }}>
            <Icon n="users" size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 5 }}>City Homes</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>HRMS Management System</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Email Address</label>
            <input 
              type="email" 
              className="f-in" 
              style={{ height: 48, fontSize: 15 }} 
              placeholder="name@cityhomes.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 25 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Password</label>
            <input 
              type="password" 
              className="f-in" 
              style={{ height: 48, fontSize: 15 }} 
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required
            />
          </div>

          {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 15px', borderRadius: 10, fontSize: 13, marginBottom: 20, border: '1px solid #fee2e2' }}>{err}</div>}

          <button 
            type="submit" 
            className="btn btn-full" 
            style={{ height: 48, background: '#00A884', color: '#fff', fontSize: 16, fontWeight: 700, borderRadius: 12 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 30, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
          v-7.00 © 2026 CityHomes Property Services
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
