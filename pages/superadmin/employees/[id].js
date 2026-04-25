import React, { useState, useEffect, Component } from "react";
import { useRouter } from "next/router";
import SuperAdminLayout from "../../../components/layouts/SuperAdminLayout";
import Icon from "../../../components/shared/Icon";
import Av from "../../../components/shared/Avatar";
import PersonalForm from "../../../components/employee-detail/PersonalForm";
import AttendanceDetails from "../../../components/employee-detail/AttendanceDetails";
import SalaryDetails from "../../../components/employee-detail/SalaryDetails";
import BankDetails from "../../../components/employee-detail/BankDetails";
import RequestsDetail from "../../../components/employee-detail/RequestsDetail";
import { THEME, API_BASE, DEFAULT_SALARY_SETTINGS } from "../../../lib/constants";
import { useAppContext } from "../../../context/AppContext";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Employee detail error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SuperAdminLayout title="Error">
          <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 16, color: "var(--t2)", marginBottom: 20 }}>Something went wrong while loading the employee details</div>
            <div style={{ fontSize: 14, color: "var(--t3)", marginBottom: 20 }}>{this.state.error?.message || 'Unknown error'}</div>
            <button
              className="btn btn-sm"
              onClick={() => window.location.reload()}
              style={{ marginRight: 10, background: THEME.superadmin.acc, color: "#fff" }}
            >
              Reload Page
            </button>
            <button
              className="btn btn-sm"
              onClick={() => this.props.router.push("/superadmin/employees")}
              style={{ background: "white", border: "1px solid var(--br)", color: "var(--t2)" }}
            >
              Back to Employees
            </button>
          </div>
        </SuperAdminLayout>
      );
    }

    return this.props.children;
  }
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EmployeeDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, authLoading, globalStaff, globalLeaves, yearlyHolidays, setGlobalStaff, salarySettings } = useAppContext();
  const t = THEME.superadmin;
  const [employee, setEmployee] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [subTab, setSubTab] = useState("attendance");
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [monthSummary, setMonthSummary] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [editDayModal, setEditDayModal] = useState(null);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [cycleAttendanceSummary, setCycleAttendanceSummary] = useState(null);
  const [loadingCycleSummary, setLoadingCycleSummary] = useState(false);

  const notesStorageKey = employee?.id ? `employee_notes_${employee.id}` : null;

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

  const saveNotes = (nextNotes) => {
    setNotes(nextNotes);
    if (notesStorageKey) {
      try {
        window.localStorage.setItem(notesStorageKey, JSON.stringify(nextNotes));
      } catch (err) {
        console.error('Failed to persist notes', err);
      }
    }
  };

  const addNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    const now = new Date();
    const formatted = `${now.getDate()} ${MONTH_NAMES[now.getMonth()].slice(0, 3)} ${now.getFullYear()}`;
    const nextNotes = [{ id: Date.now(), text: trimmed, date: formatted }, ...notes];
    saveNotes(nextNotes);
    setNoteText('');
  };

  const deleteNote = (id) => {
    const nextNotes = notes.filter((note) => note.id !== id);
    saveNotes(nextNotes);
  };

  const loadStoredNotes = () => {
    if (!employee?.id) return;
    try {
      const stored = window.localStorage.getItem(`employee_notes_${employee.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load stored notes', err);
    }
  };

  const handleDeleteEmployee = () => {
    if (!employee?.id) return;
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const performDeleteEmployee = async () => {
    if (!employee?.id) return;
    setDeleteInProgress(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API_BASE}/employees/${employee.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Unable to delete employee');
      }
      setGlobalStaff((prev) => prev.filter((item) => String(item.id) !== String(employee.id)));
      setDeleteSuccess(true);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Delete failed', err);
      setDeleteError('Failed to delete staff. Please try again.');
    } finally {
      setDeleteInProgress(false);
    }
  };

  const normalizeWeekOffDays = (weekOffDays, departmentName) => {
    if (weekOffDays === undefined || weekOffDays === null) {
      weekOffDays = [];
    }

    if (typeof weekOffDays === 'string') {
      const trimmed = weekOffDays.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          return normalizeWeekOffDays(JSON.parse(trimmed), departmentName);
        } catch {
          // fall through
        }
      }
      return trimmed
        .split(/[,\s]+/)
        .map((item) => Number(item.trim()))
        .filter((day) => Number.isFinite(day) && day >= 0 && day <= 6);
    }

    if (typeof weekOffDays === 'number') {
      return Number.isFinite(weekOffDays) && weekOffDays >= 0 && weekOffDays <= 6
        ? [Number(weekOffDays)]
        : [];
    }

    if (Array.isArray(weekOffDays) && weekOffDays.length > 0) {
      return weekOffDays
        .map((day) => Number(day))
        .filter((day) => Number.isFinite(day) && day >= 0 && day <= 6);
    }

    // STRICT: Only use what is in the database. 
    // If weekOffDays is empty/null, return an empty array.
    // Do NOT fallback to Sunday [0] automatically if the department doesn't have it.
    return [];
  };

  const formatTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadEmployeeDetails = async (employeeId) => {
    setEmployeeLoading(true);
    setDepartmentInfo(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 404) {
          setEmployee(false);
          setPageError('Employee not found');
          return;
        }
        throw new Error(`Failed to fetch employee details (${res.status})`);
      }
      const fullEmployee = await res.json();
      setEmployee(fullEmployee);
      setPageError(null);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Employee fetch timed out');
        setPageError('Request timed out. Please check backend connection.');
      } else {
        console.error('Failed to load employee details:', error);
        setPageError('Unable to load employee data from backend');
      }
      setEmployee(false);
    } finally {
      setEmployeeLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadEmployeeDetails(id);
  }, [id]);

  useEffect(() => {
    loadStoredNotes();
  }, [employee?.id]);

  useEffect(() => {
    if (!employee || employee === false) {
      setDepartmentInfo(null);
      return;
    }
    const hasResolvedDepartment = employee.department && typeof employee.department === 'object' && employee.department.name && (employee.department.week_off_days !== undefined && employee.department.week_off_days !== null);
    const hasDepartmentId = employee.department_id || (employee.department && employee.department.id);
    if (!hasResolvedDepartment && hasDepartmentId) {
      const departmentId = employee.department_id || (employee.department && employee.department.id);
      console.log('STRICT: Fetching department info to get correct week off days for ID:', departmentId);
      fetch(`${API_BASE}/departments/${departmentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
        .then((res) => res.json())
        .then((dept) => {
          if (dept && dept.id) {
            console.log('STRICT: Department info loaded:', dept);
            setDepartmentInfo(dept);
          }
        })
        .catch((error) => {
          console.error('Failed to resolve department details:', error);
        });
    }
  }, [employee?.department_id, employee?.department, employee?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const handleBack = () => router.push("/superadmin/employees");

  const handleEmployeeUpdate = (updatedEmployee) => {
    if (!updatedEmployee) return;
    setEmployee(updatedEmployee);
    setGlobalStaff((prev) => prev.map((item) => (item.id === updatedEmployee.id ? updatedEmployee : item)));
  };

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const fetchAttendanceHistory = async () => {
    if (!employee?.id) return;
    setLoadingAttendance(true);
    try {
      const res = await fetch(`${API_BASE}/attendance/employee/${employee.id}?month=${selectedMonth + 1}&year=${selectedYear}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceHistory(data.days || []);
        setMonthSummary(data.summary || null);
      } else {
        setAttendanceHistory([]);
        setMonthSummary(null);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
      setAttendanceHistory([]);
      setMonthSummary(null);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadCycleAttendanceSummary = async () => {
    if (!employee?.id) return;
    setLoadingCycleSummary(true);
    try {
      const cycleStartDay = salarySettings?.cycleStart || DEFAULT_SALARY_SETTINGS.cycleStart;
      const { startDate, endDate } = getCycleRange(selectedMonth + 1, selectedYear, cycleStartDay);
      const res = await fetch(`${API_BASE}/attendance/summary?employeeId=${employee.id}&startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCycleAttendanceSummary(data);
      } else {
        setCycleAttendanceSummary(null);
      }
    } catch (err) {
      console.error('Error loading cycle attendance summary:', err);
      setCycleAttendanceSummary(null);
    } finally {
      setLoadingCycleSummary(false);
    }
  };

  const loadSalaryDetails = async (employeeId) => {
    if (!employeeId) return;
    setSalaryLoading(true);
    setSalaryError(null);
    try {
      const res = await fetch(`${API_BASE}/salary/${employeeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 404) {
          setSalaryDetails(null);
          setSalaryError('No active salary structure found for this employee');
          return;
        }
        const text = await res.text();
        throw new Error(text || `Salary fetch failed (${res.status})`);
      }
      const data = await res.json();
      setSalaryDetails(data);
    } catch (err) {
      console.error('Failed to load salary details:', err);
      setSalaryDetails(null);
      setSalaryError(err.message || 'Unable to load salary details');
    } finally {
      setSalaryLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
    loadCycleAttendanceSummary();
  }, [employee?.id, selectedMonth, selectedYear, salarySettings?.cycleStart]);

  useEffect(() => {
    if (subTab !== 'salary' || !employee?.id) return;
    loadSalaryDetails(employee.id);
  }, [subTab, employee?.id]);

  if (authLoading) {
    return (
      <SuperAdminLayout title="Employee Details">
        <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 16, color: "var(--t2)" }}>Loading session...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!user) {
    return (
      <SuperAdminLayout title="Sign In Required">
        <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 16, color: "var(--t2)" }}>You must sign in to view this page. Redirecting to login...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (pageError) {
    return (
      <SuperAdminLayout title="Error">
        <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 16, color: "var(--t2)", marginBottom: 20 }}>An error occurred while loading the page</div>
          <div style={{ fontSize: 14, color: "var(--t3)" }}>{pageError}</div>
          <button
            className="btn btn-sm"
            onClick={() => router.push("/superadmin/employees")}
            style={{ marginTop: 20, background: t.acc, color: "#fff" }}
          >
            Back to Employees
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  if (employeeLoading) {
    return (
      <SuperAdminLayout title="Employee Details">
        <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 16, color: "var(--t2)" }}>Loading employee details...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (employee === false) {
    return (
      <SuperAdminLayout title="Employee Not Found">
        <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
          <button
            className="bk"
            onClick={handleBack}
            type="button"
          >
            <Icon n="arrow_left" size={16} color="var(--t2)" />
            <span className="bkl">Back</span>
          </button>
          <div style={{ fontSize: 16, color: "var(--t2)", marginTop: 20 }}>Employee not found</div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!employee) {
    return (
      <SuperAdminLayout title="Employee Details">
        <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 16, color: "var(--t2)" }}>Loading employee data...</div>
          {globalStaff?.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--t3)", marginTop: 12 }}>Make sure the backend is running at localhost:3004</div>
          )}
        </div>
      </SuperAdminLayout>
    );
  }

  const branchLabel = employee.branch?.name || employee.branch || employee.branch_id || "Main Branch";
  const roleLabel = employee.perm || employee.designation || employee.role || "Staff";
  
  // Get department label safely
  const getDepartmentLabel = () => {
    try {
      if (employee && employee.department) {
        if (typeof employee.department === 'object' && employee.department.name) {
          return employee.department.name;
        } else if (typeof employee.department === 'string') {
          return employee.department;
        }
      }
      return departmentInfo?.name || employee?.department_name || employee?.departmentName || employee?.dept || "Not assigned";
    } catch (e) {
      console.error('Error getting department label:', e);
      return "Not assigned";
    }
  };
  
  const resolvedDepartment = (employee?.department && typeof employee.department === 'object' && Array.isArray(employee.department.week_off_days))
    ? employee.department
    : (departmentInfo && (String(departmentInfo.id) === String(employee?.department_id) || departmentInfo.name === employee?.department))
      ? departmentInfo
      : null;
  const departmentLabel = getDepartmentLabel();
  const departmentWeekOffNames = (() => {
    const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (!resolvedDepartment) return 'None';
    const normalizedDays = normalizeWeekOffDays(resolvedDepartment.week_off_days, resolvedDepartment.name || departmentLabel);
    return normalizedDays.length ? normalizedDays.map(day => weekDayNames[day]).join(', ') : 'None';
  })();

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
  const isFutureMonth = selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth);

  const changeMonth = (delta) => {
    setSelectedDate(new Date(selectedYear, selectedMonth + delta, 1));
  };

  const formatReportFilename = () => {
    const monthName = MONTH_NAMES[selectedMonth].toLowerCase();
    const employeeLabel = employee?.employee_id || `emp-${employee?.id || 'unknown'}`;
    return `attendance-report-${employeeLabel}-${monthName}-${selectedYear}.csv`;
  };

  const downloadAttendanceReport = () => {
    const rows = [
      ['Day', 'Date', 'Status', 'Note', 'Punch In', 'Punch Out']
    ];

    attendanceDays.forEach((item) => {
      if (!item.day) return;
      const record = attendanceByDay.get(item.day) || {};
      const date = `${String(item.day).padStart(2, '0')}/${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`;
      rows.push([
        item.day,
        date,
        item.label || '',
        record.note || '',
        record.punchIn || '',
        record.punchOut || ''
      ]);
    });

    const csv = rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = formatReportFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderMonthNav = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 30 }}>
      <button 
        type="button"
        onClick={() => changeMonth(-1)}
        style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <Icon n="left" size={16} color="var(--t1)"/>
      </button>
      
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 800, color: 'var(--t1)', 
        background: '#fff', padding: '0 40px', height: 48, borderRadius: 100, border: '1px solid var(--br)',
        minWidth: 400, justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <Icon n="calendar" size={16} color="var(--t3)"/>
        {MONTH_NAMES[selectedMonth]} {selectedYear}
      </div>

      <button 
        type="button"
        onClick={() => changeMonth(1)}
        style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', border: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <Icon n="right" size={16} color="var(--t1)"/>
      </button>
    </div>
  );

  const renderSalarySummary = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, padding: 24, borderRadius: 24, border: "1px solid var(--br)", background: "#f8fbff" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--t3)", marginBottom: 8 }}>Payable Amount</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--t1)" }}>
            {salaryLoading ? 'Loading...' : salaryDetails ? `₹ ${Number(salaryDetails.net_salary || 0).toLocaleString('en-IN')}` : `₹ ${Number(employee.basic_salary || employee.basicSalary || 0).toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 4 }}>{MONTH_NAMES[selectedMonth]} {selectedYear}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-full"
            style={{ background: t.acc, color: "#fff", minWidth: 160 }}
            disabled={!salaryDetails || salaryLoading}
            onClick={() => alert(salaryDetails ? 'Salary payment flow coming soon' : 'Salary not configured yet')}
          >
            Pay Salary
          </button>
          <button
            type="button"
            className="btn bs"
            style={{ minWidth: 160 }}
            onClick={() => alert('Download pay slip flow coming soon')}
          >
            View / Download Pay Slip
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 18, border: "1px solid var(--br)", background: "#fff" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase" }}>Earnings</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginTop: 6 }}>Gross Earnings</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--grn)" }}>
            ₹ {salaryDetails ? Number(salaryDetails.gross_salary || 0).toLocaleString('en-IN') : '0'}
          </div>
        </div>

        {[
          { label: "Basic", value: salaryDetails?.basic || salaryDetails?.basic_salary || employee.basic_salary || employee.basicSalary || 0 },
          { label: "Bonus", value: salaryDetails?.bonus || 0 },
          { label: "Overtime", value: salaryDetails?.overtime || 0 },
          { label: "Incentive", value: salaryDetails?.incentive || 0 }
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 18, border: "1px solid var(--br)", background: "#f7fafc" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t2)" }}>{item.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>₹ {Number(item.value || 0).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      {salaryError && (
        <div style={{ padding: "14px 18px", borderRadius: 18, background: "rgba(254, 226, 226, 0.7)", color: "#991b1b", fontSize: 13 }}>
          {salaryError}
        </div>
      )}
    </div>
  );

  const weekOffDays = (resolvedDepartment && Array.isArray(resolvedDepartment.week_off_days))
    ? normalizeWeekOffDays(resolvedDepartment.week_off_days, resolvedDepartment.name)
    : [];
  
  // Debug log to trace exact week off source
  console.log('STRICT Week Off Check:', {
    employee: employee?.name,
    dept: resolvedDepartment?.name,
    dbDays: resolvedDepartment?.week_off_days,
    normalized: weekOffDays
  });
  const monthHolidays = (yearlyHolidays[selectedYear] || {})[selectedMonth] || [];
  const approvedLeaves = (globalLeaves || []).filter(
    (l) => {
      if (!employee) return false;
      const nameMatch = l.name?.trim().toLowerCase() === employee.name?.trim().toLowerCase();
      const idMatch = String(l.employee_id) === String(employee.employee_id) || String(l.employee_id) === String(employee.id);
      return (nameMatch || idMatch) && l.status === 'approved';
    }
  );
  const samplePresentDays = new Set([3, 4, 5, 6, 8, 9, 10]);

  const approvedLeaveDays = (globalLeaves || [])
    .filter(l => {
      if (!employee) return false;
      const idMatch = String(l.employee_id) === String(employee.employee_id) || String(l.employee_id) === String(employee.id);
      return idMatch && l.status === 'approved';
    })
    .reduce((map, leave) => {
      const start = new Date(leave.from_date);
      const end = new Date(leave.to_date || leave.from_date);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear) {
          map.set(d.getDate(), leave.type);
        }
      }
      return map;
    }, new Map());

  const attendanceByDay = new Map((attendanceHistory || []).map((record) => [Number(record.day), record]));

  const normalizeAttendanceStatus = (status) => {
    if (!status) return null;
    switch (String(status).toLowerCase()) {
      case 'present':
        return 'present';
      case 'half_day':
      case 'half day':
        return 'half_day';
      case 'half_day_leave':
      case 'half day leave':
        return 'half_day_leave';
      case 'paid_leave':
      case 'paid leave':
      case 'paid':
        return 'paid_leave';
      case 'unpaid_leave':
      case 'unpaid leave':
      case 'unpaid':
      case 'lop':
        return 'unpaid_leave';
      case 'week_off':
      case 'week off':
        return 'week_off';
      case 'holiday':
        return 'holiday';
      case 'absent_pending':
      case 'absent':
        return 'absent';
      default:
        return 'absent';
    }
  };

  const getAttendanceStatusLabel = (status) => {
    switch (normalizeAttendanceStatus(status)) {
      case 'present':
        return 'PRESENT';
      case 'half_day':
        return 'HALF DAY';
      case 'paid_leave':
        return 'PAID LEAVE';
      case 'unpaid_leave':
        return 'UNPAID LEAVE';
      case 'week_off':
        return 'WEEK OFF';
      case 'holiday':
        return 'HOLIDAY';
      case 'half_day_leave':
        return 'HALF DAY LEAVE';
      case 'absent':
      default:
        return 'ABSENT';
    }
  };

  const getAttendanceStatus = (day) => {
    const record = attendanceByDay.get(day);
    const dateObj = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = dateObj.getDay();
    
    // Check if it's a Week Off based STRICTLY on department settings
    const isWeekOffDay = Array.isArray(weekOffDays) && weekOffDays.includes(dayOfWeek);

    // Use backend attendance data as source of truth - no longer using approvedLeaveDays cache
    if (record?.status) {
      const status = normalizeAttendanceStatus(record.status);
      
      // If the status is 'absent', check if there's a holiday or week off
      if (status === 'absent') {
        if (monthHolidays.includes(day)) return 'holiday';
        if (isWeekOffDay) return 'week_off';
      }
      
      return status;
    }

    if (monthHolidays.includes(day)) return 'holiday';
    if (isWeekOffDay) return 'week_off';
    return 'absent';
  };

  const saveAttendanceForDay = async (day, status, extra = {}) => {
    if (!employee?.id) return null;
    const statusMap = {
      present: 'present',
      absent: 'absent',
      half_day: 'half_day',
      paid_leave: 'paid_leave',
      week_off: 'week_off',
      holiday: 'holiday',
      half_day_leave: 'half_day_leave',
      unpaid_leave: 'unpaid_leave'
    };

    const normalizeTime = (value) => {
      if (!value) return null;
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
      const [timePart, meridiem] = String(value).trim().split(' ');
      if (!timePart || !meridiem) return null;
      let [hours, minutes] = timePart.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
      if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
      // FIXED: day was being decremented by 1, which caused the date to be the previous day
      return new Date(selectedYear, selectedMonth, day, hours, minutes, 0).toISOString();
    };

    const requestBody = {
      status: statusMap[status] || 'absent',
      note: extra.note || '',
      punchInTime: extra.punchIn ? normalizeTime(extra.punchIn) : null,
      punchOutTime: extra.punchOut ? normalizeTime(extra.punchOut) : null,
      editReason: extra.editReason || `Updated attendance for ${String(day).padStart(2, '0')} ${MONTH_NAMES[selectedMonth]} ${selectedYear}`
    };

    console.log('Saving attendance for day:', day, 'status:', status, 'requestBody:', requestBody);

    const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const res = await fetch(`${API_BASE}/attendance/employee/${employee.id}/date/${dateKey}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to save attendance');
    }
    
    // Refresh all related data
    await fetchAttendanceHistory();
    await loadCycleAttendanceSummary();
    if (subTab === 'salary') await loadSalaryDetails(employee.id);
    
    return res.json();
  };

  const openEditDayModal = (day) => {
    const record = attendanceByDay.get(day);
    const status = getAttendanceStatus(day);
    setEditDayModal({
      day,
      status,
      note: record?.note || '',
      punchIn: formatTime(record?.punchIn) || null,
      punchOut: formatTime(record?.punchOut) || null,
      displayLabel: getAttendanceStatusLabel(status)
    });
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const attendanceDays = Array.from({ length: firstDayOfWeek + daysInMonth }, (_, index) => {
    if (index < firstDayOfWeek) {
      return { day: null, status: null, label: null };
    }
    const day = index - firstDayOfWeek + 1;
    const isFutureDay = isFutureMonth || (isCurrentMonth && day > today.getDate());
    
    // Check if date is before joining date
    const joiningDateRaw = employee.date_of_joining || employee.joiningDate;
    const joiningDate = joiningDateRaw ? new Date(joiningDateRaw) : null;
    if (joiningDate) joiningDate.setHours(0, 0, 0, 0);
    const currentDate = new Date(selectedYear, selectedMonth, day);
    currentDate.setHours(0, 0, 0, 0);
    const isPreJoining = joiningDate && currentDate < joiningDate;

    const status = isPreJoining ? 'pre_joining' : getAttendanceStatus(day);
    const label = (status && status !== 'pre_joining') ? getAttendanceStatusLabel(status) : null;
    
    if (isFutureDay) {
      const allowedFutureStatuses = ['holiday', 'week_off', 'paid_leave', 'half_day', 'half_day_leave', 'unpaid_leave'];
      const isAllowed = !isPreJoining && allowedFutureStatuses.includes(status);
      return { 
        day, 
        status: isAllowed ? status : (isPreJoining ? 'pre_joining' : null), 
        label: isAllowed ? getAttendanceStatusLabel(status) : null, 
        isFutureDay,
        isPreJoining
      };
    }
    return { day, status, label, isFutureDay, isPreJoining };
  });

  const totals = monthSummary ? {
    present: monthSummary.present || 0,
    absent: monthSummary.absent || 0,
    halfDay: monthSummary.halfDay || 0,
    paidLeave: monthSummary.paidLeave || 0,
    unpaidLeave: monthSummary.unpaidLeave || 0,
    weekOff: monthSummary.weekOff || 0,
    holiday: monthSummary.holiday || 0,
  } : { present: 0, absent: 0, halfDay: 0, paidLeave: 0, unpaidLeave: 0, weekOff: 0, holiday: 0 };

  const summaryTotals = totals; // Always use monthly totals to match Employee view as requested

  const statusStyle = (status) => {
    if (!status) {
      return { background: "rgba(248, 250, 252, 0.9)", borderColor: "rgba(209, 213, 219, 0.8)", color: "var(--t3)" };
    }
    switch (status) {
      case "HOLIDAY":
        return { background: "rgba(255, 193, 7, 0.12)", borderColor: "rgba(255, 193, 7, 0.3)", color: "var(--amb)" };
      case "WEEK OFF":
        return { background: "rgba(55, 125, 255, 0.08)", borderColor: "rgba(55, 125, 255, 0.2)", color: "var(--blu)" };
      case "PAID LEAVE":
        return { background: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59, 130, 246, 0.2)", color: "var(--blu)" };
      case "UNPAID LEAVE":
        return { background: "rgba(45, 212, 191, 0.08)", borderColor: "rgba(45, 212, 191, 0.2)", color: "var(--teal)" };
      case "HALF DAY":
        return { background: "rgba(251, 191, 36, 0.12)", borderColor: "rgba(251, 191, 36, 0.3)", color: "var(--amb)" };
      case "HALF DAY LEAVE":
        return { background: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59, 130, 246, 0.2)", color: "var(--blu)" };
      case "ABSENT":
        return { background: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.2)", color: "var(--red)" };
      default:
        return { background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.2)", color: "var(--grn)" };
    }
  };

  const detailPageTitles = {
    personal: 'Personal Details',
    attendanceDetail: 'Attendance Details',
    salaryDetail: 'Salary Details',
    bankDetail: 'Bank Details',
    requestDetail: 'Requests'
  };

  const isDetailPage = Object.keys(detailPageTitles).includes(subTab);

  if (isDetailPage) {
    return (
      <SuperAdminLayout title={`${employee.employee_id || `ID-${employee.id}`} - ${detailPageTitles[subTab]}`}>
        <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)' }}>
          <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', padding: '18px 0 28px' }}>
            <div style={{ marginBottom: 18 }}>
              <button
                className="bk"
                onClick={() => setSubTab('attendance')}
                type="button"
              >
                <Icon n="arrow_left" size={18} color="var(--t2)" />
                <span className="bkl">Back</span>
              </button>
            </div>

            <div className="cd" style={{ padding: 0, borderRadius: 24, border: '1px solid var(--br)', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 24px 0' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>{detailPageTitles[subTab]}</div>
              </div>
              <div style={{ padding: '0 24px 24px' }}>
                {subTab === 'personal' ? (
                  <PersonalForm emp={employee} onBack={() => setSubTab('attendance')} onSaved={handleEmployeeUpdate} accentColor={t.acc} flat showClose={false} />
                ) : subTab === 'attendanceDetail' ? (
                  <AttendanceDetails emp={employee} onBack={() => setSubTab('attendance')} accentColor={t.acc} flat showClose={false} />
                ) : subTab === 'salaryDetail' ? (
                  <SalaryDetails emp={employee} onBack={() => setSubTab('attendance')} accentColor={t.acc} flat showClose={false} />
                ) : subTab === 'bankDetail' ? (
                  <BankDetails emp={employee} onBack={() => setSubTab('attendance')} onSaved={handleEmployeeUpdate} accentColor={t.acc} flat showClose={false} />
                ) : subTab === 'requestDetail' ? (
                  <RequestsDetail emp={employee} onBack={() => setSubTab('attendance')} accentColor={t.acc} flat />
                ) : (
                  <div style={{ padding: 30, color: 'var(--t2)', fontSize: 14 }}>This section is not available yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  try {
    return (
      <SuperAdminLayout title={employee.name || "Employee Details"}>
        <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)" }}>
          <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "16px 8px 32px" }}>
            {/* Back Button */}
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={handleBack}
                className="bk"
                type="button"
              >
                <Icon n="arrow_left" size={18} color="var(--t2)" />
                <span className="bkl">Back</span>
              </button>
            </div>

            <div className="cd" style={{ padding: "20px 24px", marginBottom: 8, borderRadius: 24, border: "1px solid var(--br)", background: "white" }}>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Av name={employee.name} size={88} r={28} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--t1)" }}>{employee.name}</div>
                    <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>{employee.employee_id || `ID-${employee.id}`}</div>
                    <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>📱 {employee.phone || "N/A"}</div>
                    <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>Designation: {roleLabel}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", marginTop: 3, padding: "6px 12px", background: "rgba(99, 102, 241, 0.1)", borderRadius: 6 }}>Department: {departmentLabel || "Not assigned"}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
                  {(() => {
                    const phoneDigits = (employee?.phone || "").replace(/\D/g, "");
                    const callHref = phoneDigits ? `tel:${phoneDigits}` : undefined;
                    const whatsappHref = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent('Hello!')}` : undefined;
                    return [
                      { label: "Call", icon: "smartphone", href: callHref },
                      { label: "Text", icon: "send", href: whatsappHref, target: "_blank" },
                      { label: "Location", icon: "map_pin" },
                      { label: "CRM", icon: "user" }
                    ].map((btn) => {
                      const isLink = Boolean(btn.href);
                      const commonStyle = {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 56,
                        gap: 4,
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: "1px solid var(--br)",
                        background: "#fff",
                        cursor: btn.href ? "pointer" : "default",
                        textDecoration: "none",
                        transition: "all 0.2s"
                      };
                      const content = (
                        <>
                          <Icon n={btn.icon} size={14} color={t.acc} />
                          <span style={{ fontSize: 10, fontWeight: 500, color: "var(--t2)", letterSpacing: "0.3px" }}>{btn.label}</span>
                        </>
                      );

                      if (isLink) {
                        return (
                          <a
                            key={btn.label}
                            href={btn.href}
                            target={btn.target || undefined}
                            rel={btn.target ? "noreferrer noopener" : undefined}
                            style={commonStyle}
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <button
                          key={btn.label}
                          type="button"
                          style={commonStyle}
                        >
                          {content}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            <div className="cd" style={{ padding: 0, overflow: "hidden", borderRadius: 24, border: "1px solid var(--br)", background: "white" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--br)", background: "white" }}>
                {[
                  { id: "attendance", label: "Attendance", icon: "calendar" },
                  { id: "salary", label: "Salary", icon: "dollar" },
                  { id: "notes", label: "Notes", icon: "note" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: subTab === tab.id ? "var(--grn)" : "var(--t3)",
                      cursor: "pointer",
                      border: "none",
                      borderBottom: `3px solid ${subTab === tab.id ? 'rgba(16, 185, 129, 0.4)' : "transparent"}`,
                      background: "transparent",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s"
                    }}
                  >
                    <Icon n={tab.icon} size={14} color={subTab === tab.id ? "var(--grn)" : "var(--t3)"} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {subTab === "attendance" && (
                <div style={{ padding: "24px 28px 32px" }}>
                  {renderMonthNav()}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 18, marginBottom: 20 }}>
                    {[
                      { label: "Present", value: summaryTotals.present, color: "#10b981" },
                      { label: "Absent", value: summaryTotals.absent, color: "#ef4444" },
                      { label: "Half Day", value: summaryTotals.halfDay, color: "#f59e0b" },
                      { label: "Paid Leave", value: summaryTotals.paidLeave, color: "#3b82f6" },
                      { label: "Unpaid Leave", value: summaryTotals.unpaidLeave, color: "#475569" },
                      { label: "Week Off", value: summaryTotals.weekOff, color: "#8b5cf6" },
                      { label: "Holiday", value: summaryTotals.holiday, color: "#f97316" }
                    ].map((stat) => (
                      <div key={stat.label} style={{ padding: 14, borderRadius: 16, border: "1px solid var(--br)", background: "#f8fafc", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 6, fontWeight: 700 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8, marginBottom: 10 }}>
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                      <div key={day} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--t3)", padding: "4px 0" }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 16 }}>
                    {attendanceDays.map((item, idx) => {
                      const label = item.label || null;
                      const style = item.isPreJoining ? { background: "var(--s1)", borderColor: "var(--br)", color: "var(--t3)" } : statusStyle(label);
                      const dayString = item.day ? String(item.day).padStart(2, "0") : "";
                      const canEdit = item.day && !item.isFutureDay && !item.isPreJoining;
                      return (
                        <div
                          key={`${selectedYear}-${selectedMonth}-${idx}`}
                          onClick={canEdit ? () => openEditDayModal(item.day) : undefined}
                          title={canEdit ? `Edit ${dayString} ${MONTH_NAMES[selectedMonth]}` : ''}
                          style={{
                            minHeight: 120,
                            padding: 16,
                            borderRadius: 18,
                            border: item.day ? `2px solid ${style.borderColor}` : 'none',
                            background: item.day ? style.background : 'transparent',
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: canEdit ? 'pointer' : 'default',
                            opacity: item.day ? (item.isPreJoining ? 0.5 : 1) : 0,
                            pointerEvents: item.day ? 'auto' : 'none'
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center" }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--t1)" }}>{dayString}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)", textTransform: "capitalize" }}>{item.day ? MONTH_NAMES[selectedMonth] : ""}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)" }}>{item.day ? selectedYear : ""}</div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: style.color, textTransform: "uppercase", textAlign: "center", lineHeight: 1.2, minHeight: 18, opacity: (label && !item.isPreJoining) ? 1 : 0 }}>
                            {(!item.isPreJoining && label) || ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {editDayModal && (
                    <div className="modal-ov" onClick={(e) => e.target === e.currentTarget && setEditDayModal(null)}>
                      <div className="modal-box" style={{ maxWidth: 380 }}>
                        <div className="modal-head">
                          <div>
                            <div className="modal-title">{String(editDayModal.day).padStart(2, '0')}th {MONTH_NAMES[selectedMonth]} — Edit Attendance</div>
                            <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 2 }}>{employee.employee_id || `ID-${employee.id}`}</div>
                          </div>
                          <button style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--s2)', border: '1px solid var(--br)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditDayModal(null)}>
                            <Icon n="x" size={14} color="var(--t2)" />
                          </button>
                        </div>

                        <div style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>Attendance Status</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                            {[
                              { value: 'present', label: 'PRESENT', color: 'var(--grn)', bg: 'rgba(16, 185, 129, 0.12)' },
                              { value: 'absent', label: 'ABSENT', color: 'var(--red)', bg: 'rgba(239, 68, 68, 0.1)' },
                              { value: 'half_day', label: 'HALF DAY', color: 'var(--amb)', bg: 'rgba(251, 191, 36, 0.12)' },
                              { value: 'week_off', label: 'WEEK OFF', color: 'var(--blu)', bg: 'rgba(59, 130, 246, 0.08)' },
                              { value: 'holiday', label: 'HOLIDAY', color: 'var(--teal)', bg: 'rgba(45, 212, 191, 0.12)' }
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setEditDayModal((m) => ({ ...m, status: option.value, displayLabel: option.label }))}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: 20,
                                  border: `2px solid ${editDayModal.status === option.value ? option.color : 'var(--br2)'}`,
                                  background: editDayModal.status === option.value ? option.bg : 'var(--s1)',
                                  color: editDayModal.status === option.value ? option.color : 'var(--t2)',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontFamily: 'Inter',
                                  transition: 'all .15s'
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Leave Type</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                            {[
                              { value: 'paid_leave', label: 'PAID LEAVE', color: 'var(--pur)' },
                              { value: 'half_day_leave', label: 'HALF DAY LEAVE', color: 'var(--blu)' },
                              { value: 'unpaid_leave', label: 'UNPAID LEAVE', color: 'var(--teal)' }
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setEditDayModal((m) => ({ ...m, status: option.value, displayLabel: option.label }))}
                                style={{
                                  padding: '7px 13px',
                                  borderRadius: 20,
                                  border: `2px solid ${editDayModal.status === option.value ? option.color : 'var(--br2)'}`,
                                  background: editDayModal.status === option.value ? `${option.color}15` : 'var(--s1)',
                                  color: editDayModal.status === option.value ? option.color : 'var(--t2)',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontFamily: 'Inter',
                                  transition: 'all .15s'
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,var(--pur),var(--blu))', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{employee.name?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                                  <input 
                                    type="text" 
                                    value={editDayModal.punchIn || ''} 
                                    onChange={(e) => setEditDayModal(m => ({ ...m, punchIn: e.target.value }))}
                                    placeholder="No punch in"
                                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid transparent', fontSize: 12, fontWeight: 700, width: 85, color: 'var(--t1)', padding: 0 }}
                                    onFocus={(e) => e.target.style.borderBottom = '1px solid var(--br)'}
                                    onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                                  />
                                  <span style={{ color: 'var(--grn)', fontWeight: 800 }}>• In</span>
                                  <span style={{ color: 'var(--t3)', fontWeight: 700 }}>{editDayModal.status === 'half_day' ? 'HALF DAY SHIFT' : editDayModal.status === 'week_off' ? 'WEEK OFF' : editDayModal.status === 'holiday' ? 'HOLIDAY' : 'FULL DAY SHIFT'}</span>
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <input 
                                    type="text" 
                                    value={editDayModal.punchOut || ''} 
                                    onChange={(e) => setEditDayModal(m => ({ ...m, punchOut: e.target.value }))}
                                    placeholder="No punch out"
                                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid transparent', fontSize: 12, fontWeight: 700, width: 85, color: 'var(--t1)', padding: 0 }}
                                    onFocus={(e) => e.target.style.borderBottom = '1px solid var(--br)'}
                                    onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                                  />
                                  <span style={{ color: 'var(--red)', fontWeight: 800 }}>• Out</span>
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 6 }}>{employee.branch?.name || branchLabel}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => setEditDayModal((m) => ({ ...m, punchIn: m.punchIn ? null : '10:23 AM' }))}
                                style={{ flex: 1, background: 'none', border: '1px solid var(--br2)', borderRadius: 8, padding: '8px', fontSize: 11, fontWeight: 700, color: 'var(--blu)', cursor: 'pointer' }}
                              >
                                {editDayModal.punchIn ? 'REMOVE PUNCH IN' : '+ ADD PUNCH IN'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditDayModal((m) => ({ ...m, punchOut: m.punchOut ? null : '06:30 PM' }))}
                                style={{ flex: 1, background: 'none', border: '1px solid var(--br2)', borderRadius: 8, padding: '8px', fontSize: 11, fontWeight: 700, color: 'var(--blu)', cursor: 'pointer' }}
                              >
                                {editDayModal.punchOut ? 'REMOVE PUNCH OUT' : '+ ADD PUNCH OUT'}
                              </button>
                            </div>
                          </div>

                          <textarea
                            className="f-in"
                            rows={2}
                            placeholder="Add Note..."
                            value={editDayModal.note || ''}
                            onChange={(e) => setEditDayModal((m) => ({ ...m, note: e.target.value }))}
                            style={{ resize: 'vertical', marginBottom: 0, width: '100%', borderRadius: 12, border: '1px solid var(--br)', padding: 10 }}
                          />
                        </div>

                        <div className="modal-foot">
                          <button className="btn bs btn-full" onClick={() => setEditDayModal(null)}>Cancel</button>
                          <button
                            className="btn btn-full"
                            style={{ background: t.acc, color: '#fff' }}
                            onClick={async () => {
                              setSavingAttendance(true);
                              try {
                                await saveAttendanceForDay(editDayModal.day, editDayModal.status, {
                                  note: editDayModal.note,
                                  punchIn: editDayModal.punchIn,
                                  punchOut: editDayModal.punchOut,
                                  editReason: `Updated attendance for ${String(editDayModal.day).padStart(2, '0')} ${MONTH_NAMES[selectedMonth]} ${selectedYear}`
                                });
                                await fetchAttendanceHistory();
                                setEditDayModal(null);
                              } catch (err) {
                                console.error('Save failed', err);
                                alert('Failed to save attendance changes.');
                              } finally {
                                setSavingAttendance(false);
                              }
                            }}
                            disabled={savingAttendance}
                          >
                            {savingAttendance ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingTop: 14, marginTop: 14, borderTop: "1px solid var(--br)" }}>
                    {[
                      { label: "Present", color: "#10b981" },
                      { label: "Absent", color: "#ef4444" },
                      { label: "Half Day", color: "#f59e0b" },
                      { label: "Paid Leave", color: "#0ea5e9" },
                      { label: "Week Off", color: "#7c3aed" },
                      { label: "Holiday", color: "#f97316" }
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: "var(--t3)" }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
                    <button
                      type="button"
                      className="btn bs"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 14, background: "white", border: "1px solid var(--br)", fontSize: 12, fontWeight: 700, color: "var(--t2)" }}
                      onClick={downloadAttendanceReport}
                    >
                      <Icon n="download" size={14} color="var(--t2)" />
                      Download Report
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
                    {[
                      { title: "Personal Details", icon: "user", tab: "personal" },
                      { title: "Attendance Details", icon: "calendar", tab: "attendanceDetail" },
                      { title: "Salary Details", icon: "dollar", tab: "salaryDetail" },
                      { title: "Bank Details", icon: "bank", tab: "bankDetail" },
                      { title: "Requests", icon: "clipboard", tab: "requestDetail" }
                    ].map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          if (item.redirect === true) {
                            setSubTab(item.tab);
                          } else if (typeof item.redirect === 'string') {
                            router.push(item.redirect);
                          } else {
                            setSubTab(item.tab);
                          }
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "14px 16px",
                          borderRadius: 18,
                          border: "1px solid var(--br)",
                          background: "white",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 14, background: "rgba(14, 165, 233, 0.08)", display: "grid", placeItems: "center" }}>
                            <Icon n={item.icon} size={16} color="var(--blu)" />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{item.title}</span>
                            {item.badge && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#047857", background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>{item.badge}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {item.toggle ? (
                            <span style={{ width: 40, height: 22, borderRadius: 999, background: "#10b981", position: "relative" }}>
                              <span style={{ position: "absolute", top: 2, left: 20, width: 18, height: 18, borderRadius: "50%", background: "white" }} />
                            </span>
                          ) : item.tab === 'requestDetail' ? null : (
                            <Icon n="chevron_right" size={18} color="var(--t2)" />
                          )}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleDeleteEmployee}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "14px 16px",
                        borderRadius: 18,
                        border: "1px solid rgba(239, 68, 68, 0.18)",
                        background: "rgba(254, 226, 226, 0.7)",
                        color: "#b91c1c",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 14, background: "rgba(239, 68, 68, 0.12)", display: "grid", placeItems: "center" }}>
                          <Icon n="trash" size={16} color="#b91c1c" />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Delete Staff</span>
                      </div>
                      <Icon n="chevron_right" size={18} color="#b91c1c" />
                    </button>
                  </div>
                </div>
              )}

              {subTab === "personal" && (
                <PersonalForm emp={employee} onBack={() => setSubTab("attendance")} onSaved={handleEmployeeUpdate} accentColor={t.acc} />
              )}

              {subTab === "salary" && (
                <div style={{ padding: 32, background: "white" }}>
                  {renderMonthNav()}
                  <div style={{ display: "grid", gap: 18 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, padding: 24, borderRadius: 24, border: "1px solid var(--br)", background: "#f8fbff" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--t3)", marginBottom: 8 }}>Payable Amount</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--t1)" }}>
                          {salaryLoading ? 'Loading...' : salaryDetails ? `₹ ${Number(salaryDetails.net_salary || 0).toLocaleString('en-IN')}` : `₹ ${Number(employee.basic_salary || employee.basicSalary || 0).toLocaleString('en-IN')}`}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 4 }}>{MONTH_NAMES[selectedMonth]} {selectedYear}</div>
                      </div>

                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 18, border: "1px solid var(--br)", background: "#fff" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase" }}>Earnings</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginTop: 6 }}>Gross Earnings</div>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--grn)" }}>
                          ₹ {salaryDetails ? Number(salaryDetails.gross_salary || 0).toLocaleString('en-IN') : '0'}
                        </div>
                      </div>

                      {[
                        { label: "Basic", value: salaryDetails?.basic || salaryDetails?.basic_salary || employee.basic_salary || employee.basicSalary || 0 },
                        { label: "Bonus", value: salaryDetails?.bonus || 0 },
                        { label: "Overtime", value: salaryDetails?.overtime || 0 },
                        { label: "Incentive", value: salaryDetails?.incentive || 0 }
                      ].map((item) => (
                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 18, border: "1px solid var(--br)", background: "#f7fafc" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t2)" }}>{item.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>₹ {Number(item.value || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {salaryError && (
                      <div style={{ padding: "14px 18px", borderRadius: 18, background: "rgba(254, 226, 226, 0.7)", color: "#991b1b", fontSize: 13 }}>
                        {salaryError}
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: 18, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--br)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                        <select
                          value={`${selectedMonth}-${selectedYear}`}
                          onChange={(e) => {
                            const [month, year] = e.target.value.split('-').map(Number);
                            setSelectedDate(new Date(year, month, 1));
                          }}
                          style={{ minWidth: 160, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--br)', background: 'white', color: 'var(--t1)' }}
                        >
                          {MONTH_NAMES.map((monthName, idx) => (
                            <option key={monthName} value={`${idx}-${selectedYear}`}>{monthName} {selectedYear}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn btn-full"
                          style={{ background: t.acc, color: '#fff', minWidth: 220, padding: '12px 18px' }}
                          onClick={() => alert('Download pay slip flow coming soon')}
                        >
                          View / Download Pay Slip
                        </button>
                      </div>

                      <div style={{ display: 'grid', gap: 12 }}>
                        {[
                          { title: "Personal Details", icon: "user", tab: "personal" },
                          { title: "Attendance Details", icon: "calendar", tab: "attendanceDetail" },
                          { title: "Salary Details", icon: "dollar", tab: "salaryDetail" },
                          { title: "Bank Details", icon: "bank", tab: "bankDetail" },
                          { title: "Requests", icon: "clipboard", tab: "requestDetail" }
                        ].map((item) => (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => setSubTab(item.tab)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12,
                              padding: '14px 16px',
                              borderRadius: 18,
                              border: '1px solid var(--br)',
                              background: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 14, background: 'rgba(14, 165, 233, 0.08)', display: 'grid', placeItems: 'center' }}>
                                <Icon n={item.icon} size={16} color="var(--blu)" />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{item.title}</span>
                                {item.badge && (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: '#047857', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>{item.badge}</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {item.toggle ? (
                                <span style={{ width: 40, height: 22, borderRadius: 999, background: '#10b981', position: 'relative' }}>
                                  <span style={{ position: 'absolute', top: 2, left: 20, width: 18, height: 18, borderRadius: '50%', background: 'white' }} />
                                </span>
                              ) : (
                                <Icon n="chevron_right" size={18} color="var(--t2)" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteEmployee}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '14px 16px',
                          borderRadius: 18,
                          border: '1px solid rgba(239, 68, 68, 0.18)',
                          background: 'rgba(254, 226, 226, 0.7)',
                          color: '#b91c1c',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 14, background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center' }}>
                            <Icon n="trash" size={16} color="#b91c1c" />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>Delete Staff</span>
                        </div>
                        <Icon n="chevron_right" size={18} color="#b91c1c" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {subTab === "notes" && (
                <div style={{ padding: 32, background: "white" }}>
                  {renderMonthNav()}
                  <div style={{ display: "grid", gap: 16 }}>
                    {notes.map((note) => (
                      <div key={note.id} style={{ display: "flex", gap: 16, padding: 16, borderRadius: 24, border: "1px solid var(--br)", background: "var(--s2)" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 18, background: "linear-gradient(135deg, #10b981, #0ea5e9)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16 }}>
                          {employee.name?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{employee.name}</div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#047857", background: "rgba(16, 185, 129, 0.12)", padding: "4px 10px", borderRadius: 999, textTransform: "uppercase" }}>
                                Note
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ fontSize: 10, color: "var(--t3)" }}>{note.date}</div>
                              <button
                                type="button"
                                onClick={() => deleteNote(note.id)}
                                style={{ fontSize: 10, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.6 }}>{note.text}</div>
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderRadius: 18, border: "1px solid var(--br)", background: "white" }}>
                      <button type="button" style={{ width: 44, height: 44, borderRadius: 16, border: "1px solid var(--br)", background: "var(--s2)", display: "grid", placeItems: "center", color: "var(--t2)" }}>
                        <Icon n="camera" size={18} color="var(--t2)" />
                      </button>
                      <input
                        placeholder="Save a note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--t1)" }}
                      />
                      <button
                        type="button"
                        style={{ width: 40, height: 40, borderRadius: 14, border: "none", background: t.acc, color: "#fff", display: "grid", placeItems: "center" }}
                        onClick={addNote}
                      >
                        <Icon n="send" size={16} color="#fff" />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                      {[
                      { title: 'Personal Details', icon: 'user', tab: 'personal' },
                      { title: 'Attendance Details', icon: 'calendar', tab: 'attendanceDetail' },
                      { title: 'Salary Details', icon: 'dollar', tab: 'salaryDetail' },
                      { title: 'Bank Details', icon: 'bank', tab: 'bankDetail' },
                      { title: 'Requests', icon: 'clipboard', tab: 'requestDetail' }
                    ].map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => {
                            if (item.redirect === true) {
                              setSubTab(item.tab);
                            } else if (typeof item.redirect === 'string') {
                              router.push(item.redirect);
                            } else {
                              setSubTab(item.tab);
                            }
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            padding: '14px 16px',
                            borderRadius: 18,
                            border: '1px solid var(--br)',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 14, background: 'rgba(14, 165, 233, 0.08)', display: 'grid', placeItems: 'center' }}>
                              <Icon n={item.icon} size={16} color='var(--blu)' />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{item.title}</span>
                              {item.badge && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#047857', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>{item.badge}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {item.toggle ? (
                              <span style={{ width: 40, height: 22, borderRadius: 999, background: '#10b981', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: 2, left: 20, width: 18, height: 18, borderRadius: '50%', background: 'white' }} />
                              </span>
                            ) : (
                              <Icon n='chevron_right' size={18} color='var(--t2)' />
                            )}
                          </div>
                        </button>
                      ))}
                      <button
                        type='button'
                        onClick={handleDeleteEmployee}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '14px 16px',
                          borderRadius: 18,
                          border: '1px solid rgba(239, 68, 68, 0.18)',
                          background: 'rgba(254, 226, 226, 0.7)',
                          color: '#b91c1c',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 14, background: 'rgba(239, 68, 68, 0.12)', display: 'grid', placeItems: 'center' }}>
                            <Icon n='trash' size={16} color='#b91c1c' />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>Delete Staff</span>
                        </div>
                        <Icon n='chevron_right' size={18} color='#b91c1c' />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 420, borderRadius: 24, background: '#fff', boxShadow: '0 32px 80px rgba(15, 23, 42, 0.16)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 24px 10px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.14)', display: 'grid', placeItems: 'center', color: '#b91c1c' }}>
                <Icon n="trash" size={24} color="#b91c1c" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Confirm delete</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>Are you sure you want to delete this staff member? This action cannot be undone.</div>
            </div>
            {deleteError && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--br)', color: '#991b1b', background: 'rgba(254, 226, 226, 0.75)', fontSize: 13 }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, padding: 16, borderTop: '1px solid var(--br)', background: 'var(--s2)' }}>
              <button
                type="button"
                className="btn bs btn-full"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                disabled={deleteInProgress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-full"
                style={{ background: '#b91c1c', color: '#fff' }}
                onClick={performDeleteEmployee}
                disabled={deleteInProgress}
              >
                {deleteInProgress ? 'Deleting...' : 'Delete now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 420, borderRadius: 24, background: '#fff', boxShadow: '0 32px 80px rgba(15, 23, 42, 0.16)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.14)', display: 'grid', placeItems: 'center' }}>
                <Icon n="check" size={24} color="#10b981" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Staff Deleted</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>The staff member has been removed successfully.</div>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: 16, borderTop: '1px solid var(--br)', background: 'var(--s2)' }}>
              <button
                type="button"
                className="btn btn-full"
                style={{ background: t.acc, color: '#fff' }}
                onClick={() => router.push('/superadmin/employees')}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
      </SuperAdminLayout>
    );
  } catch (error) {
    console.error('Error rendering employee detail page:', error);
    return (
      <SuperAdminLayout title="Error">
        <div className="ph" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 16, color: "var(--t2)", marginBottom: 20 }}>An error occurred while rendering the page</div>
          <div style={{ fontSize: 14, color: "var(--t3)" }}>{error.message}</div>
          <button
            className="btn btn-sm"
            onClick={() => router.push("/superadmin/employees")}
            style={{ marginTop: 20, background: t.acc, color: "#fff" }}
          >
            Back to Employees
          </button>
        </div>
      </SuperAdminLayout>
    );
  }
};

export default function EmployeeDetailPage() {
  return (
    <ErrorBoundary>
      <EmployeeDetail />
    </ErrorBoundary>
  );
}
