import React, { useState, useEffect } from 'react';
import Icon from '../shared/Icon';
import { THEME, API_BASE, DEFAULT_SALARY_SETTINGS } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AttendanceDetails = ({ emp, onBack, accentColor, flat = false, showClose = true }) => {
  const { salarySettings, user: currentUser, triggerRefresh } = useAppContext();
  const employee = emp || {};
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [attendanceData, setAttendanceData] = useState({ days: [], summary: {} });
  const [cycleAttendanceSummary, setCycleAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCycleSummary, setLoadingCycleSummary] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Edit Attendance States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    punchInTime: null,
    punchOutTime: null,
    note: '',
    editReason: 'Admin Edit'
  });
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'hr';
  const t = accentColor || 'var(--teal)';

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const padTwo = (value) => String(value).padStart(2, '0');
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const getCycleRange = (month, year, cycleStartDay) => {
    if (cycleStartDay === 1) {
      return {
        startDate: `${year}-${padTwo(month)}-01`,
        endDate: `${year}-${padTwo(month)}-${getDaysInMonth(month, year)}`,
      };
    }

    const startMonth = month === 1 ? 12 : month - 1;
    const startYear = month === 1 ? year - 1 : year;
    const endMonth = month;
    const endYear = year;
    const endDay = cycleStartDay - 1;

    return {
      startDate: `${startYear}-${padTwo(startMonth)}-${padTwo(cycleStartDay)}`,
      endDate: `${endYear}-${padTwo(endMonth)}-${padTwo(endDay)}`,
    };
  };

  const fetchAttendance = async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendance/employee/${employee.id}?month=${selectedMonth + 1}&year=${selectedYear}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    loadCycleSummary();
  }, [employee.id, selectedMonth, selectedYear, salarySettings?.cycleStart]);

  const changeMonth = (delta) => {
    setSelectedDate(new Date(selectedYear, selectedMonth + delta, 1));
  };

  const loadCycleSummary = async () => {
    if (!employee?.id) return;
    setLoadingCycleSummary(true);
    try {
      const cycleStartDay = salarySettings?.cycleStart || DEFAULT_SALARY_SETTINGS.cycleStart;
      const { startDate, endDate } = getCycleRange(selectedMonth + 1, selectedYear, cycleStartDay);
      const res = await fetch(`${API_BASE}/attendance/summary?employeeId=${employee.id}&startDate=${startDate}&endDate=${endDate}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCycleAttendanceSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch cycle attendance summary', err);
    } finally {
      setLoadingCycleSummary(false);
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const formatDateWithOrdinal = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    return `${String(day).padStart(2, '0')}${getOrdinalSuffix(day)} ${MONTH_NAMES[d.getMonth()]}`;
  };

  const handleEditDay = (day) => {
    setSelectedDay(day);
    if (isSuperAdmin) {
      setIsEditing(true);
      
      // Normalize status for the edit form buttons
      let initialStatus = String(day.status || 'absent').toLowerCase();
      if (initialStatus.includes('absent')) initialStatus = 'absent';
      if (initialStatus === 'paid') initialStatus = 'paid_leave';
      if (initialStatus === 'unpaid' || initialStatus === 'lop') initialStatus = 'unpaid_leave';
      if (initialStatus === 'half_day_leave') initialStatus = 'paid_leave'; // Map to paid_leave if half_day_leave is removed

      setEditForm({
        status: initialStatus,
        punchInTime: day.punchIn,
        punchOutTime: day.punchOut,
        note: day.note || '',
        editReason: 'Admin Edit'
      });
    }
  };

  const handleStatusChange = (newStatus) => {
    setEditForm(prev => {
      const isWorkingStatus = ['present', 'half_day'].includes(newStatus);
      return {
        ...prev,
        status: newStatus,
        punchInTime: isWorkingStatus ? prev.punchInTime : null,
        punchOutTime: isWorkingStatus ? prev.punchOutTime : null
      };
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedDay || !employee?.id) return;
    setSaving(true);
    try {
      const dateStr = selectedDay.date;
      const res = await fetch(`${API_BASE}/attendance/employee/${employee.id}/date/${dateStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
        credentials: 'include'
      });

      if (res.ok) {
        setIsEditing(false);
        setSelectedDay(null);
        fetchAttendance();
        loadCycleSummary();
        triggerRefresh();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save attendance');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'present') return '#22c55e';
    if (s.includes('absent')) return '#ef4444';
    if (s === 'half_day') return '#f59e0b';
    if (s === 'half_day_leave') return '#60a5fa';
    if (s === 'week_off') return '#6366f1';
    if (s === 'holiday') return '#a855f7';
    if (s.includes('paid_leave') || s === 'paid') return '#3b82f6';
    if (s.includes('unpaid_leave') || s === 'unpaid' || s === 'lop') return '#475569';
    if (s === 'pre_joining') return 'transparent';
    return '#94a3b8';
  };

  const getStatusLabel = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'present') return 'PRESENT';
    if (s.includes('absent')) return 'ABSENT';
    if (s === 'half_day') return 'HALF DAY';
    if (s === 'half_day_leave') return 'HALF DAY LEAVE';
    if (s === 'week_off') return 'WEEK OFF';
    if (s === 'holiday') return 'HOLIDAY';
    if (s.includes('paid_leave') || s === 'paid') return 'PAID LEAVE';
    if (s.includes('unpaid_leave') || s === 'unpaid' || s === 'lop') return 'UNPAID LEAVE';
    if (s === 'pre_joining') return '';
    return status || 'N/A';
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTotalWorkingHours = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) return '0h 0m';
    const diff = new Date(punchOut) - new Date(punchIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const downloadReport = () => {
    const headers = ['Date', 'Status', 'Punch In', 'Punch Out', 'Working Hours', 'Note'];
    const rows = attendanceData.days.map(day => [
      day.date,
      getStatusLabel(day.status),
      formatTime(day.punchIn),
      formatTime(day.punchOut),
      day.workingHours || '0',
      day.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_${employee.name}_${MONTH_NAMES[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayData = attendanceData.days.find(d => d.day === i) || { day: i, status: 'N/A' };
    
    // Check if date is before joining date
    const joiningDateRaw = employee.date_of_joining || employee.joiningDate;
    if (joiningDateRaw) {
      const joiningDate = new Date(joiningDateRaw);
      joiningDate.setHours(0, 0, 0, 0);
      const currentDate = new Date(selectedYear, selectedMonth, i);
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate < joiningDate) {
        dayData.status = 'pre_joining';
        // Ensure no punch data is shown even if it exists
        dayData.punchIn = null;
        dayData.punchOut = null;
        dayData.workingHours = null;
        dayData.note = null;
      }
    }
    
    calendarDays.push(dayData);
  }

  return (
    <div className={flat ? '' : 'cd'} style={{ padding: '24px 28px' }}>
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => changeMonth(-1)} className="ib" style={{ background: 'var(--s2)', borderRadius: 10 }}><Icon n="chevron_left" size={16} /></button>
          <div style={{ fontSize: 18, fontWeight: 800, minWidth: 160, textAlign: 'center' }}>
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </div>
          <button onClick={() => changeMonth(1)} className="ib" style={{ background: 'var(--s2)', borderRadius: 10 }}><Icon n="chevron_right" size={16} /></button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn bs" onClick={downloadReport} style={{ padding: '10px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon n="download" size={16} /> Export Report
          </button>
          {showClose && (
            <button className="ib" onClick={onBack} style={{ background: 'var(--s2)', borderRadius: 10 }}><Icon n="x" size={16} color="var(--t2)"/></button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--t3)', fontWeight: 600 }}>
        {(() => {
          const cycleStartDay = salarySettings?.cycleStart || DEFAULT_SALARY_SETTINGS.cycleStart;
          if (cycleStartDay === 1) return `Summary for ${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
          const { startDate, endDate } = getCycleRange(selectedMonth + 1, selectedYear, cycleStartDay);
          return `Summary for Cycle: ${new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
        })()}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 32 }}>
        {(() => {
          const cycleStartDay = salarySettings?.cycleStart || DEFAULT_SALARY_SETTINGS.cycleStart;
          const usesCycleAttendance = cycleStartDay !== 1 && cycleAttendanceSummary;
          const summary = usesCycleAttendance ? cycleAttendanceSummary : attendanceData.summary;
          return [
            { label: 'Present', value: summary?.present || 0, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
            { label: 'Absent', value: summary?.absent || 0, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
            { label: 'Half Day', value: summary?.halfDay || 0, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
            { label: 'Paid Leave', value: summary?.paidLeave || 0, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
            { label: 'Unpaid Leave', value: summary?.unpaidLeave || 0, color: '#475569', bg: 'rgba(71, 85, 105, 0.08)' },
            { label: 'Week Off', value: summary?.weekOff || 0, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
            { label: 'Holidays', value: summary?.holiday || 0, color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' }
          ];
        })().map(stat => (
          <div key={stat.label} style={{ padding: '16px 12px', borderRadius: 18, background: stat.bg, textAlign: 'center', border: `1px solid ${stat.color}20` }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 12 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--t3)', paddingBottom: 8 }}>{d.toUpperCase()}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const color = getStatusColor(day.status);
          const isToday = today.getDate() === day.day && today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

          return (
            <div
              key={day.day}
              onClick={() => day.status !== 'pre_joining' && handleEditDay(day)}
              style={{
                aspectRatio: '1/1',
                padding: 8,
                borderRadius: 14,
                border: `2px solid ${isToday ? 'var(--t1)' : color + '30'}`,
                background: day.status === 'pre_joining' ? 'var(--s1)' : color + '15',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: day.status === 'pre_joining' ? 'default' : 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                opacity: day.status === 'pre_joining' ? 0.5 : 1
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: isToday ? 'var(--t1)' : 'var(--t2)' }}>{day.day}</div>
                {day.status !== 'pre_joining' && (
                  <>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 4, opacity: color === 'transparent' ? 0 : 1 }} />
                    {day.status !== 'N/A' && (
                      <div style={{ fontSize: 8, fontWeight: 800, color: color, marginTop: 2, textTransform: 'uppercase' }}>
                        {getStatusLabel(day.status)}
                      </div>
                    )}
                  </>
                )}
              </div>
          );
        })}
      </div>

      {/* Daily Detail / Edit Modal */}
      {selectedDay && (
        <div className="modal-ov" onClick={() => { setSelectedDay(null); setIsEditing(false); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, borderRadius: 24 }}>
            <div className="modal-head" style={{ padding: '20px 24px', borderBottom: '1px solid var(--br)' }}>
              <div>
                <div className="modal-title" style={{ fontSize: 18, fontWeight: 800 }}>
                  {formatDateWithOrdinal(selectedDay.date)} — {isEditing ? 'Edit Attendance' : 'Attendance Details'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, marginTop: 2 }}>{employee.employee_id || `EMP${employee.id}`}</div>
              </div>
              <button className="ib" onClick={() => { setSelectedDay(null); setIsEditing(false); }}><Icon n="x" size={20} /></button>
            </div>

            <div style={{ padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
              {isEditing ? (
                <div style={{ display: 'grid', gap: 24 }}>
                  {/* Attendance Status */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>Attendance Status</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {[
                        { id: 'present', label: 'PRESENT' },
                        { id: 'absent', label: 'ABSENT' },
                        { id: 'half_day', label: 'HALF DAY' },
                        { id: 'week_off', label: 'WEEK OFF' },
                        { id: 'holiday', label: 'HOLIDAY' }
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleStatusChange(s.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            border: `2px solid ${editForm.status === s.id ? getStatusColor(s.id) : 'var(--br)'}`,
                            background: editForm.status === s.id ? getStatusColor(s.id) : 'white',
                            color: editForm.status === s.id ? 'white' : 'var(--t2)',
                            boxShadow: editForm.status === s.id ? `0 4px 12px ${getStatusColor(s.id)}40` : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Leave Type */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>Leave Type</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {[
                        { id: 'paid_leave', label: 'PAID LEAVE' },
                        { id: 'unpaid_leave', label: 'UNPAID LEAVE' }
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleStatusChange(s.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            border: `2px solid ${editForm.status === s.id ? getStatusColor(s.id) : 'var(--br)'}`,
                            background: editForm.status === s.id ? getStatusColor(s.id) : 'white',
                            color: editForm.status === s.id ? 'white' : 'var(--t2)',
                            boxShadow: editForm.status === s.id ? `0 4px 12px ${getStatusColor(s.id)}40` : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Punch Details */}
                  <div style={{ background: 'var(--s1)', padding: 20, borderRadius: 20, border: '1px solid var(--br)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--blu)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>
                        {employee.name ? employee.name.charAt(0) : 'E'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>{formatTime(editForm.punchInTime) || '--:--'}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>
                            <span style={{ color: '#10b981', marginRight: 4 }}>• In</span> FULL DAY SHIFT
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>{formatTime(editForm.punchOutTime) || '--:--'}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>
                            <span style={{ color: '#ef4444', marginRight: 4 }}>• Out</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button 
                        onClick={() => setEditForm({ ...editForm, punchInTime: null })}
                        style={{ padding: '10px', borderRadius: 12, border: '1px solid var(--br)', background: 'white', fontSize: 11, fontWeight: 700, color: 'var(--blu)' }}
                      >
                        REMOVE PUNCH IN
                      </button>
                      <button 
                        onClick={() => setEditForm({ ...editForm, punchOutTime: null })}
                        style={{ padding: '10px', borderRadius: 12, border: '1px solid var(--br)', background: 'white', fontSize: 11, fontWeight: 700, color: 'var(--blu)' }}
                      >
                        REMOVE PUNCH OUT
                      </button>
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <textarea
                      placeholder="Add Note..."
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: 16,
                        border: '1.5px solid var(--br)',
                        minHeight: 100,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--t1)',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                    <button
                      className="btn bs"
                      onClick={() => { setSelectedDay(null); setIsEditing(false); }}
                      style={{ padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 800 }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn"
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      style={{ padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 800, background: '#10b981', color: 'white' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 14, color: 'var(--t3)', fontWeight: 600 }}>{new Date(selectedDay.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div style={{ 
                      display: 'inline-block', 
                      marginTop: 12, 
                      padding: '6px 16px', 
                      borderRadius: 20, 
                      background: getStatusColor(selectedDay.status) + '15', 
                      color: getStatusColor(selectedDay.status),
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      {getStatusLabel(selectedDay.status)}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div style={{ padding: 16, borderRadius: 16, background: 'var(--s2)', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Punch In</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{formatTime(selectedDay.punchIn)}</div>
                    </div>
                    <div style={{ padding: 16, borderRadius: 16, background: 'var(--s2)', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Punch Out</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{formatTime(selectedDay.punchOut)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--br)' }}>
                      <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>Total Working Hours</span>
                      <span style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 800 }}>{selectedDay.workingHours || '0'} hrs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--br)' }}>
                      <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>Late Mark</span>
                      <span style={{ fontSize: 13, color: selectedDay.isLate ? '#ef4444' : '#10b981', fontWeight: 800 }}>{selectedDay.isLate ? 'Yes' : 'No'}</span>
                    </div>
                    {selectedDay.note && (
                      <div style={{ padding: '12px 0' }}>
                        <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Note</div>
                        <div style={{ fontSize: 13, color: 'var(--t1)', background: 'var(--s2)', padding: 12, borderRadius: 12 }}>{selectedDay.note}</div>
                      </div>
                    )}
                  </div>

                  <button className="btn btn-full" onClick={() => setSelectedDay(null)} style={{ marginTop: 24, background: t, color: '#fff' }}>Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 32, padding: 16, background: 'var(--s2)', borderRadius: 16 }}>
        {[
          { label: 'Present', color: '#10b981' },
          { label: 'Absent', color: '#ef4444' },
          { label: 'Half Day', color: '#f59e0b' },
          { label: 'Paid Leave', color: '#3b82f6' },
          { label: 'Unpaid Leave', color: '#475569' },
          { label: 'Week Off', color: '#8b5cf6' },
          { label: 'Holiday', color: '#f97316' }
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceDetails;
