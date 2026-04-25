
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout';
import Icon from '../../components/shared/Icon';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const normalizeWeekOffDays = (weekOffDays, departmentName) => {
  if (Array.isArray(weekOffDays) && weekOffDays.length > 0) {
    return weekOffDays.map(day => Number(day));
  }
  return [];
};

const getCycleLabel = (month, year, cycleStartDay) => {
  if (cycleStartDay === 1) {
    const lastDay = new Date(year, month, 0).getDate();
    return `01 ${MONTH_NAMES[month - 1]} – ${lastDay} ${MONTH_NAMES[month - 1]} ${year}`;
  }
  const endMonth = month;
  const endDay = cycleStartDay - 1;
  const startMonth = month === 1 ? 12 : month - 1;
  const startYear = month === 1 ? year - 1 : year;
  const startDay = cycleStartDay;
  const startMonthName = MONTH_NAMES[startMonth - 1].substring(0, 3);
  const endMonthName = MONTH_NAMES[endMonth - 1].substring(0, 3);
  return `${startDay} ${startMonthName} ${startYear} – ${endDay} ${endMonthName} ${year}`;
};

const EmployeeAttendance = () => {
  const { user, globalLeaves, yearlyHolidays, salarySettings, refreshSettings, refreshTrigger } = useAppContext();
  const t = THEME.employee;
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (refreshSettings) refreshSettings();
  }, []);

  // Debug log to see settings
  useEffect(() => {
    console.log('EmployeeAttendance: Current salarySettings from context:', salarySettings);
  }, [salarySettings]);

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  
  // Force full month view (1st to end of month) as requested for frontend
  const cycleStartDay = 1; 
  const currentCycleLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;
  const isFutureMonth = selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const monthNumber = selectedMonth + 1;
      const year = selectedYear;
      
      let url = `${API_BASE}/attendance/my?month=${monthNumber}&year=${year}`;
      
      if (cycleStartDay !== 1) {
        const endMonth = monthNumber;
        const endDay = cycleStartDay - 1;
        const startMonth = monthNumber === 1 ? 12 : monthNumber - 1;
        const startYear = monthNumber === 1 ? year - 1 : year;
        const startDay = cycleStartDay;
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        const endDate = `${year}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        url = `${API_BASE}/attendance/summary?employeeId=${user?.id}&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRecords(data?.days || []);
        setSummary(data?.summary || data || null);
      }
    } catch (e) {
      console.error('Error fetching attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log('EmployeeAttendance: Fetching data due to refreshTrigger or date change');
      fetchAttendance();
    }
  }, [selectedMonth, selectedYear, user?.id, refreshTrigger]);

  const changeMonth = (delta) => {
    const next = new Date(selectedYear, selectedMonth + delta, 1);
    setSelectedDate(next);
  };

  const getCycleDays = () => {
    if (cycleStartDay === 1) {
      return Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(selectedYear, selectedMonth, i + 1);
        return { date: d, day: i + 1, month: selectedMonth, year: selectedYear };
      });
    }

    const endMonth = selectedMonth;
    const endYear = selectedYear;
    const endDay = cycleStartDay - 1;
    const startMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const startYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const startDay = cycleStartDay;

    const days = [];
    const daysInPrevMonth = new Date(startYear, startMonth + 1, 0).getDate();
    for (let d = startDay; d <= daysInPrevMonth; d++) {
      days.push({ date: new Date(startYear, startMonth, d), day: d, month: startMonth, year: startYear });
    }
    for (let d = 1; d <= endDay; d++) {
      days.push({ date: new Date(endYear, endMonth, d), day: d, month: endMonth, year: endYear });
    }
    return days;
  };

  const attendanceDays = getCycleDays().map(item => {
    const record = Array.isArray(records) ? records.find(r => {
      if (r.date) {
        const d = new Date(r.date);
        return d.getDate() === item.day && d.getMonth() === item.month && d.getFullYear() === item.year;
      }
      return r.day === item.day && (r.month === item.month + 1 || !r.month);
    }) : null;

    let status = null;
    const joiningDate = user?.date_of_joining ? new Date(user.date_of_joining) : null;
    if (joiningDate) joiningDate.setHours(0, 0, 0, 0);
    const currentItemDate = new Date(item.date);
    currentItemDate.setHours(0, 0, 0, 0);

    if (joiningDate && currentItemDate < joiningDate) {
      status = 'PRE JOINING';
    } else if (record && record.status) {
      const s = String(record.status).toLowerCase();
      switch (s) {
        case 'present':
          status = 'PRESENT';
          break;
        case 'half_day':
        case 'half day':
          status = 'HALF DAY';
          break;
        case 'absent':
        case 'absent_pending':
          status = 'ABSENT';
          break;
        case 'week_off':
        case 'week off':
          status = 'WEEK OFF';
          break;
        case 'holiday':
          status = 'HOLIDAY';
          break;
        case 'paid_leave':
        case 'paid':
          status = 'PAID LEAVE';
          break;
        case 'unpaid_leave':
        case 'unpaid':
        case 'lop':
          status = 'UNPAID LEAVE';
          break;
        case 'pre_joining':
          status = 'PRE JOINING';
          break;
        default:
          status = null; // Or a default status if needed
      }
    }
    
    return { ...item, status };
  });

  const firstDayOfWeek = attendanceDays.length > 0 ? attendanceDays[0].date.getDay() : 0;

  const totals = summary ? {
    present: summary.present || 0,
    absent: summary.absent || 0,
    halfDay: summary.halfDay || 0,
    halfDayLeave: summary.halfDayLeave || 0,
    paidLeave: summary.paidLeave || 0,
    unpaidLeave: summary.unpaidLeave || 0,
    weekOff: summary.weekOff || 0,
    holiday: summary.holiday || 0
  } : { present: 0, absent: 0, halfDay: 0, halfDayLeave: 0, paidLeave: 0, unpaidLeave: 0, weekOff: 0, holiday: 0 };

  const downloadAttendanceReport = () => {
    const headers = ['Day', 'Date', 'Status'];
    const rows = attendanceDays.map(item => {
      const dateStr = `${String(item.day).padStart(2, '0')} ${MONTH_NAMES[item.month]} ${item.year}`;
      return [item.day, dateStr, item.status || 'N/A'];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${MONTH_NAMES[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusStyle = (status) => {
    if (!status || status === 'PRE JOINING') return { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' };
    switch (status) {
      case 'PRESENT': return { background: '#f0fdf4', border: '1.5px solid #bcf0da', color: '#16a34a' };
      case 'ABSENT': return { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#ef4444' };
      case 'HALF DAY': return { background: '#fffbeb', border: '1.5px solid #fde68a', color: '#f59e0b' };
      case 'PAID LEAVE': return { background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#3b82f6' };
      case 'UNPAID LEAVE': return { background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#475569' };
      case 'WEEK OFF': return { background: '#f5f3ff', border: '1.5px solid #ddd6fe', color: '#6366f1' };
      case 'HOLIDAY': return { background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#f97316' };
      default: return { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' };
    }
  };

  return (
    <EmployeeLayout title="My Attendance">
      <style jsx>{`
        .attendance-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 25px; }
        .attendance-calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 15px; margin-bottom: 30px; }
        .calendar-day-card { height: 110px; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; text-align: center; transition: all 0.2s; }
        .calendar-empty-cell { height: 110px; border-radius: 24px; background: #111827; opacity: 0.05; }
        .day-number { font-size: 20px; font-weight: 900; color: #1e293b; line-height: 1; }
        .day-month, .day-year { font-size: 10px; font-weight: 700; color: #94a3b8; }
        .day-status { margin-top: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
        .month-filter-pill { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 30px; background: #fff; padding: 0 8px; height: 56px; border-radius: 100px; border: 1px solid #e2e8f0; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .month-selection { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 800; color: #1e293b; justify-content: center; flex: 1; }
        @media (max-width: 1024px) {
          .attendance-summary-grid { grid-template-columns: repeat(3, 1fr); }
          .calendar-day-card, .calendar-empty-cell { aspect-ratio: 1 / 1; height: auto; border-radius: 16px; padding: 8px; }
          .day-number { font-size: 18px; line-height: 1.1; }
          .day-month, .day-year { font-size: 9px; }
          .day-status { margin-top: 6px; font-size: 9px; }
        }
        @media (max-width: 768px) {
          .attendance-calendar-grid { gap: 6px; }
          .calendar-day-card, .calendar-empty-cell { border-radius: 12px; padding: 4px; }
          .day-number { font-size: 14px; }
          .day-status { font-size: 7px; margin-top: 4px; }
        }
        @media (max-width: 480px) {
          .attendance-summary-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .attendance-calendar-grid { gap: 4px; }
          .calendar-day-card, .calendar-empty-cell { border-radius: 8px; padding: 2px; }
          .day-number { font-size: 12px; }
          .day-month, .day-year { display: none; }
          .day-status { font-size: 6px; margin-top: 2px; }
          .month-filter-pill { height: 48px; }
          .month-filter-pill select { font-size: 14px !important; }
        }
      `}</style>

      <div className="ph" style={{ marginBottom: 25 }}>
        <div>
          <div className="pt" style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Attendance Calendar</div>
          <div className="ps" style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span>Track your daily presence</span>
            <div style={{ 
              background: '#f1f5f9', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, color: '#1e293b',
              border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              <Icon n="calendar" size={14} color="#10b981"/>
              <span>Month: {currentCycleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="attendance-summary-grid">
        {[
          { l: 'Present', v: totals.present, c: '#10b981' },
          { l: 'Absent', v: totals.absent, c: '#ef4444' },
          { l: 'Half Day', v: totals.halfDay, c: '#f59e0b' },
          { l: 'Paid Leave', v: totals.paidLeave, c: '#3b82f6' },
          { l: 'Unpaid Leave', v: totals.unpaidLeave, c: '#475569' },
          { l: 'Week Off', v: totals.weekOff, c: '#6366f1' },
          { l: 'Holiday', v: totals.holiday, c: '#f97316' }
        ].map((s) => (
          <div key={s.l} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="month-filter-pill">
        <button className="ib" onClick={() => changeMonth(-1)} style={{ width: 42, height: 42, borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon n="chevron_left" size={16} color="#1e293b"/>
        </button>
        <div className="month-selection">
          <Icon n="calendar" size={18} color="#64748b"/>
          <select 
            value={`${selectedMonth}-${selectedYear}`}
            onChange={(e) => {
              const [m, y] = e.target.value.split('-').map(Number);
              setSelectedDate(new Date(y, m, 1));
            }}
            style={{ border: 'none', background: 'transparent', fontSize: 16, fontWeight: 800, color: '#1e293b', outline: 'none', cursor: 'pointer', padding: '0 5px' }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date(currentYear, currentMonth - 6 + i, 1);
              const m = d.getMonth();
              const y = d.getFullYear();
              return <option key={`${m}-${y}`} value={`${m}-${y}`}>{MONTH_NAMES[m]} {y}</option>;
            })}
          </select>
        </div>
        <button className="ib" onClick={() => changeMonth(1)} style={{ width: 42, height: 42, borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon n="chevron_right" size={16} color="#1e293b"/>
        </button>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: 24, border: '1px solid #e2e8f0' }}>
        <div className="attendance-calendar-grid">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#cbd5e1', letterSpacing: 1, paddingBottom: 10 }}>{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }, (_, index) => (
            <div key={`empty-${index}`} className="calendar-empty-cell"></div>
          ))}
          {attendanceDays.map((item, idx) => (
            <div key={`${item.day}-${item.month}-${idx}`} className="calendar-day-card" style={statusStyle(item.status)}>
              <div className="day-number">{String(item.day).padStart(2, '0')}</div>
              <div className="day-month">{MONTH_NAMES[item.month]}</div>
              <div className="day-year">{item.year}</div>
              {item.status && item.status !== 'PRE JOINING' && <div className="day-status" style={{ color: statusStyle(item.status).color }}>{item.status}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
          <button className="btn" style={{ background: '#1e293b', color: '#fff', padding: '12px 30px', borderRadius: 14, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)', width: '100%', maxWidth: '300px', justifyContent: 'center' }} onClick={downloadAttendanceReport}>
            <Icon n="download" size={16} color="#fff" />
            Download Report
          </button>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeAttendance;
