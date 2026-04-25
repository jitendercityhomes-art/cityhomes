
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_SALARY_SETTINGS, DEFAULT_GEO, API_BASE } from '../lib/constants';
import { normalizeUserRole } from '../lib/auth';

const normalizeHolidayKey = (date) => {
  if (!date || typeof date !== 'string') return '';
  const normalized = date.trim();
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return normalized;
  const [, year, month, day] = match;
  return `${year}-${String(Number(month)).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`;
};

const denormalizePaidHolidays = (paidHolidays) => {
  if (!paidHolidays) return [];
  if (Array.isArray(paidHolidays)) return paidHolidays.map(normalizeHolidayKey).filter(Boolean);
  return Object.keys(paidHolidays)
    .filter((key) => paidHolidays[key])
    .map(normalizeHolidayKey)
    .filter(Boolean);
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [geoSettings, setGeoSettings] = useState(DEFAULT_GEO);
  const [globalStaff, setGlobalStaff] = useState([]);
  const [liveAttendance, setLiveAttendance] = useState([]);
  const [globalLeaves, setGlobalLeaves] = useState([]);
  const [globalActivity, setGlobalActivity] = useState([]);
  const [globalBranches, setGlobalBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedBranch') || 'all';
    }
    return 'all';
  });
  const [globalReimb, setGlobalReimb] = useState([]);
  const [salarySettings, setSalarySettings] = useState(DEFAULT_SALARY_SETTINGS);
  const [backendOnline, setBackendOnline] = useState(true);
  const [salaryData, setSalaryData] = useState({});
  const [empNotifs, setEmpNotifs] = useState({});
  const [yearlyHolidays, setYearlyHolidays] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (salarySettings?.paidHolidays && Array.isArray(salarySettings.paidHolidays)) {
      const holidaysByYear = {};
      salarySettings.paidHolidays.forEach(dateStr => {
        const [year, month, day] = dateStr.split('-').map(Number);
        if (!year || !month || !day) return;
        
        if (!holidaysByYear[year]) holidaysByYear[year] = {};
        if (!holidaysByYear[year][month - 1]) holidaysByYear[year][month - 1] = [];
        
        holidaysByYear[year][month - 1].push(day);
      });
      setYearlyHolidays(holidaysByYear);
    }
  }, [salarySettings?.paidHolidays]);

  const [lastBirthdayCheck, setLastBirthdayCheck] = useState(null);
  const [isDataLoaded, setIsSyncing] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('userAuth');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData && userData.role) {
              const u = {
                ...userData,
                role: normalizeUserRole(userData.role)
              };
              setUser(u);
              // Wait for initial data fetch before hiding loader
              await fetchInitialData(u);
            }
          } catch (e) {
            localStorage.removeItem('userAuth');
          }
        }
      }
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  const fetchInitialData = useCallback(async (u = user) => {
    if (!u?.email) return;
    setIsSyncing(true);
    try {
      const savedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userAuth') || '{}') : {};
      const token = u.token || savedUser.token || savedUser.access_token;
      
      const endpoints = [
        { name: 'staff', url: `${API_BASE}/employees`, setter: setGlobalStaff },
        { name: 'liveAttendance', url: `${API_BASE}/attendance/live`, setter: setLiveAttendance },
        { name: 'leaves', url: `${API_BASE}/leaves`, setter: setGlobalLeaves },
        { 
          name: 'reimbursements', 
          url: u.role === 'employee' ? `${API_BASE}/reimbursements/my` : `${API_BASE}/reimbursements`, 
          setter: setGlobalReimb 
        },
        { name: 'activity', url: `${API_BASE}/activity-log`, setter: setGlobalActivity },
        { name: 'branches', url: `${API_BASE}/branches`, setter: setGlobalBranches }
      ];

      const results = await Promise.all(endpoints.map(async (ep) => {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(ep.url, { credentials: 'include', headers });
          if (res.ok) {
            const data = await res.json();
            let processedData = data;
            if (ep.name === 'liveAttendance' && data && !Array.isArray(data) && data.employees) {
              processedData = data;
            } else if (ep.name === 'staff' && Array.isArray(data)) {
              processedData = data.map(s => {
                const bId = s.branch_id || s.branchId || (s.branch?.id);
                const bName = s.branch?.name || (typeof s.branch === 'string' ? s.branch : 'Main Branch');
                return {
                  ...s,
                  ls: s.ls || 'nopunch',
                  status: s.status || 'absent',
                  dept: s.department?.name || s.dept || '—',
                  branch: bName,
                  branch_id: bId,
                  role: s.designation || s.role || 'Employee'
                };
              });
            }
            ep.setter(processedData);
            return true;
          } else if (res.status === 401) {
            // Token might be expired or invalid
            console.warn(`AppContext: Unauthorized access for ${ep.name}, clearing session.`);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userAuth');
            }
            setUser(null);
            return false;
          }
        } catch (err) {
          console.error(`AppContext: Error fetching ${ep.name}:`, err);
        }
        return false;
      }));

      // Also fetch current user's full profile to get phone, department, etc.
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const profileRes = await fetch(`${API_BASE}/employees/profile`, { credentials: 'include', headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData) {
            // If user has a department, fetch its details for 100% sync of rules
            if (profileData.department_id || profileData.department?.id) {
              const deptId = profileData.department_id || profileData.department?.id;
              try {
                const deptRes = await fetch(`${API_BASE}/departments/${deptId}`, { credentials: 'include', headers });
                if (deptRes.ok) {
                  const deptData = await deptRes.json();
                  profileData.department = deptData;
                }
              } catch (deptErr) {
                console.warn('AppContext: Unable to fetch department details', deptErr);
              }
            }
            setUser(prev => ({ ...prev, ...profileData }));
          }
        }
      } catch (err) {
        console.warn('AppContext: Unable to fetch user profile', err);
      }

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [salaryRes, holidayRes] = await Promise.all([
          fetch(`${API_BASE}/settings/salary`, { credentials: 'include', headers }),
          fetch(`${API_BASE}/settings/holidays/config`, { credentials: 'include', headers }),
        ]);

        const nextSettings = { ...DEFAULT_SALARY_SETTINGS };

        if (salaryRes.ok) {
          const salaryData = await salaryRes.json();
          Object.assign(nextSettings, {
            periodType: salaryData.period_type || nextSettings.periodType,
            fixedDays: salaryData.fixed_days || nextSettings.fixedDays,
            cycleStart: salaryData.cycle_start_day || nextSettings.cycleStart,
            cycleEnd: salaryData.cycle_end_day || nextSettings.cycleEnd,
            payDay: salaryData.pay_day || nextSettings.payDay,
            payMonth: salaryData.pay_month || nextSettings.payMonth,
            overtimeRate: salaryData.overtime_rate || nextSettings.overtimeRate,
            holidayPolicy: salaryData.holiday_policy || nextSettings.holidayPolicy,
          });
        } else if (salaryRes.status === 401) {
          console.warn('AppContext: Unauthorized access for salary settings, clearing session.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userAuth');
          }
          setUser(null);
          return;
        }

        if (holidayRes.ok) {
          const holidayData = await holidayRes.json();
          Object.assign(nextSettings, {
            weeklyOffDays: Array.isArray(holidayData.week_off_days) ? holidayData.week_off_days : nextSettings.weeklyOffDays,
            paidHolidays: denormalizePaidHolidays(holidayData.paid_holidays || []),
          });
        } else if (holidayRes.status === 401) {
          console.warn('AppContext: Unauthorized access for holiday settings, clearing session.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userAuth');
          }
          setUser(null);
          return;
        }

        setSalarySettings(nextSettings);
      } catch (err) {
        console.warn('AppContext: Unable to fetch salary settings', err);
      }

      // If all failed with 401, maybe logout
      setBackendOnline(results.some(r => r));
    } catch (e) {
      console.error('AppContext: Critical error in fetchInitialData:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [user?.email, user?.token]);

  const refreshSettings = useCallback(async () => {
    const savedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userAuth') || '{}') : {};
    const token = user?.token || savedUser.token || savedUser.access_token;
    if (!token) return;

    try {
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
      
      // Fetch settings and profile in parallel for 100% sync
      const [salaryRes, holidayRes, profileRes] = await Promise.all([
        fetch(`${API_BASE}/settings/salary`, { credentials: 'include', headers }),
        fetch(`${API_BASE}/settings/holidays/config`, { credentials: 'include', headers }),
        fetch(`${API_BASE}/employees/profile`, { credentials: 'include', headers }),
      ]);

      let salaryData = {};
      let holidayData = {};

      if (salaryRes.ok) salaryData = await salaryRes.json();
      if (holidayRes.ok) holidayData = await holidayRes.json();
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData) {
          // If user has a department, fetch its details
          if (profileData.department_id || profileData.department?.id) {
            const deptId = profileData.department_id || profileData.department?.id;
            try {
              const deptRes = await fetch(`${API_BASE}/departments/${deptId}`, { credentials: 'include', headers });
              if (deptRes.ok) {
                const deptData = await deptRes.json();
                profileData.department = deptData;
              }
            } catch (deptErr) {
              console.warn('AppContext: Unable to refresh department details', deptErr);
            }
          }
          setUser(prev => ({ ...prev, ...profileData }));
        }
      }

      setSalarySettings(prev => {
        const next = { ...prev };
        if (salaryRes.ok) {
          Object.assign(next, {
            periodType: salaryData.period_type || next.periodType,
            fixedDays: salaryData.fixed_days || next.fixedDays,
            cycleStart: salaryData.cycle_start_day || next.cycleStart,
            cycleEnd: salaryData.cycle_end_day || next.cycleEnd,
            payDay: salaryData.pay_day || next.payDay,
            payMonth: salaryData.pay_month || next.payMonth,
            overtimeRate: salaryData.overtime_rate || next.overtimeRate,
            holidayPolicy: salaryData.holiday_policy || next.holidayPolicy,
          });
        }
        if (holidayRes.ok) {
          Object.assign(next, {
            weeklyOffDays: Array.isArray(holidayData.week_off_days) ? holidayData.week_off_days : next.weeklyOffDays,
            paidHolidays: denormalizePaidHolidays(holidayData.paid_holidays || []),
          });
        }
        return next;
      });
    } catch (err) {
      console.warn('AppContext: Unable to refresh settings', err);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.email) {
      fetchInitialData();
    }
  }, [user?.email, user?.token, fetchInitialData]);

  const addEmpNotif = useCallback((empName, notif) => {
    setEmpNotifs(n => ({
      ...n,
      [empName]: [{ id: Date.now(), ...notif }, ...(n[empName] || [])]
    }));
  }, []);

  const addActivity = useCallback((who, role, action, detail, type, color) => {
    setGlobalActivity(a => [{
      id: Date.now(),
      who,
      role,
      action,
      detail,
      when: 'Just now',
      type,
      color
    }, ...a.slice(0, 19)]);
  }, []);

  const updateUser = useCallback((newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      if (typeof window !== 'undefined') {
        const savedAuth = JSON.parse(localStorage.getItem('userAuth') || '{}');
        localStorage.setItem('userAuth', JSON.stringify({ ...savedAuth, ...updated }));
      }
      return updated;
    });
  }, []);

  const value = {
    user, setUser,
    authLoading,
    geoSettings, setGeoSettings,
    globalStaff, setGlobalStaff,
    liveAttendance, setLiveAttendance,
    globalLeaves, setGlobalLeaves,
    globalActivity, setGlobalActivity,
    globalBranches, setGlobalBranches,
    selectedBranch, setSelectedBranch,
    globalReimb, setGlobalReimb,
    salarySettings, setSalarySettings,
    backendOnline, setBackendOnline,
    salaryData, setSalaryData,
    empNotifs, setEmpNotifs,
    yearlyHolidays, setYearlyHolidays,
    addEmpNotif,
    addActivity,
    updateUser,
    fetchInitialData,
    refreshSettings,
    isDataLoaded,
    refreshTrigger,
    triggerRefresh
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedBranch', selectedBranch);
    }
  }, [selectedBranch]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('useAppContext called outside AppProvider, returning empty context');
    return {
      user: null,
      setUser: () => {},
      authLoading: true,
      geoSettings: { lat: 0, lng: 0 },
      setGeoSettings: () => {},
      globalStaff: [],
      setGlobalStaff: () => {},
      liveAttendance: [],
      setLiveAttendance: () => {},
      globalLeaves: [],
      setGlobalLeaves: () => {},
      globalActivity: [],
      setGlobalActivity: () => {},
      globalBranches: [],
      setGlobalBranches: () => {},
      selectedBranch: 'all',
      setSelectedBranch: () => {},
      globalReimb: [],
      setGlobalReimb: () => {},
      salarySettings: {},
      setSalarySettings: () => {},
      backendOnline: true,
      setBackendOnline: () => {},
      salaryData: {},
      setSalaryData: () => {},
      empNotifs: {},
      setEmpNotifs: () => {},
      yearlyHolidays: {},
      setYearlyHolidays: () => {},
      addEmpNotif: () => {},
      addActivity: () => {},
      updateUser: () => {},
      fetchInitialData: () => {},
      refreshSettings: () => {},
      isDataLoaded: false,
      refreshTrigger: 0,
      triggerRefresh: () => {}
    };
  }
  return context;
};
