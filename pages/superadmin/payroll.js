import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import PayslipModal from '../../components/shared/PayslipModal';
import { API_BASE, THEME, DEFAULT_SALARY_SETTINGS } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getMonthNumber = label => MONTH_LABELS.indexOf(label.split(' ')[0]) + 1;
const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
const padTwo = value => String(value).padStart(2, '0');

const parseDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (typeof dateInput === 'string') {
    // If it's a full ISO string with T, parse it directly but set to midnight
    if (dateInput.includes('T')) {
      const d = new Date(dateInput);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    // Handle YYYY-MM-DD
    const parts = dateInput.split(/[-/]/);
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      return new Date(y, m - 1, d);
    }
  }
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeWeekOffDays = (weekOffDays) => {
  if (weekOffDays === undefined || weekOffDays === null) return [];
  if (Array.isArray(weekOffDays)) {
    return weekOffDays
      .map((day) => Number(day))
      .filter((day) => Number.isFinite(day) && day >= 0 && day <= 6);
  }
  if (typeof weekOffDays === 'string') {
    const trimmed = weekOffDays.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return normalizeWeekOffDays(JSON.parse(trimmed));
      } catch (err) {
        console.warn('Unable to parse week off days string:', trimmed, err);
      }
    }
    return trimmed
      .split(/[\s,]+/)
      .map((item) => Number(item.trim()))
      .filter((day) => Number.isFinite(day) && day >= 0 && day <= 6);
  }
  const day = Number(weekOffDays);
  return Number.isFinite(day) && day >= 0 && day <= 6 ? [day] : [];
};

const countWeekOffsInRange = (startDate, endDate, weekOffDays) => {
  const normalized = normalizeWeekOffDays(weekOffDays);
  if (!normalized.length) return 0;
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (normalized.includes(cursor.getDay())) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
};

