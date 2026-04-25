
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout';
import Icon from '../../components/shared/Icon';
import PayslipModal from '../../components/shared/PayslipModal';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

const EmployeeSalary = () => {
  const { user, salarySettings, globalReimb, refreshSettings } = useAppContext();
  const [showSlip, setShowSlip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (refreshSettings) refreshSettings();
  }, []);

  // Debug log to see settings
  useEffect(() => {
    console.log('EmployeeSalary: Current salarySettings from context:', salarySettings);
  }, [salarySettings]);

  const today = new Date();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const cycleStartDay = salarySettings?.cycleStart || 1;
  const payDay = salarySettings?.payDay || 5;
  const payMonth = salarySettings?.payMonth || 'next';
  const currentCycleLabel = getCycleLabel(selectedMonth + 1, selectedYear, cycleStartDay);

  const getPayDateLabel = () => {
    // If settings haven't loaded yet (cycleStart is 1 and it shouldn't be), 
    // maybe we should show a loading state or just wait.
    let m = selectedMonth + 1;
    let y = selectedYear;
    if (payMonth === 'next') {
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return `${payDay} ${MONTH_NAMES[m - 1]} ${y}`;
  };

  const fetchPayrollHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payroll/my-history`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPayrollData(data || []);
      }
    } catch (e) {
      console.error('Error fetching payroll:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollHistory();
  }, []);

  useEffect(() => {
    const found = payrollData.find(p => p.month === selectedMonth + 1 && p.year === selectedYear);
    setCurrentPayroll(found || null);
  }, [selectedMonth, selectedYear, payrollData]);

  const changeMonth = (delta) => {
    const next = new Date(selectedYear, selectedMonth + delta, 1);
    setSelectedDate(next);
  };

  return (
    <EmployeeLayout title="My Salary">
      <style jsx>{`
        .month-filter-pill { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 30px; background: #fff; padding: 0 8px; height: 56px; border-radius: 100px; border: 1px solid #e2e8f0; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .salary-card-main { background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 30px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); position: relative; overflow: hidden; }
        .salary-card-main::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #10b981, #3b82f6); }
        .net-payable-label { font-size: 14px; font-weight: 700; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .net-payable-amount { font-size: 42px; font-weight: 900; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .salary-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 25px; }
        .detail-item { text-align: center; }
        .detail-value { font-size: 18px; font-weight: 800; color: #1e293b; }
        .detail-label { font-size: 11px; font-weight: 700; color: #94a3b8; margin-top: 4px; }
        .history-section { margin-top: 40px; }
        .payroll-history-list { display: flex; flex-direction: column; gap: 15px; }
        .history-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; transition: all 0.2s; }
        .history-info { display: flex; flex-direction: column; }
        .history-month { font-size: 15px; font-weight: 800; color: #1e293b; }
        .history-amount { font-size: 13px; font-weight: 600; color: #64748b; margin-top: 2px; }
        .history-actions { display: flex; align-items: center; gap: 12px; }
        .status-badge { padding: 6px 12px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .status-paid { background: #f0fdf4; color: #16a34a; }
        .status-pending { background: #fffbeb; color: #f59e0b; }
        .month-selection { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 800; color: #1e293b; justify-content: center; flex: 1; }
        @media (max-width: 768px) { .salary-card-main { padding: 20px; } .net-payable-amount { font-size: 32px; } .salary-details-grid { grid-template-columns: repeat(2, 1fr); } .history-item { padding: 12px 15px; } .history-month { font-size: 14px; } }
        @media (max-width: 480px) { .salary-details-grid { grid-template-columns: 1fr; gap: 20px; } .history-item { flex-direction: column; align-items: flex-start; gap: 15px; } .history-actions { width: 100%; justify-content: space-between; } }
      `}</style>

      {showSlip && currentPayroll && (
        <PayslipModal 
          onClose={() => setShowSlip(false)} 
          empData={user} 
          salData={{
            ...currentPayroll,
            basic: currentPayroll.basic_earned || 0,
            presentDays: currentPayroll.present_days || 0,
            halfDays: currentPayroll.half_days || 0,
            paidLeaves: currentPayroll.paid_leave_days || 0
          }} 
          salSettings={salarySettings} 
          month={currentPayroll.month} 
          year={currentPayroll.year} 
          globalReimb={globalReimb} 
        />
      )}

      <div className="ph" style={{ marginBottom: 25 }}>
        <div>
          <div className="pt" style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Salary & Payments</div>
          <div className="ps" style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon n="calendar" size={14} color="#64748b"/>
              <span>Cycle: <strong style={{ color: '#1e293b' }}>{currentCycleLabel}</strong></span>
            </div>
            <div style={{ width: 1, height: 14, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon n="calendar" size={14} color="#64748b"/>
              <span>Pay Date: <strong style={{ color: '#10b981' }}>{getPayDateLabel()}</strong></span>
            </div>
          </div>
        </div>
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
              const d = new Date(currentYear, currentMonth - 11 + i, 1);
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

      <div className="salary-card-main">
        <div className="net-payable-label">Net Payable Amount</div>
        <div className="net-payable-amount">
          <span style={{ fontSize: 24, color: '#94a3b8', fontWeight: 700 }}>₹</span>
          {currentPayroll && currentPayroll.status?.toLowerCase() === 'paid' ? (currentPayroll.net_payable || currentPayroll.net_salary)?.toLocaleString() : '0'}
        </div>
        <button className="btn" style={{ background: '#1e293b', color: '#fff', margin: '0 auto', padding: '12px 25px', borderRadius: 14, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)', opacity: currentPayroll && currentPayroll.status?.toLowerCase() === 'paid' ? 1 : 0.5, cursor: currentPayroll && currentPayroll.status?.toLowerCase() === 'paid' ? 'pointer' : 'not-allowed' }} onClick={() => currentPayroll && currentPayroll.status?.toLowerCase() === 'paid' && setShowSlip(true)}>
          <Icon n="download" size={16} color="#fff"/> View Pay Slip
        </button>
        <div className="salary-details-grid">
          {[
            { label: 'Basic Salary', val: user?.basic_salary || 0 },
            { label: 'Earned Basic', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.basic_earned : 0 },
            { label: 'HRA', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.hra : 0 },
            { label: 'DA', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.da : 0 },
            { label: 'Bonus', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.bonus : 0 },
            { label: 'Overtime', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.overtime : 0 },
            { label: 'Incentive', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.incentive : 0 },
            { label: 'Present Days', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.present_days : 0 },
            { label: 'Absent Days', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.absent_days : 0 },
            { label: 'Holiday Days', val: currentPayroll?.status?.toLowerCase() === 'paid' ? (currentPayroll.paid_holiday_days || currentPayroll.holiday_days) : 0 },
            { label: 'Week Off Days', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.week_off_days : 0 },
            { label: 'Half Days', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.half_days : 0 },
            { label: 'Paid Leaves', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.paid_leave_days : 0 },
            { label: 'Reimbursement', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.reimbursement_amount : 0 },
            { label: 'Gross Amount', val: currentPayroll?.status?.toLowerCase() === 'paid' ? currentPayroll.gross_amount : 0 }
          ].map(item => (
            <div key={item.label} className="detail-item">
              <div className="detail-value">{typeof item.val === 'number' && (item.label.includes('Salary') || item.label.includes('Amount') || ['HRA', 'DA', 'Bonus', 'Overtime', 'Incentive', 'Reimbursement'].includes(item.label)) ? `₹${item.val.toLocaleString()}` : item.val || '0'}</div>
              <div className="detail-label">{item.label}</div>
            </div>
          ))}
        </div>
        {!currentPayroll || currentPayroll.status?.toLowerCase() !== 'paid' ? (
          <div style={{ marginTop: 20, fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>* Payroll for this month has not been paid yet.</div>
        ) : null}
      </div>

      <div className="history-section">
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 20 }}>Payroll History</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading history...</div>
        ) : payrollData.length > 0 ? (
          payrollData.map((p, i) => (
            <div key={`${p.month}-${p.year}`} className="history-item">
              <div className="history-info">
                <div className="history-month">{MONTH_NAMES[p.month - 1]} {p.year}</div>
                <div className="history-amount">Net: ₹{(p.net_payable || p.net_salary)?.toLocaleString()}</div>
              </div>
              <div className="history-actions">
                <span className={`status-badge ${p.status === 'paid' ? 'status-paid' : 'status-pending'}`}>{p.status || 'Paid'}</span>
                <button className="ib" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setCurrentPayroll(p); setShowSlip(true); }}>
                  <Icon n="download" size={16} color="#1e293b"/>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="cd" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No payroll history found</div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeSalary;
