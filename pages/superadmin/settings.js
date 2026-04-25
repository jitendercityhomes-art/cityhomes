import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import { THEME, MONTH_DAYS_MAP, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

const normalizeHolidayKey = (date) => {
  if (!date || typeof date !== 'string') return '';
  const normalized = date.trim();
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return normalized;
  const [, year, month, day] = match;
  return `${year}-${String(Number(month)).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`;
};

const normalizePaidHolidays = (holidays) => {
  if (!holidays) return {};
  if (Array.isArray(holidays)) {
    return holidays.reduce((acc, date) => {
      const key = normalizeHolidayKey(date);
      if (key) acc[key] = true;
      return acc;
    }, {});
  }
  if (typeof holidays !== 'object') return {};
  return Object.keys(holidays).reduce((acc, key) => {
    if (holidays[key]) {
      const normalizedKey = normalizeHolidayKey(key);
      if (normalizedKey) acc[normalizedKey] = true;
    }
    return acc;
  }, {});
};

const denormalizePaidHolidays = (paidHolidays) => {
  if (!paidHolidays) return [];
  if (Array.isArray(paidHolidays)) return paidHolidays.map(normalizeHolidayKey).filter(Boolean);
  return Object.keys(paidHolidays)
    .filter((key) => paidHolidays[key])
    .map(normalizeHolidayKey)
    .filter(Boolean);
};

const defaultSalarySettings = {
  periodType: 'calendar',
  fixedDays: 26,
  cycleStart: 1,
  cycleEnd: 31,
  payDay: 1,
  payMonth: 'next',
  overtimeRate: 1.5,
  holidayPolicy: 'paid',
  weeklyOffDays: [],
  paidHolidays: [],
};

const SuperAdminSettings = () => {
  const { user, salarySettings, setSalarySettings, updateUser } = useAppContext();
  const [sub, setSub] = useState('salary');
  
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);

  const [localSettings, setLocalSettings] = useState({
    ...defaultSalarySettings,
    ...(salarySettings || {}),
    paidHolidays: normalizePaidHolidays(salarySettings?.paidHolidays),
    weeklyOffDays: Array.isArray(salarySettings?.weeklyOffDays) ? salarySettings.weeklyOffDays : [],
  });
  const [weeklyOffDays, setWeeklyOffDays] = useState(Array.isArray(salarySettings?.weeklyOffDays) ? salarySettings.weeklyOffDays : []);
  const [paidHolidays, setPaidHolidays] = useState(normalizePaidHolidays(salarySettings?.paidHolidays));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Admin Profile Settings State
  const [adminProfile, setAdminProfile] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: 'Super Admin',
  });
  const [adminPasswords, setAdminPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState({
    payrollAlerts: true,
    attendanceAlerts: true,
    pendingApprovalAlerts: false,
  });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminSaveMessage, setAdminSaveMessage] = useState('');

  // Success Modal State
  const [successModal, setSuccessModal] = useState({ show: false, title: '', message: '' });

  // OTP State
  const [otpModal, setOtpModal] = useState({ show: false, type: '', target: '' });
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const t = THEME.superadmin;

  useEffect(() => {
    if (!salarySettings) return;

    setLocalSettings((prev) => ({
      ...defaultSalarySettings,
      ...salarySettings,
      weeklyOffDays: Array.isArray(salarySettings.weeklyOffDays) ? salarySettings.weeklyOffDays : prev.weeklyOffDays,
      paidHolidays: salarySettings.paidHolidays || [],
    }));
    setWeeklyOffDays(Array.isArray(salarySettings.weeklyOffDays) ? salarySettings.weeklyOffDays : []);
    setPaidHolidays(normalizePaidHolidays(salarySettings.paidHolidays));
  }, [salarySettings]);

  // Initialize admin profile from user data
  useEffect(() => {
    if (user) {
      setAdminProfile({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: 'Super Admin',
      });
    }
  }, [user]);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (user?.token) headers.Authorization = `Bearer ${user.token}`;

        const [salaryRes, holidayRes] = await Promise.all([
          fetch(`${API_BASE}/settings/salary`, {
            method: 'GET',
            credentials: 'include',
            headers,
          }),
          fetch(`${API_BASE}/settings/holidays/config`, {
            method: 'GET',
            credentials: 'include',
            headers,
          }),
        ]);

        let loadedSalarySettings = { ...defaultSalarySettings, ...(salarySettings || {}) };
        let loadedWeeklyOffDays = Array.isArray(salarySettings?.weeklyOffDays) ? salarySettings.weeklyOffDays : [];
        let loadedPaidHolidays = denormalizePaidHolidays(salarySettings?.paidHolidays);

        if (salaryRes.ok) {
          const salaryData = await salaryRes.json();
          loadedSalarySettings = {
            ...loadedSalarySettings,
            periodType: salaryData.period_type || loadedSalarySettings.periodType,
            fixedDays: salaryData.fixed_days || loadedSalarySettings.fixedDays,
            cycleStart: salaryData.cycle_start_day || loadedSalarySettings.cycleStart,
            cycleEnd: salaryData.cycle_end_day || loadedSalarySettings.cycleEnd,
            payDay: salaryData.pay_day || loadedSalarySettings.payDay,
            payMonth: salaryData.pay_month || loadedSalarySettings.payMonth,
            overtimeRate: salaryData.overtime_rate || loadedSalarySettings.overtimeRate,
            holidayPolicy: salaryData.holiday_policy || loadedSalarySettings.holidayPolicy,
          };
          setLocalSettings((prev) => ({
            ...prev,
            ...loadedSalarySettings,
          }));
        }

      if (holidayRes.ok) {
          const holidayData = await holidayRes.json();
          const weekOffDays = holidayData.week_off_days || [];
          const loadedPaidHolidayDates = denormalizePaidHolidays(holidayData.paid_holidays || []);
          const normalizedPaidHolidays = normalizePaidHolidays(loadedPaidHolidayDates);
          loadedWeeklyOffDays = weekOffDays;
          loadedPaidHolidays = loadedPaidHolidayDates;
          setWeeklyOffDays(weekOffDays);
          setPaidHolidays(normalizedPaidHolidays);
          setLocalSettings((prev) => ({
            ...prev,
            weeklyOffDays: weekOffDays,
            paidHolidays: loadedPaidHolidayDates,
          }));
      }

      setSalarySettings({
        ...loadedSalarySettings,
        weeklyOffDays: loadedWeeklyOffDays,
        paidHolidays: loadedPaidHolidays,
      });
      } catch (err) {
        console.warn('Unable to load settings', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.token]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpInput = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpValue];
    next[idx] = val.slice(-1);
    setOtpValue(next);

    // Auto focus next box
    if (val && idx < 5) {
      const nextBox = document.getElementById(`otp-${idx + 1}`);
      if (nextBox) nextBox.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otpValue[idx] && idx > 0) {
      const prevBox = document.getElementById(`otp-${idx - 1}`);
      if (prevBox) prevBox.focus();
    }
  };

  const sendOtp = async (type, targetValue) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;

      const res = await fetch(`${API_BASE}/otp/send`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ type, targetValue }),
      });

      if (!res.ok) throw new Error('Failed to send OTP');

      setOtpModal({ show: true, type, target: targetValue || user?.email });
      setResendTimer(30);
      setOtpValue(['', '', '', '', '', '']);
      setOtpError('');
    } catch (err) {
      setAdminSaveMessage(`Error: ${err.message}`);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      setOtpError('');
      const otp = otpValue.join('');
      if (otp.length < 6) throw new Error('Enter 6-digit OTP');

      const headers = { 'Content-Type': 'application/json' };
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;

      const res = await fetch(`${API_BASE}/otp/verify`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ type: otpModal.type, otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid OTP');
      }

      // Verification successful, close modal and continue save
      setOtpModal({ ...otpModal, show: false });
      setIsVerifying(false);
      
      // Continue with actual save logic
      await finalizeSaveProfile();
    } catch (err) {
      setOtpError(err.message);
      setIsVerifying(false);
    }
  };

  const finalizeSaveProfile = async () => {
    setAdminSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;

      const profileUpdatePayload = {
        name: adminProfile.fullName,
        email: adminProfile.email,
        phone: adminProfile.phone,
      };

      // Update profile
      const profileRes = await fetch(`${API_BASE}/employees/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(profileUpdatePayload),
      });

      if (!profileRes.ok) throw new Error('Failed to update profile');

      const updatedUserData = await profileRes.json();
      
      // Update global context so changes reflect everywhere
      updateUser({
        name: updatedUserData.name,
        email: updatedUserData.email,
        phone: updatedUserData.phone,
        profileImage: updatedUserData.profileImage
      });

      // Update password if provided
      if (adminPasswords.newPassword) {
        const passwordRes = await fetch(`${API_BASE}/auth/change-password`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({
            currentPassword: adminPasswords.currentPassword,
            newPassword: adminPasswords.newPassword,
          }),
        });

        if (!passwordRes.ok) throw new Error('Failed to update password');
        setAdminPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }

      setSuccessModal({
        show: true,
        title: 'Profile Updated',
        message: 'Your admin profile details have been successfully updated in the system.'
      });
    } catch (err) {
      setAdminSaveMessage(`Error: ${err.message}`);
    } finally {
      setAdminSaving(false);
    }
  };

  const handleSaveAdminProfile = async () => {
    setAdminSaveMessage('');
    
    // Validate password if provided
    if (adminPasswords.newPassword) {
      if (adminPasswords.newPassword !== adminPasswords.confirmPassword) {
        setAdminSaveMessage('Error: Passwords do not match');
        return;
      }
      if (!adminPasswords.currentPassword) {
        setAdminSaveMessage('Error: Current password is required');
        return;
      }
      
      // Trigger OTP for password change
      await sendOtp('password_change');
      return;
    }

    // Email change flow
    if (adminProfile.email !== user?.email) {
      await sendOtp('email_change', adminProfile.email);
      return;
    }

    // Name or phone only change
    await finalizeSaveProfile();
  };

  const toggleHoliday = (month, day) => {
    const key = `${viewYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const next = { ...paidHolidays };
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = true;
    }
    setPaidHolidays(next);
  };

  const currentMonthHolidays = Object.keys(paidHolidays).filter(key => {
    const [y, m] = key.split('-').map(Number);
    return y === viewYear && m === 3; // March preview as per existing code
  }).length;

  const lastDayOfMarch = 31;
  const previewCycleEnd = localSettings.cycleEnd === 0 || localSettings.cycleEnd > lastDayOfMarch ? lastDayOfMarch : localSettings.cycleEnd;
  const previewTotalDays = localSettings.periodType === 'fixed' ? localSettings.fixedDays : (previewCycleEnd - localSettings.cycleStart + 1);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage('');

      const headers = { 'Content-Type': 'application/json' };
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;

      // Save salary settings
      const salaryRes = await fetch(`${API_BASE}/settings/salary`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          period_type: localSettings.periodType,
          fixed_days: localSettings.fixedDays,
          cycle_start_day: localSettings.cycleStart,
          cycle_end_day: localSettings.cycleEnd,
          pay_day: localSettings.payDay,
          pay_month: localSettings.payMonth,
          overtime_rate: localSettings.overtimeRate,
          holiday_policy: localSettings.holidayPolicy,
        }),
      });

      if (!salaryRes.ok) throw new Error('Failed to save salary settings');

      // Save holiday config
      const holidayRes = await fetch(`${API_BASE}/settings/holidays/config`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          week_off_days: weeklyOffDays,
          paid_holidays: denormalizePaidHolidays(paidHolidays),
        }),
      });

      if (!holidayRes.ok) throw new Error('Failed to save holiday settings');

      setSalarySettings({
        ...localSettings,
        weeklyOffDays,
        paidHolidays: denormalizePaidHolidays(paidHolidays),
      });

      setSuccessModal({
        show: true,
        title: sub === 'salary' ? 'Salary Settings Saved' : 'Holiday Settings Saved',
        message: sub === 'salary' 
          ? 'Payroll and salary configurations have been updated successfully.'
          : 'Holiday calendar and weekly off settings have been updated successfully.'
      });
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout title="System Settings">
      <div className="ph">
        <div>
          <div className="pt">Settings</div>
          <div className="ps">Configure system rules and policies</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 20, marginTop: 18 }}>
        <div style={{ background: '#f8fafc', borderRadius: 22, border: '1px solid rgba(15,23,42,0.08)', padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              onClick={() => setSub('salary')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14,
                border: `1px solid ${t.acc}`,
                background: sub === 'salary' ? '#e9f8f1' : '#f8fafc',
                color: sub === 'salary' ? t.acc : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                minWidth: 180,
              }}
            >
              <Icon n="dollar" size={16} color={sub === 'salary' ? t.acc : '#64748b'} />
              Salary Settings
            </button>
            <button
              onClick={() => setSub('holidays')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14,
                border: `1px solid ${t.acc}`,
                background: sub === 'holidays' ? '#e9f8f1' : '#f8fafc',
                color: sub === 'holidays' ? t.acc : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                minWidth: 200,
              }}
            >
              <Icon n="calendar" size={16} color={sub === 'holidays' ? t.acc : '#64748b'} />
              Holidays & Week Off
            </button>
            <button
              onClick={() => setSub('admin')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14,
                border: `1px solid ${t.acc}`,
                background: sub === 'admin' ? '#e9f8f1' : '#f8fafc',
                color: sub === 'admin' ? t.acc : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                minWidth: 200,
              }}
            >
              <Icon n="user" size={16} color={sub === 'admin' ? t.acc : '#64748b'} />
              Admin Profile
            </button>
          </div>
        </div>

        {sub === 'holidays' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--br)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Holidays & Week Off</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button 
                  onClick={() => setViewYear(viewYear - 1)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--br)', background: '#fff', cursor: 'pointer' }}
                >
                  &lsaquo;
                </button>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{viewYear}</span>
                <button 
                  onClick={() => setViewYear(viewYear + 1)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--br)', background: '#fff', cursor: 'pointer' }}
                >
                  &rsaquo;
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Paid Holidays Calendar — {viewYear}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {Array.from({ length: 12 }, (_, month) => {
                  const daysInMonth = getDaysInMonth(month, viewYear);
                  const firstDay = getFirstDayOfMonth(month, viewYear);
                  const cells = [];
                  for (let i = 0; i < firstDay; i += 1) cells.push(null);
                  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
                  return (
                    <div key={month} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--br)', background: '#fff' }}>
                      <div style={{ background: t.acc, color: '#fff', padding: '8px 12px', fontSize: 13, fontWeight: 700 }}>{MONTH_NAMES[month]}</div>
                      <div style={{ padding: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={`${d}-${i}`} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t3)', padding: '4px 0' }}>{d}</div>
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                          {cells.map((day, idx) => {
                            const dateKey = day ? `${viewYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                            const isHoliday = day && paidHolidays[dateKey];
                            return (
                              <div
                                key={idx}
                                onClick={() => day && toggleHoliday(month, day)}
                                style={{
                                  padding: '6px',
                                  borderRadius: 6,
                                  textAlign: 'center',
                                  fontSize: 11,
                                  fontWeight: day ? 600 : 400,
                                  color: day ? (isHoliday ? '#fff' : 'var(--t2)') : 'transparent',
                                  background: day ? (isHoliday ? t.acc : '#f8fafc') : 'transparent',
                                  cursor: day ? 'pointer' : 'default',
                                  border: day ? (isHoliday ? `1px solid ${t.acc}` : '1px solid var(--br)') : 'none',
                                }}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.15)', marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.acc, marginBottom: 8 }}>Summary — {viewYear}</div>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>
                {Object.keys(paidHolidays).filter(key => key.startsWith(String(viewYear))).length > 0
                  ? `${Object.keys(paidHolidays).filter(key => key.startsWith(String(viewYear))).length} holidays set for ${viewYear}`
                  : `No holidays set yet for ${viewYear}. Click dates above to add.`}
              </div>
            </div>

            <button
              className="btn btn-sm"
              style={{
                width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', background: t.acc, color: '#fff', minWidth: 0,
                fontSize: 15, borderRadius: 16, fontWeight: 700, letterSpacing: 0.3,
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : '✓ Save Holiday Settings'}
            </button>
            {saveMessage ? <div style={{ marginTop: 12, fontSize: 13, color: saveMessage.includes('failed') ? '#b91c1c' : '#16a34a' }}>{saveMessage}</div> : null}
          </div>
        )}

        {sub === 'salary' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--br)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Salary & Payroll Settings</div>
                <div style={{ color: 'var(--t3)', fontSize: 13, marginTop: 6 }}>Configure payroll cycle and salary policy.</div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid var(--br)', background: '#f8fafc', marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Formula: Basic + Month Days × (Present + Week Offs + Paid Holidays)</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div
                onClick={() => setLocalSettings({ ...localSettings, periodType: 'calendar' })}
                style={{
                  cursor: 'pointer', borderRadius: 16, border: localSettings.periodType === 'calendar' ? `1px solid ${t.acc}` : '1px solid var(--br)',
                  background: localSettings.periodType === 'calendar' ? t.accDim : '#f8fafc', padding: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>SALARY PERIOD TYPE</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Calendar Month</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Uses actual days in every month.</div>
              </div>
              <div
                onClick={() => setLocalSettings({ ...localSettings, periodType: 'fixed' })}
                style={{
                  cursor: 'pointer', borderRadius: 16, border: localSettings.periodType === 'fixed' ? `1px solid ${t.acc}` : '1px solid var(--br)',
                  background: localSettings.periodType === 'fixed' ? t.accDim : '#f8fafc', padding: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>SALARY PERIOD TYPE</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Fixed Days</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Same number of days each month.</div>
              </div>
            </div>

            {localSettings.periodType === 'fixed' && (
              <div style={{ padding: 16, borderRadius: 16, border: '1px solid var(--br)', marginBottom: 18, background: '#f8fafc' }}>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Fixed Working Days Per Month</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{localSettings.fixedDays} days</div>
                  <select
                    className="f-in f-sel"
                    value={localSettings.fixedDays}
                    onChange={(e) => setLocalSettings({ ...localSettings, fixedDays: Number(e.target.value) })}
                    style={{ width: 140 }}
                  >
                    {Array.from({ length: 16 }, (_, idx) => 16 + idx).map((num) => (
                      <option key={num} value={num}>{num} days</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div style={{ padding: 16, borderRadius: 16, border: '1px solid var(--br)' }}>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Cycle Start Date</div>
                <select
                  className="f-in f-sel"
                  value={localSettings.cycleStart}
                  onChange={(e) => setLocalSettings({ ...localSettings, cycleStart: Number(e.target.value) })}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div style={{ padding: 16, borderRadius: 16, border: '1px solid var(--br)' }}>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Cycle End Date</div>
                <select
                  className="f-in f-sel"
                  value={localSettings.cycleEnd}
                  onChange={(e) => setLocalSettings({ ...localSettings, cycleEnd: Number(e.target.value) })}
                >
                  <option value={0}>Last Day of Month (Dynamic)</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div style={{ padding: 16, borderRadius: 16, border: '1px solid var(--br)' }}>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Salary Pay Day</div>
                <select
                  className="f-in f-sel"
                  value={localSettings.payDay}
                  onChange={(e) => setLocalSettings({ ...localSettings, payDay: Number(e.target.value) })}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div style={{ padding: 16, borderRadius: 16, border: '1px solid var(--br)' }}>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Pay Month</div>
                <select
                  className="f-in f-sel"
                  value={localSettings.payMonth}
                  onChange={(e) => setLocalSettings({ ...localSettings, payMonth: e.target.value })}
                >
                  <option value="current">Current month</option>
                  <option value="next">Next month</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#475569', padding: '16px 18px', borderRadius: 14, background: '#f8fafc', border: '1px solid var(--br)', marginBottom: 18 }}>
              Salary for {localSettings.cycleStart}–{localSettings.cycleEnd === 0 ? 'Month End' : localSettings.cycleEnd} every month → paid on {localSettings.payDay} of {localSettings.payMonth === 'next' ? 'next month' : 'current month'}.
            </div>

            <div style={{ borderRadius: 20, background: 'rgba(16, 185, 129, 0.08)', padding: 20, border: '1px solid rgba(16, 185, 129, 0.16)', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>LIVE PREVIEW — March {viewYear} · Basic {formatCurrency(16500)}</div>
                <div style={{ fontSize: 12, color: '#475569' }}>Based on selected settings</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>CYCLE DAYS</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{previewTotalDays}d</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>WEEKLY OFFS</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{weeklyOffDays.length}d</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>HOLIDAYS</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{currentMonthHolidays}d</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>PER DAY RATE</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{formatCurrency(16500 / previewTotalDays)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 8 }}>PAID DAYS (20 PRESENT)</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>20+{weeklyOffDays.length}+{currentMonthHolidays}={20 + weeklyOffDays.length + currentMonthHolidays}d</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 8 }}>NET SALARY</div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{formatCurrency(Math.round((16500 / previewTotalDays) * (20 + weeklyOffDays.length + currentMonthHolidays)))}</div>
                </div>
              </div>
            </div>

            <button
              className="btn btn-sm"
              style={{
                width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0',
                background: t.acc, color: '#fff', minWidth: 0, fontSize: 15, borderRadius: 16, fontWeight: 700, letterSpacing: 0.3,
              }}
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : '✓ Save Salary Settings'}
            </button>
            {saveMessage ? <div style={{ marginTop: 12, fontSize: 13, color: saveMessage.includes('failed') ? '#b91c1c' : '#16a34a' }}>{saveMessage}</div> : null}
          </div>
        )}

        {sub === 'admin' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--br)', padding: 24, outline: 'none' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Admin Profile Settings</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Manage super admin personal details and security</div>
            </div>

            {/* Section 1: Basic Profile */}
            <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--br)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>1. Basic Profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>FULL NAME</div>
                  <input
                    type="text"
                    value={adminProfile.fullName}
                    onChange={(e) => setAdminProfile({ ...adminProfile, fullName: e.target.value })}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)',
                      fontSize: 14, fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>EMAIL ADDRESS</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)',
                        fontSize: 14, fontFamily: 'inherit',
                      }}
                    />
                    {adminProfile.email !== user?.email && (
                      <button
                        onClick={() => sendOtp('email_change', adminProfile.email)}
                        style={{
                          padding: '8px 16px', borderRadius: 8, border: 'none', background: t.acc,
                          color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12,
                        }}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>PHONE NUMBER</div>
                  <input
                    type="tel"
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)',
                      fontSize: 14, fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>ROLE</div>
                  <input
                    type="text"
                    value={adminProfile.role}
                    disabled
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)',
                      fontSize: 14, fontFamily: 'inherit', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Security */}
            <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--br)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>2. Security</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>CURRENT PASSWORD</div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPasswords.currentPassword}
                    onChange={(e) => setAdminPasswords({ ...adminPasswords, currentPassword: e.target.value })}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)',
                      fontSize: 14, fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>NEW PASSWORD</div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPasswords.newPassword}
                    onChange={(e) => setAdminPasswords({ ...adminPasswords, newPassword: e.target.value })}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)',
                      fontSize: 14, fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>CONFIRM PASSWORD</div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPasswords.confirmPassword}
                    onChange={(e) => setAdminPasswords({ ...adminPasswords, confirmPassword: e.target.value })}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--br)',
                      fontSize: 14, fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 16, borderRadius: 12, border: '1px solid var(--br)', background: '#f8fafc',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Extra security for admin login</div>
                </div>
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  style={{
                    width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: twoFactorEnabled ? t.acc : '#cbd5e1', padding: 2, display: 'flex',
                    alignItems: 'center', position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 24, height: 24, borderRadius: 12, background: '#fff',
                      transition: 'all 0.3s ease', marginLeft: twoFactorEnabled ? 24 : 0,
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Section 3: Notifications */}
            <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--br)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>3. Notifications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id: 'payrollAlerts', label: 'Payroll alerts' },
                  { id: 'attendanceAlerts', label: 'Attendance alerts' },
                  { id: 'pendingApprovalAlerts', label: 'Pending approval alerts' },
                ].map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderRadius: 10, border: '1px solid var(--br)', background: '#f8fafc',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                    <input
                      type="checkbox"
                      checked={adminNotifications[item.id]}
                      onChange={(e) => setAdminNotifications({ ...adminNotifications, [item.id]: e.target.checked })}
                      style={{ width: 20, height: 20, cursor: 'pointer', accentColor: t.acc }}
                    />
                  </div>
                ))}
              </div>
            </div>



            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setAdminProfile({ fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '', role: 'Super Admin' });
                  setAdminPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setAdminSaveMessage('');
                }}
                style={{
                  padding: '12px 24px', borderRadius: 12, border: `1px solid ${t.acc}`, background: '#fff',
                  color: t.acc, cursor: 'pointer', fontWeight: 600, fontSize: 14, minWidth: 120,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdminProfile}
                disabled={adminSaving}
                style={{
                  padding: '12px 24px', borderRadius: 12, border: 'none', background: t.acc,
                  color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, minWidth: 120,
                  opacity: adminSaving ? 0.7 : 1,
                }}
              >
                {adminSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            {adminSaveMessage && (
              <div style={{ marginTop: 16, fontSize: 13, color: adminSaveMessage.includes('successfully') ? '#16a34a' : '#b91c1c', textAlign: 'center' }}>
                {adminSaveMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {successModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }}>
          <div style={{
            background: '#fff', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32, background: '#ecfdf5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <Icon n="check" size={32} color="#10b981" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{successModal.title}</div>
            <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
              {successModal.message}
            </div>
            <button
              onClick={() => setSuccessModal({ show: false, title: '', message: '' })}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: t.acc, color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {otpModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: t.accDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon n="shield-check" size={32} color={t.acc} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Verify your {otpModal.type === 'email_change' ? 'Email' : 'Identity'}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                Enter the 6-digit code sent to <br />
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{otpModal.target}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
              {otpValue.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpInput(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  style={{
                    width: 45, height: 54, borderRadius: 12, border: '2px solid',
                    borderColor: digit ? t.acc : 'var(--br)',
                    textAlign: 'center', fontSize: 20, fontWeight: 700,
                    outline: 'none', background: digit ? '#fff' : '#f8fafc',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>

            {otpError && (
              <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 16, fontWeight: 600 }}>
                {otpError}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={isVerifying || otpValue.join('').length < 6}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: t.acc, color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', opacity: (isVerifying || otpValue.join('').length < 6) ? 0.7 : 1,
                marginBottom: 20,
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Update'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Didn&apos;t receive the code?
              </div>
              {resendTimer > 0 ? (
                <div style={{ fontSize: 13, fontWeight: 600, color: t.acc, marginTop: 4 }}>
                  Resend in {resendTimer}s
                </div>
              ) : (
                <button
                  onClick={() => sendOtp(otpModal.type, otpModal.target)}
                  style={{
                    background: 'none', border: 'none', color: t.acc,
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 4,
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => setOtpModal({ show: false, type: '', target: '' })}
              style={{
                width: '100%', background: 'none', border: 'none', color: '#94a3b8',
                fontSize: 13, cursor: 'pointer', marginTop: 16,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default SuperAdminSettings;