const getCycleRange = (monthLabel, cycleStartDay) => {
  const month = getMonthNumber(monthLabel);
  const year = Number(monthLabel.split(' ')[1]);
  if (cycleStartDay === 1) {
    return {
      startDate: `${year}-${padTwo(month)}-01`,
      endDate: `${year}-${padTwo(month)}-${getDaysInMonth(month, year)}`,
    };
  }

  const endYear = year;
  const endMonth = month;
  const endDay = cycleStartDay - 1;

  const startMonth = month === 1 ? 12 : month - 1;
  const startYear = month === 1 ? year - 1 : year;
  const startDay = cycleStartDay;

  return {
    startDate: `${startYear}-${padTwo(startMonth)}-${padTwo(startDay)}`,
    endDate: `${endYear}-${padTwo(endMonth)}-${padTwo(endDay)}`,
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const SuperAdminPayroll = () => {
  const router = useRouter();
  const { user, globalStaff, salarySettings, globalReimb, selectedBranch } = useAppContext();
  const [month, setMonth] = useState(`${MONTH_LABELS[new Date().getMonth()]} ${new Date().getFullYear()}`);
  const [loading, setLoading] = useState(false);
  const [payrollList, setPayrollList] = useState([]);
  const [attendanceDataMap, setAttendanceDataMap] = useState({});
  const [error, setError] = useState('');
  const [showPayslip, setShowPayslip] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editData, setEditData] = useState({});
  const [marking, setMarking] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const t = THEME.superadmin;
  
  const selectedMonthNum = getMonthNumber(month);
  const selectedYear = Number(month.split(' ')[1]);

  const salarySettingsWithDefaults = { ...DEFAULT_SALARY_SETTINGS, ...(salarySettings || {}) };
  const cycleStartDay = salarySettingsWithDefaults.cycleStart || 1;
  
  const cycleLabel = useMemo(() => {
    if (cycleStartDay === 1) {
      return `01 ${month.split(' ')[0]} – ${new Date(selectedYear, selectedMonthNum, 0).getDate()} ${month.split(' ')[0]}`;
    }
    const prevMonthDate = new Date(selectedYear, selectedMonthNum - 2, 1);
    const prevMonthName = MONTH_LABELS[prevMonthDate.getMonth()].substring(0, 3);
    const currentMonthName = month.split(' ')[0].substring(0, 3);
    return `${cycleStartDay} ${prevMonthName} – ${cycleStartDay - 1} ${currentMonthName}`;
  }, [cycleStartDay, month, selectedMonthNum, selectedYear]);

  const salaryPayMonthLabel = salarySettingsWithDefaults.payMonth === 'next' ? 'next month' : 'current month';
  
  const currentMonthHolidays = useMemo(() => {
    if (!salarySettingsWithDefaults.paidHolidays) return 0;
    const holidays = Array.isArray(salarySettingsWithDefaults.paidHolidays) 
      ? salarySettingsWithDefaults.paidHolidays 
      : Object.keys(salarySettingsWithDefaults.paidHolidays).filter(k => salarySettingsWithDefaults.paidHolidays[k]);
      
    return holidays.filter(dateStr => {
      const [y, m] = dateStr.split('-').map(Number);
      return y === selectedYear && m === selectedMonthNum;
    }).length;
  }, [salarySettingsWithDefaults.paidHolidays, selectedYear, selectedMonthNum]);

  const salaryWeeklyOffCount = Array.isArray(salarySettingsWithDefaults.weeklyOffDays) ? salarySettingsWithDefaults.weeklyOffDays.length : 0;
  const salaryPeriodLabel = salarySettingsWithDefaults.periodType === 'fixed'
    ? `${salarySettingsWithDefaults.fixedDays} days fixed`
    : 'Calendar month';

  const now = new Date();
  const generateAvailableMonths = () => {
    const months = [];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    for (let year = 2025; year <= currentYear; year++) {
      const startMonth = year === 2025 ? 0 : 0;
      const endMonth = year === currentYear ? currentMonth : 11;
      for (let month = startMonth; month <= endMonth; month++) {
        months.push(`${MONTH_LABELS[month]} ${year}`);
      }
    }
    return months;
  };
  const AVAILABLE_MONTHS = generateAvailableMonths();

  const fetchPayroll = async () => {
    if (!user?.token) return;
    setLoading(true);
    setError('');
    const monthNumber = getMonthNumber(month);
    const year = Number(month.split(' ')[1]);

    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` };

      // First, try to fetch existing payroll data
      const getRes = await fetch(`${API_BASE}/payroll?month=${monthNumber}&year=${year}`, {
        credentials: 'include',
        headers,
      });

      if (getRes.ok) {
        const data = await getRes.json();
        const existingPayroll = Array.isArray(data) ? data : [];
        
        // Fetch attendance summary for all employees using salary cycle dates
        const attendanceMap = {};
        const { startDate, endDate } = getCycleRange(month, cycleStartDay);
        const actualCycleDays = Math.round((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Check which employees already have payroll in DB
        const hasPayrollIds = new Set(existingPayroll.map(p => Number(p.employee_id)));

        const placeholders = [];
        for (const staff of globalStaff) {
          // Allow superadmin to show in payroll if the user expects them to
          // if (staff.role === 'superadmin') continue;
          
          // If payroll already exists in DB for this staff, don't fetch attendance for calculation
          // because we want to show exactly what's in the DB
          if (hasPayrollIds.has(Number(staff.id))) continue;

          // Add as placeholder
          placeholders.push({
            employee_id: staff.id,
            employee: staff,
            placeholder: true,
            month: monthNumber,
            year: year,
            status: 'PENDING',
            gross_amount: 0,
            net_payable: 0,
            reimbursement_amount: 0
          });

          try {
            const url = `${API_BASE}/attendance/summary?employeeId=${staff.id}&startDate=${startDate}&endDate=${endDate}`;
            const attendanceRes = await fetch(url, { credentials: 'include', headers });
            
            if (attendanceRes.ok) {
              const attendanceData = await attendanceRes.json();
              const summary = attendanceData.summary || attendanceData;
              const present = summary.present !== undefined ? summary.present : 0;
              const absent = summary.absent !== undefined ? summary.absent : 0;
              const halfDays = summary.halfDay !== undefined ? summary.halfDay : 0;
              const actualWeekOff = summary.weekOff !== undefined ? summary.weekOff : 0;
              const scheduledWeekOffs = summary.scheduledWeekOffs !== undefined
                ? summary.scheduledWeekOffs
                : actualWeekOff;

              attendanceMap[staff.id] = {
                present: Math.round(present * 10) / 10,
                absent: absent,
                halfDays: Math.round(halfDays * 10) / 10,
                holiday: summary.holiday || 0,
                weekOff: actualWeekOff,
                scheduledWeekOffs,
                paidLeave: summary.paidLeave || 0,
                unpaidLeave: summary.unpaidLeave || 0,
                total: actualCycleDays,
              };
            }
          } catch (err) {
            console.error(`❌ Failed to fetch attendance for ${staff.name} (${staff.id}):`, err);
          }
        }
        
        setPayrollList([...existingPayroll, ...placeholders]);
        setAttendanceDataMap(attendanceMap);
        setError('');
      } else {
        setError('Unable to load payroll. Please try again.');
        setPayrollList([]);
        setAttendanceDataMap({});
      }
    } catch (err) {
      console.error('Payroll fetch failed', err);
      setError('Unable to load payroll. Please check your connection.');
      setPayrollList([]);
      setAttendanceDataMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
    window.addEventListener('focus', fetchPayroll);
    
    // Auto refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      if (!loading) {
        fetchPayroll();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', fetchPayroll);
      clearInterval(interval);
    };
  }, [
    month,
    user?.token,
    globalStaff,
    salarySettingsWithDefaults.cycleStart,
    salarySettingsWithDefaults.cycleEnd,
    (salarySettingsWithDefaults.weeklyOffDays || []).join(','),
    (salarySettingsWithDefaults.paidHolidays || []).join(','),
  ]);

  const totals = useMemo(() => {
    return payrollList.reduce(
      (acc, payroll) => {
        const gross = Number(payroll.gross_amount || 0);
        const net = Number(payroll.net_payable || 0);
        const reimb = Number(payroll.reimbursement_amount || 0);
        acc.totalGross += gross;
        acc.totalNet += net;
        acc.totalReimb += reimb;
        if (payroll.status?.toLowerCase() === 'paid') acc.totalPaid += net;
        return acc;
      },
      { totalGross: 0, totalNet: 0, totalPaid: 0, totalReimb: 0 },
    );
  }, [payrollList]);

  const staffPayrollRows = useMemo(() => {
    if (selectedBranch === 'all' || !selectedBranch) return payrollList || [];
    return (payrollList || []).filter(p => {
      const staff = globalStaff.find(s => Number(s.id) === Number(p.employee_id));
      const bId = staff?.branch_id || staff?.branchId || (staff?.branch?.id) || staff?.branch;
      return String(bId) === String(selectedBranch);
    });
  }, [payrollList, selectedBranch, globalStaff]);

  const handleOpenEdit = (payroll) => {
    const staff = globalStaff.find(s => Number(s.id) === Number(payroll.employee_id));
    const { startDate, endDate } = getCycleRange(month, cycleStartDay);
    const cycleStartLocal = parseDate(startDate);
    const cycleEndLocal = parseDate(endDate);
    
    const joiningDateRaw = staff?.date_of_joining || staff?.joiningDate;
    const joiningDate = parseDate(joiningDateRaw);

    const effectiveStartLocal = (joiningDate && joiningDate > cycleStartLocal) ? joiningDate : cycleStartLocal;
    const effectiveTotalCycleDays = Math.round((cycleEndLocal.getTime() - effectiveStartLocal.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const departmentWeekOffCount = staff?.department
      ? countWeekOffsInRange(effectiveStartLocal, cycleEndLocal, staff.department.week_off_days)
      : 0;
    
    const attendanceSummary = attendanceDataMap[payroll.employee_id] || {};
    
    const weekOffDays = attendanceSummary.weekOff !== undefined ? attendanceSummary.weekOff : (departmentWeekOffCount || payroll.week_off_days || 0);
    const holidayDays = attendanceSummary.holiday !== undefined ? attendanceSummary.holiday : (payroll.paid_holiday_days || 0);
    
    const presentDays = attendanceSummary.present !== undefined ? attendanceSummary.present : (payroll.present_days || 0);
    const paidLeaveDays = (payroll.paid_leave_days > 0) ? payroll.paid_leave_days : (attendanceSummary.paidLeave || 0);
    const unpaidLeaveDays = (payroll.unpaid_leave_days > 0) ? payroll.unpaid_leave_days : (attendanceSummary.unpaidLeave || 0);
    const halfDays = (payroll.half_days > 0) ? payroll.half_days : (attendanceSummary.halfDays || 0);

    const absentDays = Math.max(0, effectiveTotalCycleDays - presentDays - holidayDays - weekOffDays - paidLeaveDays - unpaidLeaveDays - (halfDays * 0.5));

    setEditingEmployeeId(payroll.employee_id);
    setEditData({
      full_basic: staff?.basic_salary || payroll.basic_earned || 0,
      basic: payroll.basic_earned || 0,
      hra: payroll.hra || 0,
      da: payroll.da || 0,
      bonus: payroll.bonus || 0,
      overtime: payroll.overtime || 0,
      incentive: payroll.incentive || 0,
      present_days: presentDays,
      paid_leave_days: paidLeaveDays,
      unpaid_leave_days: unpaidLeaveDays,
      holiday_days: holidayDays,
      week_off_days: weekOffDays,
      half_days: halfDays,
      absent_days: absentDays,
      lop_days: Number(unpaidLeaveDays) + Number(absentDays),
      reimbursement_amount: payroll.reimbursement_amount || 0,
      month: payroll.month || getMonthNumber(month),
      year: payroll.year || Number(month.split(' ')[1]) || new Date().getFullYear(),
    });
  };

  const handleCloseEdit = () => {
    setEditingEmployeeId(null);
    setEditData({});
  };

  const handleProcessAll = async () => {
    setSyncing(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;

      const monthNumber = getMonthNumber(month);
      const year = Number(month.split(' ')[1]);

      const res = await fetch(`${API_BASE}/payroll/sync`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ month: monthNumber, year }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Payroll sync failed');
      }

      const data = await res.json();
      setPayrollList(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Process All failed', err);
      setError('Payroll sync failed. Please refresh and try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveEdit = async () => {
    const employeeId = Number(editingEmployeeId);
    const staff = globalStaff.find(item => Number(item.id) === employeeId);
    if (!staff) {
      handleCloseEdit();
      return;
    }

    const existingPayroll = payrollList.find(item => Number(item.employee_id) === employeeId);
    
    const [label, yearStr] = month.split(' ');
    const monthNumber = getMonthNumber(month);
    const yr = Number(yearStr);

    const { startDate, endDate } = getCycleRange(month, cycleStartDay);
    const startLocal = parseDate(startDate);
    const endLocal = parseDate(endDate);
    const actualCycleDays = Math.round((endLocal.getTime() - startLocal.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const totalPaidDays = Number(editData.present_days || 0) + 
                          Number(editData.holiday_days || 0) + 
                          Number(editData.week_off_days || 0) + 
                          (Number(editData.half_days || 0) * 0.5) + 
                          (Number(editData.paid_leave_days || 0) * 1.0);
                          
    const totalCycleDaysForCalc = salarySettingsWithDefaults.periodType === 'fixed' ? Number(salarySettingsWithDefaults.fixedDays || 26) : actualCycleDays;
    const earnedBasic = Math.round((Number(editData.full_basic || 0) / totalCycleDaysForCalc) * totalPaidDays);

    // If it exists in DB, update it via API
    if (existingPayroll && existingPayroll.id && !String(existingPayroll.id).startsWith('staff-')) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (user?.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch(`${API_BASE}/payroll/${existingPayroll.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({
            basic_earned: earnedBasic,
            hra: Number(editData.hra || 0),
            da: Number(editData.da || 0),
            bonus: Number(editData.bonus || 0),
            overtime: Number(editData.overtime || 0),
            incentive: Number(editData.incentive || 0),
            present_days: Math.round(Number(editData.present_days || 0)),
            holiday_days: Math.round(Number(editData.holiday_days || 0)),
            week_off_days: Math.round(Number(editData.week_off_days || 0)),
            half_days: Number(editData.half_days || 0),
            paid_leave_days: Number(editData.paid_leave_days || 0),
            unpaid_leave_days: Number(editData.unpaid_leave_days || 0),
            absent_days: Math.round(Number(editData.absent_days || 0)),
            lop_days: Math.round(Number(editData.lop_days || 0)),
            reimbursement_amount: Number(editData.reimbursement_amount || 0),
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          // After update, if it was paid, it stays paid, but we need to ensure 
          // we have the employee object from globalStaff to avoid "Unknown"
          const staff = globalStaff.find(s => Number(s.id) === Number(updated.employee_id));
          const withEmployee = {
            ...updated,
            employee: updated.employee || {
              name: staff?.name || 'Unknown',
              role: staff?.designation || staff?.role || 'Employee',
              basic_salary: staff?.basic_salary || 0
            }
          };
          setPayrollList(prev => prev.map(item => item.id === withEmployee.id ? withEmployee : item));
        } else {
          throw new Error('Failed to update payroll');
        }
      } catch (err) {
        console.error('Update payroll failed', err);
        alert('Failed to save changes to database.');
      }
    } else {
      // For placeholders or new records, just update local state (they will be created on 'Pay')
      const gross =
        earnedBasic +
        Number(editData.hra || 0) +
        Number(editData.da || 0) +
        Number(editData.bonus || 0) +
        Number(editData.overtime || 0) +
        Number(editData.incentive || 0);
      const net = gross + Number(editData.reimbursement_amount || 0);

      setPayrollList(prev => {
        const existingIndex = prev.findIndex(item => Number(item.employee_id) === employeeId);
        const updatedRecord = {
          id: existingIndex >= 0 ? prev[existingIndex].id : `new-${employeeId}-${month}`,
          employee_id: employeeId,
          employee: {
            name: staff.name,
            role: staff.designation || staff.role || 'Employee',
          },
          basic_earned: earnedBasic,
          hra: Number(editData.hra || 0),
          da: Number(editData.da || 0),
          bonus: Number(editData.bonus || 0),
          overtime: Number(editData.overtime || 0),
          incentive: Number(editData.incentive || 0),
          present_days: Number(editData.present_days || 0),
          paid_holiday_days: Number(editData.holiday_days || 0),
          week_off_days: Number(editData.week_off_days || 0),
          unpaid_leave_days: Number(editData.unpaid_leave_days || 0),
          absent_days: Number(editData.absent_days || 0),
          lop_days: Number(editData.lop_days || 0),
          reimbursement_amount: Number(editData.reimbursement_amount || 0),
          gross_amount: gross,
          net_payable: net,
          status: existingIndex >= 0 ? prev[existingIndex].status : 'pending',
          month: editData.month,
          year: editData.year,
        };

        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = { ...prev[existingIndex], ...updatedRecord };
          return next;
        }

        return [...prev, updatedRecord];
      });
    }

    setEditingEmployeeId(null);
    setEditData({});
  };

  const handleMarkPaid = async (payroll) => {
    const markKey = payroll.id || payroll.employee_id;
    setMarking(markKey);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;

      let payrollId = payroll.id;
      if (!payrollId || isNaN(Number(payrollId))) {
        const createRes = await fetch(`${API_BASE}/payroll/calculate`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({
            employeeId: payroll.employee_id,
            month: payroll.month,
            year: payroll.year,
            attendanceStats: {
              presentDays: Number(payroll.present_days || 0),
              weekOffDays: Number(payroll.week_off_days || 0),
              paidHolidays: Number(payroll.paid_holiday_days || 0),
              halfDays: Number(payroll.half_days || 0),
              paidLeaves: Number(payroll.paid_leave_days || 0),
              unpaidLeaves: Number(payroll.unpaid_leave_days || 0),
              lopDays: Number(payroll.lop_days || 0),
              absentDays: Number(payroll.absent_days || 0),
              approvedReimbursements: Number(payroll.reimbursement_amount || 0),
              month: payroll.month,
              year: payroll.year,
            },
            salaryStructure: {
              basic_salary: Number(payroll.basic_earned || 0),
              house_rent_allowance: Number(payroll.hra || 0),
              dearness_allowance: Number(payroll.da || 0),
              bonus: Number(payroll.bonus || 0),
              overtime: Number(payroll.overtime || 0),
              incentive: Number(payroll.incentive || 0),
              pf_deduction: 0,
              esi_deduction: 0,
              tds_deduction: 0,
              professional_tax: 0,
            },
          }),
        });

        if (!createRes.ok) {
          const body = await createRes.text();
          throw new Error(body || 'Failed to create payroll before payment');
        }

        const createdPayroll = await createRes.json();
        payrollId = createdPayroll.id;

        setPayrollList(prev => {
          const existingIndex = prev.findIndex(item => Number(item.employee_id) === Number(payroll.employee_id));
          const paidEntry = { ...createdPayroll, status: 'paid' };
          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = paidEntry;
            return next;
          }
          return [...prev, paidEntry];
        });
      }

      const res = await fetch(`${API_BASE}/payroll/${payrollId}/mark-paid`, {
        method: 'PUT',
        credentials: 'include',
        headers,
      });

      if (res.ok) {
        setPayrollList(prev => prev.map(item => {
          const matches = item.id === payrollId || item.employee_id === payroll.employee_id;
          return matches ? { ...item, status: 'paid' } : item;
        }));
      } else {
        const body = await res.text();
        throw new Error(body || 'Failed to mark payroll as paid');
      }
    } catch (err) {
      console.error('Mark paid failed', err);
      alert('Unable to update payroll status.');
    } finally {
      setMarking(null);
    }
  };

  return (
    <SuperAdminLayout title="Payroll Management">
      {showPayslip && (
        <PayslipModal
          onClose={() => setShowPayslip(null)}
          empData={showPayslip.employee}
          salData={{
            basic: showPayslip.basic_earned || 0,
            presentDays: showPayslip.present_days || 0,
            halfDays: showPayslip.half_days || 0,
            paidLeaves: showPayslip.paid_leave_days || 0,
            month: Number(showPayslip.month) || 3,
            year: Number(showPayslip.year) || 2026,
            hra: showPayslip.hra || 0,
            da: showPayslip.da || 0,
            bonus: showPayslip.bonus || 0,
            overtime: showPayslip.overtime || 0,
            incentive: showPayslip.incentive || 0,
            lopDays: showPayslip.lop_days || 0,
            unpaidLeaveDays: showPayslip.unpaid_leave_days || 0,
          }}
          salSettings={salarySettings}
          month={showPayslip.month}
          year={showPayslip.year}
          globalReimb={globalReimb}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18, paddingTop: 18, marginLeft: 6 }}>
        <div>
          <div className="pt" style={{ marginBottom: 0 }}>Payroll</div>
          <div className="ps">Salary processing · attendance-based calculation</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--br)', borderRadius: 10, padding: '8px 12px', background: '#fff', height: 36, minWidth: 150 }}>
            <Icon n="calendar" size={14} color="var(--t2)" />
            <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{month}</span>
            <select
              className="f-in f-sel"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            >
              {AVAILABLE_MONTHS.map(label => <option key={label} value={label}>{label}</option>)}
            </select>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: '#fff', color: '#334155', border: '1px solid #d1d5db', height: 36, padding: '0 12px' }}
            onClick={() => router.push('/superadmin/settings')}
          >
            <Icon n="settings" size={14} /> Salary Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginBottom: 20, marginLeft: 6 }}>
        <StatCard label="Total Gross" value={formatCurrency(totals.totalGross)} icon="currency" color="#0f766e" />
        <StatCard label="Net Payable" value={formatCurrency(totals.totalNet)} icon="check" color="#059669" />
        <StatCard label="Paid" value={formatCurrency(totals.totalPaid)} icon="bank" color="#1d4ed8" />
        <StatCard label="Reimb. Added" value={formatCurrency(totals.totalReimb)} icon="receipt" color="#0ea5e9" />
      </div>

      <div style={{ marginLeft: 6, marginBottom: 20, padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--br)', display: 'grid', gap: 12 }}>
        <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>Salary cycle settings</div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          <strong>Cycle:</strong> {salarySettingsWithDefaults.cycleStart}–{salarySettingsWithDefaults.cycleEnd} every month ·
          <strong style={{ marginLeft: 10 }}>Pay Date:</strong> {salarySettingsWithDefaults.payDay} of {salaryPayMonthLabel} ·
          <strong style={{ marginLeft: 10 }}>Period:</strong> {salaryPeriodLabel}
        </div>
        <div style={{ fontSize: 13, color: '#475569' }}>
          <strong>Weekly off:</strong> {salaryWeeklyOffCount} day{salaryWeeklyOffCount === 1 ? '' : 's'} ·
          <strong style={{ marginLeft: 10 }}>Paid holidays for {month}:</strong> {currentMonthHolidays} day{currentMonthHolidays === 1 ? '' : 's'}
        </div>
      </div>

      {error && <div style={{ marginBottom: 16, color: '#b91c1c' }}>{error}</div>}
      {loading && <div style={{ marginBottom: 16, color: 'var(--t2)' }}>Loading payroll data…</div>}

      <div className="cd" style={{ marginLeft: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Staff Payroll — {month}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.acc, background: `${t.acc}1a`, padding: '2px 10px', borderRadius: 6 }}>
              Cycle: {cycleLabel}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="btn btn-outline-secondary btn-sm"
              style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={fetchPayroll}
              disabled={loading}
            >
              <i className="fa fa-refresh"></i> {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="btn bs btn-sm" 
              style={{ fontSize: 11 }}
              onClick={() => {
                const rows = [['Employee', 'Designation', 'Basic Salary', 'Present', 'Absent', 'Reimbursement', 'Net Payable', 'Status']];
                staffPayrollRows.forEach(p => {
                  const staff = globalStaff.find(s => Number(s.id) === Number(p.employee_id));
                  const attendance = attendanceDataMap[p.employee_id] || {};
                  rows.push([
                    p.employee?.name || 'Unknown',
                    p.employee?.role || 'Employee',
                    p.employee?.basic_salary || 0,
                    attendance.present || 0,
                    attendance.absent || 0,
                    p.reimbursement_amount || 0,
                    p.net_payable || 0,
                    p.status?.toUpperCase() || 'PENDING'
                  ]);
                });
                const csv = rows.map(r => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payroll_${selectedBranch === 'all' ? 'all_branches' : (globalBranches.find(b => String(b.id) === String(selectedBranch))?.name || 'branch')}_${month.replace(' ', '_')}.csv`;
                a.click();
              }}
            >
              Export
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Salary</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Reimb. Added</th>
              <th>Net Payable</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staffPayrollRows.length > 0 ? staffPayrollRows.map(payroll => {
              const daysInMonth = getDaysInMonth(payroll.month, payroll.year);
              const isPlaceholder = !!payroll.placeholder;
              const isEditing = Number(payroll.employee_id) === Number(editingEmployeeId);
              
              // 1. Get Base Data: Either from DB (payroll record) OR Attendance Map
              const dbRecord = payroll; 
              const attendance = attendanceDataMap[payroll.employee_id] || {};
              
              const { startDate, endDate } = getCycleRange(month, cycleStartDay);
              const startLocal = parseDate(startDate);
              const endLocal = parseDate(endDate);
              const actualCycleDays = Math.round((endLocal.getTime() - startLocal.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              
              const staffMember = globalStaff.find(s => Number(s.id) === Number(payroll.employee_id));
              const joiningDateRaw = staffMember?.date_of_joining || staffMember?.joiningDate;
              const joiningDate = parseDate(joiningDateRaw);

              let effectiveTotalCycleDays = actualCycleDays;
              if (joiningDate && joiningDate > startLocal && joiningDate <= endLocal) {
                effectiveTotalCycleDays = Math.round((endLocal.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              }
              
              // 2. Determine Display Values
              // If it's a real DB record, we prioritize DB values.
              // If it's a placeholder (not in DB yet), we use attendance calculations.
              
              let displayPresent = Number(dbRecord.present_days) || 0;
              let displayHoliday = Number(dbRecord.paid_holiday_days) || 0;
              let displayWeekOff = Number(dbRecord.week_off_days) || 0;
              let displayHalfDays = Number(dbRecord.half_days) || 0;
              let displayPaidLeave = Number(dbRecord.paid_leave_days) || 0;
              let displayUnpaidLeave = Number(dbRecord.unpaid_leave_days) || 0;
              let displayAbsent = Number(dbRecord.absent_days) || 0;

              if (isPlaceholder) {
                displayPresent = attendance.present || 0;
                displayHoliday = attendance.holiday || 0;
                displayWeekOff = attendance.weekOff || 0;
                displayHalfDays = attendance.halfDays || 0;
                displayPaidLeave = attendance.paidLeave || 0;
                displayUnpaidLeave = attendance.unpaidLeave || 0;
                
                const totalPaidDaysInRow = displayPresent + displayHoliday + displayWeekOff + (displayHalfDays * 0.5) + displayPaidLeave;
                displayAbsent = Math.max(0, effectiveTotalCycleDays - totalPaidDaysInRow - displayUnpaidLeave);
              }
              
              let displayNetPayable = Number(dbRecord.net_payable) || 0;
              let displayReimb = Number(dbRecord.reimbursement_amount) || 0;
              
              const totalCycleDaysForCalc = salarySettingsWithDefaults.periodType === 'fixed' ? Number(salarySettingsWithDefaults.fixedDays || 26) : actualCycleDays;

              // Dynamic preview for editing
              const totalPaidDays = isEditing ? (
                Number(editData.present_days || 0) + 
                Number(editData.holiday_days || 0) + 
                Number(editData.week_off_days || 0) +
                (Number(editData.half_days || 0) * 0.5) +
                (Number(editData.paid_leave_days || 0) * 1.0)
              ) : 0;
              const earnedBasic = isEditing ? Math.round((Number(editData.full_basic || 0) / totalCycleDaysForCalc) * totalPaidDays) : 0;
              
              const previewGross = isEditing ? (
                earnedBasic +
                Number(editData.hra || 0) +
                Number(editData.da || 0) +
                Number(editData.bonus || 0) +
                Number(editData.overtime || 0) +
                Number(editData.incentive || 0)
              ) : 0;
              const previewNet = previewGross + Number(editData.reimbursement_amount || 0);

              return (
                <React.Fragment key={payroll.id}>
                  <tr>
                    <td>
                      <div className="av-row">
                      <Av name={payroll.employee?.name || 'Unknown'} size={26} r={7} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 11 }}>{payroll.employee?.name || 'Unknown'}</div>
                        <div style={{ fontSize: 9, color: 'var(--t2)' }}>{payroll.employee?.role || 'Employee'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{formatCurrency(Number(payroll.employee?.basic_salary || 0))}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{displayPresent}</div>
                    <div style={{ fontSize: 9, color: 'var(--t3)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span>/{effectiveTotalCycleDays}d</span>
                      {displayHoliday > 0 && <span style={{ color: '#059669' }}>H: {displayHoliday}</span>}
                      {displayHalfDays > 0 && <span style={{ color: '#0284c7' }}>HD: {displayHalfDays}</span>}
                      {displayPaidLeave > 0 && <span style={{ color: '#7c3aed' }}>PL: {displayPaidLeave}</span>}
                      {displayUnpaidLeave > 0 && <span style={{ color: '#ea580c' }}>UL: {displayUnpaidLeave}</span>}
                    </div>
                  </td>
                  <td style={{ color: '#dc2626', fontWeight: 700 }}>{displayAbsent}d</td>
                  <td>{formatCurrency(displayReimb)}</td>
                  <td style={{ fontWeight: 800 }}>{formatCurrency(displayNetPayable)}</td>
                  <td>
                    <span className={`bg ${payroll.status?.toLowerCase() === 'paid' ? 'bg-appr' : 'bg-pend'}`} style={{ fontSize: 9 }}>
                      {payroll.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        className="btn bs btn-sm"
                        style={{ fontSize: 10 }}
                        onClick={() => isEditing ? handleCloseEdit() : handleOpenEdit(payroll)}
                      >
                        {isEditing ? 'Close' : 'Edit'}
                      </button>
                      {(payroll.status?.toLowerCase() !== 'paid' || isEditing) ? (
                        <button
                          className="btn btn-sm"
                          style={{ background: t.acc, color: '#fff', fontSize: 10 }}
                          onClick={() => handleMarkPaid(payroll)}
                          disabled={marking === payroll.id || marking === payroll.employee_id}
                        >
                          {marking === payroll.id || marking === payroll.employee_id ? 'Marking…' : 'Pay'}
                        </button>
                      ) : (
                        <button className="btn bs btn-sm" style={{ fontSize: 10 }} disabled>
                          Paid
                        </button>
                      )}
                      <button
                        className="btn bs btn-sm"
                        style={{ fontSize: 10 }}
                        onClick={() => !isPlaceholder && setShowPayslip(payroll)}
                        disabled={isPlaceholder}
                      >
                        Slip
                      </button>
                    </div>
                  </td>
                </tr>
                {isEditing && (
                  <tr>
                    <td colSpan={8} style={{ background: '#f8fafc', padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, alignItems: 'end' }}>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Basic Salary
                          <input
                            type="number"
                            value={editData.full_basic}
                            onChange={e => setEditData(prev => ({ ...prev, full_basic: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          HRA
                          <input
                            type="number"
                            value={editData.hra}
                            onChange={e => setEditData(prev => ({ ...prev, hra: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          DA
                          <input
                            type="number"
                            value={editData.da}
                            onChange={e => setEditData(prev => ({ ...prev, da: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Bonus
                          <input
                            type="number"
                            value={editData.bonus}
                            onChange={e => setEditData(prev => ({ ...prev, bonus: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Overtime
                          <input
                            type="number"
                            value={editData.overtime}
                            onChange={e => setEditData(prev => ({ ...prev, overtime: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Incentive
                          <input
                            type="number"
                            value={editData.incentive}
                            onChange={e => setEditData(prev => ({ ...prev, incentive: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Present Days
                          <input
                            type="number"
                            value={editData.present_days}
                            onChange={e => setEditData(prev => ({ ...prev, present_days: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Absent Days
                          <input
                            type="number"
                            value={editData.absent_days}
                            onChange={e => setEditData(prev => ({ ...prev, absent_days: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Holiday Days
                          <input
                            type="number"
                            value={editData.holiday_days}
                            onChange={e => setEditData(prev => ({ ...prev, holiday_days: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Week Off Days
                          <input
                            type="number"
                            value={editData.week_off_days}
                            onChange={e => setEditData(prev => ({ ...prev, week_off_days: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Half Days
                          <input
                            type="number"
                            value={editData.half_days}
                            onChange={e => setEditData(prev => ({ ...prev, half_days: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Paid Leaves
                          <input
                            type="number"
                            value={editData.paid_leave_days}
                            onChange={e => setEditData(prev => ({ ...prev, paid_leave_days: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Unpaid Leaves
                          <input
                            type="number"
                            value={editData.unpaid_leave_days}
                            onChange={e => setEditData(prev => ({ ...prev, unpaid_leave_days: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ display: 'grid', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                          Reimbursement
                          <input
                            type="number"
                            value={editData.reimbursement_amount}
                            onChange={e => setEditData(prev => ({ ...prev, reimbursement_amount: e.target.value }))}
                            className="f-in"
                            style={{ width: '100%' }}
                          />
                        </label>
                      </div>
                      <div style={{ borderTop: '1px solid #dbeafe', marginTop: 16, paddingTop: 14, color: 'var(--t2)' }}>
                        <div style={{ fontSize: 12, marginBottom: 6 }}>
                          Paid Days: {Number(editData.present_days || 0)} (Present) + {Number(editData.holiday_days || 0)} (Holiday) + {Number(editData.week_off_days || 0)} (Week Off) + {Number(editData.half_days || 0) * 0.5} (Half Day) + {Number(editData.paid_leave_days || 0)} (Paid Leave) = <strong>{totalPaidDays} days</strong>
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 6 }}>
                          Total Breakdown: {totalPaidDays} (Paid) + {Number(editData.unpaid_leave_days || 0)} (Unpaid Leave) + {Math.max(0, Number(effectiveTotalCycleDays) - totalPaidDays - Number(editData.unpaid_leave_days || 0))} (Absent) = <strong>{effectiveTotalCycleDays} days</strong>
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 6 }}>
                          Preview: Earned Basic {formatCurrency(earnedBasic)} + HRA {formatCurrency(Number(editData.hra || 0))} + DA {formatCurrency(Number(editData.da || 0))} + Bonus {formatCurrency(Number(editData.bonus || 0))} + OT {formatCurrency(Number(editData.overtime || 0))} + Incentive {formatCurrency(Number(editData.incentive || 0))} = {formatCurrency(previewGross)} + Reimb {formatCurrency(Number(editData.reimbursement_amount || 0))} = <strong>{formatCurrency(previewNet)}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                        <button className="btn bs btn-sm" onClick={handleCloseEdit}>
                          Close
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: t.acc, color: '#fff' }}
                          onClick={handleSaveEdit}
                        >
                          Save Changes
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '28px 0', color: 'var(--t2)' }}>
                  No employees found for {month}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 10px 30px rgba(15,23,42,0.04)', minHeight: 120 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      </div>
      <div style={{ width: 34, height: 34, borderRadius: 12, background: `${color}1a`, display: 'grid', placeItems: 'center' }}>
        <Icon n={icon} size={16} color={color} />
      </div>
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{value}</div>
  </div>
);

export default SuperAdminPayroll;
